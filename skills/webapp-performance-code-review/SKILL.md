---
name: webapp-performance-code-review
description: Statically review web application source code, configuration, and dependencies for performance risks and produce a prioritized tuning report with file-level evidence, trade-offs, and implementation guidance. Use for repository-based performance audits of frontends, backends, APIs, and data access layers.
---

# Web Application Performance Review

Produce an actionable performance tuning report from repository evidence. Adapt
the review to the application's architecture, language, framework, deployment,
and layers actually present. Support static sites, server-rendered applications,
SPAs, web APIs, workers, and supporting infrastructure configuration.

Default to review and reporting. Modify application code only when the user also
requests implementation.

## Establish scope

1. Read repository instructions before inspecting application code.
2. Locate manifests, lockfiles, build configuration, entry points, routes,
   middleware, components, data access, asset pipelines, deployment files, and
   relevant tests. Identify framework and dependency versions from repository
   evidence rather than assumptions.
3. Map important user and request paths through the code: initial page delivery,
   navigation, search, forms, checkout, large collections, APIs, background work,
   and integrations. Follow imports, callers, configuration overlays, generated
   queries, and shared abstractions far enough to understand each path.
4. Record the reviewed revision, included directories, excluded or generated
   files, unresolved configuration, and assumptions about traffic or data size.
   Treat unavailable code and deployment values as coverage limits.

## Review the source

Read [static-evidence.md](references/static-evidence.md) for evidence and
prioritization rules. Load only the layer guidance relevant to the repository:

- [Browser and delivery](references/browser-and-delivery.md): rendering paths,
  bundles, assets, caching configuration, and client-side data flow.
- [Backend and data](references/backend-and-data.md): request paths, concurrency,
  queries, dependencies, caches, and resource bounds.

Use [sources.md](references/sources.md) for primary documentation behind common
performance mechanisms. For version-dependent framework behavior, consult current
official documentation matching the versions in the repository. If that
documentation is unavailable, state the uncertainty rather than generalizing
from another version.

Trace behavior across boundaries before writing a finding. A slow-looking line
may be bounded, unreachable, cached elsewhere, generated at build time, or outside
an important path. Conversely, inexpensive work inside nested loops, fan-out, or
frequently invoked middleware can be consequential. Inspect call frequency and
input bounds visible in code.

### Evidence rules

- Label each finding **code-proven behavior**, **conditional risk**, or
  **unresolved**. Reserve code-proven behavior for behavior established by the
  complete relevant call and configuration path. State the condition that makes
  a conditional risk material.
- Cite `file:line`, symbol, and the call or data flow that supports the finding.
  External documentation explains a mechanism; it does not prove the application
  exhibits a performance problem.
- Separate the observed implementation from its likely consequence. Do not call
  a pattern a bottleneck when source code cannot establish its actual contribution.
- Do not invent latency, throughput, memory use, query counts, traffic, bundle
  savings, or improvement percentages. Express impact direction and amplification
  factors only when supported by the code.
- A missing cache, index, memoization call, CDN, lazy load, or particular framework
  feature is not itself a finding. Show repeated work, an access pattern, an
  unbounded path, or configuration that makes the recommendation relevant.
- Account for framework defaults and build transformations before flagging source
  syntax. Confirm whether tree shaking, code splitting, compression, caching, or
  query batching is already provided by detected configuration and versions.

## Prioritize and report

Rank findings using path importance, reachability, amplification, input bounds,
affected code breadth, evidence confidence, implementation effort, and regression
risk. Explain the ranking in plain language; do not manufacture numeric scores.
Prefer focused changes over rewrites or infrastructure expansion.

Use [report-template.md](references/report-template.md). Save to the user's chosen
path or the repository's report convention; otherwise use
`webapp-performance-code-review.md` in the project root. Preserve an unrelated existing
report by choosing a dated filename. If writing is unavailable, return the report
in the response.

Each recommendation must include source evidence, the causal mechanism, the
specific change location, expected direction of impact, prerequisites, trade-offs,
and correctness risks. Preserve accessibility, freshness, tenant isolation,
security, availability, ordering, and consistency requirements. Identify open
questions without turning missing evidence into a finding. Do not pad the report
with generic advice when the repository does not support it.

When implementation is requested, make the smallest coherent change, update
affected tests where meaningful, and run the repository's existing correctness
checks. Report the final source changes and any assumptions that remain.
