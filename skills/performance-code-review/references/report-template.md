# Static web application performance review template

Adapt the report to the repository. Replace bracketed guidance with concrete
source evidence or explicit unknowns. Omit inapplicable layers and generic advice.

## Summary

- Application, revision, review date, and reviewed directories.
- Important source paths and the most consequential code-supported risks.
- Recommended first changes and why they rank highest.
- Coverage limits and assumptions that materially affect conclusions.

## Architecture and scope

Describe the source-defined flow from browser or API entry point through relevant
components, handlers, data access, dependencies, and delivery configuration. List
included, excluded, generated, and unresolved areas. Record detected framework,
dependency, and deployment versions.

## Review method

List the paths, symbols, configuration, schemas, lockfiles, and dependency docs
examined. Explain which user or request paths were traced and where source coverage
ended. State traffic, data-size, or deployment assumptions without presenting them
as facts.

## Prioritized findings

| ID | Finding and affected path | Evidence class | Expected direction | Effort/risk | Priority and reason |
|----|---------------------------|----------------|--------------------|-------------|---------------------|
| PERF-001 | [Specific behavior or conditional risk] | [Code-proven behavior / conditional risk] | [Work, transfer, memory, or fan-out reduced] | [Relative estimate and assumptions] | [Evidence-based rationale] |

### PERF-001: [Concrete finding]

- **Source evidence:** `file:line`, symbol, caller, configuration, and relevant
  data flow.
- **Behavior:** What the code does, including repetition, bounds, and conditions.
- **Consequence:** Why that behavior can add work or resource use. Keep claims
  qualitative unless the repository supplies a defensible quantity.
- **Recommendation:** Specific change and location, including relevant alternative.
- **Expected direction:** What work, transfer, allocation, retention, or dependency
  fan-out should decrease. Do not invent timings or percentage gains.
- **Trade-offs:** Correctness, ordering, freshness, accessibility, isolation,
  consistency, availability, complexity, and resource costs where relevant.
- **Implementation notes:** Prerequisites, affected interfaces, migrations, feature
  flags, or ownership boundaries visible in the repository.
- **Correctness checks:** Existing or proposed functional tests and invariants that
  protect behavior if the change is implemented.

## Action plan

Order changes by path importance, amplification, evidence confidence, effort, and
dependencies. Separate focused fixes from architectural options. Keep unresolved
questions out of the implementation queue until the relevant source or requirement
is available.

## Evidence gaps

List unavailable code, generated behavior, external configuration, data-size
assumptions, and dependency internals that limit conclusions. Explain which
finding or priority each gap affects. If no material source-supported risk was
found, say so and bound the conclusion to the reviewed files and paths.

## Source inventory

Link the application files and version-appropriate primary documentation used to
support the review. External guidance explains mechanisms; application findings
must remain grounded in repository evidence.
