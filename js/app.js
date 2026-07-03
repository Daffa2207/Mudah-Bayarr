/* =========================================================
   Mudah Bayar — app.js
   Seluruh logika aplikasi (client-side, tanpa backend nyata).
   Data disimpan di localStorage. Dibangun dengan Vanilla JS (ES6+).
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     0. STATE & PENYIMPANAN (localStorage)
     ========================================================= */
  const STORAGE_KEYS = {
    balance: "mudahbayar_balance",
    transactions: "mudahbayar_transactions",
    theme: "mudahbayar_theme",
    profile: "mudahbayar_profile",
  };

  const state = {
    balance: Number(localStorage.getItem(STORAGE_KEYS.balance)) || 50000,
    transactions: JSON.parse(localStorage.getItem(STORAGE_KEYS.transactions) || "[]"),
    activeTagihanCat: "pln",
    pulsaType: "pulsa",
    selectedProvider: null,
    selectedNominal: null,
    selectedPaket: null,
    pendingPayment: null, // { kategori, deskripsi, nomor, amount, meta }
    selectedMethod: "va",
    selectedBank: bankList[0].code,
    qrisTimerInterval: null,
  };

  function persist() {
    localStorage.setItem(STORAGE_KEYS.balance, String(state.balance));
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(state.transactions));
  }

  /* =========================================================
     1. UTILITAS
     ========================================================= */
  function formatRupiah(num) {
    return "Rp" + Number(num).toLocaleString("id-ID");
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  function generateId() {
    return "TRX" + Date.now().toString().slice(-9) + Math.floor(Math.random() * 90 + 10);
  }

  function generateVA(bankPrefix, seed) {
    const tail = String(seed).replace(/\D/g, "").padStart(8, "0").slice(-8);
    return bankPrefix + tail;
  }

  function el(id) { return document.getElementById(id); }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function showToast(message, type) {
    type = type || "info";
    const icons = { success: "fa-circle-check", error: "fa-circle-exclamation", info: "fa-circle-info" };
    const toast = document.createElement("div");
    toast.className = "toast " + type;
    toast.innerHTML = '<i class="fa-solid ' + icons[type] + '" aria-hidden="true"></i><span>' + message + "</span>";
    el("toastContainer").appendChild(toast);
    setTimeout(() => {
      toast.classList.add("leaving");
      setTimeout(() => toast.remove(), 220);
    }, 3200);
  }

  function openModal(id) { el(id).hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal(id) { el(id).hidden = true; document.body.style.overflow = ""; }

  /* =========================================================
     2. NAVIGASI SPA
     ========================================================= */
  function switchView(viewName) {
    qsa(".view").forEach((v) => v.classList.remove("is-active"));
    const target = el("view-" + viewName);
    if (target) target.classList.add("is-active");

    qsa(".nav-item").forEach((n) => {
      const active = n.dataset.view === viewName;
      n.classList.toggle("is-active", active);
      n.setAttribute("aria-selected", active);
    });
    qsa(".bn-item").forEach((n) => n.classList.toggle("is-active", n.dataset.view === viewName));

    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

    if (viewName === "riwayat") renderHistory();
  }

  qsa("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });
  qsa("[data-view-link]").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.viewLink));
  });

  /* =========================================================
     3. TEMA GELAP / TERANG
     ========================================================= */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    const label = theme === "dark" ? "Mode Terang" : "Mode Gelap";
    const icon = theme === "dark" ? "fa-sun" : "fa-moon";
    el("themeToggle").innerHTML = '<i class="fa-solid ' + icon + '" aria-hidden="true"></i><span>' + label + "</span>";
    el("themeToggleMobile").innerHTML = '<i class="fa-solid ' + icon + '" aria-hidden="true"></i>';
  }
  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(current === "dark" ? "light" : "dark");
  }
  el("themeToggle").addEventListener("click", toggleTheme);
  el("themeToggleMobile").addEventListener("click", toggleTheme);
  applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || "light");

  /* =========================================================
     4. DASHBOARD
     ========================================================= */
  function renderBalance() {
    el("balanceAmount").textContent = formatRupiah(state.balance);
  }

  const quickItems = [
    { icon: "fa-bolt", label: "Listrik", view: "tagihan", cat: "pln" },
    { icon: "fa-faucet", label: "PDAM", view: "tagihan", cat: "pdam" },
    { icon: "fa-wifi", label: "Internet", view: "tagihan", cat: "internet" },
    { icon: "fa-graduation-cap", label: "Biaya Kuliah", view: "spp" },
    { icon: "fa-signal", label: "Isi Pulsa", view: "pulsa" },
    { icon: "fa-chalkboard-user", label: "Seminar", view: "tagihan", cat: "seminar" },
    { icon: "fa-clock-rotate-left", label: "Riwayat", view: "riwayat" },
    { icon: "fa-circle-question", label: "Bantuan", view: "faq" },
  ];

  function renderQuickGrid() {
    el("quickGrid").innerHTML = quickItems.map((item, i) =>
      '<button class="quick-item" data-idx="' + i + '"><i class="fa-solid ' + item.icon + '"></i><span>' + item.label + "</span></button>"
    ).join("");
    qsa(".quick-item", el("quickGrid")).forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = quickItems[Number(btn.dataset.idx)];
        switchView(item.view);
        if (item.cat) selectTagihanCategory(item.cat);
      });
    });
  }

  function renderPromo() {
    el("promoScroll").innerHTML = promoBanners.map((p) =>
      '<div class="promo-card tone-' + p.tone + '"><h3>' + p.title + "</h3><p>" + p.desc + "</p></div>"
    ).join("");
  }

  function renderRecentTx() {
    const wrap = el("recentTx");
    const recent = state.transactions.slice(0, 4);
    if (!recent.length) {
      wrap.innerHTML = '<div class="empty-state"><i class="fa-solid fa-receipt"></i>Belum ada transaksi. Yuk mulai bayar tagihan!</div>';
      return;
    }
    wrap.innerHTML = recent.map(txRowHtml).join("");
  }

  function txRowHtml(tx) {
    return (
      '<div class="result-row" style="padding:.7rem 0;">' +
      "<span>" + tx.desc + "<br><small style='color:var(--muted)'>" + formatDate(tx.date) + "</small></span>" +
      "<span>" + formatRupiah(tx.amount) + '<br><span class="status-pill status-success">Berhasil</span></span>' +
      "</div>"
    );
  }

  function refreshDashboard() {
    renderBalance();
    renderQuickGrid();
    renderPromo();
    renderRecentTx();
  }

  el("topUpBtn").addEventListener("click", () => {
    const input = prompt("Masukkan jumlah top up (simulasi), contoh: 500000");
    const amount = Number(input);
    if (!input || isNaN(amount) || amount <= 0) {
      showToast("Jumlah top up tidak valid.", "error");
      return;
    }
    state.balance += amount;
    persist();
    renderBalance();
    showToast("Top up " + formatRupiah(amount) + " berhasil.", "success");
  });

  /* =========================================================
     5. BAYAR TAGIHAN (PLN / PDAM / Internet / Seminar)
     ========================================================= */
  const tagihanMeta = {
    pln: { label: "Nomor Pelanggan PLN", placeholder: "Contoh: 123456789012", hint: "12 digit angka nomor pelanggan / ID meter PLN.", alnum: false, min: 8, max: 12 },
    pdam: { label: "Nomor Pelanggan PDAM", placeholder: "Contoh: PD001234", hint: "Kode pelanggan PDAM sesuai kartu langganan.", alnum: true, min: 6, max: 12 },
    internet: { label: "Nomor Pelanggan Internet", placeholder: "Contoh: INT77001122", hint: "ID pelanggan pada tagihan internet bulanan.", alnum: true, min: 8, max: 14 },
    seminar: { label: "Kode Referensi Seminar/Event", placeholder: "Contoh: SEM2026WEBDEV", hint: "Kode referensi tiket yang dikirim ke email pendaftaran.", alnum: true, min: 6, max: 16 },
  };

  function selectTagihanCategory(cat) {
    state.activeTagihanCat = cat;
    qsa(".tab-chip").forEach((c) => {
      const active = c.dataset.cat === cat;
      c.classList.toggle("is-active", active);
      c.setAttribute("aria-selected", active);
    });
    const meta = tagihanMeta[cat];
    el("tagihanLabel").textContent = meta.label;
    el("tagihanInput").placeholder = meta.placeholder;
    el("tagihanHint").textContent = meta.hint;
    el("tagihanInput").value = "";
    el("tagihanError").hidden = true;
    el("tagihanResult").innerHTML = "";
  }

  qsa(".tab-chip").forEach((chip) => {
    chip.addEventListener("click", () => selectTagihanCategory(chip.dataset.cat));
  });

  function validateTagihanInput(value, meta) {
    if (!value) return "Nomor pelanggan tidak boleh kosong.";
    if (value.length < meta.min || value.length > meta.max) {
      return "Panjang nomor harus " + meta.min + "-" + meta.max + " karakter.";
    }
    const pattern = meta.alnum ? /^[A-Za-z0-9]+$/ : /^[0-9]+$/;
    if (!pattern.test(value)) {
      return meta.alnum ? "Hanya boleh huruf dan angka, tanpa spasi/simbol." : "Nomor pelanggan hanya boleh berisi angka.";
    }
    return null;
  }

  el("tagihanForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const cat = state.activeTagihanCat;
    const meta = tagihanMeta[cat];
    const raw = el("tagihanInput").value.trim();
    const value = meta.alnum ? raw.toUpperCase() : raw;
    const errMsg = validateTagihanInput(value, meta);
    const errorEl = el("tagihanError");
    const inputEl = el("tagihanInput");

    if (errMsg) {
      errorEl.textContent = errMsg;
      errorEl.hidden = false;
      inputEl.classList.add("error");
      return;
    }
    errorEl.hidden = true;
    inputEl.classList.remove("error");

    const btn = el("cekTagihanBtn");
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mencari...';
    el("tagihanResult").innerHTML = "";

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
      const record = billData[cat][value];
      if (!record) {
        showToast("Nomor pelanggan tidak ditemukan. Periksa kembali nomor Anda.", "error");
        el("tagihanResult").innerHTML =
          '<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Data untuk "' + value + '" tidak ditemukan pada kategori ini.</div>';
        return;
      }
      renderTagihanResult(cat, value, record);
    }, 900 + Math.random() * 400);
  });

  function renderTagihanResult(cat, code, record) {
    const total = record.amount + (record.penalty || 0);
    el("tagihanResult").innerHTML =
      '<div class="result-card">' +
      '<div class="result-row"><span>Nama Pelanggan</span><span>' + record.name + "</span></div>" +
      '<div class="result-row"><span>Info</span><span>' + record.info + "</span></div>" +
      '<div class="result-row"><span>Tagihan Pokok</span><span>' + formatRupiah(record.amount) + "</span></div>" +
      (record.penalty ? '<div class="result-row"><span>Denda Keterlambatan</span><span>' + formatRupiah(record.penalty) + "</span></div>" : "") +
      '<div class="result-row"><span>Jatuh Tempo</span><span>' + formatDate(record.dueDate) + "</span></div>" +
      '<div class="result-total"><span>Total Bayar</span><strong>' + formatRupiah(total) + "</strong></div>" +
      '<button class="btn btn-primary btn-block" id="lanjutTagihanBtn"><i class="fa-solid fa-arrow-right"></i> Lanjutkan ke Pembayaran</button>' +
      "</div>";

    el("lanjutTagihanBtn").addEventListener("click", () => {
      const catLabel = { pln: "Listrik PLN", pdam: "PDAM", internet: "Internet", seminar: "Seminar/Event" }[cat];
      state.pendingPayment = {
        kategori: cat,
        deskripsi: catLabel + " — " + record.name,
        nomor: code,
        amount: total,
        meta: { info: record.info },
      };
      openPaymentModal();
    });
  }

  /* =========================================================
     6. BIAYA KULIAH / SPP
     ========================================================= */
  el("nimForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const nim = el("nimInput").value.trim();
    const errorEl = el("nimError");
    if (!/^[0-9]{6,15}$/.test(nim)) {
      errorEl.textContent = "NIM harus berupa angka, minimal 6 digit.";
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;

    const btn = el("cekNimBtn");
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memuat...';
    el("sppResult").innerHTML = "";

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = original;
      const mhs = sppData[nim];
      if (!mhs) {
        showToast("NIM tidak terdaftar di sistem.", "error");
        el("sppResult").innerHTML = '<div class="empty-state"><i class="fa-solid fa-user-slash"></i>NIM "' + nim + '" tidak ditemukan.</div>';
        return;
      }
      renderSppResult(nim, mhs);
    }, 900);
  });

  function renderSppResult(nim, mhs) {
    const rows = mhs.cicilan.map((c) => {
      const isPaid = c.status === "paid";
      return (
        '<tr class="' + (isPaid ? "is-paid" : "") + '" data-id="' + c.id + '" data-amount="' + c.amount + '">' +
        '<td><input type="checkbox" class="spp-check" ' + (isPaid ? "disabled" : "") + ' aria-label="Pilih cicilan ' + c.id + '"></td>' +
        "<td>" + c.desc + '<br><small class="mono" style="color:var(--muted)">Kode: ' + c.kode + "</small></td>" +
        '<td class="amount-cell">' + formatRupiah(c.amount) + "</td>" +
        "<td>" + (isPaid ? '<span class="badge badge-ok">Lunas</span>' : '<span class="badge badge-warn">Belum Lunas</span>') + "</td>" +
        "</tr>"
      );
    }).join("");

    el("sppResult").innerHTML =
      '<div class="result-card">' +
      '<div class="spp-header"><div><strong>' + mhs.mahasiswa + "</strong><br><small style='color:var(--muted)'>" + mhs.prodi + " · NIM " + nim + " · " + mhs.semester + "</small></div>" +
      '<button class="btn btn-secondary" id="selectAllSpp"><i class="fa-solid fa-list-check"></i> Pilih Semua Belum Lunas</button></div>' +
      '<div style="overflow-x:auto;"><table class="spp-table"><thead><tr><th></th><th>Deskripsi</th><th>Jumlah</th><th>Status</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<div class="spp-sticky-total"><span>Total Terpilih</span><strong class="mono" id="sppTotal">Rp0</strong></div>' +
      '<button class="btn btn-primary btn-block" id="bayarSppBtn" style="margin-top:1rem;" disabled><i class="fa-solid fa-arrow-right"></i> Bayar Cicilan Terpilih</button>' +
      "</div>";

    function updateSppTotal() {
      const checked = qsa(".spp-check:checked", el("sppResult"));
      const total = checked.reduce((sum, cb) => sum + Number(cb.closest("tr").dataset.amount), 0);
      el("sppTotal").textContent = formatRupiah(total);
      el("bayarSppBtn").disabled = total === 0;
      return { total, checked };
    }

    qsa(".spp-check", el("sppResult")).forEach((cb) => cb.addEventListener("change", updateSppTotal));

    el("selectAllSpp").addEventListener("click", () => {
      qsa(".spp-check", el("sppResult")).forEach((cb) => { if (!cb.disabled) cb.checked = true; });
      updateSppTotal();
    });

    el("bayarSppBtn").addEventListener("click", () => {
      const { total, checked } = updateSppTotal();
      if (total === 0) return;
      state.pendingPayment = {
        kategori: "spp",
        deskripsi: "Biaya Kuliah — " + mhs.mahasiswa + " (" + checked.length + " item)",
        nomor: nim,
        amount: total,
        meta: { info: mhs.semester },
      };
      openPaymentModal();
    });
  }

  el("cekKodeBtn").addEventListener("click", () => {
    const kode = el("kodeTagihanInput").value.trim();
    const resultEl = el("kodeResult");
    if (!kode) {
      resultEl.innerHTML = '<p class="field-error">Masukkan kode tagihan terlebih dahulu.</p>';
      return;
    }
    let found = null;
    let foundNim = null;
    Object.entries(sppData).forEach(([nim, mhs]) => {
      mhs.cicilan.forEach((c) => {
        if (c.kode === kode) { found = c; foundNim = nim; }
      });
    });
    if (!found) {
      resultEl.innerHTML = '<div class="empty-state" style="padding:1.5rem"><i class="fa-solid fa-magnifying-glass"></i>Kode tagihan tidak ditemukan.</div>';
      return;
    }
    resultEl.innerHTML =
      '<div class="result-card" style="margin-top:.9rem;">' +
      '<div class="result-row"><span>Kode Tagihan</span><span class="mono">' + found.kode + "</span></div>" +
      '<div class="result-row"><span>NIM</span><span>' + foundNim + "</span></div>" +
      '<div class="result-row"><span>Deskripsi</span><span>' + found.desc + "</span></div>" +
      '<div class="result-row"><span>Jumlah</span><span>' + formatRupiah(found.amount) + "</span></div>" +
      '<div class="result-row"><span>Status</span><span>' + (found.status === "paid" ? '<span class="badge badge-ok">Lunas</span>' : '<span class="badge badge-warn">Belum Lunas</span>') + "</span></div>" +
      "</div>";
  });

  /* =========================================================
     7. ISI PULSA & PAKET DATA
     ========================================================= */
  function renderProviderGrid() {
    el("providerGrid").innerHTML = Object.entries(providerData).map(([key, p]) =>
      '<button type="button" class="provider-item" data-provider="' + key + '">' +
      '<span class="dot" style="background:' + p.color + '"></span><span>' + p.label + "</span></button>"
    ).join("");
    qsa(".provider-item", el("providerGrid")).forEach((btn) => {
      btn.addEventListener("click", () => selectProvider(btn.dataset.provider, false));
    });
  }

  function detectProvider(phone) {
    const prefix = phone.slice(0, 4);
    for (const [key, p] of Object.entries(providerData)) {
      if (p.prefixes.includes(prefix)) return key;
    }
    return null;
  }

  function selectProvider(key, autoDetected) {
    state.selectedProvider = key;
    qsa(".provider-item", el("providerGrid")).forEach((btn) => {
      const active = btn.dataset.provider === key;
      btn.classList.toggle("is-active", active);
      btn.classList.toggle("is-detected", active && autoDetected);
    });
    renderNominalOrPaket();
    validatePulsaForm();
  }

  function renderNominalGrid() {
    el("nominalGrid").innerHTML = pulsaNominal.map((n) =>
      '<button type="button" class="nominal-chip" data-nominal="' + n + '">' + formatRupiah(n) + "</button>"
    ).join("") + '<input type="number" class="text-input nominal-custom" id="customNominal" placeholder="Nominal lain (Rp)" min="1000" step="1000">';

    qsa(".nominal-chip", el("nominalGrid")).forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedNominal = Number(btn.dataset.nominal);
        el("customNominal").value = "";
        qsa(".nominal-chip", el("nominalGrid")).forEach((b) => b.classList.toggle("is-active", b === btn));
        validatePulsaForm();
      });
    });
    el("customNominal").addEventListener("input", (e) => {
      const val = Number(e.target.value);
      state.selectedNominal = val > 0 ? val : null;
      qsa(".nominal-chip", el("nominalGrid")).forEach((b) => b.classList.remove("is-active"));
      validatePulsaForm();
    });
  }

  function renderPaketList() {
    const list = state.selectedProvider ? paketData[state.selectedProvider] : [];
    el("paketList").innerHTML = list.map((p, i) =>
      '<button type="button" class="paket-item" data-idx="' + i + '"><span>' + p.label + '</span><span class="price">' + formatRupiah(p.price) + "</span></button>"
    ).join("") || '<p class="field-hint">Pilih provider terlebih dahulu.</p>';

    qsa(".paket-item", el("paketList")).forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedPaket = list[Number(btn.dataset.idx)];
        qsa(".paket-item", el("paketList")).forEach((b) => b.classList.toggle("is-active", b === btn));
        validatePulsaForm();
      });
    });
  }

  function renderNominalOrPaket() {
    if (state.pulsaType === "pulsa") {
      el("nominalWrap").hidden = false;
      el("paketWrap").hidden = true;
      renderNominalGrid();
    } else {
      el("nominalWrap").hidden = true;
      el("paketWrap").hidden = false;
      renderPaketList();
    }
  }

  qsa(".type-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.pulsaType = chip.dataset.type;
      state.selectedNominal = null;
      state.selectedPaket = null;
      qsa(".type-chip").forEach((c) => c.classList.toggle("is-active", c === chip));
      renderNominalOrPaket();
      validatePulsaForm();
    });
  });

  function validatePulsaForm() {
    const phone = el("phoneInput").value.trim();
    const phoneValid = /^08[0-9]{8,11}$/.test(phone);
    const hasProvider = !!state.selectedProvider;
    const hasAmount = state.pulsaType === "pulsa" ? !!state.selectedNominal && state.selectedNominal >= 1000 : !!state.selectedPaket;
    el("lanjutPulsaBtn").disabled = !(phoneValid && hasProvider && hasAmount);
    return phoneValid;
  }

  el("phoneInput").addEventListener("input", (e) => {
    const phone = e.target.value.trim();
    const errorEl = el("phoneError");
    if (phone.length >= 4) {
      const detected = detectProvider(phone);
      if (detected) selectProvider(detected, true);
    }
    if (phone && !/^08[0-9]{8,11}$/.test(phone)) {
      errorEl.textContent = "Nomor HP harus 10-13 digit dan diawali 08.";
      errorEl.hidden = false;
      e.target.classList.add("error");
    } else {
      errorEl.hidden = true;
      e.target.classList.remove("error");
    }
    validatePulsaForm();
  });

  el("pulsaForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validatePulsaForm()) return;
    const phone = el("phoneInput").value.trim();
    const provider = providerData[state.selectedProvider];
    const amount = state.pulsaType === "pulsa" ? state.selectedNominal : state.selectedPaket.price;
    const desc = state.pulsaType === "pulsa"
      ? "Pulsa " + provider.label + " " + formatRupiah(state.selectedNominal)
      : "Paket Data " + provider.label + " — " + state.selectedPaket.label;

    state.pendingPayment = {
      kategori: "pulsa",
      deskripsi: desc,
      nomor: phone,
      amount: amount,
      meta: { provider: provider.label },
    };
    openPaymentModal();
  });

  /* =========================================================
     8. MODAL PEMBAYARAN (VA / QRIS / Teller)
     ========================================================= */
  function openPaymentModal() {
    const p = state.pendingPayment;
    el("pmSummary").innerHTML =
      "<div>" + p.deskripsi + "</div><div style='color:var(--muted);font-size:.8rem;margin:.2rem 0 .6rem;' class='mono'>No/Ref: " + p.nomor + "</div>" +
      '<div class="pm-total">' + formatRupiah(p.amount) + "</div>";
    // Tidak ada metode yang dipilih otomatis — pengguna WAJIB memilih salah satu.
    state.selectedMethod = null;
    qsa(".pm-option").forEach((o) => o.classList.remove("is-active"));
    el("pmContent").innerHTML =
      '<div class="empty-state" style="padding:1.6rem 1rem;"><i class="fa-solid fa-hand-pointer"></i>Pilih salah satu metode pembayaran di atas untuk melanjutkan.</div>';
    el("bayarSekarangBtn").disabled = true;
    openModal("paymentModal");
  }

  qsa(".pm-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      state.selectedMethod = opt.dataset.method;
      qsa(".pm-option").forEach((o) => o.classList.toggle("is-active", o === opt));
      el("bayarSekarangBtn").disabled = false;
      renderPaymentMethodContent();
    });
  });

  function renderPaymentMethodContent() {
    clearInterval(state.qrisTimerInterval);
    const content = el("pmContent");
    const p = state.pendingPayment;

    if (state.selectedMethod === "va") {
      content.innerHTML =
        '<div class="bank-select">' + bankList.map((b) =>
          '<button type="button" class="bank-chip" data-bank="' + b.code + '">' + b.label.replace(" Virtual Account", "") + "</button>"
        ).join("") + "</div>" +
        '<div class="va-box"><div style="font-size:.78rem;color:var(--muted)">Nomor Virtual Account</div>' +
        '<div class="va-number" id="vaNumberDisplay"></div>' +
        '<button type="button" class="va-copy" id="copyVaBtn"><i class="fa-regular fa-copy"></i> Salin Nomor</button></div>' +
        '<p class="field-hint">Transfer sesuai nominal tagihan melalui ATM, m-Banking, atau internet banking bank pilihan.</p>';

      const bankChips = qsa(".bank-chip", content);
      function pickBank(code) {
        state.selectedBank = code;
        bankChips.forEach((c) => c.classList.toggle("is-active", c.dataset.bank === code));
        const bank = bankList.find((b) => b.code === code);
        el("vaNumberDisplay").textContent = generateVA(bank.prefix, p.nomor + Date.now());
      }
      bankChips.forEach((chip) => chip.addEventListener("click", () => pickBank(chip.dataset.bank)));
      pickBank(state.selectedBank);

      el("copyVaBtn").addEventListener("click", () => {
        const num = el("vaNumberDisplay").textContent;
        navigator.clipboard?.writeText(num).catch(() => {});
        showToast("Nomor VA disalin.", "info");
      });
    }

    if (state.selectedMethod === "qris") {
      content.innerHTML =
        '<div class="qris-box"><div id="qrisCanvas"></div>' +
        '<p style="margin:.7rem 0 0;font-size:.8rem;color:var(--muted)">Pindai kode QR menggunakan aplikasi e-wallet atau m-Banking mana pun.</p>' +
        '<div class="qris-timer" id="qrisTimer">05:00</div></div>';

      new QRCode(el("qrisCanvas"), {
        text: "LUNASIN|QRIS|" + p.nomor + "|" + p.amount + "|" + generateId(),
        width: 168,
        height: 168,
      });

      let seconds = 300;
      const timerEl = el("qrisTimer");
      state.qrisTimerInterval = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
          clearInterval(state.qrisTimerInterval);
          timerEl.textContent = "Kedaluwarsa";
          showToast("Kode QRIS kedaluwarsa, silakan ulangi.", "error");
          return;
        }
        const m = String(Math.floor(seconds / 60)).padStart(2, "0");
        const s = String(seconds % 60).padStart(2, "0");
        timerEl.textContent = m + ":" + s;
      }, 1000);
    }

    if (state.selectedMethod === "teller") {
      const kode = "TL-" + generateId().slice(3);
      content.innerHTML =
        '<div class="teller-code"><div style="font-size:.78rem;color:var(--muted)">Kode Pembayaran</div>' +
        '<div class="va-number">' + kode + "</div>" +
        '<p class="field-hint" style="margin-top:.4rem;">Tunjukkan kode ini ke petugas loket pembayaran.</p></div>' +
        '<p class="field-label">Lokasi Terdekat</p>' +
        "<ul class='teller-list'>" + tellerLocations.map((t) =>
          "<li><span class='t-name'>" + t.name + "</span><span class='t-addr'>" + t.address + " · " + t.hours + "</span></li>"
        ).join("") + "</ul>";
    }
  }

  el("closePaymentModal").addEventListener("click", () => {
    clearInterval(state.qrisTimerInterval);
    closeModal("paymentModal");
  });

  el("bayarSekarangBtn").addEventListener("click", () => {
    if (!state.selectedMethod) {
      showToast("Silakan pilih metode pembayaran terlebih dahulu.", "error");
      return;
    }
    clearInterval(state.qrisTimerInterval);
    closeModal("paymentModal");
    processPayment();
  });

  function processPayment() {
    openModal("loadingModal");
    el("loadingText").textContent = "Memproses pembayaran...";
    setTimeout(() => {
      closeModal("loadingModal");
      finalizePayment();
    }, 1200 + Math.random() * 600);
  }

  function finalizePayment() {
    const p = state.pendingPayment;
    const methodLabel = { va: "Virtual Account", qris: "QRIS", teller: "Bayar di Teller" }[state.selectedMethod];
    const tx = {
      id: generateId(),
      kategori: p.kategori,
      desc: p.deskripsi,
      nomor: p.nomor,
      amount: p.amount,
      method: methodLabel,
      date: new Date().toISOString(),
      status: "success",
    };
    state.transactions.unshift(tx);
    if (state.balance >= p.amount) state.balance -= p.amount;
    persist();

    showToast("Pembayaran berhasil!", "success");
    renderReceipt(tx);
    openModal("receiptModal");
    refreshDashboard();
  }

  /* =========================================================
     9. STRUK / RECEIPT
     ========================================================= */
  function renderReceipt(tx) {
    el("receiptContent").innerHTML =
      '<div class="receipt-brand"><strong>Mudah Bayar</strong><br><small style="color:var(--muted)">Bukti Pembayaran Elektronik</small></div>' +
      '<div class="receipt-divider"></div>' +
      '<div class="receipt-row"><span>No. Transaksi</span><span>' + tx.id + "</span></div>" +
      '<div class="receipt-row"><span>Tanggal</span><span>' + new Date(tx.date).toLocaleString("id-ID") + "</span></div>" +
      '<div class="receipt-row"><span>Kategori</span><span>' + tx.desc + "</span></div>" +
      '<div class="receipt-row"><span>No/Ref</span><span>' + tx.nomor + "</span></div>" +
      '<div class="receipt-row"><span>Metode</span><span>' + tx.method + "</span></div>" +
      '<div class="receipt-divider"></div>' +
      '<div class="receipt-total"><span>Total Dibayar</span><span>' + formatRupiah(tx.amount) + "</span></div>" +
      '<div class="stamp-wrap"><div class="stamp"><span class="stamp-text">LUNAS<br>Mudah Bayar</span></div></div>' +
      '<p style="text-align:center;color:var(--muted);font-size:.72rem;margin-top:.5rem;">Simpan struk ini sebagai bukti pembayaran yang sah (simulasi).</p>';
  }

  el("closeReceiptModal").addEventListener("click", () => closeModal("receiptModal"));
  el("doneReceiptBtn").addEventListener("click", () => closeModal("receiptModal"));
  el("printReceiptBtn").addEventListener("click", () => window.print());

  /* =========================================================
     10. RIWAYAT TRANSAKSI
     ========================================================= */
  function renderHistory() {
    const catFilter = el("filterKategori").value;
    const search = el("filterSearch").value.trim().toLowerCase();

    let list = state.transactions;
    if (catFilter !== "all") list = list.filter((t) => t.kategori === catFilter);
    if (search) list = list.filter((t) => t.desc.toLowerCase().includes(search) || t.nomor.toLowerCase().includes(search));

    if (!list.length) {
      el("historyTableWrap").innerHTML = '<div class="empty-state"><i class="fa-solid fa-inbox"></i>Tidak ada transaksi yang cocok.</div>';
      return;
    }

    el("historyTableWrap").innerHTML =
      '<div style="overflow-x:auto;"><table class="history-table"><thead><tr>' +
      "<th>Tanggal</th><th>Deskripsi</th><th>No/Ref</th><th>Jumlah</th><th>Metode</th><th>Status</th>" +
      "</tr></thead><tbody>" +
      list.map((t) =>
        "<tr><td>" + formatDate(t.date) + "</td><td>" + t.desc + "</td><td class='mono'>" + t.nomor + "</td><td class='mono'>" +
        formatRupiah(t.amount) + "</td><td>" + t.method + "</td><td><span class='status-pill status-success'>Berhasil</span></td></tr>"
      ).join("") +
      "</tbody></table></div>";
  }

  el("filterKategori").addEventListener("change", renderHistory);
  el("filterSearch").addEventListener("input", renderHistory);
  el("clearHistoryBtn").addEventListener("click", () => {
    if (!state.transactions.length) { showToast("Riwayat sudah kosong.", "info"); return; }
    if (confirm("Hapus semua riwayat transaksi? Tindakan ini tidak dapat dibatalkan.")) {
      state.transactions = [];
      persist();
      renderHistory();
      renderRecentTx();
      showToast("Riwayat transaksi dihapus.", "success");
    }
  });

  /* =========================================================
     11. PROFIL
     ========================================================= */
  function loadProfile() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.profile) || "null");
    if (saved) {
      el("profileName").value = saved.name;
      el("profileEmail").value = saved.email;
    }
  }
  el("saveProfileBtn").addEventListener("click", () => {
    const name = el("profileName").value.trim();
    const email = el("profileEmail").value.trim();
    if (!name || !email) { showToast("Nama dan email tidak boleh kosong.", "error"); return; }
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify({ name, email }));
    showToast("Profil disimpan.", "success");
  });

  /* =========================================================
     12. FAQ
     ========================================================= */
  const faqs = [
    { q: "Apakah aplikasi ini memproses uang sungguhan?", a: "Tidak. Mudah Bayar adalah aplikasi simulasi untuk keperluan pembelajaran, seluruh saldo dan transaksi bersifat fiktif dan tersimpan di perangkat Anda sendiri (localStorage)." },
    { q: "Bagaimana cara mengecek tagihan?", a: "Buka menu Bayar Tagihan, pilih kategori (Listrik, PDAM, Internet, atau Seminar), masukkan nomor pelanggan, lalu tekan Cek Tagihan." },
    { q: "Kenapa nomor pelanggan saya tidak ditemukan?", a: "Aplikasi ini hanya mengenali data contoh yang sudah disiapkan. Gunakan salah satu nomor pada dokumentasi/README untuk mencoba fitur secara penuh." },
    { q: "Apakah riwayat transaksi bisa dihapus?", a: "Bisa. Buka menu Riwayat lalu tekan tombol Hapus Semua. Tindakan ini akan menghapus seluruh data transaksi di perangkat Anda." },
    { q: "Bagaimana cara mencetak struk pembayaran?", a: "Setelah pembayaran berhasil, tekan tombol Cetak Struk pada jendela bukti pembayaran untuk membuka dialog cetak browser." },
  ];
  function renderFaq() {
    el("faqList").innerHTML = faqs.map((f) =>
      '<details class="faq-item"><summary>' + f.q + "</summary><p>" + f.a + "</p></details>"
    ).join("");
  }

  /* =========================================================
     13. INISIALISASI
     ========================================================= */
  function init() {
    renderProviderGrid();
    renderNominalGrid();
    refreshDashboard();
    renderFaq();
    loadProfile();
    validatePulsaForm();
  }

  init();
})();
