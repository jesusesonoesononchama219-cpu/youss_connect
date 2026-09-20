(function () {
  "use strict";
  window.Screens = window.Screens || {};

  Screens.profile = function (container) {
    const pts = ACState.rewards.points;
    const next = ACState.rewards.nextTierAt;
    const pct = Math.min(100, Math.round((pts / next) * 100));
    const topbar = `
    <div class="w-full px-space-20 py-space-12 flex items-center justify-between bg-surface flex-shrink-0">
      <div class="flex items-center gap-3">
        <img class="w-14 h-14 rounded-full object-cover border-2 border-primary" src="${ACState.user.avatar}" alt=""/>
        <div>
          <h1 class="font-headline-sm text-headline-sm font-bold">${ACState.user.name}</h1>
          <button type="button" onclick="App.nav('editProfile')" class="font-label-md text-label-md text-primary font-semibold">Voir mon profil</button>
        </div>
      </div>
      <button type="button" onclick="App.nav('settings')" class="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface">${UI.icon("settings")}</button>
    </div>`;

    const body = `
    <section class="w-full rounded-2xl bg-gradient-to-br from-primary to-primary-container p-space-16 text-white shadow-lg shadow-primary/15">
      <div class="flex items-center justify-between mb-space-12">
        <div>
          <p class="font-label-sm text-label-sm text-white/70 uppercase tracking-wider">Youss Bonus</p>
          <p class="font-headline-md text-headline-md font-extrabold">${pts.toLocaleString("fr-FR")} pts</p>
        </div>
        <button type="button" onclick="App.nav('rewards')" class="h-9 px-3 rounded-xl bg-yc-green font-label-md text-label-md font-bold">Récompenses</button>
      </div>
      <div class="flex justify-between font-label-sm text-label-sm text-white/80 mb-1">
        <span>${ACState.rewards.tier}</span>
        <span>${ACState.rewards.nextTier}</span>
      </div>
      <div class="h-2 rounded-full bg-white/20 overflow-hidden">
        <div class="h-full rounded-full bg-yc-green" style="width:${pct}%"></div>
      </div>
      <p class="font-label-sm text-label-sm text-white/60 mt-2">${next - pts} pts pour passer ${ACState.rewards.nextTier}</p>
    </section>

    <section class="w-full flex flex-col space-y-2">
      ${menuRow("directions_car", "Mes courses", "App.nav('activities')")}
      ${menuRow("local_shipping", "Mes livraisons", "App.nav('activities')")}
      ${menuRow("favorite", "Mes favoris", "App.nav('addresses')")}
      ${menuRow("home_pin", "Mes adresses", "App.nav('addresses')")}
      ${menuRow("logout", "Déconnexion", "Screens._logout()", true)}
    </section>`;
    Shell.render(container, { topbar, body, nav: "profile" });
  };

  function statCard(value, label, target) {
    return `<div onclick="App.nav('${target}')" class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-12 flex flex-col items-center cursor-pointer">
      <span class="font-title-md text-title-md font-bold text-primary">${value}</span>
      <span class="font-label-sm text-label-sm text-on-surface-variant">${label}</span>
    </div>`;
  }
  function menuRow(icon, label, onclick, danger) {
    return `<div onclick="${onclick}" class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 cursor-pointer">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-full ${danger ? "bg-error-container text-on-error-container" : "bg-surface-container-low text-primary"} flex items-center justify-center">${UI.icon(icon)}</div>
        <span class="font-title-md text-title-md ${danger ? "text-error" : ""}">${label}</span>
      </div>
      ${UI.icon("chevron_right", "text-outline")}
    </div>`;
  }
  Screens._logout = function () {
    UI.openSheet(`
      <h3 class="font-headline-sm text-headline-sm font-bold mb-space-8">Se déconnecter ?</h3>
      <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-20">Vous devrez vous reconnecter avec votre numéro de téléphone pour accéder à nouveau à YOUSS CONNECT.</p>
      ${UI.primaryButton("Déconnexion", "Screens._confirmLogout()")}
      <div class="mt-3">${UI.secondaryButton("Annuler", "UI.closeSheet()")}</div>
    `);
  };
  Screens._confirmLogout = function () {
    UI.closeSheet();
    ACState.session.authenticated = false;
    App.resetTo("splash");
  };

  Screens.editProfile = function (container) {
    const topbar = UI.topBar({ title: "Modifier mon profil", back: "App.back()" });
    const body = `
    ${f("ep-name", "Nom complet", ACState.user.fullName)}
    ${f("ep-email", "Email", ACState.user.email)}
    ${f("ep-city", "Ville", ACState.user.city)}
    <div class="pt-space-8">${UI.primaryButton("Enregistrer", "Screens._saveProfile()")}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  function f(id, label, val) {
    return `<label class="flex flex-col space-y-1">
      <span class="font-label-md text-label-md text-on-surface-variant">${label}</span>
      <input id="${id}" value="${val}" class="h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 font-body-md text-body-md focus:outline-none"/>
    </label>`;
  }
  Screens._saveProfile = function () {
    ACState.user.fullName = document.getElementById("ep-name").value.trim() || ACState.user.fullName;
    ACState.user.name = ACState.user.fullName.split(" ")[0];
    ACState.user.email = document.getElementById("ep-email").value.trim();
    ACState.user.city = document.getElementById("ep-city").value.trim() || ACState.user.city;
    UI.toast("Profil mis à jour.", "success");
    ACStore.emit();
    App.nav("profile");
  };

  Screens.addresses = function (container) {
    const topbar = UI.topBar({ title: "Adresses enregistrées", back: "App.back()" });
    const body = `
    <section class="w-full flex flex-col space-y-2">
      ${ACState.addresses.map(a => `
      <div class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16">
        <div class="flex items-center space-x-3">${UI.icon(a.icon, "text-primary")}<div class="flex flex-col"><span class="font-title-md text-title-md">${a.label}</span><span class="font-body-sm text-body-sm text-on-surface-variant">${a.detail}</span></div></div>
        <button onclick="Screens._removeAddress('${a.id}')" class="text-outline">${UI.icon("delete", "text-[18px]")}</button>
      </div>`).join("")}
    </section>
    <div class="pt-space-8">${UI.primaryButton("Ajouter une adresse", "App.nav('addAddress')", { icon: "add" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._removeAddress = function (id) {
    ACState.addresses = ACState.addresses.filter(a => a.id !== id);
    ACStore.emit();
    UI.toast("Adresse supprimée.", "info");
  };
  Screens.addAddress = function (container) {
    const topbar = UI.topBar({ title: "Nouvelle adresse", back: "App.back()" });
    const body = `
    ${f("na-label", "Nom (ex : Domicile)", "")}
    ${f("na-detail", "Adresse", "")}
    <div class="pt-space-8">${UI.primaryButton("Enregistrer l'adresse", "Screens._saveAddress()")}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._saveAddress = function () {
    const label = document.getElementById("na-label").value.trim();
    const detail = document.getElementById("na-detail").value.trim();
    if (!label || !detail) { UI.toast("Veuillez remplir tous les champs.", "error"); return; }
    ACState.addresses.push({ id: ACStore.uid("addr"), label, detail, icon: "place" });
    ACStore.emit();
    UI.toast("Adresse ajoutée.", "success");
    App.nav("addresses");
  };

  Screens.paymentMethods = function (container) {
    const topbar = UI.topBar({ title: "Moyens de paiement", back: "App.back()" });
    const body = `
    <section class="w-full flex flex-col space-y-2">
      <div class="flex items-center justify-between bg-surface-container-lowest border border-primary-container rounded-xl p-space-16">
        <div class="flex items-center space-x-3">${UI.icon("account_balance_wallet", "text-primary")}<span class="font-title-md text-title-md">Africa Wallet</span></div>
        ${UI.badge("Par défaut", "primary")}
      </div>
      <div class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16">
        <div class="flex items-center space-x-3">${UI.icon("smartphone", "text-primary")}<span class="font-title-md text-title-md">Mobile Money · MTN</span></div>
        ${UI.icon("chevron_right", "text-outline")}
      </div>
    </section>
    <div class="pt-space-8">${UI.secondaryButton("Ajouter un moyen de paiement", "Screens._addPaymentInfo()")}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._addPaymentInfo = function () { UI.toast("Fonctionnalité disponible après vérification KYC.", "info"); };

  Screens.security = function (container) {
    const topbar = UI.topBar({ title: "Sécurité du compte", back: "App.back()" });
    const body = `
    <section class="w-full flex flex-col space-y-2">
      ${menuRow("password", "Changer mon code PIN", "App.nav('securityPin', {action:'changePin'})")}
      ${menuRow("fingerprint", "Authentification biométrique", "Screens._toggleBio()")}
      ${menuRow("devices", "Sessions actives", "App.nav('settings')")}
    </section>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._toggleBio = function () { UI.toast("Préférence biométrique mise à jour.", "success"); };

  Screens.settings = function (container) {
    const topbar = UI.topBar({ title: "Paramètres", back: "App.back()" });
    const body = `
    <section class="w-full flex flex-col space-y-2">
      ${menuRow("language", "Langue · Français", "Screens._toggleLang()")}
      ${menuRow("notifications", "Préférences de notifications", "App.nav('notifications')")}
      ${menuRow("info", "À propos de KYA CORPORATION", "Screens._aboutSheet()")}
    </section>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._toggleLang = function () { UI.toast("Langue : Français (par défaut).", "info"); };
  Screens._aboutSheet = function () {
    UI.openSheet(`<h3 class="font-headline-sm text-headline-sm font-bold mb-2">YOUSS CONNECT</h3>
      <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-16">Une seule application pour vivre l'Afrique au quotidien. Développée par KYA CORPORATION.</p>
      ${UI.secondaryButton("Fermer", "UI.closeSheet()")}`);
  };
})();
