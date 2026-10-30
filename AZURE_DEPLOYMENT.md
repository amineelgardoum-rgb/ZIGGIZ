# Azure Deployment Guide for Ziggiz Surf Co.

This guide outlines the "full working deployment" option for Azure, focusing on scalability, security, and cost-effectiveness.

## 1. Architecture Overview

- **Frontend:** [Azure Static Web Apps](https://azure.microsoft.com/en-us/services/static-web-apps/)
- **Backend:** [Azure Container Apps](https://azure.microsoft.com/en-us/services/container-apps/) (Spring Boot)
- **Database:** [Azure SQL Database](https://azure.microsoft.com/en-us/services/azure-sql-database/) (Serverless tier)
- **Container Registry:** [Azure Container Registry](https://azure.microsoft.com/en-us/services/container-registry/) (ACR)

## 2. Prerequisites

- Azure CLI installed and logged in (`az login`)
- Docker installed locally (optional, for manual builds)
- A YouCan Pay account for production keys

## 3. Deployment Steps

### Step A: Infrastructure Setup

```bash
# Set variables
RESOURCE_GROUP="ziggiz-prod-rg"
LOCATION="westeurope"
ACR_NAME="ziggizregistry"
DATABASE_NAME="ziggizdb"
SERVER_NAME="ziggiz-sql-server"

# Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Container Registry
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic

# Create SQL Server and Database
az sql server create --name $SERVER_NAME --resource-group $RESOURCE_GROUP --location $LOCATION --admin-user "ziggizadmin" --admin-password "REPLACE_WITH_STRONG_PASSWORD"
az sql db create --resource-group $RESOURCE_GROUP --server $SERVER_NAME --name $DATABASE_NAME --edition GeneralPurpose --family Gen5 --capacity 2 --compute-model Serverless
```

### Step B: Build and Push Backend Image

```bash
# Login to ACR
az acr login --name $ACR_NAME

# Build and push
cd backend
az acr build --registry $ACR_NAME --image ziggiz-backend:latest .
```

### Step C: Deploy Backend to Container Apps

```bash
# Create Container Apps Environment
az containerapp env create --name ziggiz-env --resource-group $RESOURCE_GROUP --location $LOCATION

# Deploy Backend
# Note: You'll need the JDBC connection string from Azure Portal
az containerapp create \
  --name ziggiz-backend \
  --resource-group $RESOURCE_GROUP \
  --environment ziggiz-env \
  --image "$ACR_NAME.azurecr.io/ziggiz-backend:latest" \
  --target-port 8080 \
  --ingress external \
  --env-vars \
    SPRING_DATASOURCE_URL="jdbc:sqlserver://$SERVER_NAME.database.windows.net:1433;database=$DATABASE_NAME" \
    SPRING_DATASOURCE_USERNAME="ziggizadmin" \
    SPRING_DATASOURCE_PASSWORD="YOUR_PASSWORD" \
    YOUCANPAY_PRIVATE_KEY="YOUR_YCP_PRIVATE_KEY" \
    YOUCANPAY_PUBLIC_KEY="YOUR_YCP_PUBLIC_KEY" \
    YOUCANPAY_SUCCESS_URL="https://YOUR_FRONTEND_URL/reservation?payment=success" \
    YOUCANPAY_ERROR_URL="https://YOUR_FRONTEND_URL/reservation?payment=error"
```

### Step D: Deploy Frontend to Static Web Apps

1. Push your code to a GitHub repository.
2. Go to [Azure Portal](https://portal.azure.com) > Create a resource > **Static Web App**.
3. Select your GitHub repo and branch.
4. Build details:
   - Build Preset: `Vite`
   - App location: `/frontend`
   - Output location: `dist`
5. Once deployed, get the URL and update `API_BASE` in `frontend/src/lib/api.js` or use an environment variable.

## 4. Performance Optimizations & Bottlenecks

1.  **N+1 Queries:** Already addressed in the Java code using `@EntityGraph` in `BookingRepository` and `PaymentRepository`.
2.  **Cold Starts:** Azure Container Apps (Serverless) may have cold starts. Set `min-replicas` to 1 if near-instant response is required.
3.  **Database Connection:** Ensure `spring.datasource.hikari.maximum-pool-size` is tuned (default 10 is usually enough for ACA).
4.  **Static Assets:** For production, consider moving the `public/images` folder to **Azure Blob Storage** and using **Azure CDN** to reduce bandwidth costs and improve load times globally.
5.  **Security:** Move secrets from environment variables to **Azure Key Vault** and use Managed Identity to access them from Container Apps.

---

## 5. CI/CD Pipeline (GitHub Actions)

Two workflows live in `.github/workflows/`:

| Workflow                  | File                                      | Purpose                                                                 |
| ------------------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| Backend CI/CD             | `.github/workflows/backend-ci-cd.yml`     | Build + test (JDK 21 / Maven) on PRs and pushes touching `backend/**`; on push to `main` deploys the image to Azure Container Apps. |
| Terraform                 | `.github/workflows/terraform.yml`       | `terraform fmt`/`validate`/`plan`; `apply` on push to `main`.           |

Backend CI/CD jobs: `build-and-test` (checkout → setup-java 21 temurin with Maven cache → `./mvnw -B -ntp verify` → upload artifact) then `deploy` (needs build, only on `main` pushes) using `azure/login@v2` + `azure/docker-login@v1`, `az acr build` for `ziggiz-backend:latest`, then `az containerapp update` with the Azure SQL Server + YouCan Pay env vars.

Backend CI/CD requires GitHub repository secrets: `AZURE_SERVICE_CONNECTION`, `ACR_NAME`, `RESOURCE_GROUP`, `CONTAINER_APP_NAME`, `AZURE_SQL_SERVER_URL`, `AZURE_SQL_USERNAME`, `AZURE_SQL_PASSWORD`, `YOUCANPAY_PRIVATE_KEY`, `YOUCANPAY_PUBLIC_KEY`, `YOUCANPAY_SUCCESS_URL`, `YOUCANPAY_ERROR_URL`.

## 6. Infrastructure as Code (Terraform)

Backend infrastructure lives in `infra/` (Terraform >= 1.5.7, `azurerm` provider ~> 4.0, validated with `terraform validate`):

- `infra/main.tf` — resource group `ziggiz-prod-rg`, ACR `ziggizregistry` (Basic), SQL server + database (`ziggiz-sql-server` / `ziggizdb`, GeneralPurpose/Gen5, Serverless), Container Apps environment + app (revision `Single`, external ingress on port 8080, container CPU 1.0 / memory 2.0 GB, Azure SQL datasource + YouCan Pay env vars).
- `infra/variables.tf` — input variables (resource group, location, ACR/app/SQL names, SQL admin password, YouCan Pay secrets).
- `infra/outputs.tf` — container app FQDN, ACR login server, SQL server FQDN.
- `infra/terraform.tfvars.example` — example tfvars.

Typical commands (from `infra/`):

```bash
terraform init -backend=false
terraform validate
terraform plan -var-file=terraform.tfvars.example
terraform apply -var-file=terraform.tfvars.example
```

## 7. Deploying the backend to Azure (end-to-end)

1. Provision infra: `terraform apply` (or the Terraform workflow).
2. Build & push image: `az acr build --registry <acr> --image ziggiz-backend:latest backend/`.
3. Deploy: `az containerapp update --name ziggiz-backend --resource-group ziggiz-prod-rg --image <acr>.azurecr.io/ziggiz-backend:latest --env-vars SPRING_DATASOURCE_URL="jdbc:sqlserver://<server>.database.windows.net:1433;database=ziggizdb" ...`.
4. Backend runtime notes: `SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT=org.hibernate.dialect.SQLServerDialect`, `SPRING_H2_CONSOLE_ENABLED=false`, YouCan Pay keys via env, success/error URLs pointing at the frontend.

## 8. Bottlenecks / performance — current status

1. **N+1 queries:** addressed via `@EntityGraph` on booking/payment reads + `default_batch_fetch_size=25`.
2. **SQL verbosity:** `spring.jpa.show-sql` was `true` in the base config and has been set to `false` for production hygiene.
3. **Database:** local dev uses in-memory H2; production target is Azure SQL (`jdbc:sqlserver://…`), GeneralPurpose serverless.
4. **Cold starts:** Container Apps (Consumption) may cold start — set min replicas / use a provisioned environment for near-instant responses.
5. **Security:** move secrets to Azure Key Vault + managed identity for production hardening.

---

