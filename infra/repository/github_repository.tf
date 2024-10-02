resource "github_repository" "this" {
  name        = "io-functions-pushnotifications"
  description = "A set of Azure functions that handle the IO App notifications push mechanism using the Azure Notification Hub"

  #tfsec:ignore:github-repositories-private
  visibility = "public"

  allow_auto_merge            = false
  allow_rebase_merge          = true
  allow_merge_commit          = true
  allow_squash_merge          = true
  squash_merge_commit_title   = "COMMIT_OR_PR_TITLE"
  squash_merge_commit_message = "COMMIT_MESSAGES"

  delete_branch_on_merge = false

  has_projects    = true
  has_wiki        = true
  has_discussions = false
  has_issues      = true
  has_downloads   = true

  topics = []

  vulnerability_alerts = true

  template {
    include_all_branches = false
    owner                = "pagopa"
    repository           = "io-functions-template"
  }

  security_and_analysis {
    secret_scanning {
      status = "enabled"
    }

    secret_scanning_push_protection {
      status = "enabled"
    }
  }
}
