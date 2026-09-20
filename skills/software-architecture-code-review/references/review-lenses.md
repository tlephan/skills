# Architecture review lenses

Apply only the lenses relevant to the code. For each concern, trace both the
dependency and a concrete consequence before recommending a change.

| Lens | Evidence to trace | Calibration |
|------|-------------------|-------------|
| Responsibility and cohesion | Related business rules scattered across handlers, jobs, or packages; unrelated policies sharing mutable state | Distinguish duplicated policy from similar syntax and intentional variants. |
| Dependency direction | Domain decisions importing transport or persistence details; transitive imports across intended boundaries | Composition roots legitimately know concrete implementations. Do not demand an interface for every dependency. |
| Cycles and initialization | Complete import/reference cycles, initialization order, registration and side effects | A module cycle is not automatically a runtime failure; describe the coupling established by source. |
| Interface boundaries | Consumers reaching into internals, persistence entities exposed through public contracts, unstable details propagated to callers | Show which callers must change together and why a narrower contract helps. |
| State and invariants | Mutation sites, aggregate or module ownership, validation rules bypassed by alternate entry points | Trace all relevant writers before claiming one owner or a bypass. |
| Change isolation | A specific feature change requiring edits across unrelated responsibilities or duplicated decisions | Give a hypothetical change scenario, not invented change-history statistics. |
| Test seams | Hardwired clocks, global state, I/O construction, and dependency substitution visible in test source | Read tests as evidence of intended usage; do not claim they pass or demand mocks as an architecture goal. |
| Extension mechanisms | Plugins, adapters, optional features, registries, configuration-selected implementations | Evaluate real variation points; avoid speculative extensibility layers. |

Evaluate architectural styles on their implemented constraints. A monolith can have
clear boundaries; multiple services can remain tightly coupled. Do not infer
deployment independence from separate folders or domain ownership from naming.
