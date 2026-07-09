/* tubuh.js — SIGNATURE Forge: progres tubuh (berat + lingkar) dari waktu ke
   waktu + tren + selisih. Data: sig_body [{id,iso,berat,pinggang,lengan,dada,catatan}]. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "fitness") return;
  var arr = [], w = 78;
  [56, 42, 28, 14, 0].forEach(function (k, i) { arr.push({ id: u.id() + i, iso: u.iso(u.shift(-k)), berat: +(w - i * 1.2).toFixed(1), pinggang: 92 - i, lengan: 34 + i * 0.3, dada: 100 + i * 0.2, catatan: "" }); });
  S.set("sig_body", arr);
});
window.Shell.register({
  id: "tubuh", nama: "Progres Tubuh", icon: "scale",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    function arr() { return S.get("sig_body", []).slice().sort(function (a, b) { return a.iso < b.iso ? -1 : 1; }); }

    function render() {
      UI.clear(root);
      var a = arr();
      root.appendChild(UI.viewHead("Progres Tubuh", "Latihan", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Catat Ukuran"])));
      if (!a.length) { root.appendChild(UI.empty("Belum ada data tubuh.<br>Catat berat & lingkar tubuh berkala — lihat perubahannya dari waktu ke waktu.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Catat pertama"]))); return; }
      var first = a[0], last = a[a.length - 1];
      function delta(k, unit) { var d = (last[k] - first[k]); return (d > 0 ? "+" : "") + d.toFixed(1) + (unit || ""); }
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Berat sekarang", value: last.berat + " kg", delta: delta("berat", " kg"), dir: last.berat <= first.berat ? "up" : "down", icon: "scale" }),
        UI.statCard({ label: "Lingkar pinggang", value: (last.pinggang || 0) + " cm", delta: delta("pinggang", " cm"), dir: last.pinggang <= first.pinggang ? "up" : "down", icon: "ruler" }),
        UI.statCard({ label: "Lingkar lengan", value: (last.lengan || 0) + " cm", delta: delta("lengan", " cm"), dir: last.lengan >= first.lengan ? "up" : "down", icon: "muscle" }),
        UI.statCard({ label: "Total catatan", value: a.length, icon: "history" })
      ]));
      root.appendChild(UI.el("div", { class: "panel", style: "margin-bottom:18px" }, [UI.el("div", { class: "panel-t", text: "Tren Berat Badan" }), UI.el("div", { style: "height:130px;margin-top:14px" }, [UI.bars(a.slice(-10).map(function (x) { return { label: UI.fmtDate(x.iso), val: x.berat }; }), { h: 130 })])]));
      var tbl = UI.el("table", { class: "tbl" }, [UI.el("tr", {}, [UI.el("th", { text: "Tanggal" }), UI.el("th", { class: "num", text: "Berat" }), UI.el("th", { class: "num", text: "Pinggang" }), UI.el("th", { class: "num", text: "Lengan" }), UI.el("th", {})])]);
      a.slice().reverse().forEach(function (x) {
        tbl.appendChild(UI.el("tr", {}, [UI.el("td", { text: UI.fmtDate(x.iso, true) }), UI.el("td", { class: "num", text: x.berat + " kg" }), UI.el("td", { class: "num", text: (x.pinggang || "-") + " cm" }), UI.el("td", { class: "num", text: (x.lengan || "-") + " cm" }), UI.el("td", { class: "num" }, [UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { edit(x); } }, [UI.icon("dots")])])]));
      });
      root.appendChild(UI.el("div", { class: "panel", style: "padding:6px 10px" }, [tbl]));
    }
    function edit(x) {
      var isNew = !x; x = x || { id: uid(), iso: UI.todayISO(), berat: "", pinggang: "", lengan: "", dada: "", catatan: "" };
      var tgl = UI.input({ type: "date", val: x.iso });
      var berat = UI.input({ type: "number", step: "0.1", val: x.berat, ph: "kg" });
      var pinggang = UI.input({ type: "number", step: "0.1", val: x.pinggang, ph: "cm" });
      var lengan = UI.input({ type: "number", step: "0.1", val: x.lengan, ph: "cm" });
      var dada = UI.input({ type: "number", step: "0.1", val: x.dada, ph: "cm" });
      var body = UI.el("div", {}, [UI.field("Tanggal", tgl), UI.field("Berat (kg)", berat), UI.el("div", { class: "grid2" }, [UI.field("Pinggang (cm)", pinggang), UI.field("Lengan (cm)", lengan)]), UI.field("Dada (cm)", dada)]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Simpan" : "Perbarui" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Catat Ukuran Tubuh" : "Edit Ukuran", body);
      save.addEventListener("click", function () { if (!berat.value) { UI.toast("Isi berat", "err"); return; } x.iso = tgl.value; x.berat = +berat.value; x.pinggang = +pinggang.value || 0; x.lengan = +lengan.value || 0; x.dada = +dada.value || 0; if (isNew) S.push("sig_body", x); else S.update("sig_body", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus catatan?", "", function () { S.remove("sig_body", x.id); render(); }, { danger: true }); });
    }
    render();
  }
});
