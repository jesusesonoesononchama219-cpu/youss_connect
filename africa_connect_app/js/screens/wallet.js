(function () {
  "use strict";
  window.Screens = window.Screens || {};

  Screens.wallet = function (container) {
    const topbar = UI.topBar({ title: "Africa Wallet", subtitle: "Votre portefeuille unique", back: "App.nav('home')" });
    const body = `
    <section class="w-full rounded-xl bg-primary-container text-on-primary p-space-20 flex flex-col space-y-space-8 relative overflow-hidden">
      <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
      <span class="font-label-md text-label-md opacity-80">Solde disponible</span>
      <span class="font-display-lg text-display-lg">${ACStore.fmtFCFA(ACState.wallet.balance)}</span>
      <span class="font-body-sm text-body-sm opacity-80">${ACState.user.fullName}</span>
    </section>
    <section class="w-full grid grid-cols-4 gap-2">
      ${walletAction("add", "Recharger", "App.nav('walletTopup')")}
      ${walletAction("north_east", "Envoyer", "App.nav('walletSend')")}
      ${walletAction("south_west", "Recevoir", "App.nav('walletReceive')")}
      ${walletAction("qr_code_scanner", "QR Pay", "App.nav('walletQrPay')")}
    </section>
    <section class="w-full flex flex-col space-y-space-12">
      <h2 class="font-headline-sm text-headline-sm font-bold">Transactions récentes</h2>
      <div class="flex flex-col space-y-2">
        ${ACState.wallet.transactions.slice(0, 12).map(t => `
        <div onclick="App.nav('walletTxnDetail', {id:'${t.id}'})" class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-12 cursor-pointer">
          <div class="flex items-center space-x-3 min-w-0">
            <div class="w-9 h-9 rounded-full ${t.type === "credit" ? "bg-tertiary-container/10 text-tertiary" : "bg-surface-container-low text-primary"} flex items-center justify-center flex-shrink-0">
              ${UI.icon(t.type === "credit" ? "south_west" : "north_east", "text-[18px]")}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-title-md text-title-md truncate">${t.label}</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">${t.date}</span>
            </div>
          </div>
          <span class="font-label-lg text-label-lg font-bold ${t.type === "credit" ? "text-tertiary" : "text-on-surface"}">${t.type === "credit" ? "+" : ""}${ACStore.fmtFCFA(t.amount)}</span>
        </div>`).join("")}
      </div>
    </section>`;
    Shell.render(container, { topbar, body, nav: "wallet" });
  };

  function walletAction(icon, label, onclick) {
    return `<div onclick="${onclick}" class="flex flex-col items-center space-y-1 cursor-pointer active:scale-95 transition-transform">
      <div class="w-12 h-12 rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-primary-container shadow-sm">${UI.icon(icon)}</div>
      <span class="font-label-sm text-label-sm text-on-surface-variant">${label}</span>
    </div>`;
  }

  Screens.walletTxnDetail = function (container, params) {
    const t = ACState.wallet.transactions.find(x => x.id === params.id);
    const topbar = UI.topBar({ title: "Détail transaction", back: "App.back()" });
    const body = t ? `
    <section class="w-full flex flex-col items-center text-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-24 space-y-space-8">
      <div class="w-14 h-14 rounded-full ${t.type === "credit" ? "bg-tertiary-container/10 text-tertiary" : "bg-surface-container-low text-primary"} flex items-center justify-center">${UI.icon(t.type === "credit" ? "south_west" : "north_east")}</div>
      <span class="font-display-lg text-display-lg ${t.type === "credit" ? "text-tertiary" : "text-on-surface"}">${t.type === "credit" ? "+" : ""}${ACStore.fmtFCFA(t.amount)}</span>
      <span class="font-title-md text-title-md">${t.label}</span>
      <span class="font-body-sm text-body-sm text-on-surface-variant">${t.date}</span>
      ${UI.badge("Réussi", "success")}
    </section>
    <div class="pt-space-8">${UI.secondaryButton("Retour au Wallet", "App.nav('wallet')")}</div>` : UI.emptyState({icon:"receipt_long", title:"Transaction introuvable", body:"Cette transaction n'existe plus."});
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.walletTopup = function (container) {
    const topbar = UI.topBar({ title: "Recharger mon Wallet", back: "App.back()" });
    const amounts = [2000, 5000, 10000, 25000];
    const body = `
    <section class="grid grid-cols-2 gap-3">
      ${amounts.map(a => `<button onclick="Screens._topupPick(${a})" class="h-14 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-label-lg text-label-lg active:border-primary-container active:text-primary transition-colors">${ACStore.fmtFCFA(a)}</button>`).join("")}
    </section>
    <label class="flex flex-col space-y-1">
      <span class="font-label-md text-label-md text-on-surface-variant">Ou montant personnalisé</span>
      <input id="topup-amount" type="number" placeholder="Montant en FCFA" class="h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/30"/>
    </label>
    <section class="w-full flex flex-col space-y-2">
      <span class="font-label-md text-label-md text-on-surface-variant">Méthode</span>
      <div class="flex items-center justify-between bg-surface-container-lowest border border-primary-container rounded-xl p-space-16">
        <div class="flex items-center space-x-3">${UI.icon("smartphone", "text-primary")}<span class="font-title-md text-title-md">Mobile Money</span></div>
        ${UI.icon("check_circle", "text-primary", true)}
      </div>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Recharger", "Screens._doTopup()", { icon: "add" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._topupPick = function (a) { document.getElementById("topup-amount").value = a; };
  Screens._doTopup = function () {
    const amount = parseInt(document.getElementById("topup-amount").value, 10);
    if (!amount || amount <= 0) { UI.toast("Veuillez saisir un montant valide.", "error"); return; }
    ACStore.creditWallet(amount, "Rechargement Mobile Money");
    UI.toast("Wallet rechargé avec succès.", "success");
    App.resetTo("wallet");
  };

  Screens.walletSend = function (container) {
    const topbar = UI.topBar({ title: "Envoyer de l'argent", back: "App.back()" });
    const body = `
    ${field2("send-name", "Destinataire", "text", "Nom ou numéro de téléphone")}
    ${field2("send-amount", "Montant", "number", "0")}
    <label class="flex flex-col space-y-1">
      <span class="font-label-md text-label-md text-on-surface-variant">Note (optionnel)</span>
      <input id="send-note" placeholder="Ex : Remboursement" class="h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 font-body-md text-body-md focus:outline-none"/>
    </label>
    <div id="send-error" class="hidden font-body-sm text-body-sm text-error"></div>
    <div class="pt-space-8">${UI.primaryButton("Continuer", "Screens._sendReview()", { icon: "arrow_forward" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  function field2(id, label, type, placeholder) {
    return `<label class="flex flex-col space-y-1">
      <span class="font-label-md text-label-md text-on-surface-variant">${label}</span>
      <input id="${id}" type="${type}" placeholder="${placeholder}" class="h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/30"/>
    </label>`;
  }
  let pendingSend = null;
  Screens._sendReview = function () {
    const name = document.getElementById("send-name").value.trim();
    const amount = parseInt(document.getElementById("send-amount").value, 10);
    const note = document.getElementById("send-note").value.trim();
    const err = document.getElementById("send-error");
    if (!name) { err.textContent = "Veuillez indiquer un destinataire."; err.classList.remove("hidden"); return; }
    if (!amount || amount <= 0) { err.textContent = "Veuillez indiquer un montant valide."; err.classList.remove("hidden"); return; }
    if (amount > ACState.wallet.balance) { App.nav("paymentFailed", { retry: "walletSend", amount, reason: "insufficient_balance" }); return; }
    pendingSend = { name, amount, note };
    App.nav("securityPin", { action: "walletSendConfirm" });
  };

  Screens.securityPin = function (container, params) {
    const topbar = UI.topBar({ title: "Confirmation sécurisée", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center text-center space-y-space-20 py-space-16">
      <div class="w-14 h-14 rounded-full bg-surface-container-low text-primary-container flex items-center justify-center">${UI.icon("lock", "text-[28px]")}</div>
      <h2 class="font-headline-sm text-headline-sm font-bold">Entrez votre code PIN</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Démo : utilisez le code <b>0000</b></p>
      <input id="pin-code" inputmode="numeric" maxlength="4" placeholder="••••" class="h-14 w-40 rounded-xl border border-outline-variant/50 bg-surface-container-lowest text-center tracking-[0.5em] font-headline-md text-headline-md focus:outline-none"/>
      <div id="pin-error" class="hidden font-body-sm text-body-sm text-error"></div>
      <div class="w-full px-space-20">${UI.primaryButton("Confirmer", `Screens._pinConfirm('${params.action}')`)}</div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._pinConfirm = function (action) {
    const pin = document.getElementById("pin-code").value.trim();
    const err = document.getElementById("pin-error");
    if (pin !== "0000") { err.textContent = "Code PIN incorrect."; err.classList.remove("hidden"); return; }
    if (action === "walletSendConfirm") {
      const res = ACStore.payFromWallet({ amount: pendingSend.amount, label: "Envoi à " + pendingSend.name + (pendingSend.note ? " · " + pendingSend.note : ""), service: "wallet" });
      UI.toast("Argent envoyé à " + pendingSend.name + ".", "success");
      pendingSend = null;
      App.resetTo("wallet");
    } else if (action === "changePin") {
      UI.toast("Code PIN mis à jour avec succès.", "success");
      App.nav("security");
    } else {
      App.back();
    }
  };

  Screens.walletReceive = function (container) {
    const topbar = UI.topBar({ title: "Recevoir de l'argent", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center text-center space-y-space-16 py-space-16">
      <div class="w-48 h-48 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center">
        ${UI.icon("qr_code_2", "text-[140px] text-on-surface")}
      </div>
      <h2 class="font-title-md text-title-md">${ACState.user.fullName}</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">${ACState.user.phone}</p>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">Faites scanner ce code par un autre utilisateur YOUSS CONNECT pour recevoir un paiement instantané.</p>
      <div class="w-full px-space-20">${UI.secondaryButton("Partager mon code", "Screens._shareQr()")}</div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._shareQr = function () { UI.toast("Code QR partagé.", "success"); };

  Screens.walletQrPay = function (container) {
    const topbar = UI.topBar({ title: "QR Pay", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center text-center space-y-space-16 py-space-16">
      <div class="w-full h-64 rounded-xl bg-surface-container-low border-2 border-dashed border-primary-container/40 flex flex-col items-center justify-center text-primary-container">
        ${UI.icon("qr_code_scanner", "text-[64px]")}
        <span class="font-label-md text-label-md mt-space-8">Visez un code marchand</span>
      </div>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">Simulation : appuyez ci-dessous pour simuler la lecture d'un code marchand de démonstration.</p>
      <div class="w-full px-space-20">${UI.primaryButton("Simuler un scan marchand", "Screens._simulateQrScan()", { icon: "qr_code_scanner" })}</div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._simulateQrScan = function () {
    const amount = 1500 + Math.round(Math.random() * 3000);
    const res = ACStore.payFromWallet({ amount, label: "Paiement marchand QR · Boutique Ganhi", service: "wallet" });
    if (!res.ok) { App.nav("paymentFailed", { retry: "walletQrPay", amount, reason: res.reason }); return; }
    UI.toast("Paiement marchand de " + ACStore.fmtFCFA(amount) + " effectué.", "success");
    App.resetTo("wallet");
  };
})();
