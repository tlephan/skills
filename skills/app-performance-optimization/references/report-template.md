# Performance tuning report template

Adapt the sections to the application and available evidence. Replace bracketed
guidance with actual observations or explicit unknowns. Omit inapplicable layers;
do not manufacture findings to fill a table.

## Summary

- Application, revision/build, environment, review date, and evidence mode.
- Affected journeys and the most consequential observed limitations.
- Recommended first actions and why they rank highest.
- Confidence and limitations, including unavailable runtime or field evidence.

## Scope and architecture

Describe browser-to-data/dependency flow, detected stack versions, relevant
deployment topology, and important traffic/data assumptions. List inspected,
uninspected, and inapplicable areas. Distinguish known business objectives from
proposed targets requiring agreement.

## Baseline and method

| Journey/route and cohort | Metric and unit | Result/statistic | Target and rationale | Evidence/window/sample count |
|-------------------------|-----------------|------------------|----------------------|------------------------------|
| [Actual scope] | [Metric] | [Measured value or not measured] | [SLO or proposed target] | [Artifact or telemetry query] |

Separate field, laboratory, load-test, and static evidence. Include tool versions,
commands/scenario steps, build mode, device/network, cache state, test dataset,
warm-up, run count, variability, and failures. Link sanitized artifacts and record
enough detail to reproduce each measurement. Explain contradictory results.

## Prioritized findings

| ID | Finding and affected journey | Evidence class/confidence | Impact | Effort/risk | Priority and reason |
|----|------------------------------|---------------------------|--------|-------------|---------------------|
| PERF-001 | [Specific symptom or hypothesis] | [Measured / code-supported hypothesis / unverified; confidence reason] | [User effect; quantified only if supported] | [Estimate with assumptions] | [Relative urgency] |

### PERF-001: [Concrete finding]

- **Evidence:** Source locations, trace/query/profile IDs, observations, and scope.
- **Diagnosis:** Mechanism, supporting facts, competing explanations, and what
  would confirm or disprove the proposed cause. State whether cause is measured.
- **Recommendation:** Specific change location and action; relevant alternatives.
- **Expected impact:** Affected metric and population. Label measured gain,
  modeled estimate with inputs, or unquantified expected direction. Avoid adding
  overlapping savings from multiple findings.
- **Trade-offs:** Correctness, freshness, accessibility, resource/cost effects,
  security/isolation, availability, and operational complexity where relevant.
- **Validation:** Exact scenario, equivalent baseline conditions, required
  measurements, success target with rationale, and regression guardrails.
- **Rollout/rollback:** Proposed rollout and revert trigger; mark not applicable
  for measurement-only work. Do not imply rollout was performed.
- **Dependencies/ownership:** Prerequisites and suggested team or role, if known.

## Action plan

Separate supported tuning actions from experiments needed to establish causes.
Order work by impact, confidence, effort, and dependencies. Identify architectural
options separately from focused changes. State required access or authorization
for deferred experiments without blocking the report itself.

## Verification and regression prevention

Record executed checks and actual outcomes, or clearly label planned checks.
If changes were implemented, show comparable before/after results, variability,
correctness checks, and regressions. Propose journey-specific performance budgets
and monitoring tied to user objectives, with an owner and observation window.

## Open questions and evidence inventory

List missing evidence, its effect on conclusions, and the smallest useful next
measurement. Link source artifacts and version-appropriate primary documentation.
If no confirmed bottleneck was found, say so and bound that conclusion to the
tested scope; an absence of measurements is not proof of good performance.
