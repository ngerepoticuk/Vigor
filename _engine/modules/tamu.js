/* tamu.js — SIGNATURE Ikrar: daftar tamu + RSVP + rekap jumlah + hitung mundur
   hari-H. Data: sig_guests [{id,nama,grup,jumlah,rsvp}], sig_wedding {date}. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "wedding") return;
  var g = [
    { nama: "Keluarga Besar Ayah", grup: "Keluarga", jumlah: 25, rsvp: "ya" },
    { nama: "Keluarga Besar Ibu", grup: "Keluarga", jumlah: 30, rsvp: "ya" },
    { nama: "Teman Kuliah", grup: "Teman", jumlah: 18, rsvp: "belum" },
    { nama: "Rekan Kerja", grup: "Kerja", jumlah: 15, rsvp: "belum" },
    { nama: "Tetangga", grup: "Lainnya", jumlah: 20, rsvp: "tidak" }
  ];
  S.set("sig_guests", g.map(function (x, i) { return { id: u.id() + i, nama: x.nama, grup: x.grup, jumlah: x.jumlah, rsvp: x.rsvp }; }));
  var wd = new Date(); wd.setDate(wd.getDate() + 96);
  S.set("sig_wedding", { date: wd.toISOString().slice(0, 10) });
});
window.Shell.register({
  id: "tamu", nama: "Tamu & RSVP", icon: "users",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var RSVP = { ya: { l: "Hadir", c: "var(--ok)" }, tidak: { l: "Tidak", c: "var(--danger)" }, belum: { l: "Belum", c: "var(--muted)" } };
    function guests() { return S.get("sig_guests", []); }

    function render() {
      UI.clear(root);
      var g = guests();
      root.appendChild(UI.viewHead("Tamu & RSVP", "Pernikahan", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tamu"])));

      // hitung mundur
      var wd = S.get("sig_wedding", {});
      var hm = UI.el("section", { class: "hero", style: "margin-bottom:18px" });
      var days = wd.date ? Math.ceil((new Date(wd.date) - new Date().setHours(0, 0, 0, 0)) / 864e5) : null;
      hm.appendChild(UI.el("div", { class: "hero-row" }, [
        UI.el("div", { style: "flex:1;min-width:220px" }, [
          UI.el("div", { class: "kick", text: "Hari Bahagia" }),
          UI.el("h1", { class: "h1", text: days != null ? (days > 0 ? days + " hari lagi" : days === 0 ? "Hari ini! 🎉" : "Sudah berlalu") : "Atur tanggal" }),
          UI.el("div", { class: "sub", text: wd.date ? new Date(wd.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Klik untuk menetapkan tanggal pernikahan." }),
          UI.el("button", { class: "btn btn-ghost btn-sm", style: "margin-top:12px", onclick: setDate }, [UI.icon("calendar"), "Ubah tanggal"])
        ]),
        UI.el("div", { style: "flex:none" }, [UI.ringz(days != null ? Math.max(0, Math.min(100, Math.round((365 - days) / 365 * 100))) : 0, { size: 120, of: "menuju hari-H", label: (days != null && days > 0 ? days : "—") })])
      ]));
      root.appendChild(hm);

      if (!g.length) { root.appendChild(UI.empty("Belum ada tamu.<br>Tambah daftar undangan & lacak konfirmasi kehadirannya.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tambah tamu"]))); return; }

      var totUndang = g.reduce(function (a, x) { return a + x.jumlah; }, 0);
      var hadir = g.filter(function (x) { return x.rsvp === "ya"; }).reduce(function (a, x) { return a + x.jumlah; }, 0);
      var belum = g.filter(function (x) { return x.rsvp === "belum"; }).reduce(function (a, x) { return a + x.jumlah; }, 0);
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Total diundang", value: totUndang, icon: "users" }),
        UI.statCard({ label: "Konfirmasi hadir", value: hadir, icon: "circle-check", color: "var(--ok)" }),
        UI.statCard({ label: "Belum konfirmasi", value: belum, icon: "clock", color: "var(--warn)" }),
        UI.statCard({ label: "Kelompok", value: Object.keys(g.reduce(function (a, x) { a[x.grup] = 1; return a; }, {})).length, icon: "layout-grid" })
      ]));

      var tbl = UI.el("table", { class: "tbl" }, [UI.el("tr", {}, [UI.el("th", { text: "Tamu" }), UI.el("th", { text: "Kelompok" }), UI.el("th", { class: "num", text: "Jumlah" }), UI.el("th", { text: "RSVP" }), UI.el("th", {})])]);
      g.forEach(function (x) {
        var sel = UI.el("select", { class: "input", style: "padding:5px 8px;width:auto;font-size:12.5px" });
        ["ya", "belum", "tidak"].forEach(function (r) { var o = UI.el("option", { value: r, text: RSVP[r].l }); if (x.rsvp === r) o.selected = true; sel.appendChild(o); });
        sel.addEventListener("change", function () { x.rsvp = sel.value; S.update("sig_guests", x.id, x); render(); });
        tbl.appendChild(UI.el("tr", {}, [
          UI.el("td", {}, [UI.el("b", { text: x.nama })]), UI.el("td", { text: x.grup }), UI.el("td", { class: "num", text: x.jumlah }),
          UI.el("td", {}, [sel]),
          UI.el("td", { class: "num" }, [UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { edit(x); } }, [UI.icon("dots")])])
        ]));
      });
      root.appendChild(UI.el("div", { class: "panel", style: "padding:6px 10px" }, [tbl]));
    }

    function setDate() {
      var wd = S.get("sig_wedding", {}); var inp = UI.input({ type: "date", val: wd.date || "" });
      var body = UI.el("div", {}, [UI.field("Tanggal pernikahan", inp)]);
      var save = UI.el("button", { class: "btn btn-primary", text: "Simpan" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end" }, [save]));
      var m = UI.modal("Tanggal Hari-H", body);
      save.addEventListener("click", function () { S.set("sig_wedding", { date: inp.value }); m.close(); render(); });
    }
    function edit(x) {
      var isNew = !x; x = x || { id: uid(), nama: "", grup: "Keluarga", jumlah: 1, rsvp: "belum" };
      var nama = UI.input({ val: x.nama, ph: "mis. Keluarga Pak Budi" });
      var grup = UI.input({ val: x.grup, ph: "Keluarga / Teman / Kerja" });
      var jml = UI.input({ type: "number", val: x.jumlah, ph: "1" });
      var body = UI.el("div", {}, [UI.field("Nama / rombongan", nama), UI.el("div", { class: "grid2" }, [UI.field("Kelompok", grup), UI.field("Jumlah orang", jml)])]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Tamu Baru" : "Edit Tamu", body);
      save.addEventListener("click", function () { if (!nama.value.trim()) { UI.toast("Isi nama", "err"); return; } x.nama = nama.value.trim(); x.grup = grup.value.trim() || "Lainnya"; x.jumlah = +jml.value || 1; if (isNew) S.push("sig_guests", x); else S.update("sig_guests", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus tamu?", "", function () { S.remove("sig_guests", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
