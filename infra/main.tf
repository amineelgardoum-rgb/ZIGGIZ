resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

resource "azurerm_container_registry" "backend" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_mssql_server" "backend" {
  name                         = var.sql_server_name
  resource_group_name         = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_login
  administrator_login_password = var.sql_admin_password
  minimum_tls_version          = "1.2"
  public_network_access_enabled = true
}

resource "azurerm_mssql_database" "backend" {
  name       = var.database_name
  server_id = azurerm_mssql_server.backend.id
}

resource "azurerm_container_app_environment" "backend" {
  name                = var.container_app_env_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
}

resource "azurerm_container_app" "backend" {
  name                        = var.container_app_name
  resource_group_name        = azurerm_resource_group.main.name
  container_app_environment_id = azurerm_container_app_environment.backend.id
  revision_mode               = "Single"

  ingress {
    target_port      = 8080
    external_enabled = true

    traffic_weight {
      weight = 100
      port   = 8080
    }
  }

  template {
    container {
      name  = "ziggiz-backend"
      image = "${azurerm_container_registry.backend.login_server}/ziggiz-backend:latest"

      cpu    = 1.0
      memory = 2.0

      env {
        name  = "SPRING_DATASOURCE_URL"
        value = "jdbc:sqlserver://${azurerm_mssql_server.backend.name}.database.windows.net:1433;database=${var.database_name}"
      }

      env {
        name  = "SPRING_DATASOURCE_USERNAME"
        value = var.sql_admin_login
      }

      env {
        name  = "SPRING_DATASOURCE_PASSWORD"
        value = var.sql_admin_password
      }

      env {
        name  = "SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT"
        value = "org.hibernate.dialect.SQLServerDialect"
      }

      env {
        name  = "SPRING_H2_CONSOLE_ENABLED"
        value = "false"
      }

      env {
        name  = "YOUCANPAY_PRIVATE_KEY"
        value = var.youcanpay_private_key
      }

      env {
        name  = "YOUCANPAY_PUBLIC_KEY"
        value = var.youcanpay_public_key
      }

      env {
        name  = "YOUCANPAY_SUCCESS_URL"
        value = var.youcanpay_success_url
      }

      env {
        name  = "YOUCANPAY_ERROR_URL"
        value = var.youcanpay_error_url
      }

      env {
        name  = "YOUCANPAY_SANDBOX"
        value = var.youcanpay_sandbox
      }
    }
  }
}
