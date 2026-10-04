# Components

Class reference for `assets/deck.css`. Every snippet goes inside a slide's `.body` unless stated otherwise. All sizes are in 1280×720 stage pixels. See the templates for full slides.

## Contents
- Layout utilities
- Special slides
- Icons
- Cards, features, takeaways, callouts, quotes
- KPI tiles, hero figure, sparkline
- Tags, pills, chips
- Lists: agenda, steps, checks
- Tables, meters, harvey balls
- Screenshots: browser and terminal frames
- Compare, pros/cons
- Theming a single deck

One-pager panels (`.op`, `.panel`, `.op-meta`, `.house`) are documented in [one-pager.md](one-pager.md).

## Layout utilities

| Class | Effect |
|---|---|
| `.body` | Fills the height below the header (flex column, 18px gap) |
| `.split` + `style="--cols:3fr 2fr"` | Two columns (default 3fr 2fr, 32px gap); cells stretch full height |
| `.g2` `.g3` `.g4` `.g5` `.g6` | Equal-column grids |
| `.row` / `.stack` | Flex row / column with gap |
| `.fill` | Take the remaining height in a flex column (charts, diagrams) |
| `.middle` | Align grid/flex items to the vertical center |
| `.vcenter` | Center a flex column's content vertically (sparse slides) |
| `.push` | `margin-top:auto`: pin to the bottom of the column |
| `.gap-s` / `.gap-l` | 10px / 28px gaps |
| `.divider` | Left hairline + padding between columns |
| `.muted` `.faint` `.accent` `.small` `.xs` `.big` `.center-text` | Text helpers |

`.body` classes combine: `<div class="body split middle" style="--cols:1fr 1fr">`.

## Special slides

```html
<section class="slide slide--title">
  <div class="kicker">Program · Review type</div>
  <h1>Claim-style title</h1>
  <p class="subtitle">The answer in one sentence.</p>
  <div class="meta"><span><i-users/>Team</span><span>…</span></div>
</section>

<section class="slide slide--section"><div class="section-num">02</div><div class="kicker">Plan</div><h2>How do we finish by March?</h2><p>One line.</p></section>

<section class="slide slide--statement">
  <p class="statement">Payments is the <em>critical path</em> for every Q4 milestone.</p>   <!-- or a .hero -->
</section>

<section class="slide slide--closing"><div class="kicker">Q4 plan · Discussion</div><h1>Thank you</h1><p>The ask, restated in one line</p>
  <div class="contact"><span><i-mail/>team@example.com</span></div></section>
```

## Icons

```html
<i-rocket/>                                  <!-- inline, 1em, currentColor -->
<i-rocket ico/>                              <!-- 44px tinted tile -->
<i-rocket ico="lg hot"/>                     <!-- tile with modifiers -->
```
`ico` modifiers: `sm` (32px) · `lg` (60px) · `round` · `solid` (filled accent) · `alt` · `hot` · `ok` · `warn` · `bad` · `ghost`. Names are in [icons.md](icons.md); the build expands the shorthand and errors on unknown names.

## Cards, features, takeaways, callouts, quotes

```html
<div class="card accent"><h3>Title</h3><p>One line.</p></div>
```
`.card` modifiers: `white` (panel + shadow) · `accent` `alt` `hot` `ok` `warn` `bad` (4px left rule) · `top` (4px top rule). Add `<div class="card-head"><i-flag ico="sm"/><h3>…</h3></div>` for an icon header.

```html
<div class="feature card"><i-eye ico="lg"/><h3>Capability</h3><p>Benefit in one line</p></div>
<div class="feature row">…</div>                                             <!-- icon left, text right -->

<div class="takeaways">                                                       <!-- 2-3 icon-led conclusions beside a chart -->
  <div class="takeaway"><i-trend-up ico/>
    <div><b>Checkout passed the 80% bar</b><span>First domain at target</span></div></div>
</div>

<div class="callout"><i-info/><p><b>Gate rule:</b> one sentence.</p></div>
<blockquote class="quote">"Verify with code, not by reading it." <cite>— source</cite></blockquote>
```
`.callout` tones: default (accent) · `alt` · `warn` · `bad`.

## KPI tiles, hero figure, sparkline

```html
<div class="kpis">                                   <!-- style="--n:3" for 3 columns (default 4) -->
  <div class="kpi">                                  <!-- neutral tile: status lives in .tag + .delta, no colored stripe -->
    <div class="label">Checkout conversion</div>
    <div class="value">63.6<small>%</small></div>
    <div class="foot">
      <span class="delta good"><i-arrow-up/>2.4 pts vs Q2</span>
      <span class="spark" data-values="61.2,61,61.5,62.4,63.1,63.6"></span>
    </div>
    <div class="sub"><span class="tag ok">MET</span> target 63.0%</div>
  </div>
</div>
```
- `.delta.good` / `.delta.bad` colors by *whether the change is good*, not by direction: fewer incidents is `good` with an arrow-down icon.
- `.kpi.sm` makes a smaller value (28px); `.kpi.inline` puts the icon left of the value (see `07-column-compare`).
- Sparkline attributes: `data-values` (required), `data-width` (96), `data-height` (28), `data-area` (adds a wash). The trend line is gray and the last point accent.
- Hero: `<div class="hero"><div class="value">+2.4 pts</div><div class="label">what it means</div></div>`. Use one per slide.

