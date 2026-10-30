variable "resource_group_name" {
  description = "Azure resource group that holds the backend resources."
  type        = string
  default     = "ziggiz-prod-rg"
}

variable "location" {
  description = "Azure region for all resources."
  type        = string
  default     = "West Europe"
}

variable "acr_name" {
  description = "Azure Container Registry name (must be globally unique)."
  type        = string
  default     = "ziggizregistry"
}

variable "container_app_name" {
  description = "Azure Container App name."
  type        = string
  default     = "ziggiz-backend"
}

variable "container_app_env_name" {
  description = "Azure Container Apps environment name."
  type        = string
  default     = "ziggiz-env"
}

variable "sql_server_name" {
  description = "Azure SQL Server name."
  type        = string
  default     = "ziggiz-sql-server"
}

variable "database_name" {
  description = "Azure SQL Database name."
  type        = string
  default     = "ziggizdb"
}

variable "sql_admin_login" {
  description = "Administrator login for the Azure SQL server."
  type        = string
  default     = "ziggizadmin"
}

variable "sql_admin_password" {
  description = "Administrator password for the Azure SQL server (use Key Vault / a secure value)."
  type        = string
  sensitive   = true
}

variable "youcanpay_private_key" {
  type      = string
  sensitive = true
  default   = "REPLACE_WITH_YOUCANPAY_PRIVATE_KEY"
}

variable "youcanpay_public_key" {
  type      = string
  sensitive = true
  default   = "REPLACE_WITH_YOUCANPAY_PUBLIC_KEY"
}

variable "youcanpay_success_url" {
  type      = string
  sensitive = true
  default   = "https://YOUR_FRONTEND_URL/reservation?payment=success"
}

variable "youcanpay_error_url" {
  type      = string
  sensitive = true
  default   = "https://YOUR_FRONTEND_URL/reservation?payment=error"
}

variable "youcanpay_sandbox" {
  type      = string
  sensitive = true
  default   = "false"
}

variable "tags" {
  description = "Tags applied to resources."
  type        = map(string)
  default = {
    project = "ziggiz"
  }
}
