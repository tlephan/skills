# System flow review

Use this guidance when the request or repository involves end-to-end stateful flows,
cross-component interactions, or failure handling. Choose only scenarios that the
source makes reachable. Describe the sequence, invariant, and material condition;
do not execute scenarios.

| Area | Trace in source | Useful scenario |
|------|-----------------|-----------------|
| Atomicity | Transaction boundaries, database writes, event publication, external effects | A write commits and publication fails, or an external effect succeeds before the local commit fails. Check outbox and reconciliation paths. |
| Delivery and idempotency | Producer retry, consumer acknowledgment, deduplication keys, unique constraints, key retention | The same operation arrives twice, concurrently or after deduplication expires. Check whether the effect and deduplication are atomic. |
| Concurrency | Read-modify-write paths, isolation declarations, locks, compare-and-set or version fields | Two requests read the same version and both update it. Account for database constraints and retries before claiming lost updates. |
| Ordering and evolution | Partition or routing keys, sequence checks, event schemas, compatibility handlers | An older event arrives after a newer one, or old and new code exchange different contract versions. Do not assume ordered transport. |
| Timeouts and retries | Deadline propagation, retry filters, attempt limits, backoff, cancellation | A caller times out after a dependency commits, then retries. Trace retry multiplication and whether cancellation reaches downstream work. |
| Failure containment | Shared pools, concurrency limits, queue bounds, fallback paths | One unavailable dependency occupies resources needed by unrelated paths. State workload assumptions rather than claiming an observed outage. |
| Data ownership | All writers, cross-service table access, invariant enforcement, tenant keys | An alternate writer bypasses the owner or two consumers interpret the same state differently. Confirm the invariant and scope. |
| Cache correctness | Key construction, invalidation, TTL declarations, source of truth | A write races with a stale refill, or a key omits a dimension required for isolation. Missing caching alone is not a problem. |
| Resource bounds | Pagination, batch size, fan-out, in-memory queues, retention, scheduled cleanup | User-controlled or stored input expands work without a visible bound. Show the input-to-resource path and existing caps. |
| Recovery | Checkpoints, job leases, replay paths, compensation, startup and shutdown handling | Work stops between effect and checkpoint, or a lease expires while the original worker continues. Inspect fencing and restart behavior. |

Do not assume exactly-once delivery or global ordering from local deduplication or a
transaction around one store. Keep source-visible resilience separate from operations:
a health-check handler does not establish failover, a backup declaration does not
prove restoration, and a retry loop does not establish eventual success. Unknown
deployment settings, data distributions, and external contracts belong in open questions.
