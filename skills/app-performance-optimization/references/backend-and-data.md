# Backend, data, and capacity diagnosis

## Trace the critical path

Locate the affected route and correlate request spans, runtime profiles, database
work, and dependency calls. Separate queue wait, application CPU, serialization,
network wait, and downstream execution. Spans can overlap or contain each other;
adding every span duration overstates elapsed time. Missing spans indicate an
observability gap, not zero cost. See
[OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/).

Inspect payload growth, repeated calls, and sequential operations before tuning
infrastructure. Parallelize only independent work with bounded concurrency and
appropriate cancellation. For GraphQL, inspect resolver fan-out and batching;
for streaming, measure time to useful content and completion separately. For
background jobs, measure queue age and completion rather than enqueue latency.

## Runtime and resource use

Match the profiler to the detected runtime and version. Use CPU samples for
compute bottlenecks, allocation/heap profiles for memory pressure, and scheduler,
lock, or pool metrics for waiting. Correlate with the problematic workload.

| Evidence | Candidate tuning | Check before recommending |
|----------|------------------|---------------------------|
| CPU samples concentrated in a hot path | Reduce repeated work or algorithmic cost | Real input sizes, correctness, allocation trade-offs |
| Event-loop lag or worker starvation | Remove blocking work; bound/offload suitable work | Worker overhead, pool contention, cancellation |
| Allocation churn and GC pauses | Reduce temporary allocations or retained state | Leak versus expected cache growth; memory limits |
| Thread/connection wait with spare CPU | Shorten resource occupancy, bound concurrency | Downstream capacity; increasing pools may amplify overload |
| Lock contention | Shorten critical sections or transactions | Atomicity and consistency requirements |
| Container throttling or rising queues | Adjust resources/scaling based on bottleneck | Warm-up, autoscaling delay, database/dependency headroom |

Node.js asynchronous APIs do not make CPU-heavy JavaScript nonblocking; event
loop and worker-pool bottlenecks require different evidence. See
[Node.js runtime guidance](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop).
For JVM applications, consider existing JFR recordings or a bounded recording
appropriate to the deployment; see [JDK Flight Recorder](https://dev.java/learn/jvm/jfr/).
For other runtimes, use their official profiling guidance and installed tools;
do not translate Node-specific settings into universal recommendations.

## Database and data access

Correlate slow requests with query count, query duration, rows examined/returned,
locks, I/O, and connection wait. Identify ORM N+1 behavior from actual call paths
or query traces; use batching/eager loading where cardinality and memory permit.
Restrict unnecessary columns and unbounded result sets. Check pagination ordering
and consistency before recommending cursor/keyset pagination. See the practical
ORM trade-offs in [Django database optimization](https://docs.djangoproject.com/en/5.2/topics/db/optimization/);
adapt them to the application's ORM rather than copying APIs.

Evaluate plans using representative parameter values, dataset sizes, and current
statistics. A sequential scan is not inherently wrong. Index proposals need
predicate/order evidence, selectivity, write/storage costs, and a safe deployment
plan. Query-plan cost units are not milliseconds. Executing plans such as
PostgreSQL `EXPLAIN ANALYZE` run the query and can have side effects and substantial
load; prefer existing captures or non-executing plans until execution is in scope.
See [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html).
Do not assume rollback reverses external effects or makes a query cheap.

For nonrelational stores, check access patterns, partition/key skew, hot keys,
scan versus targeted access, throttling, and consistency needs using the actual
engine's metrics. Avoid importing relational index advice without checking the
store's data model.

## Dependencies, caches, and capacity

Compare connection reuse, deadlines, retries, and response sizes with trace
evidence. Retries consume capacity and may duplicate side effects; evaluate
bounded attempts, backoff, jitter, cancellation, and idempotency together.
Increasing timeouts or pool sizes can hide queues instead of resolving them.

Before recommending application caching, establish repeated expensive work,
expected reuse, key cardinality, tenant isolation, freshness, invalidation, and
memory limits. Include cache stampedes and failure behavior in verification.
Do not use hit ratio alone as proof of a user-visible gain.

Capacity conclusions need a defined workload and evidence of saturation. A low
average CPU value can conceal one hot core, lock contention, or I/O wait. Scaling
the application may overload the database. Compare realistic traffic, latency
tails, errors, queues, resource ceilings, cold starts, and dependency limits before
proposing additional instances, concurrency, or a different architecture.
