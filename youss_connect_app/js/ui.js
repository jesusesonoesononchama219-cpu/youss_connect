/* =========================================================
   YOUSS CONNECT — SHARED UI HELPERS
   Visual language aligned to Dynasty KYA mockups.
   ========================================================= */
(function () {
  "use strict";

  function icon(name, cls, fill) {
    return `<span class="material-symbols-outlined ${cls || ""} ${fill ? "fill-icon" : ""}">${name}</span>`;
  }

  /* La hora, la señal y la batería las muestra el teléfono.
     No se dibuja una barra de estado falsa (aspecto de captura). */
  function statusBar() {
    return "";
  }

  const I18N = {
    fr: {
      nav_home: "Accueil", nav_activities: "Activités", nav_scan: "Scan", nav_messages: "Messages", nav_profile: "Profil",
      hello: "Bonjour", wallet: "Solde Youss Wallet", wallet_btn: "Portefeuille",
      tile_transport: "Transport", tile_delivery: "Livraison", tile_hotels: "Hôtels", tile_tourism: "Tourisme",
      more_rides: "Courses planifiées", more_addr: "Adresses favorites", more_bonus: "Youss Bonus", more_plus: "Plus",
      banner_kicker: "Culture & Tourisme · Bénin", banner_title: "Abomey, Ouidah, Ganvié, Place de l'Amazone…", banner_scan: "Scanner",
      lang_title: "Langue", lang_fr: "Français", lang_en: "English", lang_fon: "Fon", lang_yo: "Yorùbá",
      lang_done: "Langue : Français", settings_lang: "Langue"
    },
    en: {
      nav_home: "Home", nav_activities: "Activity", nav_scan: "Scan", nav_messages: "Messages", nav_profile: "Profile",
      hello: "Hello", wallet: "Youss Wallet balance", wallet_btn: "Wallet",
      tile_transport: "Transport", tile_delivery: "Delivery", tile_hotels: "Hotels", tile_tourism: "Tourism",
      more_rides: "Scheduled rides", more_addr: "Saved addresses", more_bonus: "Youss Bonus", more_plus: "More",
      banner_kicker: "Culture & Tourism · Benin", banner_title: "Abomey, Ouidah, Ganvié, Place de l'Amazone…", banner_scan: "Scan",
      lang_title: "Language", lang_fr: "Français", lang_en: "English", lang_fon: "Fon", lang_yo: "Yorùbá",
      lang_done: "Language: English", settings_lang: "Language"
    },
    fon: {
      nav_home: "Aigba", nav_activities: "Azɔ lɛɛ", nav_scan: "Scan", nav_messages: "Wɛn lɛɛ", nav_profile: "Nyɛ",
      hello: "Nú mi", wallet: "Youss Wallet sin akwɛ́", wallet_btn: "Akwɛ́",
      tile_transport: "Zɔnlin", tile_delivery: "Nusɔ́", tile_hotels: "Xɔ lɛɛ", tile_tourism: "Yɛyi",
      more_rides: "Zɔnlin ɖó", more_addr: "Tɛn sín", more_bonus: "Youss Bonus", more_plus: "Dɛvo",
      banner_kicker: "Kultu & Yɛyi · Benɛ", banner_title: "Abomey, Xwéda, Ganvié, Amazone sin tɛn…", banner_scan: "Scan",
      lang_title: "Gbè", lang_fr: "Français", lang_en: "English", lang_fon: "Fon", lang_yo: "Yorùbá",
      lang_done: "Gbè : Fon", settings_lang: "Gbè"
    },
    yo: {
      nav_home: "Ilé", nav_activities: "Àwọn iṣẹ́", nav_scan: "Scan", nav_messages: "Ìránṣẹ́", nav_profile: "Prófaìlì",
      hello: "Pẹ̀lẹ́", wallet: "Owó Youss Wallet", wallet_btn: "Àpò",
      tile_transport: "Ìrìnàjò", tile_delivery: "Ìfijíṣẹ́", tile_hotels: "Ilé ìtura", tile_tourism: "Ìrìnàjò",
      more_rides: "Ìrìnàjò tí a ṣètò", more_addr: "Àwọn àdírẹ́sì", more_bonus: "Youss Bonus", more_plus: "Siwaju",
      banner_kicker: "Àṣà & Ìrìnàjò · Benin", banner_title: "Abomey, Ouidah, Ganvié, Place de l'Amazone…", banner_scan: "Scan",
      lang_title: "Èdè", lang_fr: "Français", lang_en: "English", lang_fon: "Fon", lang_yo: "Yorùbá",
      lang_done: "Èdè : Yorùbá", settings_lang: "Èdè"
    }
  };

  let appLang = "fr";
  try { appLang = localStorage.getItem("yc-lang") || "fr"; } catch (e) { /* navigation privée */ }
  if (!I18N[appLang]) appLang = "fr";

  function t(key) {
    const pack = I18N[appLang] || I18N.fr;
    return pack[key] || I18N.fr[key] || key;
  }

  function lang() { return appLang; }

  function setLang(id) {
    if (!I18N[id] || id === appLang) {
      if (I18N[id]) toast(t("lang_done"), "info");
      return;
    }
    appLang = id;
    try { localStorage.setItem("yc-lang", id); } catch (e) { /* no-op */ }
    document.documentElement.lang = id === "en" ? "en" : "fr";
    toast(t("lang_done"), "success");
    if (window.ACStore) ACStore.emit();
  }

  function langNames() {
    return [
      { id: "fr", label: "Français" },
      { id: "en", label: "English" },
      { id: "fon", label: "Fon" },
      { id: "yo", label: "Yorùbá" }
    ];
  }

  function topBar({ title, subtitle, back, right }) {
    return `
    <div class="w-full px-space-20 py-space-12 flex items-center justify-between bg-surface/95 backdrop-blur-sm flex-shrink-0 border-b border-outline-variant/20">
      <div class="flex items-center space-x-3 min-w-0">
        ${back ? `<button onclick="${back}" class="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/25 shadow-sm flex items-center justify-center text-on-surface active:scale-95 transition-transform flex-shrink-0">${icon("arrow_back")}</button>` : ""}
        <div class="flex flex-col min-w-0">
          <h1 class="font-headline-sm text-headline-sm font-bold text-on-surface truncate">${title}</h1>
          ${subtitle ? `<p class="font-body-sm text-body-sm text-on-surface-variant truncate">${subtitle}</p>` : ""}
        </div>
      </div>
      <div class="flex items-center space-x-2 flex-shrink-0">${right || ""}</div>
    </div>`;
  }

  function bottomNav(active) {
    const side = (id, label, ic) => `
      <a href="javascript:void(0)" onclick="App.nav('${id}')"
        class="flex flex-col items-center justify-center w-14 ${active === id ? "text-primary font-semibold" : "text-on-surface-variant"} py-space-4 active:scale-95 transition-transform duration-150">
        ${icon(ic, "text-[24px]", active === id)}
        <span class="font-label-sm text-label-sm mt-1 tracking-wide">${label}</span>
      </a>`;
    return `
    <nav class="w-full bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/25 px-space-4 pt-space-4 pb-space-8 shadow-[0_-8px_28px_rgba(59,20,102,.08)] flex-shrink-0">
      <div class="flex items-end justify-between w-full px-space-8">
        ${side("home", t("nav_home"), "home")}
        ${side("activities", t("nav_activities"), "receipt_long")}
        <a href="javascript:void(0)" onclick="App.nav('culturalScanner')"
          class="flex flex-col items-center justify-center active:scale-95 transition-transform" aria-label="Scanner">
          <span class="yc-nav-fab">${icon("qr_code_scanner", "text-[28px]", true)}</span>
          <span class="font-label-sm text-label-sm mt-1 tracking-wide ${active === "culturalScanner" || active === "culture" ? "text-primary font-semibold" : "text-on-surface-variant"}">${t("nav_scan")}</span>
        </a>
        ${side("notifications", t("nav_messages"), "chat_bubble")}
        ${side("profile", t("nav_profile"), "person")}
      </div>
      <div class="w-28 h-1 bg-outline-variant/40 rounded-full mx-auto mt-2"></div>
    </nav>`;
  }

  function primaryButton(label, onclick, opts) {
    opts = opts || {};
    const disabled = opts.disabled ? "opacity-40 pointer-events-none" : "";
    const green = "bg-primary-container text-on-primary shadow-[0_8px_20px_rgba(59,20,102,.22)] active:bg-primary";
    return `<button onclick="${onclick}" class="w-full h-12 rounded-2xl ${green} font-label-lg text-label-lg font-bold transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] ${disabled}">
      <span>${label}</span>${opts.icon ? icon(opts.icon, "text-[18px]") : ""}
    </button>`;
  }

  function secondaryButton(label, onclick) {
    return `<button onclick="${onclick}" class="w-full h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-label-lg text-label-lg font-semibold shadow-sm active:scale-[0.98] transition-transform duration-150 flex items-center justify-center gap-2">${label}</button>`;
  }

  function badge(text, tone) {
    const tones = {
      success: "bg-tertiary-container/15 text-tertiary",
      primary: "bg-primary-container text-on-primary",
      warn: "bg-error-container text-on-error-container",
      neutral: "bg-surface-container-high text-on-surface-variant"
    };
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full ${tones[tone] || tones.neutral} font-label-sm text-label-sm font-semibold">${text}</span>`;
  }

  let toastTimer = null;
  function toast(message, tone) {
    let el = document.getElementById("ac-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "ac-toast";
      document.body.appendChild(el);
    }
    const tones = {
      success: "bg-tertiary text-on-tertiary",
      error: "bg-error text-on-error",
      info: "bg-inverse-surface text-inverse-on-surface"
    };
    el.className = "toast fixed left-1/2 -translate-x-1/2 bottom-28 z-[999] px-4 py-3 rounded-2xl shadow-[0_12px_32px_rgba(26,18,40,.25)] font-label-md text-label-md font-semibold text-center max-w-[320px] " + (tones[tone] || tones.info);
    el.textContent = message;
    el.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.style.opacity = "0"; }, 2200);
  }

  function openSheet(innerHtml) {
    let overlay = document.getElementById("ac-sheet-overlay");
    if (overlay) overlay.remove();
    overlay = document.createElement("div");
    overlay.id = "ac-sheet-overlay";
    overlay.className = "fixed inset-0 z-[900] flex items-end justify-center";
    overlay.innerHTML = `
      <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onclick="UI.closeSheet()"></div>
      <div class="relative w-full max-w-max-width-mobile bg-surface-container-lowest rounded-t-3xl p-space-20 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div class="w-10 h-1.5 bg-outline-variant/60 rounded-full mx-auto mb-4"></div>
        ${innerHtml}
      </div>`;
    document.body.appendChild(overlay);
  }

  function closeSheet() {
    const overlay = document.getElementById("ac-sheet-overlay");
    if (overlay) overlay.remove();
  }

  function emptyState({ icon: ic, title, body, actionLabel, actionOnclick }) {
    return `
    <div class="flex-1 flex flex-col items-center justify-center text-center px-space-32 py-space-40">
      <div class="w-20 h-20 rounded-full bg-gradient-to-br from-surface-container-low to-surface-container flex items-center justify-center text-primary mb-space-16 shadow-sm">
        ${icon(ic, "text-[40px]")}
      </div>
      <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-8">${title}</h3>
      <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-20 max-w-[260px] leading-relaxed">${body}</p>
      ${actionLabel ? primaryButton(actionLabel, actionOnclick, { icon: "arrow_forward", green: true }) : ""}
    </div>`;
  }

  function skeletonBoot() {
    return `
    ${statusBar()}
    <div class="w-full px-space-20 py-space-12 flex items-center justify-between">
      <div class="flex flex-col space-y-2">
        <div class="h-4 w-32 bg-surface-container-high rounded animate-pulse"></div>
        <div class="h-3 w-44 bg-surface-container-high rounded animate-pulse"></div>
      </div>
      <div class="w-10 h-10 rounded-full bg-surface-container-high animate-pulse"></div>
    </div>
    <main class="flex-1 flex flex-col space-y-space-20 px-space-20">
      <div class="h-12 w-full bg-surface-container-high rounded-xl animate-pulse"></div>
      <div class="h-28 w-full bg-surface-container-high rounded-xl animate-pulse"></div>
      <div class="grid grid-cols-3 gap-3">
        ${Array.from({ length: 6 }).map(() => `<div class="h-20 bg-surface-container-high rounded-xl animate-pulse"></div>`).join("")}
      </div>
    </main>`;
  }

  function initOfflineBanner() {
    let banner = document.getElementById("ac-offline-banner");
    function render() {
      const offline = !navigator.onLine;
      if (offline && !banner) {
        banner = document.createElement("div");
        banner.id = "ac-offline-banner";
        banner.className = "fixed top-0 left-0 right-0 z-[1000] bg-inverse-surface text-inverse-on-surface text-center font-label-sm text-label-sm py-2";
        banner.textContent = "Hors ligne — certaines actions sont temporairement indisponibles.";
        document.body.appendChild(banner);
      } else if (!offline && banner) {
        banner.remove();
        banner = null;
      }
    }
    window.addEventListener("online", render);
    window.addEventListener("offline", render);
    render();
  }

  window.UI = { icon, statusBar, topBar, bottomNav, primaryButton, secondaryButton, badge, toast, openSheet, closeSheet, emptyState, skeletonBoot, initOfflineBanner, t, lang, setLang, langNames };
})();
