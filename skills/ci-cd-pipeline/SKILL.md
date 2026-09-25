---
name: ci-cd-pipeline
description: Review, create, improve, and troubleshoot CI/CD pipelines for GitHub Actions, GitLab CI/CD, AWS CodePipeline, and Google Cloud Build (GCP), including related CodeBuild and infrastructure-as-code configuration. Use for pipeline triggers, build and test orchestration, deployment workflows, permissions, artifact promotion, and recovery.
---

# CI/CD Pipeline

Deliver pipelines that build the intended revision, enforce the required checks,
and deploy a traceable artifact to the intended environment. Support GitHub Actions,
GitLab CI/CD, AWS CodePipeline, and Google Cloud Build; preserve the user's provider
and IaC choices.

## Establish the task

- **Review:** inspect and report; do not edit unless requested.
- **Setup or improve:** implement repository changes and validate them.
- **Troubleshoot:** trace a specific trigger or execution failure, fix its cause
  when requested, and distinguish a verified fix from a proposed one.

Infer the mode and provider from the request and repository. Ask only for missing
decisions that affect the implementation, such as deployment target or account.
Continue independent work while those decisions are pending. For a CI-only
request, do not introduce a deployment system.

Read repository instructions, pipeline files, invoked scripts, manifests,
lockfiles, and relevant IaC. Identify real install, lint, test, build, package,
and deploy commands; do not invent successful checks where none exist. Record:

- Source repository, branch/tag policy, events, changed-path filters, and monorepo scope.
- Runner/build image, toolchain, dependency installation, and required services.
- Job/stage dependencies, required checks, artifact producer and consumers.
- Environments, deployment targets, credentials, approvals, and recovery mechanism.

Treat checked-in configuration as intent. Repository rules, environment protection,
connection authorization, deployed IAM, and execution results need separate
evidence. Use supplied logs or authorized read-only tools when useful; redact
secrets and label anything not verified.

## Load relevant guidance

| Situation | Reference |
|-----------|-----------|
| GitHub Actions workflows, reusable workflows, or AWS federation | [GitHub Actions](references/github-actions.md) |
| GitLab pipeline rules, runners, downstream pipelines, or deployment jobs | [GitLab CI/CD](references/gitlab-ci-cd.md) |
| CodePipeline sources, stages, CodeBuild, or deployment roles | [AWS CodePipeline](references/aws-codepipeline.md) |
| Cloud Build configuration, triggers, service accounts, or worker pools | [Google Cloud Build](references/gcp-cloud-build.md) |
| Review findings or failure diagnosis | [Review and troubleshooting](references/review-and-troubleshooting.md) |
| Implementing changes, checking behavior, or handing off setup | [Implementation and validation](references/implementation-and-validation.md) |

For a combined system, trace the handoff between providers, including revision,
artifact identity, credentials, and which system owns the deployment trigger.
Do not assume multiple providers should independently deploy the same change.

## Working constraints

- Use the least privilege needed for each trust boundary. Keep untrusted changes
  away from deployment credentials and privileged persistent runners.
- Carry source revision and immutable artifact identity through promotion. Cache
  contents are an optimization, not proof that an artifact passed required checks.
- Select concurrency, retries, approval placement, and recovery from deployment
  semantics. Canceling a workflow does not necessarily stop its external operations.
- A request to set up a pipeline authorizes preparing configuration, not every
  possible remote action. Honor existing authorization; before any unapproved
  provisioning, publishing, dispatch, or deployment, finish the reviewable patch
  and identify the exact action that still needs permission.
- Do not repeatedly dispatch, retry, approve, or roll back a deployment to see
  whether it succeeds. After a failed attempt, inspect the result and partial
  effects before another attempt within the authorized scope.
- Verify current official documentation for changing features, action versions,
  runner compatibility, account/region availability, and pricing. References are
  starting points, not a frozen feature catalog. If unavailable, identify the
  unresolved dependency without guessing versions, SHAs, or service support.

## Deliver

For a review, give prioritized, evidenced findings and material unknowns. For
implementation, deliver the files, checks performed, outstanding external setup,
and first-run/recovery instructions. Clearly separate static validation from a
successful provider execution; never describe an undeployed pipeline as operational.
