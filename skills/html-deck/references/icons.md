# Icons

88 stroke icons on a 24×24 grid, drawn in `currentColor` (`assets/icons.svg`). Write them with the shorthand; the build expands it, embeds only the icons a deck uses, and errors on unknown names with close matches. See the whole set in `examples/icons.html`.

```html
<i-rocket/>                    <!-- inline, 1em: in headings, tags, chips, list items, flow steps -->
<i-rocket ico/>                <!-- 44px tinted tile: takeaways, features, boxes, nodes -->
<i-rocket ico="lg hot"/>       <!-- tile modifiers: sm | lg | round | solid | alt | hot | ok | warn | bad | ghost -->
```
The long form `<svg class="i"><use href="#i-rocket"/></svg>` still works; `<i-rocket class="x"/>` adds a class to the svg.

| Group | Names (use as `<i-NAME/>`) |
|---|---|
| Status & signals | `check` `x` `plus` `minus` `check-circle` `x-circle` `alert` `info` `help` `ban` `star` `flag` `bell` |
| Arrows & trends | `arrow-right` `arrow-left` `arrow-up` `arrow-down` `arrow-up-right` `chevron-right` `trend-up` `trend-down` `refresh` `route` `upload` `download` `play` |
| Business & strategy | `target` `trophy` `award` `rocket` `lightbulb` `dollar` `percent` `briefcase` `building` `users` `user` `scale` `compass` `map-pin` `globe` `leaf` `calendar` `clock` `gauge` `chart-bar` `chart-line` `chart-pie` `mail` `chat` `tag` |
| Work & knowledge | `search` `filter` `eye` `list` `grid` `layers` `file` `file-text` `folder` `clipboard-check` `book` `workflow` `sliders` `gear` |
| Technology | `code` `terminal` `database` `server` `cloud` `cpu` `git-branch` `plug` `link` `network` `box` `lock` `key` `shield` `shield-check` `bug` `flask` `zap` `sparkles` `bot` `monitor` `presentation` `smartphone` |

**Meaning conventions:** `check-circle` / `x-circle` / `alert` for status · `trend-up` / `trend-down` for direction · `zap` for a fix or quick win · `flag` for a decision or milestone · `target` for a goal · `lightbulb` for an insight · `shield-check` for security or compliance · `flask` for testing · `box` for a service · `layers` for a queue, bus or stack · `database` for a store.

**Adding an icon:** append `<symbol id="i-name" viewBox="0 0 24 24">…</symbol>` to `assets/icons.svg`. Use stroke paths only, no fills, and keep the drawing inside 2–22 so the 2px stroke isn't clipped.
