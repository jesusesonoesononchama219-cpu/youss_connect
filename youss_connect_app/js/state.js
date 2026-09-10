/* =========================================================
   AFRICA CONNECT — CENTRAL STATE ENGINE
   Single source of truth shared by every service.
   This is what makes Transport / Wallet / Rewards / Activities /
   Notifications behave like ONE ecosystem instead of separate apps.
   ========================================================= */
(function () {
  "use strict";

  const listeners = [];

  function uid(prefix) {
    return prefix + "_" + Math.random().toString(36).slice(2, 9);
  }

  function fmtFCFA(n) {
    return Math.round(n).toLocaleString("fr-FR").replace(/\u202F/g, " ") + " FCFA";
  }

  function nowLabel() {
    const d = new Date();
    return "Aujourd'hui à " + d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
  }

  const State = {
    session: {
      authenticated: false,
      onboardingSeen: false,
      mode: "particulier" // or "business"
    },
    user: {
      name: "Alassane",
      fullName: "Alassane Kouassi",
      phone: "+229 97 00 00 00",
      email: "alassane.kouassi@example.com",
      city: "Cotonou",
      country: "Bénin",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiNsNoL3bFz6CndYM6dyvtP5xsVzyyBs-5Ikb8DpzmFLN5qwh-O2mnTHCJkhp5uYKoO6DmrTi7VOJ9HgEBibYplwh9q735sMKe-pqk8H4rrcAARSM1MhYmF3mM6E-efCCWt8bwKDDCokR9Q6BiPs2EaVMErhJdSKyNrIXpT-ZP9C8XCRemBWWPgnmRYpR2QfEDtrcvgd_vcJfw4f9w8thWKKzBa-tRD5Mv6m4iQb94wjNZagPx-TQ",
      verified: true
    },
    wallet: {
      balance: 42500,
      currency: "FCFA",
      transactions: [
        { id: uid("txn"), label: "Rechargement Mobile Money", amount: 25000, type: "credit", date: "Hier à 09:12" },
        { id: uid("txn"), label: "Course vers Cadjèhoun", amount: -2500, type: "debit", date: "Hier à 14:20" },
        { id: uid("txn"), label: "Commande La Pirogue Cotonou", amount: -8400, type: "debit", date: "Hier à 20:15" }
      ]
    },
    rewards: {
      points: 1280,
      tier: "Argent",
      nextTier: "Or",
      nextTierAt: 2000,
      history: [
        { id: uid("rwd"), label: "Course terminée", points: 25, date: "Hier" },
        { id: uid("rwd"), label: "Commande restaurant", points: 84, date: "Hier" }
      ]
    },
    addresses: [
      { id: uid("addr"), label: "Domicile", detail: "Cadjèhoun, Cotonou", icon: "home" },
      { id: uid("addr"), label: "Travail", detail: "Ganhi, Cotonou", icon: "work" }
    ],
    activities: [
      { id: uid("act"), service: "transport", title: "Course vers Cadjèhoun", subtitle: "Aujourd'hui à 14:20", amount: 2500, status: "Terminé", icon: "directions_car" },
      { id: uid("act"), service: "restaurant", title: "Commande La Pirogue Cotonou", subtitle: "Hier à 20:15", amount: 8400, status: "Livré", icon: "restaurant" },
      { id: uid("act"), service: "livraison", title: "Livraison de colis Ganhi", subtitle: "Arrivée estimée 16:45", amount: null, status: "En cours", icon: "local_shipping" }
    ],
    notifications: [
      { id: uid("ntf"), title: "Paiement confirmé", body: "Votre course vers Cadjèhoun a été réglée via Africa Wallet.", read: false, service: "wallet", date: "Aujourd'hui, 14:21" },
      { id: uid("ntf"), title: "Points Rewards gagnés", body: "+25 points ajoutés à votre solde Africa Rewards.", read: false, service: "rewards", date: "Aujourd'hui, 14:21" },
      { id: uid("ntf"), title: "Livraison en cours", body: "Votre coursier est en route vers Ganhi.", read: true, service: "livraison", date: "Aujourd'hui, 12:05" }
    ],
    cart: { restaurant: null, items: [], market: [] },
    trip: null // active transport booking
  };

  function emit() {
    listeners.forEach((fn) => {
      try { fn(State); } catch (e) { console.error(e); }
    });
  }

  function subscribe(fn) {
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }

  /* ---------- Core interconnected operations ---------- */

  function addNotification(title, body, service) {
    State.notifications.unshift({
      id: uid("ntf"), title, body, read: false, service, date: "À l'instant"
    });
  }

  function addActivity(entry) {
    State.activities.unshift(Object.assign({ id: uid("act"), subtitle: nowLabel() }, entry));
  }

  function addRewardPoints(points, label) {
    State.rewards.points += points;
    State.rewards.history.unshift({ id: uid("rwd"), label, points, date: "Aujourd'hui" });
    if (State.rewards.points >= State.rewards.nextTierAt && State.rewards.tier === "Argent") {
      State.rewards.tier = "Or";
      addNotification("Nouveau statut débloqué", "Félicitations, vous êtes passé au statut Or Africa Rewards.", "rewards");
    }
  }

  /**
   * Unified payment used by every service (Transport, Restaurants,
   * Market, Events...). Returns {ok, reason}.
   */
  function payFromWallet({ amount, label, service, pointsEarned = 0 }) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { ok: false, reason: "offline" };
    }
    if (amount > State.wallet.balance) {
      return { ok: false, reason: "insufficient_balance" };
    }
    State.wallet.balance -= amount;
    State.wallet.transactions.unshift({
      id: uid("txn"), label, amount: -amount, type: "debit", date: "À l'instant"
    });
    addActivity({ service, title: label, amount, status: "Terminé", icon: iconForService(service) });
    addNotification("Paiement confirmé", label + " a été réglé via Africa Wallet (" + fmtFCFA(amount) + ").", "wallet");
    if (pointsEarned > 0) {
      addRewardPoints(pointsEarned, label);
      addNotification("Points Rewards gagnés", "+" + pointsEarned + " points ajoutés à votre solde Africa Rewards.", "rewards");
    }
    emit();
    return { ok: true };
  }

  function creditWallet(amount, label) {
    State.wallet.balance += amount;
    State.wallet.transactions.unshift({ id: uid("txn"), label, amount, type: "credit", date: "À l'instant" });
    addNotification("Rechargement réussi", label + " (" + fmtFCFA(amount) + ") a été ajouté à votre solde.", "wallet");
    emit();
  }

  function iconForService(service) {
    return {
      transport: "directions_car",
      livraison: "local_shipping",
      restaurant: "restaurant",
      market: "storefront",
      evenement: "confirmation_number",
      culture: "explore",
      wallet: "account_balance_wallet",
      rewards: "workspace_premium",
      business: "business_center"
    }[service] || "task_alt";
  }

  window.ACState = State;
  window.ACStore = {
    subscribe,
    emit,
    uid,
    fmtFCFA,
    addNotification,
    addActivity,
    addRewardPoints,
    payFromWallet,
    creditWallet,
    iconForService
  };
})();
