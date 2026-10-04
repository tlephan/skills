# One-pager

A one-pager is one 1280×720 slide that carries the whole story: the answer, the few numbers that prove it, and the ask. It serves as a decision brief, status report, pre-read, leave-behind or "put it on one slide". It also works as the executive-summary slide at the front of a longer deck.

## Contents
- When a one-pager fits
- Distill before you design
- Anatomy
- Archetypes
- Layout: the panel grid
- Panels and density
- Presenting: the spotlight walk-through
- Deliver: HTML, PDF, PNG
- Lint rules
- Turning a deck into a one-pager

## When a one-pager fits

- The reader must act within about 2 minutes, or reads it without you (pre-read, email, printout, wiki).
- The story has **one answer and 2–4 proofs**. If it needs more than 7 panels, it is a deck: put the one-pager in front as slide 2 and move the rest behind it.
- It is the wrong format for a narrative that builds step by step, a training walkthrough, or detail people will study. Use a deck with an appendix for those.

## Distill before you design

Write this as a table before touching HTML.

1. **Question.** What must the audience decide or know? Write it in one sentence.
2. **Answer = headline.** Use ≤ 14 words, with the number and the implication: *"Checkout hit 3 of 4 Q3 targets; $420K finishes the cut-over by March"*. If you cannot write it yet, you are not ready to lay out.
3. **Numbers.** Pick 3–6 KPIs, each with a unit and a comparison base (*vs Q2*, *target 400 ms*). Add a status color only when it is a status.
4. **Proofs.** Write 2–4 panels, each one claim (≤ 10 words) plus one visual that proves it. Together they should cover different ground (result, cause, plan, risk), not three views of the same chart.
5. **The ask.** State the decision, owner and date in the `solid` panel at the end of the reading path. A page with no decision still ends on the next step.
6. **Cut.** Background, methodology, history, team intros, agenda and definitions go to speaker notes or an appendix. If a panel does not answer "so what?" for the headline, drop it.
7. **Test.** Read only the headline and the panel claims aloud. They must tell the full story in 30 seconds.

**Budget:** ≤ 200 words on the page (aim for 120–170) and 4–6 panels. At least half the panels should be charts, KPIs or diagrams, and at most one panel should be text only.

## Anatomy

```html
<section class="slide slide--onepage">
  <header>
    <div class="kicker">Program · Report type</div>
    <div class="op-meta">                                          <!-- top right: status, date, owner -->
      <span class="tag ok"><i-check-circle/>On track</span>
      <span><i-calendar/>30 Sep 2026</span>
    </div>
    <h2>The answer, with the number, in ≤ 14 words</h2>
  </header>
  <div class="op" style="grid-template-areas:'kpis kpis kpis' 'a b ask' 'c c ask';
                         grid-template-columns:1.2fr 1fr .9fr;grid-template-rows:auto minmax(0,1.4fr) minmax(0,1fr)">
    <div class="kpis" style="grid-area:kpis">…4 .kpi tiles…</div>
    <div class="panel" style="grid-area:a">
      <h3><i-trend-up/>Result</h3>   <!-- label: 1-3 words, uppercased by CSS -->
      <p class="claim">Conversion up 2.4 pts since the new flow</p>  <!-- the panel's takeaway -->
      <figure class="chart">…</figure>                               <!-- one visual; fills the panel -->
      <aside class="notes">What to say while this panel is in focus</aside>
    </div>
    …
    <div class="panel solid" style="grid-area:ask">…decisions as ol.steps…</div>
  </div>
  <aside class="notes">Talk track for the whole page</aside>
</section>
```
Put sources and the owner in the footer: `footer="Source: … · Team"` in the config comment. The runtime prints it at the bottom left.

## Archetypes

Start from the closest one in `templates/onepage/`, and read only that file.

| Need | Template | Grid (reading order) |
|---|---|---|
| Decision brief: answer, proof, ask | `executive-summary` | 4 KPIs · result chart · the miss · plan timeline · decisions |
| Metrics review (QBR, MBR, ops) | `scorecard` | 6 KPIs · volume · mix donut · weak spot + callout · initiative table |
| Program or project status | `project-status` | milestones · RAG table · budget gauge · burn-up · risk grid · decisions |
| Strategy on a page | `strategy` | house (north star, 3 pillars, foundation) · trajectory · investment |
| Proposal with ROI | `business-case` | financial KPIs · problem donut · payback curve · options table · roadmap · ask |
| Introduce a solution or process | `solution-overview` | problem hero · how it works (flow) · results · benefits · rollout · ask |
| Software engineering case study | `case-study` | 4 outcome KPIs · where the time went (meters) · approach (flow) · results trend · lessons |

## Layout: the panel grid

- `.op` is a CSS grid. Name its areas in `grid-template-areas`, and give each direct child one of them with `style="grid-area:name"`.
- **Write children in reading order** (left to right, top to bottom). The spotlight walks them in source order, and `.op.numbered` numbers the `.panel`s in that order.
- Every row of `grid-template-areas` needs the same number of cells, and each area must be a rectangle. Otherwise the browser silently drops the whole layout, so the lint errors on it.
- Use `auto` rows for a KPI strip and `minmax(0,Nfr)` rows for everything else, so panels never outgrow the page. Use fr columns to weight panels, for example `1.2fr 1fr .9fr`.
- Put the ask in the right column or bottom right, at the end of the scan path.

