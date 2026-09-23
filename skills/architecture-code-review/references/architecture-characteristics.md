# Architecture characteristics

Rate every characteristic below from the source within the declared review scope.
The rating summarizes how well the implemented architecture supports the
characteristic under known requirements. It is not a runtime measurement or a
substitute for a supported finding.

## Rating method

Use one rating and one confidence level for each characteristic. For **NR**, use an
em dash for confidence and explain the missing evidence:

| Rating | Meaning |
|--------|---------|
| 5 — Strong | Consistent, explicit mechanisms support the characteristic across representative paths, with no material counterevidence found. |
| 4 — Good | The architecture generally supports the characteristic; gaps are localized or affect secondary paths. |
| 3 — Mixed | Supporting and obstructing evidence are both material, or behavior varies substantially across important paths. |
| 2 — Weak | Multiple important paths lack needed mechanisms or contain structural obstacles with concrete consequences. |
| 1 — Critical | Source establishes a pervasive obstacle or reachable high-impact failure that defeats the characteristic. |
| NR — Not rated | Requirements, relevant implementation, or repository coverage are insufficient for a defensible rating. |

Confidence describes evidence coverage, not quality:

- **High:** relevant paths and safeguards are directly traceable across the reviewed
  scope, with meaningful counterevidence checked.
- **Medium:** representative paths are traceable, but dynamic wiring, missing
  components, or unreviewed areas could materially change the rating.
- **Low:** the rating relies on narrow samples or unresolved behavior. Prefer **NR**
  when evidence does not support even a conditional assessment.

Apply ratings consistently:

- Cite the strongest supporting and obstructing evidence with `file:line` and symbols.
- State the requirement or scenario used to judge the characteristic. When no target
  is supplied, use only source-visible responsibilities and mark assumptions.
- Rate the reviewed scope, not an imagined production deployment. Configuration
  declarations show intended mechanisms but do not prove operational outcomes.
- Do not lower a rating solely because a pattern, technology, abstraction, test,
  cache, queue, replica, or observability tool is absent. Show why the implementation
  needs it for a concrete responsibility or scenario.
- Do not award a high rating from the presence of a framework or dependency alone.
  Trace its configuration and use on representative paths.
- Do not average ratings into an overall score unless the user provides weights tied
  to business priorities. Averages can hide a critical weakness in one characteristic.

## Characteristic catalog

| Characteristic | What to assess from source | Static-analysis limits |
|----------------|----------------------------|------------------------|
| Maintainability and modifiability | Responsibility cohesion, dependency direction, duplicated policy, stable interfaces, local comprehensibility, and the spread of changes for concrete scenarios. | Source can show change coupling, but not actual lead time or team coordination cost. |
| Extensibility | Implemented variation points, adapters, registries, plugin boundaries, contract stability, and whether a realistic new variant can be added locally. | Do not reward speculative hooks or penalize direct code where no variation is required. |
| Testability | Isolation of business decisions, controllable time and nondeterminism, dependency substitution, observable outcomes, test seams, and representative test usage. | Tests are read as source; do not claim they pass, measure coverage, or equate mock count with quality. |
| Scalability | Partitioning and ownership boundaries, stateless versus shared state, coordination points, fan-out, queueing, pagination, batching, and explicit resource bounds. | Do not claim supported throughput, linear scaling, or production bottlenecks without runtime evidence and workload targets. |
| Performance efficiency | Algorithmic amplification, repeated I/O, serialization, batching, caching behavior, critical-path fan-out, and configured limits visible in code. | Do not invent latency, throughput, utilization, or improvement percentages. Route a dedicated performance audit to the applicable skill when requested. |
| Availability | Failure-domain isolation, health and readiness semantics, redundancy or failover declarations, graceful degradation, and removal of single coordination points. | Source and deployment declarations cannot establish achieved uptime, failover success, or production topology. |
| Reliability and resilience | Error propagation, timeouts, bounded retries, idempotency, failure containment, degradation paths, and handling of dependency failures. | Source-visible mechanisms do not establish achieved availability or incident frequency. |
| Recoverability | Durable checkpoints, replay, compensation, reconciliation, job leases, shutdown behavior, migrations, and declared backup or restore hooks. | Backup declarations do not prove successful restoration, recovery time, or recovery point objectives. |
| Data integrity and consistency | State ownership, transaction boundaries, validation, uniqueness, concurrency control, ordering, deduplication, and contract evolution. | Unknown store semantics or external guarantees can require **NR** or lower confidence. |
| Security and isolation | Trust boundaries, authentication and authorization placement, tenant scoping, secret handling, input validation, sensitive-data flow, and least-privilege declarations. | This is an architecture rating, not a vulnerability assessment; do not claim exploitability from an unverified pattern. |
| Observability and operability | Structured diagnostics, correlation context, health semantics, failure visibility, audit events, configuration validation, and safe operational controls. | Instrumentation calls do not prove signal quality, alert coverage, retention, or operational response. |
| Interoperability and compatibility | Explicit contracts, adapters, protocol boundaries, schema and API evolution, version handling, and isolation of provider-specific behavior. | Dependency declarations and interface names do not prove external compatibility. |
| Deployability and portability | Build and deployment boundaries, configuration separation, migration sequencing, rollback compatibility, environment assumptions, and platform coupling. | Checked-in configuration does not prove successful deployment, rollback, or portability to an unspecified target. |

Characteristics interact. Explain material trade-offs rather than rewarding every
dimension independently. For example, additional extension points can reduce
simplicity, stronger consistency can reduce availability under partition, and deep
portability layers can increase maintenance cost. Base the preferred balance on the
system's stated responsibilities and constraints.
