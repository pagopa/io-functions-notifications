locals {
  prefix    = "io"
  env_short = "p"
  env       = "prod"
  location  = "italynorth"
  project   = "${local.prefix}-${local.env_short}"
  domain    = "functions-pushnotifications"

  repo_name = "io-functions-pushnotifications"

  tags = {
    CostCenter     = "TS310 - PAGAMENTI & SERVIZI"
    CreatedBy      = "Terraform"
    Environment    = "Prod"
    Owner          = "IO"
    ManagementTeam = "IO Comunicazione"
    Source         = "https://github.com/pagopa/io-functions-pushnotifications/blob/master/infra/identity/prod"
  }
}
