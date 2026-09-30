(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const DISCOVER = [
    { title: "Festival des Arts Vodoun", tag: "Événement", place: "Ouidah", route: "events" },
    { title: "Hôtels de Cotonou", tag: "Hébergement", place: "Cotonou · Bénin", route: "restaurants" },
    { title: "Artisans de Dantokpa", tag: "Youss Market", place: "Cotonou", route: "market" },
    { title: "Palais royaux d'Abomey", tag: "Culture & Tourisme", place: "Abomey", route: "culture" }
  ];

  Screens.explorer = function (container) {
    const topbar = UI.topBar({ title: "Explorer", subtitle: ACState.user.city + " et environs", back: "App.nav('home')" });
    const body = `
    <div onclick="App.nav('search')" class="w-full h-12 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm flex items-center px-space-16 space-x-space-12 cursor-pointer">
      ${UI.icon("search", "text-outline")}<span class="flex-1 font-body-md text-body-md text-outline">Rechercher...</span>
    </div>
    <section class="grid grid-cols-2 gap-3">
      ${DISCOVER.map(d => `
      <div onclick="App.nav('${d.route}')" class="rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest cursor-pointer">
        <div class="h-24 bg-surface-container-low flex items-center justify-center text-primary-container">${UI.icon("image", "text-[28px]")}</div>
        <div class="p-space-12">
          <span class="font-label-sm text-label-sm text-primary font-semibold">${d.tag}</span>
          <h3 class="font-title-md text-title-md truncate">${d.title}</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant flex items-center space-x-1">${UI.icon("location_on", "text-[14px]")}<span>${d.place}</span></p>
        </div>
      </div>`).join("")}
    </section>`;
    Shell.render(container, { topbar, body, nav: "explorer" });
  };

  Screens.search = function (container, params) {
    const q = (params.q || "").toLowerCase();
    const topbar = `
    <div class="w-full px-space-20 py-space-12 flex items-center space-x-3 bg-surface flex-shrink-0">
      <button onclick="App.back()" class="w-9 h-9 rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center flex-shrink-0">${UI.icon("arrow_back")}</button>
      <input id="global-search" autofocus value="${params.q || ""}" oninput="Screens._searchType(this.value)" placeholder="Rechercher un service, un lieu, un plat..." class="flex-1 h-11 bg-surface-container-lowest rounded-xl border border-outline-variant/40 px-space-16 font-body-md text-body-md focus:outline-none"/>
    </div>`;
    const results = q ? window.ACSearch.run(q) : [];
    const body = `
    <section class="w-full flex flex-col space-y-2">
      ${!q ? UI.emptyState({ icon: "search", title: "Recherchez sur YOUSS CONNECT", body: "Restaurants, produits, événements, lieux culturels et services." }) : (
        results.length ? results.map(r => `
        <div onclick="App.nav('${r.route}', ${JSON.stringify(r.params || {}).replace(/"/g, "&quot;")})" class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 cursor-pointer">
          <div class="flex items-center space-x-3"><div class="w-9 h-9 rounded-full bg-surface-container-low text-primary flex items-center justify-center">${UI.icon(r.icon)}</div>
          <div class="flex flex-col"><span class="font-title-md text-title-md">${r.title}</span><span class="font-body-sm text-body-sm text-on-surface-variant">${r.subtitle}</span></div></div>
          ${UI.icon("chevron_right", "text-outline")}
        </div>`).join("") : UI.emptyState({ icon: "search_off", title: "Aucun résultat", body: "Essayez un autre mot-clé, par exemple « restaurant » ou « billet »." })
      )}
    </section>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._searchType = function (val) {
    App.replace("search", { q: val });
    setTimeout(() => { const el = document.getElementById("global-search"); if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length; } }, 0);
  };

  window.ACSearch = {
    run(q) {
      const all = [
        { title: "Azalaï Hotel Cotonou", subtitle: "Hôtel · Marina", icon: "hotel", route: "restaurantDetail", keys: "hotel hotel azalai cotonou marina", params: { id: "rest1" } },
        { title: "Sun Beach Hotel", subtitle: "Hôtel · Fidjrossè", icon: "hotel", route: "restaurantDetail", keys: "hotel sun beach fidjrosse plage", params: { id: "rest2" } },
        { title: "Hôtel Marie Stella", subtitle: "Hôtel · Cotonou", icon: "hotel", route: "restaurantDetail", keys: "hotel marie stella cotonou", params: { id: "rest3" } },
        { title: "Robe Wax contemporaine", subtitle: "Youss Market · Mode", icon: "storefront", route: "productDetail", keys: "market produit wax mode", params: { id: "p1" } },
        { title: "Beurre de karité pur", subtitle: "Youss Market · Beauté", icon: "storefront", route: "productDetail", keys: "market karite beaute", params: { id: "p2" } },
        { title: "Festival des Arts Vodoun", subtitle: "Événement · Ouidah", icon: "confirmation_number", route: "eventDetail", keys: "evenement festival vodoun ouidah", params: { id: "ev1" } },
        { title: "Palais royaux d'Abomey", subtitle: "Culture · Abomey", icon: "explore", route: "cultureDetail", keys: "culture musee palais abomey dahomey", params: { id: "c1" } },
        { title: "Place de l'Amazone", subtitle: "Culture · Cotonou", icon: "museum", route: "cultureDetail", keys: "culture amazone cotonou place", params: { id: "c3" } },
        { title: "Ganvié", subtitle: "Village lacustre · Lac Nokoué", icon: "water", route: "cultureDetail", keys: "culture ganvie lac nokoue", params: { id: "c4" } },
        { title: "Transport", subtitle: "Réserver une course", icon: "directions_car", route: "transport", keys: "transport course taxi moto" },
        { title: "Youss Wallet", subtitle: "Voir mon solde", icon: "account_balance_wallet", route: "wallet", keys: "wallet portefeuille solde argent" }
      ];
      return all.filter(x => x.keys.includes(q) || x.title.toLowerCase().includes(q));
    }
  };
})();
