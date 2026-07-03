# Mudah Bayar — Aplikasi Simulasi Bayar Tagihan & Isi Pulsa

**Dibuat oleh:** Daffa Ferdinar (NIM: 221011450040) — Teknik Informatika,
Universitas Pamulang

## 1. Deskripsi Singkat

**Mudah Bayar** adalah aplikasi web frontend (client-side only) yang
mensimulasikan proses pembayaran tagihan rutin (listrik, PDAM, internet,
seminar/event), cicilan biaya kuliah (SPP), serta isi pulsa & paket data.
Dibangun murni dengan **HTML5, CSS3, dan Vanilla JavaScript (ES6+)** — tanpa
backend maupun database sungguhan. Seluruh data transaksi & saldo disimpan
di `localStorage` milik browser, sehingga aplikasi tetap "mengingat" riwayat
pengguna walau halaman ditutup.

> ⚠️ **Catatan penting**: Ini adalah aplikasi simulasi untuk keperluan tugas
> kuliah. Tidak ada uang sungguhan yang diproses, dan tidak terhubung ke
> sistem PLN/PDAM/kampus/provider yang asli.

## 2. Cara Menjalankan

Tidak perlu instalasi atau build tool apa pun.

1. Ekstrak folder proyek ini.
2. Cukup buka file `index.html` langsung di browser (Chrome/Edge/Firefox
   terbaru).
3. Selesai — aplikasi berjalan sepenuhnya di sisi klien.

*(Opsional)* Jika ingin menjalankan lewat local server (disarankan agar semua
fitur browser bekerja normal, misalnya clipboard):

```bash
# Python 3
python -m http.server 8080
# lalu buka http://localhost:8080
```

## 3. Struktur Folder

```
mudahbayar/
├── index.html          # Struktur & semua section/view (SPA)
├── css/
│   └── style.css        # Design system, komponen, responsive, print
├── js/
│   ├── data.js           # Data simulasi (PLN, PDAM, internet, SPP, provider pulsa, dst.)
│   └── app.js             # Seluruh logika aplikasi (state, validasi, render, localStorage)
├── assets/
│   └── screenshots/       # Taruh screenshot desktop & mobile di sini
└── README.md
```

## 4. Konsep Desain

- **Nama & identitas**: "Mudah Bayar" — nama yang langsung menjelaskan
  fungsi aplikasi: membayar tagihan apa pun dengan mudah, dalam satu
  layar. Setiap pembayaran yang selesai ditandai dengan **stempel "LUNAS"**
  bergaya cap kasir di struk digital, sebagai elemen ciri khas brand.
- **Palet warna**: hijau teal (`#0F6F5C`) sebagai warna kepercayaan
  finansial (terinspirasi dari PLN Mobile, Dana, LinkAja), dipadukan tinta
  gelap (`#0B2B26`) dan aksen kuning keemasan (`#E8A33D`). Mendukung mode
  gelap penuh.
- **Tipografi**: *Space Grotesk* untuk judul, *Inter* untuk teks umum, dan
  *JetBrains Mono* untuk seluruh angka/kode (nomor pelanggan, nominal, nomor
  VA, kode tagihan) agar mudah dipindai mata seperti pada struk asli.
- **Layout & mobile-first polish**: sidebar navigasi di desktop, berubah
  menjadi top bar (blur + safe-area) dan bottom tab bar ala aplikasi mobile
  banking pada layar kecil. Semua tombol/elemen interaktif menjaga target
  sentuh ≥44px, ada 4 breakpoint (tablet, mobile, mobile kecil <360px, dan
  landscape pendek) agar tampilan tetap rapi di berbagai ukuran layar.

## 5. Daftar Fitur yang Diimplementasikan

### Wajib
- [x] 7 section/view (SPA, tanpa reload): Beranda, Bayar Tagihan, Biaya
      Kuliah, Isi Pulsa, Riwayat, Profil, Bantuan/FAQ.
- [x] Dashboard: saldo simulasi (top up manual), akses cepat kategori, promo
      banner, transaksi terakhir.
- [x] Bayar Tagihan — 4 kategori (PLN, PDAM, Internet, Seminar/Event):
  - Validasi ketat input (panjang karakter, numerik/alfanumerik sesuai
    kategori, pola regex per kategori).
  - Hasil cek tagihan: nama pelanggan, info, tagihan pokok, denda, jatuh
    tempo, total.
  - 3 metode pembayaran: **Virtual Account** (generate nomor VA dengan
    format unik per bank + pilihan 4 bank), **QRIS** (QR code asli via
    `qrcode.js` + countdown 5 menit), dan **Bayar di Teller** (kode
    pembayaran + daftar lokasi).
  - Loading state saat cek tagihan & saat memproses pembayaran.
  - Modal konfirmasi & struk digital dengan stempel "LUNAS", bisa dicetak
    (`window.print()` + CSS `@media print`).
- [x] Biaya Kuliah/SPP:
  - Input NIM (validasi ketat: hanya angka, 6–15 digit) → daftar cicilan
    semester dengan checkbox multi-pilih & total otomatis.
  - Tombol "Pilih Semua Belum Lunas".
  - Pencarian tagihan berdasarkan Kode Tagihan lintas NIM.
- [x] Isi Pulsa & Paket Data:
  - Validasi ketat nomor HP (`08xxxxxxxxxx`, 10–13 digit, wajib diawali
    `08`) dengan pesan error real-time.
  - Grid 6 provider dengan **deteksi otomatis** dari 4 digit awal nomor HP.
  - Pilihan nominal preset + nominal custom, atau paket data per provider.
  - Alur pembayaran sama seperti tagihan umum.
