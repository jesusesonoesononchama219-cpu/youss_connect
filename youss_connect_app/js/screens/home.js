(function () {
  "use strict";
  window.Screens = window.Screens || {};

  /* Écran 2 — Accueil (aligné maquette) */
  const MAIN = [
    { id: "transport", key: "tile_transport", icon: "directions_car", bg: "bg-[#EDE4F7]", fg: "text-primary" },
    { id: "delivery", key: "tile_delivery", icon: "local_shipping", bg: "bg-[#EDE4F7]", fg: "text-primary" },
    { id: "restaurants", key: "tile_hotels", icon: "hotel", bg: "bg-[#FFEDD5]", fg: "text-orange-600" },
    { id: "culture", key: "tile_tourism", icon: "account_balance", bg: "bg-[#EDE4F7]", fg: "text-primary" }
  ];

  const MORE = [
    { id: "activities", key: "more_rides", icon: "event" },
    { id: "addresses", key: "more_addr", icon: "favorite" },
    { id: "rewards", key: "more_bonus", icon: "workspace_premium" },
    { id: "explorer", key: "more_plus", icon: "apps" }
  ];

  Screens.home = function (container) {
    const unread = ACState.notifications.filter(n => !n.read).length;
    const bal = ACStore.fmtFCFA(ACState.wallet.balance);

    const topbar = `
    <div class="w-full px-space-20 pt-space-8 pb-space-12 flex items-center justify-between bg-surface flex-shrink-0">
      <div class="flex items-center gap-3 min-w-0">
        <button type="button" onclick="App.nav('profile')" class="w-11 h-11 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm flex-shrink-0 ring-2 ring-primary/5">
          <img class="w-full h-full object-cover" src="${ACState.user.avatar}" alt=""/>
        </button>
        <div class="min-w-0">
          <p class="font-label-sm text-label-sm text-on-surface-variant tracking-wide">YOUSS CONNECT</p>
          <h1 class="font-headline-sm text-headline-sm font-bold text-on-surface truncate">${UI.t("hello")}, ${ACState.user.name}</h1>
          <p class="font-body-sm text-body-sm text-on-surface-variant truncate flex items-center gap-1">${UI.icon("location_on", "text-[14px]")}${ACState.user.city}, ${ACState.user.country}</p>
        </div>
      </div>
      <button type="button" aria-label="Notifications" onclick="App.nav('notifications')"
        class="relative w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex items-center justify-center text-on-surface active:scale-95">
        ${UI.icon("notifications", "text-primary")}
        ${unread > 0 ? `<span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-white"></span>` : ""}
      </button>
    </div>`;

    const body = `
    <section class="w-full">
      <div class="rounded-2xl bg-gradient-to-br from-primary via-primary-container to-[#5B2A8F] p-space-16 text-white shadow-[0_12px_28px_rgba(59,20,102,.28)]">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="font-label-sm text-label-sm text-white/70 tracking-wide">${UI.t("wallet")}</p>
            <p class="font-headline-md text-headline-md font-extrabold mt-1 tracking-tight">${bal}</p>
          </div>
          <button type="button" onclick="App.nav('wallet')"
            class="h-10 px-space-14 rounded-xl bg-white text-primary font-label-md text-label-md font-bold shadow-sm active:scale-95">
            ${UI.t("wallet_btn")}
          </button>
        </div>
      </div>
    </section>

    <section class="w-full">
      <div class="grid grid-cols-4 gap-3">
        ${MAIN.map((s) => `
          <button type="button" onclick="App.nav('${s.id}')"
            class="flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <span class="w-14 h-14 rounded-2xl ${s.bg} ${s.fg} flex items-center justify-center shadow-sm ring-1 ring-black/5">
              ${UI.icon(s.icon, "text-[26px]", true)}
            </span>
            <span class="font-label-sm text-label-sm font-semibold text-on-surface text-center leading-tight">${UI.t(s.key)}</span>
          </button>
        `).join("")}
      </div>
      <div class="grid grid-cols-4 gap-3 mt-space-16">
        ${MORE.map((s) => `
          <button type="button" onclick="App.nav('${s.id}')"
            class="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
            <span class="w-11 h-11 rounded-xl bg-surface-container-low text-primary flex items-center justify-center ring-1 ring-outline-variant/30">
              ${UI.icon(s.icon, "text-[20px]")}
            </span>
            <span class="font-label-sm text-label-sm font-medium text-on-surface-variant text-center leading-tight max-w-[76px]">${UI.t(s.key)}</span>
          </button>
        `).join("")}
      </div>
    </section>

    <section class="w-full">
      <div class="relative overflow-hidden rounded-2xl min-h-[140px] text-white bg-surface-container-low shadow-[0_8px_24px_rgba(59,20,102,.12)]">
        <img class="absolute inset-0 w-full h-full object-cover yc-img-fade"
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Palais_du_roi_Glele.jpg?width=800"
          alt="Palais royaux d'Abomey"
          onerror="this.style.display='none';this.parentElement.classList.add('bg-gradient-to-br','from-primary','to-primary-container')"/>
        <div class="absolute inset-0" style="background:linear-gradient(90deg, rgba(42,13,74,.94) 0%, rgba(59,20,102,.72) 55%, rgba(59,20,102,.15) 100%)"></div>
        <div class="relative z-10 p-space-16 max-w-[82%]">
          <p class="font-label-sm text-label-sm text-white/75 tracking-wide mb-1">${UI.t("banner_kicker")}</p>
          <h2 class="font-headline-sm text-headline-sm font-bold leading-snug mb-space-12">${UI.t("banner_title")}</h2>
          <button type="button" onclick="App.nav('culturalScanner')"
            class="inline-flex items-center gap-2 h-9 px-space-14 rounded-xl bg-white text-primary font-label-md text-label-md font-bold shadow-sm active:scale-95">
            ${UI.icon("qr_code_scanner", "text-[16px]")} ${UI.t("banner_scan")}
          </button>
        </div>
      </div>
    </section>`;

    Shell.render(container, { topbar, body, nav: "home" });
  };
})();
