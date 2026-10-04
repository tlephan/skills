---
name: html-deck
description: Build professional, self-contained HTML slide decks and one-page summaries (16:9, offline, print-to-PDF) from a reusable kit of slide templates, themes, icons, SVG charts (column, bar, line, area, donut, gauge, scatter, waterfall, dumbbell, heatmap) and CSS diagrams (flow, architecture, sequence, timeline, roadmap, matrix, funnel, tree, swimlane, risk), with a lint for text density and a layout audit. Visual-first and concise. Use for a presentation, slide deck, pitch, proposal, QBR, briefing or training deck in HTML; a one-pager, executive summary, status report or dashboard slide; or to turn notes into slides without PowerPoint.
---

# HTML Deck

Write **slide fragments** (only `<section class="slide">` elements) from the templates, then build. The build inlines the CSS, JS and icons into **one offline `.html`**: a 1280×720 stage scaled to any screen, keyboard navigation, speaker notes, an overview grid and print-to-PDF with one slide per page. A **one-pager** is the same pipeline with a single slide of panels ([below](#one-pager)).

House style: teal and indigo tokens, an uppercase kicker, an action title with an accent rule. Never restyle by editing `assets/`; pick a theme or add a small `<style>` block to the fragment.

## Kit

| Path | What it is |
|---|---|
| `templates/NN-*.html` | 37 slide layouts with realistic sample content; copy one per slide |
| `templates/onepage/*.html` | 7 one-pager archetypes (a whole story on one slide) |
| `scripts/build_deck.py` | Assemble + lint: density, hype words, visual coverage, icons, chart JSON, links, one-pager grid |
| `scripts/render_slides.py` | Headless Chrome/Edge: `--audit` layout check, PNG per slide, `--overview`, `--scale 2`, `--pdf` |
| `assets/` | `deck.css` tokens, 3 themes, components · `deck.js` runtime and chart renderer · `icons.svg` 88 icons · `shell.html` |
| `examples/` | `showcase.html` (every template), `onepagers.html`, `onepage.html`, `icons.html` (icon names) |

## Workflow

1. **Frame.** Audience, the decision or ask, time slot. Write the storyline in 1–3 sentences, answer first. A one-pager, executive summary, status page or "everything on one slide" follows [One-pager](#one-pager) for steps 2–3.
2. **Storyboard before HTML.** Make a table of *# · action title · visual · data*. Pick each visual from the [catalog](#template-catalog). A row with no visual is a slide that should not exist, or belongs in notes. Target ≥ 80% of content slides with a chart, diagram or KPI, no text-only slides, and one slide per 1–2 minutes. Read [references/visual-selection.md](references/visual-selection.md) once for the text-to-visual rewrites and writing rules.
3. **Author `<name>.slides.html`.** For each row, open **only** the matching template, copy its `<section>` and replace the content. Start the file with:
   ```html
   <!-- html-deck title="Q3 Platform Review" theme="teal" footer="Platform Engineering · Sep 2026" icon="presentation" -->
   ```
   `icon` is the browser-tab favicon: any [sprite icon](references/icons.md), white on the theme accent (default `presentation`).
   Use the [shorthand](#slide-anatomy-and-shorthand). Open a reference only when the template lacks what you need.
4. **Build + lint.**
   ```bash
   python <skill>/scripts/build_deck.py deck.slides.html -o deck.html
   ```
   Python 3.8+, standard library only (`python3` where needed). Fix every `ERROR`: unknown icon, invalid chart JSON, series/labels mismatch, missing link node, broken grid. Treat each `WARN` as a rewrite prompt (too many words, a topic-label title, a text-only slide, hype words, a long bullet), not as noise.
5. **Audit, then look.**
   ```bash
   python <skill>/scripts/render_slides.py deck.html --audit          # overflow, clipping, footer collisions, tiny text
   python <skill>/scripts/render_slides.py deck.html --slides 4,7     # PNGs of the slides it flagged
   python <skill>/scripts/render_slides.py deck.html --overview       # whole deck on one image
   ```
   The audit measures the real layout and names the element. Fix by cutting words or giving the element room, never by shrinking fonts below 12px. Render only the flagged slides, then the overview once for balance and label collisions the audit cannot see. Without Chrome/Edge, say the visual check was skipped.
6. **Deliver** `deck.html`. It works offline and prints to PDF from the browser (Ctrl/Cmd+P, one 1280×720 page per slide). Keep `deck.slides.html` as the editable source. For a file to send: `--pdf` writes `deck.pdf`, `--scale 2` writes 2560×1440 PNGs.

**Output discipline.** Write the storyboard as a table, then the whole fragment in one go. Do not paste slide HTML into the chat. Report the lint and audit summary lines and the file path.

## Non-negotiables

- **Title = the takeaway.** A full claim of ≤ 12 words, with the number: *"Automated coverage doubled in two quarters"*, not *"Test coverage"*. The kicker carries the topic (`Results · Quality`).
- **One message per slide.** Body ≤ ~60 words (lint warns at 90). Lists ≤ 4 bullets of ≤ 12 words, phrases without periods. Detail goes to `<aside class="notes">`.
- **Show, don't list.** Numbers become KPI tiles or charts, sequences become flows or timelines, relationships become diagrams, options become matrices or comparison tables. A slide of plain bullets is a defect.
- **Professional register.** Concrete nouns and verbs, specific numbers with a unit and a base (*vs Q2*, *target 400 ms*), sentence case. No hype words (*robust, seamless, leverage, world-class*; the lint lists them), no filler slides (standalone *Questions?*), no sentences that restate the chart.
- **Color has meaning.** `accent` = the focus, `alt` = a secondary category, `hot` = new, changed or needs attention. `ok`/`warn`/`bad` are status only, always with a label or icon. Status goes in the `.tag` and `.delta`, never a thick colored stripe on a KPI tile (no colored top/left border). Gray = context or prior period. An entity keeps its color on every slide.
- **Charts follow the data-viz rules.** No dual axis. ≤ 8 series, ≤ 6 donut parts, ≤ 3 scatter series. To make a point, highlight one bar or series and gray the rest. The caption names the unit and period. Label values selectively.
- **Self-contained.** No CDN scripts, web fonts or remote images (the build warns). The build inlines local `<img src="shots/app.png">` files (path relative to the fragment) as `data:` URIs; use images only for real captures and draw everything else.

## Slide anatomy and shorthand

```html
<section class="slide">                                   <!-- 1280×720; padding handled -->
  <header><div class="kicker">Section · Topic</div><h2>Action title that states the takeaway</h2></header>
  <div class="body split" style="--cols:3fr 2fr">          <!-- body = remaining height -->
    <figure class="chart">
      <figcaption>Measure, unit <small>Period · source</small></figcaption>
      <script data-chart="line">{"labels":["Q1","Q2","Q3"],"series":[{"name":"Checkout","values":[38,52,81]}],"suffix":"%","target":80}</script>
    </figure>
    <div class="takeaways">                                <!-- 2-3 icon-led takeaways -->
      <div class="takeaway"><i-trend-up ico/><div><b>Checkout passed the 80% bar</b><span>3 months early</span></div></div>
    </div>
  </div>
  <p class="note">Source: …</p>                            <!-- optional, pinned bottom -->
  <aside class="notes">Speaker notes (press N)</aside>
</section>
```

Shorthand the build expands: `<i-NAME/>` is an inline icon and `<i-NAME ico/>` or `<i-NAME ico="lg hot"/>` a tinted tile ([names](references/icons.md)); `<script data-chart="TYPE">` needs no `type`; a meter is `<span class="meter ok" style="--v:72"></span>`.

Special slides: `slide--title` (h1, `.subtitle`, `.meta`; text stays in the left 760px, a dot grid and a `deck.html` window sketch fill the right), `slide--section` (`.section-num`, h2, p), `slide--statement` (hero number or one sentence), `slide--closing` (the last slide, after the decisions: kicker, h1 *Thank you*, the ask restated in one line, `.contact`). The runtime adds page numbers and the footer to content slides; `data-nofoot` opts a slide out.

## Template catalog

Ask what the reader must *do* with the slide (compare, follow, decide, remember one number), then pick the row.

| Content is… | Show it as | Template |
|---|---|---|
| Opening | `slide--title`: claim title, one-line answer, meta | `01-title` |
| Agenda | Questions the deck answers + "the ask" card | `02-agenda` |
| Section break (decks > 12 slides) | `slide--section` phrased as a question | `03-section` |
| One number that matters | `.hero` figure + the trend behind it | `04-statement` |
| 3–4 headline metrics | `.kpis` tiles: value, delta vs base, sparkline, status tag | `05-kpi-row` |
| Change over time | Line (≤ 4 series) or area (1 series) + target, annotation, `.takeaways` | `06-chart-insight` |
| Compare periods or categories | Grouped column, prior period gray | `07-column-compare` |
| A ranking, long labels | Horizontal bars, top items highlighted | `08-bar-ranked` |
| Share of a whole | Donut (≤ 6 parts) or 100% stacked bar | `09-part-to-whole` |
| How we got from A to B | Waterfall bridge | `10-waterfall` |
| Items on two measures | Scatter with `quadrants` (≤ 3 series) | `11-scatter-quadrant` |
| Grid of magnitudes | Heatmap | `12-heatmap` |
| Progress toward a limit | Gauges + `.meter-row` | `13-gauges` |
| Ordered steps | `.flow` chevrons + one metric per step | `14-process-flow` |
| A path through systems | `.flow.boxes` with labeled arrows | `15-flow-boxes` |
| Components and who calls whom | `.diagram` + `data-links` | `16-architecture` |
| Layered stack | `.layers` + cross-cutting `.rail` | `17-layers` |
| Order of interactions | `data-diagram="sequence"` | `18-sequence` |
| Dated milestones | `.timeline` (done / now / next) | `19-timeline` |
| Parallel work over time | `.roadmap` Gantt | `20-roadmap` |
| Qualitative positioning | `.matrix` 2×2 | `21-matrix-2x2` |
| Options against criteria | `table.data` + `.harvey`, recommended column | `22-comparison` |
| Before vs after | `.compare` + dumbbell | `23-before-after` |
| Trade-offs of one option | `.proscons` + recommendation callout | `24-pros-cons` |
| A set of capabilities | `.feature.card` icon cards (3–6) | `25-feature-grid` |
| A repeating loop | `.cycle` | `26-cycle` |
| One thing everything depends on | `.hub` | `27-hub` |
| Drop-off between stages | `.funnel` with step conversion | `28-funnel` |
| Layers of different size | `.pyramid` + aligned notes | `29-pyramid` |
| Decomposition, drivers, org | `.tree` | `30-tree` |
| A process across teams | `.swimlane` + `data-links` | `31-swimlane` |
| Status of many items × attributes | `table.data.roomy` + meters, tags, icons | `32-table` |
| Risks | `.risk` grid + owner table | `33-risk` |
| Decisions and actions | `ol.steps` with owner · date | `34-next-steps` |
| End (after the decisions) | `slide--closing`: *Thank you* + the ask + `.contact` | `35-closing` |
| Sources (appendix, after the closing) | `table.data.refs`: linked title + year, tag, one ranked measure | `36-references` |
| Live demo, recorded | `.shot` frames: browser `.bbar` + `<img>`, terminal `.tbar` + `pre.term`; caption says what to notice | `37-demo` |

When two fit, prefer the one that makes the *difference* visible (the gap to target, the one outlier, the edge an option removes). If a sentence says it faster than any picture, write it as a `.callout` and move on.

## One-pager

One `<section class="slide slide--onepage">`: the header holds the kicker, `.op-meta` (status, date, owner) and the answer as the `h2`; below it a `.op` panel grid of 4–6 panels in reading order, ending on the ask in a `.panel.solid`. Same build and render commands. A single-slide deck hides the page chrome, and → walks the panels with a spotlight. The same slide can open a longer deck as its executive summary.

1. **Distill first** with [references/one-pager.md](references/one-pager.md): one answer (headline ≤ 14 words), 3–6 KPIs, 2–4 proofs written as a claim plus a visual, one ask. Everything else goes to notes.
2. **Start from the closest archetype** and edit its grid areas and content:

   | Need | Template |
   |---|---|
   | Decision brief: answer, proof, ask | `onepage/executive-summary` |
   | Metrics review (QBR, MBR) | `onepage/scorecard` |
   | Program or project status | `onepage/project-status` |
   | Strategy on a page | `onepage/strategy` |
   | Proposal with ROI | `onepage/business-case` |
   | Introduce a solution or process | `onepage/solution-overview` |
   | Software engineering case study | `onepage/case-study` |

3. **Build, audit, look**, as in the workflow. The lint budget is ≤ 200 words, 3–7 panels, ≤ 50 words per grid cell, at least half the panels visual; it errors on a broken `grid-template-areas`. Panels clip overflow, and the audit reports it. Deliver the HTML, plus `--pdf` or a `--scale 2` PNG when the page will be sent around.

## References (load on demand)

- [references/visual-selection.md](references/visual-selection.md): text-to-visual rewrites, writing rules, storyline, emphasis and color, anti-patterns. **Read once before storyboarding.**
- [references/components.md](references/components.md): layout utilities, cards, KPI tiles, tags, lists, tables, meters, compare, theming.
- [references/charts.md](references/charts.md): chart JSON per type, color and emphasis options, sizing.
- [references/diagrams.md](references/diagrams.md): flow, timeline, roadmap, layers, matrix, risk, funnel, pyramid, cycle, hub, tree, `data-links`, swimlane, sequence, inline SVG.
- [references/icons.md](references/icons.md): icon names by group and meaning conventions.
- [references/one-pager.md](references/one-pager.md): distilling to one page, archetypes, grid recipes, density, the spotlight walk-through, one-pager lint. **Read before a one-pager.**

## Runtime and themes

- **Keys:** → / Space / PgDn next · ← / PgUp back · Home / End · number + Enter jumps · **O** overview (numbered thumbnails; click one to jump) · **N** speaker notes · `#7` in the URL opens slide 7 · `?clean` hides the chrome.
- **Slide show** (PowerPoint style): **F5** from the start, **Shift+F5** / **F** / ▶ from the current slide. Fullscreen on black, no chrome, the cursor hides when idle; click or wheel advances; **B** / **W** black or white screen; Esc ends.
- **One-pager:** in a single-slide deck → walks the panels (the rest dim), then shows the whole page. In a longer deck, `data-spotlight` on the slide opts in. Clicking a panel focuses it, Esc releases. An `aside.notes` inside a panel shows while that panel is in focus.
- **Themes** (`theme=` in the config comment or `--theme`): `teal` (default), `indigo`, `dark`. Chart palettes are validated per theme for color-vision deficiency and contrast.
- Charts render from JSON at load, with hover tooltips and a hidden data table for screen readers.

## Gotchas

- Never write `--` inside an HTML comment (so no `-->` arrows in comments): it ends the comment and leaks text into the deck. The lint flags stray text.
- `data-links` node names use `data-id`, scoped to their container, so ids may repeat across slides.
- A chart needs height: put it in a stretching cell (`.split`, `.g2`, `.fill`) or give the figure `style="height:320px"`.
- Chart JSON is strict: double quotes, no trailing commas, `null` for gaps.
- Content never scrolls. When the audit or a render shows clipping, cut words or split the slide; never shrink fonts below 12px.
