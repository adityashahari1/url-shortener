
resource "aws_security_group" "alb_sg" {
  name        = "urlshort-alb-sg"
  description = "ALB: allow HTTP from world"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "app_asg_sg" {
  name        = "urlshort-app-asg-sg"
  description = "App: allow HTTP from ALB; SSH from my IP"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "app_alb" {
  name               = "urlshort-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = slice(data.aws_subnets.default.ids, 0, 2)
}

resource "aws_lb_target_group" "app_tg" {
  name        = "urlshort-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "instance"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 15
    matcher             = "200"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app_alb.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}

resource "aws_launch_template" "app_lt" {
  name_prefix   = "urlshort-lt-"
  image_id      = data.aws_ami.ubuntu_2204.id
  instance_type = var.asg_instance_type
  key_name      = var.key_name
  vpc_security_group_ids = [aws_security_group.app_asg_sg.id]

  user_data = base64encode(<<-EOF
    #!/bin/bash
    set -eux
    apt-get update -y
    apt-get install -y git curl nginx
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    cd /home/ubuntu
    sudo -u ubuntu git clone --branch ${var.github_branch} ${var.github_repo} app || true
    cd /home/ubuntu/app && sudo -u ubuntu git pull || true
    cat >/home/ubuntu/app/.env <<ENVVARS
    MONGODB_URI=${var.mongodb_uri}
    SESSION_SECRET=${var.session_secret}
    PORT=${var.app_port}
    PUBLIC_BASE_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)
    ENVVARS
    chown ubuntu:ubuntu /home/ubuntu/app/.env
    sudo -u ubuntu npm ci || sudo -u ubuntu npm install
    npm install -g pm2
    sudo -u ubuntu pm2 start index.js --name urlshort
    sudo -u ubuntu pm2 save
    pm2 startup systemd -u ubuntu --hp /home/ubuntu || true
    systemctl enable pm2-ubuntu || true
    systemctl restart pm2-ubuntu || true
    cat >/etc/nginx/sites-available/urlshort <<NGX
    server {
      listen 80 default_server;
      server_name _;
      location / {
        proxy_pass http://127.0.0.1:${var.app_port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
      }
    }
    NGX
    rm -f /etc/nginx/sites-enabled/default || true
    ln -s /etc/nginx/sites-available/urlshort /etc/nginx/sites-enabled/urlshort || true
    nginx -t
    systemctl enable nginx
    systemctl restart nginx
  EOF
  )
}

resource "aws_autoscaling_group" "app_asg" {
  name                      = "urlshort-asg"
  desired_capacity          = var.asg_desired
  min_size                  = var.asg_min
  max_size                  = var.asg_max
  vpc_zone_identifier       = slice(data.aws_subnets.default.ids, 0, 2)
  health_check_type         = "ELB"
  health_check_grace_period = 90
  target_group_arns         = [aws_lb_target_group.app_tg.arn]

  launch_template {
    id      = aws_launch_template.app_lt.id
    version = "$Latest"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_policy" "cpu_scale" {
  name                   = "urlshort-asg-cpu"
  policy_type            = "TargetTrackingScaling"
  autoscaling_group_name = aws_autoscaling_group.app_asg.name
  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 55
  }
}
