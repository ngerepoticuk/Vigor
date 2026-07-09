/* sasaran.js — Goals: kaskade horizon (tahun→kuartal→bulan→minggu), subtugas,
   progres otomatis dari subtugas, domain, deadline, pecah-langkah AI. */
window.Shell.register({
  id: "sasaran", nama: "Sasaran", icon: "target-arrow",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store, spec = ctx.spec;
    var HOR = [{ k: "tahun", l: "Tahun Ini" }, { k: "kuartal", l: "Kuartal" }, { k: "bulan", l: "Bulan" }, { k: "minggu", l: "Minggu" }];
    var filter = "semua";

    function render() {
      UI.clear(root);
      var goals = S.get("goals", []);
      root.appendChild(UI.viewHead(spec.sasaranTitle || "Sasaran & Impian", "Goals", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Sasaran"])));

      if (!goals.length) { root.appendChild(UI.empty("Belum ada sasaran.<br>Tetapkan 1 impian besar tahun ini, lalu pecah ke langkah kecil.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Buat sasaran"]))); return; }

      // ringkasan
      var active = goals.filter(function (g) { return g.status !== "arsip"; });
      var done = active.filter(function (g) { return g.status === "selesai" || g.progress >= 100; }).length;
      var avg = active.length ? Math.round(active.reduce(function (a, g) { return a + (+g.progress || 0); }, 0) / active.length) : 0;
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:14px" }, [
        UI.statCard({ label: "Sasaran aktif", value: active.length - done, icon: "target" }),
        UI.statCard({ label: "Tercapai", value: done, icon: "trophy" }),
        UI.statCard({ label: "Rata-rata progres", value: avg, fmt: function (v) { return Math.round(v) + "%"; }, icon: "chart-arcs" })
      ]));

      // filter horizon
      var seg = UI.el("div", { class: "seg", style: "margin-bottom:16px" });
      [{ k: "semua", l: "Semua" }].concat(HOR).forEach(function (h) {
        seg.appendChild(UI.el("button", { class: filter === h.k ? "on" : "", text: h.l, onclick: function () { filter = h.k; render(); } }));
      });
      root.appendChild(seg);

      HOR.forEach(function (h) {
        if (filter !== "semua" && filter !== h.k) return;
        var gs = goals.filter(function (g) { return g.horizon === h.k && g.status !== "arsip"; });
        if (!gs.length) return;
        root.appendChild(UI.el("div", { class: "kick", style: "margin-top:18px", text: h.l }));
        gs.forEach(function (g) { root.appendChild(goalCard(g)); });
      });
    }

    function goalCard(g) {
      var prog = calcProg(g);
      var col = domColor(spec, g.domain) || "var(--primary)";
      var card = UI.el("div", { class: "goal" });
      var head = UI.el("div", { class: "goal-top" }, [
        UI.el("div", { style: "flex:1" }, [
          UI.el("div", { class: "flex center gap8", style: "margin-bottom:4px" }, [
            g.domain ? UI.tag(domLabel(spec, g.domain), col) : null,
            g.deadline ? UI.el("span", { class: "hint", style: "margin:0;font-size:11.5px", text: "⌛ " + UI.fmtDate(g.deadline, true) + deadlineNote(g) }) : null
          ]),
          UI.el("div", { class: "goal-title", text: g.judul }),
          g.kenapa ? UI.el("div", { class: "hint", style: "margin:6px 0 0", text: "Kenapa: " + g.kenapa }) : null
        ]),
        UI.el("div", { style: "text-align:right;flex:none" }, [
          UI.el("div", { style: "font-family:var(--font-d);font-weight:800;font-size:22px;color:" + col, text: prog + "%" }),
          UI.el("button", { class: "btn btn-ghost btn-sm", style: "margin-top:6px", onclick: function () { edit(g); } }, [UI.icon("edit"), "Edit"])
        ])
      ]);
      card.appendChild(head);
      card.appendChild(UI.el("div", { style: "margin:12px 0" }, [UI.progress(prog, { color: col })]));

      // subtugas
      var subWrap = UI.el("div", {});
      (g.sub || []).forEach(function (s, i) {
        var row = UI.el("div", { class: "sub-item" + (s.done ? " done" : "") }, [
          UI.el("button", { class: "hcheck", style: "width:22px;height:22px;border-radius:7px", onclick: function () { s.done = !s.done; save(g); render(); } }, [s.done ? UI.icon("check") : null]),
          UI.el("span", { style: "flex:1", text: s.t }),
          UI.el("span", { class: "hint", style: "margin:0;cursor:pointer", text: "✕", onclick: function () { g.sub.splice(i, 1); save(g); render(); } })
        ]);
        subWrap.appendChild(row);
      });
      card.appendChild(subWrap);
      // add sub
      var addInp = UI.input({ ph: "+ langkah kecil, lalu Enter" });
      addInp.style.marginTop = "8px";
      addInp.addEventListener("keydown", function (e) { if (e.key === "Enter" && addInp.value.trim()) { g.sub = g.sub || []; g.sub.push({ t: addInp.value.trim(), done: false }); save(g); render(); } });
      card.appendChild(addInp);
      card.appendChild(UI.el("div", { class: "row gap8", style: "margin-top:10px" }, [
        UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { breakDown(g); } }, [UI.icon("sparkles"), "Pecah jadi langkah (AI)"]),
        prog >= 100 && g.status !== "selesai" ? UI.el("button", { class: "btn btn-primary btn-sm", onclick: function () { g.status = "selesai"; save(g); UI.toast("Selamat! 🎉 Sasaran tercapai", "ok"); render(); } }, [UI.icon("trophy"), "Tandai tercapai"]) : null
      ]));
      return card;
    }

    function calcProg(g) {
      if (g.sub && g.sub.length) return Math.round(g.sub.filter(function (s) { return s.done; }).length / g.sub.length * 100);
      return +g.progress || 0;
    }
    function save(g) { g.progress = calcProg(g); var arr = S.get("goals", []); var i = arr.map(function (x) { return x.id; }).indexOf(g.id); if (i >= 0) arr[i] = g; else arr.push(g); S.set("goals", arr); }
    function deadlineNote(g) { var d = Math.round((new Date(g.deadline) - Date.now()) / 864e5); if (d < 0) return " (lewat)"; if (d === 0) return " (hari ini)"; if (d <= 30) return " (" + d + " hari)"; return ""; }

    function edit(g) {
      var isNew = !g; g = g || { id: uid(), judul: "", horizon: "tahun", domain: (spec.domains && spec.domains[0] && spec.domains[0].key) || "", progress: 0, sub: [], status: "aktif" };
      var judul = UI.input({ val: g.judul, ph: spec.goalPh || "mis. Lari 5K tanpa henti" });
      var kenapa = UI.textarea({ val: g.kenapa, ph: "Kenapa ini penting buatmu? (motivasi saat berat)", rows: 2 });
      var hor = UI.select(HOR.map(function (h) { return { v: h.k, l: h.l }; }), g.horizon);
      var dom = UI.select((spec.domains || [{ key: "", label: "Umum" }]).map(function (d) { return { v: d.key, l: d.label }; }), g.domain);
      var dl = UI.input({ type: "date", val: g.deadline });
      var body = UI.el("div", {}, [
        UI.field("Sasaran", judul), UI.field("Kenapa (motivasi)", kenapa),
        UI.el("div", { class: "grid2" }, [UI.field("Horizon", hor), UI.field("Area", dom)]),
        UI.field("Tenggat (opsional)", dl)
      ]);
      var save2 = UI.el("button", { class: "btn btn-primary", text: isNew ? "Buat" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save2]));
      var m = UI.modal(isNew ? "Sasaran Baru" : "Edit Sasaran", body);
      save2.addEventListener("click", function () {
        if (!judul.value.trim()) { UI.toast("Isi sasaran dulu", "err"); return; }
        g.judul = judul.value.trim(); g.kenapa = kenapa.value.trim(); g.horizon = hor.value; g.domain = dom.value; g.deadline = dl.value;
        save(g); m.close(); render(); UI.toast("Tersimpan", "ok");
      });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus sasaran?", "Tindakan ini tak bisa dibatalkan.", function () { S.remove("goals", g.id); render(); }, { danger: true }); });
    }

    async function breakDown(g) {
      if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu di Pengaturan", "err"); ctx.shell.openSettings(); return; }
      var box = UI.el("div", {}, [UI.spinner("Memecah jadi langkah…")]);
      var m = UI.modal("Langkah untuk: " + g.judul, box, { wide: true });
      try {
        var out = await ctx.ai.ask({
          system: ctx.brain.context() + "\nKamu coach eksekusi. Pecah sasaran jadi 5-7 langkah kecil, konkret, berurutan, tiap langkah bisa diselesaikan dalam seminggu.",
          prompt: 'Sasaran: "' + g.judul + '"' + (g.kenapa ? " (alasan: " + g.kenapa + ")" : "") + ". Balas JSON array string langkah-langkah.", json: true, temp: 0.7
        });
        UI.clear(box);
        var arr = Array.isArray(out) ? out : [];
        if (!arr.length) { box.appendChild(UI.el("div", { class: "ai-out", text: typeof out === "string" ? out : "-" })); return; }
        arr.forEach(function (t) { box.appendChild(UI.el("div", { class: "sub-item" }, [UI.icon("point"), UI.el("span", { text: t })])); });
        var addAll = UI.el("button", { class: "btn btn-primary", style: "margin-top:14px", onclick: function () { g.sub = (g.sub || []).concat(arr.map(function (t) { return { t: t, done: false }; })); save(g); m.close(); render(); UI.toast(arr.length + " langkah ditambahkan", "ok"); } }, [UI.icon("plus"), "Tambahkan semua sebagai subtugas"]);
        box.appendChild(addAll);
      } catch (e) { UI.clear(box); box.appendChild(UI.el("div", { class: "empty", text: e.message })); }
    }

    render();
  }
});
