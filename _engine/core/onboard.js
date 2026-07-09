/* onboard.js — Wizard "Mulai Bersih": setup terpandu 5 langkah yang menulis
   data awal nyata (profil + area + kebiasaan + 1 sasaran + rutinitas pagi).
   Dipanggil dari Shell (first-run opsional / tombol di Pengaturan).
   Global: Store, Brain, UI, APP, Shell. */
window.Onboard = (function () {
  var spec = function () { return APP.spec || {}; };

  function start(opts) {
    opts = opts || {};
    var st = {
      nama: "", musim: "", fokus: "",
      areas: {}, habits: {}, goalTxt: "", goalHor: "kuartal",
      routine: true
    };
    // pre-pilih 2 area & 2 kebiasaan biar tidak intimidatif
    var doms = spec().domains || [];
    doms.slice(0, 2).forEach(function (d) { st.areas[d.key] = true; });
    var seedH = (spec().onboardHabits || spec().seedHabits || []);
    seedH.slice(0, 2).forEach(function (h, i) { st.habits[i] = true; });

    var step = 0;
    var STEPS = [stepWelcome, stepAreas, stepHabits, stepGoal, stepRoutine];

    var ov = UI.el("div", { class: "ob-ov" });
    var card = UI.el("div", { class: "ob-card" });
    ov.appendChild(card);
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add("show"); });

    function close() { ov.classList.remove("show"); setTimeout(function () { ov.remove(); }, 260); }

    function dots() {
      var w = UI.el("div", { class: "ob-dots" });
      STEPS.forEach(function (_, i) { w.appendChild(UI.el("span", { class: "ob-dot" + (i === step ? " on" : "") + (i < step ? " done" : "") })); });
      return w;
    }
    function shell(title, kick, bodyEl, opts2) {
      opts2 = opts2 || {};
      UI.clear(card);
      card.appendChild(UI.el("div", { class: "ob-head" }, [
        UI.el("div", {}, [UI.el("div", { class: "ob-kick", text: kick }), UI.el("h2", { class: "ob-title", text: title })]),
        UI.el("button", { class: "ob-skip", text: "Lewati", onclick: function () { UI.confirm("Lewati setup?", "Kamu bisa isi manual nanti dari tiap menu.", finishEmpty); } })
      ]));
      card.appendChild(dots());
      var body = UI.el("div", { class: "ob-body" }, [bodyEl]);
      card.appendChild(body);
      var back = UI.el("button", { class: "btn btn-ghost", text: "Kembali", onclick: function () { step--; render(); } });
      var next = UI.el("button", { class: "btn btn-primary", onclick: opts2.onNext || function () { step++; render(); } }, [opts2.nextText || "Lanjut", UI.icon("arrow-right")]);
      card.appendChild(UI.el("div", { class: "ob-foot" }, [step > 0 ? back : UI.el("span"), next]));
      requestAnimationFrame(function () { body.classList.add("in"); });
    }
    function render() { if (step < 0) step = 0; if (step >= STEPS.length) return apply(); STEPS[step](); }

    /* ---- step 1: sapaan ---- */
    function stepWelcome() {
      var nama = UI.input({ val: st.nama, ph: "mis. Dinda" });
      var musim = UI.input({ val: st.musim, ph: spec().musimPh || "mis. Tahun Bangkit & Sehat" });
      shell("Kenalan dulu, yuk", "Langkah 1 dari 5", UI.el("div", {}, [
        UI.el("p", { class: "ob-lead", text: "Isi ini sekali — semua saran & sapaan di aplikasi jadi terasa personal, bukan template." }),
        UI.field("Aku panggil kamu apa?", nama),
        UI.field("Beri nama untuk musim hidupmu sekarang", musim, "Satu frasa yang menggambarkan fokusmu tahun ini.")
      ]), { onNext: function () { st.nama = nama.value.trim(); st.musim = musim.value.trim(); step++; render(); } });
    }

    /* ---- step 2: area ---- */
    function stepAreas() {
      var grid = UI.el("div", { class: "ob-chips" });
      (spec().domains || []).forEach(function (d) {
        var c = UI.el("button", { class: "ob-chip" + (st.areas[d.key] ? " on" : ""), onclick: function () { st.areas[d.key] = !st.areas[d.key]; c.classList.toggle("on"); } }, [
          UI.el("span", { class: "ob-chip-dot", style: "background:" + (d.color || "var(--primary)") }), d.label
        ]);
        grid.appendChild(c);
      });
      shell("Area apa yang mau kamu tumbuhkan?", "Langkah 2 dari 5", UI.el("div", {}, [
        UI.el("p", { class: "ob-lead", text: "Pilih 2–4 area yang paling penting sekarang. Bisa diubah kapan saja." }),
        grid
      ]));
    }

    /* ---- step 3: kebiasaan ---- */
    function stepHabits() {
      var list = UI.el("div", { class: "ob-picklist" });
      seedH.forEach(function (h, i) {
        var dom = (spec().domains || []).filter(function (d) { return d.key === h.domain; })[0] || {};
        var on = !!st.habits[i];
        var row = UI.el("button", { class: "ob-pick" + (on ? " on" : ""), onclick: function () { st.habits[i] = !st.habits[i]; row.classList.toggle("on"); } }, [
          UI.el("span", { class: "ob-pick-check" }, [UI.icon("check")]),
          UI.el("span", { style: "flex:1" }, [UI.el("div", { class: "ob-pick-t", text: h.nama }), UI.el("div", { class: "ob-pick-s", text: dom.label || "" })]),
          UI.el("span", { class: "ob-pick-dot", style: "background:" + (dom.color || "var(--primary)") })
        ]);
        list.appendChild(row);
      });
      shell("Mulai dari kebiasaan kecil", "Langkah 3 dari 5", UI.el("div", {}, [
        UI.el("p", { class: "ob-lead", text: "Pilih 1–3 saja. Kebiasaan kecil yang konsisten mengalahkan sepuluh yang setengah-setengah." }),
        list,
        UI.el("div", { class: "ob-hint", text: "💡 Semua ini bisa kamu ubah, tambah, atau hapus nanti di menu Ritme." })
      ]));
    }

    /* ---- step 4: sasaran ---- */
    function stepGoal() {
      var txt = UI.input({ val: st.goalTxt, ph: spec().goalPh || "mis. Lari 5K tanpa berhenti" });
      var hor = UI.select([{ v: "minggu", l: "Minggu ini" }, { v: "bulan", l: "Bulan ini" }, { v: "kuartal", l: "3 bulan" }, { v: "tahun", l: "Tahun ini" }], st.goalHor);
      shell("Satu impian untuk dikejar", "Langkah 4 dari 5", UI.el("div", {}, [
        UI.el("p", { class: "ob-lead", text: "Tuliskan satu sasaran yang bikin kamu bersemangat. Nanti dipecah jadi langkah kecil otomatis." }),
        UI.field("Sasaranmu (boleh dikosongi)", txt),
        UI.field("Mau dicapai dalam", hor)
      ]), { onNext: function () { st.goalTxt = txt.value.trim(); st.goalHor = hor.value; step++; render(); } });
    }

    /* ---- step 5: rutinitas ---- */
    function stepRoutine() {
      var rt = spec().onboardRoutine || { nama: "Rutinitas Pagi", items: ["Minum segelas air", "Rapikan tempat tidur", "Tulis 1 niat hari ini"] };
      var toggle = UI.el("button", { class: "ob-toggle" + (st.routine ? " on" : ""), onclick: function () { st.routine = !st.routine; toggle.classList.toggle("on"); } }, [UI.el("span", { class: "ob-toggle-sw" })]);
      var preview = UI.el("div", { class: "ob-routine" }, [
        UI.el("div", { class: "ob-routine-h" }, [UI.icon("sunrise"), UI.el("b", { text: rt.nama }), toggle]),
        UI.el("div", {}, rt.items.map(function (t) { return UI.el("div", { class: "ob-routine-i" }, [UI.icon("circle"), t]); }))
      ]);
      shell("Tambahkan satu rutinitas?", "Langkah 5 dari 5", UI.el("div", {}, [
        UI.el("p", { class: "ob-lead", text: "Rutinitas pagi singkat memberi harimu awalan yang menang. Nyalakan kalau mau, atau lewati." }),
        preview
      ]), { nextText: "Selesai & mulai", onNext: apply });
    }

    /* ---- terapkan ---- */
    function apply() {
      // profil
      var b = Brain.get();
      if (st.nama) b.diri.nama = st.nama;
      if (st.musim) b.diri.musim = st.musim;
      var seedB = spec().seedBrain || {};
      if (!b.diri.peran && seedB.peran) b.diri.peran = seedB.peran;
      if (!b.nilai.length && seedB.nilai) b.nilai = seedB.nilai;
      Brain.set(b);
      // kebiasaan
      var habits = [];
      seedH.forEach(function (h, i) { if (st.habits[i]) habits.push({ id: uid(), nama: h.nama, domain: h.domain, target: h.target || 7, aktif: true }); });
      Store.set("habits", habits);
      Store.set("checks", {});
      // sasaran
      if (st.goalTxt) {
        var area = Object.keys(st.areas).filter(function (k) { return st.areas[k]; })[0] || ((spec().domains || [])[0] || {}).key || "";
        Store.set("goals", [{ id: uid(), judul: st.goalTxt, horizon: st.goalHor, domain: area, progress: 0, sub: [], status: "aktif" }]);
      } else Store.set("goals", []);
      // rutinitas
      if (st.routine) {
        var rt = spec().onboardRoutine || { nama: "Rutinitas Pagi", waktu: "pagi", items: ["Minum segelas air", "Rapikan tempat tidur", "Tulis 1 niat hari ini"] };
        Store.set("routines", [{ id: uid(), nama: rt.nama, waktu: rt.waktu || "pagi", items: rt.items.map(function (t) { return { t: t }; }) }]);
      } else Store.set("routines", []);
      Store.set("tasks", []); Store.set("projects", []); Store.set("notes", []); Store.set("events", []); Store.set("focus", {}); Store.set("journal", []);
      Store.set("__seeded", 1); Store.set("__onboarded", 1);
      close();
      confetti();
      UI.toast("Siap! Planner-mu sudah disiapkan ✨", "ok");
      if (window.Shell) { Shell.refreshBrain && Shell.refreshBrain(); Shell.go && Shell.go((APP.modul || ["beranda"])[0]); }
    }
    function finishEmpty() {
      Store.set("habits", []); Store.set("checks", {}); Store.set("goals", []); Store.set("routines", []);
      Store.set("tasks", []); Store.set("projects", []); Store.set("notes", []); Store.set("events", []); Store.set("focus", {}); Store.set("journal", []);
      Store.set("__seeded", 1); Store.set("__onboarded", 1);
      close(); if (window.Shell) { Shell.refreshBrain && Shell.refreshBrain(); Shell.go && Shell.go((APP.modul || ["beranda"])[0]); }
    }

    render();
  }

  function confetti() {
    var c = UI.el("div", { class: "confetti" });
    var cols = ["var(--primary)", "var(--accent)", "var(--ok)", "var(--warn)"];
    for (var i = 0; i < 46; i++) {
      var p = UI.el("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = cols[i % cols.length];
      p.style.animationDelay = (Math.random() * 0.5) + "s";
      p.style.transform = "rotate(" + (Math.random() * 360) + "deg)";
      c.appendChild(p);
    }
    document.body.appendChild(c);
    setTimeout(function () { c.remove(); }, 2600);
  }

  return { start: start, confetti: confetti };
})();
