# Software architecture review

## Scope and evidence

- Revision, working-tree context, reviewed paths, and exclusions.
- User-provided constraints, inferred invariants, and unknown workload or SLO assumptions.
- Selected structural and system-flow lenses and the scenarios used for ratings.
- Static source inspection only; unresolved wiring, dependencies, deployment settings,
  and coverage limits.

## Implemented architecture

Describe responsibilities, interfaces, state ownership, and dependency direction.
When applicable, map evidenced process boundaries, stores, queues, integrations,
critical flows, transaction boundaries, and source-visible guarantees. Include a
source-backed table or diagram when useful and separate implementation from intent.

## Architecture characteristic ratings

Use the scale and catalog in [architecture-characteristics.md](architecture-characteristics.md).
Include every catalog characteristic, using **NR** when evidence is insufficient.
Use an em dash for confidence when the rating is **NR**.

| Characteristic | Rating | Confidence | Evidence and rationale |
|----------------|--------|------------|------------------------|
| Maintainability and modifiability | 1–5 or NR | High, Medium, or Low | Source citations, relevant scenario, supporting and obstructing evidence. |
| Extensibility | 1–5 or NR | High, Medium, or Low | Variation points and a realistic extension scenario. |
| Testability | 1–5 or NR | High, Medium, or Low | Test seams, controllable dependencies, and representative test usage. |
| Scalability | 1–5 or NR | High, Medium, or Low | Coordination, partitioning, fan-out, and resource bounds under stated workload assumptions. |
| Performance efficiency | 1–5 or NR | High, Medium, or Low | Source-visible work amplification and critical-path behavior without runtime claims. |
| Availability | 1–5 or NR | High, Medium, or Low | Failure domains, degradation or failover mechanisms, and unknown deployment conditions. |
| Reliability and resilience | 1–5 or NR | High, Medium, or Low | Error, timeout, retry, idempotency, and failure-containment paths. |
| Recoverability | 1–5 or NR | High, Medium, or Low | Checkpoint, replay, reconciliation, migration, and restoration evidence. |
| Data integrity and consistency | 1–5 or NR | High, Medium, or Low | Ownership, transaction, validation, ordering, and concurrency safeguards. |
| Security and isolation | 1–5 or NR | High, Medium, or Low | Trust boundaries, authorization, tenant scope, secrets, and sensitive-data flow. |
| Observability and operability | 1–5 or NR | High, Medium, or Low | Diagnostic context, health semantics, failure visibility, and operational controls. |
| Interoperability and compatibility | 1–5 or NR | High, Medium, or Low | Contract boundaries, adapters, version handling, and evolution safeguards. |
| Deployability and portability | 1–5 or NR | High, Medium, or Low | Environment coupling, configuration, migration order, and rollback compatibility. |

Do not calculate an overall average unless the user supplies business-priority
weights. Ratings summarize the detailed evidence; they do not replace findings.

## Prioritized findings

For each supported finding include:

- **Priority and confidence:** explain consequence and strength of evidence separately.
- **Classification:** code-proven mechanism, conditional risk, or unresolved.
- **Evidence:** file/line citations, symbols, complete dependency or data paths, and
  safeguards checked.
- **Observed implementation:** what the code establishes and relevant counterevidence.
- **Consequence:** a concrete change scenario, failure sequence, or concurrency
  interleaving with assumptions and the affected invariant.
- **Recommendation:** change locations, alternatives where useful, trade-offs,
  compatibility and regression risks, and migration or rollout order.
- **Static acceptance criteria:** source relationships or safeguards to verify afterward.

## Suggested sequence and open questions

Order changes by prerequisites and risk. Record unknown requirements and missing
source separately rather than promoting them to findings. List any needed runtime
validation as future work, never as completed checks.
