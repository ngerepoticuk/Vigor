/* beranda.js — Dashboard: skor hidup (gauge), KPI, wheel radar, momentum,
   cek cepat kebiasaan hari ini, insight feed, briefing AI. */
window.Shell.register({
  id: "beranda", nama: "Beranda", icon: "layout-dashboard",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store, I = ctx.intel, spec = ctx.spec;
    var ov = I.overview();
    var b = ctx.brain.get();
    var salam = greet();
    var nama = b.diri.nama ? (", " + b.diri.nama) : "";

    // HERO: skor hidup + salam
    var scoreLabel = spec.scoreLabel || "Skor Hidup";
    var gauge = UI.gauge(ov.life.score, { of: scoreLabel, w: 220 });
    var hero = UI.el("section", { class: "hero" }, [
      UI.el("div", { class: "hero-row" }, [
        UI.el("div", { style: "flex:1;min-width:230px" }, [
          UI.el("div", { class: "kick", text: salam.toUpperCase() + nama }),
          UI.el("h1", { class: "h1", html: spec.heroTitle || "Hari ini, satu langkah lebih dekat." }),
          UI.el("div", { class: "sub", text: b.diri.musim ? ("Musim: " + b.diri.musim) : (spec.heroSub || "Konsistensi kecil, hasil besar.") }),
          UI.el("div", { class: "hero-kpis" }, [
            kpi("Kebiasaan hari ini", ov.doneToday + "/" + ov.habitCount),
            kpi("Konsistensi 28h", ov.consistency + "%"),
            kpi("Streak terbaik", ov.bestStreak + " hari"),
            kpi("Sasaran aktif", ov.goalActive + "")
          ])
        ]),
        UI.el("div", { style: "flex:none;width:230px;max-width:44vw" }, [gauge])
      ])
    ]);
    root.appendChild(hero);

    // grid: wheel + momentum
    var doms = I.domainScores().filter(function (d) { return d.hasData; });
    var wheelPanel = UI.el("div", { class: "panel" }, [
      UI.el("div", { class: "panel-t", text: spec.wheelLabel || "Roda Keseimbangan" }),
      UI.el("div", { class: "hint", text: "Skor tiap area dari kebiasaan + sasaran." }),
      doms.length >= 3 ? UI.radar(doms.map(function (d) { return { label: d.label, val: d.val }; }), { size: 260 })
        : UI.empty("Isi kebiasaan & sasaran di beberapa area untuk memunculkan roda keseimbangan.")
    ]);
    var mo = ov.momentum;
    var momoBars = UI.bars([
      { label: "Mgg lalu", val: mo.prev, dim: true }, { label: "Mgg ini", val: mo.now }
    ], { h: 110 });
    var momoPanel = UI.el("div", { class: "panel" }, [
      UI.el("div", { class: "panel-t", text: "Momentum" }),
      UI.el("div", { class: "hint", text: "Konsistensi 7 hari ini vs 7 hari lalu." }),
      momoBars,
      UI.el("div", { style: "margin-top:14px;display:flex;align-items:center;gap:8px" }, [
        UI.tag((mo.delta >= 0 ? "▲ +" : "▼ ") + mo.delta + " poin", mo.delta >= 0 ? "var(--ok)" : "var(--danger)"),
        UI.el("span", { class: "hint", style: "margin:0", text: ov.avgMood != null ? ("Mood rata-rata " + ov.avgMood + "/5") : "Catat mood di Jurnal" })
      ])
    ]);
    root.appendChild(UI.el("div", { class: "split", style: "margin-top:18px" }, [wheelPanel, momoPanel]));

    // ===== WIDGET "HARI INI" — semua yang perlu dikerjakan dalam 1 panel =====
    var t = I.today();
    root.appendChild(todayWidget());
    function todayWidget() {
      var hs = I.habits();
      var routines = S.get("routines", []);
      var rlog = S.get("routineLog", {})[t] || {};
      var f = (S.get("focus", {}))[t] || {};
      var tasks = S.get("tasks", []).filter(function (x) { return !x.done && x.tenggat && x.tenggat <= t; }).slice(0, 4);
      var panel = UI.el("div", { class: "panel today-widget", style: "margin-top:18px" }, [
        UI.el("div", { class: "flex between center", style: "margin-bottom:14px" }, [
          UI.el("div", { class: "panel-t", style: "margin:0" }, [UI.icon("sun-high"), " Hari Ini — sekali lihat, semua beres"]),
          UI.el("span", { class: "hint", style: "margin:0", text: new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" }) })
        ])
      ]);
      var cols = UI.el("div", { class: "today-cols" });
      // kolom kebiasaan
      if (hs.length) {
        var c1 = UI.el("div", { class: "today-col" }, [UI.el("div", { class: "today-h" }, [UI.icon("flame"), "Kebiasaan"])]);
        hs.slice(0, 5).forEach(function (h) {
          var done = I.isDone(h.id, t);
          var row = UI.el("button", { class: "today-item" + (done ? " on" : ""), onclick: function () { var c = S.get("checks", {}); c[h.id] = c[h.id] || {}; if (c[h.id][t]) delete c[h.id][t]; else c[h.id][t] = 1; S.set("checks", c); row.classList.toggle("on"); } }, [UI.el("span", { class: "ti-check" }, [UI.icon("check")]), UI.el("span", { style: "flex:1;text-align:left", text: h.nama }), UI.el("span", { class: "today-streak", text: "🔥" + I.streakOf(h.id) })]);
          c1.appendChild(row);
        });
        c1.appendChild(UI.el("button", { class: "today-more", onclick: function () { ctx.go("ritme"); } }, ["Semua →"]));
        cols.appendChild(c1);
      }
      // kolom rutinitas (item belum dicentang hari ini)
      if (routines.length) {
        var c2 = UI.el("div", { class: "today-col" }, [UI.el("div", { class: "today-h" }, [UI.icon("sunrise"), "Rutinitas"])]);
        var shown = 0;
        routines.forEach(function (r) {
          r.items.forEach(function (it, i) {
            if (shown >= 5) return;
            var key = r.id + ":" + i, on = !!rlog[key];
            if (on && shown >= 3) return; // prioritaskan yang belum
            shown++;
            var row = UI.el("button", { class: "today-item" + (on ? " on" : ""), onclick: function () { var l = S.get("routineLog", {}); l[t] = l[t] || {}; if (l[t][key]) delete l[t][key]; else l[t][key] = 1; S.set("routineLog", l); row.classList.toggle("on"); } }, [UI.el("span", { class: "ti-check" }, [UI.icon("check")]), UI.el("span", { style: "flex:1;text-align:left", text: it.t })]);
            c2.appendChild(row);
          });
        });
        c2.appendChild(UI.el("button", { class: "today-more", onclick: function () { ctx.go("checklist"); } }, ["Semua →"]));
        cols.appendChild(c2);
      }
      // kolom prioritas + tugas jatuh tempo
      var c3 = UI.el("div", { class: "today-col" }, [UI.el("div", { class: "today-h" }, [UI.icon("target"), "Prioritas & Tugas"])]);
      var top = (f.top || []).filter(function (x) { return x.t; });
      if (top.length) top.slice(0, 3).forEach(function (it, i) {
        var row = UI.el("button", { class: "today-item" + (it.done ? " on" : ""), onclick: function () { var ff = S.get("focus", {}); ff[t] = ff[t] || { niat: "", top: [], blok: [] }; ff[t].top[i] = { t: it.t, done: !it.done }; S.set("focus", ff); row.classList.toggle("on"); } }, [UI.el("span", { class: "ti-check" }, [UI.icon("check")]), UI.el("span", { style: "flex:1;text-align:left", text: it.t })]);
        c3.appendChild(row);
      });
      else c3.appendChild(UI.el("button", { class: "today-item ghost", onclick: function () { ctx.go("fokus"); } }, [UI.icon("plus"), UI.el("span", { style: "flex:1;text-align:left", text: "Tetapkan 3 prioritas harimu" })]));
      tasks.forEach(function (x) {
        var over = x.tenggat < t;
        var row = UI.el("button", { class: "today-item", onclick: function () { x.done = true; x.doneAt = Date.now(); S.update("tasks", x.id, x); row.classList.add("on"); UI.toast("Selesai ✓", "ok"); } }, [UI.el("span", { class: "ti-check" }, [UI.icon("check")]), UI.el("span", { style: "flex:1;text-align:left", text: x.teks }), UI.el("span", { class: "today-due" + (over ? " over" : ""), text: over ? "lewat" : "hari ini" })]);
        c3.appendChild(row);
      });
      c3.appendChild(UI.el("button", { class: "today-more", onclick: function () { ctx.go("checklist"); } }, ["Semua →"]));
      cols.appendChild(c3);
      panel.appendChild(cols);
      return panel;
    }

    // INSIGHT + BRIEFING
    var insWrap = UI.el("div", { class: "sec" }, [UI.el("div", { class: "sec-head" }, [UI.el("h2", { class: "h2", text: "Yang perlu perhatianmu" })])]);
    var insList = UI.el("div", {});
    I.insights().forEach(function (it, i) {
      var row = UI.el("div", { class: "insight " + (it.level || "info") }, [
        UI.el("span", { class: "ic-emoji", text: it.icon || "•" }),
        UI.el("span", { class: "it", text: it.text }),
        it.cta && it.action ? UI.el("span", { class: "cta", text: it.cta + " →", onclick: function () { doAction(it.action, ctx); } }) : null
      ]);
      row.style.animationDelay = (i * 0.06) + "s";
      insList.appendChild(row);
    });
    insWrap.appendChild(insList);
    root.appendChild(insWrap);

    // Briefing AI
    var briefBox = UI.el("div", { style: "margin-top:8px" });
    var briefBtn = UI.el("button", { class: "btn btn-primary", onclick: runBriefing }, [UI.icon("sparkles"), "Minta briefing pagi dari AI"]);
    briefBox.appendChild(briefBtn);
    root.appendChild(briefBox);

    async function runBriefing() {
      if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu di Pengaturan", "err"); ctx.shell.openSettings(); return; }
      UI.clear(briefBox); briefBox.appendChild(UI.spinner("Menyusun briefing personal…"));
      try {
        var o = I.overview(), ds = I.domainScores().filter(function (d) { return d.hasData; });
        var data = "Skor hidup: " + o.life.score + "/100 (konsistensi " + o.life.cons + "%, progres sasaran " + o.life.goalProg + "%, keseimbangan " + o.life.balance + "). " +
          "Kebiasaan hari ini " + o.doneToday + "/" + o.habitCount + ", streak terbaik " + o.bestStreak + " hari, momentum " + o.momentum.now + "% (" + (o.momentum.delta >= 0 ? "+" : "") + o.momentum.delta + "). " +
          "Skor area: " + ds.map(function (d) { return d.label + " " + d.val; }).join(", ") + ". Mood rata-rata " + (o.avgMood || "-") + "/5.";
        var out = await ctx.ai.ask({
          system: ctx.brain.context() + "\nKamu coach pribadi di aplikasi planner \"" + APP.nama + "\". Beri briefing pagi maksimal 4 kalimat: 1 apresiasi jujur, 1 sorotan data, 1 fokus utama hari ini yang konkret, 1 kalimat penyemangat. Bahasa Indonesia, hangat, tidak menggurui, tanpa bullet.",
          prompt: "Data planner-ku hari ini: " + data + "\nBuat briefing pagi untukku.", temp: 0.85
        });
        UI.clear(briefBox); briefBox.appendChild(UI.briefing(UI.esc(out), { title: "Briefing Pagi", icon: "sun-high" }));
        ctx.brain.logResult({ modul: "beranda", jenis: "briefing" });
      } catch (e) { UI.clear(briefBox); briefBox.appendChild(UI.el("div", { class: "empty", text: e.message })); briefBox.appendChild(UI.el("div", { style: "margin-top:10px" }, [briefBtn])); }
    }

    function kpi(k, v) { return UI.el("div", { class: "hkpi" }, [UI.el("div", { class: "k", text: k }), UI.el("div", { class: "v", text: v })]); }
  }
});
function greet() { var h = new Date().getHours(); return h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 19 ? "Selamat sore" : "Selamat malam"; }
function domLabel(spec, key) { var d = ((spec && spec.domains) || []).filter(function (x) { return x.key === key; })[0]; return d ? d.label : (key || "Umum"); }
function doAction(action, ctx) {
  if (!action) return;
  if (action.indexOf("go:") === 0) ctx.go(action.slice(3));
}
