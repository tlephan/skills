#!/usr/bin/env python3
"""Screenshot or print a built html-deck with headless Chrome / Edge / Chromium.

Usage:
  python render_slides.py deck.html                     # every slide -> deck-shots/slide-01.png ...
  python render_slides.py deck.html --slides 3,5-7      # a subset (1-based)
  python render_slides.py deck.html --overview          # one contact sheet of all slides
  python render_slides.py deck.html --scale 2           # 2560x1440 PNGs (crisp one-pager images)
  python render_slides.py deck.html --pdf               # deck.pdf, one 1280x720 page per slide
  python render_slides.py deck.html --audit             # layout audit: overflow, clipping, footer collisions, tiny text
  python render_slides.py deck.html --out shots --jobs 6

Run --audit first; it lists the slides and elements that need fixing, so you only render what it flags.

Browser lookup: $HTML_DECK_BROWSER, then Chrome, Edge, Chromium in their usual install locations / PATH.
"""
from __future__ import annotations

import argparse
import html
import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


def find_browser() -> str | None:
    env = os.environ.get("HTML_DECK_BROWSER")
    if env and Path(env).exists():
        return env
    cands: list[str] = []
    if sys.platform.startswith("win"):
        for base in filter(None, [os.environ.get("PROGRAMFILES"), os.environ.get("PROGRAMFILES(X86)"), os.environ.get("LOCALAPPDATA")]):
            cands += [rf"{base}\Google\Chrome\Application\chrome.exe", rf"{base}\Microsoft\Edge\Application\msedge.exe",
                      rf"{base}\Chromium\Application\chrome.exe"]
    elif sys.platform == "darwin":
        cands += ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
                  "/Applications/Chromium.app/Contents/MacOS/Chromium"]
    for c in cands:
        if Path(c).exists():
            return c
    for name in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge", "msedge", "chrome"):
        hit = shutil.which(name)
        if hit:
            return hit
    return None


def parse_range(spec: str, total: int) -> list[int]:
    out: list[int] = []
    for part in spec.split(","):
        part = part.strip()
        if "-" in part:
            a, b = part.split("-", 1)
            out += range(int(a), int(b) + 1)
        elif part:
            out.append(int(part))
    return [n for n in out if 1 <= n <= total]


def base_cmd(browser: str, prof: str) -> list[str]:
    return [browser, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check",
            "--disable-extensions", f"--user-data-dir={prof}", "--virtual-time-budget=4000"]


def run_browser(browser: str, args: list[str], out: Path, tries: int = 2) -> str:
    """Run a headless browser until `out` exists. Returns '' or the last error line."""
    err = ""
    for _ in range(tries):  # headless launches occasionally exit early; one retry clears it
        out.unlink(missing_ok=True)
        prof = tempfile.mkdtemp(prefix="html-deck-")
        try:
            r = subprocess.run(base_cmd(browser, prof) + args, capture_output=True, text=True, timeout=90)
            err = "" if out.exists() else (r.stderr.strip().splitlines() or ["no output"])[-1]
        except subprocess.TimeoutExpired:
            err = "timeout"
        finally:
            shutil.rmtree(prof, ignore_errors=True)
        if not err:
            break
    return err


def dump_dom(browser: str, url: str, marker: str, tries: int = 2) -> str:
    """Load `url` headless and return the serialized DOM once it contains `marker` ('' on failure)."""
    for _ in range(tries):
        prof = tempfile.mkdtemp(prefix="html-deck-")
        try:
            r = subprocess.run(base_cmd(browser, prof) + ["--window-size=1280,720", "--dump-dom", url], capture_output=True, timeout=90)
            txt = r.stdout.decode("utf-8", "replace")
        except subprocess.TimeoutExpired:
            txt = ""
        finally:
            shutil.rmtree(prof, ignore_errors=True)
        if marker in txt:
            return txt
    return ""


