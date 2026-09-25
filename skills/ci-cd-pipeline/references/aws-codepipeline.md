# AWS CodePipeline

Use for pipeline IaC/definitions, CodeBuild projects and buildspecs, source
connections, artifact stores, and deployment action roles. Official sources below
were consulted on 2026-09-25; verify the target region and IaC provider version.

## Source and triggering

For GitHub sources, prefer AWS CodeConnections and preserve the API action
identifier `CodeStarSourceConnection`; service branding does not rename all API
identifiers. Verify connection ARN, repository case, branch, and permissions.
The default source output is `CODE_ZIP`; `CODEBUILD_CLONE_REF` requires CodeBuild
as the downstream consumer and additional connection access for its service role.
See [connection source actions](https://docs.aws.amazon.com/codepipeline/latest/userguide/action-reference-CodestarConnectionSource.html).

A connection created through CLI or CloudFormation starts `PENDING`; an owner
must complete provider authorization before it is `AVAILABLE`. Reference an
existing authorized connection when appropriate, or document the completion step.
Do not claim an IaC deployment installs/authorizes the GitHub App. See [GitHub
connections](https://docs.aws.amazon.com/codepipeline/latest/userguide/connections-github.html).

Trace all automatic entry points: source change detection, configured trigger
filters, EventBridge rules, and any upstream workflow. Check for duplicate starts.
V2 trigger filters can select branches, tags, file paths, and supported PR events;
verify include/exclude combinations and provider-specific PR behavior. PR close
events are not universally equivalent to merged releases. Test relevant and
irrelevant path changes and branch creation where filters matter. See [triggers
and filtering](https://docs.aws.amazon.com/codepipeline/latest/userguide/pipelines-triggers.html).

## Pipeline structure and execution

Select pipeline type and execution mode explicitly from requirements. `SUPERSEDED`
can replace waiting executions between stages; it does not cancel an action already
running. `QUEUED` and `PARALLEL` require V2. Queued executions preserve stage order
while different stages can still process different executions. Parallel execution
needs destination isolation or external serialization and does not support stage
rollback. Abandoning an execution can leave provider operations running. See
[execution semantics](https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts-how-it-works.html).

Trace action ordering, including same-stage `runOrder`, artifact names, and variable
namespaces. Connect every consumer to the intended producer. Cross-region actions
require appropriate regional artifact stores. See [input and output artifacts](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome-introducing-artifacts.html).

Use the repository's CDK, CloudFormation, or Terraform conventions. Define the
pipeline role, build project/role, source connection reference, artifact storage,
deployment actions, and any requested gates as a coherent change. Choose the
target-specific deployment action and required artifact format from current
official documentation; ECS, CodeDeploy, CloudFormation, and S3 are not interchangeable.
Do not replace a native deployment action with a broad administrator build role
just to avoid configuring its contract.

## CodeBuild and IAM

Use buildspec `version: 0.2`; derive install/test/build commands from the project.
For a pipeline-integrated project, verify its source/artifact configuration uses
CodePipeline and names match the pipeline actions. Check working directories,
runtime/image compatibility, test report paths, artifact base directories, and
secondary artifacts. Keep secrets in Secrets Manager or Parameter Store references
with scoped read permissions. Preserve failing exit statuses; neither cleanup nor
artifact upload establishes that tests passed. See the [buildspec reference](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html).

Separate pipeline orchestration, build, and deployment permissions. Scope connection
use, artifact access, logs, secret reads, role assumption, and `iam:PassRole` to the
required resources and services. Enable privileged builds only when the build
mechanism requires them. For VPC builds, verify the actual network route/endpoints
to dependencies and registries rather than assuming internet access.

For cross-account deployment, trace the action's assumed role, trust relationship,
S3 bucket access, and customer-managed KMS key policy/grants together. An IAM allow
alone does not prove the artifact can be decrypted. Verify key region and account
compatibility. See [cross-account pipelines](https://docs.aws.amazon.com/codepipeline/latest/userguide/pipelines-create-cross-account.html).

## Release and recovery

Promote a tested artifact or container digest with its source revision. Put any
required approval before the mutating action and identify exactly what it approves.
Define health checks and who handles failures. Distinguish retrying an action,
CodePipeline stage rollback, target-service rollback, and data restoration.

Stage rollback reuses a prior execution's artifacts/variables, requires a compatible
pipeline structure version, and cannot roll back a source stage. Confirm target
eligibility and execution-mode restrictions before promising recovery. It does not
undo arbitrary migrations or external side effects. See [stage rollback](https://docs.aws.amazon.com/codepipeline/latest/userguide/stage-rollback.html).

Report unverified live prerequisites separately: connection state, role trust,
artifact/KMS access, target existence, regional action support, and quotas. Include
build compute, storage, logs, and transfer when discussing cost; verify current
regional prices instead of assuming V1/V2 or a cache is always cheaper.
