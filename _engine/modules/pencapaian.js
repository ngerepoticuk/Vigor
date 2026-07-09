/* pencapaian.js — badge & level. Deterministik dari data (kebiasaan, streak,
   sasaran, jurnal, tugas, catatan). Buka kunci otomatis + confetti + level. */
window.Shell.register({
  id: "pencapaian", nama: "Pencapaian", icon: "trophy",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store, I = ctx.intel;

    function xpOf(s) {
      var rlog = S.get("routineLog", {}), rN = 0;
      Object.keys(rlog).forEach(function (d) { rN += Object.keys(rlog[d]).length; });
      var chal = S.get("sig_challenges", []).filter(function (c) { return c.status === "selesai"; }).length;
      return s.totalChecks * 5 + rN * 3 + s.tasksDone * 5 + s.journalDays * 10 + s.goalsDone * 100 + s.notes * 3 + chal * 150;
    }
    function levelOf(xp) { return Math.floor(Math.sqrt(xp / 60)) + 1; } // lvl2≈60xp, lvl5≈960, lvl10≈4860
    function xpForLevel(l) { return Math.pow(l - 1, 2) * 60; }

    function stats() {
      var checks = S.get("checks", {}), total = 0, dayset = {};
      Object.keys(checks).forEach(function (hid) { Object.keys(checks[hid]).forEach(function (day) { if (checks[hid][day]) { total++; dayset[day] = 1; } }); });
      var hs = I.habits();
      var maxStreak = hs.length ? Math.max.apply(null, hs.map(function (h) { return I.bestStreakOf(h.id); }).concat([0])) : 0;
      var goals = S.get("goals", []);
      var goalsDone = goals.filter(function (g) { return g.status === "selesai" || g.progress >= 100; }).length;
      var journal = S.get("journal", []); var jdays = {}; journal.forEach(function (j) { if (j.iso) jdays[j.iso] = 1; });
      var tasksDone = S.get("tasks", []).filter(function (x) { return x.done; }).length;
      return {
        habits: hs.length, totalChecks: total, activeDays: Object.keys(dayset).length, maxStreak: maxStreak,
        goals: goals.length, goalsDone: goalsDone, journalDays: Object.keys(jdays).length, tasksDone: tasksDone,
        routines: S.get("routines", []).length, notes: S.get("notes", []).length,
        domainsData: I.domainScores().filter(function (d) { return d.hasData; }).length, domainsTotal: (ctx.spec.domains || []).length
      };
    }

    var BADGES = [
      { id: "start", nama: "Langkah Pertama", icon: "seeding", desc: "Buat kebiasaan pertamamu", cur: function (s) { return s.habits; }, goal: 1 },
      { id: "streak7", nama: "Konsisten Seminggu", icon: "flame", desc: "Streak 7 hari", cur: function (s) { return s.maxStreak; }, goal: 7 },
      { id: "streak30", nama: "Sebulan Penuh", icon: "bolt", desc: "Streak 30 hari", cur: function (s) { return s.maxStreak; }, goal: 30 },
      { id: "check100", nama: "Seratus Centang", icon: "checks", desc: "100 kebiasaan tercentang", cur: function (s) { return s.totalChecks; }, goal: 100 },
      { id: "dreamer", nama: "Sang Pemimpi", icon: "target-arrow", desc: "Tetapkan sasaran pertama", cur: function (s) { return s.goals; }, goal: 1 },
      { id: "achiever", nama: "Penakluk", icon: "trophy", desc: "Selesaikan 1 sasaran", cur: function (s) { return s.goalsDone; }, goal: 1 },
      { id: "reflect", nama: "Reflektif", icon: "feather", desc: "Jurnal 7 hari berbeda", cur: function (s) { return s.journalDays; }, goal: 7 },
      { id: "doer", nama: "Tuntas", icon: "checkbox", desc: "25 tugas selesai", cur: function (s) { return s.tasksDone; }, goal: 25 },
      { id: "ritual", nama: "Punya Ritual", icon: "sun", desc: "Buat 1 rutinitas", cur: function (s) { return s.routines; }, goal: 1 },
      { id: "active30", nama: "Perencana Sejati", icon: "calendar-stats", desc: "Aktif di 30 hari berbeda", cur: function (s) { return s.activeDays; }, goal: 30 },
      { id: "balance", nama: "Hidup Seimbang", icon: "chart-radar", desc: "Punya data di semua area", cur: function (s) { return s.domainsData; }, goal: function (s) { return Math.max(3, s.domainsTotal); } },
      { id: "writer", nama: "Sang Pencatat", icon: "notes", desc: "Tulis 10 catatan", cur: function (s) { return s.notes; }, goal: 10 }
    ];

    function render(justUnlocked) {
      UI.clear(root);
      var s = stats();
      var store = S.get("badges", {});
      var newly = [];
      BADGES.forEach(function (b) { var goal = typeof b.goal === "function" ? b.goal(s) : b.goal; if (b.cur(s) >= goal && !store[b.id]) { store[b.id] = Date.now(); newly.push(b); } });
      if (newly.length) S.set("badges", store);
      var unlocked = BADGES.filter(function (b) { return store[b.id]; }).length;
      var xp = xpOf(s), level = levelOf(xp);
      var curBase = xpForLevel(level), nextAt = xpForLevel(level + 1);
      var pctLvl = Math.round((xp - curBase) / (nextAt - curBase) * 100);

      root.appendChild(UI.viewHead("Pencapaian", "Perjalananmu", null));
      // hero level + XP
      root.appendChild(UI.el("section", { class: "hero", style: "margin-bottom:20px" }, [
        UI.el("div", { class: "hero-row" }, [
          UI.el("div", { style: "flex:1;min-width:220px" }, [
            UI.el("div", { class: "kick", text: "Level " + level + " · " + xp.toLocaleString("id-ID") + " XP" }),
            UI.el("h1", { class: "h1", text: levelName(level) }),
            UI.el("div", { class: "sub", text: unlocked + "/" + BADGES.length + " lencana · setiap centang, jurnal & tugas menambah XP-mu. " + (unlocked < BADGES.length ? "Lencana berikutnya menanti." : "Semua lencana terkumpul! 🏆") }),
            UI.el("div", { style: "margin-top:16px;max-width:340px" }, [UI.progress(Math.max(2, pctLvl)), UI.el("div", { class: "hint", style: "margin:6px 0 0", text: (nextAt - xp).toLocaleString("id-ID") + " XP menuju Level " + (level + 1) + " (" + levelName(level + 1) + ")" })])
          ]),
          UI.el("div", { style: "flex:none" }, [UI.ringz(Math.round(unlocked / BADGES.length * 100), { size: 120, of: "lencana", label: unlocked + "/" + BADGES.length })])
        ])
      ]));

      var grid = UI.el("div", { class: "badge-grid" });
      BADGES.forEach(function (b) {
        var goal = typeof b.goal === "function" ? b.goal(s) : b.goal, cur = Math.min(b.cur(s), goal), on = !!store[b.id];
        var card = UI.el("div", { class: "badge" + (on ? " on" : "") });
        card.appendChild(UI.el("div", { class: "badge-ic" }, [UI.icon(on ? b.icon : "lock")]));
        card.appendChild(UI.el("div", { class: "badge-nm", text: b.nama }));
        card.appendChild(UI.el("div", { class: "badge-ds", text: b.desc }));
        if (on) card.appendChild(UI.el("div", { class: "badge-date", text: "✓ " + UI.fmtDate(store[b.id], true) }));
        else { card.appendChild(UI.el("div", { style: "margin-top:8px" }, [UI.progress(Math.round(cur / goal * 100), { sm: true })])); card.appendChild(UI.el("div", { class: "badge-prog", text: cur + " / " + goal })); }
        grid.appendChild(card);
      });
      root.appendChild(grid);

      if (newly.length && window.Onboard) { Onboard.confetti(); setTimeout(function () { UI.toast("🏆 Lencana baru: " + newly[0].nama + "!", "ok"); }, 200); }
    }
    function levelName(l) { return ["", "Pemula", "Penjelajah", "Pembangun", "Konsisten", "Tangguh", "Master", "Legenda"][Math.min(l, 7)] || "Legenda"; }

    render();
  }
});
