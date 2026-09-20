# Static evidence and prioritization

## Evidence classes

Use the strongest class justified by the repository:

| Class | Requirement | Example |
|-------|-------------|---------|
| Code-proven behavior | The relevant call path, configuration, and bounds establish the behavior | A loop issues one query per item with no batching layer in the traced path |
| Conditional risk | The code can amplify work when a stated condition holds | An unrestricted result list grows with tenant records |
| Unresolved | A required value or implementation is outside the reviewed source | A managed cache policy is referenced but not defined in the repository |

Do not promote a familiar anti-pattern to code-proven behavior without tracing
callers, framework behavior, and configuration. Do not demote a clear algorithmic
or fan-out issue merely because input size is unknown; classify it as conditional
and name the materiality condition.

## Trace complete paths

For each important route or user action, follow:

1. Entry point, routing, middleware, and authorization.
2. Rendering or handler logic and shared helpers.
3. Data fetching, transformations, serialization, and response construction.
4. Network calls, storage operations, queues, or background work initiated by the
   path.
5. Error, retry, cache-miss, pagination, and large-input branches.

Record unresolved indirection such as generated code, dependency internals,
environment-provided values, remote configuration, or infrastructure managed in
another repository. Avoid assuming their behavior.

## Amplification factors

Prioritize code that multiplies work through:

- Nested iteration or repeated scans of growing collections.
- Per-item database, filesystem, or network operations.
- Resolver, component, middleware, hook, or event-listener fan-out.
- Duplicate parsing, serialization, transformation, rendering, or fetching.
- Unbounded concurrency, queueing, retries, caches, or retained state.
- Large eager imports, assets, payloads, queries, or object graphs on critical paths.
- Cache keys with high cardinality or invalidation that defeats intended reuse.

State the visible multiplier and its bound. Complexity notation can clarify an
algorithm, but it does not establish user impact without relevant input growth.

## Impact language

Describe expected direction and scope:

- Reduces work per item, request, render, or navigation.
- Removes a sequential dependency from a critical path.
- Bounds memory, result size, concurrency, or retained state.
- Avoids transferring or parsing unused code or data.
- Improves cache reuse while preserving required freshness and isolation.

Do not assign milliseconds, percentages, throughput, memory totals, or monetary
savings from source alone. If the application already contains documented budgets
or constraints, cite them as requirements rather than achieved results.

## Priority order

Compare findings by:

1. Whether the path is clearly reachable and important.
2. Whether work is unbounded or multiplied by data, traffic, or dependency count.
3. Whether the behavior crosses expensive boundaries such as network, storage,
   serialization, or browser main-thread work.
4. Confidence in the complete source path and configuration.
5. Breadth of affected routes or users.
6. Change effort, correctness risk, and operational prerequisites.

Use relative priorities such as high, medium, and low only when their meaning is
explained in the report. Keep unresolved items in an evidence-gaps section unless
the uncertainty itself requires an engineering decision.
