/* tugaskuliah.js — SIGNATURE Lumen: bank tugas kuliah (matkul, judul, deadline,
   status) + urgensi otomatis. Data: sig_assignments. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "student") return;
  var a = [
    { matkul: "Struktur Data", judul: "Implementasi Binary Tree", due: 2, status: "proses" },
    { matkul: "Kalkulus II", judul: "PR Bab Integral", due: 5, status: "belum" },
    { matkul: "Bahasa Inggris", judul: "Essay 500 kata", due: 9, status: "belum" },
    { matkul: "Fisika Dasar", judul: "Laporan praktikum", due: -1, status: "selesai" }
  ];
  S.set("sig_assignments", a.map(function (x, i) { return { id: u.id() + i, matkul: x.matkul, judul: x.judul, deadline: u.iso(u.shift(x.due)), status: x.status }; }));
});
window.Shell.register({
  id: "tugaskuliah", nama: "Tugas Kuliah", icon: "clipboard-text",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var ST = { belum: { l: "Belum", c: "var(--muted)" }, proses: { l: "Dikerjakan", c: "var(--warn)" }, selesai: { l: "Selesai ✓", c: "var(--ok)" } };
    function all() { return S.get("sig_assignments", []); }
    function daysTo(iso) { return Math.round((new Date(iso) - new Date().setHours(0, 0, 0, 0)) / 864e5); }

    function render() {
      UI.clear(root);
      var arr = all();
      root.appendChild(UI.viewHead("Tugas Kuliah", "Kuliah", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tugas"])));
      if (!arr.length) { root.appendChild(UI.empty("Tidak ada tugas tercatat. Nikmati... atau jangan-jangan lupa? 😅<br>Catat semua tugas + deadline di sini biar tidak ada yang kelewat.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Catat tugas"]))); return; }
      var open = arr.filter(function (x) { return x.status !== "selesai"; }).sort(function (a, b) { return a.deadline < b.deadline ? -1 : 1; });
      var done = arr.filter(function (x) { return x.status === "selesai"; });
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Tugas aktif", value: open.length, icon: "clipboard-text" }),
        UI.statCard({ label: "Deadline ≤3 hari", value: open.filter(function (x) { return daysTo(x.deadline) <= 3; }).length, icon: "alarm", color: "var(--danger)" }),
        UI.statCard({ label: "Selesai", value: done.length, icon: "circle-check", color: "var(--ok)" })
      ]));
      open.concat(done.slice(0, 5)).forEach(function (x) {
        var d = daysTo(x.deadline), urgent = x.status !== "selesai" && d <= 3;
        root.appendChild(UI.el("div", { class: "hrow" + (x.status === "selesai" ? " tk-done" : "") }, [
          UI.el("button", { class: "hcheck" + (x.status === "selesai" ? " on" : ""), style: "width:30px;height:30px;border-radius:10px", onclick: function () { x.status = x.status === "selesai" ? "belum" : "selesai"; S.update("sig_assignments", x.id, x); render(); if (x.status === "selesai") UI.toast("Satu beban hilang 🎉", "ok"); } }, [UI.icon("check")]),
          UI.el("div", { style: "flex:1;min-width:0" }, [
            UI.el("div", { class: "hname", text: x.judul }),
            UI.el("div", { class: "hmeta" }, [UI.tag(x.matkul, "var(--primary)"), UI.tag(ST[x.status].l, ST[x.status].c),
              UI.el("span", { style: urgent ? "color:var(--danger);font-weight:700" : "", text: "⌛ " + UI.fmtDate(x.deadline, true) + (x.status !== "selesai" ? (d < 0 ? " (LEWAT)" : d === 0 ? " (HARI INI)" : " (" + d + " hari)") : "") })])
          ]),
          x.status === "belum" ? UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { x.status = "proses"; S.update("sig_assignments", x.id, x); render(); } }, ["Kerjakan"]) : null,
          UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { edit(x); } }, [UI.icon("dots")])
        ]));
      });
    }
    function edit(x) {
      var isNew = !x; x = x || { id: uid(), matkul: "", judul: "", deadline: UI.todayISO(), status: "belum" };
      var mk = UI.input({ val: x.matkul, ph: "Mata kuliah" });
      var jd = UI.input({ val: x.judul, ph: "mis. PR Bab 5" });
      var dl = UI.input({ type: "date", val: x.deadline });
      var body = UI.el("div", {}, [UI.field("Judul tugas", jd), UI.el("div", { class: "grid2" }, [UI.field("Mata kuliah", mk), UI.field("Deadline", dl)])]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Tugas Baru" : "Edit Tugas", body);
      save.addEventListener("click", function () { if (!jd.value.trim()) { UI.toast("Isi judul", "err"); return; } x.judul = jd.value.trim(); x.matkul = mk.value.trim() || "-"; x.deadline = dl.value; if (isNew) S.push("sig_assignments", x); else S.update("sig_assignments", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus tugas?", "", function () { S.remove("sig_assignments", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
