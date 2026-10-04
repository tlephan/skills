#!/usr/bin/env python3
"""Build one self-contained html-deck file from slide fragments, then lint it.

Usage:
  python build_deck.py deck.slides.html -o deck.html
  python build_deck.py part1.html part2.html -o deck.html --title "Q3 Review" --theme indigo
  python build_deck.py "templates/*.html" -o showcase.html     # globs are expanded here too
  python build_deck.py --check deck.html                       # lint an existing deck, no build

A fragment holds only <section class="slide ..."> elements. Optional config comment in the
first input (CLI flags override it):
  <!-- html-deck title="Q3 Platform Review" theme="teal" footer="Platform Team · Sep 2026" lang="en" icon="rocket" -->
icon = the favicon: that sprite icon drawn white on an accent tile (default presentation).

A one-pager is a fragment with a single <section class="slide slide--onepage">; it gets its own
lint budget (words, panels, visual panels, grid areas).

Author shorthand, expanded here before lint and output:
  <i-rocket/>                 -> <svg class="i"><use href="#i-rocket"/></svg>
  <i-rocket ico="lg hot"/>    -> <span class="ico lg hot"><svg class="i">...</svg></span>   (ico alone = default tile)
  <script data-chart="line">  -> <script type="application/json" data-chart="line">  (same for data-diagram)
  <img src="shots/app.png">   -> <img src="data:image/png;base64,...">  (path relative to the fragment; png jpg gif webp svg)

Exit code: 0 = ok, 1 = lint errors (or warnings with --strict), 2 = usage / IO error.
"""
from __future__ import annotations

import argparse
import base64
import difflib
import glob
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, unquote

SKILL = Path(__file__).resolve().parent.parent
ASSETS = SKILL / "assets"
THEMES = {"teal", "indigo", "dark"}
FAVICON_BG = {"teal": "#0d9488", "indigo": "#4338ca", "dark": "#14b8a6"}  # --accent per theme
CONFIG_RE = re.compile(r"<!--\s*html-deck\b(.*?)-->", re.S)
ATTR_RE = re.compile(r'([\w-]+)\s*=\s*"([^"]*)"')
SYMBOL_RE = re.compile(r'<symbol id="(i-[\w-]+)".*?</symbol>', re.S)
IMG_SRC_RE = re.compile(r'(<img\b[^>]*?\ssrc=")([^"]+)(")', re.I)
MIME = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml"}
DECK_RE = re.compile(r'<main class="deck"[^>]*>(.*)</main>', re.S)

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
SPECIAL = {"slide--title", "slide--section", "slide--closing", "slide--statement"}
DATA_VIS = {"chart", "kpi", "kpis", "hero", "meter", "meter-row", "harvey", "spark", "gauge"}
DIAGRAM_VIS = {"flow", "timeline", "roadmap", "layers", "matrix", "risk", "funnel", "pyramid", "cycle",
               "hub", "tree", "swimlane", "diagram", "seq", "compare", "house"}
ICON_VIS = {"feature", "ico", "takeaway", "checks", "steps", "agenda", "proscons", "chip"}
SKIP_TEXT = {"notes", "note", "kicker", "slide-foot", "sr-only", "op-meta", "term"}   # term: terminal output is evidence, not prose
CHART_TYPES = {"column", "bar", "line", "area", "donut", "gauge", "scatter", "waterfall", "dumbbell", "heatmap"}
AREA_NAME = re.compile(r"^[A-Za-z_][\w-]*$")
ICON_RE = re.compile(r"<i-([a-z][\w-]*)((?:\s+[\w-]+(?:=\"[^\"]*\")?)*)\s*/?>(?:\s*</i-\1\s*>)?")
SCRIPT_TYPE_RE = re.compile(r"<script(?![^>]*\stype=)(\s[^>]*\bdata-(?:chart|diagram)=)")
NUM_RE = re.compile(r"(?<![\w.])[$€£]?\d[\d,.]*%?")
# words that assert instead of show; the lint asks for a number, a verb or a comparison instead
HYPE_RE = re.compile(r"\b(robust|seamless(?:ly)?|leverag(?:e|es|ed|ing)|world-class|best-in-class|cutting-edge|"
                     r"state-of-the-art|synerg(?:y|ies|istic)|game-chang(?:er|ing)|next-gen(?:eration)?|holistic|"
                     r"paradigm|revolutionary|innovative|empower(?:s|ed|ing)?|very|extremely|significant(?:ly)?)\b", re.I)

