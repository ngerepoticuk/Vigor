/* ibadah.js — SIGNATURE Nuur: ceklis ibadah harian (salat 5 waktu + amalan
   sunnah) + streak hari lengkap + rekap mingguan. Data: sig_ibadah { iso: {key:1} }. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "spiritual") return;
  var log = {}, fardhu = ["subuh", "dzuhur", "ashar", "maghrib", "isya"];
  for (var k = 6; k >= 0; k--) { var iso = u.iso(u.shift(-k)); log[iso] = {}; fardhu.forEach(function (f) { if (Math.random() < (k <= 1 ? 0.95 : 0.8)) log[iso][f] = 1; }); if (Math.random() < 0.6) log[iso].tilawah = 1; if (Math.random() < 0.4) log[iso].dhuha = 1; }
  S.set("sig_ibadah", log);
});
window.Shell.register({
  id: "ibadah", nama: "Ibadah Harian", icon: "moon-stars",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var FARDHU = [["subuh", "Subuh"], ["dzuhur", "Dzuhur"], ["ashar", "Ashar"], ["maghrib", "Maghrib"], ["isya", "Isya"]];
    var SUNNAH = [["tahajud", "Tahajud"], ["dhuha", "Dhuha"], ["tilawah", "Tilawah"], ["dzikir", "Dzikir pagi/petang"], ["sedekah", "Sedekah"]];
    function log() { return S.get("sig_ibadah", {}); }
    function iso(d) { return new Date(d).toISOString().slice(0, 10); }
    function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString().slice(0, 10); }
    function toggle(day, key) { var l = log(); l[day] = l[day] || {}; if (l[day][key]) delete l[day][key]; else l[day][key] = 1; S.set("sig_ibadah", l); }
    function fullDay(day) { var l = log()[day] || {}; return FARDHU.every(function (f) { return l[f[0]]; }); }
    function streak() { var s = 0, d = new Date(); d.setHours(0, 0, 0, 0); if (!fullDay(iso(d))) d.setDate(d.getDate() - 1); while (fullDay(iso(d))) { s++; d.setDate(d.getDate() - 1); } return s; }

    function render() {
      UI.clear(root);
      var t = today(), lt = log()[t] || {};
      var doneF = FARDHU.filter(function (f) { return lt[f[0]]; }).length;
      root.appendChild(UI.viewHead("Ibadah Harian", "Ibadah", null));
      // hero streak
      root.appendChild(UI.el("section", { class: "hero", style: "margin-bottom:18px" }, [
        UI.el("div", { class: "hero-row" }, [
          UI.el("div", { style: "flex:1;min-width:220px" }, [
            UI.el("div", { class: "kick", text: "Istiqamah" }),
            UI.el("h1", { class: "h1", text: streak() + " hari beruntun" }),
            UI.el("div", { class: "sub", text: "Salat 5 waktu lengkap. " + (doneF === 5 ? "Hari ini sudah lengkap — masyaAllah! 🌙" : "Hari ini " + doneF + "/5 — semangat lengkapi.") })
          ]),
          UI.el("div", { style: "flex:none" }, [UI.ringz(Math.round(doneF / 5 * 100), { size: 120, of: "hari ini", label: doneF + "/5" })])
        ])
      ]));
      // hari ini
      var todayCard = UI.el("div", { class: "panel", style: "margin-bottom:18px" }, [UI.el("div", { class: "panel-t", text: "Salat Fardhu Hari Ini" })]);
      var fg = UI.el("div", { class: "ibadah-fardhu" });
      FARDHU.forEach(function (f) {
        var on = !!lt[f[0]];
        fg.appendChild(UI.el("button", { class: "ib-time" + (on ? " on" : ""), onclick: function () { toggle(t, f[0]); render(); } }, [UI.el("span", { class: "ib-check" }, [UI.icon(on ? "check" : "circle")]), UI.el("span", { text: f[1] })]));
      });
      todayCard.appendChild(fg);
      todayCard.appendChild(UI.el("div", { class: "panel-t", style: "margin-top:16px;font-size:13.5px", text: "Amalan Sunnah" }));
      var sg = UI.el("div", { class: "row gap8", style: "margin-top:8px" });
      SUNNAH.forEach(function (s) { var on = !!lt[s[0]]; sg.appendChild(UI.el("button", { class: "chip" + (on ? " on" : ""), text: (on ? "✓ " : "+ ") + s[1], onclick: function () { toggle(t, s[0]); render(); } })); });
      todayCard.appendChild(sg);
      root.appendChild(todayCard);
      // rekap 7 hari
      var wk = UI.el("table", { class: "tbl", style: "text-align:center" });
      var hr = UI.el("tr", {}, [UI.el("th", { text: "Ibadah" })]);
      var days = []; for (var k = 6; k >= 0; k--) { var d = new Date(); d.setDate(d.getDate() - k); days.push(iso(d)); hr.appendChild(UI.el("th", { style: "text-align:center", text: UI.HARIS[d.getDay()] })); }
      wk.appendChild(hr);
      FARDHU.concat([["tilawah", "Tilawah"], ["dhuha", "Dhuha"]]).forEach(function (f) {
        var tr = UI.el("tr", {}, [UI.el("td", { style: "text-align:left", text: f[1] })]);
        days.forEach(function (dy) { var on = (log()[dy] || {})[f[0]]; tr.appendChild(UI.el("td", {}, [UI.el("span", { class: "ib-dot" + (on ? " on" : "") })])); });
        wk.appendChild(tr);
      });
      root.appendChild(UI.el("div", { class: "panel", style: "padding:8px 12px" }, [UI.el("div", { class: "panel-t", style: "padding:8px 4px 0", text: "Rekap 7 Hari" }), wk]));
    }
    render();
  }
});
