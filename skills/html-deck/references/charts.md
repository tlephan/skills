# Charts

Charts are declared as JSON and drawn as SVG by `deck.js` at load time. You get no library, no network, hover tooltips, and a hidden data table for screen readers.

```html
<figure class="chart">                                   <!-- needs height: see Sizing -->
  <figcaption>What is measured, unit <small>Period · source</small></figcaption>
  <script data-chart="line">{ …config… }</script>
</figure>
```

## Contents
- Sizing
- Common options
- Colors & emphasis
- Types: column · bar · line / area · donut · gauge · scatter · waterfall · dumbbell · heatmap · sparkline
- Rules the lint enforces

## Sizing

The figure is a flex column: caption, then legend (added automatically for ≥ 2 series), then the plot, which fills the remaining height. Give the figure height in one of these ways:
- put it in a stretching cell (`.split`, `.g2`, `.g3`, or a `.fill` inside `.body`), or
- set it inline: `<figure class="chart" style="height:320px">`, or pass `"height": 280` in the JSON (plot height in px).

Leave out a figure height and the plot falls back to 260px. The layout is fixed at 1280×720, so charts draw once and scale with the stage.

## Common options

| Key | Type | Meaning |
|---|---|---|
| `labels` | string[] | Categories / x positions |
| `series` | `[{name, values, color?, dashed?}]` | Data series (values align with `labels`; `null` = gap; `dashed` = plan/forecast line) |
| `values` | number[] | Shorthand for a single unnamed series |
| `prefix` / `suffix` (`unit`) | string | Value formatting: `"$"`, `"%"`, `" ms"` |
| `decimals` | number | Fixed decimals (default: up to 1) |
| `compact` | bool | 1.2K / 4.5M notation |
| `min` / `max` / `ticks` | number | Axis range; tick count (default 5) |
| `highlight` | label, index, or series name (or array) | Emphasis: everything else turns gray |
| `target`, `targetLabel` | number, string | Dashed reference line with label (column, bar, line, area, gauge) |
| `valueLabels` | `"all"` \| `"none"` \| `"highlight"` | Column: which bars get cap labels. Bar: `"none"` hides tip labels |
| `barWidth` | px | Bar thickness cap (defaults 22–32 by type) |

## Colors & emphasis

- Series get palette slots `c1…c8` in order. The order is validated for color-vision deficiency and contrast in every theme, so never reorder it for looks. Keep a series in the same position across slides so its color stays stable.
- Override per series with `"color"`: a slot number `3`, `"c3"`, a role (`"accent"`, `"alt"`, `"hot"`, `"other"`), status (`"ok"`, `"warn"`, `"bad"`, only when the series *means* status), or any CSS color.
- **Emphasis form:** single series + `"highlight":["EU"]` colors EU and grays the rest. Multi-series + `"highlight":"2026"` keeps 2026 in color. Prior periods can use `"color":"other"`.
- Text never takes the series color. Labels and legends use ink tokens, and a swatch carries the identity.

## Types

### column: vertical bars, grouped or stacked
```json
{"labels":["Q1","Q2","Q3","Q4 plan"],
 "series":[{"name":"2025","values":[820,860,910,1380],"color":"other"},{"name":"2026","values":[1010,1120,1255,1900],"color":"c1"}],
 "valueLabels":"all","barWidth":44}
```
`"stacked": true` stacks segments and labels the totals. Negative values grow down from zero. A single series labels every cap by default.

### bar: horizontal (ranked lists, long labels, 100% mix)
```json
{"labels":["Unexpected shipping cost","Forced account creation","Payment declined"],"values":[34,24,14],"suffix":"%","highlight":[0,1]}
```
`"stacked": true` stacks segments and labels totals. `"percent": true` normalizes each row to 100% (part-to-whole by segment) and labels segments inside only when the label fits. `"target"` draws a vertical dashed line.

### line / area: trends
```json
{"labels":["Jan","Feb","Mar","Apr"],"series":[{"name":"Checkout","values":[38,45,52,58]},{"name":"Payments","values":[35,38,40,44]}],
 "suffix":"%","min":0,"max":100,"target":80,"annotations":[{"x":"Mar","label":"Pilot starts"}]}
```
- Draws 2px lines with an end dot. End labels show the series name and last value, and fall back to the legend if they would collide. Only series that reach the last label get an end label; a series that stops early is named by the legend.
- **Actual vs plan:** end the actual series with `null`s. Start the plan at the last actual point, in the same color with `"dashed": true`, so the dashed segment reads as the projection:
  `[{"name":"Actual","values":[61.1,61.2,63.6,null,null]},{"name":"Plan","values":[null,null,63.6,65.3,68],"color":"c1","dashed":true}]`
