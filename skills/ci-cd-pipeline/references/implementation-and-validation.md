# Implementation and validation

## Implement the smallest complete pipeline

1. Establish the event-to-delivery contract: what runs for pull/merge requests, trusted merges,
   release tags, and manual requests; which checks gate promotion; what artifact
   reaches which environment. Preserve existing required check names and callers
   or include their migration in the handoff.
2. Implement actual repository commands with explicit toolchain/runtime choices.
   Separate validation from credentialed release work. Reuse existing scripts
   instead of maintaining divergent local and CI build logic.
3. Add deployment only to the requested targets. Include scoped credentials,
   artifact identity, sequencing, verification, and the relevant recovery steps.
   Keep account/project IDs, regions, connection identifiers, service accounts, and
   target names configurable when the repository requires it; never invent values
   to make a file appear complete.
4. Document external setup next to the implementation: required variable/secret
   names (not values), role/connection prerequisites, required checks, protections,
   and the initial run procedure. Clearly label unresolved inputs and draft files.

Do not add generic starter YAML whose commands or permissions cannot be justified
from the project. A useful result may be complete CI plus a deployment draft with
one explicitly blocked target decision, rather than a fabricated working release.

## Validation layers

Use available tools and report missing ones; do not silently install dependencies
or execute repository code during a review-only task.

| Layer | Checks and limits |
|-------|-------------------|
| Static | Parse configuration; validate workflow expressions or IaC schema; resolve local scripts, reusable workflows, artifact names, and dependencies. Parsing does not establish provider execution. |
| Local behavior | For implementation, run the relevant project checks and inspect output/report paths. Review commands first for remote writes or destructive effects. |
| IaC | Use the repository's formatter/validator and, when appropriate, CDK synth, CloudFormation linting, or Terraform validate/plan. Synthesis and plans may execute code, load credentials, or read remote state; inspect their scope first. A plan does not apply changes. |
| Provider | With existing authorization, run the intended revision in the intended test environment and verify checks, artifact identity, permission boundaries, and resulting state. Dispatch/start/retry commands may deploy and are not dry runs. |

Select scenarios that could change the outcome rather than mechanically running
every case. Static tracing is useful when execution is unavailable; label it as such.

| Scenario | Expected invariant |
|----------|--------------------|
| Ordinary and fork pull/merge request | Required checks run; untrusted work cannot obtain deployment authority. |
| Failing test/build | Failure blocks promotion; cleanup/reporting does not mask it. |
| Trusted merge/tag | Intended checks and exactly the intended deployment trigger run. |
| Relevant/irrelevant path change | Filters agree with required checks and affected components. |
| Merge queue or merge train, if used | The proposed merge revision receives required checks. |
| Two overlapping releases | Destination cannot be overwritten out of order; cancellation effects are understood. |
| Approval or delayed promotion | The approved revision and artifact remain the ones deployed. |
| Failed/partial deployment | Health failure is visible; retry/recovery respects existing effects and migration compatibility. |

Do not inject failures into production merely to exercise this table. Use an
isolated target when authorized, or provide a concrete verification procedure.

## Handoff

Report changed files and behavior, commands run with outcomes, and validation
limits. List outstanding configuration by owner/location, then the first-run
procedure and recovery path. If approval is still needed, identify the exact
remote action and target after the patch is ready; do not ask again for actions
already authorized. Avoid calling a pipeline ready while required commands,
connections, credentials, or target settings remain unresolved.
