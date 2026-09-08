/* =========================================================
   AFRICA CONNECT — SHARED UI HELPERS
   Small template-string components reused across every screen
   so the visual language stays identical everywhere.
   ========================================================= */
(function () {
  "use strict";

  function icon(name, cls, fill) {
    return `<span class="material-symbols-outlined ${cls || ""} ${fill ? "fill-icon" : ""}">${name}</span>`;
  }

  function statusBar() {
    return `
    <header class="w-full h-11 px-space-20 flex items-center justify-between text-on-surface select-none pt-space-2 z-50 flex-shrink-0">
      <span class="font-label-md text-label-md font-semibold tracking-tight">9:41</span>
      <div class="flex items-center space-x-1.5">
        ${icon("signal_cellular_alt", "text-[16px]")}
        ${icon("wifi", "text-[16px]")}
        ${icon("battery_full", "text-[20px]")}
      </div>
    </header>`;
  }

  function topBar({ title, subtitle, back, right }) {
    return `
    <div class="w-full px-space-20 py-space-12 flex items-center justify-between bg-surface flex-shrink-0">
      <div class="flex items-center space-x-3 min-w-0">
        ${back ? `<button onclick="${back}" class="w-9 h-9 rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface active:scale-95 transition-transform flex-shrink-0">${icon("arrow_back")}</button>` : ""}
        <div class="flex flex-col min-w-0">
          <h1 class="font-headline-sm text-headline-sm font-bold text-on-surface truncate">${title}</h1>
          ${subtitle ? `<p class="font-body-sm text-body-sm text-on-surface-variant truncate">${subtitle}</p>` : ""}
        </div>
      </div>
      <div class="flex items-center space-x-2 flex-shrink-0">${right || ""}</div>
    </div>`;
  }

  function bottomNav(active) {
    const items = [
      { id: "home", label: "Accueil", icon: "home" },
      { id: "explorer", label: "Explorer", icon: "explore" },
      { id: "activities", label: "Activités", icon: "schedule" },
      { id: "wallet", label: "Wallet", icon: "account_balance_wallet" },
      { id: "profile", label: "Profil", icon: "person" }
    ];
    return `
    <nav class="w-full bg-surface-container-lowest border-t border-outline-variant/30 px-space-8 py-space-8 shadow-md flex-shrink-0">
      <div class="flex items-center justify-around w-full">
        ${items.map(it => `
          <a href="javascript:void(0)" onclick="App.nav('${it.id}')" class="flex flex-col items-center justify-center ${active === it.id ? "text-primary font-semibold" : "text-on-surface-variant"} py-space-4 active:scale-95 transition-transform duration-150">
            ${icon(it.icon, "text-[24px]", active === it.id)}
            <span class="font-label-sm text-label-sm mt-1">${it.label}</span>
          </a>`).join("")}
      </div>
      <div class="w-32 h-1 bg-outline-variant/60 rounded-full mx-auto mt-2"></div>
    </nav>`;
  }

  function primaryButton(label, onclick, opts) {
    opts = opts || {};
    const disabled = opts.disabled ? "opacity-40 pointer-events-none" : "";
    return `<button onclick="${onclick}" class="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg active:bg-primary transition-colors duration-150 shadow-sm flex items-center justify-center space-x-2 ${disabled}">
      <span>${label}</span>${opts.icon ? icon(opts.icon, "text-[18px]") : ""}
    </button>`;
  }

  function secondaryButton(label, onclick) {
    return `<button onclick="${onclick}" class="w-full h-12 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface font-label-lg text-label-lg active:scale-[0.98] transition-transform duration-150 flex items-center justify-center space-x-2">${label}</button>`;
  }

  function badge(text, tone) {
    const tones = {
      success: "bg-tertiary-container/10 text-tertiary",
      primary: "bg-primary-container text-on-primary",
      warn: "bg-error-container text-on-error-container",
      neutral: "bg-surface-container-high text-on-surface-variant"
    };
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-full ${tones[tone] || tones.neutral} font-label-sm text-label-sm font-semibold">${text}</span>`;
  }

  let toastTimer = null;
  function toast(message, tone) {
    let el = document.getElementById("ac-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "ac-toast";
      el.className = "toast fixed left-1/2 -translate-x-1/2 bottom-24 z-[999] px-4 py-3 rounded-xl shadow-lg font-label-md text-label-md text-center max-w-[320px]";
      document.body.appendChild(el);
    }
    const tones = {
      success: "bg-tertiary text-on-tertiary",
      error: "bg-error text-on-error",
      info: "bg-inverse-surface text-inverse-on-surface"
    };
    el.className = "toast fixed left-1/2 -translate-x-1/2 bottom-24 z-[999] px-4 py-3 rounded-xl shadow-lg font-label-md text-label-md text-center max-w-[320px] " + (tones[tone] || tones.info);
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
      <div class="absolute inset-0 bg-black/40" onclick="UI.closeSheet()"></div>
      <div class="relative w-full max-w-max-width-mobile bg-surface-container-lowest rounded-t-2xl p-space-20 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div class="w-10 h-1.5 bg-outline-variant rounded-full mx-auto mb-4"></div>
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
      <div class="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center text-primary-container mb-space-16">
        ${icon(ic, "text-[40px]")}
      </div>
      <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-8">${title}</h3>
      <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-20 max-w-[260px]">${body}</p>
      ${actionLabel ? primaryButton(actionLabel, actionOnclick, { icon: "arrow_forward" }) : ""}
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
        banner.textContent = "Connexion impossible — mode hors ligne. Certaines actions (paiements) sont indisponibles.";
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

  window.UI = { icon, statusBar, topBar, bottomNav, primaryButton, secondaryButton, badge, toast, openSheet, closeSheet, emptyState, skeletonBoot, initOfflineBanner };
})();
