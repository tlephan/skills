# GitHub Actions

Use for `.github/workflows/`, local/composite actions, reusable workflows, and
repository settings that affect execution. Official sources below were consulted
on 2026-09-25; recheck behavior for the user's GitHub.com or GHES version.

## Events and checks

Map each event to its revision, trust level, and expected checks. Use
`pull_request` for ordinary PR validation. Include `merge_group` when required
checks must run in a merge queue. A `workflow_run` completion can follow an
unsuccessful run: explicitly gate promotion on success and validate the originating
repository, event, revision, and artifact. See [trigger events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

Check branch/tag and path filters together. A workflow skipped by filtering can
leave its required check pending. Keep required check names stable; if introducing
conditional jobs or an aggregate gate, verify that failures and cancellations
cannot become a passing gate. Trace `needs`, job conditions, matrix behavior,
`continue-on-error`, and timeouts. Avoid overlapping `push` and PR triggers unless
the duplicate work is intentional. See [workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).

## Trust and credentials

- Set explicit minimal `GITHUB_TOKEN` permissions and grant writes per job.
- Do not execute untrusted PR code with `pull_request_target`, privileged
  `workflow_run` jobs, secrets, or trusted caches. This includes build scripts and
  downloaded artifacts, not just checkout. Isolate untrusted work from persistent
  self-hosted runners and deployment networks.
- Pass event text into quoted environment variables or structured action inputs;
  do not interpolate it directly into generated shell code.
- Prefer reviewed actions and reusable workflows pinned to verified full commit
  SHAs, with readable version comments and an update mechanism. A pin does not
  establish that the action is trustworthy. Do not fabricate SHAs.
- Disable checkout credential persistence when subsequent commands do not need it.
  Keep secrets out of logs, caches, and uploaded artifacts.

See GitHub's [secure use guidance](https://docs.github.com/en/actions/reference/security/secure-use).

For AWS, prefer OIDC with `id-token: write` only on the job that needs federation.
This permission enables token issuance; AWS role policy determines AWS access.
Constrain the role trust's audience and subject to the intended repository and
deployment context. Match the repository's actual subject format, including any
immutable IDs or custom claims. Environment-based subjects differ from branch
subjects; enforce allowed deployment branches/tags through environment protection
when using an environment subject. Verify the cloud partition's audience and
separate trust policy from role permissions. See [OIDC with AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws).

## Build and promotion

Derive the toolchain and commands from the repository. Use lockfile-aware installs,
cache keys that reflect dependency/toolchain compatibility, and clean outputs.
Produce an artifact with a revision and digest; consume that exact artifact after
approval. For cross-workflow downloads, identify the producing run and artifact
explicitly instead of selecting the latest successful result by name alone.

Choose separate concurrency policies for replaceable CI and deployment. Group
deployments by the shared destination, even when branches differ. Avoid canceling
an active non-idempotent deployment. Default concurrency replaces older pending
runs; if every release must execute, verify available queue settings and ordering
semantics rather than treating concurrency as a durable FIFO. See [concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).

An `environment:` declaration does not establish required reviewers or deployment
branch restrictions. Inspect or list the settings that must be configured; check
plan and repository-visibility availability before depending on protection rules.
See [deployment environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).

## Setup and validation

Implement CI first using actual repository commands, then add deployment only
when in scope. Reuse existing workflows if their interfaces and permission
boundaries fit. Resolve action versions against official repositories and confirm
runner/runtime compatibility, particularly for GHES and self-hosted runners.

Run an available [actionlint](https://github.com/rhysd/actionlint) against changed
workflows and check referenced scripts with suitable shell/tool validators.
Generic YAML parsing alone does not validate expressions, contexts, or event
semantics; YAML 1.1 parsers can also interpret `on` as a boolean. Local workflow
emulators are optional and do not prove hosted permissions, OIDC, or protection
rules. Use the shared [validation scenarios](implementation-and-validation.md)
before an authorized provider run.
