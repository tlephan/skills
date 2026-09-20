# Backend and data source review

Trace important request, event, and job paths from entry point through application
logic, storage, dependencies, serialization, and response or completion. Inspect
the detected language and framework on their own terms.

## Request and work amplification

Look for sequential independent operations, repeated parsing or serialization,
per-item external calls, duplicate reads, broad middleware, and work performed
before cheap validation or authorization can reject a request. Account for hidden
framework behavior such as dependency injection scopes, resolver execution,
middleware ordering, and request-level deduplication.

Recommend concurrency only for independent operations. Require an explicit bound,
cancellation behavior, error semantics, ordering requirements, and downstream
capacity assumptions. Avoid replacing a clear sequential path with unbounded
fan-out.

For background jobs, inspect enqueue behavior, deduplication, idempotency, retry
policies, batch size, acknowledgement, and poison-message handling. For streaming
or WebSockets, inspect buffering, backpressure, per-connection state, cleanup, and
message-size limits.

## Algorithms, memory, and resource ownership

Identify complexity from actual loops, searches, sorting, aggregation, copying,
and data structures. Record visible input bounds. Prefer changes that remove
repeated work or use a more appropriate data structure without obscuring code or
changing ordering semantics.

Inspect ownership and cleanup of files, sockets, database connections, locks,
threads or workers, timers, and retained caches. Check pool and concurrency values
for consistency across application replicas and downstream limits visible in the
repository. A larger pool or timeout is not a tuning recommendation without a
source-supported reason.

For Node.js, distinguish synchronous or CPU-heavy work on the event loop from APIs
that use the worker pool. See
[Node.js event loop guidance](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop).
For other ecosystems, use official documentation matching the detected version.

## Database and data access

Follow ORM or query-builder calls through loops, relations, serializers, templates,
and resolvers. Report N+1 behavior only when the traced path shows per-item access
without eager loading, batching, or an intervening cache. Check:

- Unbounded reads and missing pagination or limits.
- Fetching large columns or object graphs that callers do not use.
- Repeated queries caused by property access, serialization, or template helpers.
- Query predicates and ordering that do not align with repository-defined indexes.
- Read-modify-write loops, long transaction scopes, and locks held across external
  calls.
- Pagination with unstable ordering or expensive offsets on growing collections.

Index recommendations require a concrete query shape and schema evidence. Include
write, storage, migration, uniqueness, and ordering trade-offs. A sequential scan
is not inherently wrong, and query-plan cost units are not time values. Use
[PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
only to explain plan concepts when the repository already contains plan artifacts.

For nonrelational stores, inspect access patterns, partition keys, scan operations,
hot-key risks, batch limits, and consistency assumptions using the actual store's
configuration and official documentation.

## Dependencies and caches

Inspect client construction and reuse, deadlines, retries, pagination, payload
shape, and error paths for outbound dependencies. Retries can multiply load and
duplicate side effects; evaluate attempts, backoff, jitter, idempotency, and total
deadline together.

Before recommending a cache, identify repeated expensive work and a reusable key.
Evaluate cardinality, tenant isolation, freshness, invalidation, serialization,
memory bounds, concurrent misses, and failure behavior. Do not assume caching is
correct for mutable or authorization-sensitive data.
