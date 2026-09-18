(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const trip = {
    from: "Cadjèhoun",
    to: "Aéroport de Cadjehoun",
    mode: "negotiate", // negotiate | fixed
    offer: 2600,
    driverOffer: 2800,
    price: 3800,
    driver: null
  };

  /* Écran 3 — Transport */
  Screens.transport = function (container) {
    const topbar = UI.topBar({ title: "Transport", subtitle: "Où allez-vous ?", back: "App.nav('home')" });
    const body = `
    <section class="w-full h-36 rounded-2xl bg-surface-container-low border border-outline-variant/30 relative overflow-hidden flex items-center justify-center"
      style="background:linear-gradient(160deg,#efe8f6,#d4f5e4)">
      ${UI.icon("map", "text-[56px] text-primary/25")}
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="w-3 h-3 rounded-full bg-yc-green shadow-lg"></div>
        <div class="absolute w-24 h-0.5 bg-primary/40 rotate-12"></div>
        <div class="absolute translate-x-10 -translate-y-4 w-3 h-3 rounded-full bg-primary"></div>
      </div>
      <span class="absolute bottom-2 left-2 font-label-sm text-label-sm bg-white/90 px-2 py-1 rounded-md text-on-surface-variant">${ACState.user.city}</span>
    </section>

    <section class="w-full flex flex-col space-y-2">
      <div class="flex items-center bg-surface-container-lowest border border-outline-variant/40 rounded-xl h-12 px-space-16 space-x-3">
        <span class="w-2.5 h-2.5 rounded-full bg-yc-green flex-shrink-0"></span>
        <input id="from-input" value="${trip.from}" placeholder="Départ" class="flex-1 bg-transparent focus:outline-none font-body-md text-body-md"/>
      </div>
      <div class="flex items-center bg-surface-container-lowest border border-outline-variant/40 rounded-xl h-12 px-space-16 space-x-3">
        <span class="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0"></span>
        <input id="dest-input" value="${trip.to}" placeholder="Destination" class="flex-1 bg-transparent focus:outline-none font-body-md text-body-md"/>
      </div>
    </section>

    <section class="w-full flex flex-col space-y-space-12">
      <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Choisir le tarif</h2>
      <button type="button" onclick="Screens._transportMode('negotiate')"
        class="w-full text-left rounded-2xl p-space-16 border-2 transition-colors ${trip.mode === "negotiate" ? "border-yc-green bg-yc-green/5" : "border-outline-variant/30 bg-surface-container-lowest"}">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            ${UI.icon("handshake", "text-yc-green text-[28px]")}
            <div>
              <p class="font-title-md text-title-md font-bold">Négocier le prix</p>
              <p class="font-body-sm text-body-sm text-on-surface-variant">À partir de 2 500 FCFA</p>
            </div>
          </div>
          ${trip.mode === "negotiate" ? UI.icon("check_circle", "text-yc-green text-[22px]", true) : ""}
        </div>
      </button>
      <button type="button" onclick="Screens._transportMode('fixed')"
        class="w-full text-left rounded-2xl p-space-16 border-2 transition-colors ${trip.mode === "fixed" ? "border-primary bg-primary/5" : "border-outline-variant/30 bg-surface-container-lowest"}">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            ${UI.icon("sell", "text-primary text-[28px]")}
            <div>
              <p class="font-title-md text-title-md font-bold">Prix fixe</p>
              <p class="font-body-sm text-body-sm text-on-surface-variant">3 800 FCFA · sans négociation</p>
            </div>
          </div>
          ${trip.mode === "fixed" ? UI.icon("check_circle", "text-primary text-[22px]", true) : ""}
        </div>
      </button>
    </section>

    <div class="pt-space-8">
      ${UI.primaryButton("Demander un Youss", "Screens._transportRequest()", { icon: "directions_car" })}
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._transportMode = function (mode) {
    trip.mode = mode;
    App.replace("transport");
  };

  Screens._transportRequest = function () {
    const from = (document.getElementById("from-input") || {}).value;
    const dest = (document.getElementById("dest-input") || {}).value;
    trip.from = (from || trip.from).trim();
    trip.to = (dest || trip.to).trim();
    if (!trip.to) { UI.toast("Indiquez une destination.", "error"); return; }
    if (trip.mode === "negotiate") {
      trip.driverOffer = 2800;
      trip.offer = 2600;
      App.nav("transportNegotiate");
    } else {
      trip.price = 3800;
      Screens._transportSearch();
    }
  };

  /* Écran 4 — Négociation */
  Screens.transportNegotiate = function (container) {
    const topbar = UI.topBar({ title: "Négociation", back: "App.back()" });
    const body = `
    <section class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-16 flex items-center gap-3">
      <img class="w-14 h-14 rounded-full object-cover" src="https://i.pravatar.cc/100?u=mamadou" alt=""/>
      <div class="flex-1 min-w-0">
        <p class="font-title-md text-title-md font-bold">Mamadou</p>
        <p class="font-body-sm text-body-sm text-on-surface-variant">Toyota Corolla · ★ 4,8</p>
      </div>
      <div class="text-center px-3 py-2 rounded-xl bg-primary/10">
        <p class="font-label-sm text-label-sm text-on-surface-variant">Temps</p>
        <p class="font-headline-sm text-headline-sm font-bold text-primary" id="nego-timer">02:45</p>
      </div>
    </section>

    <section class="w-full grid grid-cols-2 gap-3">
      <div class="rounded-2xl border border-outline-variant/30 p-space-16 text-center bg-surface-container-lowest">
        <p class="font-label-sm text-label-sm text-on-surface-variant mb-1">Prix proposé</p>
        <p class="font-headline-sm text-headline-sm font-extrabold text-on-surface">${ACStore.fmtFCFA(trip.driverOffer)}</p>
      </div>
      <div class="rounded-2xl border-2 border-yc-green/40 p-space-16 text-center bg-yc-green/5">
        <p class="font-label-sm text-label-sm text-on-surface-variant mb-1">Votre offre</p>
        <p class="font-headline-sm text-headline-sm font-extrabold text-yc-green">${ACStore.fmtFCFA(trip.offer)}</p>
      </div>
    </section>

    <section class="w-full flex items-center justify-center gap-4">
      <button type="button" onclick="Screens._negoAdjust(-100)" class="w-12 h-12 rounded-full border border-outline-variant/40 bg-white flex items-center justify-center text-primary font-bold text-xl">−</button>
      <span class="font-body-sm text-body-sm text-on-surface-variant">Ajuster l'offre</span>
      <button type="button" onclick="Screens._negoAdjust(100)" class="w-12 h-12 rounded-full border border-outline-variant/40 bg-white flex items-center justify-center text-primary font-bold text-xl">+</button>
    </section>

    <div class="w-full flex gap-3">
      <button type="button" onclick="App.back()" class="flex-1 h-12 rounded-xl border border-outline-variant/50 font-label-lg text-label-lg font-semibold">Refuser</button>
      <button type="button" onclick="Screens._negoAccept()" class="flex-1 h-12 rounded-xl bg-yc-green text-white font-label-lg text-label-lg font-bold shadow-sm">Accepter</button>
    </div>

    <section class="w-full rounded-2xl bg-surface-container-low p-space-12 space-y-2">
      <p class="font-label-sm text-label-sm text-on-surface-variant">Message</p>
      <div class="bg-white rounded-xl px-3 py-2 font-body-sm text-body-sm text-on-surface shadow-sm max-w-[85%]">
        Bonjour, je peux faire ${ACStore.fmtFCFA(trip.driverOffer)} ?
      </div>
      <div class="bg-primary text-white rounded-xl px-3 py-2 font-body-sm text-body-sm ml-auto max-w-[85%] text-right">
        Je propose ${ACStore.fmtFCFA(trip.offer)}
      </div>
    </section>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._negoAdjust = function (delta) {
    trip.offer = Math.max(1500, trip.offer + delta);
    App.replace("transportNegotiate");
  };

  Screens._negoAccept = function () {
    trip.price = Math.round((trip.offer + trip.driverOffer) / 2);
    UI.toast("Prix convenu : " + ACStore.fmtFCFA(trip.price), "success");
    Screens._transportSearch();
  };

  Screens._transportSearch = function () {
    App.nav("transportSearching");
    setTimeout(() => {
      if (App.current && App.current.id === "transportSearching") {
        trip.driver = {
          name: "Mamadou",
          car: "Toyota Corolla",
          plate: "AB-1234-RB",
          rating: 4.8,
          phone: "+229 96 11 22 33",
          avatar: "https://i.pravatar.cc/100?u=mamadou"
        };
        App.replace("transportInRide");
      }
    }, 2200);
  };

  Screens.transportSearching = function (container) {
    const topbar = UI.topBar({ title: "Recherche", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center justify-center text-center space-y-space-20 py-space-40">
      <div class="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full pulse-ring"></div>
        ${UI.icon("directions_car", "text-primary text-[40px]")}
      </div>
      <h2 class="font-headline-sm text-headline-sm font-bold">Recherche d'un chauffeur...</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">${trip.from} → ${trip.to}</p>
      <button type="button" onclick="App.nav('home')" class="font-label-md text-label-md text-error">Annuler</button>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  /* Écran 5 — Trajet en cours */
  Screens.transportInRide = function (container) {
    const d = trip.driver;
    const topbar = UI.topBar({
      title: "Trajet en cours",
      right: `<button type="button" onclick="Screens._transportSOS()" class="h-9 px-3 rounded-full bg-error text-white font-label-md text-label-md font-bold flex items-center gap-1">${UI.icon("sos", "text-[16px]")} SOS</button>`
    });
    const body = `
    <section class="w-full h-44 rounded-2xl relative overflow-hidden border border-outline-variant/30"
      style="background:linear-gradient(160deg,#dfe8f5,#c8e6d4)">
      ${UI.icon("map", "absolute text-[64px] text-primary/20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2")}
      <div class="absolute top-3 left-3 right-3 flex justify-between">
        <span class="inline-flex items-center gap-1 h-8 px-3 rounded-full bg-yc-green text-white font-label-sm text-label-sm font-bold">
          ${UI.icon("verified_user", "text-[14px]")} En sécurité
        </span>
        <button type="button" onclick="UI.toast('Lien de suivi partagé', 'success')"
          class="h-8 px-3 rounded-full bg-white/95 font-label-sm text-label-sm font-semibold text-primary shadow-sm">
          Partager le trajet
        </button>
      </div>
      <div class="absolute bottom-3 left-3 right-3 bg-white/95 rounded-xl px-3 py-2 flex justify-between items-center shadow-sm">
        <div>
          <p class="font-label-sm text-label-sm text-on-surface-variant">Arrivée prévue</p>
          <p class="font-title-md text-title-md font-bold">10:45</p>
        </div>
        <p class="font-body-sm text-body-sm text-on-surface-variant">12 min · 6,2 km</p>
      </div>
    </section>

    <section class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-16 flex items-center gap-3">
      <img class="w-14 h-14 rounded-full object-cover" src="${d.avatar}" alt=""/>
      <div class="flex-1 min-w-0">
        <p class="font-title-md text-title-md font-bold">${d.name} · ★ ${d.rating}</p>
        <p class="font-body-sm text-body-sm text-on-surface-variant">${d.car} · ${d.plate}</p>
      </div>
      <a href="tel:${d.phone}" class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">${UI.icon("call")}</a>
    </section>

    <section class="w-full flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16">
      <span class="font-body-md text-body-md">Montant convenu</span>
      <span class="font-label-lg text-label-lg font-bold text-primary">${ACStore.fmtFCFA(trip.price)}</span>
    </section>

    <div class="pt-space-8">${UI.primaryButton("Terminer la course", "Screens._transportFinish()", { icon: "flag" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._transportSOS = function () { App.nav("sos"); };

  Screens.sos = function (container) {
    const topbar = UI.topBar({ title: "Assistance SOS", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center justify-center text-center space-y-space-20 py-space-24">
      <div class="w-20 h-20 rounded-full bg-error-container flex items-center justify-center text-on-error-container">${UI.icon("sos", "text-[36px]")}</div>
      <h2 class="font-headline-md text-headline-md font-bold">Besoin d'aide immédiate ?</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">Votre position et les détails de votre course seront partagés avec le support Dynasty KYA.</p>
      <div class="w-full space-y-3">
        ${UI.primaryButton("Alerter le support", "Screens._sosAlert()", { icon: "campaign" })}
        ${UI.secondaryButton("Retour à la course", "App.back()")}
      </div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._sosAlert = function () {
    ACStore.addNotification("Alerte SOS envoyée", "Le support Dynasty KYA a été notifié.", "transport");
    ACStore.emit();
    UI.toast("Support alerté. Restez en ligne.", "success");
    App.back();
  };

  Screens._transportFinish = function () { App.nav("transportRating"); };

  let ratingValue = 5;
  Screens.transportRating = function (container) {
    const topbar = UI.topBar({ title: "Course terminée" });
    const body = `
    <div class="flex-1 flex flex-col items-center text-center space-y-space-16 py-space-16">
      <div class="w-16 h-16 rounded-full bg-yc-green/15 text-yc-green flex items-center justify-center">${UI.icon("check_circle", "text-[36px]", true)}</div>
      <h2 class="font-headline-md text-headline-md font-bold">Trajet terminé</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Comment s'est passée votre course avec ${trip.driver.name} ?</p>
      <div class="flex space-x-2">
        ${[1, 2, 3, 4, 5].map((i) => `<button type="button" onclick="Screens._setRating(${i})" class="text-[32px] ${i <= ratingValue ? "text-yc-green" : "text-outline-variant"}">${UI.icon("star", "", i <= ratingValue)}</button>`).join("")}
      </div>
      <div class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex items-center justify-between">
        <span class="font-body-md text-body-md">Total à payer</span>
        <span class="font-label-lg text-label-lg font-bold text-primary">${ACStore.fmtFCFA(trip.price)}</span>
      </div>
      <div class="w-full pt-space-8">${UI.primaryButton("Payer avec Youss Wallet", "Screens._transportPay()", { icon: "account_balance_wallet", green: true })}</div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._setRating = function (v) { ratingValue = v; App.replace("transportRating"); };

  Screens._transportPay = function () {
    const res = ACStore.payFromWallet({
      amount: trip.price,
      label: "Course · " + trip.to,
      service: "transport",
      pointsEarned: 25
    });
    if (!res || !res.ok) {
      App.nav("paymentFailed");
      return;
    }
    UI.toast("Paiement réussi · +25 Youss Bonus", "success");
    App.resetTo("home");
  };

  Screens.paymentFailed = function (container) {
    const topbar = UI.topBar({ title: "Paiement", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center justify-center text-center space-y-space-16 py-space-40">
      ${UI.icon("error", "text-error text-[48px]")}
      <h2 class="font-headline-sm text-headline-sm font-bold">Paiement impossible</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">Solde insuffisant ou hors ligne. Rechargez votre Youss Wallet.</p>
      ${UI.primaryButton("Recharger", "App.nav('walletTopup')", { green: true })}
      ${UI.secondaryButton("Retour", "App.back()")}
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  /* Compat anciennes routes */
  Screens.transportEstimate = Screens.transport;
})();
