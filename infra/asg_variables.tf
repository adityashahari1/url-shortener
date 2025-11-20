# Variables for Auto Scaling / ALB 
variable "asg_instance_type" {
  type    = string
  default = "t3.micro"   
}

variable "asg_min" {
  type    = number
  default = 1
}

variable "asg_desired" {
  type    = number
  default = 1
}

variable "asg_max" {
  type    = number
  default = 3
}
