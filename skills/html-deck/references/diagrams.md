# Diagrams

Diagrams are built with HTML/CSS; the runtime only draws connectors (`data-links`), sequence diagrams, and the arrows and spokes of cycles and hubs. Each one earns its place by showing a mechanism: what flows where, what depends on what, what changes. Label arrows with what moves (`gRPC`, `writes`, `nightly sync`).

## Contents
- Flow: chevrons and boxes
- Timeline · Roadmap (Gantt)
- Layers · 2×2 matrix · Risk grid
- Funnel · Pyramid · Cycle · Hub · Tree
- Boxes & arrows (`data-links`) · Swimlane
- Sequence
- Custom inline SVG

## Flow: chevrons (3–7 ordered stages)
```html
<div class="flow">
  <div class="step"><i-file-text/>Spec<small>AC tagged</small></div>
  <div class="step alt">Verify<small>Security scan</small></div>   <!-- alt | hot | dark | muted -->
</div>
```
Put a `.g6` (or `.g4`…) of `.kpi.sm` tiles underneath, one per step, so the metrics line up with the stages.

## Flow: boxes with labeled arrows (a path through systems)
```html
<div class="flow boxes">
  <div class="box"><i-monitor ico/><b>Checkout UI</b><span>React</span></div>
  <div class="arrow">HTTPS</div>                                        <!-- empty <div class="arrow"></div> = plain arrow -->
  <div class="box hot">…</div>                                           <!-- alt | hot | muted top rule -->
</div>
```

## Timeline
```html
<div class="timeline">
  <div class="ms done"><div class="when">Jun 2026</div><div class="pin"></div><div class="what">New checkout flow</div><div class="desc">100% of traffic</div></div>
  <div class="ms now">…</div>   <!-- done = filled + progress rail · now = orange ring · (none) = future -->
  <div class="ms">…</div>
</div>
```
Use 4–7 milestones. On a sparse slide, put `.vcenter` on `.body` and add a row of status cards below.

## Roadmap (Gantt)
```html
<div class="roadmap" style="--cols:6">
  <div class="rm-h">Workstream</div><div class="rm-h">Oct</div>…<div class="rm-h">Mar</div>   <!-- 1 + cols headers -->
  <div class="rm-lane"><i-dollar/>Payments</div>
  <div class="rm-bar" style="--s:0;--e:1">PSP integration</div>       <!-- periods 0-based, inclusive -->
  <div class="rm-bar soft" style="--s:2;--e:2">Freeze</div>           <!-- alt | hot | soft | ms (milestone diamond) -->
  <div class="rm-lane">…next lane…</div>
  <div class="rm-now" style="--at:0.1"></div>                          <!-- "Today" marker, in period units -->
</div>
```
Write each lane's label followed by its bars in left-to-right order; the grid auto-places them on one row.

## Layers
```html
<div class="layers fill">
  <div class="stack">
    <div class="layer"><b><i-monitor/>Experience</b><div><span class="chip">Web</span>…</div></div>
    <div class="layer accent">…</div>                                    <!-- accent | alt tint the focus layer -->
  </div>
  <div class="rail"><i-shield-check/>Security · Observability</div>   <!-- optional -->
</div>
```
Put the layer closest to the user on top. Mark new parts with `.chip.new`.

## 2×2 matrix (qualitative)
```html
<div class="matrix fill" data-x="Ease of switching →" data-y="Capability fit →">
  <div class="q"><b>Top-left</b>note</div><div class="q hl"><b>Top-right</b>note</div>
  <div class="q dim"><b>Bottom-left</b>note</div><div class="q"><b>Bottom-right</b>note</div>
  <div class="pts">
    <span class="pt hot" style="--x:74;--y:78">Provider B</span>        <!-- 0-100 from bottom-left; alt | hot | muted -->
    <span class="pt left" style="--x:84;--y:40">Label left</span>       <!-- .left puts the label before the dot -->
  </div>
</div>
```
Word each axis so that further right and further up are better. For data-driven positioning, use the scatter chart with `quadrants`.

## Risk grid (likelihood × impact)
```html
<div class="risk fill">
  <div class="ax y" style="grid-row:1 / 4">Likelihood →</div>
  <div class="cell l2"></div><div class="cell l3"><span class="chip">R2 …</span></div><div class="cell l3">…</div>   <!-- high likelihood row -->
  <div class="cell l1"></div><div class="cell l2"></div><div class="cell l3"></div>
  <div class="cell l1"></div><div class="cell l1"></div><div class="cell l2"></div>                                 <!-- low likelihood row -->
  <div></div><div class="ax" style="grid-column:2 / 5">Impact →</div>
</div>
```
Cells run row by row from high likelihood down, with impact increasing left to right. `l1`, `l2`, `l3` = low, medium, high tint. Pair the grid with an owner table.

## Funnel
```html
<div class="funnel vcenter">
  <div class="stage"><b>Cart viewed</b><i style="--v:100"></i><span>1.00M<small>100%</small></span></div>
  <div class="stage"><b>Checkout started</b><i style="--v:72"></i><span>720K<small>72% of prior</small></span></div>
</div>
```
`--v` is the bar width as a % of the first stage. The runtime shades stages from dark to light.

