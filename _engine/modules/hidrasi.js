/* hidrasi.js — SIGNATURE Vita: pelacak minum air harian + target gelas + streak
   + rata-rata mingguan. Data: sig_water { target, log:{ iso: gelas } }. */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "wellness") return;
  var log = {}; for (var k = 6; k >= 0; k--) { log[u.iso(u.shift(-k))] = 4 + Math.floor(Math.random() * 5); }
  S.set("sig_water", { target: 8, log: log });
});
window.Shell.register({
  id: "hidrasi", nama: "Hidrasi", icon: "droplet",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    function data() { return S.get("sig_water", { target: 8, log: {} }); }
    function save(d) { S.set("sig_water", d); }
    function today() { var dd = new Date(); dd.setHours(0, 0, 0, 0); return dd.toISOString().slice(0, 10); }

    function render() {
      UI.clear(root);
      var d = data(), t = today(), cur = d.log[t] || 0, target = d.target || 8;
      var days = []; for (var k = 6; k >= 0; k--) { var dt = new Date(); dt.setDate(dt.getDate() - k); days.push(dt.toISOString().slice(0, 10)); }
      var avg = days.reduce(function (a, x) { return a + (d.log[x] || 0); }, 0) / 7;
      var streak = 0; for (var i = 0; i < 30; i++) { var dd = new Date(); dd.setDate(dd.getDate() - i); var iso = dd.toISOString().slice(0, 10); if ((d.log[iso] || 0) >= target) streak++; else if (i > 0) break; }

      root.appendChild(UI.viewHead("Hidrasi", "Kesejahteraan", UI.el("button", { class: "btn btn-ghost btn-sm", onclick: setTarget }, [UI.icon("settings"), "Target"])));
      root.appendChild(UI.el("section", { class: "hero", style: "margin-bottom:18px" }, [
        UI.el("div", { class: "hero-row" }, [
          UI.el("div", { style: "flex:1;min-width:220px" }, [
            UI.el("div", { class: "kick", text: "Hari ini" }),
            UI.el("h1", { class: "h1", text: cur + " / " + target + " gelas" }),
            UI.el("div", { class: "sub", text: cur >= target ? "Target tercapai — tubuhmu berterima kasih! 💧" : (target - cur) + " gelas lagi menuju target. Rata-rata mingguan " + avg.toFixed(1) + " gelas." }),
            UI.el("div", { class: "row gap8", style: "margin-top:16px" }, [
              UI.el("button", { class: "btn btn-primary", onclick: function () { d.log[t] = (d.log[t] || 0) + 1; save(d); render(); } }, [UI.icon("plus"), "+1 gelas"]),
              cur > 0 ? UI.el("button", { class: "btn btn-ghost", onclick: function () { d.log[t] = Math.max(0, (d.log[t] || 0) - 1); save(d); render(); } }, [UI.icon("minus")]) : null
            ])
          ]),
          UI.el("div", { style: "flex:none" }, [UI.ringz(Math.min(100, Math.round(cur / target * 100)), { size: 130, of: "gelas", label: cur + "/" + target, color: "#38bdf8" })])
        ])
      ]));
      // gelas visual
      var glasses = UI.el("div", { class: "glass-row" });
      for (var gi = 0; gi < target; gi++) { (function (gi) { var on = gi < cur; glasses.appendChild(UI.el("button", { class: "glass" + (on ? " on" : ""), onclick: function () { d.log[t] = (gi + 1 === cur) ? gi : gi + 1; save(d); render(); } }, [UI.icon("droplet")])); })(gi); }
      root.appendChild(UI.el("div", { class: "panel", style: "margin-bottom:18px" }, [UI.el("div", { class: "panel-t", text: "Gelas hari ini (ketuk untuk isi)" }), UI.el("div", { style: "margin-top:12px" }, [glasses])]));
      // stat + tren
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:18px" }, [
        UI.statCard({ label: "Streak target", value: streak, fmt: function (v) { return Math.round(v) + " hari"; }, icon: "flame" }),
        UI.statCard({ label: "Rata-rata (7h)", value: avg.toFixed(1) + " gelas", icon: "chart-bar" }),
        UI.statCard({ label: "Target harian", value: target + " gelas", icon: "target" })
      ]));
      root.appendChild(UI.el("div", { class: "panel" }, [UI.el("div", { class: "panel-t", text: "7 Hari Terakhir" }), UI.el("div", { style: "height:120px;margin-top:14px" }, [UI.bars(days.map(function (x) { return { label: UI.HARIS[new Date(x).getDay()], val: d.log[x] || 0, dim: (d.log[x] || 0) < target }; }), { h: 120 })])]));
    }
    function setTarget() {
      var d = data(); var inp = UI.input({ type: "number", val: d.target, ph: "8" });
      var body = UI.el("div", {}, [UI.el("p", { class: "hint", text: "Rekomendasi umum: 8 gelas (± 2 liter) per hari." }), UI.field("Target gelas/hari", inp)]);
      var save2 = UI.el("button", { class: "btn btn-primary", text: "Simpan" }); body.appendChild(UI.el("div", { class: "row", style: "justify-content:flex-end" }, [save2]));
      var m = UI.modal("Target Hidrasi", body);
      save2.addEventListener("click", function () { d.target = Math.max(1, +inp.value || 8); save(d); m.close(); render(); });
    }
    render();
  }
});
