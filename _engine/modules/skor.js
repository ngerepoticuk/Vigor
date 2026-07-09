/* skor.js — Skor Hidup: gauge besar, rincian komponen, radar area,
   bar per-area, tren skor (snapshot mingguan otomatis). */
window.Shell.register({
  id: "skor", nama: "Skor Hidup", icon: "gauge",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store, I = ctx.intel, spec = ctx.spec;
    var scoreLabel = spec.scoreLabel || "Skor Hidup";

    // snapshot mingguan
    (function snap() {
      var ls = I.lifeScore(), hist = S.get("scorehist", []); var wk = weekKey();
      if (!hist.length || hist[hist.length - 1].wk !== wk) { hist.push({ wk: wk, t: Date.now(), score: ls.score }); S.set("scorehist", hist.slice(-26)); }
    })();

    function render() {
      UI.clear(root);
      var ls = I.lifeScore();
      root.appendChild(UI.viewHead(scoreLabel, "Ukuran keseluruhan", null));

      // gauge + rincian
      root.appendChild(UI.el("div", { class: "split" }, [
        UI.el("div", { class: "panel", style: "text-align:center" }, [
          UI.gauge(ls.score, { of: "dari 100", w: 260 }),
          UI.el("div", { style: "font-family:var(--font-d);font-weight:700;font-size:17px;margin-top:6px", text: label(ls.score) }),
          UI.el("div", { class: "hint", style: "margin-top:4px", text: msg(ls.score) })
        ]),
        UI.el("div", { class: "panel" }, [
          UI.el("div", { class: "panel-t", text: "Dari mana skornya" }),
          UI.el("div", { class: "hint", text: "Skor = konsistensi kebiasaan, progres sasaran, kebiasaan jurnal, dan keseimbangan antar-area." }),
          UI.barsH([
            { label: "Konsistensi kebiasaan (40%)", val: ls.cons, note: ls.cons + "%" },
            { label: "Progres sasaran (25%)", val: ls.goalProg, note: ls.goalProg + "%" },
            { label: "Kebiasaan jurnal (15%)", val: ls.journal, note: ls.journal + "%" },
            { label: "Keseimbangan area (20%)", val: ls.balance, note: ls.balance + "%" }
          ], { max: 100 })
        ])
      ]));

      // radar + bars area
      var ds = I.domainScores().filter(function (d) { return d.hasData; });
      if (ds.length) {
        root.appendChild(UI.el("div", { class: "split", style: "margin-top:16px" }, [
          UI.el("div", { class: "panel" }, [UI.el("div", { class: "panel-t", text: spec.wheelLabel || "Roda Keseimbangan" }), ds.length >= 3 ? UI.radar(ds.map(function (d) { return { label: d.label, val: d.val }; }), { size: 280 }) : UI.empty("Butuh ≥3 area berdata.")]),
          UI.el("div", { class: "panel" }, [UI.el("div", { class: "panel-t", text: "Skor per area" }), UI.barsH(ds.map(function (d) { return { label: d.label, val: d.val, color: d.color || "var(--primary)", note: d.val + "" }; }), { max: 100 })])
        ]));
      }

      // tren skor
      var hist = S.get("scorehist", []);
      if (hist.length >= 2) {
        root.appendChild(UI.el("div", { class: "panel", style: "margin-top:16px" }, [
          UI.el("div", { class: "panel-t", text: "Tren skor (mingguan)" }),
          UI.el("div", { style: "height:60px;margin-top:8px" }, [UI.spark(hist.map(function (h) { return h.score; }), { w: 600, h: 60 })]),
          UI.el("div", { class: "hint", style: "margin-top:6px", text: hist.length + " minggu terekam · terbaru " + hist[hist.length - 1].score + " · " + trendWord(hist) })
        ]));
      }
    }

    function label(s) { return s >= 80 ? "Berkembang pesat 🌿" : s >= 60 ? "Bertumbuh stabil" : s >= 40 ? "Sedang membangun" : "Awal perjalanan"; }
    function msg(s) { return s >= 80 ? "Ritmemu kuat. Jaga & nikmati prosesnya." : s >= 60 ? "Pondasi bagus. Rapikan area terlemah." : s >= 40 ? "Momentum mulai terbentuk. Fokus 1 kebiasaan inti." : "Setiap ahli pernah pemula. Mulai dari 1 langkah kecil hari ini."; }
    function trendWord(h) { var d = h[h.length - 1].score - h[0].score; return d > 3 ? "naik " + d + " poin sejak awal" : d < -3 ? "turun " + Math.abs(d) + " poin" : "relatif stabil"; }
    function weekKey() { var d = new Date(); var onejan = new Date(d.getFullYear(), 0, 1); var wk = Math.ceil((((d - onejan) / 864e5) + onejan.getDay() + 1) / 7); return d.getFullYear() + "-W" + wk; }

    render();
  }
});
