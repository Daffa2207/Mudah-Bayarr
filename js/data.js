/* =========================================================
   Mudah Bayar — data.js
   Seluruh data di file ini adalah DATA SIMULASI (dummy).
   Tidak terhubung ke sistem PLN/PDAM/kampus/provider yang asli.
   ========================================================= */

// ---------- 1. TAGIHAN PLN ----------
const billData = {
  pln: {
    "123456789012": { name: "Raka Aditya Pratama", info: "Periode: Mei 2026 · Gol. R1/900VA", amount: 245000, penalty: 0, dueDate: "2026-07-20" },
    "129876543210": { name: "Siti Nur Halimah",     info: "Periode: Mei 2026 · Gol. R1/1300VA", amount: 312500, penalty: 15000, dueDate: "2026-06-20" },
    "115533779911": { name: "Bagus Wicaksono",      info: "Periode: Mei 2026 · Gol. R2/2200VA", amount: 487200, penalty: 0, dueDate: "2026-07-20" },
    "110022334455": { name: "Melati Kusuma Dewi",   info: "Periode: Mei 2026 · Gol. R1/900VA", amount: 198750, penalty: 9500, dueDate: "2026-06-15" },
    "119988776655": { name: "Fajar Nugroho",        info: "Periode: Mei 2026 · Gol. R1/1300VA", amount: 276300, penalty: 0, dueDate: "2026-07-22" },
  },

  // ---------- 2. TAGIHAN PDAM ----------
  pdam: {
    "PD001234": { name: "Raka Aditya Pratama", info: "PDAM Tirta Kencana · Periode Mei 2026", amount: 87500, penalty: 0, dueDate: "2026-07-18" },
    "PD005678": { name: "Yuniarti Safitri",     info: "PDAM Tirta Kencana · Periode Mei 2026", amount: 102300, penalty: 5000, dueDate: "2026-06-25" },
    "PD009911": { name: "Dimas Ari Setiawan",   info: "PDAM Tirta Kencana · Periode Mei 2026", amount: 76800, penalty: 0, dueDate: "2026-07-19" },
  },

  // ---------- 3. TAGIHAN INTERNET ----------
  internet: {
    "INT77001122": { name: "Raka Aditya Pratama", info: "IndoNet Fiber 30Mbps · Juni 2026", amount: 325000, penalty: 0, dueDate: "2026-07-05" },
    "INT77003344": { name: "Clara Anindya",        info: "IndoNet Fiber 50Mbps · Juni 2026", amount: 415000, penalty: 20000, dueDate: "2026-06-28" },
    "INT77005566": { name: "Wahyu Setiabudi",      info: "IndoNet Fiber 20Mbps · Juni 2026", amount: 249000, penalty: 0, dueDate: "2026-07-10" },
  },

  // ---------- 4. TAGIHAN SEMINAR / EVENT (alfanumerik) ----------
  seminar: {
    "SEM2026WEBDEV": { name: "Workshop Fullstack Web Dev Batch 6", info: "Tiket Reguler · 12 Juli 2026", amount: 150000, penalty: 0, dueDate: "2026-07-08" },
    "SEM2026UIUX01": { name: "Seminar Nasional UI/UX Design", info: "Tiket Mahasiswa · 20 Juli 2026", amount: 75000, penalty: 0, dueDate: "2026-07-15" },
    "SEM2026AICON":  { name: "AI & Data Conference 2026", info: "Tiket Early Bird · 25 Juli 2026", amount: 225000, penalty: 0, dueDate: "2026-07-12" },
  },
};

