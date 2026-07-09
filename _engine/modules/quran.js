/* quran.js — SIGNATURE Nuur: pelacak khatam Quran (30 juz) + log tilawah harian
   + estimasi tanggal khatam. Data: sig_quran {target, log:[{iso,juz,halaman}]}. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "spiritual") return;
  var log = [];
  [0, 1, 2, 3, 5, 6].forEach(function (k, i) { log.push({ id: u.id() + i, iso: u.iso(u.shift(-k)), juz: 1, halaman: 4 + (i % 3) }); });
  S.set("sig_quran", { target: 30, khatamKe: 1, log: log });
});
window.Shell.register({
  id: "quran", nama: "Khatam Quran", icon: "book-2",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    function data() { return S.get("sig_quran", { target: 30, khatamKe: 1, log: [] }); }
    function save(d) { S.set("sig_quran", d); }
    // total halaman terbaca (1 juz ≈ 20 halaman), khatam = 604 halaman
    function totalHal(d) { return d.log.reduce(function (a, l) { return a + (+l.halaman || 0); }, 0); }

    function render() {
      UI.clear(root);
      var d = data();
      var hal = totalHal(d), pctKhatam = Math.min(100, Math.round(hal / 604 * 100));
      var juzSelesai = Math.min(30, Math.floor(hal / 20));
      // laju
      var days = {}; d.log.forEach(function (l) { days[l.iso] = (days[l.iso] || 0) + l.halaman; });
      var last14 = 0, cnt = 0; for (var k = 0; k < 14; k++) { var iso = new Date(Date.now() - k * 864e5).toISOString().slice(0, 10); if (days[iso]) { last14 += days[iso]; cnt++; } }
      var laju = cnt ? last14 / 14 : 0;
      var sisaHal = 604 - hal, estHari = laju > 0 ? Math.ceil(sisaHal / laju) : null;

      root.appendChild(UI.viewHead("Khatam Quran", "Ibadah", UI.el("button", { class: "btn btn-primary", onclick: addLog }, [UI.icon("plus"), "Catat Tilawah"])));
      root.appendChild(UI.el("section", { class: "hero", style: "margin-bottom:18px" }, [
        UI.el("div", { class: "hero-row" }, [
          UI.el("div", { style: "flex:1;min-width:220px" }, [
            UI.el("div", { class: "kick", text: "Khatam ke-" + (d.khatamKe || 1) }),
            UI.el("h1", { class: "h1", text: juzSelesai + " dari 30 Juz" }),
            UI.el("div", { class: "sub", text: hal + " / 604 halaman" + (estHari != null ? " · perkiraan khatam ~" + estHari + " hari lagi (laju " + laju.toFixed(1) + " hal/hari)" : ". Catat tilawah untuk melihat estimasi.") }),
            UI.el("div", { class: "hero-kpis" }, [
              UI.el("div", { class: "hkpi" }, [UI.el("div", { class: "k", text: "Halaman/hari (14h)" }), UI.el("div", { class: "v", text: laju.toFixed(1) })]),
              UI.el("div", { class: "hkpi" }, [UI.el("div", { class: "k", text: "Sisa halaman" }), UI.el("div", { class: "v", text: sisaHal })])
            ])
          ]),
          UI.el("div", { style: "flex:none" }, [UI.ringz(pctKhatam, { size: 130, of: "khatam", label: pctKhatam + "%" })])
        ])
      ]));
      if (pctKhatam >= 100) root.appendChild(UI.el("div", { class: "rt-done", style: "margin-bottom:18px;font-size:15px", text: "🎉 Alhamdulillah, khatam! Mulai khatam berikutnya?" }));

      // grid 30 juz
      var jg = UI.el("div", { class: "juz-grid" });
      for (var j = 1; j <= 30; j++) { var on = j <= juzSelesai; jg.appendChild(UI.el("div", { class: "juz" + (on ? " on" : ""), title: "Juz " + j }, [UI.el("span", { text: j })])); }
      root.appendChild(UI.el("div", { class: "panel", style: "margin-bottom:18px" }, [UI.el("div", { class: "panel-t", text: "Progres per Juz" }), UI.el("div", { style: "margin-top:12px" }, [jg])]));

      // log
      if (d.log.length) {
        var tbl = UI.el("table", { class: "tbl" }, [UI.el("tr", {}, [UI.el("th", { text: "Tanggal" }), UI.el("th", { class: "num", text: "Halaman" }), UI.el("th", {})])]);
        d.log.slice().sort(function (a, b) { return a.iso < b.iso ? 1 : -1; }).slice(0, 10).forEach(function (l) {
          tbl.appendChild(UI.el("tr", {}, [UI.el("td", { text: UI.fmtDate(l.iso, true) }), UI.el("td", { class: "num", text: l.halaman + " hal" }), UI.el("td", { class: "num" }, [UI.el("span", { style: "cursor:pointer;color:var(--muted)", text: "✕", onclick: function () { var dd = data(); dd.log = dd.log.filter(function (x) { return x.id !== l.id; }); save(dd); render(); } })])]));
        });
        root.appendChild(UI.el("div", { class: "panel", style: "padding:6px 10px" }, [tbl]));
      }
    }

    function addLog() {
      var hal = UI.input({ type: "number", ph: "mis. 5" });
      var tgl = UI.input({ type: "date", val: UI.todayISO() });
      var body = UI.el("div", {}, [UI.el("p", { class: "hint", text: "Berapa halaman kamu baca hari ini? (1 juz ≈ 20 halaman)" }), UI.field("Halaman dibaca", hal), UI.field("Tanggal", tgl)]);
      var save2 = UI.el("button", { class: "btn btn-primary", text: "Catat" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end;margin-top:6px" }, [save2]));
      var m = UI.modal("Catat Tilawah", body);
      save2.addEventListener("click", function () { if (!+hal.value) { UI.toast("Isi halaman", "err"); return; } var d = data(); d.log.push({ id: uid(), iso: tgl.value, halaman: +hal.value }); save(d); m.close(); render(); UI.toast("Barakallah ✓", "ok"); });
    }
    render();
  }
});
