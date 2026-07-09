/* panduan.js — Panduan lengkap per app (config-driven). Jelaskan tiap menu,
   3 langkah mulai, tips mengisi, & FAQ. Deskripsi menu dari MODULE_HELP +
   spec.guide (intro/start/faq per app). Dibuat agar orang awam tak bingung. */
window.MODULE_HELP = {
  beranda: { ic: "layout-dashboard", d: "Ringkasan harimu: skor, kebiasaan hari ini, dan hal yang perlu perhatian. Cukup dilihat 10 detik tiap pagi.", t: "Mulai hari dari sini." },
  fokus: { ic: "sun-high", d: "Tetapkan niat, 3 prioritas utama, dan blok waktu untuk hari ini.", t: "Aturan emas: cukup 3 hal penting per hari." },
  checklist: { ic: "checklist", d: "Pusat 'kerjakan': Rutinitas harian, daftar Tugas, Proyek bertahap, dan Template siap-pasang.", t: "Bingung mulai? Buka tab Template, sekali klik langsung terisi." },
  ritme: { ic: "flame", d: "Kebiasaan harian yang kamu centang tiap hari. Ada streak (rentetan) & peta konsistensi.", t: "Mulai 1–2 kebiasaan kecil saja dulu." },
  sasaran: { ic: "target-arrow", d: "Target besarmu, dipecah jadi langkah-langkah kecil yang bisa dicentang.", t: "Klik 'Pecah jadi langkah (AI)' kalau bingung merincinya." },
  kalender: { ic: "calendar-event", d: "Tampilan bulan berisi kebiasaan, tugas, jurnal, & agenda dalam satu pandangan.", t: "Klik tanggal untuk tambah agenda." },
  pustaka: { ic: "books", d: "Perpustakaan template: paket kebiasaan & sasaran siap pasang. Cocok untuk yang tak mau mulai dari nol.", t: "Pasang 1 paket, lalu sesuaikan." },
  jurnal: { ic: "feather", d: "Catatan harian: mood, energi, syukur, dan tulisan bebas. 2 menit sebelum tidur.", t: "Rutin isi → pola perasaanmu jadi terlihat." },
  catatan: { ic: "notes", d: "Tempat menuang ide, kutipan, atau apa saja. Bisa diberi tag & dicari.", t: "Pin catatan penting agar selalu di atas." },
  tinjau: { ic: "calendar-stats", d: "Rekap mingguan + coach AI yang membaca datamu dan memberi arahan minggu depan.", t: "Sisihkan 5 menit tiap Minggu di sini." },
  skor: { ic: "gauge", d: "Rincian dari mana skormu berasal: konsistensi, sasaran, jurnal, keseimbangan area.", t: "Angka naik saat kamu konsisten — bukan saat sempurna." },
  pencapaian: { ic: "trophy", d: "Lencana & level yang terbuka otomatis dari aktivitasmu. Bikin nagih.", t: "Cek sesekali untuk lihat progres perjalananmu." },
  cetak: { ic: "printer", d: "Cetak halaman planner (harian/mingguan/laporan) atau simpan jadi PDF.", t: "Pilih 'Simpan sebagai PDF' di dialog cetak." },
  // signature
  anggaran: { ic: "wallet", d: "Bagi uang ke amplop/pos (mis. makan, transport). Pantau terpakai vs anggaran.", t: "Catat pengeluaran tiap hari, sebentar saja." },
  utang: { ic: "credit-card", d: "Daftar utang & rencana pelunasan metode Snowball (lunasi terkecil dulu).", t: "Fokus ke utang teratas, sisanya bayar minimum." },
  impian: { ic: "pig-money", d: "Tabungan tujuan (dana darurat, umroh, rumah) dengan target & progres.", t: "Isi tenggat → app hitung berapa nabung/bulan." },
  timeline: { ic: "timeline", d: "Checklist persiapan nikah per fase waktu (12+ bulan → hari-H) + hitung mundur.", t: "Kerjakan sesuai fase, tak perlu semua sekaligus." },
  vendor: { ic: "briefcase", d: "Catat & bandingkan vendor (biaya, DP, status bayar).", t: "Ubah status jadi 'Lunas' saat pelunasan beres." },
  tamu: { ic: "users", d: "Daftar tamu + konfirmasi kehadiran (RSVP) + rekap jumlah.", t: "Kelompokkan tamu agar mudah dikelola." },
  latihan: { ic: "barbell", d: "Log latihan: gerakan, set, reps, beban. Rekor pribadi (PR) dihitung otomatis.", t: "Catat tiap sesi — grafik kekuatanmu tumbuh." },
  tubuh: { ic: "scale", d: "Pantau berat & ukuran tubuh dari waktu ke waktu + tren.", t: "Timbang di waktu yang sama tiap minggu." },
  quran: { ic: "book-2", d: "Pelacak khatam Quran (30 juz) + log tilawah harian + estimasi tanggal khatam.", t: "Catat halaman tiap habis baca." },
  ibadah: { ic: "moon-stars", d: "Ceklis ibadah harian: salat 5 waktu + amalan sunnah. Ada streak.", t: "Centang tiap selesai — jaga istiqamah." },
  nilai: { ic: "chart-dots", d: "Catat nilai tiap mata kuliah, IPK dihitung otomatis (bobot SKS) + simulator target.", t: "Pakai simulator untuk tahu nilai yang dibutuhkan." },
  jadwal: { ic: "calendar-time", d: "Jadwal kuliah/pelajaran mingguan dalam tabel yang rapi.", t: "Isi sekali di awal semester." },
  menu: { ic: "chef-hat", d: "Rencana menu keluarga 7 hari + daftar belanja otomatis.", t: "Klik 'Daftar Belanja' → kirim ke Tugas." },
  anak: { ic: "baby-carriage", d: "Profil anak + milestone tumbuh kembang + catatan penting.", t: "Rekam momen kecil, jadi kenangan berharga." },
  pendapatan: { ic: "coin", d: "Arus kas bisnis: pemasukan & pengeluaran, laba, & tren bulanan.", t: "Catat tiap transaksi agar laba terlihat jujur." },
  klien: { ic: "users-group", d: "Pipeline klien/deal: dari Prospek → Nego → Deal → Selesai.", t: "Geser kartu saat status berubah." },
  mood: { ic: "mood-smile", d: "Check-in harian: mood, jam tidur, energi. App cari pola yang memengaruhi harimu.", t: "Isi tiap hari — insight muncul setelah beberapa hari." },
  hidrasi: { ic: "droplet", d: "Pantau minum air harian + target gelas + streak.", t: "Ketuk +1 tiap habis minum segelas." },
  konten: { ic: "layout-kanban", d: "Papan konten: Ide → Produksi → Terjadwal → Terbit.", t: "Tuang semua ide di kolom Ide dulu." },
  ide: { ic: "bulb", d: "Bank ide & hook konten, dikelompokkan per kategori.", t: "Simpan ide random di sini — jangan andalkan ingatan." },
  tantangan: { ic: "flag-bolt", d: "Tantangan 7/30 hari: pilih, centang tiap hari berhasil, selesaikan untuk lencana & XP.", t: "Satu tantangan aktif saja — fokus." },
  rundown: { ic: "list-numbers", d: "Susunan acara hari-H: jam, kegiatan, penanggung jawab.", t: "Bagikan ke MC & panitia sebelum hari-H." },
  seserahan: { ic: "gift", d: "Daftar seserahan/hantaran: item, biaya, status dari rencana sampai dikemas.", t: "Naikkan status tiap ada progres." },
  tugaskuliah: { ic: "clipboard-text", d: "Bank tugas kuliah + deadline. Yang paling dekat tampil paling atas.", t: "Catat begitu tugas diumumkan — jangan andalkan ingatan." },
  jadwalkeluarga: { ic: "calendar-heart", d: "Agenda seluruh anggota keluarga: les, imunisasi, kontrol, acara.", t: "Cek tiap pagi — tak ada lagi yang kelewat." },
  sedekah: { ic: "hand-love-you", d: "Catatan sedekah (untuk menjaga rutin, bukan pamer) + kumpulan doa favorit.", t: "Sekecil apa pun, catat — konsistensinya yang dihitung." },
  program: { ic: "clipboard-list", d: "Program latihan terstruktur per hari. Klik 'Mulai sesi' → langsung masuk Log Latihan.", t: "Ganti program tiap 8–12 minggu." },
  invoice: { ic: "file-invoice", d: "Tagihan profesional untuk klien: item, total, status, siap cetak PDF.", t: "Kirim invoice segera setelah kerja selesai." },
  postcal: { ic: "calendar-bolt", d: "Kalender posting bulanan dari pipeline kontenmu.", t: "Jadwalkan seminggu ke depan tiap Minggu malam." },
  langganan: { ic: "receipt-2", d: "Tagihan & langganan rutin + jatuh tempo. Total 'bocor tetap' bulananmu terlihat.", t: "Klik Bayar → jatuh tempo maju otomatis." },
  tidur: { ic: "zzz", d: "Log jam tidur-bangun + kualitas. Durasi & tren dihitung otomatis.", t: "Isi tiap pagi begitu bangun, 10 detik." }
};

