/* ui.js — helper UI pakai-ulang untuk PLANNER. Vanilla, no-build.
   Base: el/esc/toast/modal/spinner/icon + viz premium: spark/ringz/donut/
   statCard/hero/countUp. Tambahan planner: radar(wheel of life), heatmap
   (streak kalender), gauge, bars, barsH, streakDots, progress, chips,
   confirm, prompt, sheet, date helpers. */
window.UI = (function () {
  function el(tag, attrs, kids) {
    var e = document.createElement(tag); attrs = attrs || {};
    for (var k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else if (k.slice(0, 2) === "on" && typeof attrs[k] === "function") e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) {
      if (c == null) return;
      if (typeof c === "string") e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    });
    return e;
  }
  function money(n) { n = Math.round(+n || 0); return (n < 0 ? "−" : "") + "Rp" + Math.abs(n).toLocaleString("id-ID"); }
  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function toast(msg, type) {
    var host = document.getElementById("toasts");
    if (!host) { host = el("div", { id: "toasts", class: "toasts" }); document.body.appendChild(host); }
    var t = el("div", { class: "toast " + (type || ""), text: msg });
    host.appendChild(t);
    setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 300); }, 2600);
  }
  function modal(title, contentEl, opts) {
    opts = opts || {};
    var box = el("div", { class: "modal-box" }, [
      el("div", { class: "modal-head" }, [el("h3", { text: title }), el("button", { class: "x", html: "&times;", onclick: close })]),
      el("div", { class: "modal-body" }, [contentEl])
    ]);
    if (opts.wide) box.classList.add("wide");
    var ov = el("div", { class: "modal-ov", onclick: function (e) { if (e.target === ov) close(); } }, [box]);
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add("show"); });
    function close() { ov.classList.remove("show"); setTimeout(function () { ov.remove(); }, 220); }
    document.addEventListener("keydown", function esc2(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc2); } });
    return { close: close, box: box };
  }
  function confirm(title, msg, onYes, opts) {
    opts = opts || {};
    var yes = el("button", { class: "btn " + (opts.danger ? "btn-danger" : "btn-primary"), text: opts.yes || "Ya, lanjut" });
    var no = el("button", { class: "btn btn-ghost", text: "Batal" });
    var body = el("div", {}, [el("p", { class: "hint", text: msg, style: "font-size:14px;margin-bottom:18px" }), el("div", { class: "row gap8", style: "justify-content:flex-end" }, [no, yes])]);
    var m = modal(title, body);
    no.addEventListener("click", m.close);
    yes.addEventListener("click", function () { m.close(); onYes && onYes(); });
  }
  function spinner(label) { return el("div", { class: "spin" }, [el("span", { class: "dot" }), label || "AI sedang berpikir…"]); }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function icon(name, cls) { return el("i", { class: "ti ti-" + name + (cls ? " " + cls : ""), "aria-hidden": "true" }); }

  /* ---- form field helper ---- */
  function field(label, inp, hint) {
    return el("label", { class: "fld" }, [el("span", { text: label }), inp, hint ? el("span", { class: "fhint", text: hint }) : null]);
  }
  function input(o) { o = o || {}; var i = el("input", { class: "input", type: o.type || "text", placeholder: o.ph || "" }); if (o.val != null) i.value = o.val; return i; }
  function textarea(o) { o = o || {}; var i = el("textarea", { class: "input", placeholder: o.ph || "", rows: o.rows || 3 }); if (o.val != null) i.value = o.val; return i; }
  function select(opts, val) {
    var s = el("select", { class: "input" });
    opts.forEach(function (o) { var v = typeof o === "string" ? o : o.v, l = typeof o === "string" ? o : o.l; var op = el("option", { value: v, text: l }); if (v === val) op.selected = true; s.appendChild(op); });
    return s;
  }

  var NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  var uidn = 0;

  /* sparkline area */
  function spark(data, o) {
    o = o || {}; var w = o.w || 200, h = o.h || 34, id = "sg" + (++uidn); var color = o.color || "var(--primary)";
    var max = Math.max.apply(null, data.concat([1])), min = Math.min.apply(null, data.concat([0])); var span = (max - min) || 1;
    var pts = data.map(function (v, i) { var x = data.length > 1 ? i / (data.length - 1) * w : w / 2; var y = h - 3 - (v - min) / span * (h - 8); return [x.toFixed(1), y.toFixed(1)]; });
    var line = pts.map(function (p, i) { return (i ? "L" : "M") + p[0] + "," + p[1]; }).join("");
    var area = line + "L" + w + "," + h + "L0," + h + "Z";
    var svg = svgEl("svg", { viewBox: "0 0 " + w + " " + h, preserveAspectRatio: "none" });
    var defs = svgEl("defs", {}); var grad = svgEl("linearGradient", { id: id, x1: "0", y1: "0", x2: "0", y2: "1" });
    grad.appendChild(svgEl("stop", { offset: "0", "stop-color": color, "stop-opacity": ".34" }));
    grad.appendChild(svgEl("stop", { offset: "1", "stop-color": color, "stop-opacity": "0" })); defs.appendChild(grad); svg.appendChild(defs);
    svg.appendChild(svgEl("path", { d: area, fill: "url(#" + id + ")" }));
    svg.appendChild(svgEl("path", { d: line, fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }));
    var last = pts[pts.length - 1]; if (last) svg.appendChild(svgEl("circle", { cx: last[0], cy: last[1], r: "2.6", fill: color }));
    return svg;
  }

  /* progress ring */
  function ringz(pct, o) {
    o = o || {}; var size = o.size || 92, st = o.stroke || 8, color = o.color || "var(--primary)";
    var r = (size - st) / 2, c = 2 * Math.PI * r; var val = Math.max(0, Math.min(100, +pct || 0));
    var svg = svgEl("svg", { width: size, height: size, viewBox: "0 0 " + size + " " + size });
    svg.appendChild(svgEl("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: "var(--line)", "stroke-width": st }));
    var fg = svgEl("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: color, "stroke-width": st, "stroke-linecap": "round", "stroke-dasharray": c, "stroke-dashoffset": c });
    fg.style.transition = "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)"; svg.appendChild(fg);
    var wrap = el("div", { class: "ringz", style: "width:" + size + "px;height:" + size + "px" }, [svg,
      el("div", { class: "lab" }, [el("div", { class: "num", style: "font-size:" + Math.round(size * .26) + "px", text: (o.label != null ? o.label : Math.round(val) + "%") }), o.of ? el("div", { class: "of", text: o.of }) : null])]);
    requestAnimationFrame(function () { requestAnimationFrame(function () { fg.setAttribute("stroke-dashoffset", c * (1 - val / 100)); }); });
    return wrap;
  }

  /* gauge setengah lingkaran untuk skor 0-100 */
  function gauge(pct, o) {
    o = o || {}; var w = o.w || 200, st = o.stroke || 13, color = o.color || "var(--primary)";
    var h = w / 2 + st; var r = (w - st) / 2, cx = w / 2, cy = w / 2; var c = Math.PI * r;
    var val = Math.max(0, Math.min(100, +pct || 0));
    var svg = svgEl("svg", { viewBox: "0 0 " + w + " " + h, width: "100%" });
    var d = "M " + st / 2 + " " + cy + " A " + r + " " + r + " 0 0 1 " + (w - st / 2) + " " + cy;
    svg.appendChild(svgEl("path", { d: d, fill: "none", stroke: "var(--line)", "stroke-width": st, "stroke-linecap": "round" }));
    var fg = svgEl("path", { d: d, fill: "none", stroke: color, "stroke-width": st, "stroke-linecap": "round", "stroke-dasharray": c, "stroke-dashoffset": c });
    fg.style.transition = "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)"; svg.appendChild(fg);
    var wrap = el("div", { class: "gauge" }, [svg, el("div", { class: "gauge-lab" }, [
      el("div", { class: "gnum" }, [numSpan(val, o.fmt)]), o.of ? el("div", { class: "gof", text: o.of }) : null])]);
    requestAnimationFrame(function () { requestAnimationFrame(function () { fg.setAttribute("stroke-dashoffset", c * (1 - val / 100)); }); });
    return wrap;
  }
  function numSpan(v, fmt) { var s = el("span", { text: "0" }); countUp(s, v, fmt); return s; }

  /* radar / wheel of life. axes:[{label,val(0-100),color?}] */
  function radar(axes, o) {
    o = o || {}; var size = o.size || 260, cx = size / 2, cy = size / 2, R = size / 2 - 34;
    var n = axes.length, color = o.color || "var(--primary)";
    var svg = svgEl("svg", { viewBox: "0 0 " + size + " " + size, width: "100%", class: "radar-svg" });
    // rings
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var pts = []; for (var i = 0; i < n; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; pts.push((cx + Math.cos(a) * R * f).toFixed(1) + "," + (cy + Math.sin(a) * R * f).toFixed(1)); }
      svg.appendChild(svgEl("polygon", { points: pts.join(" "), fill: "none", stroke: "var(--line)", "stroke-width": "1" }));
    });
    // spokes + labels
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      svg.appendChild(svgEl("line", { x1: cx, y1: cy, x2: cx + Math.cos(a) * R, y2: cy + Math.sin(a) * R, stroke: "var(--line)", "stroke-width": "1" }));
      var lx = cx + Math.cos(a) * (R + 18), ly = cy + Math.sin(a) * (R + 18);
      var anchor = Math.abs(Math.cos(a)) < 0.3 ? "middle" : (Math.cos(a) > 0 ? "start" : "end");
      var tx = svgEl("text", { x: lx.toFixed(1), y: (ly + 4).toFixed(1), "text-anchor": anchor, fill: "var(--muted)", "font-size": "10.5", "font-weight": "600" }); tx.textContent = axes[i].label;
      svg.appendChild(tx);
    }
    // data polygon
    var dpts = []; for (var j = 0; j < n; j++) { var aa = -Math.PI / 2 + j * 2 * Math.PI / n; var f = Math.max(0, Math.min(100, axes[j].val)) / 100; dpts.push((cx + Math.cos(aa) * R * f).toFixed(1) + "," + (cy + Math.sin(aa) * R * f).toFixed(1)); }
    var poly = svgEl("polygon", { points: dpts.join(" "), fill: "color-mix(in srgb," + color + " 20%,transparent)", stroke: color, "stroke-width": "2", "stroke-linejoin": "round", opacity: "0" });
    poly.style.transition = "opacity .8s ease"; svg.appendChild(poly);
    for (var d2 = 0; d2 < n; d2++) { var p = dpts[d2].split(","); svg.appendChild(svgEl("circle", { cx: p[0], cy: p[1], r: "3", fill: color })); }
    requestAnimationFrame(function () { requestAnimationFrame(function () { poly.setAttribute("opacity", "1"); }); });
    return svg;
  }

  /* heatmap streak — days:[{d(Date|ts), v(0..1)}] atau map ISO->intensity.
     weeks kolom, 7 baris (Sen-Min). */
  function heatmap(map, o) {
    o = o || {}; var weeks = o.weeks || 20, cell = o.cell || 13, gap = 3, color = o.color || "var(--primary)";
    var wrap = el("div", { class: "heatmap" });
    var svg = svgEl("svg", { width: weeks * (cell + gap), height: 7 * (cell + gap) + 4 });
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var start = new Date(today); start.setDate(start.getDate() - (weeks * 7 - 1));
    // align to Monday
    var dow = (start.getDay() + 6) % 7; start.setDate(start.getDate() - dow);
    for (var w = 0; w < weeks; w++) for (var d = 0; d < 7; d++) {
      var cur = new Date(start); cur.setDate(start.getDate() + w * 7 + d);
      if (cur > today) continue;
      var iso = cur.toISOString().slice(0, 10);
      var v = typeof map[iso] === "number" ? map[iso] : 0;
      var op = v <= 0 ? 0 : (0.22 + 0.78 * Math.min(1, v));
      var fill = v <= 0 ? "var(--line)" : "color-mix(in srgb," + color + " " + Math.round(op * 100) + "%,transparent)";
      var rect = svgEl("rect", { x: w * (cell + gap), y: d * (cell + gap), width: cell, height: cell, rx: 3, fill: fill });
      rect.appendChild(svgEl("title", {})).textContent = iso + (v > 0 ? "" : " · kosong");
      svg.appendChild(rect);
    }
    wrap.appendChild(svg); return wrap;
  }

  /* vertical bars. data:[{label,val,dim?}] */
  function bars(data, o) {
    o = o || {}; var max = Math.max.apply(null, data.map(function (x) { return x.val; }).concat([1]));
    var wrap = el("div", { class: "vbars", style: "height:" + (o.h || 120) + "px" });
    data.forEach(function (x) {
      var col = el("div", { class: "vbar-col" }, [
        el("div", { class: "vbar-track" }, [el("div", { class: "vbar" + (x.dim ? " dim" : ""), style: "height:" + Math.round(x.val / max * 100) + "%", title: x.val })]),
        el("div", { class: "vbar-lbl", text: x.label })
      ]);
      wrap.appendChild(col);
    });
    return wrap;
  }
  /* horizontal bars. rows:[{label,val,max?,color?,note?}] */
  function barsH(rows, o) {
    o = o || {}; var gmax = o.max || Math.max.apply(null, rows.map(function (r) { return r.max || r.val; }).concat([1]));
    var wrap = el("div", { class: "hbars" });
    rows.forEach(function (r) {
      var mx = r.max || gmax, pct = Math.max(0, Math.min(100, r.val / mx * 100));
      wrap.appendChild(el("div", { class: "hbar-row" }, [
        el("div", { class: "hbar-head" }, [el("span", { text: r.label }), el("span", { class: "hbar-note", text: r.note != null ? r.note : (Math.round(pct) + "%") })]),
        el("div", { class: "hbar-track" }, [el("div", { class: "hbar-fill", style: "width:" + pct + "%;background:" + (r.color || "var(--primary)") })])
      ]));
    });
    return wrap;
  }

  /* 7 titik streak terakhir. arr boolean[] */
  function streakDots(arr) {
    return el("div", { class: "sdots" }, arr.map(function (on) { return el("span", { class: "sdot" + (on ? " on" : "") }); }));
  }
  function progress(pct, o) {
    o = o || {}; pct = Math.max(0, Math.min(100, pct));
    return el("div", { class: "prog" + (o.sm ? " sm" : "") }, [el("div", { class: "prog-fill", style: "width:" + pct + "%" + (o.color ? ";background:" + o.color : "") })]);
  }
  function chip(text, cls) { return el("span", { class: "chip " + (cls || ""), text: text }); }
  function tag(text, color) { return el("span", { class: "tag", style: "color:" + color + ";background:color-mix(in srgb," + color + " 13%,transparent);border-color:color-mix(in srgb," + color + " 28%,transparent)", text: text }); }

  function countUp(node, to, fmt, dur) {
    to = +to || 0; fmt = fmt || function (v) { return Math.round(v).toLocaleString("id-ID"); }; dur = dur || 850;
    var t0 = null;
    function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / dur); var e = 1 - Math.pow(1 - p, 3); node.textContent = fmt(to * e); if (p < 1) requestAnimationFrame(step); else node.textContent = fmt(to); }
    requestAnimationFrame(step); return node;
  }
  function statCard(o) {
    o = o || {};
    var valEl = el("div", { class: "cval", text: typeof o.value === "string" ? o.value : "" });
    var card = el("div", { class: "card" }, [
      o.icon ? el("span", { class: "icchip" }, [icon(o.icon)]) : null,
      el("div", { class: "clbl", text: o.label || "" }), valEl,
      o.delta ? el("div", { class: "cdelta " + (o.dir || ""), text: o.delta }) : null,
      o.spark && o.spark.length > 1 ? el("div", { class: "sparkbox" }, [spark(o.spark, { color: o.color })]) : null
    ]);
    if (typeof o.value === "number") countUp(valEl, o.value, o.fmt);
    return card;
  }
  function hero(o) {
    o = o || {};
    var left = el("div", { style: "flex:1;min-width:230px" }, [
      o.kick ? el("div", { class: "kick", text: o.kick }) : null,
      el("h1", { class: "h1", html: o.title || "" }),
      o.sub ? el("div", { class: "sub", text: o.sub }) : null,
      o.kpis && o.kpis.length ? el("div", { class: "hero-kpis" }, o.kpis.map(function (k) {
        var vEl = el("div", { class: "v", text: typeof k.v === "string" ? k.v : "" });
        if (typeof k.v === "number") countUp(vEl, k.v, k.fmt);
        return el("div", { class: "hkpi" }, [el("div", { class: "k", text: k.k }), vEl, k.d ? el("div", { class: "d " + (k.dir || ""), text: k.d }) : null]);
      })) : null
    ]);
    var rowKids = [left];
    if (o.right) rowKids.push(el("div", { style: "flex:none;display:flex;align-items:center;gap:14px" }, [o.right]));
    var kids = [el("div", { class: "hero-row" }, rowKids)];
    if (o.actions && o.actions.length) kids.push(el("div", { class: "row gap8", style: "margin-top:16px" }, o.actions));
    return el("section", { class: "hero" }, kids);
  }
  function briefing(html, opts) {
    opts = opts || {};
    return el("div", { class: "briefing" }, [
      el("div", { class: "bh" }, [icon(opts.icon || "sparkles"), el("span", { text: opts.title || "Briefing AI" })]),
      el("p", { html: html })
    ]);
  }
  function empty(msg, actionEl) { return el("div", { class: "empty" }, [el("div", { html: msg }), actionEl ? el("div", { style: "margin-top:14px" }, [actionEl]) : null]); }
  function section(title, kids, right) {
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-head" }, [el("h2", { class: "h2", text: title }), right || null]),
      el("div", {}, kids)
    ]);
  }
  function viewHead(title, sub, right) {
    return el("div", { class: "view-head" }, [
      el("div", {}, [el("div", { class: "kick", text: sub || "" }), el("h1", { class: "h1", text: title })]),
      right || null
    ]);
  }

  /* ---- date helpers ---- */
  var HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  var HARIS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  var BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  function iso(d) { d = d || new Date(); return new Date(d).toISOString().slice(0, 10); }
  function todayISO() { var d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString().slice(0, 10); }
  function fmtDate(d, long) { d = new Date(d); return d.getDate() + " " + (long ? BULAN[d.getMonth()] : BULAN[d.getMonth()].slice(0, 3)) + (long ? " " + d.getFullYear() : ""); }
  function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 864e5); }

  return {
    el: el, money: money, esc: esc, toast: toast, modal: modal, confirm: confirm, spinner: spinner, clear: clear, icon: icon,
    field: field, input: input, textarea: textarea, select: select,
    spark: spark, ringz: ringz, gauge: gauge, radar: radar, heatmap: heatmap, bars: bars, barsH: barsH,
    streakDots: streakDots, progress: progress, chip: chip, tag: tag, countUp: countUp, statCard: statCard, hero: hero,
    briefing: briefing, empty: empty, section: section, viewHead: viewHead,
    HARI: HARI, HARIS: HARIS, BULAN: BULAN, iso: iso, todayISO: todayISO, fmtDate: fmtDate, daysBetween: daysBetween
  };
})();
