(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const SERVICES = [
    { id: "transport", label: "Transport", icon: "directions_car" },
    { id: "delivery", label: "Livraison", icon: "local_shipping" },
    { id: "restaurants", label: "Restaurants", icon: "restaurant" },
    { id: "events", label: "Événements", icon: "confirmation_number" },
    { id: "market", label: "Africa Market", icon: "storefront" },
    { id: "culture", label: "Culture & Tourisme", icon: "explore" },
    { id: "wallet", label: "Africa Wallet", icon: "account_balance_wallet" },
    { id: "rewards", label: "Africa Rewards", icon: "workspace_premium" },
    { id: "business", label: "Africa Business", icon: "business_center" }
  ];

  Screens.home = function (container) {
    const unread = ACState.notifications.filter(n => !n.read).length;
    const topbar = `
    <div class="w-full px-space-20 py-space-12 flex items-center justify-between bg-surface flex-shrink-0">
      <div class="flex flex-col">
        <h1 class="font-headline-sm text-headline-sm font-bold text-on-surface">Bonjour ${ACState.user.name}</h1>
        <p class="font-body-sm text-body-sm text-on-surface-variant">Que souhaitez-vous faire aujourd'hui ?</p>
      </div>
      <div class="flex items-center space-x-3">
        <button aria-label="Notifications" onclick="App.nav('notifications')" class="relative w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform">
          ${UI.icon("notifications", "text-primary")}
          ${unread > 0 ? `<span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-container ring-2 ring-surface-container-lowest"></span>` : ""}
        </button>
        <div onclick="App.nav('profile')" class="relative w-10 h-10 rounded-full border-2 border-primary-container p-0.5 bg-surface-container-lowest overflow-hidden flex-shrink-0 cursor-pointer">
          <img class="w-full h-full object-cover rounded-full" src="${ACState.user.avatar}"/>
        </div>
      </div>
    </div>`;

    const body = `
    <section class="w-full">
      <div onclick="App.nav('search')" class="w-full h-12 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm flex items-center px-space-16 space-x-space-12 cursor-pointer">
        ${UI.icon("search", "text-outline")}
        <span class="flex-1 font-body-md text-body-md text-outline">Rechercher un service, un restaurant, un produit...</span>
        ${UI.icon("tune", "text-primary")}
      </div>
    </section>

    <section class="w-full">
      <div class="relative overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant/30 p-space-16 flex flex-col justify-between">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex items-center justify-between mb-space-8">
          <span class="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">KYA EXPERIENCE</span>
          <span class="inline-flex items-center px-space-8 py-0.5 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm">${ACState.user.city}</span>
        </div>
        <h2 class="font-headline-sm text-headline-sm text-on-surface mb-space-4 leading-tight">Découvrez les meilleures expériences près de vous</h2>
        <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-16 max-w-[270px]">Offres exclusives sur la culture, restaurants et mobilité à ${ACState.user.city}</p>
        <div class="flex items-center justify-between">
          <button onclick="App.nav('explorer')" class="inline-flex items-center space-x-space-8 h-9 px-space-16 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg active:bg-primary transition-colors shadow-sm">
            <span>Explorer</span>${UI.icon("arrow_forward", "text-[16px]")}
          </button>
          <div class="flex items-center space-x-1 text-primary">
            ${UI.icon("verified", "text-[18px]")}
            <span class="font-label-sm text-label-sm text-primary font-semibold">Certifié KYA</span>
          </div>
        </div>
      </div>
    </section>

    <section class="w-full flex flex-col space-y-space-12">
      <div class="flex items-center justify-between">
        <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Services</h2>
      </div>
      <div class="grid grid-cols-3 gap-3">
        ${SERVICES.map(s => `
        <div onclick="App.nav('${s.id}')" class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-12 flex flex-col items-center justify-center text-center active:scale-95 transition-transform shadow-sm cursor-pointer">
          <div class="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container mb-space-8">
            ${UI.icon(s.icon, "text-[24px]")}
          </div>
          <span class="font-label-md text-label-md font-semibold text-on-surface truncate w-full">${s.label}</span>
        </div>`).join("")}
      </div>
    </section>

    <section class="w-full flex flex-col space-y-space-12">
      <div class="flex items-center justify-between">
        <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Activités récentes</h2>
        <button onclick="App.nav('activities')" class="font-label-md text-label-md text-primary hover:underline">Historique</button>
      </div>
      <div class="flex flex-col space-y-3">
        ${ACState.activities.slice(0, 3).map(a => activityRow(a)).join("") || UI.emptyState({ icon: "schedule", title: "Aucune activité", body: "Vos courses, commandes et achats apparaîtront ici." })}
      </div>
    </section>

    <footer class="pt-space-12 pb-space-8 text-center">
      <p class="font-label-sm text-label-sm text-outline">AFRICA CONNECT • Propulsé par KYA CORPORATION</p>
    </footer>`;

    Shell.render(container, { topbar, body, nav: "home" });
  };

  function activityRow(a) {
    const inProgress = a.status === "En cours";
    return `
    <div onclick="App.nav('activityDetail', {id:'${a.id}'})" class="w-full bg-surface-container-lowest border ${inProgress ? "border-primary-container/30 bg-gradient-to-r from-surface-container-lowest to-surface-container-low" : "border-outline-variant/30"} rounded-xl p-space-16 flex items-center justify-between shadow-sm cursor-pointer">
      <div class="flex items-center space-x-space-12 min-w-0">
        <div class="w-10 h-10 rounded-xl ${inProgress ? "bg-primary-container/10 text-primary-container" : "bg-surface-container-low text-primary"} flex items-center justify-center flex-shrink-0">
          ${UI.icon(a.icon, "text-[20px]")}
        </div>
        <div class="flex flex-col min-w-0">
          <span class="font-title-md text-title-md text-on-surface truncate">${a.title}</span>
          <span class="font-body-sm text-body-sm ${inProgress ? "text-primary font-medium" : "text-on-surface-variant"} truncate">${a.subtitle}</span>
        </div>
      </div>
      <div class="flex flex-col items-end space-y-1 flex-shrink-0 pl-2">
        <span class="font-label-lg text-label-lg font-bold text-on-surface">${a.amount != null ? ACStore.fmtFCFA(a.amount) : "—"}</span>
        ${UI.badge(a.status, inProgress ? "primary" : "success")}
      </div>
    </div>`;
  }

  window._activityRow = activityRow;
})();