LIMITS = dict(words=90, title_words=14, li_items=6, li_words=18, p_words=40)
# one-pager (<section class="slide slide--onepage">): denser, but every panel is a claim + one visual
ONEPAGE = dict(words=200, title_words=16, panels=(3, 7), panel_words=50, claim_words=12)


class Slide:
    def __init__(self, n: int, classes: set[str]):
        self.n, self.classes = n, classes
        self.onepage = "slide--onepage" in classes
        self.words = 0
        self.nums = 0            # numeric tokens in body text (a text-only slide full of numbers wants KPI tiles)
        self.periods = 0         # bullets that end with a period
        self.hype: list[str] = []
        self.title = ""
        self.kinds: set[str] = set()
        self.panels: list[dict] | None = None
        self.summary = ""
        self.msgs: list[tuple[str, str]] = []

    @property
    def special(self) -> bool:
        return bool(self.classes & SPECIAL)

    def label(self) -> str:
        t = self.title.strip() or ("(" + " ".join(sorted(self.classes - {"slide"})) + ")" if self.classes - {"slide"} else "")
        return f"slide {self.n}" + (f' "{t[:48]}"' if t else "")


class Linter(HTMLParser):
    def __init__(self, icons: set[str]):
        super().__init__(convert_charrefs=True)
        self.icons = icons
        self.used_icons: set[str] = set()
        self.slides: list[Slide] = []
        self.stack: list[dict] = []
        self.global_msgs: list[tuple[str, str]] = []

    # ---- helpers
    @property
    def slide(self) -> Slide | None:
        for fr in reversed(self.stack):
            if fr.get("slide"):
                return fr["slide"]
        return None

    def msg(self, level: str, text: str):
        s = self.slide
        (s.msgs if s else self.global_msgs).append((level, text))

    def inside(self, key: str):
        for fr in reversed(self.stack):
            if fr.get(key):
                return fr
        return None

    # ---- parser callbacks
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = set((a.get("class") or "").split())
        fr = {"tag": tag, "cls": cls}
        if tag == "section" and "slide" in cls:
            fr["slide"] = Slide(len(self.slides) + 1, cls)
            self.slides.append(fr["slide"])
        s = self.slide
        parent = self.stack[-1] if self.stack else None
        if s is not None and s.onepage and "op" in cls and s.panels is None:
            fr["op"] = {"style": a.get("style") or "", "panels": []}
            s.panels = fr["op"]["panels"]
        elif parent and parent.get("op") and tag not in ("aside", "script", "style", "template"):
            op = parent["op"]
            fr["panel"] = {"n": len(op["panels"]) + 1, "cls": cls, "area": grid_area(a.get("style")),
                           "words": 0, "kinds": set(), "label": False}
            op["panels"].append(fr["panel"])
        if s is not None:
            kinds = set()
            if cls & DATA_VIS or (tag == "script" and a.get("data-chart")):
                kinds.add("data")
            if cls & DIAGRAM_VIS or "data-links" in a or (tag == "svg" and "i" not in cls) or (tag == "script" and a.get("data-diagram")):
                kinds.add("diagram")
            if cls & ICON_VIS:
                kinds.add("icon")
            if tag == "table":
                kinds.add("table")
            if tag == "img":
                kinds.add("image")
            s.kinds |= kinds
            pn = fr.get("panel") or (self.inside("panel") or {}).get("panel")
            if pn is not None:
                pn["kinds"] |= kinds
                if tag == "h3" and not fr.get("panel"):
                    pn["label"] = True
        if tag in ("script", "style") or tag == "svg" or cls & SKIP_TEXT or "sr-only" in cls:
            fr["skip"] = True
        if tag == "script" and (a.get("data-chart") or a.get("data-diagram")):
            fr["json"] = {"kind": a.get("data-chart") or a.get("data-diagram"), "diagram": bool(a.get("data-diagram")), "buf": []}
        if tag == "h2" and s is not None:
            fr["title"] = True
        if "claim" in cls:
            fr["claim"] = {"words": 0}
        if tag in ("ul", "ol"):
            fr["list"] = {"items": 0, "agenda": "agenda" in cls or "steps" in cls}
        if tag == "li":
            fr["li"] = {"words": 0, "tail": ""}
            lst = self.inside("list")
            if lst:
                lst["list"]["items"] += 1
        if tag == "p":
            fr["p"] = {"words": 0}
        if "data-links" in a:
            fr["links"] = {"spec": a["data-links"], "ids": set()}
        if "data-id" in a:
            for f in self.stack:
                if f.get("links"):
                    f["links"]["ids"].add(a["data-id"])
        for k in ("href", "xlink:href"):
            v = a.get(k) or ""
            if v.startswith("#i-"):
                name = v[1:]
                self.used_icons.add(name)
                if name not in self.icons:
                    near = difflib.get_close_matches(name, self.icons, n=3)
                    self.msg("error", f"unknown icon '{name}'" + (f" (did you mean {', '.join(near)}?)" if near else ""))
        for k in ("src", "href"):
            v = a.get(k) or ""
            if re.match(r"(https?:)?//", v) and tag in ("script", "link", "img", "iframe"):
                self.msg("warn", f"external resource <{tag} {k}=\"{v[:60]}\"> - deck is no longer self-contained/offline")
        if tag not in VOID:
            self.stack.append(fr)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack and self.stack[-1]["tag"] == tag:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i]["tag"] == tag:
                while len(self.stack) > i:
                    self._close(self.stack.pop())
                return

    def _close(self, fr):
        s = self.slide if not fr.get("slide") else fr["slide"]
        if fr.get("json"):
            self._check_json(fr["json"])
        if fr.get("list") and s and not s.special:
            lim = LIMITS["li_items"] + (2 if fr["list"]["agenda"] else 0)
            if fr["list"]["items"] > lim:
                s.msgs.append(("warn", f"list has {fr['list']['items']} items (max {lim}) - group, chart, or split"))
        if fr.get("li") and s and not s.special:
            if fr["li"]["words"] > LIMITS["li_words"]:
                s.msgs.append(("warn", f"bullet has {fr['li']['words']} words (max {LIMITS['li_words']}) - compress to a phrase"))
            s.periods += fr["li"]["tail"] == "."
        if fr.get("p") and s and not s.special and fr["p"]["words"] > LIMITS["p_words"]:
            s.msgs.append(("warn", f"paragraph has {fr['p']['words']} words (max {LIMITS['p_words']}) - cut to 1-2 lines or visualize"))
        if fr.get("claim") and s and fr["claim"]["words"] > ONEPAGE["claim_words"]:
            s.msgs.append(("warn", f"panel claim has {fr['claim']['words']} words (max {ONEPAGE['claim_words']}) - one short claim per panel"))
        if fr.get("op") and s:
            self._check_op(fr["op"], s)
        if fr.get("links"):
            self._check_links(fr["links"], s)
        if fr.get("slide"):
            self._check_slide(fr["slide"])

    def handle_data(self, data):
        js = self.inside("json")
        if js:
            js["json"]["buf"].append(data)
            return
        if self.inside("skip"):
            return
        s = self.slide
        if s is None:
            if data.strip():
                self.global_msgs.append(("warn", f"text outside any slide: '{data.strip()[:50]}' - often a '-->' inside an HTML comment"))
            return
        n = len(re.findall(r"[^\W_]+(?:['’-][^\W_]+)*", data))
        if not n:
            return
        s.hype += [w.lower() for w in HYPE_RE.findall(data)]
        if self.inside("title"):
            s.title += data
            return
        s.words += n
        s.nums += len(NUM_RE.findall(data))
        for key in ("li", "p", "panel", "claim"):
            f = self.inside(key)
            if f:
                f[key]["words"] += n
                if key == "li" and data.strip():
                    f[key]["tail"] = data.rstrip()[-1]

    # ---- checks
    def _check_slide(self, s: Slide):
        if s.hype:
            seen = sorted(set(s.hype), key=s.hype.index)
            s.msgs.append(("warn", f"hype words ({', '.join(seen)}) - replace with a number, a concrete verb or a comparison"))
        if s.special:
            return
        lim = ONEPAGE if s.onepage else LIMITS
        tw = len(s.title.split())
        if not s.title.strip():
            s.msgs.append(("warn", "no <h2> action title - every content slide states its takeaway"))
        elif tw > lim["title_words"]:
            s.msgs.append(("warn", f"title has {tw} words (max {lim['title_words']}) - tighten the takeaway"))
        elif tw <= 2:
            s.msgs.append(("warn", "title reads like a topic label - state the takeaway (e.g. 'Coverage rose to 81% after pilot')"))
        elif s.title.strip().endswith("."):
            s.msgs.append(("warn", "title ends with a period - titles are claims, not sentences"))
        if s.words > lim["words"]:
            s.msgs.append(("warn", f"{s.words} words on slide (max {lim['words']}) - move detail to notes or visualize"))
        if s.periods >= 2:
            s.msgs.append(("warn", f"{s.periods} bullets end with a period - write phrases, no terminal periods"))
        if s.onepage:
            if s.panels is None:
                s.msgs.append(("error", "slide--onepage needs a <div class=\"op\"> panel grid"))
            else:
                strong = sum(1 for p in s.panels if p["kinds"] & {"data", "diagram"})
                s.summary = f"one-pager: {len(s.panels)} panels, {strong} with charts/KPIs/diagrams, {s.words}/{ONEPAGE['words']} words"
        elif not s.kinds or s.kinds == {"table"} and s.words > 70:
            hint = f"; its {s.nums} numbers belong in KPI tiles or a chart" if s.nums >= 3 else ""
            s.msgs.append(("warn", "text-only slide - replace prose with a chart, diagram, KPI tiles or icon layout" + hint))

    def _check_op(self, op, s: Slide):
        panels = op["panels"]
        lo, hi = ONEPAGE["panels"]
        name = lambda p: f"'{p['area']}'" if p["area"] else f"#{p['n']}"
        if not lo <= len(panels) <= hi:
            s.msgs.append(("warn", f"one-pager has {len(panels)} panels (use {lo}-{hi}) - " +
                           ("merge or cut; the rest belongs in a deck" if len(panels) > hi else "a regular slide fits this")))
        cells = self._check_areas(op, s, name)
        for p in panels:
            n = cells.get(p["area"], 1)
            budget = ONEPAGE["panel_words"] * n   # a panel spanning more grid cells may hold more
            if p["words"] > budget:
                s.msgs.append(("warn", f"panel {name(p)} has {p['words']} words (max {budget} for {n} grid cell{'s' * (n > 1)}) - keep one claim and one visual"))
            if not p["label"] and not p["cls"] & {"kpis", "house", "bare"}:
                s.msgs.append(("warn", f"panel {name(p)} has no <h3> label"))
        strong = [p for p in panels if p["kinds"] & {"data", "diagram"}]
        need = max(2, (len(panels) + 1) // 2)
        if len(strong) < need:
            s.msgs.append(("warn", f"{len(strong)} of {len(panels)} panels carry a chart, KPI or diagram (min {need}) - distill evidence into visuals"))
        text_only = [name(p) for p in panels if not p["kinds"]]
        if len(text_only) > 1:
            s.msgs.append(("warn", f"text-only panels {', '.join(text_only)} - keep at most one (the ask)"))

    def _check_areas(self, op, s: Slide, name) -> dict[str, int]:
        """Validate the named grid; return the number of cells each area spans."""
        style, panels = op["style"], op["panels"]
        used = [p["area"] for p in panels if p["area"]]
        m = re.search(r"grid-template-areas\s*:\s*([^;]+)", style)
        if not m:
            if used:
                s.msgs.append(("error", f"panels use grid-area ({', '.join(used)}) but .op has no grid-template-areas"))
            return {}
        rows = [r.split() for r in re.findall(r"[\"']([^\"']*)[\"']", m.group(1))]
        if not rows or not all(rows):
            s.msgs.append(("error", "grid-template-areas has an empty row"))
            return {}
        if len({len(r) for r in rows}) > 1:
            s.msgs.append(("error", f"grid-template-areas rows have {'/'.join(str(len(r)) for r in rows)} cells - "
                                    "every row needs the same count or the browser drops the layout"))
            return {}
        cells: dict[str, list[tuple[int, int]]] = {}
        for y, r in enumerate(rows):
            for x, cell in enumerate(r):
                if not re.fullmatch(r"\.+", cell):
                    cells.setdefault(cell, []).append((y, x))
        for area, pts in cells.items():
            ys, xs = [p[0] for p in pts], [p[1] for p in pts]
            if len(pts) != (max(ys) - min(ys) + 1) * (max(xs) - min(xs) + 1):
                s.msgs.append(("error", f"grid area '{area}' is not a rectangle - the browser drops the whole layout"))
        for p in panels:
            if not p["area"]:
                s.msgs.append(("warn", f"panel #{p['n']} has no grid-area - with named areas, place every panel"))
            elif p["area"] not in cells:
                s.msgs.append(("error", f"panel {name(p)} uses grid-area '{p['area']}', which grid-template-areas does not define"))
        for area in cells:
            if used.count(area) > 1:
                s.msgs.append(("warn", f"{used.count(area)} panels share grid area '{area}' and overlap"))
            elif area not in used:
                s.msgs.append(("warn", f"grid area '{area}' has no panel - it renders as an empty hole"))
        for prop, want in (("grid-template-columns", len(rows[0])), ("grid-template-rows", len(rows))):
            mm = re.search(prop + r"\s*:\s*([^;]+)", style)
            got = count_tracks(mm.group(1)) if mm else None
            if got is not None and got != want:
                s.msgs.append(("warn", f"{prop} has {got} tracks but grid-template-areas has {want}"))
        return {area: len(pts) for area, pts in cells.items()}

    def _check_links(self, lk, s):
        for raw in re.split(r"[;\n]+", lk["spec"]):
            raw = raw.strip()
            if not raw:
                continue
            m = re.match(r"^([\w.-]+)\s*(<-->|<->|<=>|-->|->|=>|--|>)\s*([\w.-]+)\s*(?:\[([hv])\])?\s*(?::\s*(.*))?$", raw)
            target = s.msgs if s else self.global_msgs
            if not m:
                target.append(("error", f"bad data-links entry '{raw}' (use 'a -> b [h|v] : label')"))
                continue
            for end in (m.group(1), m.group(3)):
                if end not in lk["ids"]:
                    target.append(("error", f"data-links references '{end}' but no data-id=\"{end}\" inside the container"))

    def _check_json(self, js):
        kind, raw = js["kind"], "".join(js["buf"])
        try:
            cfg = json.loads(raw)
        except json.JSONDecodeError as e:
            self.msg("error", f"{kind} JSON invalid: {e.msg} at line {e.lineno} col {e.colno}")
            return
        if js["diagram"]:
            if kind != "sequence":
                self.msg("error", f"unknown data-diagram '{kind}' (supported: sequence)")
                return
            actors = set(cfg.get("actors") or [])
            for i, st in enumerate(cfg.get("steps") or [], 1):
                ends = st[:2] if isinstance(st, list) else [st.get("from"), st.get("to")]
                for e in ends:
                    if e not in actors:
                        self.msg("error", f"sequence step {i} uses actor '{e}' not in actors")
            return
        if kind not in CHART_TYPES:
            self.msg("error", f"unknown chart type '{kind}' (supported: {', '.join(sorted(CHART_TYPES))})")
            return
        labels = cfg.get("labels")
        series = cfg.get("series") or ([{"values": cfg["values"]}] if "values" in cfg else [])
        if kind in {"column", "bar", "line", "area", "dumbbell", "waterfall", "donut"}:
            if not isinstance(labels, list) or not labels:
                self.msg("error", f"{kind}: 'labels' must be a non-empty list")
                return
            vals = cfg.get("values") if kind in ("waterfall", "donut") and "values" in cfg else None
            if vals is not None and len(vals) != len(labels):
                self.msg("error", f"{kind}: {len(vals)} values for {len(labels)} labels")
            for s_ in series if vals is None else []:
                v = s_.get("values") or []
                if len(v) != len(labels):
                    self.msg("error", f"{kind}: series '{s_.get('name', '?')}' has {len(v)} values for {len(labels)} labels")
            if len(series) > 8:
                self.msg("error", f"{kind}: {len(series)} series - max 8; fold the tail into 'Other' or use small multiples")
            if kind == "line" and len(series) > 4:
                self.msg("warn", "line: more than 4 series - lines tangle; highlight one or facet")
            if kind == "donut" and len(labels) > 6:
                self.msg("warn", f"donut: {len(labels)} segments - max 6; use a bar chart")
            if kind == "dumbbell" and len(series) != 2:
                self.msg("error", "dumbbell: needs exactly 2 series (before, after)")
            if kind in ("column", "bar") and len(labels) > 16:
                self.msg("warn", f"{kind}: {len(labels)} categories - aggregate or show top N")
        elif kind == "scatter":
            ss = cfg.get("series") or []
            if not ss or not all(isinstance(x.get("points"), list) for x in ss):
                self.msg("error", "scatter: 'series' needs [{name, points:[[x,y,(size),(label)],...]}]")
            elif len(ss) > 3:
                self.msg("warn", "scatter: more than 3 series - colors stop being distinguishable; facet or fold")
        elif kind == "gauge":
            if not isinstance(cfg.get("value"), (int, float)):
                self.msg("error", "gauge: numeric 'value' required")
        elif kind == "heatmap":
            rows, cols, vals = cfg.get("rows") or [], cfg.get("cols") or [], cfg.get("values") or []
            if len(vals) != len(rows) or any(len(r) != len(cols) for r in vals):
                self.msg("error", f"heatmap: values must be {len(rows)} rows x {len(cols)} cols")


def grid_area(style: str | None) -> str:
    m = re.search(r"grid-area\s*:\s*([^;]+)", style or "")
    v = m.group(1).strip() if m else ""
    return v if AREA_NAME.match(v) else ""


def count_tracks(value: str) -> int | None:
    """Number of tracks in a grid-template-columns/rows value; None when it can't tell (auto-fill, subgrid...)."""
    tokens, buf, depth = [], "", 0
    for ch in value.strip():
        depth += (ch == "(") - (ch == ")")
        if ch.isspace() and depth == 0:
            if buf:
                tokens.append(buf)
            buf = ""
        else:
            buf += ch
    if buf:
        tokens.append(buf)
    total = 0
    for t in tokens:
        m = re.fullmatch(r"repeat\(\s*(\d+)\s*,(.*)\)", t, re.S)
        if m:
            inner = count_tracks(m.group(2))
            if inner is None:
                return None
            total += int(m.group(1)) * inner
        elif t.startswith("repeat(") or t in ("subgrid", "none", "masonry"):
            return None
        elif not t.startswith("["):
            total += 1
    return total


def expand(inputs: list[str]) -> list[Path]:
    out: list[Path] = []
    for i in inputs:
        hits = sorted(glob.glob(i)) if any(c in i for c in "*?[") else [i]
        if not hits:
            raise SystemExit(f"error: no files match {i}")
        out += [Path(h) for h in hits]
    return out


def expand_shorthand(text: str) -> str:
    """Expand <i-NAME/> / <i-NAME ico="..."/> icons and add the JSON type to <script data-chart|data-diagram>."""
    def icon(m: re.Match) -> str:
        attrs = {k: v for k, v in re.findall(r'([\w-]+)(?:="([^"]*)")?', m.group(2))}
        svg = f'<svg class="i{" " + attrs["class"] if attrs.get("class") else ""}"><use href="#i-{m.group(1)}"/></svg>'
        if "ico" in attrs:
            return f'<span class="ico{" " + attrs["ico"] if attrs["ico"] else ""}">{svg}</span>'
        return svg
    text = ICON_RE.sub(icon, text)
    return SCRIPT_TYPE_RE.sub(r'<script type="application/json"\1', text)


def inline_images(text: str, base: Path, missing: list[str]) -> str:
    """<img src="shots/app.png"> -> data: URI, so the deck stays one offline file. Remote and data: srcs are left alone."""
    def sub(m: re.Match) -> str:
        src = m.group(2)
        if re.match(r"(data:|https?:|//|#)", src, re.I):
            return m.group(0)
        f = base / unquote(src)
        mime = MIME.get(f.suffix.lower())
        if not mime or not f.is_file():
            missing.append(src)
            return m.group(0)
        return f"{m.group(1)}data:{mime};base64,{base64.b64encode(f.read_bytes()).decode()}{m.group(3)}"
    parts = re.split(r"(<!--.*?-->)", text, flags=re.S)   # leave <img> examples inside comments alone
    return "".join(p if p.startswith("<!--") else IMG_SRC_RE.sub(sub, p) for p in parts)


def fragment(text: str) -> str:
    m = DECK_RE.search(text)
    body = m.group(1) if m else text
    return expand_shorthand(CONFIG_RE.sub("", body).strip())


def lint(slides_html: str, icons: set[str]):
    p = Linter(icons)
    p.feed(slides_html)
    p.close()
    return p


def report(p: Linter, strict: bool) -> int:
    errors = warns = 0
    for level, text in p.global_msgs:
        print(f"  {level.upper():5} {text}")
        errors += level == "error"
        warns += level == "warn"
    for s in p.slides:
        for level, text in s.msgs:
            print(f"  {level.upper():5} {s.label()}: {text}")
            errors += level == "error"
            warns += level == "warn"
        if s.summary:
            print(f"  {'INFO':5} {s.label()}: {s.summary}")
    content = [s for s in p.slides if not s.special]
    visual = [s for s in content if s.kinds - {"table"}]
    strong = [s for s in content if s.kinds & {"data", "diagram"}]
    if not p.slides:
        print("  ERROR no <section class=\"slide\"> found")
        errors += 1
    if content:
        cov, strong_cov = len(visual) / len(content), len(strong) / len(content)
        avg = sum(s.words for s in content) / len(content)
        print(f"  visual coverage {cov:.0%} ({len(visual)}/{len(content)} content slides); charts/diagrams on {strong_cov:.0%}; "
              f"avg {avg:.0f} words/slide")
        if cov < 0.8:
            print("  WARN  visual coverage below 80% - convert text slides using references/visual-selection.md")
            warns += 1
    print(f"  {errors} error(s), {warns} warning(s)")
    return 1 if errors or (strict and warns) else 0


def favicon(symbol: str, bg: str) -> str:
    """Inline SVG data URI (offline): rounded accent tile with the sprite icon stroked white."""
    inner = re.sub(r"^<symbol[^>]*>|</symbol>$", "", symbol).replace('"', "'")
    svg = (f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='5' fill='{bg}'/>"
           "<g transform='translate(4 4) scale(.6667)' fill='none' stroke='#fff' stroke-width='2.6' "
           f"stroke-linecap='round' stroke-linejoin='round'>{inner}</g></svg>")
    return "data:image/svg+xml," + quote(svg, safe=" /:=',.-()")


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("inputs", nargs="+", help="slide fragment file(s) or globs, in order")
    ap.add_argument("-o", "--out", help="output .html (default: <first input stem>.html, '.slides' removed)")
    ap.add_argument("--title", help="document <title>")
    ap.add_argument("--theme", help="teal (default) | indigo | dark")
    ap.add_argument("--footer", help="footer text on content slides (left side)")
    ap.add_argument("--lang", help="html lang attribute (default en)")
    ap.add_argument("--icon", help="favicon: a sprite icon name (default presentation)")
    ap.add_argument("--check", action="store_true", help="lint only; do not write output")
    ap.add_argument("--strict", action="store_true", help="treat warnings as errors")
    ap.add_argument("--all-icons", action="store_true", help="embed the whole icon sprite instead of only used icons")
    args = ap.parse_args()

    try:
        files = expand(args.inputs)
        texts = [f.read_text(encoding="utf-8") for f in files]
        css = (ASSETS / "deck.css").read_text(encoding="utf-8")
        js = (ASSETS / "deck.js").read_text(encoding="utf-8")
        shell = (ASSETS / "shell.html").read_text(encoding="utf-8")
        sprite = (ASSETS / "icons.svg").read_text(encoding="utf-8")
    except (OSError, SystemExit) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2

    cfg: dict[str, str] = {}
    m = CONFIG_RE.search(texts[0])
    if m:
        cfg = dict(ATTR_RE.findall(m.group(1)))
    for k in ("title", "theme", "footer", "lang", "icon"):
        if getattr(args, k):
            cfg[k] = getattr(args, k)
    theme = cfg.get("theme", "teal")
    if theme not in THEMES:
        print(f"error: theme '{theme}' not in {sorted(THEMES)}", file=sys.stderr)
        return 2

    missing: list[str] = []
    slides_html = "\n\n".join(fragment(inline_images(t, f.parent, missing)) for f, t in zip(files, texts))
    if missing:
        for src in missing:
            print(f"error: image '{src}' not found or not png/jpg/gif/webp/svg (paths are relative to the fragment)", file=sys.stderr)
        return 2
    symbols = {m.group(1): m.group(0) for m in SYMBOL_RE.finditer(sprite)}
    icon = "i-" + cfg.get("icon", "presentation")
    if icon not in symbols:
        print(f"error: icon '{icon[2:]}' is not in the sprite (references/icons.md)", file=sys.stderr)
        return 2
    p = lint(slides_html, set(symbols))

    if args.check:
        print(f"Checked {', '.join(str(f) for f in files)} · {len(p.slides)} slides")
        return report(p, args.strict)

    out = Path(args.out) if args.out else files[0].with_name(files[0].name.replace(".slides", "").rsplit(".", 1)[0] + ".html")
    if out.resolve() in {f.resolve() for f in files}:
        print("error: output would overwrite an input; pass -o", file=sys.stderr)
        return 2
    used = symbols.keys() if args.all_icons else [n for n in symbols if n in p.used_icons]
    title = cfg.get("title") or (p.slides[0].title.strip() if p.slides and p.slides[0].title.strip() else out.stem)
    if not cfg.get("title"):
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", slides_html, re.S)
        if h1:
            title = re.sub(r"<[^>]+>", "", h1.group(1)).strip() or title
    doc = (shell.replace("{{LANG}}", html.escape(cfg.get("lang", "en")))
                .replace("{{THEME}}", theme)
                .replace("{{TITLE}}", html.escape(title))
                .replace("{{FOOTER}}", html.escape(cfg.get("footer", ""), quote=True))
                .replace("{{FAVICON}}", favicon(symbols[icon], FAVICON_BG[theme]))
                .replace("{{ICONS}}", "\n".join(symbols[n] for n in used))
                .replace("{{CSS}}", css)
                .replace("{{JS}}", js)
                .replace("{{SLIDES}}", slides_html))
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(doc, encoding="utf-8")
    kb = len(doc.encode("utf-8")) / 1024
    print(f"Built {out} · {len(p.slides)} slides · {kb:.0f} KB · theme {theme} · icons {len(used)}/{len(symbols)}")
    return report(p, args.strict)


if __name__ == "__main__":
    sys.exit(main())
