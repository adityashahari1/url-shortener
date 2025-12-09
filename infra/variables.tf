variable "region" {
  type    = string
  default = "us-west-2"
}

variable "key_name" {
  type        = string
  description = "EC2 key pair for SSH"
}

variable "my_ip_cidr" {
  type        = string
  description = "Your IP /32 for SSH, e.g. 1.2.3.4/32"
}

variable "github_repo" {
  type        = string
  description = "HTTPS URL to your repo"
}

variable "github_branch" {
  type    = string
  default = "master"
}

variable "mongodb_uri" {
  type      = string
  sensitive = true
}

variable "session_secret" {
  type      = string
  sensitive = true
}

variable "app_port" {
  type    = number
  default = 8000
}


variable "project_name" {
  type    = string
  default = "url-shortener"
}

variable "owner" {
  type    = string
  default = "AdityaShahari"
}

variable "environment" {
  type    = string
  default = "dev"
}
