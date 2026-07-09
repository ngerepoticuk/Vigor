/* ====================================================================
   pintel.js — Planner Intelligence (reusable, deterministik/tanpa AI).
   Baca habits+checks+goals+journal -> streak, konsistensi, momentum,
   skor domain (wheel of life), skor hidup 0-100, korelasi mood, dan
   insight actionable. Dipakai Dashboard/Ritme/Tinjau/Skor.
   Semua modul menulis dgn skema data standar di bawah:
     habits : [{id,nama,icon,domain,color,target(/minggu),aktif}]
     checks : { habitId: { "YYYY-MM-DD": 1 } }
     goals  : [{id,judul,domain,horizon,progress(0-100),sub:[{t,done}],deadline,status}]
     journal: [{id,iso,mood(1-5),energi(1-5),teks,syukur:[]}]
   ==================================================================== */
window.PIntel = (function () {
  var DAY = 864e5;
  function iso(d) { d = new Date(d); d.setHours(0, 0, 0, 0); return d.toISOString().slice(0, 10); }
  function today() { return iso(new Date()); }
  function shift(days) { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + days); return iso(d); }
  function range(n) { var out = []; for (var i = n - 1; i >= 0; i--) out.push(shift(-i)); return out; } // n hari terakhir, lama->baru

  function habits() { return (Store.get("habits", []) || []).filter(function (h) { return h.aktif !== false; }); }
  function checks() { return Store.get("checks", {}) || {}; }
  function goals() { return Store.get("goals", []) || []; }
  function journal() { return Store.get("journal", []) || []; }

  function isDone(hid, day) { var c = checks()[hid]; return !!(c && c[day]); }

  /* streak berjalan (hari beruntun sampai hari ini/kemarin) untuk 1 habit.
     STREAK FREEZE: 1 hari bolong per 7 hari dimaafkan (tidak memutus streak)
     selama streak sudah ≥3 — biar manusiawi & retensi terjaga. */
  function streakOf(hid) {
    var c = checks()[hid] || {}, s = 0, d = new Date(); d.setHours(0, 0, 0, 0);
    if (!c[iso(d)]) d.setDate(d.getDate() - 1); // toleransi: hari ini belum dicek
    var lastFreeze = 99; // hari sejak freeze terakhir dipakai
    while (true) {
      if (c[iso(d)]) { s++; lastFreeze++; d.setDate(d.getDate() - 1); continue; }
      // hari bolong: pakai token pemaaf bila streak ≥3 & belum dipakai 7 hari terakhir
      if (s >= 3 && lastFreeze >= 7) {
        var prev = new Date(d); prev.setDate(prev.getDate() - 1);
        if (c[iso(prev)]) { lastFreeze = 0; d = prev; continue; } // maafkan 1 hari
      }
      break;
    }
    return s;
  }
  function bestStreakOf(hid) {
    var c = checks()[hid] || {}, days = Object.keys(c).filter(function (k) { return c[k]; }).sort();
    var best = 0, cur = 0, prev = null;
    days.forEach(function (k) { if (prev && (new Date(k) - new Date(prev)) === DAY) cur++; else cur = 1; best = Math.max(best, cur); prev = k; });
    return best;
  }

  /* konsistensi = rasio hari-selesai / hari-target dlm window (minggu) */
  function consistency(win) {
    win = win || 28; var days = range(win), hs = habits(), tot = 0, done = 0;
    hs.forEach(function (h) { days.forEach(function (d) { tot++; if (isDone(h.id, d)) done++; }); });
    return tot ? Math.round(done / tot * 100) : 0;
  }

  /* completion harian utk heatmap: rasio habit selesai per hari */
  function dailyIntensity(win) {
    win = win || 140; var days = range(win), hs = habits(), map = {};
    days.forEach(function (d) { var done = 0; hs.forEach(function (h) { if (isDone(h.id, d)) done++; }); map[d] = hs.length ? done / hs.length : 0; });
    return map;
  }

  /* momentum: konsistensi 7 hari ini vs 7 hari lalu */
  function momentum() {
    var hs = habits(); if (!hs.length) return { now: 0, prev: 0, delta: 0 };
    function win(a, b) { var d = 0, t = 0; for (var i = a; i < b; i++) { var day = shift(-i); hs.forEach(function (h) { t++; if (isDone(h.id, day)) d++; }); } return t ? d / t * 100 : 0; }
    var now = win(0, 7), prev = win(7, 14);
    return { now: Math.round(now), prev: Math.round(prev), delta: Math.round(now - prev) };
  }

  /* skor per domain (0-100): gabung konsistensi habit domain + progress goal domain */
  function domainScores() {
    var doms = (APP.spec && APP.spec.domains) || [];
    var hs = habits(), gs = goals().filter(function (g) { return g.status !== "arsip"; });
    return doms.map(function (dm) {
      var dh = hs.filter(function (h) { return h.domain === dm.key; });
      var cons = 0;
      if (dh.length) { var days = range(28), tot = 0, done = 0; dh.forEach(function (h) { days.forEach(function (d) { tot++; if (isDone(h.id, d)) done++; }); }); cons = tot ? done / tot * 100 : 0; }
      var dg = gs.filter(function (g) { return g.domain === dm.key; });
      var gp = dg.length ? dg.reduce(function (a, g) { return a + (+g.progress || 0); }, 0) / dg.length : null;
      var val;
      if (dh.length && dg.length) val = cons * 0.6 + gp * 0.4;
      else if (dh.length) val = cons;
      else if (dg.length) val = gp;
      else val = 0;
      return { key: dm.key, label: dm.label, color: dm.color, val: Math.round(val), hasData: !!(dh.length || dg.length), habits: dh.length, goals: dg.length };
    });
  }

  /* skor hidup 0-100: konsistensi(40) + progress goal(25) + jurnal(15) + keseimbangan domain(20) */
  function lifeScore() {
    var cons = consistency(28);
    var gs = goals().filter(function (g) { return g.status !== "arsip" && g.status !== "selesai"; });
    var gp = gs.length ? gs.reduce(function (a, g) { return a + (+g.progress || 0); }, 0) / gs.length : (goals().length ? 100 : 0);
    var jdays = {}; journal().forEach(function (j) { if (j.iso) jdays[j.iso] = 1; });
    var last14 = range(14), jrat = last14.filter(function (d) { return jdays[d]; }).length / 14 * 100;
    var ds = domainScores().filter(function (d) { return d.hasData; });
    var bal = 100;
    if (ds.length > 1) { var vals = ds.map(function (d) { return d.val; }); var mean = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length; var varr = vals.reduce(function (a, v) { return a + Math.pow(v - mean, 2); }, 0) / vals.length; bal = Math.max(0, 100 - Math.sqrt(varr)); }
    var score = cons * 0.40 + gp * 0.25 + jrat * 0.15 + bal * 0.20;
    return { score: Math.round(score), cons: Math.round(cons), goalProg: Math.round(gp), journal: Math.round(jrat), balance: Math.round(bal) };
  }

  function moodTrend(win) {
    win = win || 14; var days = range(win), j = journal(), map = {};
    j.forEach(function (x) { if (x.iso) map[x.iso] = x.mood; });
    return days.map(function (d) { return map[d] || null; });
  }
  function avgMood(win) { var t = moodTrend(win).filter(function (x) { return x != null; }); return t.length ? +(t.reduce(function (a, b) { return a + b; }, 0) / t.length).toFixed(1) : null; }

  /* korelasi: hari dgn mood>=4 -> habit mana paling sering selesai (peluang keystone habit) */
  function keystoneHabit() {
    var j = journal(), hs = habits(); if (!j.length || !hs.length) return null;
    var goodDays = {}; j.forEach(function (x) { if (x.iso && x.mood >= 4) goodDays[x.iso] = 1; });
    var gd = Object.keys(goodDays); if (gd.length < 3) return null;
    var best = null;
    hs.forEach(function (h) { var hit = gd.filter(function (d) { return isDone(h.id, d); }).length; var rate = hit / gd.length; if (!best || rate > best.rate) best = { nama: h.nama, id: h.id, rate: rate, hit: hit, of: gd.length }; });
    return (best && best.rate >= 0.5) ? best : null;
  }

  /* insight feed actionable */
  function insights() {
    var out = [], hs = habits(), ls = lifeScore(), mo = momentum();
    if (!hs.length && !goals().length) {
      out.push({ level: "info", icon: "◆", text: "Planner masih kosong. Mulai dari Ritme (tambah kebiasaan) atau Sasaran (tetapkan target) — skor, streak, dan grafik akan hidup otomatis.", action: "go:ritme", cta: "Buka Ritme" });
      return out;
    }
    if (mo.prev > 0 || mo.now > 0) {
      if (mo.delta <= -12) out.push({ level: "warn", icon: "▼", text: "Konsistensi minggu ini turun " + Math.abs(mo.delta) + " poin (" + mo.now + "% vs " + mo.prev + "%). Pilih 1 kebiasaan inti dan amankan dulu.", action: "go:ritme", cta: "Lihat kebiasaan" });
      else if (mo.delta >= 12) out.push({ level: "good", icon: "▲", text: "Momentum naik " + mo.delta + " poin minggu ini (" + mo.now + "%). Selagi panas, naikkan sedikit target.", action: null });
    }
    // habit streak menonjol / rapuh
    var withStreak = hs.map(function (h) { return { h: h, s: streakOf(h.id) }; });
    var star = withStreak.slice().sort(function (a, b) { return b.s - a.s; })[0];
    if (star && star.s >= 5) out.push({ level: "good", icon: "★", text: '"' + star.h.nama + '" streak ' + star.s + " hari. Jaga jangan putus — ini keystone-mu.", action: "go:ritme", cta: null });
    var fragile = withStreak.filter(function (x) { return x.s === 0 && x.h; });
    if (fragile.length >= Math.max(2, Math.ceil(hs.length / 2))) out.push({ level: "warn", icon: "!", text: fragile.length + " kebiasaan belum tersentuh belakangan. Fokus 1–2 saja dulu daripada semua setengah-setengah.", action: "go:ritme", cta: "Prioritas" });
    // keystone correlation
    var key = keystoneHabit();
    if (key) out.push({ level: "good", icon: "◎", text: "Di hari-hari terbaikmu, kamu " + Math.round(key.rate * 100) + "% melakukan \"" + key.nama + "\". Ini pengungkit mood-mu — dahulukan.", action: null });
    // domain lemah
    var ds = domainScores().filter(function (d) { return d.hasData; }).sort(function (a, b) { return a.val - b.val; });
    if (ds.length && ds[0].val < 45) out.push({ level: "warn", icon: "◔", text: "Area \"" + ds[0].label + "\" tertinggal (skor " + ds[0].val + "). Tambah 1 kebiasaan kecil atau 1 sasaran di sini untuk menyeimbangkan.", action: "go:sasaran", cta: "Buat sasaran" });
    // goal deadline dekat
    var soon = goals().filter(function (g) { return g.deadline && g.status !== "selesai" && g.status !== "arsip"; }).map(function (g) { return { g: g, d: Math.round((new Date(g.deadline) - Date.now()) / DAY) }; }).filter(function (x) { return x.d >= 0 && x.d <= 14 && x.g.progress < 90; }).sort(function (a, b) { return a.d - b.d; })[0];
    if (soon) out.push({ level: "warn", icon: "◷", text: '"' + soon.g.judul + '" jatuh tempo ' + (soon.d === 0 ? "hari ini" : soon.d + " hari lagi") + " tapi baru " + Math.round(soon.g.progress) + "%. Pecah jadi langkah kecil minggu ini.", action: "go:sasaran", cta: "Buka sasaran" });
    // jurnal
    var jrat = ls.journal;
    if (jrat < 30) out.push({ level: "info", icon: "✎", text: "Jarang menulis jurnal (14 hari terakhir). Refleksi 2 menit/hari bikin pola menang & pemicu stres terlihat.", action: "go:jurnal", cta: "Tulis hari ini" });
    return out;
  }

  /* rekap angka utk dashboard */
  function overview() {
    var hs = habits(), t = today();
    var doneToday = hs.filter(function (h) { return isDone(h.id, t); }).length;
    var streaks = hs.map(function (h) { return streakOf(h.id); });
    var bestStreak = streaks.length ? Math.max.apply(null, streaks) : 0;
    var gs = goals().filter(function (g) { return g.status !== "arsip"; });
    var gActive = gs.filter(function (g) { return g.status !== "selesai"; }).length;
    var gDone = gs.filter(function (g) { return g.status === "selesai" || g.progress >= 100; }).length;
    return { habitCount: hs.length, doneToday: doneToday, bestStreak: bestStreak, consistency: consistency(28),
      goalActive: gActive, goalDone: gDone, life: lifeScore(), momentum: momentum(), avgMood: avgMood(14) };
  }

  return {
    iso: iso, today: today, shift: shift, range: range,
    habits: habits, checks: checks, goals: goals, journal: journal, isDone: isDone,
    streakOf: streakOf, bestStreakOf: bestStreakOf, consistency: consistency, dailyIntensity: dailyIntensity,
    momentum: momentum, domainScores: domainScores, lifeScore: lifeScore,
    moodTrend: moodTrend, avgMood: avgMood, keystoneHabit: keystoneHabit, insights: insights, overview: overview
  };
})();
