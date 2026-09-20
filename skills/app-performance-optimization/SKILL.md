---
name: app-performance-optimization
description: Analyze web application performance across browser, network, backend, and data layers and produce a prioritized tuning report with evidence, trade-offs, and validation plans. Use for performance audits, slow pages or APIs, latency investigations, and scalability reviews, including repository-only assessments.
license: MIT
---

# App Performance Optimization

Produce an actionable performance tuning report for a web application, adapting
to its architecture, language, framework, deployment, and available evidence.
Support static sites, server-rendered applications, SPAs, and web APIs; assess
only layers actually present. Default to analysis and reporting. Implement
changes when the user also requests them, preserving the baseline first.

## Establish scope and evidence

1. Read repository instructions and locate manifests, lockfiles, build/start
   commands, routes, data access, deployment configuration, and existing telemetry.
   Identify versions and production configuration; do not assume a JavaScript
   frontend or a particular cloud provider.
2. Identify important journeys and symptoms: initial visit, returning visit,
   navigation, search, form submission, checkout, large lists, or API consumers.
   Record device, region, authentication state, data scale, traffic, and existing
   objectives when known. Ask only for information that materially affects the
   investigation; continue useful analysis with explicit assumptions.
3. Choose the evidence mode. With source only, produce a static assessment and
   measurement plan. With a URL only, inspect observable browser/network behavior
   without inventing backend causes. With telemetry or runtime access, correlate
   representative measurements with code. Combine modes where available.
4. Record the commit/build, environment, observation window, tools and versions,
   commands, artifact paths, sample counts, and coverage gaps. Missing field data
   means unknown user performance, not a pass or a failure.

## Measure and diagnose

Read [measurement.md](references/measurement.md) to select metrics and design
repeatable measurements. Prefer existing artifacts and instrumentation before
adding tools. Use production builds for representative lab measurements; label
development-mode observations explicitly.

Follow the affected request or interaction from browser to edge, application,
database, and dependencies. Find where elapsed time, resource use, or queuing
actually accumulates. Distinguish the visible symptom from its proposed cause;
concurrent and nested timings cannot simply be added together.

Load only relevant diagnostic references:

- [Browser and delivery](references/browser-and-delivery.md): rendering,
  interactions, assets, caching, and frontend navigation.
- [Backend and data](references/backend-and-data.md): APIs, runtime profiling,
  queries, dependencies, queues, and capacity.

Use [sources.md](references/sources.md) for researched primary documentation.
Verify version-dependent APIs, metric definitions, and framework advice against
current official documentation for the detected stack. If browsing is unavailable,
state that limitation and avoid presenting unverified version details as current.

### Evidence rules

- Label findings **measured**, **code-supported hypothesis**, or **unverified**.
  Measured symptoms do not automatically establish measured root causes.
- Cite application evidence: `file:line` and symbol, sanitized URL/route,
  trace/span/query identifier, profile location, or metric window and cohort.
  External documentation supports a technique, not proof of an application defect.
- Explain the mechanism connecting evidence to the affected journey. A missing
  cache, index, CDN, memoization call, or particular framework is not itself a defect.
- Do not invent timings, traffic, query counts, benchmark results, or improvement
  percentages. Separate measured results, modeled estimates, and desired targets.
  For estimates, show inputs and assumptions; otherwise say impact is unquantified.
- Do not convert Lighthouse scores into user latency or treat laboratory metrics
  as field percentiles. Report conflicting observations and plausible explanations.

### Execution boundaries

An audit authorizes inspection and report creation, not deployment, data/schema
changes, cache purges, or live traffic generation at load-test scale. Use existing
authorization when present. Before a load or stress test, establish the authorized
target, traffic ceiling, duration, test data, and stop conditions; otherwise report
the proposed experiment and continue the audit. Inspect local start/test scripts
for migrations or external side effects before running them.

Use bounded captures and existing monitoring for production diagnosis. Treat
executing query plans, profilers, and heap dumps according to their actual load,
mutation, and data-exposure risks. Keep secrets, cookies, user data, and raw
payloads out of reports; do not upload private artifacts to public analysis tools
without authorization.

## Prioritize and deliver

Rank findings by user impact and affected traffic, evidence confidence, effort,
dependencies, and regression risk. Explain the ranking without manufactured
numeric precision. Separate immediate fixes, measurement work, and architectural
options. Do not recommend a rewrite or larger infrastructure without showing why
the observed bottleneck warrants it.

Use [report-template.md](references/report-template.md). Save to the user's chosen
path or the repository's report convention; otherwise use
`app-performance-report.md` in the project root. Preserve unrelated existing
reports by choosing a dated filename. If writing is unavailable, deliver the report
in the response. Include coverage and limitations even when no confirmed issue is
found; never pad the report with generic findings.

Each recommendation needs evidence, a causal explanation, a concrete tuning
action, expected direction of impact, trade-offs, and a reproducible verification
plan with success and rollback criteria. Preserve correctness, authorization,
accessibility, freshness requirements, and availability. When implementation is
requested, compare before/after under equivalent conditions and report regressions
alongside gains. Finish with the report link and the most consequential findings.