window.Shell.register({
  id: "panduan", nama: "Panduan", icon: "help-circle",
  mount: function (root, ctx) {
    var UI = ctx.ui, spec = ctx.spec, g = spec.guide || {};
    root.appendChild(UI.viewHead("Panduan " + APP.nama, "Cara pakai", null));

    // intro hero
    root.appendChild(UI.el("section", { class: "hero", style: "margin-bottom:20px" }, [
      UI.el("div", {}, [
        UI.el("div", { class: "kick", text: "Selamat datang 👋" }),
        UI.el("h1", { class: "h1", html: g.intro || ("Semua yang kamu butuhkan untuk " + (spec.kindLabel || "menata hidup") + ", dalam satu tempat.") }),
        UI.el("div", { class: "sub", text: g.sub || "Tenang, tidak perlu mengisi semuanya sekaligus. Ikuti 3 langkah di bawah, sisanya menyusul pelan-pelan." }),
        UI.el("div", { class: "row gap8", style: "margin-top:16px" }, [
          window.Onboard ? UI.el("button", { class: "btn btn-primary", onclick: function () { Onboard.start(); } }, [UI.icon("wand"), "Isi terpandu (2 menit)"]) : null,
          UI.el("button", { class: "btn btn-ghost", onclick: function () { ctx.go("pustaka"); } }, [UI.icon("books"), "Pasang dari Template"])
        ])
      ])
    ]));

    // 3 langkah mulai
    var start = g.start || [
      { j: "Kenalkan dirimu", d: "Buka Pengaturan → isi profil singkat, atau klik 'Isi terpandu' di atas. Ini bikin saran terasa personal." },
      { j: "Pasang isi awal", d: "Buka Pustaka atau tab Template di Checklist — pilih paket siap-pakai. Tidak perlu mikir dari nol." },
      { j: "Datang tiap hari", d: "Cukup buka Beranda & centang yang sudah kamu lakukan. Sisanya app yang mengurus." }
    ];
    var stepsWrap = UI.el("div", { class: "steps", style: "margin-bottom:8px" });
    start.forEach(function (s, i) { stepsWrap.appendChild(UI.el("div", { class: "card stp" }, [UI.el("span", { class: "n", text: (i + 1) }), UI.el("h3", { text: s.j }), UI.el("p", { text: s.d })])); });
    root.appendChild(UI.el("div", { class: "sec" }, [UI.el("div", { class: "sec-head" }, [UI.el("h2", { class: "h2", text: "Mulai dari 3 langkah ini" })]), stepsWrap]));

    // kenali tiap menu
    var list = UI.el("div", { class: "guide-list" });
    (APP.modul || []).forEach(function (id) {
      if (id === "panduan") return;
      var h = MODULE_HELP[id]; if (!h) return;
      var label = (APP.labels && APP.labels[id]) || id;
      list.appendChild(UI.el("div", { class: "guide-item" }, [
        UI.el("div", { class: "guide-ic" }, [UI.icon(h.ic || "circle")]),
        UI.el("div", { style: "flex:1" }, [
          UI.el("div", { class: "guide-t", text: label }),
          UI.el("div", { class: "guide-d", text: h.d }),
          h.t ? UI.el("div", { class: "guide-tip" }, [UI.icon("bulb"), UI.el("span", { text: h.t })]) : null
        ]),
        UI.el("button", { class: "btn btn-ghost btn-sm", onclick: function () { ctx.go(id); } }, ["Buka", UI.icon("arrow-right")])
      ]));
    });
    root.appendChild(UI.el("div", { class: "sec" }, [UI.el("div", { class: "sec-head" }, [UI.el("h2", { class: "h2", text: "Kenali tiap menu" })]), list]));

    // FAQ
    var faq = (g.faq || []).concat([
      { q: "Harus mengisi semua menu?", a: "Tidak. Mulai dari Beranda, Checklist, dan 1–2 kebiasaan. Menu lain dipakai saat kamu butuh." },
      { q: "Data saya aman?", a: "Ya. Semua tersimpan di perangkatmu sendiri (tidak dikirim ke server mana pun). Bisa dicadangkan lewat Pengaturan." },
      { q: "Perlu internet / bayar?", a: "Tidak berbayar. Internet hanya untuk fitur AI (opsional) — sisanya jalan offline." },
      { q: "Salah isi, bisa diulang?", a: "Bisa. Di Pengaturan ada 'Reset ke contoh' & 'Mulai Bersih'. Aman bereksperimen." }
    ]);
    var faqWrap = UI.el("div", { class: "faq-guide" });
    faq.forEach(function (f) {
      var det = UI.el("details", { class: "guide-faq" }, [UI.el("summary", { text: f.q }), UI.el("div", { class: "guide-a", text: f.a })]);
      faqWrap.appendChild(det);
    });
    root.appendChild(UI.el("div", { class: "sec" }, [UI.el("div", { class: "sec-head" }, [UI.el("h2", { class: "h2", text: "Pertanyaan umum" })]), faqWrap]));
  }
});
