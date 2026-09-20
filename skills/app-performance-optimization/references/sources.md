# Research sources and maintenance

Primary documentation reviewed on 2026-09-20. The diagnostic workflow and report
format synthesize these sources; they are not a vendor-prescribed audit standard.
These references support methods, not claims about the application being audited.
Recheck current definitions and use documentation matching installed versions.

| Source | Use in this skill |
|--------|-------------------|
| [Web Vitals](https://web.dev/articles/vitals) | Field metrics, thresholds, and lab limitations |
| [Optimize LCP](https://web.dev/articles/optimize-lcp) | Loading subparts and critical-resource discovery |
| [Optimize INP](https://web.dev/articles/optimize-inp) | Interaction attribution and rendering delay |
| [Optimize CLS](https://web.dev/articles/optimize-cls) | Load and post-load layout instability |
| [Chrome Performance panel](https://developer.chrome.com/docs/devtools/performance/overview) | Browser recording and diagnosis |
| [Lighthouse performance scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring) | Score variability and interpretation |
| [CrUX methodology](https://developer.chrome.com/docs/crux/methodology/) | Field-data eligibility and population limits |
| [MDN HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) | Storage, validation, and shared-cache semantics |
| [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/) | Distributed request and span relationships |
| [Google SRE monitoring](https://sre.google/sre-book/monitoring-distributed-systems/) | Latency, traffic, errors, saturation, and tail behavior |
| [Node.js event loop and worker pool](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop) | Runtime-specific blocking and offloading considerations |
| [JDK Flight Recorder](https://dev.java/learn/jvm/jfr/) | JVM runtime recording entry point |
| [Django database optimization, 5.2](https://docs.djangoproject.com/en/5.2/topics/db/optimization/) | Profiling, ORM access patterns, and memory trade-offs |
| [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html) | Plan interpretation and query execution effects |
| [k6 open and closed models](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/) | Arrival models and coordinated omission |
| [k6 thresholds](https://grafana.com/docs/k6/latest/using-k6/thresholds/) | Explicit experiment success/failure criteria |

The runtime examples are conditional entry points, not a supported-stack
allowlist. For an unfamiliar framework, runtime, datastore, or deployment, first
identify its version and profiler/telemetry, then research the relevant official
documentation. Retain the same evidence requirements and reporting workflow.
