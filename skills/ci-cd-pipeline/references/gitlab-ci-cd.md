# GitLab CI/CD

Use for `.gitlab-ci.yml`, included configuration/components, runner selection,
parent-child and multi-project pipelines, and deployment jobs. Official sources
below were consulted on 2026-09-25; verify the GitLab offering, server/Runner
versions, and subscription tier before relying on a feature.

## Pipeline creation and job selection

Trace `workflow:rules` before job-level `rules`: a job cannot run if its pipeline
is excluded. Identify push, merge request, tag, schedule, manual, and upstream
pipeline sources explicitly. Prevent duplicate branch and merge request pipelines
without accidentally excluding legitimate triggered pipelines. Rules are evaluated
in order; a broad final rule can enable unintended sources. Check `rules:changes`
comparison behavior for new branches and events without a push; use `compare_to`
where an explicit baseline is needed. See [workflow rules](https://docs.gitlab.com/ci/yaml/workflow/)
and [job rules](https://docs.gitlab.com/ci/jobs/job_rules/).

Distinguish ordinary merge request pipelines from tests of the combined source
and target branches. When configured, validate [merged results pipelines](https://docs.gitlab.com/ci/pipelines/merged_results_pipelines/)
and [merge trains](https://docs.gitlab.com/ci/pipelines/merge_trains/) against the
proposed merge revision. Confirm project merge requirements separately from YAML;
a passing branch pipeline does not establish that the merge result was tested.

Fork pipelines normally use fork resources, but a parent-project member can run
a fork merge request pipeline using parent resources with configuration from the
fork. Review this trust boundary before running it. Protected variables/runners
have additional branch, permission, and same-project requirements; do not infer
access solely from the target branch being protected. See [merge request
pipelines](https://docs.gitlab.com/ci/pipelines/merge_request_pipelines/).

## Effective configuration and job graph

Inspect the merged configuration after `include`, `extends`, defaults, and rules.
Pin external project includes to reviewed immutable revisions and verify component
inputs. Do not assume inherited arrays are concatenated. Trace stages and `needs`:
jobs can bypass stage ordering, and conditional producers can make a required
dependency absent. Use `needs:optional` only when omission is valid. Do not combine
`needs` and `dependencies` in one job. Check `allow_failure`, shell exit handling,
timeouts, and `interruptible` before declaring a job a release gate. See the
[YAML reference](https://docs.gitlab.com/ci/yaml/).

For child or multi-project pipelines, trace the downstream revision, inputs,
forwarded variables, permissions, and result propagation. Use
`trigger:strategy: mirror` on supported versions when upstream success must reflect
the downstream result; creating a downstream pipeline alone does not prove it
succeeded. Verify compatibility before changing older configurations. See
[downstream pipelines](https://docs.gitlab.com/ci/pipelines/downstream_pipelines/).

## Runners and credentials

Check runner tags, executor, protection, image/services, network access, and
availability. Diagnose pending jobs against runner eligibility before changing
scripts. Isolate untrusted work from deployment runners, shared persistent
workspaces, Docker sockets, and privileged containers. Tags select runners; they
do not by themselves establish a security boundary. See [runner security](https://docs.gitlab.com/runner/security/).

Keep secrets in appropriate CI/CD variables or external secret stores. Verify
protected and environment-scoped availability and variable precedence. Masking
reduces accidental log exposure; it cannot prevent malicious scripts from stealing
values. Avoid secrets in dotenv reports, artifacts, caches, and debug traces. See
[CI/CD variables](https://docs.gitlab.com/ci/variables/).

Prefer job-scoped `id_tokens` for cloud federation where supported. Match issuer,
audience, subject, and supported project/ref claims to the intended deployment
context in the cloud trust policy; token issuance does not itself grant cloud
permissions. See [OIDC ID tokens](https://docs.gitlab.com/ci/secrets/id_token_authentication/).

Use `CI_JOB_TOKEN` for supported GitLab operations instead of broad personal tokens.
For cross-project access, verify the destination's job-token allowlist and the
triggering user's permissions; an allowlist entry alone does not grant access.
Do not disable access restrictions to fix an artifact download. See [job token
permissions](https://docs.gitlab.com/ci/jobs/ci_job_token/).

## Artifacts and release gates

Keep dependency caches separate from tested release artifacts. Trace
`artifacts:paths`, reports, retention, access, and `needs:artifacts` to the actual
consumer. Record producing pipeline/job, commit, and digest. Artifacts must survive
the approval window; deploy the verified image digest or package, not a mutable
latest tag. See [job artifacts](https://docs.gitlab.com/ci/jobs/job_artifacts/).

`needs:project` fetches the latest successful named job for the specified ref and
does not wait for a currently running pipeline. Do not treat it as proof of the
current release's provenance. Bind promotion to the intended execution and
artifact identity. See the [YAML reference](https://docs.gitlab.com/ci/yaml/).

Set `allow_failure: false` explicitly for a required manual gate: `when: manual`
is optional by default outside `rules`, but blocking by default inside `rules`.
A manual job is not automatically restricted to release approvers. See [manual
job controls](https://docs.gitlab.com/ci/jobs/job_control/).

Verify protected environment permissions and deployment approval rules separately
from the job's `environment` declaration. Check tier availability and distinguish
approval from starting the deployment job; approval does not automatically start
it. See [deployment approvals](https://docs.gitlab.com/ci/environments/deployment_approvals/).

Use `resource_group` keyed to the shared destination to serialize deployments
within the project. Its default process mode is unordered; choose and verify the
mode when release order matters. Cross-project deployments need a shared
coordinator or another lock. Check parent-child lock ownership for deadlocks, and
avoid canceling non-idempotent deployments. See [resource groups](https://docs.gitlab.com/ci/resource_groups/).

Define health verification and target-specific recovery using a known artifact.
Retrying a job or reverting a commit does not automatically undo a partial
deployment, migration, or external operation.

## Setup and validation

Implement real repository install/test/build commands, then publication and
deployment only where requested. Reuse suitable existing components. Document
runner requirements, registry destinations, variable names, cloud trust, merge
requirements, and external protection settings without including secret values.

Use the project's own GitLab instance and authorized access for CI Lint so private
includes and server-version semantics resolve correctly. Inspect merged YAML,
errors/warnings, and included jobs. The [CI Lint API](https://docs.gitlab.com/api/lint/)
supports pipeline-creation simulation with `dry_run`; supply the intended ref
using the selected endpoint's parameters. Simulation does not execute jobs or
prove runner, credentials, artifact, or deployment behavior, and a default-branch
simulation does not validate every merge request or schedule scenario.

Run relevant local checks and trace the shared [validation scenarios](implementation-and-validation.md).
If GitLab lint access is unavailable, report local parsing and include/rule
inspection as limited validation. Pipeline creation, manual play, retry, and
deployment approval can mutate live systems; they are not substitutes for linting.
