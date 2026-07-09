/* sedekah.js — SIGNATURE Nuur: catatan sedekah (tanggal, bentuk, jumlah, niat)
   + total bulan ini + doa favorit. Data: sig_sedekah, sig_doa. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "spiritual") return;
  S.set("sig_sedekah", [
    { id: u.id() + 1, iso: u.iso(u.shift(-2)), bentuk: "Uang", jumlah: 50000, niat: "Jumat berkah" },
    { id: u.id() + 2, iso: u.iso(u.shift(-5)), bentuk: "Makanan", jumlah: 0, niat: "Berbagi ke tetangga" },
    { id: u.id() + 3, iso: u.iso(u.shift(-9)), bentuk: "Uang", jumlah: 100000, niat: "Untuk anak yatim" }
  ]);
  S.set("sig_doa", [
    { id: u.id() + "d1", judul: "Doa ketenangan hati", teks: "Allahumma inni as'aluka nafsan bika muthma'innah…", fav: true },
    { id: u.id() + "d2", judul: "Doa untuk orang tua", teks: "Rabbighfir li wa liwalidayya warhamhuma kama rabbayani shaghira.", fav: true }
  ]);
});
window.Shell.register({
  id: "sedekah", nama: "Sedekah & Doa", icon: "hand-love-you",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var tab = "sedekah";
    function render() {
      UI.clear(root);
      root.appendChild(UI.viewHead("Sedekah & Doa", "Ibadah", null));
      var seg = UI.el("div", { class: "seg", style: "margin-bottom:20px" });
      [["sedekah", "Sedekah", "hand-love-you"], ["doa", "Doa Favorit", "book"]].forEach(function (x) {
        seg.appendChild(UI.el("button", { class: tab === x[0] ? "on" : "", onclick: function () { tab = x[0]; render(); } }, [UI.icon(x[2]), x[1]]));
      });
      root.appendChild(seg);
      var body = UI.el("div", {}); root.appendChild(body);
      (tab === "sedekah" ? sedekahTab : doaTab)(body);
    }

    function sedekahTab(body) {
      var arr = S.get("sig_sedekah", []).slice().sort(function (a, b) { return a.iso < b.iso ? 1 : -1; });
      var now = new Date(); var mKey = now.getFullYear() + "-" + now.getMonth();
      var bulanIni = arr.filter(function (x) { var d = new Date(x.iso); return d.getFullYear() + "-" + d.getMonth() === mKey; });
      var totBulan = bulanIni.reduce(function (a, x) { return a + (+x.jumlah || 0); }, 0);
      body.appendChild(UI.el("div", { class: "flex between center", style: "margin-bottom:14px" }, [
        UI.el("div", { class: "hint", style: "margin:0", html: "\"Sedekah tidak mengurangi harta.\" — <i>HR. Muslim</i>" }),
        UI.el("button", { class: "btn btn-primary btn-sm", onclick: function () { add(); } }, [UI.icon("plus"), "Catat Sedekah"])
      ]));
      body.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Bulan ini", value: totBulan, fmt: UI.money, icon: "hand-love-you", color: "var(--ok)" }),
        UI.statCard({ label: "Kali bersedekah (bln)", value: bulanIni.length, icon: "repeat" }),
        UI.statCard({ label: "Total tercatat", value: arr.length, icon: "history" })
      ]));
      if (!arr.length) { body.appendChild(UI.empty("Belum ada catatan.<br>Sekecil apapun — senyum pun sedekah. Catat untuk menjaga rutinnya, bukan pamer.")); return; }
      arr.slice(0, 15).forEach(function (x) {
        body.appendChild(UI.el("div", { class: "hrow" }, [
          UI.el("div", { class: "tpl-ic", style: "width:38px;height:38px;background:var(--ok)" }, [UI.icon("heart")]),
          UI.el("div", { style: "flex:1" }, [UI.el("div", { class: "hname", text: x.bentuk + (x.jumlah ? " · " + UI.money(x.jumlah) : "") }), UI.el("div", { class: "hmeta" }, [UI.el("span", { text: UI.fmtDate(x.iso, true) }), x.niat ? UI.el("span", { text: "🤲 " + x.niat }) : null])]),
          UI.el("span", { class: "hint", style: "margin:0;cursor:pointer", text: "✕", onclick: function () { S.remove("sig_sedekah", x.id); render(); } })
        ]));
      });
    }
    function add() {
      var bentuk = UI.select(["Uang", "Makanan", "Barang", "Tenaga/Waktu", "Lainnya"].map(function (b) { return { v: b, l: b }; }), "Uang");
      var jml = UI.input({ type: "number", ph: "0 (kosongkan jika bukan uang)" });
      var niat = UI.input({ ph: "Niat/untuk siapa (opsional, biar makna terasa)" });
      var tgl = UI.input({ type: "date", val: UI.todayISO() });
      var body = UI.el("div", {}, [UI.field("Bentuk", bentuk), UI.field("Jumlah (Rp)", jml), UI.field("Niat", niat), UI.field("Tanggal", tgl)]);
      var save = UI.el("button", { class: "btn btn-primary", text: "Catat" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end;margin-top:6px" }, [save]));
      var m = UI.modal("Catat Sedekah", body);
      save.addEventListener("click", function () { S.push("sig_sedekah", { id: uid(), iso: tgl.value, bentuk: bentuk.value, jumlah: +jml.value || 0, niat: niat.value.trim() }); m.close(); render(); UI.toast("Semoga berkah 🤲", "ok"); });
    }

    function doaTab(body) {
      var arr = S.get("sig_doa", []);
      body.appendChild(UI.el("div", { class: "flex between center", style: "margin-bottom:14px" }, [
        UI.el("div", { class: "hint", style: "margin:0", text: "Kumpulan doa & dzikir yang ingin kamu rutinkan." }),
        UI.el("button", { class: "btn btn-primary btn-sm", onclick: function () { editDoa(null); } }, [UI.icon("plus"), "Doa"])
      ]));
      if (!arr.length) { body.appendChild(UI.empty("Belum ada doa tersimpan.")); return; }
      arr.forEach(function (x) {
        body.appendChild(UI.el("div", { class: "goal" }, [
          UI.el("div", { class: "flex between center", style: "margin-bottom:6px" }, [UI.el("b", { text: x.judul }), UI.el("button", { class: "note-act", onclick: function () { x.fav = !x.fav; S.update("sig_doa", x.id, x); render(); } }, [UI.icon(x.fav ? "star-filled" : "star")])]),
          UI.el("div", { style: "line-height:1.7;font-style:italic", text: x.teks }),
          UI.el("div", { class: "row gap8", style: "margin-top:10px" }, [UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { editDoa(x); } }, [UI.icon("edit"), "Edit"])])
        ]));
      });
    }
    function editDoa(x) {
      var isNew = !x; x = x || { id: uid(), judul: "", teks: "", fav: false };
      var jd = UI.input({ val: x.judul, ph: "mis. Doa pagi" });
      var tk = UI.textarea({ val: x.teks, ph: "Lafal / arti doa…", rows: 4 });
      var body = UI.el("div", {}, [UI.field("Judul", jd), UI.field("Isi doa", tk)]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Simpan" : "Perbarui" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Doa Baru" : "Edit Doa", body);
      save.addEventListener("click", function () { if (!jd.value.trim()) { UI.toast("Isi judul", "err"); return; } x.judul = jd.value.trim(); x.teks = tk.value.trim(); if (isNew) S.push("sig_doa", x); else S.update("sig_doa", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus doa?", "", function () { S.remove("sig_doa", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
