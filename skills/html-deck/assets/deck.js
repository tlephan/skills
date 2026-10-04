/* html-deck runtime — stage scaling, navigation, overview, notes, one-pager spotlight, SVG charts, diagram connectors.
   No dependencies. Charts are declared as <script type="application/json" data-chart="TYPE"> inside a
   <figure class="chart">; diagrams as [data-links] containers and <script data-diagram="sequence">. */
(function () {
  'use strict';
  var W = 1280, H = 720;
  var doc = document, root = doc.documentElement;
  var deck = doc.querySelector('.deck');
  if (!deck) return;
  var slides = Array.prototype.slice.call(deck.querySelectorAll(':scope > .slide'));
  var total = slides.length, idx = 0;
  var params = new URLSearchParams(location.search);
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------------- helpers ---------------- */
  function sv(tag, attrs, parent) {
    var e = doc.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function el(tag, cls, parent, text) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, cls, anchor, extra) {
    var t = sv('text', Object.assign({ x: x, y: y, 'class': cls, 'text-anchor': anchor || 'start' }, extra || {}), parent);
    t.textContent = s;
    return t;
  }
  var fontFamily = getComputedStyle(doc.body).fontFamily;
  var mctx = doc.createElement('canvas').getContext('2d');
  function tw(s, size, weight) {
    mctx.font = (weight || 400) + ' ' + (size || 12.5) + 'px ' + fontFamily;
    return mctx.measureText(String(s)).width;
  }
  var probe = el('span', null, deck);
  probe.style.display = 'none';
  function resolveColor(c) { probe.style.color = ''; probe.style.color = c; return getComputedStyle(probe).color; }
  function lum(rgb) {
    var m = rgb.match(/[\d.]+/g); if (!m) return 1;
    var a = m.slice(0, 3).map(function (v) { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function inkOn(color) { return lum(resolveColor(color)) > 0.36 ? '#101828' : '#ffffff'; }
  function color(c, i) {
    if (c == null) return 'var(--c' + ((i % 8) + 1) + ')';
    if (typeof c === 'number') return 'var(--c' + c + ')';
    if (/^c[1-8]$/.test(c)) return 'var(--' + c + ')';
    if (c === 'other') return 'var(--c-other)';
    if (/^(accent|alt|hot|ok|warn|bad|pos|neg|muted|faint|c-total)$/.test(c)) return 'var(--' + c + ')';
    return c;
  }
  function makeFmt(cfg) {
    var d = cfg.decimals;
    var nf = new Intl.NumberFormat(cfg.locale || 'en-US', {
      maximumFractionDigits: d == null ? 1 : d, minimumFractionDigits: d == null ? 0 : d,
      notation: cfg.compact ? 'compact' : 'standard'
    });
    var pre = cfg.prefix || '', suf = cfg.suffix != null ? cfg.suffix : (cfg.unit || '');
    return function (v, signed) {
      if (v == null || isNaN(v)) return '–';
      var sign = v < 0 ? '−' : (signed && v > 0 ? '+' : '');
      return sign + pre + nf.format(Math.abs(v)) + suf;
    };
  }
  function niceTicks(lo, hi, count) {
    if (lo === hi) { hi = lo + 1; }
    var span = hi - lo, raw = span / (count || 5), mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
    var step = (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
    var a = Math.floor(lo / step + 1e-9) * step, b = Math.ceil(hi / step - 1e-9) * step, out = [];
    for (var v = a; v <= b + step / 2; v += step) out.push(+v.toFixed(10));
    return out;
  }
  function seriesOf(cfg) {
    var s = cfg.series || (cfg.values ? [{ name: cfg.name || '', values: cfg.values }] : []);
    return s.map(function (x, i) {
      var hl = cfg.highlight;
      var c = color(x.color, i);
      if (hl != null && s.length > 1 && [].concat(hl).indexOf(x.name) < 0 && [].concat(hl).indexOf(i) < 0) c = 'var(--c-other)';
      return { name: x.name || ('Series ' + (i + 1)), values: x.values || [], color: c, type: x.type, dashed: !!x.dashed };
    });
  }
  function isHL(cfg, label, i) {
    if (cfg.highlight == null) return true;
    var h = [].concat(cfg.highlight);
    return h.indexOf(label) >= 0 || h.indexOf(i) >= 0;
  }
  function legend(fig, items, kind) {
    var lg = fig.querySelector(':scope > .legend');
    if (lg) lg.textContent = ''; else { lg = el('div', 'legend'); fig.insertBefore(lg, fig.querySelector(':scope > .plot')); }
    items.forEach(function (it) {
      var s = el('span', null, lg);
      var k = el('i', 'key ' + (it.kind || kind), s);
      k.style.background = it.dashed ? 'repeating-linear-gradient(90deg,' + it.color + ' 0 4px,transparent 4px 7px)' : it.color;
      el('span', null, s, it.name);
    });
  }
  function srTable(fig, head, rows) {
    var old = fig.querySelector(':scope > .sr-only'); if (old) old.remove();
    // a 1px hidden div wraps the table: a bare table ignores height:1px and would inflate its panel's overflow
    var t = el('table', null, el('div', 'sr-only', fig)), tr = el('tr', null, el('thead', null, t));
    head.forEach(function (h) { el('th', null, tr, h); });
    var tb = el('tbody', null, t);
    rows.forEach(function (r) { var row = el('tr', null, tb); r.forEach(function (c) { el('td', null, row, c); }); });
  }

  /* tooltip — values lead, labels follow; always textContent */
  var tip = el('div', 'tip', doc.body);
  function showTip(e, title, rows) {
    tip.textContent = '';
    if (title) el('div', 't', tip, title);
    rows.forEach(function (r) {
      var d = el('div', 'r', tip);
      if (r.color) { var k = el('i', 'key ' + (r.kind || 'line'), d); k.style.background = r.color; }
      el('b', null, d, r.value);
      if (r.label) el('span', null, d, r.label);
    });
    tip.classList.add('on');
    var x = e.clientX + 14, y = e.clientY + 14, bw = tip.offsetWidth, bh = tip.offsetHeight;
    if (x + bw > innerWidth - 8) x = e.clientX - bw - 14;
    if (y + bh > innerHeight - 8) y = e.clientY - bh - 14;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function hideTip() { tip.classList.remove('on'); }
  function bindTip(node, fn) {
    node.addEventListener('pointermove', function (e) { var r = fn(e); showTip(e, r[0], r[1]); });
    node.addEventListener('pointerleave', hideTip);
  }

  /* rounded data-end bar paths (square at baseline) */
  function barV(x, w, yBase, yEnd, r) {
    var h = Math.abs(yBase - yEnd); r = Math.min(r, w / 2, h);
    var d = yEnd <= yBase ? 1 : -1;
    return 'M' + x + ',' + yBase + 'V' + (yEnd + d * r) + 'Q' + x + ',' + yEnd + ' ' + (x + r) + ',' + yEnd +
      'H' + (x + w - r) + 'Q' + (x + w) + ',' + yEnd + ' ' + (x + w) + ',' + (yEnd + d * r) + 'V' + yBase + 'Z';
  }
  function barH(y, h, xBase, xEnd, r) {
    var w = Math.abs(xEnd - xBase); r = Math.min(r, h / 2, w);
    var d = xEnd >= xBase ? 1 : -1;
    return 'M' + xBase + ',' + y + 'H' + (xEnd - d * r) + 'Q' + xEnd + ',' + y + ' ' + xEnd + ',' + (y + r) +
      'V' + (y + h - r) + 'Q' + xEnd + ',' + (y + h) + ' ' + (xEnd - d * r) + ',' + (y + h) + 'H' + xBase + 'Z';
  }

  /* y axis + gridlines for vertical charts */
  function yAxis(svg, ticks, fmt, x0, x1, y) {
    ticks.forEach(function (t) {
      sv('line', { x1: x0, x2: x1, y1: y(t), y2: y(t), stroke: 'var(--grid)', 'stroke-width': 1 }, svg);
      txt(svg, x0 - 8, y(t) + 4, fmt(t), 'tick', 'end');
    });
  }
  function xLabels(svg, labels, xs, y, maxW) {
    var every = 1, widest = Math.max.apply(null, labels.map(function (l) { return tw(l); }));
    while (widest > maxW * every - 6 && every < labels.length) every++;
    labels.forEach(function (l, i) { if (i % every === 0) txt(svg, xs(i), y, l, 'xl', 'middle'); });
  }
  function targetLine(svg, cfg, fmt, x0, x1, y) {
    if (cfg.target == null) return;
    var yy = y(cfg.target);
    sv('line', { x1: x0, x2: x1, y1: yy, y2: yy, stroke: 'var(--ink-2)', 'stroke-width': 1.25, 'stroke-dasharray': '5 4' }, svg);
    txt(svg, x0 + 6, yy - 6, (cfg.targetLabel || 'Target') + ' ' + fmt(cfg.target), 'at', 'start', { style: 'font-weight:600;fill:var(--ink-2)' });
  }

  /* ---------------- charts ---------------- */
  var CH = {};

  CH.column = function (fig, cfg, svg, w, h) {
    var labels = cfg.labels || [], S = seriesOf(cfg), n = labels.length, k = S.length, stacked = !!cfg.stacked;
    var fmt = makeFmt(cfg), lo = 0, hi = 0;
    labels.forEach(function (_, i) {
      if (stacked) {
        var p = 0, q = 0; S.forEach(function (s) { var v = +s.values[i] || 0; if (v >= 0) p += v; else q += v; });
        hi = Math.max(hi, p); lo = Math.min(lo, q);
      } else S.forEach(function (s) { var v = +s.values[i] || 0; hi = Math.max(hi, v); lo = Math.min(lo, v); });
    });
    if (cfg.target != null) hi = Math.max(hi, cfg.target);
    var ticks = niceTicks(cfg.min != null ? cfg.min : lo, cfg.max != null ? cfg.max : hi, cfg.ticks || 5);
    var y0 = ticks[0], y1 = ticks[ticks.length - 1];
    var padL = Math.max.apply(null, ticks.map(function (t) { return tw(fmt(t), 12); })) + 12;
    var padR = 6;
    var padT = 20, padB = 26, pw = w - padL - padR, ph = h - padT - padB;
    var y = function (v) { return padT + ph * (1 - (v - y0) / (y1 - y0)); };
    yAxis(svg, ticks, fmt, padL, w - padR, y);
    var vg = sv('g', null, svg);   // value labels, raised above the target line at the end
    var band = pw / n, bw = stacked ? Math.min(cfg.barWidth || 32, band * 0.6) : Math.min(cfg.barWidth || 26, (band * 0.72 - (k - 1) * 2) / k);
    var gw = stacked ? bw : k * bw + (k - 1) * 2;
    var cx = function (i) { return padL + band * (i + 0.5); };
    var labelsMode = cfg.valueLabels || (k === 1 || stacked ? 'all' : 'none');
    labels.forEach(function (lab, i) {
      if (stacked) {
        var p = 0, q = 0, lastPos = -1, lastNeg = -1;
        S.forEach(function (s, j) { var v = +s.values[i] || 0; if (v > 0) lastPos = j; if (v < 0) lastNeg = j; });
        S.forEach(function (s, j) {
          var v = +s.values[i] || 0; if (!v) return;
          var from = v > 0 ? p : q, to = from + v;
          if (v > 0) p = to; else q = to;
          var yb = y(from) - (from !== 0 ? (v > 0 ? 2 : -2) : 0);
          var outer = v > 0 ? j === lastPos : j === lastNeg;
          var m = sv('path', { d: barV(cx(i) - bw / 2, bw, yb, y(to), outer ? 4 : 0), 'class': 'mark', style: 'fill:' + s.color }, svg);
          bindTip(m, function () { return [lab, [{ color: s.color, kind: 'rect', value: fmt(v), label: s.name }]]; });
        });
        if (labelsMode !== 'none') txt(vg, cx(i), y(p) - 7, fmt(p), 'vl', 'middle');
      } else {
        S.forEach(function (s, j) {
          var v = +s.values[i]; if (isNaN(v)) return;
          var hl = isHL(cfg, lab, i), c = k === 1 && !hl ? 'var(--c-other)' : s.color;
          var x = cx(i) - gw / 2 + j * (bw + 2);
          var m = sv('path', { d: barV(x, bw, y(0), y(v), 4), 'class': 'mark', style: 'fill:' + c }, svg);
          bindTip(m, function () { return [lab, [{ color: c, kind: 'rect', value: fmt(v), label: s.name }]]; });
          if (labelsMode === 'all' || (labelsMode === 'highlight' && hl && cfg.highlight != null))
            txt(vg, x + bw / 2, v >= 0 ? y(v) - 7 : y(v) + 16, fmt(v), 'vl', 'middle');
        });
      }
    });
    sv('line', { x1: padL, x2: w - padR, y1: y(0), y2: y(0), stroke: 'var(--axis)', 'stroke-width': 1 }, svg);
    xLabels(svg, labels, cx, h - 6, band);
    targetLine(svg, cfg, fmt, padL, w - padR, y);
    svg.appendChild(vg);
    if (k > 1) legend(fig, S.map(function (s) { return { name: s.name, color: s.color }; }), 'rect');
    srTable(fig, [''].concat(S.map(function (s) { return s.name; })), labels.map(function (l, i) { return [l].concat(S.map(function (s) { return fmt(s.values[i]); })); }));
  };

  CH.bar = function (fig, cfg, svg, w, h) {
    var labels = cfg.labels || [], S = seriesOf(cfg), n = labels.length, k = S.length;
    var stacked = !!cfg.stacked || !!cfg.percent, pct = !!cfg.percent, fmt = makeFmt(pct ? Object.assign({ suffix: '%', decimals: 0 }, cfg) : cfg);
    var totals = labels.map(function (_, i) { return S.reduce(function (a, s) { return a + (+s.values[i] || 0); }, 0); });
    var val = function (s, i) { var v = +s.values[i] || 0; return pct ? v / (totals[i] || 1) * 100 : v; };
    var hi = pct ? 100 : 0;
    if (!pct) labels.forEach(function (_, i) { hi = Math.max(hi, stacked ? totals[i] : Math.max.apply(null, S.map(function (s) { return +s.values[i] || 0; }))); });
    if (cfg.target != null) hi = Math.max(hi, cfg.target);
    if (cfg.max != null) hi = cfg.max;
    var padL = Math.max.apply(null, labels.map(function (l) { return tw(l, 13, 600); })) + 14, padT = cfg.target != null ? 20 : 0;
    var endW = pct ? 0 : Math.max.apply(null, labels.map(function (_, i) { return tw(fmt(stacked ? totals[i] : Math.max.apply(null, S.map(function (s) { return +s.values[i] || 0; }))), 12.5, 650); })) + 10;
    var pw = w - padL - endW - 4, band = (h - padT) / n;
    var bh = stacked ? Math.min(cfg.barWidth || 26, band * 0.62) : Math.min(cfg.barWidth || 22, (band * 0.7 - (k - 1) * 2) / k);
    var x = function (v) { return padL + pw * v / (hi || 1); };
    sv('line', { x1: padL, x2: padL, y1: padT, y2: h, stroke: 'var(--axis)', 'stroke-width': 1 }, svg);
    var vg = sv('g', null, svg);
    labels.forEach(function (lab, i) {
      var cy = padT + band * (i + 0.5), hl = isHL(cfg, lab, i);
      txt(svg, padL - 10, cy + 4.5, lab, 'el', 'end', hl && cfg.highlight != null ? { style: 'font-weight:700;fill:var(--ink)' } : null);
      if (stacked) {
        var acc = 0, last = -1;
        S.forEach(function (s, j) { if (val(s, i) > 0) last = j; });
        S.forEach(function (s, j) {
          var v = val(s, i); if (!(v > 0)) return;
          var xa = x(acc) + (acc > 0 ? 2 : 0), xb = x(acc + v); acc += v;
          var m = sv('path', { d: barH(cy - bh / 2, bh, xa, xb, j === last ? 4 : 0), 'class': 'mark', style: 'fill:' + s.color }, svg);
          var raw = +s.values[i] || 0;
          bindTip(m, function () { return [lab, [{ color: s.color, kind: 'rect', value: fmt(v), label: s.name + (pct ? ' · ' + makeFmt(cfg)(raw) : '') }]]; });
          var lt = fmt(v);
          if (cfg.valueLabels !== 'none' && tw(lt, 12.5, 650) + 12 < xb - xa)
            txt(vg, (xa + xb) / 2, cy + 4.5, lt, 'vl', 'middle', { style: 'fill:' + inkOn(s.color) + ';stroke:none' });
        });
        if (!pct && cfg.valueLabels !== 'none') txt(vg, x(acc) + 7, cy + 4.5, fmt(totals[i]), 'vl');
      } else {
        var gh = k * bh + (k - 1) * 2;
        S.forEach(function (s, j) {
          var v = +s.values[i]; if (isNaN(v)) return;
          var c = k === 1 && !hl ? 'var(--c-other)' : s.color, yy = cy - gh / 2 + j * (bh + 2);
          var m = sv('path', { d: barH(yy, bh, x(0), x(v), 4), 'class': 'mark', style: 'fill:' + c }, svg);
          bindTip(m, function () { return [lab, [{ color: c, kind: 'rect', value: fmt(v), label: s.name }]]; });
          if (cfg.valueLabels !== 'none') txt(vg, x(v) + 7, yy + bh / 2 + 4.5, fmt(v), 'vl');
        });
      }
    });
    if (cfg.target != null) {
      sv('line', { x1: x(cfg.target), x2: x(cfg.target), y1: padT - 4, y2: h, stroke: 'var(--ink-2)', 'stroke-width': 1.25, 'stroke-dasharray': '5 4' }, svg);
      txt(svg, x(cfg.target), 11, (cfg.targetLabel || 'Target') + ' ' + fmt(cfg.target), 'at', 'middle');
    }
    svg.appendChild(vg);
    if (k > 1) legend(fig, S.map(function (s) { return { name: s.name, color: s.color }; }), 'rect');
    srTable(fig, [''].concat(S.map(function (s) { return s.name; })), labels.map(function (l, i) { return [l].concat(S.map(function (s) { return fmt(val(s, i)); })); }));
  };

  CH.line = function (fig, cfg, svg, w, h, plot, area) {
    var labels = cfg.labels || [], S = seriesOf(cfg), n = labels.length, fmt = makeFmt(cfg);
    var all = []; S.forEach(function (s) { s.values.forEach(function (v) { if (v != null && !isNaN(v)) all.push(+v); }); });
    if (cfg.target != null) all.push(cfg.target);
    var dmin = Math.min.apply(null, all), dmax = Math.max.apply(null, all);
    var lo = cfg.min != null ? cfg.min : (area || (dmin >= 0 && dmin <= dmax * 0.5) ? Math.min(0, dmin) : dmin - (dmax - dmin) * 0.15);
    var ticks = niceTicks(lo, cfg.max != null ? cfg.max : dmax, cfg.ticks || 5), y0 = ticks[0], y1 = ticks[ticks.length - 1];
    // end labels only for series that reach the right edge; a series that stops early is named by the legend
    var atEdge = function (s) { var v = s.values[n - 1]; return v != null && !isNaN(v); };
    var endLabel = function (s) { return (S.length > 1 ? s.name + ' ' : '') + fmt(s.values[n - 1]); };
    var padL = Math.max.apply(null, ticks.map(function (t) { return tw(fmt(t), 12); })) + 12;
    var padR = Math.max.apply(null, S.filter(atEdge).map(function (s) { return tw(endLabel(s), 12.5, 600); }).concat([0])) + 16;
    var padT = 14, padB = 26, pw = w - padL - padR, ph = h - padT - padB;
    var y = function (v) { return padT + ph * (1 - (v - y0) / (y1 - y0)); };
    var xs = function (i) { return padL + (n === 1 ? pw / 2 : pw * i / (n - 1)); };
    yAxis(svg, ticks, fmt, padL, w - padR, y);
    sv('line', { x1: padL, x2: w - padR, y1: y(Math.max(y0, 0)), y2: y(Math.max(y0, 0)), stroke: 'var(--axis)', 'stroke-width': 1 }, svg);
    (cfg.annotations || []).forEach(function (a) {
      var i = typeof a.x === 'number' ? a.x : labels.indexOf(a.x); if (i < 0) return;
      sv('line', { x1: xs(i), x2: xs(i), y1: padT, y2: padT + ph, stroke: 'var(--line-2)', 'stroke-width': 1 }, svg);
      txt(svg, xs(i) + 5, padT + 10, a.label, 'at');
    });
    targetLine(svg, cfg, fmt, padL, w - padR, y);
    var ends = [];
    S.forEach(function (s) {
      var d = '', pen = false, first = null, last = null;
      s.values.forEach(function (v, i) {
        if (v == null || isNaN(v)) { pen = false; return; }
        d += (pen ? 'L' : 'M') + xs(i).toFixed(1) + ',' + y(v).toFixed(1); pen = true;
        if (first == null) first = i; last = i;
      });
      if (area && first != null) sv('path', { d: d + 'L' + xs(last) + ',' + y(Math.max(y0, 0)) + 'L' + xs(first) + ',' + y(Math.max(y0, 0)) + 'Z', style: 'fill:' + s.color + ';opacity:.12' }, svg);
      sv('path', { d: d, fill: 'none', style: 'stroke:' + s.color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': s.dashed ? '5 4' : null }, svg);
      if (last != null) {
        sv('circle', { cx: xs(last), cy: y(s.values[last]), r: 4, style: 'fill:' + s.color, stroke: 'var(--panel)', 'stroke-width': 2 }, svg);
        if (last === n - 1) ends.push({ y: y(s.values[last]), s: s, x: xs(last) });
      }
    });
    ends.sort(function (a, b) { return a.y - b.y; });
    var collide = ends.some(function (e, i) { return i && e.y - ends[i - 1].y < 15; });
    if (!collide || S.length === 1) ends.forEach(function (e) { txt(svg, e.x + 9, e.y + 4.5, endLabel(e.s), 'el'); });
    xLabels(svg, labels, xs, h - 6, n > 1 ? pw / (n - 1) : pw);
    var xh = sv('line', { 'class': 'xhair', y1: padT, y2: padT + ph, x1: -99, x2: -99, style: 'opacity:0' }, svg);
    var step = n > 1 ? pw / (n - 1) : pw;
    labels.forEach(function (lab, i) {
      var hit = sv('rect', { 'class': 'hit', x: xs(i) - step / 2, y: padT, width: step, height: ph }, svg);
      hit.addEventListener('pointerenter', function () { xh.setAttribute('x1', xs(i)); xh.setAttribute('x2', xs(i)); xh.style.opacity = 1; });
      hit.addEventListener('pointerleave', function () { xh.style.opacity = 0; });
      bindTip(hit, function () { return [lab, S.map(function (s) { return { color: s.color, value: fmt(s.values[i]), label: S.length > 1 ? s.name : '' }; })]; });
    });
    if (S.length > 1) legend(fig, S.map(function (s) { return { name: s.name, color: s.color, dashed: s.dashed && !area }; }), area ? 'rect' : 'line');
    srTable(fig, [''].concat(S.map(function (s) { return s.name; })), labels.map(function (l, i) { return [l].concat(S.map(function (s) { return fmt(s.values[i]); })); }));
  };
  CH.area = function (fig, cfg, svg, w, h, plot) { CH.line(fig, cfg, svg, w, h, plot, true); };

  CH.donut = function (fig, cfg, svg, w, h, plot) {
    var labels = cfg.labels || [], vals = (cfg.values || (cfg.series && cfg.series[0].values) || []).map(Number), fmt = makeFmt(cfg);
    var tot = vals.reduce(function (a, b) { return a + b; }, 0) || 1;
    svg.remove();
    var wrap = el('div', 'donut-wrap', plot);
    var size = Math.min(h, w * 0.5), R = size / 2 - 2, r = R * (cfg.thickness ? 1 - cfg.thickness : 0.64);
    var s = sv('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size, role: 'img' }, wrap);
    var c = size / 2, a0 = -Math.PI / 2;
    var colors = labels.map(function (l, i) {
      var cc = cfg.colors ? color(cfg.colors[i], i) : color(null, i);
      return isHL(cfg, l, i) ? cc : 'var(--c-other)';
    });
    vals.forEach(function (v, i) {
      var a1 = a0 + v / tot * Math.PI * 2, large = a1 - a0 > Math.PI ? 1 : 0;
      var p = function (rad, a) { return (c + rad * Math.cos(a)).toFixed(2) + ',' + (c + rad * Math.sin(a)).toFixed(2); };
      var d = vals.length === 1 ? 'M' + (c - R) + ',' + c + 'a' + R + ',' + R + ' 0 1,0 ' + 2 * R + ',0a' + R + ',' + R + ' 0 1,0 ' + -2 * R + ',0M' + (c - r) + ',' + c + 'a' + r + ',' + r + ' 0 1,1 ' + 2 * r + ',0a' + r + ',' + r + ' 0 1,1 ' + -2 * r + ',0'
        : 'M' + p(R, a0) + 'A' + R + ',' + R + ' 0 ' + large + ' 1 ' + p(R, a1) + 'L' + p(r, a1) + 'A' + r + ',' + r + ' 0 ' + large + ' 0 ' + p(r, a0) + 'Z';
      var m = sv('path', { d: d, 'class': 'mark', style: 'fill:' + colors[i], stroke: 'var(--panel)', 'stroke-width': 2, 'fill-rule': 'evenodd' }, s);
      bindTip(m, function () { return [labels[i], [{ color: colors[i], kind: 'rect', value: fmt(v), label: Math.round(v / tot * 100) + '%' }]]; });
      a0 = a1;
    });
    var cv = cfg.center && cfg.center.value != null ? cfg.center.value : fmt(tot);
    var cl = cfg.center && cfg.center.label != null ? cfg.center.label : 'Total';
    txt(s, c, c + (cl ? 2 : 10), cv, null, 'middle', { style: 'font-size:' + Math.round(r * 0.42) + 'px;font-weight:700;fill:var(--ink)' });
    if (cl) txt(s, c, c + r * 0.36 + 6, cl, null, 'middle', { style: 'font-size:12.5px;fill:var(--muted)' });
    var lg = el('div', 'donut-legend', wrap);
    labels.forEach(function (l, i) {
      var row = el('div', null, lg), k = el('i', 'key rect', row);
      k.style.background = colors[i]; k.style.width = '12px'; k.style.height = '12px';
      el('span', null, row, l);
      el('b', null, row, cfg.showValues === false ? Math.round(vals[i] / tot * 100) + '%' : fmt(vals[i]) + (cfg.showPercent === false ? '' : '  ·  ' + Math.round(vals[i] / tot * 100) + '%'));
    });
    srTable(fig, ['', 'Value', 'Share'], labels.map(function (l, i) { return [l, fmt(vals[i]), Math.round(vals[i] / tot * 100) + '%']; }));
  };

  CH.gauge = function (fig, cfg, svg, w, h) {
    var min = cfg.min || 0, max = cfg.max != null ? cfg.max : 100, v = +cfg.value, fmt = makeFmt(cfg);
    var tone = cfg.tone ? { ok: ['var(--ok)', 'var(--ok-bg)'], warn: ['var(--warn)', 'var(--warn-bg)'], bad: ['var(--bad)', 'var(--bad-bg)'] }[cfg.tone] : null;
    var fc = tone ? tone[0] : color(cfg.color || 'accent'), tc = tone ? tone[1] : 'var(--accent-soft)';
    var R = Math.min(w / 2 - 10, h - 30), th = Math.max(10, R * 0.19), cx = w / 2, cy = (h - 30 - R) / 2 + R + 4, rr = R - th / 2;
    var pt = function (f) { var a = Math.PI * (1 + f); return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; };
    var arc = function (f0, f1) { var p0 = pt(f0), p1 = pt(f1); return 'M' + p0[0] + ',' + p0[1] + 'A' + rr + ',' + rr + ' 0 0 1 ' + p1[0] + ',' + p1[1]; };
    var f = Math.max(0, Math.min(1, (v - min) / (max - min)));
    sv('path', { d: arc(0, 1), fill: 'none', style: 'stroke:' + tc, 'stroke-width': th }, svg);
    if (f > 0) sv('path', { d: arc(0, f), fill: 'none', style: 'stroke:' + fc, 'stroke-width': th, 'class': 'mark' }, svg);
    if (cfg.target != null) {
      var tf = (cfg.target - min) / (max - min), a = Math.PI * (1 + tf);
      sv('line', { x1: cx + (R + 4) * Math.cos(a), y1: cy + (R + 4) * Math.sin(a), x2: cx + (R - th - 4) * Math.cos(a), y2: cy + (R - th - 4) * Math.sin(a), stroke: 'var(--ink)', 'stroke-width': 2 }, svg);
    }
    txt(svg, cx, cy - (cfg.label ? 22 : 4), fmt(v), null, 'middle', { style: 'font-size:' + Math.round(R * 0.32) + 'px;font-weight:700;fill:var(--ink)' });
    if (cfg.label) txt(svg, cx, cy - 2, cfg.label, null, 'middle', { style: 'font-size:13px;fill:var(--muted)' });
    txt(svg, cx - rr, cy + 18, fmt(min), 'tick', 'middle');
    txt(svg, cx + rr, cy + 18, fmt(max), 'tick', 'middle');
    if (cfg.target != null) txt(svg, cx, cy + 18, (cfg.targetLabel || 'Target') + ' ' + fmt(cfg.target), 'at', 'middle', { style: 'font-weight:600;fill:var(--ink-2)' });
    srTable(fig, ['Value', 'Min', 'Max', 'Target'], [[fmt(v), fmt(min), fmt(max), cfg.target != null ? fmt(cfg.target) : '']]);
  };

  CH.scatter = function (fig, cfg, svg, w, h) {
    var S = (cfg.series || []).map(function (s, i) { return { name: s.name, points: s.points || [], color: color(s.color, i) }; });
    var fx = makeFmt(cfg.xFormat || {}), fy = makeFmt(cfg.yFormat || cfg);
    var X = [], Y = [], Z = [];
    S.forEach(function (s) { s.points.forEach(function (p) { X.push(+p[0]); Y.push(+p[1]); if (p[2] != null) Z.push(+p[2]); }); });
    var xt = niceTicks(cfg.xMin != null ? cfg.xMin : Math.min(0, Math.min.apply(null, X)), cfg.xMax != null ? cfg.xMax : Math.max.apply(null, X), 5);
    var yt = niceTicks(cfg.yMin != null ? cfg.yMin : Math.min(0, Math.min.apply(null, Y)), cfg.yMax != null ? cfg.yMax : Math.max.apply(null, Y), 5);
    var padL = Math.max.apply(null, yt.map(function (t) { return tw(fy(t), 12); })) + 12 + (cfg.yLabel ? 16 : 0), padB = 26 + (cfg.xLabel ? 18 : 0), padT = 12, padR = 16;
    var pw = w - padL - padR, ph = h - padT - padB;
    var x = function (v) { return padL + pw * (v - xt[0]) / (xt[xt.length - 1] - xt[0]); };
    var y = function (v) { return padT + ph * (1 - (v - yt[0]) / (yt[yt.length - 1] - yt[0])); };
    yAxis(svg, yt, fy, padL, w - padR, y);
    xt.forEach(function (t) { txt(svg, x(t), padT + ph + 18, fx(t), 'tick', 'middle'); });
    sv('line', { x1: padL, x2: w - padR, y1: padT + ph, y2: padT + ph, stroke: 'var(--axis)' }, svg);
    if (cfg.xLabel) txt(svg, padL + pw / 2, h - 2, cfg.xLabel, 'at', 'middle', { style: 'font-weight:600' });
    if (cfg.yLabel) txt(svg, 12, padT + ph / 2, cfg.yLabel, 'at', 'middle', { transform: 'rotate(-90 12 ' + (padT + ph / 2) + ')', style: 'font-weight:600' });
    if (cfg.quadrants) {
      var qx = x(cfg.quadrants[0]), qy = y(cfg.quadrants[1]);
      sv('line', { x1: qx, x2: qx, y1: padT, y2: padT + ph, stroke: 'var(--line-2)', 'stroke-width': 1.25 }, svg);
      sv('line', { x1: padL, x2: w - padR, y1: qy, y2: qy, stroke: 'var(--line-2)', 'stroke-width': 1.25 }, svg);
      var ql = cfg.quadrantLabels || [];
      if (ql[0]) txt(svg, padL + 8, padT + 14, ql[0], 'at', 'start', { style: 'font-weight:700;text-transform:uppercase;letter-spacing:.05em' });
      if (ql[1]) txt(svg, w - padR - 8, padT + 14, ql[1], 'at', 'end', { style: 'font-weight:700;text-transform:uppercase;letter-spacing:.05em' });
      if (ql[2]) txt(svg, padL + 8, padT + ph - 8, ql[2], 'at', 'start', { style: 'font-weight:700;text-transform:uppercase;letter-spacing:.05em' });
      if (ql[3]) txt(svg, w - padR - 8, padT + ph - 8, ql[3], 'at', 'end', { style: 'font-weight:700;text-transform:uppercase;letter-spacing:.05em' });
    }
    var zmax = Z.length ? Math.max.apply(null, Z) : 1;
    S.forEach(function (s) {
      s.points.forEach(function (p) {
        var r = p[2] != null ? 5 + 16 * Math.sqrt(p[2] / zmax) : 6;
        var g = sv('g', null, svg);
        sv('circle', { cx: x(p[0]), cy: y(p[1]), r: Math.max(r, 12), fill: 'transparent' }, g);
        sv('circle', { cx: x(p[0]), cy: y(p[1]), r: r, 'class': 'mark', style: 'fill:' + s.color + ';fill-opacity:.85', stroke: 'var(--panel)', 'stroke-width': 2 }, g);
        if (p[3]) txt(svg, x(p[0]) + r + 5, y(p[1]) + 4, p[3], 'el');
        bindTip(g, function () { return [p[3] || s.name, [{ color: s.color, kind: 'dot', value: fx(p[0]) + ' , ' + fy(p[1]), label: (cfg.xLabel || 'x') + ' , ' + (cfg.yLabel || 'y') }]]; });
      });
    });
    if (S.length > 1) legend(fig, S.map(function (s) { return { name: s.name, color: s.color }; }), 'dot');
    var rows = []; S.forEach(function (s) { s.points.forEach(function (p) { rows.push([p[3] || s.name, fx(p[0]), fy(p[1])]); }); });
    srTable(fig, ['Point', cfg.xLabel || 'x', cfg.yLabel || 'y'], rows);
  };

  CH.waterfall = function (fig, cfg, svg, w, h) {
    var labels = cfg.labels || [], vals = cfg.values || [], totals = cfg.totals || [0, labels.length - 1], fmt = makeFmt(cfg);
    var run = 0, bars = [];
    labels.forEach(function (l, i) {
      var isT = totals.indexOf(i) >= 0, v = vals[i];
      if (isT) { v = v == null ? run : +v; bars.push({ from: 0, to: v, t: 1, v: v }); run = v; }
      else { v = +v || 0; bars.push({ from: run, to: run + v, t: 0, v: v }); run += v; }
    });
    var ends = []; bars.forEach(function (b) { ends.push(b.from, b.to); });
    var ticks = niceTicks(Math.min(0, Math.min.apply(null, ends)), Math.max.apply(null, ends), 5), y0 = ticks[0], y1 = ticks[ticks.length - 1];
    var padL = Math.max.apply(null, ticks.map(function (t) { return tw(fmt(t), 12); })) + 12, padT = 20, padB = 26, pw = w - padL - 6, ph = h - padT - padB;
    var y = function (v) { return padT + ph * (1 - (v - y0) / (y1 - y0)); };
    yAxis(svg, ticks, fmt, padL, w - 6, y);
    var band = pw / labels.length, bw = Math.min(cfg.barWidth || 40, band * 0.6), cx = function (i) { return padL + band * (i + 0.5); };
    bars.forEach(function (b, i) {
      var c = b.t ? 'var(--c-total)' : b.v >= 0 ? 'var(--pos)' : 'var(--neg)';
      var m = sv('path', { d: barV(cx(i) - bw / 2, bw, y(b.from), y(b.to), b.t ? 4 : 2), 'class': 'mark', style: 'fill:' + c }, svg);
      bindTip(m, function () { return [labels[i], [{ color: c, kind: 'rect', value: fmt(b.v, !b.t), label: b.t ? 'Total' : b.v >= 0 ? 'Increase' : 'Decrease' }]]; });
      var top = Math.min(y(b.from), y(b.to));
      txt(svg, cx(i), top - 7, fmt(b.v, !b.t), 'vl', 'middle');
      if (i < bars.length - 1) sv('line', { x1: cx(i) + bw / 2, x2: cx(i + 1) - bw / 2, y1: y(b.to), y2: y(b.to), stroke: 'var(--axis)', 'stroke-width': 1 }, svg);
    });
    sv('line', { x1: padL, x2: w - 6, y1: y(0), y2: y(0), stroke: 'var(--axis)' }, svg);
    xLabels(svg, labels, cx, h - 6, band);
    legend(fig, [{ name: 'Increase', color: 'var(--pos)' }, { name: 'Decrease', color: 'var(--neg)' }, { name: 'Total', color: 'var(--c-total)' }], 'rect');
    srTable(fig, ['', 'Change'], labels.map(function (l, i) { return [l, fmt(bars[i].v, !bars[i].t)]; }));
  };

  CH.dumbbell = function (fig, cfg, svg, w, h) {
    var labels = cfg.labels || [], S = seriesOf(cfg), fmt = makeFmt(cfg);
    var a = S[0], b = S[1] || S[0];
    a.color = cfg.series[0].color ? a.color : 'var(--c-other)'; b.color = cfg.series[1] && cfg.series[1].color ? b.color : 'var(--c1)';
    var all = a.values.concat(b.values).map(Number);
    var ticks = niceTicks(cfg.min != null ? cfg.min : Math.min(0, Math.min.apply(null, all)), cfg.max != null ? cfg.max : Math.max.apply(null, all), 5);
    var padL = Math.max.apply(null, labels.map(function (l) { return tw(l, 13, 600); })) + 16, padR = 56, padB = 24;
    var pw = w - padL - padR, band = (h - padB) / labels.length;
    var x = function (v) { return padL + pw * (v - ticks[0]) / (ticks[ticks.length - 1] - ticks[0]); };
    var every = 1, widest = Math.max.apply(null, ticks.map(function (t) { return tw(fmt(t), 12); }));
    while (ticks.length > 1 && widest + 8 > (x(ticks[1]) - x(ticks[0])) * every) every++;
    ticks.forEach(function (t, j) {
      sv('line', { x1: x(t), x2: x(t), y1: 0, y2: h - padB, stroke: 'var(--grid)' }, svg);
      if (j % every === 0) txt(svg, x(t), h - 4, fmt(t), 'tick', 'middle');
    });
    labels.forEach(function (l, i) {
      var cy = band * (i + 0.5), va = +a.values[i], vb = +b.values[i];
      txt(svg, padL - 12, cy + 4.5, l, 'el', 'end');
      sv('line', { x1: x(va), x2: x(vb), y1: cy, y2: cy, stroke: 'var(--line-2)', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
      var g = sv('g', null, svg);
      sv('circle', { cx: x(va), cy: cy, r: 6, style: 'fill:' + a.color, stroke: 'var(--panel)', 'stroke-width': 2 }, g);
      sv('circle', { cx: x(vb), cy: cy, r: 7, style: 'fill:' + b.color, stroke: 'var(--panel)', 'stroke-width': 2 }, g);
      var right = vb >= va, lb = fmt(vb);
      // no room before the axis start: lift the "after" label above its dot instead of over the category name
      if (!right && x(vb) - 13 - tw(lb, 12.5, 650) < padL - 4) txt(svg, x(vb), cy - 11, lb, 'vl', 'middle');
      else txt(svg, x(vb) + (right ? 13 : -13), cy + 4.5, lb, 'vl', right ? 'start' : 'end');
      txt(svg, x(va) + (right ? -12 : 12), cy + 4.5, fmt(va), 'tick', right ? 'end' : 'start');
      sv('rect', { x: padL, y: cy - band / 2, width: pw, height: band, 'class': 'hit', style: 'cursor:default' }, g);
      bindTip(g, function () { return [l, [{ color: a.color, kind: 'dot', value: fmt(va), label: a.name }, { color: b.color, kind: 'dot', value: fmt(vb), label: b.name }]]; });
    });
    legend(fig, [{ name: a.name, color: a.color }, { name: b.name, color: b.color }], 'dot');
    srTable(fig, ['', a.name, b.name], labels.map(function (l, i) { return [l, fmt(a.values[i]), fmt(b.values[i])]; }));
  };

  CH.heatmap = function (fig, cfg, svg, w, h, plot) {
    var rows = cfg.rows || [], cols = cfg.cols || [], V = cfg.values || [], fmt = makeFmt(cfg);
    svg.remove();
    var flat = [].concat.apply([], V).map(Number), mn = cfg.min != null ? cfg.min : Math.min.apply(null, flat), mx = cfg.max != null ? cfg.max : Math.max.apply(null, flat);
    var g = el('div', 'heat', plot);
    var lw = Math.max.apply(null, rows.map(function (r) { return tw(r, 12.5, 600); })) + 16;
    g.style.gridTemplateColumns = lw + 'px repeat(' + cols.length + ',minmax(0,1fr))';
    g.style.gridTemplateRows = '22px repeat(' + rows.length + ',minmax(0,1fr))';
    el('div', 'hc', g);
    cols.forEach(function (c) { el('div', 'hc', g, c); });
    rows.forEach(function (r, i) {
      el('div', 'hl', g, r);
      cols.forEach(function (c, j) {
        var v = +V[i][j], p = mx === mn ? 100 : Math.round((v - mn) / (mx - mn) * 100);
        var d = el('div', null, g, cfg.showValues === false ? '' : fmt(v));
        d.style.background = p <= 50 ? 'color-mix(in oklab, var(--seq-mid) ' + p * 2 + '%, var(--seq-lo))' : 'color-mix(in oklab, var(--seq-hi) ' + (p - 50) * 2 + '%, var(--seq-mid))';
        d.style.color = p > 45 ? 'var(--seq-ink-hi)' : 'var(--seq-ink-lo)';
        bindTip(d, function () { return [r + ' · ' + c, [{ value: fmt(v) }]]; });
      });
    });
    var sl = fig.querySelector(':scope > .scale-legend');
    if (sl) sl.textContent = ''; else { sl = el('div', 'scale-legend'); fig.appendChild(sl); }
    el('span', null, sl, fmt(mn)); el('i', null, sl); el('span', null, sl, fmt(mx));
    if (cfg.scaleLabel) el('span', null, sl, cfg.scaleLabel);
    srTable(fig, [''].concat(cols), rows.map(function (r, i) { return [r].concat(V[i].map(function (v) { return fmt(v); })); }));
  };

  function renderChart(script) {
    var type = script.getAttribute('data-chart'), fig = script.closest('.chart') || script.parentNode, cfg;
    try { cfg = JSON.parse(script.textContent); } catch (e) { fig.appendChild(el('p', 'small', null, 'Chart JSON error: ' + e.message)); return; }
    if (!CH[type]) { fig.appendChild(el('p', 'small', null, 'Unknown chart type: ' + type)); return; }
    var plot = el('div', 'plot', fig);
    if (cfg.height) plot.style.flex = '0 0 ' + cfg.height + 'px';
    else if (plot.clientHeight < 60) plot.style.flex = '0 0 260px';
    var draw = function () {
      plot.textContent = '';
      var w = plot.clientWidth, h = plot.clientHeight;
      var svg = sv('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': (fig.querySelector('figcaption') || {}).textContent || type }, plot);
      CH[type](fig, cfg, svg, w, h, plot);
      return h;
    };
    // a legend or scale added by the first pass takes height from the plot; redraw at the final size
    if (draw() !== plot.clientHeight) draw();
  }

  /* sparkline: <span class="spark" data-values="3,4,6,5,8"></span> */
  function renderSpark(sp) {
    var v = (sp.getAttribute('data-values') || '').split(',').map(Number).filter(function (x) { return !isNaN(x); });
    if (v.length < 2) return;
    var w = +sp.getAttribute('data-width') || 96, h = +sp.getAttribute('data-height') || 28, mn = Math.min.apply(null, v), mx = Math.max.apply(null, v);
    var x = function (i) { return 3 + (w - 6) * i / (v.length - 1); }, y = function (a) { return 3 + (h - 6) * (1 - (a - mn) / ((mx - mn) || 1)); };
    var s = sv('svg', { width: w, height: h, viewBox: '0 0 ' + w + ' ' + h, 'aria-hidden': 'true' }, sp);
    var d = v.map(function (a, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(a).toFixed(1); }).join('');
    if (sp.hasAttribute('data-area')) sv('path', { d: d + 'L' + x(v.length - 1) + ',' + h + 'L' + x(0) + ',' + h + 'Z', style: 'fill:var(--accent);opacity:.1' }, s);
    sv('path', { d: d, fill: 'none', style: 'stroke:var(--faint)', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, s);
    sv('circle', { cx: x(v.length - 1), cy: y(v[v.length - 1]), r: 3, style: 'fill:var(--accent)', stroke: 'var(--panel)', 'stroke-width': 1.5 }, s);
  }

  /* ---------------- diagrams ---------------- */
  function relBox(node, box) {
    var x = 0, y = 0, e = node;
    while (e && e !== box) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    return { x: x, y: y, w: node.offsetWidth, h: node.offsetHeight };
  }
  var linkSeq = 0;
  function renderLinks(box) {
    var spec = box.getAttribute('data-links') || '';
    var svg = sv('svg', { 'class': 'links', viewBox: '0 0 ' + box.offsetWidth + ' ' + box.offsetHeight, 'aria-hidden': 'true' });
    box.insertBefore(svg, box.firstChild);
    var id = 'lk' + (++linkSeq), defs = sv('defs', null, svg);
    [['a', 'var(--faint)'], ['e', 'var(--accent)']].forEach(function (m) {
      var mk = sv('marker', { id: id + m[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 9, markerHeight: 9, orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse' }, defs);
      sv('path', { d: 'M0,1L10,5L0,9Z', style: 'fill:' + m[1] }, mk);
    });
    spec.split(/[;\n]+/).forEach(function (raw) {
      var s = raw.trim(); if (!s) return;
      var m = s.match(/^([\w.-]+)\s*(<-->|<->|<=>|-->|->|=>|--|>)\s*([\w.-]+)\s*(?:\[([hv])\])?\s*(?::\s*(.*))?$/);
      if (!m) return;
      var route = m[4], label = m[5];
      var a = box.querySelector('[data-id="' + m[1] + '"]'), b = box.querySelector('[data-id="' + m[3] + '"]');
      if (!a || !b) return;
      var op = m[2], em = op.indexOf('=') >= 0, dash = op.indexOf('--') >= 0 && op !== '--', both = op.charAt(0) === '<', arrow = op !== '--';
      var A = relBox(a, box), B = relBox(b, box), g = 3, d, lx, ly;
      var ovY = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y), ovX = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x);
      var acx = A.x + A.w / 2, acy = A.y + A.h / 2, bcx = B.x + B.w / 2, bcy = B.y + B.h / 2;
      if (ovY > 14 && (B.x >= A.x + A.w || B.x + B.w <= A.x)) {
        var yy = (Math.max(A.y, B.y) + Math.min(A.y + A.h, B.y + B.h)) / 2, r = B.x >= A.x + A.w;
        var x1 = r ? A.x + A.w + g : A.x - g, x2 = r ? B.x - g : B.x + B.w + g;
        d = 'M' + x1 + ',' + yy + 'H' + x2; lx = (x1 + x2) / 2; ly = yy;
      } else if (ovX > 14 && (B.y >= A.y + A.h || B.y + B.h <= A.y)) {
        var xx = (Math.max(A.x, B.x) + Math.min(A.x + A.w, B.x + B.w)) / 2, dn = B.y >= A.y + A.h;
        var y1 = dn ? A.y + A.h + g : A.y - g, y2 = dn ? B.y - g : B.y + B.h + g;
        d = 'M' + xx + ',' + y1 + 'V' + y2; lx = xx; ly = (y1 + y2) / 2;
      } else if (route ? route === 'h' : Math.abs(bcx - acx) >= Math.abs(bcy - acy)) {
        var sx = bcx > acx ? A.x + A.w + g : A.x - g, ey = bcy > acy ? B.y - g : B.y + B.h + g, rc = 8;
        var dx = bcx > acx ? 1 : -1, dy = bcy > acy ? 1 : -1;
        d = 'M' + sx + ',' + acy + 'H' + (bcx - dx * rc) + 'Q' + bcx + ',' + acy + ' ' + bcx + ',' + (acy + dy * rc) + 'V' + ey;
        // label the segment that ends at the target, so fan-out links from one box never stack labels
        if (Math.abs(ey - acy) >= 36) { lx = bcx; ly = (acy + ey) / 2; } else { lx = (sx + bcx) / 2; ly = acy; }
      } else {
        var sy = bcy > acy ? A.y + A.h + g : A.y - g, ex = bcx > acx ? B.x - g : B.x + B.w + g, rc2 = 8;
        var ddx = bcx > acx ? 1 : -1, ddy = bcy > acy ? 1 : -1;
        d = 'M' + acx + ',' + sy + 'V' + (bcy - ddy * rc2) + 'Q' + acx + ',' + bcy + ' ' + (acx + ddx * rc2) + ',' + bcy + 'H' + ex;
        if (Math.abs(ex - acx) >= 60) { lx = (acx + ex) / 2; ly = bcy; } else { lx = acx; ly = (sy + bcy) / 2; }
      }
      var p = sv('path', { d: d, 'class': (dash ? 'dash ' : '') + (em ? 'em' : '') }, svg);
      if (arrow) p.setAttribute('marker-end', 'url(#' + id + (em ? 'e' : 'a') + ')');
      if (both) p.setAttribute('marker-start', 'url(#' + id + (em ? 'e' : 'a') + ')');
      if (label) { var lb = el('div', 'link-label' + (em ? ' em' : ''), box, label); lb.style.left = lx + 'px'; lb.style.top = ly + 'px'; }
    });
  }

  function renderSequence(script) {
    var fig = script.closest('figure') || script.parentNode, cfg;
    try { cfg = JSON.parse(script.textContent); } catch (e) { fig.appendChild(el('p', 'small', null, 'Sequence JSON error: ' + e.message)); return; }
    var plot = el('div', 'plot', fig), w = plot.clientWidth, h = plot.clientHeight || 320;
    var svg = sv('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': 'Sequence diagram' }, plot);
    var actors = cfg.actors || [], steps = (cfg.steps || []).map(function (s) {
      return Array.isArray(s) ? { from: s[0], to: s[1], label: s[2], reply: s[3] === 'reply', em: s[3] === 'em' } : s;
    });
    var id = 'sq' + (++linkSeq), defs = sv('defs', null, svg);
    [['a', 'var(--ink-2)'], ['r', 'var(--faint)'], ['e', 'var(--accent)']].forEach(function (m) {
      var mk = sv('marker', { id: id + m[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto', markerUnits: 'userSpaceOnUse' }, defs);
      sv('path', { d: 'M0,1L10,5L0,9Z', style: 'fill:' + m[1] }, mk);
    });
    var col = w / actors.length, ax = function (n) { return col * (actors.indexOf(n) + 0.5); }, head = 40;
    var hl = [].concat(cfg.highlight || []);
    actors.forEach(function (a, i) {
      var g = sv('g', { 'class': 'actor' + (hl.indexOf(a) >= 0 ? ' accent' : '') }, svg), bw = Math.min(col - 16, Math.max(96, tw(a, 13.5, 650) + 28));
      sv('rect', { x: col * (i + 0.5) - bw / 2, y: 0, width: bw, height: 34, rx: 7 }, g);
      txt(g, col * (i + 0.5), 22, a, null, 'middle');
      sv('line', { x1: col * (i + 0.5), x2: col * (i + 0.5), y1: 34, y2: h, 'class': 'life' }, svg);
    });
    var row = Math.min(56, (h - head - 12) / Math.max(steps.length, 1));
    steps.forEach(function (s, i) {
      var y = head + row * (i + 0.72), x1 = ax(s.from), x2 = ax(s.to), cls = 'msg' + (s.reply ? ' reply' : '') + (s.em ? ' em' : '');
      var mk = 'url(#' + id + (s.em ? 'e' : s.reply ? 'r' : 'a') + ')';
      if (x1 === x2) {
        sv('path', { d: 'M' + x1 + ',' + (y - 8) + 'h34v16h-32', 'class': cls, 'marker-end': mk }, svg);
        txt(svg, x1 + 40, y + 4, s.label, 'ml' + (s.em ? ' em' : ''));
      } else {
        var dir = x2 > x1 ? 1 : -1;
        sv('line', { x1: x1 + dir * 3, x2: x2 - dir * 3, y1: y, y2: y, 'class': cls, 'marker-end': mk }, svg);
        txt(svg, (x1 + x2) / 2, y - 7, s.label, 'ml' + (s.em ? ' em' : ''), 'middle');
      }
      if (cfg.numbered !== false) {
        sv('circle', { cx: x1 + (x2 >= x1 ? 12 : -12), cy: y - 12, r: 8, 'class': 'num' }, svg);
        txt(svg, x1 + (x2 >= x1 ? 12 : -12), y - 8.5, String(i + 1), 'numt', 'middle');
      }
    });
    srTable(fig, ['#', 'From', 'To', 'Message'], steps.map(function (s, i) { return [String(i + 1), s.from, s.to, s.label]; }));
  }

  /* index children so CSS can place cycle / hub / pyramid / funnel items */
  function indexKids(sel, childSel, extra) {
    deck.querySelectorAll(sel).forEach(function (box) {
      var kids = box.querySelectorAll(':scope > ' + childSel), n = kids.length;
      box.style.setProperty('--n', n);
      kids.forEach(function (k, i) { k.style.setProperty('--i', i); k.style.setProperty('--t', n > 1 ? i / (n - 1) : 0); if (extra) extra(box, i, n); });
    });
  }

  /* ---------------- deck chrome & navigation ---------------- */
  function fit() { deck.style.setProperty('--scale', Math.min(innerWidth / W, innerHeight / H)); }
  var bar = el('div', 'progress', doc.body);
  var nav = el('div', 'nav', doc.body);
  var prevB = el('button', 'ghost', nav, '←'), count = el('span', 'count', nav), nextB = el('button', null, nav, '→');
  var ovB = el('button', 'ghost ov', nav, '▦');
  var showB = el('button', 'ghost', nav, '▶');
  prevB.title = 'Previous (←)'; nextB.title = 'Next (→ / Space)'; ovB.title = 'Overview (O)'; showB.title = 'Slide show (F5 · Shift+F5 from here)';
  var notesP = el('div', 'notes-panel', doc.body);
  var blank = el('div', 'blank', doc.body);

  /* one-pager spotlight: the grid items of .op, in source order, are the walk-through steps */
  function panelsOf(s) {
    var g = s.querySelector('.op');
    return g ? Array.prototype.filter.call(g.children, function (c) { return !/^(ASIDE|SCRIPT|STYLE|TEMPLATE)$/.test(c.tagName); }) : [];
  }
  function walks(s) {   // → walks the panels by default in a single-slide deck; data-spotlight opts in / "off" opts out
    var v = s.getAttribute('data-spotlight');
    return /\bslide--onepage\b/.test(s.className) && v !== 'off' && (v != null || total === 1);
  }
  var lit = 0;          // 0 = whole page · k = panel k in focus · panels + 1 = whole page again (recap)
  function spot(k) {
    var s = slides[idx], ps = panelsOf(s), on = k > 0 && k <= ps.length;
    lit = k;
    s.classList.toggle('spot', on);
    ps.forEach(function (p, i) { p.classList.toggle('lit', on && i === k - 1); });
    status();
  }
  function slideNotes(s) {
    var all = s.querySelectorAll('.notes');
    for (var i = 0; i < all.length; i++) if (!all[i].closest('.op')) return all[i];
    return null;
  }
  function status() {
    var s = slides[idx], ps = panelsOf(s), n = ps.length, w = walks(s);
    var pn = lit > 0 && lit <= n ? ps[lit - 1].querySelector('.notes') : null, sn = pn || slideNotes(s);
    count.textContent = (idx + 1) + ' / ' + total;
    bar.style.width = (total === 1 ? (n ? Math.min(lit, n) / n * 100 : 0) : (idx + 1) / total * 100) + '%';
    prevB.disabled = idx === 0 && !(w && lit > 0);
    nextB.disabled = idx === total - 1 && !(w && lit <= n);
    notesP.textContent = '';
    el('h6', null, notesP, 'Speaker notes · ' + (idx + 1) + (pn ? ' · panel ' + lit : ''));
    el('div', null, notesP, sn ? sn.textContent.trim() : '—');
  }
  function render() {
    slides.forEach(function (s, i) { s.classList.toggle('active', i === idx); if (i !== idx) s.classList.remove('spot'); });
    spot(lit);
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search + '#' + (idx + 1));
  }
  function go(i, back) {
    i = Math.max(0, Math.min(total - 1, i));
    if (i !== idx) lit = back && walks(slides[i]) ? panelsOf(slides[i]).length + 1 : 0;
    idx = i; render();
  }
  function next() { var s = slides[idx]; if (walks(s) && lit <= panelsOf(s).length) spot(lit + 1); else go(idx + 1); }
  function prev() { if (walks(slides[idx]) && lit > 0) spot(lit - 1); else go(idx - 1, true); }
  function toggleOverview(on) {
    var ov = on != null ? on : !root.classList.contains('overview');
    root.classList.toggle('overview', ov);
    if (ov) { spot(0); slides[idx].scrollIntoView({ block: 'center' }); }
  }
  /* slide show, PowerPoint style: fullscreen, black letterbox, no chrome, idle cursor hides,
     click / wheel advance, B / W blank the screen, number + Enter jumps, Esc ends */
  function showing() { return root.classList.contains('show'); }
  function startShow(from) {
    toggleOverview(false);
    if (from != null) { go(from); spot(0); }
    root.classList.add('show');
    wake();
    if (!doc.fullscreenElement && root.requestFullscreen) root.requestFullscreen().catch(function () {});
  }
  function endShow() {
    root.classList.remove('show', 'cursor');
    blankOff();
    if (doc.fullscreenElement) doc.exitFullscreen();
  }
  function blankOn(c) { blank.className = 'blank on ' + c; }
  function blankOff() { var on = /\bon\b/.test(blank.className); blank.className = 'blank'; return on; }
  var idleT = null;
  function wake() {   // show the cursor on mouse move, hide it after 2s still
    root.classList.add('cursor');
    clearTimeout(idleT);
    idleT = setTimeout(function () { root.classList.remove('cursor'); }, 2000);
  }
  doc.addEventListener('fullscreenchange', function () { if (!doc.fullscreenElement && showing()) endShow(); fit(); });
  doc.addEventListener('mousemove', function () { if (showing()) wake(); });
  doc.addEventListener('click', function (e) {
    if (!showing() || root.classList.contains('overview') || e.button !== 0) return;
    if (blankOff()) return;
    if (e.target.closest('a, button, input, select, textarea, summary, .nav')) return;
    if (slides[idx].getAttribute('data-spotlight') !== 'off' && e.target.closest('.op > *')) return;   // panel click focuses it
    next();
  });
  var wheelAt = 0;
  doc.addEventListener('wheel', function (e) {
    if (!showing() || root.classList.contains('overview') || !e.deltaY) return;
    var now = Date.now();
    if (now - wheelAt < 350) return;
    wheelAt = now;
    blankOff();
    if (e.deltaY > 0) next(); else prev();
  }, { passive: true });
  var jump = '';        // digits typed before Enter
  prevB.onclick = prev;
  nextB.onclick = next;
  ovB.onclick = function () { toggleOverview(); };
  showB.onclick = function () { startShow(); };
  slides.forEach(function (s, i) {
    s.addEventListener('click', function () { if (root.classList.contains('overview')) { toggleOverview(false); go(i); } });
    panelsOf(s).forEach(function (p, j) {   // click a panel to focus it, click again to see the whole page
      p.addEventListener('click', function () {
        if (i === idx && !root.classList.contains('overview') && s.getAttribute('data-spotlight') !== 'off') spot(lit === j + 1 ? 0 : j + 1);
      });
    });
  });
  doc.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (k === 'F5') { e.preventDefault(); startShow(e.shiftKey ? null : 0); return; }
    if (showing() && blankOff()) { e.preventDefault(); return; }   // any key lifts a blank screen
    if (/^[0-9]$/.test(k)) { jump += k; return; }
    if (k === 'Enter' && jump) { e.preventDefault(); go(parseInt(jump, 10) - 1); spot(0); jump = ''; return; }
    jump = '';
    if (showing() && (k === 'b' || k === 'B' || k === '.')) { blankOn('black'); return; }
    if (showing() && (k === 'w' || k === 'W' || k === ',')) { blankOn('white'); return; }
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); prev(); }
    else if (k === 'Home') { go(0); spot(0); }
    else if (k === 'End') { go(total - 1); spot(0); }
    else if (k === 'o' || k === 'O') toggleOverview();
    else if (k === 'Escape') { if (slides[idx].classList.contains('spot')) spot(0); else if (root.classList.contains('overview')) toggleOverview(false); else if (showing()) endShow(); }
    else if (k === 'n' || k === 'N') notesP.classList.toggle('on');
    else if (k === 'f' || k === 'F') { if (showing()) endShow(); else startShow(); }
  });
  var tx = null;
  doc.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  doc.addEventListener('touchend', function (e) {
    if (tx == null) return; var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); } tx = null;
  });
  addEventListener('resize', fit);
  addEventListener('beforeprint', function () { spot(0); });
  addEventListener('hashchange', function () { var n = parseInt(location.hash.slice(1), 10); if (n) go(n - 1); });

  /* ---------------- layout audit (?audit) ----------------
     Measures every slide and reports boxes outside the stage, clipped boxes, content over the footer and text
     under 10px as JSON in a pre.audit element; scripts/render_slides.py --audit reads it via --dump-dom. */
  function audit() {
    var report = [];
    function desc(e) {
      var c = (e.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 3);
      return e.tagName.toLowerCase() + (c.length ? '.' + c.join('.') : '');
    }
    function ownText(e) {
      for (var n = e.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && /\S/.test(n.nodeValue)) return true;
      return false;
    }
    slides.forEach(function (s, i) {
      var r = s.getBoundingClientRect(), k = r.width / W || 1, items = [], seen = {};
      var foot = s.querySelector('.slide-foot'), fr = foot && foot.getBoundingClientRect();
      var h = s.querySelector('h1,h2'), title = h ? h.textContent.trim().replace(/\s+/g, ' ').slice(0, 48) : '';
      function add(e, what) {
        var key = desc(e) + '|' + what;
        if (seen[key]) return;
        seen[key] = 1;
        items.push({ el: desc(e), text: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 40), what: what });
      }
      Array.prototype.forEach.call(s.querySelectorAll('*'), function (e) {
        if (e.closest('.slide-foot, .ov-num, .sr-only, .notes, .links, .spark, .hit')) return;
        var cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.position === 'fixed' || cs.opacity === '0') return;
        var b = e.getBoundingClientRect();
        if (!(b.width || b.height)) return;
        var out = Math.max(b.right - r.right, b.bottom - r.bottom, r.left - b.left, r.top - b.top) / k;
        var text = ownText(e), content = text || /^(svg|img)$/i.test(e.tagName);
        if (out > 1) add(e, 'outside the slide by ' + Math.round(out) + 'px');
        else if (fr && content && b.bottom > fr.top + 1 && b.top < fr.bottom) add(e, 'runs into the footer');
        if (/^(hidden|clip|auto|scroll)$/.test(cs.overflowY) || /^(hidden|clip|auto|scroll)$/.test(cs.overflowX)) {
          var dy = e.scrollHeight - e.clientHeight, dx = e.scrollWidth - e.clientWidth;
          if (dy > 1 || dx > 1) add(e, 'clips ' + (dy > 1 ? dy + 'px of height' : dx + 'px of width'));
        }
        if (text && parseFloat(cs.fontSize) < 10) add(e, 'text at ' + parseFloat(cs.fontSize) + 'px (min 10)');
      });
      report.push({ slide: i + 1, title: title, items: items });
    });
    var pre = el('pre', 'audit', doc.body);
    pre.id = 'audit';
    pre.textContent = JSON.stringify(report);
  }

  /* ---------------- init ---------------- */
  if (params.has('clean')) root.classList.add('clean');
  root.classList.toggle('single', total === 1);
  root.classList.toggle('walk', total === 1 && walks(slides[0]));
  var footer = deck.getAttribute('data-footer') || '';
  slides.forEach(function (s, i) {
    el('div', 'ov-num', s, String(i + 1));   // slide number badge, shown only in the overview grid
    if (/\bslide--(title|section|closing)\b/.test(s.className) || s.hasAttribute('data-nofoot')) return;
    var f = el('div', 'slide-foot', s);
    el('span', null, f, footer);
    el('span', null, f, total > 1 ? String(i + 1) : '');
  });
  fit();
  indexKids('.cycle', '.node', function (box, i, n) { if (i === 0) for (var j = 0; j < n; j++) { var a = el('i', 'cyc-arrow', box); a.style.setProperty('--i', j); } });
  indexKids('.hub', '.node', function (box, i) { var sp = el('i', 'spoke', null); sp.style.setProperty('--i', i); box.insertBefore(sp, box.firstChild); });
  indexKids('.pyramid', '.tier');
  indexKids('.funnel', '.stage');
  indexKids('.pillars', '.pillar');
  deck.querySelectorAll('.spark[data-values]').forEach(renderSpark);
  deck.querySelectorAll('script[data-chart]').forEach(function (s) { try { renderChart(s); } catch (e) { console.error('html-deck chart', e); } });
  deck.querySelectorAll('script[data-diagram="sequence"]').forEach(function (s) { try { renderSequence(s); } catch (e) { console.error('html-deck sequence', e); } });
  deck.querySelectorAll('[data-links]').forEach(function (b) { try { renderLinks(b); } catch (e) { console.error('html-deck links', e); } });
  var start = parseInt(location.hash.slice(1), 10);
  go(start ? start - 1 : 0);
  if (params.has('overview')) toggleOverview(true);
  if (params.has('audit')) setTimeout(audit, 50);
})();
