terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Global tagging policy
locals {
  common_tags = {
    Project     = var.project_name
    Owner       = var.owner
    Environment = var.environment
  }
}

provider "aws" {
  region = var.region

  # Enforce tags on all resources
  default_tags {
    tags = local.common_tags
  }
}