## Tags, pills, chips

```html
<span class="tag ok">MET</span> <span class="tag warn">AT RISK</span> <span class="tag bad">MISSED</span>
<span class="tag info">NEW</span> <span class="tag accent">RECOMMENDED</span> <span class="tag hot">NEW</span> <span class="tag">NEUTRAL</span>
<div class="pills"><span class="pill">Label</span>…</div>
<span class="chip"><i-database/>Postgres</span>     <!-- boxed item: layers, risk grid -->
<span class="chip new">Payment</span>                                                  <!-- orange ring = new -->
```

## Lists: agenda, steps, checks

```html
<ol class="agenda"><li class="active"><i-chart-line/>Question?<span>5 min</span></li>…</ol>
<ol class="steps"><li><b>Approve budget</b><span>Owner · date</span></li>…</ol>       <!-- numbered + connector -->
<ul class="checks">
  <li><i-check-circle/>Done item</li>
  <li class="maybe"><i-clock/>Pending</li>          <!-- amber -->
  <li class="no"><i-x-circle/>Not done</li>         <!-- red -->
</ul>
```

## Tables, meters, harvey balls

```html
<table class="data roomy">                           <!-- roomy: 14px rows · compact: 6px rows -->
  <thead><tr><th>Service</th><th class="num">Budget</th><th class="c hl">Option B</th></tr></thead>
  <tbody><tr class="hl"><td>Payments</td><td class="num">38%</td><td class="c hl yes"><i-check/></td></tr></tbody>
</table>
```
- `.num` right-aligns with tabular figures. `.c` centers. `tr.hl` or `td.hl`/`th.hl` tints a row or column.
- Icon cells take `.yes` (green) · `.part` (amber) · `.no` (red), with `i-check` · `i-minus` · `i-x`.
- The first column is bold ink by default.

```html
<span class="meter" style="--v:72"></span>                                     <!-- ok | warn | bad tones -->
<div class="meter-row"><b>Payments</b><span class="meter bad" style="--v:20"></span><em>20%</em></div>
<td><div class="meter-row"><span class="meter" style="--v:92"></span><em>92%</em></div></td>   <!-- inside a table: no label -->
<table class="data refs">…<td><a href="…" target="_blank" rel="noopener" title="Full reference">Title</a> <span class="muted small">2018</span></td><td><span class="tag info">Role</span>What it shapes</td>…</table>   <!-- references appendix: 36-references -->
<span class="harvey" style="--v:75"></span>                                    <!-- 0 | 25 | 50 | 75 | 100 -->
```

## Screenshots: browser and terminal frames

```html
<figure class="shot">
  <div class="cap"><i-monitor ico="sm"/><div><b>App · page</b><small>What to notice, with the number</small></div></div>
  <div class="frame">
    <div class="bbar"><div class="dots"><span></span><span></span><span></span></div><div class="bnav"><i-arrow-left/><i-arrow-right/><i-refresh/></div><div class="url"><i-lock/>host/path</div></div>
    <img alt="What the capture shows" src="shots/app.png">       <!-- the build inlines it; path relative to the fragment -->
  </div>
</figure>
<div class="frame term"><div class="tbar"><div class="dots"><span></span><span></span><span></span></div>tool<small>· where, when</small></div>
<pre class="term"><span class="p">$</span> cmd <span class="c"># comment</span>
<span class="k">key</span> <span class="n">42</span> <span class="s">"str"</span> <span class="ok">✓</span> <span class="bad">✗</span> <span class="w">warn</span></pre></div>
```
- Two captures sit in `.body.split` (`--cols:5fr 4fr`). Capture at 1440×860 so the frame fits: `chrome --headless --hide-scrollbars --window-size=1440,860 --screenshot=shots/app.png URL`.
- Terminal text stays real text (crisp, searchable, not counted as slide words); keep lines under 60 characters. An `<img>` works in `.frame.term` too.

## Compare, pros/cons

```html
<div class="compare">                                <!-- horizontal: side · arrow · side -->
  <div class="side"><h4>Before</h4>…</div>
  <div class="vs"><i-arrow-right/></div>
  <div class="side after"><h4>After</h4>…</div>
</div>
<div class="compare vertical">…same children, arrow-down icon…</div>

<div class="proscons">
  <div class="pros"><h3><i-check-circle/>Gains</h3><ul class="checks">…</ul></div>
  <div class="cons"><h3><i-x-circle/>Costs</h3><ul class="checks"><li class="no">…</li></ul></div>
</div>
```

## Theming a single deck

Pick `teal`, `indigo` or `dark` first. For a brand accent, add one block at the top of the fragment. It is copied into the deck and wins over the defaults:

```html
<style>
  :root{ --accent:#1d4ed8; --accent-ink:#1e40af; --accent-soft:#eff4ff; --accent-line:#bcd0fb; --hero-b:#1d4ed8; }
</style>
```
Change chart series colors (`--c1`…`--c8`) only with a palette validated for color-vision deficiency. Otherwise keep the defaults, which were validated against both light and dark surfaces.
