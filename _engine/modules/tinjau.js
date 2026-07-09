/* tinjau.js — Tinjauan Mingguan: statistik minggu, menang/pelajaran,
   ringkasan coach AI baca semua data, arahan minggu depan. */
window.Shell.register({
  id: "tinjau", nama: "Tinjauan Mingguan", icon: "calendar-stats",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store, I = ctx.intel, spec = ctx.spec;

    function weekStats() {
      var hs = I.habits(), days = I.range(7);
      var tot = 0, done = 0, perDay = days.map(function (d) { var c = 0; hs.forEach(function (h) { tot++; if (I.isDone(h.id, d)) { done++; c++; } }); return { d: d, c: c, of: hs.length }; });
      var best = perDay.slice().sort(function (a, b) { return b.c - a.c; })[0];
      var mood = I.moodTrend(7).filter(function (x) { return x; });
      var avgMood = mood.length ? (mood.reduce(function (a, b) { return a + b; }, 0) / mood.length).toFixed(1) : null;
      var j = S.get("journal", []).filter(function (e) { return days.indexOf(e.iso) >= 0; }).length;
      return { pct: tot ? Math.round(done / tot * 100) : 0, done: done, tot: tot, perDay: perDay, best: best, avgMood: avgMood, journalCount: j };
    }

    function render() {
      UI.clear(root);
      var w = weekStats(), mo = I.momentum();
      root.appendChild(UI.viewHead("Tinjauan Mingguan", "Refleksi 7 hari", null));

      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:16px" }, [
        UI.statCard({ label: "Kebiasaan minggu ini", value: w.pct, fmt: function (v) { return Math.round(v) + "%"; }, delta: (mo.delta >= 0 ? "▲ +" : "▼ ") + mo.delta + " vs mgg lalu", dir: mo.delta >= 0 ? "up" : "down", icon: "flame" }),
        UI.statCard({ label: "Total centang", value: w.done, icon: "circle-check" }),
        UI.statCard({ label: "Mood rata-rata", value: w.avgMood != null ? (w.avgMood + " / 5") : "—", icon: "mood-smile" }),
        UI.statCard({ label: "Hari berjurnal", value: w.journalCount + "/7", icon: "feather" })
      ]));

      root.appendChild(UI.el("div", { class: "panel", style: "margin-bottom:16px" }, [
        UI.el("div", { class: "panel-t", text: "Konsistensi per hari" }),
        UI.bars(w.perDay.map(function (p) { return { label: UI.HARIS[new Date(p.d).getDay()], val: p.c, dim: p.c === 0 }; }), { h: 120 }),
        w.best && w.best.c > 0 ? UI.el("div", { class: "hint", style: "margin-top:8px", text: "Hari terbaikmu: " + UI.HARI[new Date(w.best.d).getDay()] + " (" + w.best.c + "/" + w.best.of + " kebiasaan)." }) : null
      ]));

      // menang & pelajaran
      var menang = UI.textarea({ ph: "Apa 1–3 kemenangan minggu ini? (sekecil apapun)", rows: 2 });
      var pelajaran = UI.textarea({ ph: "Apa yang bisa diperbaiki minggu depan?", rows: 2 });
      var last = (S.get("reviews", []) || [])[0];
      if (last) { menang.value = last.menang || ""; pelajaran.value = last.pelajaran || ""; }
      root.appendChild(UI.el("div", { class: "split" }, [
        UI.el("div", { class: "panel" }, [UI.el("div", { class: "panel-t", text: "Kemenangan & Pelajaran" }), UI.field("Menang", menang), UI.field("Pelajaran", pelajaran),
          UI.el("button", { class: "btn btn-ghost", onclick: function () { S.push2 ? 0 : 0; var arr = S.get("reviews", []); arr.unshift({ id: uid(), t: Date.now(), iso: I.today(), menang: menang.value, pelajaran: pelajaran.value, pct: w.pct }); S.set("reviews", arr.slice(0, 52)); UI.toast("Tinjauan disimpan", "ok"); } }, [UI.icon("device-floppy"), "Simpan tinjauan"])]),
        UI.el("div", { class: "panel" }, [
          UI.el("div", { class: "flex between center", style: "margin-bottom:6px" }, [UI.el("div", { class: "panel-t", style: "margin:0", text: "Coach Mingguan AI" }), UI.el("button", { class: "btn btn-primary btn-sm", onclick: coach }, [UI.icon("sparkles"), "Buat"])]),
          UI.el("div", { class: "hint", text: "AI membaca kebiasaan, sasaran, mood & jurnal minggu ini lalu memberi 1 apresiasi, 1 pola, dan 1 fokus minggu depan." }),
          coachBox
        ])
      ]));

      // Rencana minggu depan (AI)
      var wp = S.get("__weekplan", null);
      var planPanel = UI.el("div", { class: "panel", style: "margin-top:16px" }, [
        UI.el("div", { class: "flex between center", style: "margin-bottom:6px" }, [
          UI.el("div", { class: "panel-t", style: "margin:0" }, [UI.icon("calendar-bolt"), " Rencana Minggu Depan"]),
          UI.el("button", { class: "btn btn-primary btn-sm", onclick: weekPlan }, [UI.icon("sparkles"), "Susun (AI)"])
        ]),
        UI.el("div", { class: "hint", text: "AI menyusun draft: 3 fokus minggu + target ringan per hari — dari sasaran & datamu. Kamu tinggal setujui." }),
        planBox
      ]);
      if (wp && wp.fokus) showPlan(wp, false);
      root.appendChild(planPanel);
    }
    var coachBox = UI.el("div", { style: "margin-top:12px" });
    var planBox = UI.el("div", { style: "margin-top:12px" });

    function showPlan(p, withApply) {
      UI.clear(planBox);
      var card = UI.el("div", { class: "ai-out", style: "white-space:normal" });
      card.appendChild(UI.el("div", { class: "kick", text: "3 Fokus Minggu" }));
      (p.fokus || []).forEach(function (x) { card.appendChild(UI.el("div", { class: "sub-item" }, [UI.icon("target"), UI.el("span", { text: x })])); });
      if (p.harian && p.harian.length) {
        card.appendChild(UI.el("div", { class: "kick", style: "margin-top:12px", text: "Sentuhan per hari" }));
        p.harian.forEach(function (h) { card.appendChild(UI.el("div", { class: "sub-item" }, [UI.el("b", { style: "width:50px;flex:none", text: h.hari }), UI.el("span", { text: h.aksi })])); });
      }
      if (withApply) card.appendChild(UI.el("button", { class: "btn btn-primary", style: "margin-top:14px", onclick: function () {
        S.set("__weekplan", p);
        (p.fokus || []).slice(0, 3).forEach(function (x) { S.push("tasks", { id: uid(), teks: x, prioritas: "tinggi", tenggat: "", done: false, t: Date.now() }); });
        UI.toast("Rencana diterapkan — 3 fokus masuk Tugas ✓", "ok"); showPlan(p, false);
      } }, [UI.icon("check"), "Setujui & terapkan"]));
      planBox.appendChild(card);
    }
    async function weekPlan() {
      if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu di Pengaturan", "err"); ctx.shell.openSettings(); return; }
      UI.clear(planBox); planBox.appendChild(UI.spinner("Menyusun rencana minggu…"));
      try {
        var goals = S.get("goals", []).filter(function (g) { return g.status === "aktif"; }).slice(0, 5).map(function (g) { return g.judul + " (" + (g.progress || 0) + "%)"; }).join("; ");
        var hs = I.habits().map(function (h) { return h.nama; }).join(", ");
        var out = await ctx.ai.ask({
          system: ctx.brain.context() + "\nKamu perencana mingguan di planner \"" + APP.nama + "\" (" + (spec.kindLabel || "") + "). Susun rencana REALISTIS & ringan.",
          prompt: "Sasaran aktifku: " + (goals || "-") + ". Kebiasaanku: " + (hs || "-") + ". Konsistensi minggu ini " + weekStats().pct + "%.\nBalas JSON: {\"fokus\":[\"3 fokus minggu, konkret\"],\"harian\":[{\"hari\":\"Sen\",\"aksi\":\"1 aksi kecil\"},...7 hari]}", json: true, temp: 0.8
        });
        if (out && out.fokus) showPlan(out, true);
        else { UI.clear(planBox); planBox.appendChild(UI.el("div", { class: "ai-out", text: typeof out === "string" ? out : JSON.stringify(out) })); }
      } catch (e) { UI.clear(planBox); planBox.appendChild(UI.el("div", { class: "empty", text: e.message })); }
    }

    async function coach() {
      if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu di Pengaturan", "err"); ctx.shell.openSettings(); return; }
      UI.clear(coachBox); coachBox.appendChild(UI.spinner("Coach sedang membaca minggumu…"));
      try {
        var w = weekStats(), mo = I.momentum(), ds = I.domainScores().filter(function (d) { return d.hasData; });
        var hs = I.habits().map(function (h) { return h.nama + " (streak " + I.streakOf(h.id) + ")"; }).join(", ");
        var data = "Konsistensi minggu " + w.pct + "% (momentum " + (mo.delta >= 0 ? "+" : "") + mo.delta + "). Mood rata-rata " + (w.avgMood || "-") + "/5, " + w.journalCount + "/7 hari berjurnal. Kebiasaan: " + (hs || "-") + ". Skor area: " + ds.map(function (d) { return d.label + " " + d.val; }).join(", ") + ".";
        var out = await ctx.ai.ask({
          system: ctx.brain.context() + "\nKamu coach mingguan di planner \"" + APP.nama + "\". Balas maksimal 5 kalimat mengalir (tanpa bullet): apresiasi jujur, 1 pola yang kamu lihat dari data, 1 hal untuk dilepas/dikurangi, dan 1 fokus konkret minggu depan. Hangat, spesifik ke data.",
          prompt: "Data mingguku: " + data + "\nBeri tinjauan coach untukku.", temp: 0.85
        });
        UI.clear(coachBox); coachBox.appendChild(UI.briefing(UI.esc(out), { title: "Coach Mingguan", icon: "calendar-stats" }));
        ctx.brain.logResult({ modul: "tinjau", jenis: "coach" });
      } catch (e) { UI.clear(coachBox); coachBox.appendChild(UI.el("div", { class: "empty", text: e.message })); }
    }

    render();
  }
});