- [x] Riwayat Transaksi: tabel dari `localStorage`, filter kategori & pencarian
  teks, tombol hapus semua riwayat (dengan konfirmasi, tidak bisa
  di-undo).
- [x] Notifikasi toast (sukses/error/info), validasi form real-time & saat
      submit, modal custom, dark/light mode (tersimpan di `localStorage`).
- [x] Accessibility: semantic HTML, atribut ARIA (`role="tablist"`,
      `aria-selected`, `aria-live` pada toast), skip link, fokus keyboard
      terlihat jelas, kontras warna memadai pada kedua tema.

### Nilai Tambah
- [x] Halaman Profil (nama & email tersimpan lokal).
- [x] Halaman Bantuan/FAQ (accordion).
- [x] Dark/Light mode toggle.
- [x] Auto-deteksi provider dari nomor HP.
- [x] Animasi stempel "LUNAS" pada struk sebagai elemen ciri khas brand.
- [x] Polish responsive tambahan: topbar/bottom-nav dengan efek blur, target
      sentuh minimal 44px, breakpoint khusus untuk layar sangat kecil dan
      mode landscape.

### Edge Case yang Ditangani
- **NIM/nomor pelanggan tidak terdaftar** → pesan error jelas (toast +
  empty state), aplikasi tidak crash.
- **Membayar tagihan yang sudah "Lunas"** → checkbox otomatis dinonaktifkan
  pada baris cicilan SPP yang berstatus lunas, tidak bisa dipilih.
- **Nomor HP tidak valid** (bukan diawali `08`, panjang salah, mengandung
  huruf) → validasi real-time saat mengetik + saat submit.
- **Klik "Bayar Sekarang" tanpa memilih metode pembayaran** → tidak ada
  metode yang terpilih otomatis saat modal dibuka; tombol "Bayar Sekarang"
  tetap nonaktif dan baru bisa ditekan setelah pengguna memilih salah satu
  metode (VA / QRIS / Teller).
- **Clear history transaksi** → meminta konfirmasi (`confirm()`) sebelum
  benar-benar menghapus, dan menampilkan info jika riwayat memang sudah
  kosong.

## 6. Data Simulasi (untuk mencoba aplikasi)

**PLN** — coba salah satu nomor: `123456789012`, `129876543210`,
`115533779911`, `110022334455`, `119988776655`

**PDAM**: `PD001234`, `PD005678`, `PD009911`

**Internet**: `INT77001122`, `INT77003344`, `INT77005566`

**Seminar/Event**: `SEM2026WEBDEV`, `SEM2026UIUX01`, `SEM2026AICON`

**NIM (Biaya Kuliah)**: `221011450040` (Daffa Ferdinar — data utama),
`202310001`, `202310002`, `202310003` (data contoh tambahan)

**Kode Tagihan contoh**: `221011450040001` (NIM 221011450040),
`986248962486438` (NIM 202310001)

**Nomor HP** (untuk uji deteksi provider): awali dengan `0812` (Telkomsel),
`0817` (XL), `0815` (Indosat), `0895` (Tri), `0881` (Smartfren), `0831`
(Axis).

**Contoh input tidak valid** (untuk menguji validasi & edge case):
- NIM tidak terdaftar: `999999999`
- Nomor pelanggan PLN sudah lunas/tidak ada: nomor selain 5 di atas
- Nomor HP tidak valid: `12345`, `081234` (kurang digit), `abcdefghijk`

## 7. Screenshot Tampilan

> Tempel screenshot hasil uji Chrome DevTools → Responsive mode di sini
> sebelum dikumpulkan.

**Desktop**

`assets/screenshots/desktop-dashboard.png`

**Mobile**

`assets/screenshots/mobile-dashboard.png`

## 8. Link Demo

> Isi setelah proyek di-deploy ke GitHub Pages / Netlify, contoh:
> `https://<username>.github.io/mudah-bayar/`

## 9. Video Demo (opsional)

> Tempel link video demo singkat (2–5 menit) di sini jika ada, misalnya
> link YouTube (Unlisted) atau Google Drive.

## 10. Teknologi yang Digunakan

- HTML5 semantic + ARIA
- CSS3 (Custom Properties, Flexbox, Grid, `@media print`, `backdrop-filter`)
- Vanilla JavaScript ES6+ (tanpa framework)
- [Font Awesome 6](https://fontawesome.com/) via CDN — ikon
- [qrcode.js](https://github.com/davidshimjs/qrcodejs) via CDN — QR code QRIS
- [jsPDF](https://github.com/parallax/jsPDF) via CDN — tersedia untuk ekspor
  PDF (opsional/pengembangan lanjutan)
- Google Fonts: Space Grotesk, Inter, JetBrains Mono

## 11. Cara Deploy ke GitHub (disarankan)

```bash
git init
git add .
git commit -m "Initial commit: Mudah Bayar - aplikasi bayar tagihan & isi pulsa"
git branch -M main
git remote add origin https://github.com/<username>/mudah-bayar.git
git push -u origin main
```

Untuk demo publik via GitHub Pages: buka **Settings → Pages** di repo,
pilih branch `main` dan folder `/ (root)`, lalu simpan. Link demo akan
tersedia di `https://<username>.github.io/<nama-repo>/`.

## 12. Pengembangan Lanjutan (ide jika ingin dikembangkan)

- Statistik pengeluaran bulanan dengan Chart.js pada halaman Riwayat.
- Export struk ke PDF menggunakan jsPDF (library sudah dimuat di `index.html`).
- Fake login multi-user dengan beberapa akun contoh.

---
Dibuat sebagai proyek tugas kuliah — Aplikasi Web Pembayaran Tagihan
Multi-Layanan & Pengisian Pulsa.
