# Review and troubleshooting

## Review method

Follow an actual path from event to revision, checks, artifact, approval, deployment,
and health verification. Read invoked scripts and referenced IaC; workflow YAML
alone can hide the behavior that matters. Review the applicable concerns:

| Concern | Evidence to trace |
|---------|-------------------|
| Coverage | Events, filters, fork behavior, required checks, monorepo dependencies |
| Correctness | Exit status, conditions, dependencies, actual test/build commands |
| Trust | Untrusted inputs/code, runner isolation, permissions, credentials |
| Artifact integrity | Producing revision/run, digest, consumer, retention, promotion |
| Delivery | Destination, serialization, approvals, health checks, partial failure |
| Recovery | Idempotency, rollback artifact, migrations, external work after cancel |
| Efficiency | Duplicate triggers, measured duration, caching, matrix/build size |

Distinguish a demonstrated defect from a hardening opportunity. A missing feature
is not automatically a finding. Do not assert that settings outside the repository
are absent, that credentials were exploited, or that a change saves time/money
without evidence. Prioritize reachable credential exposure and incorrect releases,
then blocked checks/builds and recovery gaps, followed by measured efficiency issues.

Use this compact finding format; omit empty categories:

```text
[Priority] Concrete failure or risk
Evidence: file:line, execution/log reference, or observed setting
Trigger and effect: conditions needed and affected checks/environment/artifact
Change: smallest practical correction and its trade-off
Verification: how to reproduce safely and demonstrate the fix
Confidence / unknowns: configuration fact versus unverified runtime assumption
```

Close with scope, material unknowns, and recommended next steps. If no actionable
findings are established, say so without certifying the pipeline's security or
runtime correctness.

## Diagnose failures

1. Identify provider, run/execution ID, event, revision, target, and first failing
   job/action. If unavailable, inspect local configuration and request only the
   missing evidence needed to distinguish plausible causes.
2. Separate never-triggered, queued/blocked, source authorization, build/test,
   artifact transfer, deployment, and post-deployment health failures.
3. Inspect the earliest causal error, resolved inputs, role boundary, and relevant
   configuration change. A later skipped job or missing artifact may be a symptom.
4. Reproduce with the smallest appropriate local check or authorized non-production
   execution. Do not expose secret values while investigating authentication.
5. Fix the cause within scope, verify expected success and failure behavior, and
   explain whether existing executions need a new run to use the changed definition.

Before retrying a failed deployment, establish its current state and whether the
operation is idempotent. A rerun can use different dependencies, credentials, or
mutable source inputs even when the displayed commit is unchanged. Identify the
artifact to retry and stop for investigation if effects or permissions are unclear.
