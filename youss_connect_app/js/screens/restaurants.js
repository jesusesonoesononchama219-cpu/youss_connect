(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const RESTAURANTS = {
    rest1: { id: "rest1", name: "La Pirogue Cotonou", tag: "Fruits de mer · Haie Vive", rating: 4.7, delivery: "25-35 min",
      menu: [
        { id: "d1", name: "Poisson braisé & attiéké", price: 4500 },
        { id: "d2", name: "Crevettes sauce piquante", price: 6000 },
        { id: "d3", name: "Jus de bissap frais", price: 1000 }
      ] },
    rest2: { id: "rest2", name: "Chez Maman Bénin", tag: "Cuisine locale · Ganhi", rating: 4.5, delivery: "20-30 min",
      menu: [
        { id: "d4", name: "Pâte rouge & poulet", price: 3000 },
        { id: "d5", name: "Igname pilée & sauce arachide", price: 3200 },
        { id: "d6", name: "Beignets de haricot (akara)", price: 800 }
      ] }
  };

  Screens.restaurants = function (container) {
    const topbar = UI.topBar({ title: "Restaurants", subtitle: "Découverte à " + ACState.user.city, back: "App.nav('home')" });
    const body = `
    <section class="grid grid-cols-4 gap-2">
      ${["Tout", "Local", "Fruits de mer", "Fast-food"].map((c, i) => `<span class="px-2 h-8 flex items-center justify-center rounded-full font-label-sm text-label-sm text-center ${i === 0 ? "bg-primary-container text-on-primary" : "bg-surface-container-lowest border border-outline-variant/30"}">${c}</span>`).join("")}
    </section>
    <section class="flex flex-col space-y-3">
      ${Object.values(RESTAURANTS).map(r => `
      <div onclick="App.nav('restaurantDetail', {id:'${r.id}'})" class="rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest cursor-pointer">
        <div class="h-28 bg-surface-container-low flex items-center justify-center text-primary-container">${UI.icon("restaurant", "text-[32px]")}</div>
        <div class="p-space-16 flex items-center justify-between">
          <div class="flex flex-col min-w-0"><span class="font-title-md text-title-md truncate">${r.name}</span><span class="font-body-sm text-body-sm text-on-surface-variant">${r.tag}</span></div>
          <div class="flex flex-col items-end flex-shrink-0"><span class="font-label-md text-label-md text-primary font-bold">★ ${r.rating}</span><span class="font-label-sm text-label-sm text-on-surface-variant">${r.delivery}</span></div>
        </div>
      </div>`).join("")}
    </section>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.restaurantDetail = function (container, params) {
    const r = RESTAURANTS[params.id] || Object.values(RESTAURANTS)[0];
    const topbar = UI.topBar({ title: r.name, subtitle: r.tag, back: "App.back()", right: cartBadge() });
    const body = `
    <section class="h-32 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container">${UI.icon("restaurant", "text-[40px]")}</section>
    <section class="flex flex-col space-y-3">
      <h2 class="font-headline-sm text-headline-sm font-bold">Menu</h2>
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
    const total = cartTotal();
    if (!ACState.cart.items.length || ACState.cart.restaurant !== restId) return "";
    return `<div class="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[350px]">
      <button onclick="App.nav('cartRestaurant')" class="w-full h-14 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-lg flex items-center justify-between px-space-20">
        <span>Voir le panier (${ACState.cart.items.reduce((s, i) => s + i.qty, 0)})</span><span>${ACStore.fmtFCFA(total)}</span>
      </button>
    </div>`;
  }
  function cartTotal() { return ACState.cart.items.reduce((s, i) => s + i.price * i.qty, 0); }

  Screens._addToCart = function (restId, dishId) {
    if (ACState.cart.restaurant && ACState.cart.restaurant !== restId) {
      UI.openSheet(`<h3 class="font-headline-sm text-headline-sm font-bold mb-2">Nouveau panier ?</h3>
        <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-16">Votre panier contient déjà des plats d'un autre restaurant. Voulez-vous le vider et commencer un nouveau panier ?</p>
        ${UI.primaryButton("Vider et continuer", `Screens._resetCartAndAdd('${restId}','${dishId}')`)}
        <div class="mt-3">${UI.secondaryButton("Annuler", "UI.closeSheet()")}</div>`);
      return;
    }
    addDish(restId, dishId);
    App.replace(App.current.id, App.current.params);
    UI.toast("Ajouté au panier.", "success");
  };
  Screens._resetCartAndAdd = function (restId, dishId) {
    ACState.cart = { restaurant: null, items: [], market: [] };
    addDish(restId, dishId);
    UI.closeSheet();
    App.replace(App.current.id, App.current.params);
  };
  function addDish(restId, dishId) {
    const r = RESTAURANTS[restId];
    const d = r.menu.find(x => x.id === dishId);
    ACState.cart.restaurant = restId;
    const existing = ACState.cart.items.find(i => i.id === dishId);
    if (existing) existing.qty++;
    else ACState.cart.items.push({ id: dishId, name: d.name, price: d.price, qty: 1 });
  }

  Screens.cartRestaurant = function (container) {
    const r = RESTAURANTS[ACState.cart.restaurant];
    const total = cartTotal();
    const topbar = UI.topBar({ title: "Mon panier", subtitle: r ? r.name : "", back: "App.back()" });
    const body = !ACState.cart.items.length ? UI.emptyState({ icon: "shopping_cart", title: "Votre panier est vide", body: "Ajoutez des plats depuis un restaurant pour commencer une commande.", actionLabel: "Voir les restaurants", actionOnclick: "App.resetTo('restaurants')" }) : `
    <section class="flex flex-col space-y-2">
      ${ACState.cart.items.map(i => `
      <div class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16">
        <div class="flex flex-col"><span class="font-title-md text-title-md">${i.name}</span><span class="font-body-sm text-body-sm text-on-surface-variant">${ACStore.fmtFCFA(i.price)} x ${i.qty}</span></div>
        <div class="flex items-center space-x-2">
          <button onclick="Screens._cartQty('${i.id}',-1)" class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">${UI.icon("remove", "text-[16px]")}</button>
          <span class="font-label-lg text-label-lg w-4 text-center">${i.qty}</span>
          <button onclick="Screens._cartQty('${i.id}',1)" class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">${UI.icon("add", "text-[16px]")}</button>
        </div>
      </div>`).join("")}
    </section>
    <section class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex flex-col space-y-2">
      <div class="flex items-center justify-between font-body-md text-body-md"><span>Sous-total</span><span>${ACStore.fmtFCFA(total)}</span></div>
      <div class="flex items-center justify-between font-body-md text-body-md"><span>Livraison</span><span>${ACStore.fmtFCFA(500)}</span></div>
      <div class="flex items-center justify-between font-label-lg text-label-lg font-bold border-t border-outline-variant/30 pt-2"><span>Total</span><span class="text-primary">${ACStore.fmtFCFA(total + 500)}</span></div>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Passer la commande", "App.nav('checkoutRestaurant')", { icon: "arrow_forward" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._cartQty = function (id, delta) {
    const item = ACState.cart.items.find(i => i.id === id);
    item.qty += delta;
    if (item.qty <= 0) ACState.cart.items = ACState.cart.items.filter(i => i.id !== id);
    if (!ACState.cart.items.length) ACState.cart.restaurant = null;
    App.replace("cartRestaurant");
  };

  Screens.checkoutRestaurant = function (container) {
    const total = cartTotal() + 500;
    const topbar = UI.topBar({ title: "Confirmer la commande", back: "App.back()" });
    const body = `
    <section class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">${UI.icon("home_pin", "text-primary")}<span class="font-title-md text-title-md">${ACState.addresses[0] ? ACState.addresses[0].detail : ACState.user.city}</span></div>
      <button onclick="App.nav('addresses')" class="font-label-md text-label-md text-primary">Changer</button>
    </section>
    <section class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">${UI.icon("account_balance_wallet", "text-primary")}<span class="font-title-md text-title-md">Africa Wallet</span></div>
      <span class="font-body-sm text-body-sm text-on-surface-variant">Solde : ${ACStore.fmtFCFA(ACState.wallet.balance)}</span>
    </section>
    <section class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex items-center justify-between">
      <span class="font-title-md text-title-md">Total à payer</span><span class="font-label-lg text-label-lg font-bold text-primary">${ACStore.fmtFCFA(total)}</span>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Payer et commander", "Screens._payRestaurant()", { icon: "account_balance_wallet" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._payRestaurant = function () {
    const r = RESTAURANTS[ACState.cart.restaurant];
    const total = cartTotal() + 500;
    const res = ACStore.payFromWallet({ amount: total, label: "Commande " + (r ? r.name : "Restaurant"), service: "restaurant", pointsEarned: Math.round(total / 100) });
    if (!res.ok) { App.nav("paymentFailed", { retry: "checkoutRestaurant", amount: total, reason: res.reason }); return; }
    ACState.cart = { restaurant: null, items: [], market: [] };
    UI.toast("Commande confirmée, en préparation !", "success");
    App.resetTo("orderTracking", { service: "restaurant", label: r ? r.name : "Restaurant" });
  };

  Screens.orderTracking = function (container, params) {
    const topbar = UI.topBar({ title: "Suivi de commande", back: "App.nav('home')" });
    const steps = ["Commande reçue", "En préparation", "En livraison", "Livré"];
    const body = `
    <section class="flex flex-col space-y-space-16 py-space-8">
      ${steps.map((s, i) => `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-full ${i < 2 ? "bg-primary-container text-on-primary" : "bg-surface-container-high text-on-surface-variant"} flex items-center justify-center">${UI.icon(i < 2 ? "check" : "radio_button_unchecked", "text-[16px]")}</div>
        <span class="font-title-md text-title-md ${i < 2 ? "" : "text-on-surface-variant"}">${s}</span>
      </div>`).join("")}
    </section>
    <p class="font-body-sm text-body-sm text-on-surface-variant">Votre commande chez ${params.label || "le restaurant"} est en route. Suivez son avancement dans Activités.</p>
    <div class="pt-space-8">${UI.secondaryButton("Voir mes activités", "App.nav('activities')")}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
})();