- A hover crosshair lists every series at that x.
- `area` fills under each series at 12% opacity. Use it for one series, or for totals starting at zero.
- The axis starts at 0 unless the data sits far above it. Set `min` explicitly for tight ranges, and say so in the caption.

### donut: part-to-whole at a glance (≤ 6 parts)
```json
{"labels":["Card","Wallet","BNPL","Bank transfer"],"values":[52,31,11,6],"suffix":"%","showValues":false,"center":{"value":"2.9M","label":"orders"}}
```
The legend on the right lists value and share. Options: `showPercent:false`, `showValues:false` (share only), `colors:[…]`, `thickness:0.3`, `highlight`. Near-equal parts belong in a bar chart instead.

### gauge: one ratio against a limit
```json
{"value":72,"suffix":"%","target":90,"targetLabel":"Dec target","label":"of orders"}
{"value":18,"max":24,"label":"of 24 services"}
{"value":64,"suffix":"%","tone":"warn","label":"of 41 TB"}
```
`tone` (`ok` / `warn` / `bad`) colors the fill and track by status. Otherwise the fill uses the accent on a lighter track of the same hue. Put 2–4 gauges in a `.g3`/`.g4` with a fixed height (~220–260px).

### scatter: two measures per item, optional bubble size
```json
{"series":[{"name":"Checkout UX","points":[[2,8.2,40,"Guest checkout"],[7.5,6.4,30]]},{"name":"Payments","points":[[3.2,8.8,35,"Wallet default"]]}],
 "xLabel":"Effort (engineer-weeks)","yLabel":"Value score","xMin":0,"xMax":10,"yMin":0,"yMax":10,
 "quadrants":[5,5],"quadrantLabels":["Quick wins","Big bets","Fill-ins","Money pits"]}
```
- Points are `[x, y, size?, label?]`, and only labeled points show text, so label the ones you discuss.
- Use ≤ 3 series, since four or more stop being distinguishable in a scatter.
- `xFormat` / `yFormat` take `{prefix, suffix, decimals}`.

### waterfall: bridge from start to end
```json
{"labels":["Q2 cost","Traffic growth","Rightsizing","Reserved capacity","Q3 cost"],"values":[4.8,0.9,-0.8,-0.6,null],"totals":[0,4],"prefix":"$","suffix":"M","decimals":1}
```
`totals` lists the indices of absolute bars; `null` means "running total here". Deltas are drawn from the running level: increases in `--pos`, decreases in `--neg`, totals in `--c-total`, with signed labels.

### dumbbell: before → after per item
```json
{"labels":["Checkout","Payments","Search"],"series":[{"name":"Q1","values":[9.5,12,6]},{"name":"Q3","values":[3,7.5,2.5]}],"suffix":" d","decimals":1}
```
Needs exactly two series. The first is gray and the second accent unless colors are given. The "after" value is labeled bold.

### heatmap: magnitude on a grid
```json
{"rows":["Payments","Cart"],"cols":["S14","S15","S16"],"values":[[3,11,4],[2,5,2]],"scaleLabel":"defects"}
```
Single-hue sequential ramp (`--seq-lo → --seq-mid → --seq-hi`), with values printed in contrast-aware ink and a scale legend below. `showValues:false` hides the numbers.

### sparkline: inline trend (no JSON)
```html
<span class="spark" data-values="12,14,15,22,27,31,36,41" data-width="96" data-height="28"></span>
```

## Rules the lint enforces

| Rule | Level |
|---|---|
| JSON parses; `type` is known | error |
| Each series has one value per label; heatmap rows × cols match | error |
| ≤ 8 series; dumbbell exactly 2 | error |
| Donut ≤ 6 segments · scatter ≤ 3 series · line ≤ 4 series · ≤ 16 categories | warn |

The deck has no dual-axis type, by design. When two measures have different scales, use two charts side by side (`.g2`) or index both to 100.
