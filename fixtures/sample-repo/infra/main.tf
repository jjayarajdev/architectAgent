terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "platform-rg"
  location = "East US"
}

resource "azurerm_postgresql_server" "main" {
  name                = "platform-postgres"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku_name            = "GP_Gen5_2"
  version             = "11"
  storage_mb          = 5120
  ssl_enforcement_enabled = true
}

resource "azurerm_app_service_plan" "main" {
  name                = "platform-asp"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kind                = "Linux"
  reserved            = true

  sku {
    tier = "Standard"
    size = "S1"
  }
}

resource "azurerm_app_service" "api" {
  name                = "platform-api"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  app_service_plan_id = azurerm_app_service_plan.main.id
}

module "monitoring" {
  source = "./modules/monitoring"
  resource_group_name = azurerm_resource_group.main.name
  location = azurerm_resource_group.main.location
}