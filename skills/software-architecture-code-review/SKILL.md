---
name: software-architecture-code-review
description: Review implemented software architecture and system design using static source-code analysis only, with evidence-based ratings for architecture characteristics, boundaries, dependencies, data flows, consistency, concurrency, failure handling, and change isolation. Use for repository-based architecture or system design audits; excludes greenfield design and runtime audits.
---

# Software Architecture Code Review

Reconstruct the implemented architecture and produce a prioritized review grounded
in the code. Evaluate internal code structure, end-to-end system behavior, or both
according to the user's focus and the mechanisms present in the repository. Judge
the implementation against visible responsibilities and constraints without
prescribing a preferred architecture style.

## Source-only boundary

- Read local source artifacts only: implementation, tests as text, schemas,
  migrations, API or event definitions, manifests, lockfiles, and checked-in build,
  deployment, or infrastructure configuration. Read repository instructions; treat
  comments and design documents as statements of intent, never proof of behavior.
- Use file search, read-only Git inspection, and static parsing that does not execute
  project code or load project plugins. Do not run applications, tests, builds,
  simulations, benchmarks, package installation, generators, or repository scripts.
  Do not query live services, cloud accounts, telemetry, databases, external
  repositories, or the web.
- When library behavior is not established by locally available source, leave it
  unresolved. A dependency declaration establishes a dependency, not its behavior;
  checked-in deployment declarations establish intent, not deployed topology.
- Review and report only. If implementation is also requested, keep it a separate
  phase governed by that request; this review does not authorize execution or edits
  to application code.

## Reconstruct before judging

1. Record the revision and relevant working-tree changes when Git is available,
   reviewed directories, entry points, languages, and excluded/generated code.
2. Map components by implemented responsibility, public interfaces, state ownership,
   and dependency edges. Identify processes only where source or configuration
   supports them; do not turn every package into a service. Directory names and
   framework conventions are hypotheses until wiring or callers support them.
3. Trace representative paths through entry points, orchestration, domain decisions,
   persistence, background work, and integrations. For stateful flows, identify
   transaction boundaries, acknowledgments, retries, concurrency controls, and
   externally visible outcomes. Cover the user's focus first and explain sampling
   limits in large repositories.
4. Follow dependency injection, re-exports, adapters, and shared utilities before
   asserting boundary violations. Record unresolved reflection, dynamic loading,
   conditional wiring, or unavailable packages as coverage limits.

Choose only the guidance relevant to the request:

- For every review, read [architecture characteristics](references/architecture-characteristics.md)
  and rate each listed characteristic or mark it **NR** when the source cannot
  support a rating.
- Read [architecture review lenses](references/review-lenses.md) for module
  boundaries, dependency direction, interfaces, cohesion, and change isolation.
- Read [system flow review](references/flow-review.md) for cross-component or
  cross-process data flow, consistency, concurrency, retries, failure recovery,
  and resource bounds.

Use both when the concern crosses code structure and runtime boundaries. Include a
small component, dependency, or sequence diagram only when it clarifies the review;
label inferred edges and distinguish module boundaries from process boundaries.

## Findings and recommendations

- Classify conclusions as **code-proven mechanism**, **conditional risk**, or
  **unresolved**. Cite `file:line`, symbols, and the complete relevant dependency,
  data, or control path. A cycle requires the complete cycle; a failure risk requires
  a concrete interleaving or partial-failure sequence and its prerequisites.
- Separate the observed implementation from its consequence. Explain a concrete
  change or failure scenario. Do not infer production frequency, traffic, latency,
  availability, data volume, defect rates, team ownership, or delivery delays.
- Before reporting, seek counterevidence such as composition roots, intentional
  extension points, transaction scope, unique constraints, recovery handlers,
  compatibility wrappers, configuration overlays, and isolated generated code.
  Absence from a sampled file does not prove absence system-wide.
- A large file, shared module, abstraction count, missing cache, queue, circuit
  breaker, replica, or microservice is not itself a defect. Show coupling that makes
  a concrete change costly, a violated invariant, or a reachable conditional risk.
- Prioritize by affected paths, scope of coupling, potential data loss or corruption,
  failure propagation, recoverability, and evidence confidence. Keep uncertainty
  separate from severity. If no actionable issues are supported, say so without
  padding the report.
- Recommend the smallest coherent change. Explain trade-offs for compatibility,
  consistency, availability, complexity, migration order, and regression risk.
  Avoid blanket rewrites, service splits, or pattern adoption without a code-supported
  need. Keep infrastructure suggestions conditional when deployment evidence is incomplete.
- Treat characteristic ratings as summaries of the reviewed evidence, not findings
  or measured runtime results. Give each rating a confidence level and citations;
  do not average the ratings into an overall score unless the user supplies weights
  tied to explicit business priorities.

## Deliver the review

Use [report-template.md](references/report-template.md). Save to the user's chosen
path or repository report convention; otherwise use
`software-architecture-code-review.md` at the project root. Preserve existing reports
by choosing an unused dated filename. Return the report in the response if writing
is unavailable or the user requests an inline review.

State explicitly that the review used static source inspection only. Separate
unsupported requirements and questions from findings. Describe any runtime
validation that would be needed as future work without performing it.
