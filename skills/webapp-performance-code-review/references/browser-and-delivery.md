# Browser and delivery source review

Apply only to browser-facing code and delivery configuration present in the
repository. Follow framework entry points, layouts, routes, components, imports,
styles, asset references, data loaders, and server-rendering boundaries.

## Loading path

Identify resources required for the initial route and important navigations.
Inspect static and conditional imports, route chunk boundaries, shared bundles,
polyfills, third-party scripts, and side-effectful modules. Flag unused or broadly
loaded code only when imports and build configuration support that conclusion.
Account for tree shaking, server-only modules, and framework-generated chunks.

For likely above-the-fold content, inspect how images, fonts, stylesheets, and
data dependencies become discoverable. Check for:

- LCP candidate images hidden behind client code, CSS, or lazy-loading attributes.
- Oversized source assets or missing responsive variants where dimensions and
  usage are visible in the repository.
- Fonts or styles that block primary content through the documented framework path.
- Chained data dependencies that delay rendering by construction.
- Third-party scripts loaded globally although used by a small set of routes.

Use [Optimize LCP](https://web.dev/articles/optimize-lcp) to explain resource
discovery and rendering mechanisms. Do not claim an element is the actual LCP
element or quantify delay from source alone.

## Rendering and interaction paths

Trace state updates, component boundaries, selectors, subscriptions, handlers,
and list rendering. Look for repeated transformations, unstable object/function
identities that defeat existing memoization, broad context/store updates, forced
layout reads followed by writes, and expensive synchronous work in interaction
handlers. Confirm framework semantics for the installed version.

Recommend memoization only when the code shows repeated expensive work and stable
dependencies. It adds comparison and memory costs. For large collections, assess
pagination, bounded rendering, or virtualization while preserving keyboard access,
focus, semantic structure, search, and print behavior required by the product.

Inspect cleanup for listeners, subscriptions, observers, timers, and caches.
Identify retained references or unbounded containers from ownership and lifecycle
code; do not label a leak when collection behavior is unresolved.

For layout stability, inspect explicit media dimensions, reserved embed or ad
space, late content insertion, font configuration, and transition code. See
[Optimize CLS](https://web.dev/articles/optimize-cls) for causal patterns, while
keeping application findings tied to specific source locations.

## Requests, payloads, and delivery configuration

Trace client requests for duplicate fetching, sequential dependencies, polling,
overbroad responses, missing cancellation, retry multiplication, and cache-key
instability. Account for framework request deduplication and server/client data
handoff before reporting duplication.

Inspect repository-defined response and asset policies. Separate immutable
versioned assets, HTML, public data, personalized responses, and authenticated
content. Verify cache keys, variants, tenant isolation, invalidation, and freshness
requirements. `no-cache` allows storage but requires validation before reuse;
`no-store` prevents storage. See
[MDN HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching).

Review service-worker source for cache versioning, cleanup, update activation,
offline behavior, and unbounded storage. Treat prefetching as a bandwidth and
priority trade-off; recommend it only for predictable, valuable next navigation.
