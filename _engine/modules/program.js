/* program.js — SIGNATURE Forge: program latihan terstruktur (hari → gerakan
   target set×rep) + "Mulai sesi dari program" → prefill Log Latihan. Data: sig_program. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "fitness") return;
  S.set("sig_program", {
    nama: "Push / Pull / Legs",
    days: [
      { nama: "Push Day", ex: [{ nama: "Bench Press", set: "3×8" }, { nama: "Shoulder Press", set: "3×10" }, { nama: "Tricep Dips", set: "3×12" }] },
      { nama: "Pull Day", ex: [{ nama: "Deadlift", set: "3×5" }, { nama: "Barbell Row", set: "3×8" }, { nama: "Pull Up", set: "3×max" }] },
      { nama: "Leg Day", ex: [{ nama: "Squat", set: "3×8" }, { nama: "Lunges", set: "3×12" }, { nama: "Calf Raise", set: "4×15" }] }
    ]
  });
});
window.Shell.register({
  id: "program", nama: "Program Latihan", icon: "clipboard-list",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var TPL = [
      { nama: "Push / Pull / Legs", days: [{ nama: "Push Day", ex: [{ nama: "Bench Press", set: "3×8" }, { nama: "Shoulder Press", set: "3×10" }, { nama: "Tricep Dips", set: "3×12" }] }, { nama: "Pull Day", ex: [{ nama: "Deadlift", set: "3×5" }, { nama: "Barbell Row", set: "3×8" }, { nama: "Pull Up", set: "3×max" }] }, { nama: "Leg Day", ex: [{ nama: "Squat", set: "3×8" }, { nama: "Lunges", set: "3×12" }, { nama: "Calf Raise", set: "4×15" }] }] },
      { nama: "Full Body 3×/minggu", days: [{ nama: "Full Body A", ex: [{ nama: "Squat", set: "3×8" }, { nama: "Bench Press", set: "3×8" }, { nama: "Barbell Row", set: "3×8" }] }, { nama: "Full Body B", ex: [{ nama: "Deadlift", set: "3×5" }, { nama: "Shoulder Press", set: "3×10" }, { nama: "Lat Pulldown", set: "3×10" }] }] },
      { nama: "Home Workout (tanpa alat)", days: [{ nama: "Hari 1", ex: [{ nama: "Push Up", set: "4×15" }, { nama: "Squat", set: "4×20" }, { nama: "Plank", set: "3×45dtk" }] }, { nama: "Hari 2", ex: [{ nama: "Lunges", set: "3×12" }, { nama: "Mountain Climber", set: "3×30dtk" }, { nama: "Burpee", set: "3×10" }] }] }
    ];
    function prog() { return S.get("sig_program", null); }

    function render() {
      UI.clear(root);
      var p = prog();
      root.appendChild(UI.viewHead("Program Latihan", "Latihan", UI.el("button", { class: "btn btn-ghost", onclick: pickTpl }, [UI.icon("layout-grid"), "Ganti Program"])));
      if (!p || !p.days || !p.days.length) { root.appendChild(UI.empty("Belum ada program.<br>Pilih template program terstruktur — tinggal ikuti, tak perlu mikir mau latihan apa.", UI.el("button", { class: "btn btn-primary", onclick: pickTpl }, [UI.icon("layout-grid"), "Pilih program"]))); return; }
      root.appendChild(UI.el("div", { class: "panel", style: "margin-bottom:16px" }, [
        UI.el("div", { class: "panel-t", text: "📋 " + p.nama }),
        UI.el("div", { class: "hint", style: "margin:2px 0 0", text: p.days.length + " hari latihan per siklus. Klik \"Mulai sesi\" → langsung tercatat di Log Latihan." })
      ]));
      var grid = UI.el("div", { class: "grid3" });
      p.days.forEach(function (d) {
        var card = UI.el("div", { class: "pk-card" });
        card.appendChild(UI.el("div", { class: "pk-t", text: d.nama }));
        var ul = UI.el("div", { class: "pk-items", style: "margin-top:10px" });
        d.ex.forEach(function (e) { ul.appendChild(UI.el("div", { class: "pk-item" }, [UI.icon("barbell"), UI.el("span", { style: "flex:1", text: e.nama }), UI.el("b", { class: "mono", style: "font-size:12px", text: e.set })])); });
        card.appendChild(ul);
        card.appendChild(UI.el("button", { class: "btn btn-primary btn-sm", style: "margin-top:12px", onclick: function () { startSession(d); } }, [UI.icon("player-play"), "Mulai sesi ini"]));
        grid.appendChild(card);
      });
      root.appendChild(grid);
    }
    function startSession(d) {
      var w = S.get("sig_workout", { sessions: [] });
      w.sessions.push({ id: uid(), iso: UI.todayISO(), nama: d.nama, exercises: d.ex.map(function (e) { var n = parseInt(e.set) || 3; var sets = []; for (var i = 0; i < n; i++) sets.push({ reps: 0, berat: 0 }); return { nama: e.nama, sets: sets }; }) });
      S.set("sig_workout", w);
      UI.toast("Sesi \"" + d.nama + "\" dibuat — isi beban di Log Latihan 💪", "ok");
      ctx.go("latihan");
    }
    function pickTpl() {
      var body = UI.el("div", {});
      TPL.forEach(function (tp) {
        body.appendChild(UI.el("div", { class: "tpl-card", style: "margin-bottom:10px" }, [
          UI.el("div", { class: "tpl-ic", style: "background:var(--primary)" }, [UI.icon("clipboard-list")]),
          UI.el("div", { style: "flex:1" }, [UI.el("div", { class: "tpl-t", text: tp.nama }), UI.el("div", { class: "tpl-prev", text: tp.days.map(function (d) { return d.nama; }).join(" · ") })]),
          UI.el("button", { class: "btn btn-primary btn-sm", onclick: function () { S.set("sig_program", JSON.parse(JSON.stringify(tp))); m.close(); render(); UI.toast("Program terpasang ✓", "ok"); } }, ["Pakai"])
        ]));
      });
      var m = UI.modal("Pilih Program", body, { wide: true });
    }
    render();
  }
});
