# Measurement and experiment design

## Select evidence appropriate to the question

| Question | Useful evidence | Interpretation limit |
|----------|-----------------|----------------------|
| Are users affected? | Real-user monitoring (RUM), segmented journey and error metrics | Coverage, sampling, and collection windows affect conclusions |
| Why is a page slow? | Browser Performance trace, waterfall, resource timing, production bundle analysis | One device or synthetic run is not the population |
| Why is a request slow? | Correlated request trace, runtime profile, query and pool metrics | Missing spans and sampling can hide work |
| Where does capacity fail? | Bounded load test plus latency, errors, throughput, queues, and saturation | Results apply to the tested workload and environment |
| What can source inspection establish? | Concrete call paths, configuration, algorithms, and query construction | Candidate mechanisms, not actual latency or saturation |

Choose representative journeys rather than testing only the homepage. Include
cold and warm cache conditions, authenticated paths, client-side transitions, and
large datasets when they matter. Distinguish browser cache, service-worker cache,
CDN cache, application cache, and database buffer state.

## Metrics and population

Core Web Vitals guidance checked on 2026-09-20: good LCP is at most 2.5 seconds,
INP at most 200 milliseconds, and CLS at most 0.1, assessed at the 75th percentile
and segmented by mobile/desktop. These are user-experience reference thresholds,
not universal API or business SLOs. Recheck [Web Vitals](https://web.dev/articles/vitals)
when metric definitions matter. A navigation-only Lighthouse run does not measure
INP; TBT is a diagnostic proxy, not an interchangeable value.

For field data, record URL versus origin aggregation, device population, dates,
and available sample information. Origin data must not be presented as a route's
result. CrUX represents eligible Chrome experiences, not every browser or private
application. Missing CrUX data is inconclusive. See
[CrUX methodology](https://developer.chrome.com/docs/crux/methodology/).

For services, track request latency distributions, completed throughput, error
rate, and saturation together; distinguish fast failed requests from successful
work. Add queue wait, pool wait, dependency time, and resource usage to explain
the symptom. See [Google SRE monitoring](https://sre.google/sre-book/monitoring-distributed-systems/).
Choose p50/p95/p99 as appropriate to volume and objectives; sparse tail samples
are uncertain. Never average percentiles across hosts or periods. Aggregate
compatible raw observations or histogram buckets, or report cohorts separately.

For SPA navigation, streaming, WebSockets, or asynchronous work, define the actual
outcome: useful content visible, result complete, message delivered, or job age.
Do not substitute response-header arrival or initial-page metrics for completion.

## Repeatable baseline

Record scenario steps, dataset size, build identifier, tool versions, hardware,
browser, viewport, CPU/network throttling, region, cache state, authentication,
and background load. Keep raw artifacts locally with sanitized report excerpts.

Use several matched runs for inexpensive browser experiments; three to five is
a starting point, not statistical proof. Report individual values or median and
spread, not only the fastest result. Account for startup/JIT and cache warm-up
separately. If variation is comparable to the proposed gain, mark the result
inconclusive and investigate confounders. Lighthouse scores vary with test
conditions and tool versions; use raw metrics for comparisons. See
[Lighthouse scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring).

Compare one change or a clearly defined change set against the baseline under
the same conditions. Record unsuccessful runs and errors. Do not infer causation
from unrelated before/after production windows with different traffic mixes.

## Capacity experiments, when authorized

Define route mix, payload sizes, dataset, authentication, arrival pattern,
concurrency, duration, warm-up, cache hit ratio, and dependencies. Bound maximum
traffic and resource use; establish stop thresholds for errors, latency, queue
growth, and affected dependencies before starting. Use isolated test accounts
and avoid payments, emails, or other real-world side effects.

Choose an open arrival model for externally arriving traffic or a closed model
for a fixed population of users, according to the workload. A closed model can
reduce offered load as responses slow, hiding overload. Record offered and
achieved rates, dropped iterations, timeouts, and generator saturation. See
[k6 workload models](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/).

Set pass/fail thresholds from agreed requirements, not a tool's example values.
Exercise steady load, bursts, or soak duration only when relevant to the suspected
failure. A load generator with insufficient capacity cannot establish server
capacity. See [k6 thresholds](https://grafana.com/docs/k6/latest/using-k6/thresholds/).

## Verification contract

For each proposed tuning change, specify the scenario, baseline, primary metric,
target and its rationale, necessary sample/window, correctness checks, and
guardrails for errors, resource use, and other journeys. If no baseline exists,
make collecting it the first experiment instead of inventing a target gain.
After an authorized rollout, compare matching real-user cohorts and include a
rollback trigger. Add stable regression budgets to existing CI/monitoring only
when implementation is in scope.
