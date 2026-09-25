# Google Cloud Build

Use for `cloudbuild.yaml`/`cloudbuild.json`, build triggers, repository connections,
service accounts, worker pools, and related IaC. Official sources below were
consulted on 2026-09-25; verify the project's organization policies, integration
type, region, and installed tooling.

## Source and triggers

Trace repository connection, event, revision, config path, substitutions, and
included/ignored files. Branch and tag filters use regular expressions; do not
copy glob syntax from another provider. Check overlapping push, PR, manual, and
upstream triggers for duplicate publication or deployment. Verify repository,
trigger, and private-pool location compatibility for the selected integration.
Treat repository authorization and trigger configuration as external prerequisites
unless managed and verified through the project's IaC. See [build triggers](https://docs.cloud.google.com/build/docs/automating-builds/create-manage-triggers).

Untrusted PR code can execute with the trigger's build identity. Use a minimally
privileged validation trigger, isolated from release credentials and destinations.
Review GitHub PR comment controls where applicable; permission to start a build
does not make the submitted code safe. Users who can change source or build
configuration can influence commands run with that identity. See [trigger access
and build-time privileges](https://docs.cloud.google.com/build/docs/cloud-build-service-account).

## Build graph and inputs

Derive commands and outputs from the repository. Use explicit step IDs and inspect
`waitFor`: omitted dependencies wait for preceding steps, while `['-']` starts a
step without waiting for them. Parallel steps must not race on shared files or
publish before required checks finish. Persist handoffs through `/workspace` or
declared volumes rather than assuming each container's filesystem survives. See
[step ordering](https://docs.cloud.google.com/build/docs/configuring-builds/configure-build-step-order)
and the [configuration schema](https://docs.cloud.google.com/build/docs/build-config-file-schema).

Review working directories, builder image versions/digests, `entrypoint`, `args`
versus `script`, timeouts, and queue expiry. Ensure `allowFailure` or
`allowExitCodes` cannot turn a required check into an optional one. Select compute
and caching from measured needs. See the [configuration schema](https://docs.cloud.google.com/build/docs/build-config-file-schema).

Distinguish Cloud Build substitutions from shell environment expansion. Custom
substitutions use `_NAME`; use explicit environment mapping and quote values
instead of inserting event text into shell source. Trigger builds enable
`ALLOW_LOOSE`, and some built-ins can be empty for other invocation types. Validate
required project, destination, and revision values before publishing; never rely
on missing-substitution errors as a deployment guard. Handle `$$` escaping where
shell expansion is intended. See [substitution behavior](https://docs.cloud.google.com/build/docs/configuring-builds/substitute-variable-values).

## Identity, secrets, and networking

Choose an explicit build service account with resource-scoped access. Distinguish
it from the Cloud Build service agent and the deployed application's runtime
identity. Defaults vary by project history and policy; do not assume the legacy
account or broad default grants. See [default account changes](https://docs.cloud.google.com/build/docs/cloud-build-service-account-updates).

For triggered builds, the trigger's service account overrides the build config's
`serviceAccount`. Verify both manual and triggered execution paths. Configure
supported log storage and write permissions for a user-specified account, such as
Cloud Logging with `CLOUD_LOGGING_ONLY` and Logs Writer, or an appropriately
configured user-owned Cloud Storage bucket. Trace the caller's
`iam.serviceAccounts.actAs` permission separately from build-time access. For
cross-project identities, verify service-agent permissions and organization policy.
See [user-specified service accounts](https://docs.cloud.google.com/build/docs/securing-builds/configure-user-specified-service-accounts).

Use Secret Manager through `availableSecrets` and per-step `secretEnv`; scope
Secret Accessor to needed secrets and keep values out of substitutions, logs,
images, and artifacts. Granting a build identity secret access also empowers code
executed as that identity. See [Secret Manager integration](https://docs.cloud.google.com/build/docs/securing-builds/use-secrets).

For private dependencies or targets, verify pool permissions, region, network
connectivity, DNS, and egress. A private pool alone does not prove isolation or
reachability. See [private pools](https://docs.cloud.google.com/build/docs/private-pools/private-pools-overview).

## Artifacts, approval, and deployment

Publish images to the intended Artifact Registry repository and retain the digest
with the source revision/build ID. The top-level `images` field publishes after
build steps finish; a deployment step in that same build needs an earlier explicit
push. Declare `images` as well when build results must record the pushed image.
Gate any explicit push on required checks. See [building and publishing images](https://docs.cloud.google.com/build/docs/building/build-containers).

Cloud Build trigger approval gates the entire build before execution. If approval
must follow testing, separate validation/artifact production from the approved
deployment build, passing the verified digest, or use the project's delivery
system. Check who can approve and who can edit triggers to remove approval. See
[build approvals](https://docs.cloud.google.com/build/docs/securing-builds/gate-builds-on-approval).

Keep deployment service-specific: use the project's Cloud Run, GKE, or other
target's permissions, health checks, and recovery procedure. Cloud Deploy is a
separate delivery service; introduce it only when requested or needed by the
chosen design. Serialize changes to shared destinations across builds; `waitFor`
orders steps only within one build. Do not equate rerunning a build with rollback
or reversal of migrations. Recover using a known artifact and target state.

## Setup and validation

Implement the build configuration plus required trigger/IaC changes, service
account and IAM bindings, log destination, and artifact repository references.
List unverified API enablement, repository authorization, policy, quota, and
target prerequisites. Preserve the repository's IaC conventions.

Validate YAML/JSON against Cloud Build's schema and inspect scripts, dependencies,
substitutions, and expected outputs. Compare manual and triggered inputs and
identities. Use the shared [validation scenarios](implementation-and-validation.md).
`gcloud builds submit` uploads/submits work and can execute deployments;
`--async` changes waiting behavior, and `--suppress-logs` changes display. Neither
is a validation-only mode. Run provider checks only within the authorized project,
region, and target. See the [submit command reference](https://docs.cloud.google.com/sdk/gcloud/reference/builds/submit).
