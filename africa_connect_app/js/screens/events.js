(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const EVENTS = {
    ev1: { id: "ev1", name: "Festival Vaudou & Arts Urbains", place: "Ouidah & Cotonou", date: "14 Sept 2026", tickets: [{ id: "t1", label: "Standard", price: 5000 }, { id: "t2", label: "VIP", price: 15000 }] },
    ev2: { id: "ev2", name: "Nuit Afro Soul & Jazz", place: "Cotonou", date: "21 Sept 2026", tickets: [{ id: "t3", label: "Standard", price: 8000 }, { id: "t4", label: "VIP", price: 20000 }] }
  };
  let selectedTicket = null, ticketQty = 1;

  Screens.events = function (container) {
    const topbar = UI.topBar({ title: "Événements", subtitle: "Culture & spectacles vivants", back: "App.nav('home')" });
    const body = `
    <section class="flex flex-col space-y-3">
      ${Object.values(EVENTS).map(e => `
      <div onclick="App.nav('eventDetail', {id:'${e.id}'})" class="rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest cursor-pointer">
        <div class="h-28 bg-surface-container-low flex items-center justify-center text-primary-container">${UI.icon("confirmation_number", "text-[32px]")}</div>
        <div class="p-space-16"><h3 class="font-title-md text-title-md">${e.name}</h3><p class="font-body-sm text-body-sm text-on-surface-variant">${e.place} · ${e.date}</p></div>
      </div>`).join("")}
    </section>
    <div class="pt-space-8">${UI.secondaryButton("Mes billets", "App.nav('myTickets')")}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.eventDetail = function (container, params) {
    const e = EVENTS[params.id] || Object.values(EVENTS)[0];
    if (!selectedTicket || !e.tickets.find(t => t.id === selectedTicket)) selectedTicket = e.tickets[0].id;
    const topbar = UI.topBar({ title: e.name, subtitle: e.place, back: "App.back()" });
    const body = `
    <section class="h-32 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container">${UI.icon("confirmation_number", "text-[40px]")}</section>
    <p class="font-body-sm text-body-sm text-on-surface-variant">${e.date} · ${e.place}</p>
    <section class="flex flex-col space-y-2">
      <h2 class="font-headline-sm text-headline-sm font-bold">Types de billets</h2>
      ${e.tickets.map(t => `
      <div onclick="Screens._pickTicket('${t.id}')" class="flex items-center justify-between rounded-xl p-space-16 border cursor-pointer ${selectedTicket === t.id ? "border-primary-container bg-surface-container-low" : "border-outline-variant/30 bg-surface-container-lowest"}">
        <span class="font-title-md text-title-md">${t.label}</span><span class="font-label-lg text-label-lg font-bold text-primary">${ACStore.fmtFCFA(t.price)}</span>
      </div>`).join("")}
    </section>
    <section class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16">
      <span class="font-title-md text-title-md">Quantité</span>
      <div class="flex items-center space-x-3">
        <button onclick="Screens._ticketQty(-1,'${e.id}')" class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">${UI.icon("remove", "text-[16px]")}</button>
        <span class="font-label-lg text-label-lg w-4 text-center">${ticketQty}</span>
        <button onclick="Screens._ticketQty(1,'${e.id}')" class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">${UI.icon("add", "text-[16px]")}</button>
      </div>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Réserver et payer", `App.nav('eventCheckout', {id:'${e.id}'})`, { icon: "arrow_forward" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._pickTicket = function (id) { selectedTicket = id; App.replace(App.current.id, App.current.params); };
  Screens._ticketQty = function (d) { ticketQty = Math.max(1, ticketQty + d); App.replace(App.current.id, App.current.params); };

  Screens.eventCheckout = function (container, params) {
    const e = EVENTS[params.id];
    const t = e.tickets.find(x => x.id === selectedTicket);
    const total = t.price * ticketQty;
    const topbar = UI.topBar({ title: "Récapitulatif billet", back: "App.back()" });
    const body = `
    <section class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex flex-col space-y-2">
      <div class="flex items-center justify-between"><span class="font-body-md text-body-md">Événement</span><span class="font-title-md text-title-md">${e.name}</span></div>
      <div class="flex items-center justify-between"><span class="font-body-md text-body-md">Billet</span><span>${t.label} x ${ticketQty}</span></div>
      <div class="flex items-center justify-between font-label-lg text-label-lg font-bold border-t border-outline-variant/30 pt-2"><span>Total</span><span class="text-primary">${ACStore.fmtFCFA(total)}</span></div>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Payer avec Africa Wallet", `Screens._payEvent('${e.id}', ${total})`, { icon: "account_balance_wallet" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._payEvent = function (eid, total) {
    const e = EVENTS[eid];
    const res = ACStore.payFromWallet({ amount: total, label: "Billet · " + e.name, service: "evenement", pointsEarned: Math.round(total / 100) });
    if (!res.ok) { App.nav("paymentFailed", { retry: "events", amount: total, reason: res.reason }); return; }
    ACState.tickets = ACState.tickets || [];
    ACState.tickets.push({ id: ACStore.uid("tkt"), event: e.name, place: e.place, date: e.date, qty: ticketQty, total });
    UI.toast("Billet confirmé !", "success");
    ticketQty = 1;
    App.resetTo("myTickets");
  };

  Screens.myTickets = function (container) {
    const tickets = ACState.tickets || [];
    const topbar = UI.topBar({ title: "Mes billets", back: "App.back()" });
    const body = tickets.length ? `
    <section class="flex flex-col space-y-3">
      ${tickets.map(t => `
      <div onclick="App.nav('ticketDetail', {id:'${t.id}'})" class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex items-center justify-between cursor-pointer">
        <div class="flex flex-col"><span class="font-title-md text-title-md">${t.event}</span><span class="font-body-sm text-body-sm text-on-surface-variant">${t.place} · ${t.date}</span></div>
        ${UI.icon("qr_code_2", "text-primary text-[28px]")}
      </div>`).join("")}
    </section>` : UI.emptyState({ icon: "confirmation_number", title: "Aucun billet", body: "Vos billets d'événements achetés apparaîtront ici.", actionLabel: "Découvrir les événements", actionOnclick: "App.resetTo('events')" });
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.ticketDetail = function (container, params) {
    const t = (ACState.tickets || []).find(x => x.id === params.id);
    const topbar = UI.topBar({ title: "Billet numérique", back: "App.back()" });
    const body = t ? `
    <section class="flex flex-col items-center text-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-24 space-y-space-8">
      <h2 class="font-headline-md text-headline-md font-bold">${t.event}</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">${t.place} · ${t.date}</p>
      <div class="w-40 h-40 bg-surface-container-low rounded-xl flex items-center justify-center">${UI.icon("qr_code_2", "text-[120px]")}</div>
      <p class="font-body-sm text-body-sm">${t.qty} billet(s) · ${ACStore.fmtFCFA(t.total)}</p>
      ${UI.badge("Valide", "success")}
    </section>` : UI.emptyState({ icon: "confirmation_number", title: "Billet introuvable", body: "" });
    Shell.render(container, { topbar, body, nav: false });
  };
})();
