/* invoice.js — SIGNATURE Helm: invoice sederhana (klien, item, total, status)
   + pratinjau siap-cetak (print-sheet). Data: sig_invoices. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "business") return;
  S.set("sig_invoices", [
    { id: u.id() + 1, no: "INV-001", klien: "PT Maju Jaya", iso: u.iso(u.shift(-6)), items: [{ d: "Jasa desain landing page", q: 1, h: 3500000 }, { d: "Maintenance 1 bulan", q: 1, h: 500000 }], status: "lunas" },
    { id: u.id() + 2, no: "INV-002", klien: "Toko Berkah", iso: u.iso(u.shift(-2)), items: [{ d: "Paket branding UMKM", q: 1, h: 2000000 }], status: "terkirim" }
  ]);
});
window.Shell.register({
  id: "invoice", nama: "Invoice", icon: "file-invoice",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var ST = { draft: { l: "Draft", c: "var(--muted)" }, terkirim: { l: "Terkirim", c: "var(--warn)" }, lunas: { l: "Lunas ✓", c: "var(--ok)" } };
    var preview = null;
    function all() { return S.get("sig_invoices", []); }
    function total(inv) { return (inv.items || []).reduce(function (a, i) { return a + (i.q || 1) * (i.h || 0); }, 0); }

    function render() {
      UI.clear(root);
      if (preview) return renderPreview(preview);
      var arr = all().slice().sort(function (a, b) { return a.iso < b.iso ? 1 : -1; });
      root.appendChild(UI.viewHead("Invoice", "Bisnis", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Invoice"])));
      if (!arr.length) { root.appendChild(UI.empty("Belum ada invoice.<br>Buat tagihan profesional untuk klienmu — rapi, tercatat, siap cetak.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Buat invoice"]))); return; }
      var belum = arr.filter(function (x) { return x.status !== "lunas"; }).reduce(function (a, x) { return a + total(x); }, 0);
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Total invoice", value: arr.length, icon: "file-invoice" }),
        UI.statCard({ label: "Belum dibayar", value: belum, fmt: UI.money, icon: "clock", color: "var(--warn)" }),
        UI.statCard({ label: "Lunas", value: arr.filter(function (x) { return x.status === "lunas"; }).length, icon: "circle-check", color: "var(--ok)" })
      ]));
      var tbl = UI.el("table", { class: "tbl" }, [UI.el("tr", {}, [UI.el("th", { text: "No" }), UI.el("th", { text: "Klien" }), UI.el("th", { text: "Tanggal" }), UI.el("th", { class: "num", text: "Total" }), UI.el("th", { text: "Status" }), UI.el("th", {})])]);
      arr.forEach(function (x) {
        tbl.appendChild(UI.el("tr", {}, [
          UI.el("td", {}, [UI.el("b", { class: "mono", style: "font-size:12.5px", text: x.no })]), UI.el("td", { text: x.klien }), UI.el("td", { text: UI.fmtDate(x.iso, true) }),
          UI.el("td", { class: "num", text: UI.money(total(x)) }), UI.el("td", {}, [UI.tag(ST[x.status].l, ST[x.status].c)]),
          UI.el("td", { class: "num" }, [UI.el("div", { class: "row gap8", style: "justify-content:flex-end" }, [
            UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { preview = x; render(); } }, [UI.icon("printer"), "Cetak"]),
            UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { edit(x); } }, [UI.icon("dots")])
          ])])
        ]));
      });
      root.appendChild(UI.el("div", { class: "panel", style: "padding:6px 10px" }, [tbl]));
    }

    function renderPreview(inv) {
      root.appendChild(UI.el("div", { class: "cetak-controls" }, [
        UI.el("button", { class: "btn btn-ghost", onclick: function () { preview = null; render(); } }, [UI.icon("arrow-left"), "Kembali"]),
        UI.el("button", { class: "btn btn-primary", onclick: function () { window.print(); } }, [UI.icon("printer"), "Cetak / Simpan PDF"])
      ]));
      var b = ctx.brain.get();
      var sheet = UI.el("div", { class: "print-sheet" });
      sheet.appendChild(UI.el("div", { class: "ps-head" }, [
        UI.el("div", {}, [UI.el("div", { class: "ps-brand", text: b.diri.nama || APP.nama }), UI.el("div", { class: "ps-title", text: "INVOICE" })]),
        UI.el("div", { class: "ps-date" }, [UI.el("b", { class: "mono", text: inv.no }), UI.el("div", { text: UI.fmtDate(inv.iso, true) })])
      ]));
      sheet.appendChild(UI.el("div", { class: "ps-strip" }, [UI.el("span", { class: "ps-lbl", text: "Ditagihkan ke" }), UI.el("span", { class: "ps-fill", text: inv.klien })]));
      var tbl = UI.el("table", { class: "ps-tbl" }, [UI.el("tr", {}, [UI.el("th", { text: "Deskripsi" }), UI.el("th", { style: "text-align:right", text: "Qty" }), UI.el("th", { style: "text-align:right", text: "Harga" }), UI.el("th", { style: "text-align:right", text: "Subtotal" })])]);
      (inv.items || []).forEach(function (i) {
        tbl.appendChild(UI.el("tr", {}, [UI.el("td", { text: i.d }), UI.el("td", { style: "text-align:right", text: i.q || 1 }), UI.el("td", { style: "text-align:right", text: UI.money(i.h) }), UI.el("td", { style: "text-align:right", text: UI.money((i.q || 1) * (i.h || 0)) })]));
      });
      sheet.appendChild(tbl);
      sheet.appendChild(UI.el("div", { style: "text-align:right;margin-top:14px" }, [
        UI.el("div", { style: "font-size:11px;color:#6a6a84;text-transform:uppercase;letter-spacing:.06em", text: "Total" }),
        UI.el("div", { style: "font-family:var(--font-d);font-weight:800;font-size:28px;color:var(--primary-deep,#333)", text: UI.money(total(inv)) })
      ]));
      sheet.appendChild(UI.el("div", { class: "ps-sec", style: "margin-top:22px", text: "Catatan" }));
      sheet.appendChild(UI.el("div", { style: "font-size:12px;color:#6a6a84", text: "Terima kasih atas kepercayaannya. Pembayaran dapat dilakukan via transfer — hubungi kami untuk detail rekening." }));
      sheet.appendChild(UI.el("div", { class: "ps-foot", text: (b.diri.nama || APP.nama) + " · dibuat dengan " + APP.nama }));
      root.appendChild(UI.el("div", { class: "print-stage" }, [sheet]));
    }

    function edit(x) {
      var isNew = !x; x = x ? JSON.parse(JSON.stringify(x)) : { id: uid(), no: "INV-" + String(all().length + 1).padStart(3, "0"), klien: "", iso: UI.todayISO(), items: [{ d: "", q: 1, h: 0 }], status: "draft" };
      var no = UI.input({ val: x.no }); var klien = UI.input({ val: x.klien, ph: "Nama klien" });
      var tgl = UI.input({ type: "date", val: x.iso });
      var st = UI.select([{ v: "draft", l: "Draft" }, { v: "terkirim", l: "Terkirim" }, { v: "lunas", l: "Lunas" }], x.status);
      var itemsWrap = UI.el("div", { class: "stack", style: "gap:8px" });
      function draw() {
        UI.clear(itemsWrap);
        x.items.forEach(function (it, i) {
          var d = UI.input({ val: it.d, ph: "Deskripsi" }); d.addEventListener("input", function () { it.d = d.value; });
          var q = UI.el("input", { class: "input", type: "number", style: "width:64px", value: it.q || 1 }); q.addEventListener("input", function () { it.q = +q.value || 1; });
          var h = UI.el("input", { class: "input", type: "number", style: "width:130px", value: it.h || "" }); h.addEventListener("input", function () { it.h = +h.value || 0; });
          itemsWrap.appendChild(UI.el("div", { class: "flex center gap8" }, [d, q, h, UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { x.items.splice(i, 1); draw(); } }, [UI.icon("x")])]));
        });
        itemsWrap.appendChild(UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { x.items.push({ d: "", q: 1, h: 0 }); draw(); } }, [UI.icon("plus"), "Item"]));
      }
      draw();
      var body = UI.el("div", {}, [UI.el("div", { class: "grid2" }, [UI.field("No. invoice", no), UI.field("Status", st)]), UI.field("Klien", klien), UI.field("Tanggal", tgl), UI.el("label", { class: "fld" }, [UI.el("span", { text: "Item (deskripsi · qty · harga)" }), itemsWrap])]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Buat" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Invoice Baru" : "Edit Invoice", body, { wide: true });
      save.addEventListener("click", function () {
        if (!klien.value.trim()) { UI.toast("Isi klien", "err"); return; }
        x.no = no.value.trim(); x.klien = klien.value.trim(); x.iso = tgl.value; x.status = st.value; x.items = x.items.filter(function (i) { return i.d.trim(); });
        var arr = S.get("sig_invoices", []); var i = arr.map(function (y) { return y.id; }).indexOf(x.id); if (i >= 0) arr[i] = x; else arr.push(x); S.set("sig_invoices", arr);
        m.close(); render();
      });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus invoice?", "", function () { S.remove("sig_invoices", x.id); render(); }, { danger: true }); });
    }
    render();
    return { unmount: function () { preview = null; } };
  }
});
