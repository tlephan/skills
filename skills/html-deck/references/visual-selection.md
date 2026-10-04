# Visual selection & writing

How to turn content into slides that are read in seconds. Use it while storyboarding, before writing HTML.

## 1. Pick the visual from the content's shape

Ask what the reader must *do* with this slide (compare, follow, decide, remember one number), then pick the row in the template catalog in `SKILL.md`. Two more tests before you commit to a row:

- **What is the difference?** The visual must make it visible: the gap to target, the one outlier, the edge an option removes. Highlight that one element and gray the rest.
- **Would a sentence say it faster?** Then write the sentence as a `.callout` beside the evidence and move on. A visual that only decorates a claim costs attention.
- **Two ideas on one slide?** Split it. One title, one visual, one message.

## 2. Rewrite text into visuals

| Text you were about to write | Replace with |
|---|---|
| "Step 1 … Step 6" bullets | `.flow` chevrons, step name + 2-word detail each |
| A paragraph full of numbers | KPI tiles, or one chart with the key number in the title |
| "Phase 1 / 2 / 3" table with goals and deliverables | `.timeline` or `.roadmap`; deliverables as short labels |
| "We adopt X, skip Y, defer Z" lists | Comparison table with `tag ok / bad / warn`, or three cards with tags |
| Pros bullets then cons bullets | `.proscons` + one-line recommendation callout |
| "A maps to B" table | Two-column table with a highlighted row, or a boxes & arrows diagram |
| "The system has A, B, C talking to D" | `.diagram` with `data-links` and labeled arrows |
| Problem → gap list | Flow with a broken step (`.step.hot`) + gap cards tagged `GAP` |
| A quote to anchor the point | `.quote` beside the evidence, not on its own slide |
| An agenda of topics | Agenda of *questions* + "the ask" card |
| Metrics described in prose ("coverage improved a lot") | Tile: `81%` · `▲ 43 pts vs Jan` · target tag |

The reference PDLC deck followed this pattern. Its lifecycle was a chevron flow and its gaps were tagged cards. The weaker slides were the long bullet lists (the pros, the 6-step workflow), and each of those maps to a row above.

## 3. Writing rules (professional, not verbal)

- **Action titles.** State the conclusion in a full sentence of ≤ 12 words, including the number. ✗ *"Latency"* ✓ *"EU latency is the one missed target"*.
- **Kicker** = `Section · Topic`, 2–4 words. **Lede** is optional, one line, never a second title.
- **Budget:** ≤ 60 words of body text per slide. Use ≤ 4 bullets per list and ≤ 12 words per bullet. Paragraphs run ≤ 2 lines. Lint thresholds are 90 words per slide, 18 per bullet and 40 per paragraph.
- **Phrases, not sentences,** inside visuals and bullets: *"Ships Nov 4 · legal approved"*. No terminal periods (the lint warns when bullets end with one).
- **Specific numbers** carry a unit and a base: *480 ms (target 400)*, *+2.4 pts vs Q2*, *n = 4,812*. Round to what matters.
- **Verbs over adjectives.** Cut *very, significant, robust, seamless, leverage, best-in-class, cutting-edge, synergy, world-class, innovative, empower* (the lint lists any it finds). Replace each with the number or the concrete change: *"seamless checkout"* → *"one-tap checkout, 3 fields fewer"*.
- **Consistent terms.** Name a thing once and reuse that name on every slide, in every chart label and legend.
- **Sources and caveats** go in `figcaption small` or `.note`. Put what you would *say* in `<aside class="notes">`.
- **No filler slides.** Skip a standalone "Questions?". End on a `slide--closing` *Thank you* slide that restates the ask, not on the decision slide. Skip an agenda for decks under 8 slides.
- **Sentence case** everywhere. Kickers and tags are uppercased by CSS; don't type caps.

## 4. Storyline

- **Answer first.** The title-slide subtitle and the agenda's "ask" card state the conclusion before the evidence.
- A default arc: **Context → Insight / problem → Proposal → Plan → Risks → Decision → Thank you** (closing). Every slide title, read in sequence, should tell the story alone. Run that test on the storyboard.
- Use section dividers (`03-section`) only for decks over ~12 slides, and phrase each one as the question the section answers.
- Put an appendix after the *Thank you* closing slide for detail tables you might be asked about; list sources there with `36-references`.
- If the audience needs the whole story at a glance (pre-read, executive, status), open with a one-pager as slide 2, or ship it alone. See [one-pager.md](one-pager.md).

## 5. Emphasis & color

| Token | Means | Typical use |
|---|---|---|
| `accent` | the focus, our proposal | highlighted bar/series, `.q.hl`, recommended column |
| `alt` | a second category | secondary steps, context layers |
| `hot` | new, changed, needs attention | `.node.new`, `.chip.new`, `.step.hot`, "now" milestone |
| `ok` / `warn` / `bad` | status only, always with a text tag or icon | KPI status, readiness tags, risk grid |
| `other` (gray) | context, prior period, "the rest" | non-highlighted bars, last year's series |

In charts, emphasis beats variety: one highlighted series plus gray usually says more than eight colors. Series colors follow a fixed validated order, so pass the same series in the same order on every slide to keep an entity's color stable.

## 6. Anti-patterns

- A slide that is only a bullet list, or a bullet list with a decorative icon.
- A table where a chart would show the pattern; a table under 3×3 that should be tiles.
- Two messages on one slide, or a title that restates the kicker.
- A dual-axis chart; a donut with > 6 slices or near-equal parts; a rainbow of series colors.
- Text over ~90 words, fonts shrunk below 12 px to fit, content running into the footer.
- Status colors used for decoration; red/green as the only signal.
- Remote fonts, CDN scripts or hot-linked images.
