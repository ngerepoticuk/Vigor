/* ritme.js — Kebiasaan (habits): cek harian + grid 7 hari, streak,
   heatmap 20 minggu, tambah/edit, saran kebiasaan dari AI. */
window.Shell.register({
  id: "ritme", nama: "Ritme", icon: "flame",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store, I = ctx.intel, spec = ctx.spec;

    function render() {
      UI.clear(root);
      var hs = S.get("habits", []).filter(function (h) { return h.aktif !== false; });
      root.appendChild(UI.viewHead(spec.ritmeTitle || "Ritme Harian", "Kebiasaan", UI.el("div", { class: "row gap8" }, [
        UI.el("button", { class: "btn btn-ghost", onclick: suggest }, [UI.icon("sparkles"), "Saran AI"]),
        UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Kebiasaan"])
      ])));

      if (!hs.length) { root.appendChild(UI.empty("Belum ada kebiasaan.<br>Mulai dari 1–3 kebiasaan kecil yang benar-benar penting buatmu.", UI.el("button", { class: "btn btn-primary", onclick: function () { edit(null); } }, [UI.icon("plus"), "Tambah kebiasaan pertama"]))); return; }

      // ringkasan atas
      var cons = I.consistency(28);
      root.appendChild(UI.el("div", { class: "cards", style: "margin-bottom:8px" }, [
        UI.statCard({ label: "Konsistensi 28h", value: cons, fmt: function (v) { return Math.round(v) + "%"; }, icon: "chart-bar" }),
        UI.statCard({ label: "Kebiasaan aktif", value: hs.length, icon: "flame" }),
        UI.statCard({ label: "Streak terbaik", value: Math.max.apply(null, hs.map(function (h) { return I.streakOf(h.id); }).concat([0])), fmt: function (v) { return Math.round(v) + " hari"; }, icon: "bolt" }),
        UI.statCard({ label: "Selesai hari ini", value: hs.filter(function (h) { return I.isDone(h.id, I.today()); }).length + "/" + hs.length, icon: "circle-check" })
      ]));

      // last 7 iso (Sen..Min urut) header
      var days7 = I.range(7);
      var list = UI.el("div", { style: "margin-top:16px" });
      hs.forEach(function (h) {
        var t = I.today(), done = I.isDone(h.id, t), streak = I.streakOf(h.id), best = I.bestStreakOf(h.id);
        var chk = UI.el("button", { class: "hcheck" + (done ? " on" : "") }, [UI.icon("check")]);
        chk.addEventListener("click", function () { toggle(h.id, t); chk.classList.toggle("on"); refreshCells(); UI.toast(chk.classList.contains("on") ? "Selesai ✓" : "Batal", "ok"); });

        var cells = UI.el("div", { class: "week-cells" });
        function refreshCells() {
          UI.clear(cells);
          days7.forEach(function (d) {
            var on = I.isDone(h.id, d), isT = d === t;
            var c = UI.el("button", { class: "wc" + (on ? " on" : "") + (isT ? " today" : ""), text: UI.HARIS[new Date(d).getDay()][0], title: d });
            c.addEventListener("click", function () { toggle(h.id, d); render(); });
            cells.appendChild(c);
          });
        }
        refreshCells();

        var row = UI.el("div", { class: "hrow" }, [
          chk,
          UI.el("div", { style: "flex:1;min-width:0" }, [
            UI.el("div", { class: "flex center gap8" }, [
              UI.el("span", { class: "hname", text: h.nama }),
              h.domain ? UI.tag(domLabel(spec, h.domain), (domColor(spec, h.domain) || "var(--primary)")) : null
            ]),
            UI.el("div", { class: "hmeta" }, [
              UI.el("span", { text: "🔥 " + streak + " hari" }), UI.el("span", { text: "rekor " + best }),
              UI.el("span", { text: (h.target || 7) + "×/minggu" })
            ])
          ]),
          cells,
          UI.el("button", { class: "btn btn-ghost btn-icon", title: "Edit", onclick: function () { edit(h); } }, [UI.icon("dots")])
        ]);
        list.appendChild(row);
      });
      root.appendChild(list);

      // heatmap gabungan
      root.appendChild(UI.el("div", { class: "panel", style: "margin-top:20px" }, [
        UI.el("div", { class: "panel-t", text: "Peta konsistensi" }),
        UI.el("div", { class: "hint", text: "Makin terang = makin banyak kebiasaan selesai hari itu (20 minggu terakhir)." }),
        UI.heatmap(I.dailyIntensity(140), { weeks: 20 })
      ]));
    }

    function toggle(hid, day) { var c = S.get("checks", {}); c[hid] = c[hid] || {}; if (c[hid][day]) delete c[hid][day]; else c[hid][day] = 1; S.set("checks", c); }

    function edit(h) {
      var isNew = !h; h = h || { id: uid(), nama: "", domain: (spec.domains && spec.domains[0] && spec.domains[0].key) || "", target: 7, aktif: true };
      var nama = UI.input({ val: h.nama, ph: "mis. Olahraga 20 menit" });
      var dom = UI.select((spec.domains || [{ key: "", label: "Umum" }]).map(function (d) { return { v: d.key, l: d.label }; }), h.domain);
      var target = UI.select([1, 2, 3, 4, 5, 6, 7].map(function (n) { return { v: n, l: n + "× / minggu" }; }), h.target || 7);
      var body = UI.el("div", {}, [
        UI.field("Nama kebiasaan", nama),
        UI.el("div", { class: "grid2" }, [UI.field("Area", dom), UI.field("Target", target)]),
      ]);
      var save = UI.el("button", { class: "btn btn-primary", text: isNew ? "Tambah" : "Simpan" });
      var del = isNew ? null : UI.el("button", { class: "btn btn-danger", text: "Hapus" });
      body.appendChild(UI.el("div", { class: "row", style: "justify-content:space-between;margin-top:6px" }, [del || UI.el("span"), save]));
      var m = UI.modal(isNew ? "Kebiasaan Baru" : "Edit Kebiasaan", body);
      save.addEventListener("click", function () {
        if (!nama.value.trim()) { UI.toast("Isi nama dulu", "err"); return; }
        h.nama = nama.value.trim(); h.domain = dom.value; h.target = +target.value;
        var arr = S.get("habits", []); var i = arr.map(function (x) { return x.id; }).indexOf(h.id);
        if (i >= 0) arr[i] = h; else arr.push(h); S.set("habits", arr);
        m.close(); render(); UI.toast("Tersimpan", "ok");
      });
      if (del) del.addEventListener("click", function () { m.close(); UI.confirm("Hapus kebiasaan?", "Riwayat centangnya ikut hilang.", function () { S.remove("habits", h.id); var c = S.get("checks", {}); delete c[h.id]; S.set("checks", c); render(); }, { danger: true }); });
    }

    async function suggest() {
      if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu di Pengaturan", "err"); ctx.shell.openSettings(); return; }
      var box = UI.el("div", {}, [UI.spinner("Menyusun saran kebiasaan…")]);
      var m = UI.modal("Saran Kebiasaan AI", box, { wide: true });
      try {
        var out = await ctx.ai.ask({
          system: ctx.brain.context() + "\nKamu coach kebiasaan di planner \"" + APP.nama + "\" (" + (spec.kindLabel || "") + "). Sarankan kebiasaan berbasis bukti, kecil & spesifik (bisa dilakukan <15 menit).",
          prompt: "Sarankan 6 kebiasaan yang cocok untukku, masing-masing dengan area dan alasan singkat. Balas JSON array: [{\"nama\":\"...\",\"area\":\"...\",\"alasan\":\"...\"}]. Area pilih dari: " + (spec.domains || []).map(function (d) { return d.label; }).join(", ") + ".",
          json: true, temp: 0.9
        });
        UI.clear(box);
        var arr = Array.isArray(out) ? out : [];
        if (!arr.length) { box.appendChild(UI.el("div", { class: "ai-out", text: typeof out === "string" ? out : "Tidak ada saran." })); return; }
        arr.forEach(function (s) {
          var addBtn = UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () {
            var dk = ((spec.domains || []).filter(function (d) { return d.label.toLowerCase() === String(s.area || "").toLowerCase(); })[0] || (spec.domains || [])[0] || {}).key || "";
            S.push("habits", { id: uid(), nama: s.nama, domain: dk, target: 7, aktif: true });
            addBtn.textContent = "✓ Ditambah"; addBtn.disabled = true; UI.toast("Ditambahkan", "ok");
          } }, [UI.icon("plus"), "Tambah"]);
          box.appendChild(UI.el("div", { class: "hrow" }, [
            UI.el("div", { style: "flex:1" }, [UI.el("div", { class: "hname", text: s.nama }), UI.el("div", { class: "hmeta" }, [UI.el("span", { text: s.area || "" }), UI.el("span", { text: s.alasan || "" })])]),
            addBtn
          ]));
        });
        box.appendChild(UI.el("div", { class: "hint", style: "margin-top:12px", text: "Tip: mulai dari 1–2 saja. Konsistensi menang atas jumlah." }));
      } catch (e) { UI.clear(box); box.appendChild(UI.el("div", { class: "empty", text: e.message })); }
    }

    render();
  }
});
function domColor(spec, key) { var d = ((spec && spec.domains) || []).filter(function (x) { return x.key === key; })[0]; return d ? d.color : null; }
