(function () {
  "use strict";
  window.Screens = window.Screens || {};

  /* Landing : JPEG (sans boutons) + une seule rangée de boutons HTML cliquables. */
  Screens.splash = function (container) {
    const services = [
      { id: "transport", label: "TRANSPORT", icon: "directions_car", color: "#2E9B45" },
      { id: "livraison", label: "LIVRAISON", icon: "delivery_dining", color: "#F5A623" },
      { id: "restaurants", label: "RESTAURANTS", icon: "restaurant", color: "#3B6FE8" },
      { id: "culture", label: "TOURISME &\nCULTURE", icon: "account_balance", color: "#7A2FBF" },
      { id: "securite", label: "SÉCURITÉ", icon: "verified_user", color: "#0E7C6B" }
    ];

    container.innerHTML = `
      <div class="ac-landing flex-1 flex flex-col bg-white select-none overflow-x-hidden overflow-y-auto">
        <main class="ac-landing-main w-full max-w-[1536px] mx-auto flex flex-col">
          <img
            src="./assets/youss-connect-hero.jpg"
            alt="YOUSS CONNECT — Se déplacer. Découvrir. Se connecter."
            class="ac-landing-photo block w-full h-auto pointer-events-none"
            draggable="false"
          />
          <nav class="ac-service-row grid grid-cols-5 gap-1 px-3 pb-8 pt-1 shrink-0" aria-label="Services YOUSS Connect">
            ${services.map((s) => `
              <button type="button" data-service="${s.id}"
                class="ac-service-btn flex flex-col items-center gap-2 outline-none"
                onclick="Screens._landingTap('${s.id}')"
                aria-label="${s.label.replace('\\n', ' ')}">
                <span class="ac-service-disc" style="background:${s.color}">
                  ${UI.icon(s.icon, "text-[24px] text-white", true)}
                </span>
                <span class="ac-service-label">${s.label}</span>
              </button>
            `).join("")}
          </nav>
        </main>
      </div>`;
  };

  Screens._landingTap = function (id) {
    const btn = document.querySelector(`.ac-service-btn[data-service="${id}"]`);
    if (!btn) return;
    btn.classList.add("ac-service-btn--pressed");
    setTimeout(function () { btn.classList.remove("ac-service-btn--pressed"); }, 220);
  };

  const onboardingServices = [
    { icon: "directions_car", title: "Transport", body: "Réservez une course en quelques secondes, partout où vous êtes." },
    { icon: "restaurant", title: "Restaurants & Livraison", body: "Commandez vos plats préférés et suivez la livraison en direct." },
    { icon: "account_balance_wallet", title: "Africa Wallet", body: "Un seul portefeuille numérique pour payer tous les services." },
    { icon: "workspace_premium", title: "Africa Rewards", body: "Gagnez des points à chaque activité et échangez-les contre des récompenses." }
  ];
  let onbIndex = 0;

  Screens.onboarding = function (container) {
    const s = onboardingServices[onbIndex];
    container.innerHTML = `
      <div class="flex-1 flex flex-col px-space-20 pt-space-40 pb-space-24">
        <div class="flex-1 flex flex-col items-center justify-center text-center">
          <div class="w-28 h-28 rounded-3xl bg-surface-container-low flex items-center justify-center text-primary-container mb-space-24">
            ${UI.icon(s.icon, "text-[56px]")}
          </div>
          <h2 class="font-headline-lg text-headline-lg font-bold mb-space-8">${s.title}</h2>
          <p class="font-body-md text-body-md text-on-surface-variant max-w-[280px]">${s.body}</p>
        </div>
        <div class="flex items-center justify-center space-x-2 mb-space-24">
          ${onboardingServices.map((_, i) => `<span class="w-2 h-2 rounded-full ${i === onbIndex ? "bg-primary-container w-6" : "bg-outline-variant"} transition-all"></span>`).join("")}
        </div>
        ${UI.primaryButton(onbIndex === onboardingServices.length - 1 ? "Créer mon compte" : "Suivant", "Screens._onbNext()", { icon: "arrow_forward" })}
        <button onclick="App.nav('login')" class="mt-space-16 font-label-md text-label-md text-on-surface-variant">J'ai déjà un compte</button>
      </div>`;
  };

  Screens._onbNext = function () {
    if (onbIndex < onboardingServices.length - 1) { onbIndex++; App.replace("onboarding"); }
    else { App.nav("signup"); }
  };

  Screens.signup = function (container) {
    container.innerHTML = `
      ${UI.statusBar()}
      ${UI.topBar({ title: "Créer un compte", back: "App.back()" })}
      <main class="flex-1 flex flex-col px-space-20 space-y-space-16">
        <p class="font-body-sm text-body-sm text-on-surface-variant">Rejoignez YOUSS CONNECT pour accéder à tous les services KYA CORPORATION.</p>
        ${field("su-name", "Nom complet", "text", "Alassane Kouassi")}
        ${field("su-phone", "Numéro de téléphone", "tel", "+229 97 00 00 00")}
        ${field("su-email", "Email (optionnel)", "email", "vous@example.com")}
        <div id="su-error" class="hidden font-body-sm text-body-sm text-error"></div>
        <div class="pt-space-8">${UI.primaryButton("Recevoir mon code", "Screens._doSignup()")}</div>
      </main>`;
  };

  function field(id, label, type, placeholder) {
    return `
    <label class="flex flex-col space-y-1">
      <span class="font-label-md text-label-md text-on-surface-variant">${label}</span>
      <input id="${id}" type="${type}" placeholder="${placeholder}" class="h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container"/>
    </label>`;
  }

  Screens._doSignup = function () {
    const name = document.getElementById("su-name").value.trim();
    const phone = document.getElementById("su-phone").value.trim();
    const err = document.getElementById("su-error");
    const digits = phone.replace(/\D/g, "");
    if (!name) return showErr(err, "Veuillez indiquer votre nom complet.");
    if (digits.length < 8) return showErr(err, "Veuillez indiquer un numéro de téléphone valide.");
    err.classList.add("hidden");
    ACState.user.fullName = name;
    ACState.user.name = name.split(" ")[0];
    ACState.user.phone = phone;
    App.nav("otp", { next: "home" });
  };

  function showErr(el, msg) { el.textContent = msg; el.classList.remove("hidden"); }

  Screens.login = function (container) {
    container.innerHTML = `
      ${UI.statusBar()}
      ${UI.topBar({ title: "Connexion", back: "App.back()" })}
      <main class="flex-1 flex flex-col px-space-20 space-y-space-16">
        ${field("li-phone", "Numéro de téléphone", "tel", "+229 97 00 00 00")}
        <div id="li-error" class="hidden font-body-sm text-body-sm text-error"></div>
        <div class="pt-space-8">${UI.primaryButton("Recevoir mon code", "Screens._doLogin()")}</div>
        <button onclick="App.nav('signup')" class="font-label-md text-label-md text-primary text-center pt-space-8">Créer un compte</button>
      </main>`;
  };

  Screens._doLogin = function () {
    const phone = document.getElementById("li-phone").value.trim();
    const err = document.getElementById("li-error");
    if (phone.replace(/\D/g, "").length < 8) return showErr(err, "Numéro de téléphone invalide.");
    err.classList.add("hidden");
    ACState.user.phone = phone;
    App.nav("otp", { next: "home" });
  };

  Screens.otp = function (container, params) {
    container.innerHTML = `
      ${UI.statusBar()}
      ${UI.topBar({ title: "Vérification", back: "App.back()" })}
      <main class="flex-1 flex flex-col px-space-20 space-y-space-20">
        <p class="font-body-md text-body-md text-on-surface-variant">Entrez le code à 4 chiffres envoyé au ${ACState.user.phone}. (Démo : utilisez <b>1234</b>)</p>
        <input id="otp-code" inputmode="numeric" maxlength="4" placeholder="••••" class="h-14 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 text-center tracking-[0.5em] font-headline-md text-headline-md focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container"/>
        <div id="otp-error" class="hidden font-body-sm text-body-sm text-error text-center"></div>
        ${UI.primaryButton("Valider", `Screens._doOtp('${params.next || "home"}')`)}
      </main>`;
  };

  Screens._doOtp = function (next) {
    const code = document.getElementById("otp-code").value.trim();
    const err = document.getElementById("otp-error");
    if (code !== "1234") return showErr(err, "Code incorrect. Réessayez (indice : 1234).");
    ACState.session.authenticated = true;
    ACState.session.onboardingSeen = true;
    UI.toast("Bienvenue " + ACState.user.name + " !", "success");
    App.resetTo(next);
  };
})();
