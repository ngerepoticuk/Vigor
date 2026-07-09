/* latihan.js — SIGNATURE Forge: log latihan (sesi → gerakan → set reps×beban)
   + rekor pribadi (PR) otomatis + volume. Data: sig_workout {sessions:[]}. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "fitness") return;
  function sess(dayAgo, nama, ex) { return { id: u.id() + dayAgo, iso: u.iso(u.shift(-dayAgo)), nama: nama, exercises: ex }; }
  S.set("sig_workout", {
    sessions: [
      sess(1, "Push Day", [{ nama: "Bench Press", sets: [{ reps: 8, berat: 60 }, { reps: 8, berat: 60 }, { reps: 6, berat: 65 }] }, { nama: "Shoulder Press", sets: [{ reps: 10, berat: 30 }, { reps: 10, berat: 30 }] }]),
      sess(3, "Pull Day", [{ nama: "Deadlift", sets: [{ reps: 5, berat: 100 }, { reps: 5, berat: 100 }, { reps: 3, berat: 110 }] }, { nama: "Barbell Row", sets: [{ reps: 8, berat: 50 }] }]),
      sess(5, "Leg Day", [{ nama: "Squat", sets: [{ reps: 8, berat: 80 }, { reps: 8, berat: 80 }, { reps: 5, berat: 90 }] }])
    ]
  });
});
window.Shell.register({
  id: "latihan", nama: "Latihan", icon: "barbell",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    function data() { return S.get("sig_workout", { sessions: [] }); }
    function save(d) { S.set("sig_workout", d); }
    function prMap(d) { var m = {}; d.sessions.forEach(function (s) { (s.exercises || []).forEach(function (e) { (e.sets || []).forEach(function (st) { if (st.berat > (m[e.nama] || 0)) m[e.nama] = st.berat; }); }); }); return m; }
    function volume(s) { var v = 0; (s.exercises || []).forEach(function (e) { (e.sets || []).forEach(function (st) { v += (st.reps || 0) * (st.berat || 0); }); }); return v; }

    function render() {
      UI.clear(root);
      var d = data();
      root.appendChild(UI.viewHead("Log Latihan", "Latihan", UI.el("div", { class: "row gap8" }, [
        UI.el("button", { class: "btn btn-ghost", onclick: saranAI }, [UI.icon("sparkles"), "Saran Progresi AI"]),
        UI.el("button", { class: "btn btn-primary", onclick: function () { editSess(null); } }, [UI.icon("plus"), "Sesi Latihan"])
      ])));
      if (!d.sessions.length) { root.appendChild(UI.empty("Belum ada sesi latihan.<br>Catat latihan pertamamu — beban, set & reps terekam, PR dihitung otomatis.", UI.el("button", { class: "btn btn-primary", onclick: function () { editSess(null); } }, [UI.icon("plus"), "Catat sesi"]))); return; }
      var pr = prMap(d);
      var week = d.sessions.filter(function (s) { return (Date.now() - new Date(s.iso)) / 864e5 < 7; });
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Sesi minggu ini", value: week.length, icon: "calendar" }),
        UI.statCard({ label: "Total sesi", value: d.sessions.length, icon: "history" }),
        UI.statCard({ label: "Volume terakhir", value: volume(d.sessions.slice().sort(function (a, b) { return a.iso < b.iso ? 1 : -1; })[0] || {}), fmt: function (v) { return Math.round(v).toLocaleString("id-ID") + " kg"; }, icon: "flame" }),
        UI.statCard({ label: "Gerakan dilacak", value: Object.keys(pr).length, icon: "list" })
      ]));
      // PR panel
      if (Object.keys(pr).length) {
        var rows = Object.keys(pr).sort(function (a, b) { return pr[b] - pr[a]; }).map(function (k) { return { label: k, val: pr[k], max: Math.max.apply(null, Object.values(pr)), note: pr[k] + " kg" }; });
        root.appendChild(UI.el("div", { class: "panel", style: "margin-bottom:18px" }, [UI.el("div", { class: "panel-t", text: "🏆 Rekor Pribadi (PR)" }), UI.el("div", { style: "margin-top:12px" }, [UI.barsH(rows)])]));
      }
      // sesi
      root.appendChild(UI.el("div", { class: "kick", text: "Riwayat sesi" }));
      d.sessions.slice().sort(function (a, b) { return a.iso < b.iso ? 1 : -1; }).forEach(function (s) {
        var card = UI.el("div", { class: "panel", style: "margin-bottom:12px" });
        card.appendChild(UI.el("div", { class: "flex between center", style: "margin-bottom:8px" }, [
          UI.el("div", {}, [UI.el("div", { class: "panel-t", style: "margin:0", text: s.nama || "Sesi" }), UI.el("div", { class: "hint", style: "margin:2px 0 0", text: UI.fmtDate(s.iso, true) + " · volume " + Math.round(volume(s)).toLocaleString("id-ID") + " kg" })]),
          UI.el("div", { class: "row gap8" }, [UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { editSess(s); } }, [UI.icon("edit")]), UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { UI.confirm("Hapus sesi?", "", function () { var dd = data(); dd.sessions = dd.sessions.filter(function (x) { return x.id !== s.id; }); save(dd); render(); }, { danger: true }); } }, [UI.icon("trash")])])
        ]));
        (s.exercises || []).forEach(function (e) {
          var isPR = (e.sets || []).some(function (st) { return st.berat === pr[e.nama] && st.berat > 0; });
          card.appendChild(UI.el("div", { class: "flex center gap8", style: "padding:7px 0;border-top:1px solid var(--line)" }, [
            UI.el("span", { style: "flex:1;font-weight:600", text: e.nama }),
            UI.el("span", { class: "hint", style: "margin:0", text: (e.sets || []).map(function (st) { return st.reps + "×" + st.berat + "kg"; }).join("  ") }),
            isPR ? UI.tag("PR", "var(--warn)") : null
          ]));
        });
        root.appendChild(card);
      });
    }

    async function saranAI() {
      if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu di Pengaturan", "err"); ctx.shell.openSettings(); return; }
      var box = UI.el("div", {}, [UI.spinner("Menganalisa latihanmu…")]);
      var m = UI.modal("Saran Progresi AI", box, { wide: true });
      try {
        var d = data(), pr = prMap(d);
        var prs = Object.keys(pr).map(function (k) { return k + " " + pr[k] + "kg"; }).join(", ");
        var recent = d.sessions.slice().sort(function (a, b) { return a.iso < b.iso ? 1 : -1; }).slice(0, 3).map(function (s) { return s.nama + " (" + UI.fmtDate(s.iso) + "): " + (s.exercises || []).map(function (e) { return e.nama + " " + (e.sets || []).map(function (st) { return st.reps + "x" + st.berat; }).join("/"); }).join(", "); }).join(" | ");
        var out = await ctx.ai.ask({
          system: ctx.brain.context() + "\nKamu strength coach berpengalaman. Beri saran progresi aman & spesifik (progressive overload, deload bila perlu, keseimbangan otot). Maks 6 kalimat mengalir.",
          prompt: "PR-ku: " + (prs || "-") + ". Sesi terakhir: " + (recent || "-") + ". Apa saran progresimu untuk 2 minggu ke depan?", temp: 0.8
        });
        UI.clear(box); box.appendChild(UI.briefing(UI.esc(out), { title: "Saran Coach", icon: "barbell" }));
      } catch (e) { UI.clear(box); box.appendChild(UI.el("div", { class: "empty", text: e.message })); }
    }

    function editSess(s) {
      var isNew = !s; s = s ? JSON.parse(JSON.stringify(s)) : { id: uid(), iso: UI.todayISO(), nama: "", exercises: [] };
      var nama = UI.input({ val: s.nama, ph: "mis. Push Day" });
      var tgl = UI.input({ type: "date", val: s.iso });
      var exWrap = UI.el("div", { class: "stack" });
      function drawEx() {
        UI.clear(exWrap);
        s.exercises.forEach(function (e, ei) {
          var enm = UI.input({ val: e.nama, ph: "Nama gerakan" }); enm.addEventListener("input", function () { e.nama = enm.value; });
          var setsWrap = UI.el("div", { class: "stack", style: "gap:6px;margin-top:6px" });
          e.sets = e.sets || [];
          e.sets.forEach(function (st, si) {
            var reps = UI.el("input", { class: "input", type: "number", style: "width:80px", placeholder: "reps", value: st.reps || "" });
            var berat = UI.el("input", { class: "input", type: "number", style: "width:90px", placeholder: "kg", value: st.berat || "" });
            reps.addEventListener("input", function () { st.reps = +reps.value; }); berat.addEventListener("input", function () { st.berat = +berat.value; });
            setsWrap.appendChild(UI.el("div", { class: "flex center gap8" }, [UI.el("span", { class: "hint", style: "margin:0;width:38px", text: "Set " + (si + 1) }), reps, UI.el("span", { class: "hint", style: "margin:0", text: "×" }), berat, UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { e.sets.splice(si, 1); drawEx(); } }, [UI.icon("x")])]));
          });
          setsWrap.appendChild(UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { e.sets.push({ reps: 0, berat: 0 }); drawEx(); } }, [UI.icon("plus"), "Set"]));
          exWrap.appendChild(UI.el("div", { class: "box" }, [UI.el("div", { class: "flex center gap8" }, [enm, UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { s.exercises.splice(ei, 1); drawEx(); } }, [UI.icon("trash")])]), setsWrap]));
        });
        exWrap.appendChild(UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { s.exercises.push({ nama: "", sets: [{ reps: 0, berat: 0 }] }); drawEx(); } }, [UI.icon("plus"), "Gerakan"]));
      }
      drawEx();
      var body = UI.el("div", {}, [UI.el("div", { class: "grid2" }, [UI.field("Nama sesi", nama), UI.field("Tanggal", tgl)]), UI.el("label", { class: "fld" }, [UI.el("span", { text: "Gerakan" }), exWrap])]);
      var save2 = UI.el("button", { class: "btn btn-primary", text: isNew ? "Simpan sesi" : "Perbarui" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end;margin-top:8px" }, [save2]));
      var m = UI.modal(isNew ? "Sesi Latihan Baru" : "Edit Sesi", body, { wide: true });
      save2.addEventListener("click", function () {
        s.nama = nama.value.trim() || "Sesi"; s.iso = tgl.value;
        s.exercises = s.exercises.filter(function (e) { return e.nama.trim(); }).map(function (e) { e.sets = e.sets.filter(function (st) { return st.reps || st.berat; }); return e; });
        var d = data(); var i = d.sessions.map(function (x) { return x.id; }).indexOf(s.id); if (i >= 0) d.sessions[i] = s; else d.sessions.push(s); save(d); m.close(); render(); UI.toast("Tersimpan", "ok");
      });
    }
    render();
  }
});