def audit(browser: str, base: str) -> int:
    marker = '<pre class="audit" id="audit">'
    dom = dump_dom(browser, f"{base}?clean&audit", marker)
    m = re.search(re.escape(marker) + r"(.*?)</pre>", dom, re.S)
    if not m:
        print("FAIL  audit did not run (rebuild the deck with the current build_deck.py so it carries the audit runtime)")
        return 1
    report = json.loads(html.unescape(m.group(1)))
    flagged = [s for s in report if s["items"]]
    for s in flagged:
        print(f"  slide {s['slide']}" + (f' "{s["title"]}"' if s["title"] else ""))
        for it in s["items"][:8]:
            print(f"    {it['el']:<28} {it['what']:<30} {('“' + it['text'] + '”') if it['text'] else ''}")
        if len(s["items"]) > 8:
            print(f"    … {len(s['items']) - 8} more")
    n = sum(len(s["items"]) for s in flagged)
    if n:
        print(f"  {n} layout finding(s) on {len(flagged)} slide(s) - cut words, give the element more room, or split the slide; "
              f"render those slides to see them")
    else:
        print(f"ok  layout audit · {len(report)} slide(s) · nothing outside the stage, clipped, over the footer or under 10px")
    return 1 if n else 0


def shoot(browser: str, url: str, png: Path, size: tuple[int, int], scale: float = 1) -> tuple[Path, str]:
    args = [f"--window-size={size[0]},{size[1]}", f"--force-device-scale-factor={scale:g}", f"--screenshot={png}", url]
    return png, run_browser(browser, args, png)


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("deck", help="built deck .html")
    ap.add_argument("--out", help="output folder for PNGs (default <deck>-shots)")
    ap.add_argument("--slides", help="1-based list/ranges, e.g. 1,4-6")
    ap.add_argument("--overview", action="store_true", help="single contact-sheet image of all slides")
    ap.add_argument("--scale", type=float, default=1, help="device pixel ratio for PNGs (2 = 2560x1440 per slide)")
    ap.add_argument("--pdf", nargs="?", const="", metavar="FILE", help="print to PDF instead of PNGs (default <deck>.pdf)")
    ap.add_argument("--audit", action="store_true", help="report overflow, clipping, footer collisions and tiny text per slide; no images")
    ap.add_argument("--jobs", type=int, default=4, help="parallel browser processes")
    args = ap.parse_args()

    deck = Path(args.deck).resolve()
    if not deck.exists():
        print(f"error: {deck} not found", file=sys.stderr)
        return 2
    browser = find_browser()
    if not browser:
        print("error: no Chrome/Edge/Chromium found; set HTML_DECK_BROWSER to the executable", file=sys.stderr)
        return 2
    text = deck.read_text(encoding="utf-8")
    total = len(re.findall(r'<section\s+class="slide[\s"]', text))
    base = deck.as_uri()

    if args.audit:
        return audit(browser, base)
    if args.pdf is not None:
        pdf = (Path(args.pdf) if args.pdf else deck.with_suffix(".pdf")).resolve()
        pdf.parent.mkdir(parents=True, exist_ok=True)
        err = run_browser(browser, ["--no-pdf-header-footer", "--print-to-pdf-no-header", f"--print-to-pdf={pdf}", f"{base}?clean"], pdf)
        print(f"{'FAIL ' + err if err else 'ok'}  {pdf}" + ("" if err else f" · {total} page(s)"))
        return 1 if err else 0

    out = Path(args.out) if args.out else deck.with_name(deck.stem + "-shots")
    out.mkdir(parents=True, exist_ok=True)
    if args.overview:
        cols = 4
        rows = math.ceil(total / cols)
        size = (32 * 2 + cols * 320 + (cols - 1) * 24 + 16, 32 * 2 + rows * 180 + (rows - 1) * 24 + 8)
        png, err = shoot(browser, f"{base}?clean&overview#1", out / "overview.png", size, args.scale)
        print(f"{'FAIL ' + err if err else 'ok'}  {png}")
        return 1 if err else 0

    nums = parse_range(args.slides, total) if args.slides else list(range(1, total + 1))
    jobs = [(browser, f"{base}?clean#{n}", out / f"slide-{n:02d}.png", (1280, 720), args.scale) for n in nums]
    fails = 0
    with ThreadPoolExecutor(max_workers=max(1, args.jobs)) as ex:
        for png, err in ex.map(lambda j: shoot(*j), jobs):
            print(f"{'FAIL ' + err if err else 'ok'}  {png}")
            fails += bool(err)
    print(f"{len(nums) - fails}/{len(nums)} slides rendered to {out}")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
