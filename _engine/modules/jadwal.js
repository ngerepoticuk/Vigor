/* jadwal.js — SIGNATURE Lumen: jadwal kuliah/pelajaran mingguan per hari.
   Data: sig_schedule [{id,hari,jam,jamAkhir,matkul,ruang,dosen}]. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "student") return;
  var d = [
    { hari: 1, jam: "08:00", jamAkhir: "09:40", matkul: "Kalkulus II", ruang: "R.301", dosen: "Dr. Andi" },
    { hari: 1, jam: "10:00", jamAkhir: "11:40", matkul: "Struktur Data", ruang: "Lab.2", dosen: "Bu Rina" },
    { hari: 2, jam: "13:00", jamAkhir: "14:40", matkul: "Bahasa Inggris", ruang: "R.105", dosen: "Mr. John" },
    { hari: 3, jam: "08:00", jamAkhir: "09:40", matkul: "Fisika Dasar", ruang: "R.202", dosen: "Pak Budi" },
    { hari: 4, jam: "10:00", jamAkhir: "11:40", matkul: "Pancasila", ruang: "R.101", dosen: "Bu Sari" }
  ];
  S.set("sig_schedule", d.map(function (x, i) { return Object.assign({ id: u.id() + i }, x); }));
});
window.Shell.register({
  id: "jadwal", nama: "Jadwal Kuliah", icon: "calendar-time",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var HARI = [["1", "Senin"], ["2", "Selasa"], ["3", "Rabu"], ["4", "Kamis"], ["5", "Jumat"], ["6", "Sabtu"]];
    function sched() { return S.get("sig_schedule", []); }

    function render() {
      UI.clear(root);
      var d = sched();
      root.appendChild(UI.viewHead("Jadwal Kuliah", "Kuliah", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Kelas"])));
      if (!d.length) { root.appendChild(UI.empty("Belum ada jadwal.<br>Isi jadwal kuliah/pelajaranmu sekali di awal semester — biar tak pernah lupa kelas.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tambah kelas"]))); return; }
      var todayDow = (new Date().getDay());
      var grid = UI.el("div", { class: "sched-grid" });
      HARI.forEach(function (h) {
        var kelas = d.filter(function (x) { return String(x.hari) === h[0]; }).sort(function (a, b) { return a.jam < b.jam ? -1 : 1; });
        var col = UI.el("div", { class: "sched-col" + (String(todayDow) === h[0] ? " today" : "") });
        col.appendChild(UI.el("div", { class: "sched-day", text: h[1] }));
        if (!kelas.length) col.appendChild(UI.el("div", { class: "hint", style: "text-align:center;padding:16px 0", text: "Kosong" }));
        kelas.forEach(function (x) {
          col.appendChild(UI.el("div", { class: "sched-item", onclick: function () { edit(x); } }, [
            UI.el("div", { class: "sched-jam", text: x.jam + "–" + x.jamAkhir }),
            UI.el("div", { class: "sched-mk", text: x.matkul }),
            UI.el("div", { class: "sched-meta", text: [x.ruang, x.dosen].filter(Boolean).join(" · ") })
          ]));
        });
        grid.appendChild(col);
      });
      root.appendChild(grid);
    }
    function edit(x) {
      var isNew = !x; x = x || { id: uid(), hari: 1, jam: "08:00", jamAkhir: "09:40", matkul: "", ruang: "", dosen: "" };
      var hari = UI.select(HARI.map(function (h) { return { v: h[0], l: h[1] }; }), String(x.hari));
      var jam = UI.el("input", { class: "input", type: "time", value: x.jam });
      var jamA = UI.el("input", { class: "input", type: "time", value: x.jamAkhir });
      var matkul = UI.input({ val: x.matkul, ph: "Nama mata kuliah" });
      var ruang = UI.input({ val: x.ruang, ph: "mis. R.301" });
      var dosen = UI.input({ val: x.dosen, ph: "Nama dosen (opsional)" });
      var body = UI.el("div", {}, [UI.field("Mata kuliah", matkul), UI.el("div", { class: "grid2" }, [UI.field("Hari", hari), UI.field("Ruang", ruang)]), UI.el("div", { class: "grid2" }, [UI.el("label", { class: "fld" }, [UI.el("span", { text: "Mulai" }), jam]), UI.el("label", { class: "fld" }, [UI.el("span", { text: "Selesai" }), jamA])]), UI.field("Dosen", dosen)]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Kelas Baru" : "Edit Kelas", body);
      save.addEventListener("click", function () { if (!matkul.value.trim()) { UI.toast("Isi mata kuliah", "err"); return; } x.hari = +hari.value; x.jam = jam.value; x.jamAkhir = jamA.value; x.matkul = matkul.value.trim(); x.ruang = ruang.value.trim(); x.dosen = dosen.value.trim(); if (isNew) S.push("sig_schedule", x); else S.update("sig_schedule", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus kelas?", "", function () { S.remove("sig_schedule", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
