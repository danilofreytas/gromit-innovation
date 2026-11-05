terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }

  # State remoto e versionado, no mesmo bucket da plataforma Gromit.
  backend "gcs" {
    bucket = "gromit-prod-tfstate"
    prefix = "site-dns"
  }
}

# Autenticação: variável de ambiente CLOUDFLARE_API_TOKEN (nunca no código).
provider "cloudflare" {}
