/* seed.js — generator data demo generik dari APP.spec. Bikin tiap planner
   langsung hidup: kebiasaan berikut riwayat centang (streak+heatmap),
   sasaran, jurnal ber-mood, dan profil Life Brain awal. */
window.SEED = function (Store, Brain) {
  var spec = (window.APP && APP.spec) || {};
  function iso(d) { d = new Date(d); d.setHours(0, 0, 0, 0); return d.toISOString().slice(0, 10); }
  function shift(n) { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; }
  function id() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  // --- Life Brain awal ---
  var sb = spec.seedBrain || {};
  Brain.set({
    diri: { nama: sb.nama || "Sahabat", peran: sb.peran || "", musim: sb.musim || "", umur: "" },
    nilai: sb.nilai || [], fokus: sb.fokus || "", tantangan: sb.tantangan || "",
    voice: { panggil: "kamu", nada: "hangat & jujur" }, riwayat: [], meta: {}
  });

  // --- Kebiasaan + riwayat centang ---
  var habits = (spec.seedHabits || []).map(function (h, i) {
    return { id: id() + i, nama: h.nama, domain: h.domain, target: h.target || 7, aktif: true, _p: h.p == null ? 0.7 : h.p };
  });
  var checks = {};
  habits.forEach(function (h) {
    checks[h.id] = {};
    var streakBias = 0;
    for (var k = 44; k >= 0; k--) {
      var day = iso(shift(-k));
      // makin dekat hari ini makin konsisten (menunjukkan momentum membaik) + streak akhir
      var p = h._p * (0.6 + 0.4 * (44 - k) / 44);
      if (k <= (h.streak || 4)) p = Math.max(p, 0.9); // streak berjalan di akhir
      if (Math.random() < p) checks[h.id][day] = 1;
    }
    delete h._p;
  });
  Store.set("habits", habits.map(function (h) { var x = {}; for (var k in h) if (k !== "streak") x[k] = h[k]; return x; }));
  Store.set("checks", checks);

  // --- Sasaran ---
  var goals = (spec.seedGoals || []).map(function (g, i) {
    var sub = (g.sub || []).map(function (t, j) { return { t: t, done: j < (g.doneN || 0) }; });
    var prog = sub.length ? Math.round(sub.filter(function (s) { return s.done; }).length / sub.length * 100) : (g.progress || 0);
    return { id: id() + "g" + i, judul: g.judul, kenapa: g.kenapa || "", horizon: g.horizon || "tahun", domain: g.domain, sub: sub, progress: prog, deadline: g.deadline || "", status: "aktif" };
  });
  Store.set("goals", goals);

  // --- Jurnal ---
  var moods = [4, 5, 3, 4, 4, 5, 3, 4, 5, 4, 3, 4, 5, 4, 4, 5];
  var notes = spec.seedNotes || ["Hari yang cukup produktif. Bersyukur bisa jalan sesuai rencana.", "Sempat lelah, tapi tetap muncul. Progress kecil tetap progress.", "Fokus lumayan bagus hari ini. Besok mau lebih pagi mulainya.", "Banyak gangguan, tapi 3 prioritas beres. Puas.", "Merasa lebih seimbang minggu ini."];
  var syukurBank = spec.seedSyukur || ["kesehatan", "keluarga", "waktu luang", "teman baik", "secangkir kopi", "udara pagi"];
  var jn = [];
  [1, 2, 3, 5, 6, 8, 9, 11, 13, 14].forEach(function (k, i) {
    var d = shift(-k);
    jn.push({ id: id() + "j" + i, t: d.getTime(), iso: iso(d), mood: moods[i % moods.length], energi: 3 + (i % 3), syukur: [syukurBank[i % syukurBank.length], syukurBank[(i + 2) % syukurBank.length]], teks: notes[i % notes.length] });
  });
  Store.set("journal", jn);

  // --- Rutinitas + log ---
  var rt = spec.onboardRoutine || { nama: "Rutinitas Pagi", waktu: "pagi", items: ["Minum segelas air", "Rapikan tempat tidur", "Tulis 1 niat hari ini", "Peregangan 3 menit"] };
  var rMalam = spec.seedRoutineMalam || { nama: "Tutup Hari Tenang", waktu: "malam", items: ["Beresin meja & besok", "Tulis 3 syukur", "Layar mati 30 menit sebelum tidur"] };
  var routines = [
    { id: id() + "r1", nama: rt.nama, waktu: rt.waktu || "pagi", items: (rt.items || []).map(function (t) { return { t: t }; }) },
    { id: id() + "r2", nama: rMalam.nama, waktu: rMalam.waktu || "malam", items: (rMalam.items || []).map(function (t) { return { t: t }; }) }
  ];
  Store.set("routines", routines);
  var rlog = {};
  for (var rk = 6; rk >= 0; rk--) {
    var rday = iso(shift(-rk)); rlog[rday] = {};
    routines.forEach(function (r) { r.items.forEach(function (_, ix) { if (Math.random() < (rk <= 1 ? 0.85 : 0.6)) rlog[rday][r.id + ":" + ix] = 1; }); });
  }
  Store.set("routineLog", rlog);

  // --- Tugas ---
  var st = spec.seedTasks || [
    { teks: "Balas email penting", pri: "tinggi", due: 0 },
    { teks: "Beli bahan makanan mingguan", pri: "sedang", due: 1 },
    { teks: "Riset ide proyek baru", pri: "rendah", due: 4 },
    { teks: "Bayar tagihan listrik", pri: "tinggi", due: 2 }
  ];
  Store.set("tasks", st.map(function (x, i) { return { id: id() + "t" + i, teks: x.teks, prioritas: x.pri || "sedang", tenggat: x.due != null ? iso(shift(x.due)) : "", done: false, t: Date.now() - i * 1e5 }; })
    .concat([{ id: id() + "td", teks: "Susun rencana minggu ini", prioritas: "sedang", tenggat: "", done: true, t: Date.now() - 2e5, doneAt: Date.now() - 1e5 }]));

  // --- Proyek ---
  var sp = spec.seedProject || { nama: "Rapikan Ruang Kerja", items: ["Bersihkan meja", "Atur kabel", "Backup file penting", "Tambah tanaman kecil"], doneN: 2 };
  Store.set("projects", [{ id: id() + "p1", nama: sp.nama, warna: "var(--primary)", items: (sp.items || []).map(function (t, j) { return { t: t, done: j < (sp.doneN || 0) }; }), t: Date.now() }]);

  // --- Catatan ---
  var cn = spec.seedCatatan || [
    { judul: "Ide minggu ini", teks: "Coba bangun pagi jam 5 dan lihat efeknya ke fokus. Catat hasilnya di jurnal.", tags: ["ide", "eksperimen"], pin: true },
    { judul: "", teks: "\"Kamu tidak harus hebat untuk memulai, tapi harus memulai untuk jadi hebat.\"", tags: ["kutipan"] },
    { judul: "Belanja bulan ini", teks: "- Sepatu lari\n- Buku jurnal baru\n- Vitamin D", tags: ["belanja"] }
  ];
  Store.set("notes", cn.map(function (n, i) { return { id: id() + "n" + i, judul: n.judul || "", teks: n.teks, tags: n.tags || [], pin: !!n.pin, t: Date.now() - i * 2e5 }; }));

  // --- Event ---
  var ev = spec.seedEvents || [
    { teks: "Cek kesehatan rutin", due: 3, warna: "#38bdf8" },
    { teks: "Ngopi bareng teman", due: 5, warna: "#f26d84" },
    { teks: "Deadline laporan", due: 8, warna: "#fbbf24" }
  ];
  Store.set("events", ev.map(function (e, i) { return { id: id() + "e" + i, iso: iso(shift(e.due)), teks: e.teks, warna: e.warna || "#7c5cff" }; }));

  // --- seeder modul signature (didaftarkan tiap modul khas) ---
  (window.SIG_SEEDERS || []).forEach(function (fn) { try { fn(Store, spec, { iso: iso, shift: shift, id: id }); } catch (e) {} });
};
