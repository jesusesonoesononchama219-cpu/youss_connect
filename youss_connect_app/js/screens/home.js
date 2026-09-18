(function () {
  "use strict";
  window.Screens = window.Screens || {};

  /* Écran 2 — Accueil (maquette YOUSS CONNECT) */
  const MAIN = [
    { id: "transport", label: "Transport", icon: "directions_car", bg: "bg-primary/10", fg: "text-primary" },
    { id: "delivery", label: "Livraison", icon: "local_shipping", bg: "bg-yc-green/15", fg: "text-yc-green" },
    { id: "restaurants", label: "Restaurants", icon: "restaurant", bg: "bg-orange-100", fg: "text-orange-600" },
    { id: "culture", label: "Tourisme", icon: "account_balance", bg: "bg-teal-100", fg: "text-teal-700" }
  ];

  const MORE = [
    { id: "activities", label: "Courses planifiées", icon: "event" },
    { id: "addresses", label: "Adresses favorites", icon: "favorite" },
    { id: "rewards", label: "Youss Bonus", icon: "workspace_premium" },
    { id: "explorer", label: "Plus", icon: "apps" }
  ];

  Screens.home = function (container) {
    const unread = ACState.notifications.filter(n => !n.read).length;
    const bal = ACStore.fmtFCFA(ACState.wallet.balance);

    const topbar = `
    <div class="w-full px-space-20 pt-space-8 pb-space-12 flex items-center justify-between bg-surface flex-shrink-0">
      <div class="flex items-center gap-3 min-w-0">
        <button type="button" onclick="App.nav('profile')" class="w-11 h-11 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
          <img class="w-full h-full object-cover" src="${ACState.user.avatar}" alt=""/>
        </button>
        <div class="min-w-0">
          <p class="font-body-sm text-body-sm text-on-surface-variant truncate">${ACState.user.city}</p>
          <h1 class="font-headline-sm text-headline-sm font-bold text-on-surface truncate">Bonjour, ${ACState.user.name}</h1>
        </div>
      </div>
      <button type="button" aria-label="Notifications" onclick="App.nav('notifications')"
        class="relative w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface active:scale-95">
        ${UI.icon("notifications", "text-primary")}
        ${unread > 0 ? `<span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-yc-green ring-2 ring-white"></span>` : ""}
      </button>
    </div>`;

    const body = `
    <section class="w-full">
      <div class="rounded-2xl bg-gradient-to-br from-primary to-primary-container p-space-16 text-white shadow-lg shadow-primary/20">
        <div class="flex items-start justify-between mb-space-12">
          <div>
            <p class="font-label-sm text-label-sm text-white/70 uppercase tracking-wider">Solde Youss</p>
            <p class="font-headline-md text-headline-md font-extrabold mt-1">${bal}</p>
          </div>
          <button type="button" onclick="App.nav('wallet')"
            class="h-9 px-space-12 rounded-xl bg-white/15 border border-white/20 font-label-md text-label-md font-semibold active:scale-95">
            Portefeuille
          </button>
        </div>
        <div class="flex gap-2">
          <button type="button" onclick="App.nav('walletTopup')" class="flex-1 h-9 rounded-lg bg-yc-green text-white font-label-md text-label-md font-semibold">Recharger</button>
          <button type="button" onclick="App.nav('walletSend')" class="flex-1 h-9 rounded-lg bg-white/15 border border-white/20 font-label-md text-label-md">Envoyer</button>
        </div>
      </div>
    </section>

    <section class="w-full">
      <div class="grid grid-cols-4 gap-3">
        ${MAIN.map((s) => `
          <button type="button" onclick="App.nav('${s.id}')"
            class="flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <span class="w-14 h-14 rounded-2xl ${s.bg} ${s.fg} flex items-center justify-center shadow-sm">
              ${UI.icon(s.icon, "text-[26px]", true)}
            </span>
            <span class="font-label-sm text-label-sm font-semibold text-on-surface text-center leading-tight">${s.label}</span>
          </button>
        `).join("")}
      </div>
      <div class="grid grid-cols-4 gap-3 mt-space-16">
        ${MORE.map((s) => `
          <button type="button" onclick="App.nav('${s.id}')"
            class="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
            <span class="w-11 h-11 rounded-xl bg-surface-container-low text-primary flex items-center justify-center">
              ${UI.icon(s.icon, "text-[20px]")}
            </span>
            <span class="font-label-sm text-[10px] font-medium text-on-surface-variant text-center leading-tight max-w-[72px]">${s.label}</span>
          </button>
        `).join("")}
      </div>
    </section>

    <section class="w-full">
      <div class="relative overflow-hidden rounded-2xl bg-[#1e3a5f] text-white p-space-16 min-h-[120px]">
        <div class="absolute inset-0 opacity-40"
          style="background:url('https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=60') center/cover"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-[#1e3a5f] via-[#1e3a5f]/85 to-transparent"></div>
        <div class="relative z-10 max-w-[70%]">
          <p class="font-label-sm text-label-sm text-white/70 mb-1">Culture & Tourisme</p>
          <h2 class="font-headline-sm text-headline-sm font-bold leading-snug mb-space-12">Découvrez l'histoire de votre culture</h2>
          <button type="button" onclick="App.nav('culturalScanner')"
            class="inline-flex items-center gap-2 h-9 px-space-14 rounded-xl bg-yc-green text-white font-label-md text-label-md font-bold active:scale-95">
            ${UI.icon("qr_code_scanner", "text-[16px]")} Scanner
          </button>
        </div>
      </div>
    </section>

    <section class="w-full flex flex-col space-y-space-12">
      <div class="flex items-center justify-between">
        <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Activités récentes</h2>
        <button type="button" onclick="App.nav('activities')" class="font-label-md text-label-md text-primary font-semibold">Voir tout</button>
      </div>
      <div class="flex flex-col space-y-2">
        ${ACState.activities.slice(0, 3).map(activityRow).join("") || UI.emptyState({ icon: "schedule", title: "Aucune activité", body: "Vos courses et commandes apparaîtront ici." })}
      </div>
    </section>

    <footer class="pt-space-8 text-center">
      <p class="font-label-sm text-label-sm text-outline">YOUSS CONNECT · Dynasty KYA</p>
    </footer>`;

    Shell.render(container, { topbar, body, nav: "home" });
  };

  function activityRow(a) {
    const inProgress = a.status === "En cours";
    return `
    <button type="button" onclick="App.nav('activityDetail', { id: '${a.id}' })"
      class="w-full flex items-center gap-3 p-space-12 rounded-xl bg-surface-container-lowest border border-outline-variant/25 text-left active:scale-[0.99] transition-transform">
      <span class="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center flex-shrink-0">
        ${UI.icon(a.icon || "schedule", "text-[20px]")}
      </span>
      <div class="flex-1 min-w-0">
        <p class="font-label-md text-label-md font-semibold text-on-surface truncate">${a.title}</p>
        <p class="font-body-sm text-body-sm text-on-surface-variant truncate">${a.subtitle}</p>
      </div>
      <div class="text-right flex-shrink-0">
        ${a.amount != null ? `<p class="font-label-md text-label-md font-bold text-on-surface">${ACStore.fmtFCFA(a.amount)}</p>` : ""}
        <span class="font-label-sm text-label-sm ${inProgress ? "text-yc-green" : "text-on-surface-variant"}">${a.status}</span>
      </div>
    </button>`;
  }
})();
