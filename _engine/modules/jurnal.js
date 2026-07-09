/* jurnal.js — Jurnal: mood + energi (1-5), syukur, tulisan bebas, prompt
   refleksi AI, tren mood, riwayat. Satu entri per hari (bisa banyak). */
window.Shell.register({
  id: "jurnal", nama: "Jurnal", icon: "feather",
  mount: function (root, ctx) {
    var UI = ctx.ui, S = ctx.store, I = ctx.intel, spec = ctx.spec;
    var MOODS = ["😞", "😕", "😐", "🙂", "😄"];

    function render() {
      UI.clear(root);
      root.appendChild(UI.viewHead("Jurnal Refleksi", "Refleksi harian", UI.el("div", { class: "row gap8" }, [
        UI.el("button", { class: "btn btn-ghost", onclick: prompt }, [UI.icon("sparkles"), "Pemantik"]),
        UI.el("button", { class: "btn btn-primary", onclick: reflect }, [UI.icon("wand"), "Refleksi AI 7 Hari"])
      ])));

      // tren mood
      var trend = I.moodTrend(14);
      var avg = I.avgMood(14);
      root.appendChild(UI.el("div", { class: "split" }, [
        composer(),
        UI.el("div", { class: "panel" }, [
          UI.el("div", { class: "panel-t", text: "Mood 14 hari" }),
          avg != null ? UI.el("div", { style: "font-family:var(--font-d);font-weight:800;font-size:30px;margin:4px 0 10px", text: avg + " / 5 " + MOODS[Math.round(avg) - 1] }) : UI.el("div", { class: "hint", text: "Belum ada data mood." }),
          UI.bars(trend.map(function (v, i) { return { label: "", val: v || 0, dim: !v }; }), { h: 90 }),
          UI.el("div", { class: "hint", style: "margin-top:8px", text: "Tiap batang = 1 hari (mood 1–5)." })
        ])
      ]));

      // riwayat
      var j = S.get("journal", []).slice().sort(function (a, b) { return b.t - a.t; });
      root.appendChild(UI.el("div", { class: "sec" }, [UI.el("div", { class: "sec-head" }, [UI.el("h2", { class: "h2", text: "Riwayat (" + j.length + ")" })])]));
      if (!j.length) { root.appendChild(UI.empty("Belum ada catatan. Tulis 2 menit tentang harimu — pola menang & pemicu stres akan terlihat.")); return; }
      j.slice(0, 30).forEach(function (e) {
        root.appendChild(UI.el("div", { class: "goal" }, [
          UI.el("div", { class: "flex between center", style: "margin-bottom:6px" }, [
            UI.el("div", { class: "flex center gap8" }, [UI.el("span", { style: "font-size:20px", text: MOODS[(e.mood || 3) - 1] }), UI.el("b", { text: UI.fmtDate(e.t, true) }), e.energi ? UI.el("span", { class: "hint", style: "margin:0", text: "⚡ " + e.energi + "/5" }) : null]),
            UI.el("span", { class: "hint", style: "margin:0;cursor:pointer", text: "hapus", onclick: function () { UI.confirm("Hapus catatan?", "", function () { S.remove("journal", e.id); render(); }, { danger: true }); } })
          ]),
          (e.syukur && e.syukur.length) ? UI.el("div", { class: "row gap8", style: "margin-bottom:8px" }, e.syukur.map(function (s) { return UI.chip("🙏 " + s); })) : null,
          e.teks ? UI.el("div", { style: "line-height:1.6;white-space:pre-wrap", text: e.teks }) : null
        ]));
      });
    }

    function composer() {
      var mood = 4, energi = 3;
      var moodRow = UI.el("div", { class: "row gap8" }, MOODS.map(function (m, i) {
        var btn = UI.el("button", { class: "chip", style: "font-size:20px;padding:8px 12px", text: m });
        if (i + 1 === mood) btn.classList.add("on");
        btn.addEventListener("click", function () { mood = i + 1; Array.prototype.forEach.call(moodRow.children, function (c, j) { c.classList.toggle("on", j === i); }); });
        return btn;
      }));
      var enRange = UI.el("input", { type: "range", min: 1, max: 5, value: 3 });
      var enLbl = UI.el("span", { class: "hint", style: "margin:0", text: "3/5" });
      enRange.addEventListener("input", function () { energi = +enRange.value; enLbl.textContent = energi + "/5"; });
      var syukur = UI.input({ ph: "3 hal yang kamu syukuri (pisah koma)" });
      var teks = UI.textarea({ ph: spec.jurnalPh || "Apa yang terjadi hari ini? Apa yang kamu rasakan & pelajari?", rows: 5 });
      var save = UI.el("button", { class: "btn btn-primary", onclick: function () {
        if (!teks.value.trim() && !syukur.value.trim()) { UI.toast("Tulis sesuatu dulu", "err"); return; }
        S.push("journal", { id: uid(), t: Date.now(), iso: I.today(), mood: mood, energi: energi, syukur: syukur.value.split(",").map(function (s) { return s.trim(); }).filter(Boolean), teks: teks.value.trim() });
        UI.toast("Tersimpan ✓", "ok"); render();
      } }, [UI.icon("check"), "Simpan catatan"]);
      return UI.el("div", { class: "panel" }, [
        UI.el("div", { class: "panel-t", text: "Bagaimana harimu?" }),
        UI.el("div", { class: "kick", style: "margin:12px 0 6px", text: "Mood" }), moodRow,
        UI.el("div", { class: "kick", style: "margin:14px 0 6px", text: "Energi" }), UI.el("div", { class: "flex center gap12" }, [enRange, enLbl]),
        UI.el("div", { style: "margin:14px 0 6px" }, [UI.field("Syukur", syukur)]),
        UI.field("Catatan", teks),
        save
      ]);
    }

    async function reflect() {
      if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu di Pengaturan", "err"); ctx.shell.openSettings(); return; }
      var box = UI.el("div", {}, [UI.spinner("Membaca jurnal 7 harimu…")]);
      var m = UI.modal("Refleksi Mingguan AI", box, { wide: true });
      try {
        var days = I.range(7);
        var entries = S.get("journal", []).filter(function (e) { return days.indexOf(e.iso) >= 0; }).slice(0, 10);
        if (!entries.length) { UI.clear(box); box.appendChild(UI.el("div", { class: "empty", text: "Belum ada jurnal 7 hari terakhir. Tulis dulu beberapa hari, lalu coba lagi." })); return; }
        var teks = entries.map(function (e) { return e.iso + " (mood " + e.mood + "/5, energi " + (e.energi || "-") + "/5): " + (e.teks || "-") + (e.syukur && e.syukur.length ? " | syukur: " + e.syukur.join(", ") : ""); }).join("\n");
        var out = await ctx.ai.ask({
          system: ctx.brain.context() + "\nKamu pendamping refleksi yang lembut. Baca jurnal seminggu, lalu balas 4 paragraf pendek: (1) pola emosi yang terlihat, (2) hal yang tampaknya memberi energi, (3) hal yang tampaknya menguras, (4) satu saran lembut & konkret untuk minggu depan. Bahasa hangat, tidak menghakimi, tanpa bullet.",
          prompt: "Jurnalku 7 hari terakhir:\n" + teks, temp: 0.8
        });
        UI.clear(box); box.appendChild(UI.briefing(UI.esc(out).replace(/\n/g, "<br>"), { title: "Refleksi Minggumu", icon: "feather" }));
      } catch (e) { UI.clear(box); box.appendChild(UI.el("div", { class: "empty", text: e.message })); }
    }

    async function prompt() {
      if (!ctx.ai.hasKey()) { UI.toast("Isi API key dulu di Pengaturan", "err"); ctx.shell.openSettings(); return; }
      var box = UI.el("div", {}, [UI.spinner("Menyiapkan pemantik…")]);
      var m = UI.modal("Pemantik Refleksi", box, {});
      try {
        var out = await ctx.ai.ask({ system: ctx.brain.context() + "\nBeri 3 pertanyaan reflektif yang dalam namun lembut untuk jurnal malam, personal ke situasiku.", prompt: "Balas JSON array 3 pertanyaan.", json: true, temp: 0.9 });
        UI.clear(box); (Array.isArray(out) ? out : []).forEach(function (q) { box.appendChild(UI.el("div", { class: "sub-item" }, [UI.icon("help-circle"), UI.el("span", { text: q })])); });
        if (!Array.isArray(out)) box.appendChild(UI.el("div", { class: "ai-out", text: String(out) }));
      } catch (e) { UI.clear(box); box.appendChild(UI.el("div", { class: "empty", text: e.message })); }
    }

    render();
  }
});