Proven grids:

| Shape | `grid-template-areas` |
|---|---|
| KPI strip, 2 proofs + ask column, plan band | `'kpis kpis kpis' 'a b ask' 'plan plan ask'` |
| KPI strip, 3 proofs, wide table + tall panel | `'kpis kpis kpis' 'a b c' 'table table c'` |
| Status band + action column | `'ms ms ms ask' 'table table x ask' 'y y z ask'` |
| One hero structure over two charts | `'house house' 'a b'` |
| Problem → mechanism, evidence, ask | `'p how how' 'a b ask' 'plan plan ask'` |
| Case study: outcome, approach, trend, lessons | `'kpis kpis kpis' 'why how how' 'trend trend lessons'` |

Approximate minimum sizes: a line or column chart needs 300×170 px; a bar chart needs 26 px per bar; a donut with its legend needs 300×150; a timeline needs 120 px per milestone; a table needs 30 px per row; a gauge needs 220×150.

## Panels and density

- **Anatomy:** an `h3` label (1–3 words, with an icon; a `.tag` inside it floats right), a `.claim` (≤ 10 words), then one visual. A KPI strip (`.kpis`) and a `.house` are grid items without a label.
- **Tones:** default is white, `accent` is tinted (the focus), `tint` is a gray fill, `solid` is the hero gradient (the ask; exactly one per page), and `bare` has no box.
- **Helpers:** `.vmid` centers one block in the space below the claim. `.push` pins a block to the bottom. `.hero.push` is a bottom-line figure with a divider. `.op.numbered` adds reading-order badges.
- **Density:** inside `.slide--onepage` these components shrink automatically: KPI tiles, charts, tables, tags, meters, steps, takeaways, checks, callouts, hero, chips, chevron and box flows, timeline, roadmap, risk grid, matrix, diagram nodes and funnel. Anything else keeps slide size, so give it a larger panel.
- **Overflow:** panels clip their overflow and never spill into a neighbor. `render_slides.py --audit` names each panel that clips and by how much; shorten the text or give the panel more grid cells. Never set fonts below 12 px.
- Keep one entity in one color across panels. For example, Wallet is `c1` in both the stacked column and the donut (use the donut's `colors`).

**Strategy house** (`templates/onepage/strategy.html`):
```html
<div class="house" style="grid-area:house">
  <div class="roof"><small>North star</small><b>Every returning shopper checks out in one tap</b><span>Conversion 68% by Q4 2027</span></div>
  <div class="pillars">                                   <!-- 2-4 pillars; columns set automatically -->
    <div class="pillar"><b><i-zap ico/>Faster pages</b>
      <div class="goal">p95 latency<b>410 → 250 ms</b></div><ul><li>Edge-rendered checkout</li>…</ul><div class="own">Platform · $0.9M</div></div>
  </div>
  <div class="base"><b>Foundation</b><span class="chip">…</span>…</div>
</div>
```

## Presenting: the spotlight walk-through

- **Single-slide deck.** → or Space walks the page: the whole page, then each grid item in source order with the rest dimmed, then the whole page again as a recap. ← steps back and Esc returns to the whole page. The progress bar shows how far the walk has got. The page counter and page number are hidden.
- **Click** any panel to focus it, and click again or press Esc to release it. This works in any deck.
- **Inside a multi-slide deck**, → moves between slides. Add `data-spotlight` to the one-pager's `<section>` to walk its panels first. `data-spotlight="off"` turns off both the walk and click-to-focus.
- **Speaker notes (N):** an `<aside class="notes">` inside a panel shows while that panel is in focus. The slide-level notes show otherwise.

## Deliver: HTML, PDF, PNG

```bash
python <skill>/scripts/build_deck.py onepager.slides.html -o onepager.html     # interactive, offline, one file
python <skill>/scripts/render_slides.py onepager.html --audit                   # panels that clip, text over the footer
python <skill>/scripts/render_slides.py onepager.html --pdf                     # onepager.pdf: one 1280x720 page
python <skill>/scripts/render_slides.py onepager.html --scale 2                 # 2560x1440 PNG for chat, email, wiki
```

## Lint rules

These apply to a `slide--onepage` slide.

| Rule | Level |
|---|---|
| `.op` grid present; each row of `grid-template-areas` has the same cell count; every area is a rectangle | error |
| Every `grid-area` a panel uses is defined | error |
| Page ≤ 200 words; headline ≤ 16 words | warn |
| 3–7 panels; every panel placed; no empty or shared areas; track counts match the areas | warn |
| Panel ≤ 50 words per grid cell it spans; `.claim` ≤ 12 words; every `.panel` has an `h3` | warn |
| At least half the panels carry a chart, KPI or diagram; at most one panel is text only | warn |

The build prints an `INFO` line per one-pager with its panel count, visual panels and words used.

## Turning a deck into a one-pager

- The title slide's subtitle becomes the headline. The next-steps or closing slide becomes the `solid` ask panel.
- Keep the 2–4 action titles that carry the decision and use them as panel claims. Reuse their chart JSON with fewer categories, the top 5, or the last 6 periods.
- A KPI-row slide becomes the KPI strip. Drop the agenda, section, statement and background slides.
- Place the one-pager as slide 2 of the deck (with `data-spotlight` if you will present it), or ship it alone as a pre-read.
