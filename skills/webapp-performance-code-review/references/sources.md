# Research sources and maintenance

Primary documentation reviewed on 2026-09-20. These references explain mechanisms
used during source review; they do not prove a repository contains a performance
problem. Recheck documentation against the versions found in manifests and
lockfiles.

| Source | Static review use |
|--------|-------------------|
| [Optimize LCP](https://web.dev/articles/optimize-lcp) | Critical resource discovery, priority, and render dependency patterns |
| [Optimize INP](https://web.dev/articles/optimize-inp) | Main-thread, handler, and rendering work patterns |
| [Optimize CLS](https://web.dev/articles/optimize-cls) | Source-level causes of layout instability |
| [MDN HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) | Cache directive and validation semantics for delivery configuration |
| [Node.js event loop and worker pool](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop) | Source patterns that block Node.js request processing |
| [Django database optimization, 5.2](https://docs.djangoproject.com/en/5.2/topics/db/optimization/) | ORM evaluation, related-object loading, and result-shape trade-offs |
| [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html) | Query-plan concepts when plan artifacts already exist in a repository |

For an unfamiliar framework, language, datastore, bundler, or deployment target,
identify its version from the repository and use the matching official reference.
Retain the same file-level evidence and confidence requirements.
