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
      cats: ["4 étoiles", "Affaires"],
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
      cats: ["4 étoiles", "Plage"],
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
      cats: ["Affaires"],
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
      cats: ["Boutique"],
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
      cats: ["Boutique", "Plage"],
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

  /* ---------- Recherche d'hôtels (saisie + filtres) ---------- */
  const HOTEL_CATS = ["Tout", "4 étoiles", "Plage", "Affaires", "Boutique"];
  const hotelSearch = { q: "", cat: "Tout" };

  const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  function filteredHotels() {
    const q = norm(hotelSearch.q).trim();
    const words = q ? q.split(/\s+/) : [];
    return Object.values(RESTAURANTS).filter((r) => {
      if (hotelSearch.cat !== "Tout" && !(r.cats || []).includes(hotelSearch.cat)) return false;
      if (!words.length) return true;
      const hay = norm([r.name, r.tag, r.delivery, r.body, (r.cats || []).join(" "), r.menu.map((m) => m.name).join(" ")].join(" "));
      return words.every((w) => hay.includes(w));
    });
  }

  function highlight(text) {
    const q = hotelSearch.q.trim();
    if (!q) return text;
    const re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return String(text).replace(re, '<mark class="bg-yc-green/20 text-on-surface rounded px-0.5">$1</mark>');
  }

  function hotelCard(r) {
    return `
      <div onclick="App.nav('restaurantDetail', {id:'${r.id}'})" class="yc-card yc-card-press rounded-2xl overflow-hidden cursor-pointer">
        <div class="h-36 relative bg-surface-container-low">${hotelThumb(r)}</div>
        <div class="p-space-16 flex items-center justify-between gap-3">
          <div class="flex flex-col min-w-0">
            <span class="font-title-md text-title-md font-bold truncate">${highlight(r.name)}</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">${highlight(r.tag)}</span>
          </div>
          <div class="flex flex-col items-end flex-shrink-0">
            <span class="font-label-md text-label-md text-yc-green font-bold">★ ${r.rating}</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant">${r.delivery}</span>
          </div>
        </div>
      </div>`;
  }

  function hotelListHtml() {
    const list = filteredHotels();
    const title = hotelSearch.q.trim() || hotelSearch.cat !== "Tout"
      ? `${list.length} hôtel${list.length > 1 ? "s" : ""} trouvé${list.length > 1 ? "s" : ""}`
      : "Hôtels populaires";
    if (!list.length) {
      return `
      <h2 class="font-headline-sm text-headline-sm font-bold">${title}</h2>
      <div class="yc-card p-space-24 flex flex-col items-center text-center space-y-2">
        <span class="w-14 h-14 rounded-full bg-surface-container-low text-primary flex items-center justify-center">${UI.icon("search_off", "text-[28px]")}</span>
        <p class="font-title-md text-title-md font-bold">Aucun hôtel ne correspond</p>
        <p class="font-body-sm text-body-sm text-on-surface-variant">Essayez « plage », « affaires », « suite » ou le nom d'un quartier.</p>
        <button type="button" onclick="Screens._hotelReset()" class="mt-1 font-label-md text-label-md font-semibold text-primary">Effacer la recherche</button>
      </div>`;
    }
    return `<h2 class="font-headline-sm text-headline-sm font-bold">${title}</h2>${list.map(hotelCard).join("")}`;
  }

  function hotelChipsHtml() {
    return HOTEL_CATS.map((c) => `
      <button type="button" onclick="Screens._hotelCat('${c}')"
        class="px-3 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap transition-colors ${c === hotelSearch.cat ? "bg-primary text-white shadow-sm" : "bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant"}">${c}</button>`).join("");
  }

  Screens.restaurants = function (container) {
    const topbar = UI.topBar({ title: "Hôtels", subtitle: "Cotonou & environs · Bénin", back: "App.nav('home')" });
    const body = `
    <section class="w-full">
      <label class="h-12 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-space-12 flex items-center gap-2 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-shadow">
        ${UI.icon("search", "text-outline flex-shrink-0")}
        <input id="hotel-search-input" type="search" value="${hotelSearch.q.replace(/"/g, "&quot;")}" placeholder="Rechercher un hôtel, un quartier, une chambre…"
          autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="search"
          oninput="Screens._hotelSearch(this.value)"
          class="yc-gmap-input flex-1 font-body-md text-body-md text-on-surface placeholder:text-outline min-w-0"/>
        <button type="button" id="hotel-search-clear" onclick="Screens._hotelReset()"
          class="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center flex-shrink-0 ${hotelSearch.q ? "" : "hidden"}">${UI.icon("close", "text-[16px]")}</button>
      </label>
    </section>
    <section id="hotel-chips" class="flex gap-2 overflow-x-auto no-scrollbar">${hotelChipsHtml()}</section>
    <section id="hotel-list" class="flex flex-col space-y-3">${hotelListHtml()}</section>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._hotelSearch = function (value) {
    hotelSearch.q = value || "";
    const list = document.getElementById("hotel-list");
    if (list) list.innerHTML = hotelListHtml();
    const clear = document.getElementById("hotel-search-clear");
    if (clear) clear.classList.toggle("hidden", !hotelSearch.q);
  };

  Screens._hotelCat = function (cat) {
    hotelSearch.cat = HOTEL_CATS.includes(cat) ? cat : "Tout";
    const chips = document.getElementById("hotel-chips");
    if (chips) chips.innerHTML = hotelChipsHtml();
    const list = document.getElementById("hotel-list");
    if (list) list.innerHTML = hotelListHtml();
  };

  Screens._hotelReset = function () {
    hotelSearch.q = "";
    hotelSearch.cat = "Tout";
    const input = document.getElementById("hotel-search-input");
    if (input) { input.value = ""; input.focus(); }
    Screens._hotelCat("Tout");
    const clear = document.getElementById("hotel-search-clear");
    if (clear) clear.classList.add("hidden");
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
    ACStore.whenPaid(
      ACStore.payFromWallet({ amount: amount, label: "Réservation hôtel Cotonou", service: "restaurant", pointsEarned: 40, meta: { hotel: ACState.cart.restaurant } }),
      function () {
        ACState.cart.items = [];
        ACState.cart.restaurant = null;
        App.resetTo("orderTracking");
      },
      function () { App.nav("paymentFailed"); }
    );
  };

  Screens.orderTracking = function (container) {
    const topbar = UI.topBar({ title: "Réservation confirmée", back: "App.nav('home')" });
    const body = `
    <div class="flex flex-col items-center text-center space-y-space-16 py-space-24">
      <div class="w-16 h-16 rounded-full bg-yc-green/15 text-yc-green flex items-center justify-center">${UI.icon("check_circle", "text-[36px]", true)}</div>
      <h2 class="font-headline-sm text-headline-sm font-bold">Réservation confirmée</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Votre séjour à Cotonou est confirmé</p>
      ${UI.primaryButton("Retour à l'accueil", "App.resetTo('home')", { green: true })}
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
})();
