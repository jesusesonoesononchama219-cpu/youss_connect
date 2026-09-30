/* =========================================================
   YOUSS CONNECT — SHARED UI HELPERS
   Visual language aligned to Dynasty KYA mockups.
   ========================================================= */
(function () {
  "use strict";

  function icon(name, cls, fill) {
    return `<span class="material-symbols-outlined ${cls || ""} ${fill ? "fill-icon" : ""}">${name}</span>`;
  }

  function statusBar(opts) {
    opts = opts || {};
    const light = opts.light;
    const color = light ? "text-white/85" : "text-on-surface";
    return `
    <header class="relative z-10 w-full h-11 px-space-20 flex items-center justify-between ${color} select-none pt-space-2 flex-shrink-0">
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
        ${side("home", "Accueil", "home")}
        ${side("activities", "Activités", "receipt_long")}
        <a href="javascript:void(0)" onclick="App.nav('culturalScanner')"
          class="flex flex-col items-center justify-center active:scale-95 transition-transform" aria-label="Scanner">
          <span class="yc-nav-fab">${icon("qr_code_scanner", "text-[28px]", true)}</span>
          <span class="font-label-sm text-label-sm mt-1 tracking-wide ${active === "culturalScanner" || active === "culture" ? "text-yc-green font-semibold" : "text-on-surface-variant"}">Scan</span>
        </a>
        ${side("notifications", "Messages", "chat_bubble")}
        ${side("profile", "Profil", "person")}
      </div>
      <div class="w-28 h-1 bg-outline-variant/40 rounded-full mx-auto mt-2"></div>
    </nav>`;
  }

  function primaryButton(label, onclick, opts) {
    opts = opts || {};
    const disabled = opts.disabled ? "opacity-40 pointer-events-none" : "";
    const green = opts.green
      ? "bg-yc-green text-white shadow-[0_8px_20px_rgba(34,197,94,.28)] active:brightness-95"
      : "bg-primary-container text-on-primary shadow-[0_8px_20px_rgba(59,20,102,.22)] active:bg-primary";
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

  window.UI = { icon, statusBar, topBar, bottomNav, primaryButton, secondaryButton, badge, toast, openSheet, closeSheet, emptyState, skeletonBoot, initOfflineBanner };
})();
