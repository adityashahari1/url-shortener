
data "aws_ami" "ubuntu_2204" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

}

# Security Group
resource "aws_security_group" "web_sg" {
  name        = "url-shortener-sg"
  description = "HTTP from world, SSH from my IP"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
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

# Default VPC
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}


# EC2 instance
resource "aws_instance" "app" {
  ami                         = data.aws_ami.ubuntu_2204.id
  instance_type               = "t3.micro"
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.web_sg.id]
  key_name                    = var.key_name
  associate_public_ip_address = true

    user_data = <<-EOF
    #!/bin/bash
    set -eux

    # Update & basic tools
    apt-get update -y
    apt-get install -y git curl nginx

    # Node.js 20 (works fine on Ubuntu)
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs

    # App checkout
    cd /home/ubuntu
    sudo -u ubuntu git clone --branch ${var.github_branch} ${var.github_repo} app
    cd /home/ubuntu/app

    # .env
    cat >/home/ubuntu/app/.env <<ENVVARS
    MONGODB_URI=${var.mongodb_uri}
    SESSION_SECRET=${var.session_secret}
    PORT=${var.app_port}
    ENVVARS
    chown ubuntu:ubuntu /home/ubuntu/app/.env

    # Install & run with PM2
    sudo -u ubuntu npm ci || sudo -u ubuntu npm install
    npm install -g pm2
    sudo -u ubuntu pm2 start index.js --name urlshort
    sudo -u ubuntu pm2 save
    pm2 startup systemd -u ubuntu --hp /home/ubuntu
    systemctl enable pm2-ubuntu
    systemctl restart pm2-ubuntu || true

    # Nginx reverse proxy :80 -> :${var.app_port}
    cat >/etc/nginx/sites-available/urlshort <<NGX
    server {
      listen 80 default_server;
      server_name _;
      location / {
        proxy_pass         http://127.0.0.1:${var.app_port};
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host \$host;
        proxy_cache_bypass \$http_upgrade;
      }
    }
    NGX
    rm -f /etc/nginx/sites-enabled/default
    ln -s /etc/nginx/sites-available/urlshort /etc/nginx/sites-enabled/urlshort
    nginx -t
    systemctl enable nginx
    systemctl restart nginx
  EOF


  tags = { Name = "url-shortener-ec2" }
}

# Elastic IP 
resource "aws_eip" "app_eip" {
  instance = aws_instance.app.id
  domain   = "vpc"
}

# Auto-recovery
# Auto-recover the instance on host failure
resource "aws_cloudwatch_metric_alarm" "recover" {
  alarm_name          = "ec2-auto-recover-urlshort"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "StatusCheckFailed_System"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Minimum"
  threshold           = 0
  alarm_description   = "Recover instance on host failure"
  dimensions          = { InstanceId = aws_instance.app.id }
  alarm_actions       = ["arn:aws:automate:${var.region}:ec2:recover"]
}

# CPU high alarm 
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "ec2-high-cpu-urlshort"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "CPU > 80%"
  dimensions          = { InstanceId = aws_instance.app.id }
}
