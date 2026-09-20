# Browser and delivery diagnosis

Use a production build and representative interactions. Correlate the waterfall,
main-thread timeline, screenshots, and source mappings before selecting a change.
The current [DevTools Performance panel](https://developer.chrome.com/docs/devtools/performance/overview)
supports load and runtime investigations. Tool suggestions are leads to verify.

## Loading and rendering

Identify the actual LCP element per relevant viewport and route. Break image LCP
into TTFB, resource discovery delay, transfer duration, and render delay. Tune the
dominant component: making an image smaller cannot remove a JavaScript gate that
still hides it. Keep the LCP image discoverable early and avoid lazy-loading it;
reserve lazy loading for appropriate offscreen content. Preload or raise priority
selectively, checking duplicate downloads and contention. See
[Optimize LCP](https://web.dev/articles/optimize-lcp).

For large transfers, inspect dimensions, responsive variants, format/quality,
encoding, and compressed bytes actually delivered. Separate transfer size from
decoded image memory and JavaScript execution cost. Check font dependencies,
render-blocking CSS, and third-party request chains. Do not recommend inlining all
CSS or preloading every asset: identify the critical resource and validate effects
on caching, contention, and other routes.

## Interaction and ongoing use

Capture the slow interaction, not just page startup. Separate input delay,
handler processing, and time until the next paint. Use attribution to evaluate
long tasks, expensive handlers, forced synchronous layout, and rendering work.
Consider reducing work, yielding between independent tasks, or moving suitable
CPU work to a worker; preserve ordering and account for transfer overhead. See
[Optimize INP](https://web.dev/articles/optimize-inp).

Tie framework changes to profiler evidence: repeated render work, hydration cost,
duplicate fetching, or a slow route transition. Evaluate route-level splitting
against added waterfalls. Memoization trades computation for memory and can add
overhead; confirm repeat work and dependency correctness first. For large lists,
compare bounded rendering or virtualization while preserving keyboard navigation,
focus, accessible semantics, and find/print behavior required by the product.

For CLS, identify the shifting elements and the content causing movement. Check
image dimensions, reserved ad/embed space, font changes, and delayed insertion.
Include scrolling and post-load navigation: a load-only trace can miss instability.
See [Optimize CLS](https://web.dev/articles/optimize-cls).

For memory growth, repeat a realistic navigation or interaction cycle. Compare
retained objects after equivalent idle/collection conditions; examine detached
elements, listeners, subscriptions, timers, and unbounded caches. A single high
heap reading does not establish a leak. Include responsiveness and long-session
behavior when these are the reported symptoms.

## Delivery and caching

Check redirects, connection setup, response timing, transfer size, and cache
headers before attributing TTFB to application execution. Separate edge hits from
origin misses and verify content encoding on actual responses. Protocol/CDN
changes need evidence of network or origin delivery constraints.

Separate immutable versioned assets from HTML and personalized responses. Verify
cache keys, variants, tenant/auth isolation, invalidation, and freshness budgets.
`no-cache` permits storage but requires validation before reuse; `no-store`
prevents storage. Avoid a blanket shared-cache policy for authenticated content.
Evaluate validators and lifetime settings against product semantics. See
[MDN HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching).

Inspect service-worker behavior if present: stale assets, cache growth, update
activation, and offline correctness. Treat prefetching, deferred scripts, or
third-party removal as experiments with bandwidth, ordering, consent, and product
trade-offs. Faster rendering must not break essential functionality.
