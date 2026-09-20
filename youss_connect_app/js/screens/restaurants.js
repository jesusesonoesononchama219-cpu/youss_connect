(function () {
  "use strict";
  window.Screens = window.Screens || {};

  /* Hôtels RÉELS du Bénin — photos Wikimedia Commons */
  const WM = (file) =>
    "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(file) + "?width=800";

  const RESTAURANTS = {
    rest1: {
      id: "rest1",
      name: "Azalaï Hotel Cotonou",
      tag: "4★ · Boulevard de la Marina, Cotonou",
      rating: 4.6,
      delivery: "Centre-ville",
      body: "Hôtel emblématique de Cotonou, face à l'Atlantique, près de la Place de l'Étoile Rouge. 120 chambres et suites, piscine, restaurant et vue mer.",
      img: WM("Azalai-hotel-cotonou.jpg"),
      menu: [
        { id: "d1", name: "Chambre Standard (1 nuit)", price: 85000 },
        { id: "d2", name: "Chambre Vue mer (1 nuit)", price: 110000 },
        { id: "d3", name: "Suite Junior (1 nuit)", price: 160000 }
      ]
    },
    rest2: {
      id: "rest2",
      name: "Sun Beach Hotel",
      tag: "4★ · Fidjrossè, Cotonou",
      rating: 4.5,
      delivery: "Plage · Aéroport",
      body: "Hôtel 4 étoiles à Fidjrossè, à 5 min de la plage et 10 min de l'aéroport. 130 chambres et suites, proche de la Route des Pêches.",
      img: WM("Sun Beach Hotel Cotonou, Bénin.jpg"),
      menu: [
        { id: "d4", name: "Chambre Standard (1 nuit)", price: 75000 },
        { id: "d5", name: "Chambre Deluxe (1 nuit)", price: 95000 },
        { id: "d6", name: "Suite Présidentielle (1 nuit)", price: 180000 }
      ]
    },
    rest3: {
      id: "rest3",
      name: "Hôtel Marie Stella",
      tag: "Affaires · Cotonou",
      rating: 4.3,
      delivery: "Centre",
      body: "Établissement contemporain au cœur de Cotonou, apprécié pour les séjours d'affaires et les courts séjours.",
      img: WM("FRONT VIEW OF HOTEL MARIE STELLA IN COTONOU, BENIN.jpg"),
      menu: [
        { id: "d7", name: "Chambre Confort (1 nuit)", price: 55000 },
        { id: "d8", name: "Chambre Business (1 nuit)", price: 70000 },
        { id: "d9", name: "Petit-déjeuner buffet", price: 8000 }
      ]
    },
    rest4: {
      id: "rest4",
      name: "Hôtel Pantagruel",
      tag: "Boutique · Cotonou",
      rating: 4.2,
      delivery: "Ville",
      body: "Hôtel de charme à Cotonou, idéal pour découvrir la ville et les marchés environnants.",
      img: WM("Hôtel Pantagruel 01.jpg"),
      menu: [
        { id: "d10", name: "Chambre Double (1 nuit)", price: 45000 },
        { id: "d11", name: "Chambre Triple (1 nuit)", price: 58000 },
        { id: "d12", name: "Demi-pension", price: 22000 }
      ]
    },
    rest5: {
      id: "rest5",
      name: "Paradisia Hotel",
      tag: "Godomey · Agglomération de Cotonou",
      rating: 4.1,
      delivery: "Godomey",
      body: "Hôtel situé à Godomey, dans l'agglomération de Cotonou, pratique pour les voyageurs vers l'ouest et la Route des Pêches.",
      img: WM("Paradisia Hotel, Godomey, Benin.jpg"),
      menu: [
        { id: "d13", name: "Chambre Standard (1 nuit)", price: 40000 },
        { id: "d14", name: "Chambre Familiale (1 nuit)", price: 65000 },
        { id: "d15", name: "Nuit + petit-déjeuner", price: 48000 }
      ]
    }
  };

  function hotelThumb(h, iconSize) {
    return `
      <img class="absolute inset-0 w-full h-full object-cover" src="${h.img}" alt="${h.name}"
        onerror="this.style.display='none';var fb=this.parentElement&&this.parentElement.querySelector('[data-fallback]');if(fb)fb.classList.remove('hidden')"/>
      <div data-fallback class="absolute inset-0 hidden bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-orange-500">
        ${UI.icon("hotel", iconSize || "text-[36px]")}
      </div>`;
  }

  Screens.restaurants = function (container) {
    const cats = ["Tout", "4 étoiles", "Plage", "Affaires", "Boutique"];
    const topbar = UI.topBar({ title: "Hôtels", subtitle: "Cotonou & environs · Bénin", back: "App.nav('home')" });
    const body = `
    <section class="w-full">
      <div class="h-11 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-space-12 flex items-center gap-2">
        ${UI.icon("search", "text-outline")}
        <span class="font-body-md text-body-md text-outline">Rechercher un hôtel à Cotonou</span>
      </div>
    </section>
    <section class="flex gap-2 overflow-x-auto no-scrollbar">
      ${cats.map((c, i) => `<span class="px-3 h-8 flex items-center justify-center rounded-full font-label-sm text-label-sm whitespace-nowrap ${i === 0 ? "bg-primary text-white" : "bg-surface-container-lowest border border-outline-variant/30"}">${c}</span>`).join("")}
    </section>
    <section class="flex flex-col space-y-3">
      <h2 class="font-headline-sm text-headline-sm font-bold">Hôtels populaires</h2>
      ${Object.values(RESTAURANTS).map((r) => `
      <div onclick="App.nav('restaurantDetail', {id:'${r.id}'})" class="rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest cursor-pointer active:scale-[0.99]">
        <div class="h-36 relative bg-surface-container-low">${hotelThumb(r)}</div>
        <div class="p-space-16 flex items-center justify-between gap-3">
          <div class="flex flex-col min-w-0">
            <span class="font-title-md text-title-md font-bold truncate">${r.name}</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">${r.tag}</span>
          </div>
          <div class="flex flex-col items-end flex-shrink-0">
            <span class="font-label-md text-label-md text-yc-green font-bold">★ ${r.rating}</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant">${r.delivery}</span>
          </div>
        </div>
      </div>`).join("")}
    </section>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.restaurantDetail = function (container, params) {
    const r = RESTAURANTS[params.id] || Object.values(RESTAURANTS)[0];
    const topbar = UI.topBar({ title: r.name, subtitle: r.tag, back: "App.back()", right: cartBadge() });
    const body = `
    <section class="h-44 rounded-xl relative overflow-hidden bg-surface-container-low">
      ${hotelThumb(r, "text-[40px]")}
      <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"></div>
      <div class="absolute bottom-3 left-3 right-3 text-white z-10">
        <p class="font-label-sm text-label-sm text-white/85">★ ${r.rating} · ${r.delivery}</p>
      </div>
    </section>
    <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">${r.body}</p>
    <section class="flex flex-col space-y-3">
      <h2 class="font-headline-sm text-headline-sm font-bold">Réserver</h2>
      ${r.menu.map(d => `
      <div class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16">
        <div class="flex flex-col min-w-0"><span class="font-title-md text-title-md truncate">${d.name}</span><span class="font-body-sm text-body-sm text-primary font-semibold">${ACStore.fmtFCFA(d.price)}</span></div>
        <button onclick="Screens._addToCart('${r.id}','${d.id}')" class="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0">${UI.icon("add")}</button>
      </div>`).join("")}
    </section>
    ${cartFooter(r.id)}`;
    Shell.render(container, { topbar, body, nav: false });
  };

  function cartBadge() {
    const n = ACState.cart.items.reduce((s, i) => s + i.qty, 0);
    return n ? `<button onclick="App.nav('cartRestaurant')" class="relative w-9 h-9 rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center">${UI.icon("shopping_cart")}<span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-container text-on-primary text-[10px] flex items-center justify-center">${n}</span></button>` : "";
  }
  function cartFooter(restId) {
    const n = ACState.cart.items.reduce((s, i) => s + i.qty, 0);
    if (!n) return "";
    const total = ACState.cart.items.reduce((s, i) => s + i.price * i.qty, 0);
    return `<div class="pt-space-8">${UI.primaryButton("Voir la réservation · " + ACStore.fmtFCFA(total), "App.nav('cartRestaurant')", { icon: "shopping_cart", green: true })}</div>`;
  }

  Screens._addToCart = function (restId, dishId) {
    const r = RESTAURANTS[restId];
    const d = r.menu.find(x => x.id === dishId);
    if (!d) return;
    if (ACState.cart.restaurant && ACState.cart.restaurant !== restId && ACState.cart.items.length) {
      UI.toast("Videz d'abord la réservation d'un autre hôtel.", "error");
      return;
    }
    ACState.cart.restaurant = restId;
    const existing = ACState.cart.items.find(i => i.id === dishId);
    if (existing) existing.qty += 1;
    else ACState.cart.items.push({ id: dishId, name: d.name, price: d.price, qty: 1 });
    ACStore.emit();
    UI.toast(d.name + " ajouté", "success");
    App.replace("restaurantDetail", { id: restId });
  };

  Screens.cartRestaurant = function (container) {
    const r = RESTAURANTS[ACState.cart.restaurant];
    const topbar = UI.topBar({ title: "Ma réservation", subtitle: r ? r.name : "", back: "App.back()" });
    const body = !ACState.cart.items.length ? UI.emptyState({ icon: "hotel", title: "Aucune réservation", body: "Choisissez une chambre dans un hôtel pour commencer.", actionLabel: "Voir les hôtels", actionOnclick: "App.resetTo('restaurants')" }) : `
    <section class="flex flex-col space-y-2">
      ${ACState.cart.items.map(i => `
      <div class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16">
        <div><p class="font-title-md text-title-md">${i.name}</p><p class="font-body-sm text-body-sm text-on-surface-variant">${ACStore.fmtFCFA(i.price)} × ${i.qty}</p></div>
        <div class="flex items-center gap-2">
          <button onclick="Screens._cartQty('${i.id}',-1)" class="w-8 h-8 rounded-full border border-outline-variant/40">${UI.icon("remove")}</button>
          <span class="font-label-md text-label-md font-bold w-4 text-center">${i.qty}</span>
          <button onclick="Screens._cartQty('${i.id}',1)" class="w-8 h-8 rounded-full border border-outline-variant/40">${UI.icon("add")}</button>
        </div>
      </div>`).join("")}
    </section>
    <div class="pt-space-8">${UI.primaryButton("Confirmer", "App.nav('checkoutRestaurant')", { green: true })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._cartQty = function (id, delta) {
    const item = ACState.cart.items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) ACState.cart.items = ACState.cart.items.filter(i => i.id !== id);
    if (!ACState.cart.items.length) ACState.cart.restaurant = null;
    ACStore.emit();
    App.replace("cartRestaurant");
  };

  Screens.checkoutRestaurant = function (container) {
    const total = ACState.cart.items.reduce((s, i) => s + i.price * i.qty, 0);
    const fee = 0;
    const topbar = UI.topBar({ title: "Confirmer la réservation", back: "App.back()" });
    const body = `
    <section class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 space-y-2">
      <div class="flex justify-between"><span class="text-on-surface-variant">Séjour</span><span>Cotonou · Bénin</span></div>
      <div class="flex justify-between"><span class="text-on-surface-variant">Sous-total</span><span>${ACStore.fmtFCFA(total)}</span></div>
      <div class="flex justify-between"><span class="text-on-surface-variant">Frais</span><span>${ACStore.fmtFCFA(fee)}</span></div>
      <div class="flex justify-between font-bold border-t border-outline-variant/30 pt-2"><span>Total</span><span class="text-primary">${ACStore.fmtFCFA(total + fee)}</span></div>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Payer avec Youss Wallet", "Screens._payRestaurant(" + (total + fee) + ")", { green: true })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._payRestaurant = function (amount) {
    const res = ACStore.payFromWallet({ amount: amount, label: "Réservation hôtel Cotonou", service: "restaurant", pointsEarned: 40 });
    if (!res.ok) { App.nav("paymentFailed"); return; }
    ACState.cart.items = [];
    ACState.cart.restaurant = null;
    App.resetTo("orderTracking");
  };

  Screens.orderTracking = function (container) {
    const topbar = UI.topBar({ title: "Réservation confirmée", back: "App.nav('home')" });
    const body = `
    <div class="flex flex-col items-center text-center space-y-space-16 py-space-24">
      <div class="w-16 h-16 rounded-full bg-yc-green/15 text-yc-green flex items-center justify-center">${UI.icon("check_circle", "text-[36px]", true)}</div>
      <h2 class="font-headline-sm text-headline-sm font-bold">Réservation confirmée</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Votre séjour à Cotonou est réservé (démo)</p>
      ${UI.primaryButton("Retour à l'accueil", "App.resetTo('home')", { green: true })}
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
})();
