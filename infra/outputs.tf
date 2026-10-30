output "container_app_fqdn" {
  description = "Public FQDN of the deployed backend container app."
  value       = azurerm_container_app.backend.latest_revision_fqdn
}

output "acr_login_server" {
  description = "Azure Container Registry login server for the backend image."
  value       = azurerm_container_registry.backend.login_server
}

output "sql_server_fqdn" {
  description = "Fully qualified domain name of the Azure SQL server."
  value       = azurerm_mssql_server.backend.fully_qualified_domain_name
}
