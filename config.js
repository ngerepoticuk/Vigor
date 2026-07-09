/* REBRAND: ganti nama/tagline/warna di sini. Fitur dari _engine (dibagi). */
window.APP = {
  "id": "planner-forge",
  "nama": "Vigor",
  "tagline": "Tempa tubuh, tempa disiplin",
  "logo": "",
  "modul": [
    "beranda",
    "fokus",
    "checklist",
    "ritme",
    "program",
    "latihan",
    "tubuh",
    "sasaran",
    "kalender",
    "pustaka",
    "jurnal",
    "catatan",
    "tinjau",
    "skor",
    "tantangan",
    "pencapaian",
    "cetak",
    "panduan"
  ],
  "labels": {
    "beranda": "Beranda",
    "fokus": "Fokus Hari Ini",
    "checklist": "Checklist & Tugas",
    "ritme": "Ritme",
    "sasaran": "Sasaran",
    "kalender": "Kalender",
    "pustaka": "Pustaka",
    "jurnal": "Jurnal",
    "catatan": "Catatan",
    "tinjau": "Tinjauan",
    "skor": "Skor Bugar",
    "tantangan": "Tantangan",
    "pencapaian": "Pencapaian",
    "cetak": "Studio Cetak",
    "panduan": "Panduan",
    "program": "Program Latihan",
    "latihan": "Log Latihan",
    "tubuh": "Progres Tubuh"
  },
  "navGroups": [
    {
      "label": "Hari Ini",
      "ids": [
        "beranda",
        "fokus",
        "checklist",
        "ritme"
      ]
    },
    {
      "label": "Latihan",
      "ids": [
        "program",
        "latihan",
        "tubuh"
      ]
    },
    {
      "label": "Rencana",
      "ids": [
        "sasaran",
        "kalender",
        "pustaka"
      ]
    },
    {
      "label": "Refleksi",
      "ids": [
        "jurnal",
        "catatan",
        "tinjau"
      ]
    },
    {
      "label": "Progres",
      "ids": [
        "skor",
        "tantangan",
        "pencapaian",
        "cetak",
        "panduan"
      ]
    }
  ],
  "ai": {
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  },
  "spec": {
    "onboardHabits": [
      {
        "nama": "Latihan beban",
        "domain": "kekuatan",
        "target": 4,
        "p": 0.62
      },
      {
        "nama": "10.000 langkah",
        "domain": "kardio",
        "p": 0.66
      },
      {
        "nama": "Protein cukup (1.6g/kg)",
        "domain": "nutrisi",
        "p": 0.6
      },
      {
        "nama": "Stretch/mobility 10 mnt",
        "domain": "mobilitas",
        "p": 0.5
      },
      {
        "nama": "Tidur 7 jam (recovery)",
        "domain": "pemulihan",
        "p": 0.58
      }
    ],
    "onboardRoutine": {
      "nama": "Rutinitas Pagi",
      "waktu": "pagi",
      "items": [
        "Mulai dengan tenang",
        "Tetapkan 1 niat utama",
        "Siapkan yang dibutuhkan hari ini"
      ]
    },
    "habitPacks": [
      {
        "nama": "Paket Kekuatan",
        "icon": "flame",
        "warna": "#f97316",
        "habits": [
          {
            "nama": "Latihan beban",
            "domain": "kekuatan"
          }
        ]
      },
      {
        "nama": "Paket Kardio",
        "icon": "flame",
        "warna": "#38bdf8",
        "habits": [
          {
            "nama": "10.000 langkah",
            "domain": "kardio"
          }
        ]
      },
      {
        "nama": "Paket Nutrisi",
        "icon": "flame",
        "warna": "#34d399",
        "habits": [
          {
            "nama": "Protein cukup (1.6g/kg)",
            "domain": "nutrisi"
          },
          {
            "nama": "Minum 3 liter air",
            "domain": "nutrisi"
          }
        ]
      }
    ],
    "goalTemplates": [
      {
        "judul": "Pull-up 10× bersih",
        "domain": "kekuatan",
        "horizon": "kuartal",
        "sub": [
          "Negative pull-up 3×/mgg",
          "Assisted band progresif",
          "5× bersih",
          "8× bersih"
        ]
      },
      {
        "judul": "Turun 6 kg lemak",
        "domain": "nutrisi",
        "horizon": "kuartal",
        "sub": [
          "Defisit 400 kkal terukur",
          "Track makan 5 hari/mgg",
          "Timbang mingguan"
        ]
      },
      {
        "judul": "Konsisten 4× latihan/minggu",
        "domain": "kekuatan",
        "horizon": "bulan",
        "sub": [
          "Jadwal fix Sen-Sel-Kam-Sab",
          "Siapkan baju malam sebelum"
        ]
      }
    ],
    "kind": "fitness",
    "kindLabel": "kebugaran & kekuatan",
    "scoreLabel": "Skor Bugar",
    "wheelLabel": "Roda Kebugaran",
    "heroTitle": "Disiplin adalah memilih<br>yang kamu mau paling.",
    "heroSub": "Repetisi hari ini membangun tubuh dan mental besok.",
    "niatPh": "Fokus latihan hari ini… mis. Push day, form dulu baru beban",
    "domains": [
      {
        "key": "kekuatan",
        "label": "Kekuatan",
        "color": "#f97316"
      },
      {
        "key": "kardio",
        "label": "Kardio",
        "color": "#38bdf8"
      },
      {
        "key": "mobilitas",
        "label": "Mobilitas",
        "color": "#a3e635"
      },
      {
        "key": "nutrisi",
        "label": "Nutrisi",
        "color": "#34d399"
      },
      {
        "key": "pemulihan",
        "label": "Pemulihan",
        "color": "#a78bfa"
      }
    ],
    "seedBrain": {
      "nama": "Atlet",
      "peran": "mau bentuk badan & kuat",
      "musim": "Tahun Bangun Fisik",
      "nilai": [
        "disiplin",
        "konsistensi",
        "sehat"
      ],
      "fokus": "latihan 4×/minggu & cukup protein",
      "tantangan": "sering skip kalau capek kerja"
    },
    "seedHabits": [
      {
        "nama": "Latihan beban",
        "domain": "kekuatan",
        "target": 4,
        "p": 0.62
      },
      {
        "nama": "10.000 langkah",
        "domain": "kardio",
        "p": 0.66
      },
      {
        "nama": "Protein cukup (1.6g/kg)",
        "domain": "nutrisi",
        "p": 0.6
      },
      {
        "nama": "Stretch/mobility 10 mnt",
        "domain": "mobilitas",
        "p": 0.5
      },
      {
        "nama": "Tidur 7 jam (recovery)",
        "domain": "pemulihan",
        "p": 0.58
      },
      {
        "nama": "Minum 3 liter air",
        "domain": "nutrisi",
        "p": 0.7
      }
    ],
    "seedGoals": [
      {
        "judul": "Pull-up 10× bersih",
        "domain": "kekuatan",
        "horizon": "kuartal",
        "kenapa": "tolok ukur kekuatan atas",
        "sub": [
          "Negative pull-up 3×/mgg",
          "Assisted band progresif",
          "5× bersih",
          "8× bersih"
        ],
        "doneN": 1,
        "deadline": "2026-10-03"
      },
      {
        "judul": "Turun 6 kg lemak",
        "domain": "nutrisi",
        "horizon": "kuartal",
        "kenapa": "sehat & lebih ringan",
        "sub": [
          "Defisit 400 kkal terukur",
          "Track makan 5 hari/mgg",
          "Timbang mingguan"
        ],
        "doneN": 1,
        "deadline": "2026-10-13"
      },
      {
        "judul": "Konsisten 4× latihan/minggu",
        "domain": "kekuatan",
        "horizon": "bulan",
        "sub": [
          "Jadwal fix Sen-Sel-Kam-Sab",
          "Siapkan baju malam sebelum"
        ],
        "doneN": 1
      }
    ],
    "checklistTemplates": [
      {
        "jenis": "rutinitas",
        "nama": "Rutinitas Pra-Latihan",
        "waktu": "kapan",
        "icon": "barbell",
        "warna": "#f2660c",
        "items": [
          "Pemanasan dinamis 5 menit",
          "Siapkan air & handuk",
          "Tetapkan target sesi hari ini"
        ]
      },
      {
        "jenis": "proyek",
        "nama": "Program Recomp 12 Minggu",
        "waktu": null,
        "icon": "flame",
        "warna": "#f97316",
        "items": [
          "Tetapkan split latihan (mis. PPL)",
          "Atur target kalori & protein",
          "Latihan 4×/minggu",
          "Timbang & ukur tiap minggu",
          "Evaluasi & sesuaikan tiap 4 minggu"
        ]
      }
    ],
    "guide": {
      "intro": "Tempa tubuh, tempa disiplin. Catat tiap angkatan, lihat kekuatanmu tumbuh nyata.",
      "sub": null,
      "start": [
        {
          "j": "Catat sesi",
          "d": "Di Log Latihan, tambah sesi → gerakan → set × reps × beban."
        },
        {
          "j": "Ukur tubuh",
          "d": "Progres Tubuh: catat berat & lingkar tiap minggu."
        },
        {
          "j": "Kejar PR",
          "d": "App tandai rekor pribadimu otomatis. Kalahkan versi kemarin."
        }
      ],
      "faq": [
        {
          "q": "Perlu catat tiap set?",
          "a": "Ya, itu intinya — biar progres terukur. Lama-lama jadi kebiasaan, dan grafiknya bikin nagih."
        }
      ]
    },
    "challenges": [
      {
        "nama": "30 Hari Tanpa Skip Latihan",
        "hari": 30,
        "icon": "barbell",
        "warna": "#f2660c",
        "desc": "Sesuai jadwal program, tanpa alasan."
      },
      {
        "nama": "7 Hari 10rb Langkah",
        "hari": 7,
        "icon": "walk",
        "warna": "#fbbf24",
        "desc": "Gerak setiap hari."
      }
    ]
  },
  "tema": {
    "theme": "light",
    "vars": {
      "--bg": "#fdf6f1",
      "--surface": "#ffffff",
      "--surface2": "#f9e8db",
      "--ink": "#301c10",
      "--muted": "#836a58",
      "--primary": "#f2660c",
      "--primary-deep": "#d24708",
      "--accent": "#fb923c",
      "--on-primary": "#ffffff",
      "--line": "#f0dccd",
      "--line2": "#e6c9b3",
      "--ok": "#34d399",
      "--warn": "#fbbf24",
      "--danger": "#f87171",
      "--font-d": "\"Sora\", sans-serif",
      "--font-b": "\"Manrope\", sans-serif",
      "--font-m": "\"JetBrains Mono\", monospace"
    }
  },
  "themes": [
    {
      "key": "bara",
      "nama": "Bara Terang",
      "light": true,
      "vars": {
        "--bg": "#fdf6f1",
        "--surface": "#ffffff",
        "--surface2": "#f9e8db",
        "--ink": "#301c10",
        "--muted": "#836a58",
        "--primary": "#f2660c",
        "--primary-deep": "#d24708",
        "--accent": "#fb923c",
        "--on-primary": "#ffffff",
        "--line": "#f0dccd",
        "--line2": "#e6c9b3",
        "--ok": "#34d399",
        "--warn": "#fbbf24",
        "--danger": "#f87171"
      }
    },
    {
      "key": "listrik",
      "nama": "Biru Listrik",
      "light": true,
      "vars": {
        "--bg": "#f0f8fd",
        "--surface": "#ffffff",
        "--surface2": "#dcedf7",
        "--ink": "#0f2836",
        "--muted": "#5a7488",
        "--primary": "#0e8fe0",
        "--primary-deep": "#0b6fc2",
        "--accent": "#5fb8f5",
        "--on-primary": "#ffffff",
        "--line": "#d3e7f4",
        "--line2": "#bcd6ea",
        "--ok": "#34d399",
        "--warn": "#fbbf24",
        "--danger": "#f87171"
      }
    },
    {
      "key": "lime",
      "nama": "Lime",
      "light": true,
      "vars": {
        "--bg": "#f6faef",
        "--surface": "#ffffff",
        "--surface2": "#e9f2d9",
        "--ink": "#1f2a10",
        "--muted": "#68765a",
        "--primary": "#5f9e0a",
        "--primary-deep": "#4d7c0f",
        "--accent": "#a3e635",
        "--on-primary": "#ffffff",
        "--line": "#e0e8cf",
        "--line2": "#cfdcb2",
        "--ok": "#34d399",
        "--warn": "#fbbf24",
        "--danger": "#f87171"
      }
    },
    {
      "key": "malam",
      "nama": "Bengkel Malam",
      "vars": {
        "--bg": "#0f0d0b",
        "--surface": "#1a1613",
        "--surface2": "#241d18",
        "--ink": "#f2ebe4",
        "--muted": "#9a8d7f",
        "--primary": "#f97316",
        "--primary-deep": "#ea580c",
        "--accent": "#fdba74",
        "--on-primary": "#160c04",
        "--line": "#2c231c",
        "--line2": "#3d3025",
        "--ok": "#34d399",
        "--warn": "#fbbf24",
        "--danger": "#f87171"
      }
    }
  ]
};
