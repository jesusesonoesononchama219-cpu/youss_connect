(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const VEHICLES = [
    { id: "moto", label: "Moto", icon: "two_wheeler", base: 800, eta: "2 min" },
    { id: "eco", label: "Éco", icon: "directions_car", base: 1500, eta: "4 min" },
    { id: "confort", label: "Confort", icon: "airport_shuttle", base: 2500, eta: "6 min" }
  ];
  const trip = { destination: "", vehicle: "eco", driver: null };

  Screens.transport = function (container) {
    const topbar = UI.topBar({ title: "Transport", subtitle: "Où allez-vous ?", back: "App.nav('home')" });
    const body = `
    <section class="w-full flex flex-col space-y-3">
      <div class="flex items-center bg-surface-container-lowest border border-outline-variant/40 rounded-xl h-12 px-space-16 space-x-3">
        <span class="w-2.5 h-2.5 rounded-full bg-tertiary flex-shrink-0"></span>
        <span class="font-body-md text-body-md text-on-surface truncate">Position actuelle · ${ACState.user.city}</span>
      </div>
      <div class="flex items-center bg-surface-container-lowest border border-outline-variant/40 rounded-xl h-12 px-space-16 space-x-3">
        <span class="w-2.5 h-2.5 rounded-full bg-primary-container flex-shrink-0"></span>
        <input id="dest-input" value="${trip.destination}" placeholder="Adresse de destination" class="flex-1 bg-transparent focus:outline-none font-body-md text-body-md"/>
      </div>
    </section>
    <section class="w-full flex flex-col space-y-space-12">
      <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Adresses enregistrées</h2>
      <div class="flex flex-col space-y-2">
        ${ACState.addresses.map(a => `
        <div onclick="Screens._transportSetDest('${a.detail.replace(/'/g, "\\'")}')" class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-12 cursor-pointer active:scale-[0.99] transition-transform">
          <div class="flex items-center space-x-3">
            ${UI.icon(a.icon, "text-primary")}
            <div class="flex flex-col">
              <span class="font-title-md text-title-md">${a.label}</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">${a.detail}</span>
            </div>
          </div>
          ${UI.icon("chevron_right", "text-outline")}
        </div>`).join("")}
      </div>
    </section>
    <section class="w-full flex flex-col space-y-space-12">
      <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Type de véhicule</h2>
      <div class="flex flex-col space-y-2">
        ${VEHICLES.map(v => `
        <div onclick="Screens._transportSelectVehicle('${v.id}')" class="flex items-center justify-between rounded-xl p-space-16 border cursor-pointer transition-colors ${trip.vehicle === v.id ? "border-primary-container bg-surface-container-low" : "border-outline-variant/30 bg-surface-container-lowest"}">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container">${UI.icon(v.icon)}</div>
            <div class="flex flex-col">
              <span class="font-title-md text-title-md">${v.label}</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">Arrivée estimée ${v.eta}</span>
            </div>
          </div>
          <span class="font-label-lg text-label-lg font-bold text-primary">dès ${ACStore.fmtFCFA(v.base)}</span>
        </div>`).join("")}
      </div>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Voir l'estimation", "Screens._transportEstimate()", { icon: "arrow_forward" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._transportSetDest = function (val) {
    trip.destination = val;
    App.replace("transport");
  };
  Screens._transportSelectVehicle = function (id) {
    trip.vehicle = id;
    App.replace("transport");
  };

  Screens._transportEstimate = function () {
    const dest = document.getElementById("dest-input").value.trim();
    trip.destination = dest || trip.destination;
    if (!trip.destination) { UI.toast("Veuillez indiquer une destination.", "error"); return; }
    App.nav("transportEstimate");
  };

  Screens.transportEstimate = function (container) {
    const v = VEHICLES.find(x => x.id === trip.vehicle);
    const price = v.base + Math.round(Math.random() * 400);
    trip.price = price;
    const topbar = UI.topBar({ title: "Estimation du trajet", back: "App.back()" });
    const body = `
    <section class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-20 flex flex-col items-center text-center space-y-space-8">
      <div class="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary-container">${UI.icon(v.icon, "text-[32px]")}</div>
      <h2 class="font-headline-md text-headline-md font-bold">${v.label}</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Vers ${trip.destination}</p>
      <p class="font-display-lg text-display-lg text-primary">${ACStore.fmtFCFA(price)}</p>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Arrivée du chauffeur estimée à ${v.eta}</p>
    </section>
    <section class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        ${UI.icon("account_balance_wallet", "text-primary")}
        <span class="font-title-md text-title-md">Africa Wallet</span>
      </div>
      <span class="font-label-md text-label-md text-on-surface-variant">Solde : ${ACStore.fmtFCFA(ACState.wallet.balance)}</span>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Confirmer et chercher un chauffeur", "Screens._transportSearch()", { icon: "search" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._transportSearch = function () {
    App.nav("transportSearching");
    setTimeout(() => {
      if (App.current.id === "transportSearching") {
        trip.driver = { name: "Fidèle A.", car: "Toyota Corolla · AB 1234 RB", rating: 4.8, phone: "+229 96 11 22 33", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiNsNoL3bFz6CndYM6dyvtP5xsVzyyBs-5Ikb8DpzmFLN5qwh-O2mnTHCJkhp5uYKoO6DmrTi7VOJ9HgEBibYplwh9q735sMKe-pqk8H4rrcAARSM1MhYmF3mM6E-efCCWt8bwKDDCokR9Q6BiPs2EaVMErhJdSKyNrIXpT-ZP9C8XCRemBWWPgnmRYpR2QfEDtrcvgd_vcJfw4f9w8thWKKzBa-tRD5Mv6m4iQb94wjNZagPx-TQ" };
        App.replace("transportInRide");
      }
    }, 2600);
  };

  Screens.transportSearching = function (container) {
    const topbar = UI.topBar({ title: "Recherche d'un chauffeur", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center justify-center text-center space-y-space-20 py-space-40">
      <div class="relative w-24 h-24 rounded-full bg-primary-container/10 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full pulse-ring"></div>
        ${UI.icon("directions_car", "text-primary-container text-[40px]")}
      </div>
      <h2 class="font-headline-sm text-headline-sm font-bold">Recherche d'un chauffeur à proximité...</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">Vers ${trip.destination}</p>
      <button onclick="App.nav('home')" class="font-label-md text-label-md text-error">Annuler la recherche</button>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.transportInRide = function (container) {
    const d = trip.driver;
    const topbar = UI.topBar({ title: "Course en cours", right: `<button onclick="Screens._transportSOS()" class="w-9 h-9 rounded-full bg-error-container flex items-center justify-center text-on-error-container">${UI.icon("sos")}</button>` });
    const body = `
    <section class="w-full h-40 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-on-surface-variant relative overflow-hidden" style="height:160px">
      ${UI.icon("map", "text-[48px] text-primary-container/40")}
      <span class="absolute bottom-2 left-2 font-label-sm text-label-sm bg-surface-container-lowest/90 px-2 py-1 rounded-md">Suivi en direct vers ${trip.destination}</span>
    </section>
    <section class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex items-center space-x-space-12">
      <img class="w-14 h-14 rounded-full object-cover" src="${d.avatar}"/>
      <div class="flex flex-col flex-1 min-w-0">
        <span class="font-title-md text-title-md">${d.name}</span>
        <span class="font-body-sm text-body-sm text-on-surface-variant">${d.car}</span>
        <span class="font-body-sm text-body-sm text-primary">★ ${d.rating}</span>
      </div>
      <a href="tel:${d.phone}" class="w-10 h-10 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center">${UI.icon("call")}</a>
    </section>
    <section class="w-full flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16">
      <span class="font-body-md text-body-md">Montant du trajet</span>
      <span class="font-label-lg text-label-lg font-bold text-primary">${ACStore.fmtFCFA(trip.price)}</span>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Terminer la course", "Screens._transportFinish()", { icon: "flag" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._transportSOS = function () {
    App.nav("sos");
  };

  Screens.sos = function (container) {
    const topbar = UI.topBar({ title: "Assistance SOS", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center justify-center text-center space-y-space-20 py-space-24">
      <div class="w-20 h-20 rounded-full bg-error-container flex items-center justify-center text-on-error-container">${UI.icon("sos", "text-[36px]")}</div>
      <h2 class="font-headline-md text-headline-md font-bold">Besoin d'aide immédiate ?</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">Votre position et les détails de votre course seront partagés avec le support KYA CORPORATION et vos contacts d'urgence.</p>
      <div class="w-full px-space-20 space-y-3">
        ${UI.primaryButton("Alerter le support KYA", "Screens._sosAlert()", { icon: "campaign" })}
        ${UI.secondaryButton("Retour à la course", "App.back()")}
      </div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._sosAlert = function () {
    ACStore.addNotification("Alerte SOS envoyée", "Le support KYA CORPORATION a été notifié de votre position.", "transport");
    ACStore.emit();
    UI.toast("Support alerté. Restez en ligne.", "success");
    App.back();
  };

  Screens._transportFinish = function () {
    App.nav("transportRating");
  };

  let ratingValue = 5;
  Screens.transportRating = function (container) {
    const topbar = UI.topBar({ title: "Course terminée" });
    const body = `
    <div class="flex-1 flex flex-col items-center text-center space-y-space-16 py-space-16">
      <div class="w-16 h-16 rounded-full bg-tertiary-container/10 text-tertiary flex items-center justify-center">${UI.icon("check_circle", "text-[36px]", true)}</div>
      <h2 class="font-headline-md text-headline-md font-bold">Trajet terminé</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Comment s'est passée votre course avec ${trip.driver.name} ?</p>
      <div class="flex space-x-2">
        ${[1,2,3,4,5].map(i => `<button onclick="Screens._setRating(${i})" class="text-[32px] ${i <= ratingValue ? "text-primary-container" : "text-outline-variant"}">${UI.icon("star", "", i <= ratingValue)}</button>`).join("")}
      </div>
      <div class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex items-center justify-between">
        <span class="font-body-md text-body-md">Total à payer</span>
        <span class="font-label-lg text-label-lg font-bold text-primary">${ACStore.fmtFCFA(trip.price)}</span>
      </div>
      <div class="w-full pt-space-8">${UI.primaryButton("Payer avec Africa Wallet", "Screens._transportPay()", { icon: "account_balance_wallet" })}</div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._setRating = function (v) { ratingValue = v; App.replace("transportRating"); };

  Screens._transportPay = function () {
    const res = ACStore.payFromWallet({
      amount: trip.price,
      label: "Course vers " + trip.destination,
      service: "transport",
      pointsEarned: 25
    });
    if (!res.ok) {
      App.nav("paymentFailed", { retry: "transportRating", amount: trip.price, reason: res.reason });
      return;
    }
    UI.toast("Paiement effectué. Merci d'avoir voyagé avec AFRICA CONNECT !", "success");
    trip.destination = ""; trip.driver = null;
    App.resetTo("home");
  };

  Screens.paymentFailed = function (container, params) {
    const offline = params.reason === "offline";
    const topbar = UI.topBar({ title: offline ? "Connexion impossible" : "Paiement impossible" });
    const body = offline ? `
    <div class="flex-1 flex flex-col items-center text-center space-y-space-16 py-space-24">
      <div class="w-16 h-16 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">${UI.icon("wifi_off", "text-[36px]")}</div>
      <h2 class="font-headline-md text-headline-md font-bold">Vous semblez hors ligne</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[280px]">Les paiements Africa Wallet nécessitent une connexion internet. Vérifiez votre réseau puis réessayez.</p>
      <div class="w-full px-space-20 space-y-3">
        ${UI.primaryButton("Réessayer", `App.nav('${params.retry || "home"}')`, { icon: "refresh" })}
        ${UI.secondaryButton("Retour à l'accueil", "App.resetTo('home')")}
      </div>
    </div>` : `
    <div class="flex-1 flex flex-col items-center text-center space-y-space-16 py-space-24">
      <div class="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center">${UI.icon("error", "text-[36px]")}</div>
      <h2 class="font-headline-md text-headline-md font-bold">Solde Africa Wallet insuffisant</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[280px]">Il vous manque ${ACStore.fmtFCFA(Math.max(0, params.amount - ACState.wallet.balance))} pour finaliser ce paiement de ${ACStore.fmtFCFA(params.amount)}.</p>
      <div class="w-full px-space-20 space-y-3">
        ${UI.primaryButton("Recharger mon Wallet", "App.nav('walletTopup')", { icon: "add" })}
        ${UI.secondaryButton("Retour", "App.back()")}
      </div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
})();
