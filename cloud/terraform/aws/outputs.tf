# AWS Terraform Outputs
# Values to be displayed after terraform apply

output "backend_instance_id" {
  description = "EC2 instance ID for backend server"
  value       = aws_instance.backend.id
}

output "backend_public_ip" {
  description = "Public IP address of backend server"
  value       = aws_eip.backend_eip.public_ip
}

output "backend_private_ip" {
  description = "Private IP address of backend server"
  value       = aws_instance.backend.private_ip
}

output "backend_public_dns" {
  description = "Public DNS name of backend server"
  value       = aws_instance.backend.public_dns
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for assets"
  value       = aws_s3_bucket.assets.id
}

output "s3_bucket_url" {
  description = "URL of the S3 bucket"
  value       = "https://${aws_s3_bucket.assets.bucket}.s3.${var.aws_region}.amazonaws.com"
}

output "ssh_command" {
  description = "SSH command to connect to backend server"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_eip.backend_eip.public_ip}"
}

output "security_group_id" {
  description = "ID of the backend security group"
  value       = aws_security_group.backend_sg.id
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.backend_logs.name
}

output "summary" {
  description = "Deployment summary"
  value = {
    region            = var.aws_region
    environment       = var.environment
    backend_ip        = aws_eip.backend_eip.public_ip
    s3_bucket         = aws_s3_bucket.assets.id
    ssh_command       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_eip.backend_eip.public_ip}"
    backend_url       = "http://${aws_eip.backend_eip.public_ip}:5000"
  }
}