// ---------- 5. BIAYA KULIAH / SPP ----------
// Setiap NIM punya daftar cicilan per semester + kode tagihan unik per item.
const sppData = {
  "221011450040": {
    mahasiswa: "Daffa Ferdinar",
    prodi: "Teknik Informatika",
    semester: "Genap 2025/2026",
    cicilan: [
      { id: 1, kode: "221011450040001", desc: "SPP Semester Genap 2025/2026 - Cicilan ke-1", amount: 2350000, status: "paid" },
      { id: 2, kode: "221011450040002", desc: "SPP Semester Genap 2025/2026 - Cicilan ke-2", amount: 2350000, status: "unpaid" },
      { id: 3, kode: "221011450040003", desc: "SPP Semester Genap 2025/2026 - Cicilan ke-3", amount: 2350000, status: "unpaid" },
      { id: 4, kode: "221011450040004", desc: "Biaya Bimbingan Skripsi", amount: 850000, status: "unpaid" },
      { id: 5, kode: "221011450040005", desc: "Dana Pengembangan Fasilitas", amount: 500000, status: "paid" },
      { id: 6, kode: "221011450040006", desc: "Tagihan UTS - Semester 20261", amount: 300000, status: "unpaid" },
      { id: 7, kode: "221011450040007", desc: "Tagihan UAS - Semester 20261", amount: 300000, status: "unpaid" },
    ],
  },
  "202310001": {
    mahasiswa: "Andika Pramudya",
    prodi: "Teknik Informatika",
    semester: "Ganjil 2025/2026",
    cicilan: [
      { id: 1, kode: "986248962486438", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-1", amount: 2500000, status: "unpaid" },
      { id: 2, kode: "986248962486439", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-2", amount: 2500000, status: "unpaid" },
      { id: 3, kode: "986248962486440", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-3", amount: 2500000, status: "paid" },
      { id: 4, kode: "986248962486441", desc: "Uang Praktikum Semester Ganjil", amount: 750000, status: "unpaid" },
      { id: 5, kode: "986248962486442", desc: "Dana Pengembangan Fasilitas", amount: 500000, status: "paid" },
      { id: 6, kode: "986248962486443", desc: "Tagihan UTS - Semester 20252", amount: 300000, status: "unpaid" },
      { id: 7, kode: "986248962486444", desc: "Tagihan UAS - Semester 20252", amount: 300000, status: "unpaid" },
    ],
  },
  "202310002": {
    mahasiswa: "Bunga Larasati",
    prodi: "Sistem Informasi",
    semester: "Ganjil 2025/2026",
    cicilan: [
      { id: 1, kode: "774411552266010", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-1", amount: 2200000, status: "paid" },
      { id: 2, kode: "774411552266011", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-2", amount: 2200000, status: "unpaid" },
      { id: 3, kode: "774411552266012", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-3", amount: 2200000, status: "unpaid" },
      { id: 4, kode: "774411552266013", desc: "Uang Praktikum Semester Ganjil", amount: 650000, status: "unpaid" },
      { id: 5, kode: "774411552266014", desc: "Dana Pengembangan Fasilitas", amount: 500000, status: "unpaid" },
      { id: 6, kode: "774411552266015", desc: "Tagihan UTS - Semester 20252", amount: 275000, status: "paid" },
      { id: 7, kode: "774411552266016", desc: "Tagihan UAS - Semester 20252", amount: 275000, status: "unpaid" },
      { id: 8, kode: "774411552266017", desc: "Iuran Himpunan Mahasiswa", amount: 100000, status: "unpaid" },
    ],
  },
  "202310003": {
    mahasiswa: "Candra Wibowo",
    prodi: "Desain Komunikasi Visual",
    semester: "Ganjil 2025/2026",
    cicilan: [
      { id: 1, kode: "552200998877001", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-1", amount: 2100000, status: "unpaid" },
      { id: 2, kode: "552200998877002", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-2", amount: 2100000, status: "unpaid" },
      { id: 3, kode: "552200998877003", desc: "Uang Praktikum Studio", amount: 900000, status: "unpaid" },
      { id: 4, kode: "552200998877004", desc: "Dana Pengembangan Fasilitas", amount: 500000, status: "paid" },
      { id: 5, kode: "552200998877005", desc: "Tagihan UTS - Semester 20252", amount: 250000, status: "unpaid" },
      { id: 6, kode: "552200998877006", desc: "Tagihan UAS - Semester 20252", amount: 250000, status: "unpaid" },
    ],
  },
};

// ---------- 6. PROVIDER PULSA & MAPPING PREFIX NOMOR ----------
const providerData = {
  telkomsel: { label: "Telkomsel", color: "#e2001a", prefixes: ["0811","0812","0813","0821","0822","0823","0851","0852","0853"] },
  xl:        { label: "XL Axiata", color: "#1a1a8c", prefixes: ["0817","0818","0819","0859","0877","0878","0879"] },
  indosat:   { label: "Indosat Ooredoo", color: "#ffcb05", prefixes: ["0814","0815","0816","0855","0856","0857","0858"] },
  tri:       { label: "Tri (3)", color: "#8a2be2", prefixes: ["0895","0896","0897","0898","0899"] },
  smartfren: { label: "Smartfren", color: "#e60012", prefixes: ["0881","0882","0883","0884","0885","0886","0887","0888","0889"] },
  axis:      { label: "Axis", color: "#4b0082", prefixes: ["0831","0832","0833","0838"] },
};

const pulsaNominal = [10000, 25000, 50000, 100000, 200000];

const paketData = {
  telkomsel: [ { label: "1GB / 3 Hari", price: 15000 }, { label: "5GB / 30 Hari", price: 55000 }, { label: "15GB / 30 Hari", price: 95000 } ],
  xl:        [ { label: "2GB / 7 Hari", price: 20000 }, { label: "8GB / 30 Hari", price: 60000 }, { label: "20GB / 30 Hari", price: 100000 } ],
  indosat:   [ { label: "3GB / 15 Hari", price: 25000 }, { label: "10GB / 30 Hari", price: 65000 }, { label: "25GB / 30 Hari", price: 110000 } ],
  tri:       [ { label: "2GB / 7 Hari", price: 12000 }, { label: "10GB / 30 Hari", price: 45000 }, { label: "30GB / 30 Hari", price: 85000 } ],
  smartfren: [ { label: "4GB / 30 Hari", price: 40000 }, { label: "12GB / 30 Hari", price: 75000 }, { label: "24GB / 30 Hari", price: 105000 } ],
  axis:      [ { label: "2GB / 7 Hari", price: 13000 }, { label: "9GB / 30 Hari", price: 50000 }, { label: "20GB / 30 Hari", price: 90000 } ],
};

// ---------- 7. BANK UNTUK VIRTUAL ACCOUNT ----------
const bankList = [
  { code: "bca",    label: "BCA Virtual Account",    prefix: "39012" },
  { code: "bni",    label: "BNI Virtual Account",    prefix: "98800" },
  { code: "mandiri",label: "Mandiri Virtual Account",prefix: "89508" },
  { code: "bri",    label: "BRI Virtual Account",    prefix: "26215" },
];

// ---------- 8. LOKASI TELLER / KASIR ----------
const tellerLocations = [
  { name: "Mudah Bayar Point — Kemang", address: "Jl. Kemang Raya No. 21, Jakarta Selatan", hours: "08.00 - 20.00" },
  { name: "Mudah Bayar Point — Dago", address: "Jl. Ir. H. Djuanda No. 100, Bandung", hours: "08.00 - 20.00" },
  { name: "Mudah Bayar Point — Malioboro", address: "Jl. Malioboro No. 52, Yogyakarta", hours: "09.00 - 21.00" },
  { name: "Kantor Pos Terdekat", address: "Seluruh cabang Kantor Pos Indonesia", hours: "08.00 - 16.00" },
];

// ---------- 9. PROMO BANNER (dashboard) ----------
const promoBanners = [
  { title: "Cashback 20% Bayar Listrik", desc: "Maks. Rp10.000, khusus pengguna baru.", tone: "primary" },
  { title: "Bebas Biaya Admin SPP", desc: "Bayar cicilan kuliah tanpa biaya tambahan bulan ini.", tone: "amber" },
  { title: "Bonus Kuota 1GB", desc: "Setiap isi pulsa minimal Rp50.000.", tone: "ink" },
];