## Pyramid
```html
<div class="body pyr-wrap">
  <div class="pyramid"><div class="tier">E2E<small>5%</small></div>…<div class="tier">Unit<small>70%</small></div></div>
  <div class="pyr-notes"><div><b>42 journeys</b><span>Nightly</span></div>…</div>   <!-- one note per tier, same order -->
</div>
```
List the top tier first. Tiers are 72px tall; set `style="--tier:60px"` on `.pyr-wrap` for 5–6 tiers.

## Cycle (3–6 stages, clockwise from 12 o'clock)
```html
<div class="cycle">
  <div class="node"><i-eye ico/><b>Observe</b><span>SLOs</span></div>
  …
  <div class="center"><b>14-day loop</b><span>every team</span></div>
</div>
```
The runtime places the nodes and draws the direction arrows. The cycle sizes itself to the cell height, so put it in a `.split` cell or a `.fill`. `style="--node:150px"` widens the nodes.

## Hub & spoke (4–8 dependents)
```html
<div class="hub">
  <div class="center"><i-box/><b>Order service</b><span>1.2K req/s</span></div>
  <div class="node"><b>Cart</b><span>gRPC</span></div>…
</div>
```

## Tree (hierarchy, driver tree, org chart)
```html
<div class="tree"><ul><li><div class="node accent"><b>Revenue</b><span>+$26M</span></div>
  <ul>
    <li><div class="node hot"><b>Conversion</b><span>+$13M</span></div>
      <ul><li><div class="node soft"><b>Payment step</b></div></li>…</ul></li>
    …
  </ul></li></ul></div>
```
Node tones: `accent` (root), `hot` (focus), `soft` (tinted leaf). Keep to ≤ 3 levels and ≤ 4 children per node, or the tree gets too wide for 1152px.

## Boxes & arrows (`data-links`): architecture, dependency, data flow
```html
<div class="diagram fill" style="grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(3,1fr)"
     data-links="web -> gw : HTTPS; gw -> order : gRPC; order => bus : OrderPlaced; bus --> legacy : nightly sync">
  <div class="group" style="grid-column:2 / 4;grid-row:2 / 4"><b>Kubernetes</b></div>   <!-- optional boundary -->
  <div class="node" data-id="web" style="grid-column:1;grid-row:1"><i-monitor ico/><div><b>Web</b><span>62% of orders</span></div></div>
  <div class="node accent" data-id="gw" style="grid-column:2;grid-row:2">…</div>
</div>
```
**Link syntax:** entries separated by `;`, each written `from OP to [h|v] : label`.

| OP | Meaning |
|---|---|
| `->` (or `>`) | Solid arrow (sync call) |
| `-->` | Dashed arrow (async, event, batch) |
| `=>` | Emphasized accent arrow (the path under discussion) |
| `<->` / `<-->` / `<=>` | Arrowheads on both ends |
| `--` | Plain line, no arrowhead |

- Routing is automatic: a straight line when two boxes share a row or column band, otherwise one rounded elbow. `[h]` forces horizontal-first and `[v]` vertical-first, to untangle fan-outs.
- Node tones: `accent` (focus) · `solid` (filled) · `new` (orange ring + NEW badge) · `ext` (dashed = external or legacy).
- Place nodes explicitly with `grid-column` / `grid-row`. Straight rows and columns keep the arrows straight. Leave empty cells rather than crowding.
- `data-id` values are scoped to the container. The lint errors if a link names an id that doesn't exist.

## Swimlane (process across owners)
```html
<div class="swimlane fill" style="--cols:5;grid-template-rows:repeat(4,1fr)"
     data-links="req -> triage; check -> approve : > $500; check => issue : auto ≤ $500; issue -> notify [h]">
  <div class="lane" style="grid-row:1">Customer</div> …                 <!-- all lanes first -->
  <div class="node" data-id="req" style="grid-row:1;grid-column:2"><b>Request refund</b></div>   <!-- column = step + 1 -->
</div>
```

## Sequence
```html
<figure class="seq fill">
  <script data-diagram="sequence">
  {"actors":["Shopper","Checkout UI","Order service","PSP"],"highlight":["Order service"],
   "steps":[["Shopper","Checkout UI","Place order"],
            ["Checkout UI","Order service","POST /orders"],
            ["Order service","PSP","authorize","em"],
            ["PSP","Order service","approved","reply"],
            ["Order service","Order service","persist + emit"]]}
  </script>
</figure>
```
Each step is `[from, to, label, "reply" | "em"]`. A step from an actor to itself draws a loop. Steps are numbered unless `"numbered": false`. Keep to ≤ 6 actors and ≤ 10 steps per slide.

## Custom inline SVG

When nothing above fits, hand-draw inside a `<figure>`:
- `viewBox` sized to the content, with `style="width:100%;height:auto"`.
- `currentColor` or tokens for color, e.g. `style="stroke:var(--line-2)"` and `fill:var(--accent)`.
- Text at 12–14px with short labels.
- Arrowheads via `<marker>` with an id unique in the deck.
- `role="img"` plus an `aria-label` stating the claim.

No `<script>` or external images inside the SVG. For complex diagrams, the `drawio-skill` can export an SVG to paste inline.
