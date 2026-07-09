/* nilai.js — SIGNATURE Lumen: pelacak nilai & IPK (bobot SKS) + simulator target.
   Data: sig_grades [{id,matkul,sks,nilai}] (nilai poin 0-4). */
(window.SIG_SEEDERS = window.SIG_SEEDERS || []).push(function (S, spec, u) {
  if (spec.kind !== "student") return;
  var g = [
    { matkul: "Kalkulus II", sks: 3, nilai: 3.7 }, { matkul: "Struktur Data", sks: 4, nilai: 4 },
    { matkul: "Bahasa Inggris", sks: 2, nilai: 3.3 }, { matkul: "Fisika Dasar", sks: 3, nilai: 3 },
    { matkul: "Pancasila", sks: 2, nilai: 3.7 }
  ];
  S.set("sig_grades", g.map(function (x, i) { return { id: u.id() + i, matkul: x.matkul, sks: x.sks, nilai: x.nilai }; }));
});
window.Shell.register({
  id: "nilai", nama: "Nilai & IPK", icon: "chart-dots",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store;
    var HURUF = [{ v: 4, l: "A (4.0)" }, { v: 3.7, l: "A- (3.7)" }, { v: 3.3, l: "B+ (3.3)" }, { v: 3, l: "B (3.0)" }, { v: 2.7, l: "B- (2.7)" }, { v: 2.3, l: "C+ (2.3)" }, { v: 2, l: "C (2.0)" }, { v: 1, l: "D (1.0)" }, { v: 0, l: "E (0)" }];
    function grades() { return S.get("sig_grades", []); }
    function ipk(gs) { var ts = 0, tp = 0; gs.forEach(function (g) { ts += g.sks; tp += g.sks * g.nilai; }); return ts ? tp / ts : 0; }
    function letter(v) { for (var i = 0; i < HURUF.length; i++) if (v >= HURUF[i].v - 0.01) return HURUF[i].l.split(" ")[0]; return "E"; }

    function render() {
      UI.clear(root);
      var gs = grades();
      root.appendChild(UI.viewHead("Nilai & IPK", "Kuliah", UI.el("div", { class: "row gap8" }, [
        UI.el("button", { class: "btn btn-ghost", onclick: studyPlan }, [UI.icon("sparkles"), "Jadwal Belajar AI"]),
        UI.el("button", { class: "btn btn-ghost", onclick: simulator }, [UI.icon("calculator"), "Simulator IPK"]),
        UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Mata Kuliah"])
      ])));
      if (!gs.length) { root.appendChild(UI.empty("Belum ada mata kuliah.<br>Tambah nilai tiap matkul — IPK dihitung otomatis dengan bobot SKS.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tambah matkul"]))); return; }
      var g = ipk(gs), totSks = gs.reduce(function (a, x) { return a + x.sks; }, 0);
      root.appendChild(UI.el("section", { class: "hero", style: "margin-bottom:18px" }, [
        UI.el("div", { class: "hero-row" }, [
          UI.el("div", { style: "flex:1;min-width:220px" }, [
            UI.el("div", { class: "kick", text: "Indeks Prestasi" }),
            UI.el("h1", { class: "h1", text: g.toFixed(2) }),
            UI.el("div", { class: "sub", text: predikat(g) + " · " + totSks + " SKS · " + gs.length + " mata kuliah" })
          ]),
          UI.el("div", { style: "flex:none" }, [UI.gauge(Math.round(g / 4 * 100), { of: "dari 4.00", fmt: function () { return g.toFixed(2); }, w: 200 })])
        ])
      ]));
      var tbl = UI.el("table", { class: "tbl" }, [UI.el("tr", {}, [UI.el("th", { text: "Mata Kuliah" }), UI.el("th", { class: "num", text: "SKS" }), UI.el("th", { text: "Nilai" }), UI.el("th", { class: "num", text: "Bobot" }), UI.el("th", {})])]);
      gs.forEach(function (x) {
        tbl.appendChild(UI.el("tr", {}, [
          UI.el("td", {}, [UI.el("b", { text: x.matkul })]), UI.el("td", { class: "num", text: x.sks }),
          UI.el("td", {}, [UI.tag(letter(x.nilai), x.nilai >= 3 ? "var(--ok)" : x.nilai >= 2 ? "var(--warn)" : "var(--danger)")]),
          UI.el("td", { class: "num", text: (x.sks * x.nilai).toFixed(1) }),
          UI.el("td", { class: "num" }, [UI.el("button", { class: "btn btn-ghost btn-icon", onclick: function () { edit(x); } }, [UI.icon("dots")])])
        ]));
      });
      root.appendChild(UI.el("div", { class: "panel", style: "padding:6px 10px" }, [tbl]));
    }
    function predikat(g) { return g >= 3.5 ? "Cumlaude 🎓" : g >= 3 ? "Sangat Memuaskan" : g >= 2.5 ? "Memuaskan" : "Perlu ditingkatkan"; }

    function edit(x) {
      var isNew = !x; x = x || { id: uid(), matkul: "", sks: 3, nilai: 4 };
      var mk = UI.input({ val: x.matkul, ph: "mis. Kalkulus II" });
      var sks = UI.select([1, 2, 3, 4, 5, 6].map(function (n) { return { v: n, l: n + " SKS" }; }), x.sks);
      var nil = UI.select(HURUF, x.nilai);
      var body = UI.el("div", {}, [UI.field("Mata kuliah", mk), UI.el("div", { class: "grid2" }, [UI.field("SKS", sks), UI.field("Nilai", nil)])]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Mata Kuliah Baru" : "Edit Nilai", body);
      save.addEventListener("click", function () { if (!mk.value.trim()) { UI.toast("Isi matkul", "err"); return; } x.matkul = mk.value.trim(); x.sks = +sks.value; x.nilai = +nil.value; if (isNew) S.push("sig_grades", x); else S.update("sig_grades", x.id, x); m.close(); render(); });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus mata kuliah?", "", function () { S.remove("sig_grades", x.id); render(); }, { danger: true }); });
    }
    async function studyPlan() {
      if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu di Pengaturan", "err"); ctx.shell.openSettings(); return; }
      var box = UI.el("div", {}, [UI.spinner("Menyusun jadwal belajar…")]);
      var m = UI.modal("Jadwal Belajar AI", box, { wide: true });
      try {
        var gs = grades();
        var lemah = gs.slice().sort(function (a, b) { return a.nilai - b.nilai; }).slice(0, 3).map(function (g) { return g.matkul + " (nilai " + letter(g.nilai) + ", " + g.sks + " SKS)"; }).join("; ");
        var out = await ctx.ai.ask({
          system: ctx.brain.context() + "\nKamu mentor akademik. Susun jadwal belajar mingguan REALISTIS (bukan 8 jam/hari) yang memprioritaskan matkul terlemah, dengan teknik belajar spesifik (active recall, pomodoro, latihan soal).",
          prompt: "Matkulku yang paling butuh perhatian: " + (lemah || "-") + ". IPK sekarang " + ipk(gs).toFixed(2) + ".\nBalas JSON: {\"harian\":[{\"hari\":\"Senin\",\"sesi\":\"1 kalimat apa & teknik\"}...7],\"tips\":\"1 kalimat\"}", json: true, temp: 0.8
        });
        UI.clear(box);
        if (out && out.harian) {
          out.harian.forEach(function (h) { box.appendChild(UI.el("div", { class: "sub-item" }, [UI.el("b", { style: "width:64px;flex:none", text: h.hari }), UI.el("span", { text: h.sesi })])); });
          if (out.tips) box.appendChild(UI.briefing(UI.esc(out.tips), { title: "Tips", icon: "bulb" }));
        } else box.appendChild(UI.el("div", { class: "ai-out", text: typeof out === "string" ? out : JSON.stringify(out) }));
      } catch (e) { UI.clear(box); box.appendChild(UI.el("div", { class: "empty", text: e.message })); }
    }

    function simulator() {
      var gs = grades(), cur = ipk(gs), curSks = gs.reduce(function (a, x) { return a + x.sks; }, 0);
      var target = UI.input({ type: "number", val: "3.5", ph: "3.50" });
      var addSks = UI.input({ type: "number", val: "20", ph: "20" });
      var out = UI.el("div", { class: "ai-out", style: "margin-top:12px" });
      function calc() {
        var t = +target.value, ns = +addSks.value;
        if (!ns) { out.textContent = "Isi jumlah SKS semester depan."; return; }
        var needTotal = t * (curSks + ns), needNext = needTotal - cur * curSks;
        var needAvg = needNext / ns;
        out.innerHTML = needAvg > 4 ? "Target IPK <b>" + t.toFixed(2) + "</b> tidak tercapai hanya dengan " + ns + " SKS berikutnya (butuh rata-rata " + needAvg.toFixed(2) + ", maksimal 4.00). Tambah SKS atau turunkan target." :
          needAvg < 0 ? "Target sudah tercapai — pertahankan saja 🎉" :
            "Untuk IPK <b>" + t.toFixed(2) + "</b>, semester depan (" + ns + " SKS) kamu perlu rata-rata nilai <b>" + needAvg.toFixed(2) + "</b> (" + letter(needAvg) + ").";
      }
      target.addEventListener("input", calc); addSks.addEventListener("input", calc);
      var body = UI.el("div", {}, [UI.el("p", { class: "hint", text: "IPK sekarang " + cur.toFixed(2) + " (" + curSks + " SKS). Hitung nilai yang dibutuhkan semester depan:" }), UI.el("div", { class: "grid2" }, [UI.field("Target IPK", target), UI.field("SKS semester depan", addSks)]), out]);
      UI.modal("Simulator Target IPK", body); calc();
    }
    render();
  }
});
