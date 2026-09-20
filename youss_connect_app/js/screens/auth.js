(function () {
  "use strict";
  window.Screens = window.Screens || {};

  var splashTimer = null;
  var splashLeaving = false;
  var LOGO_FULL = "./assets/youss-logo-full.png";
  var LOGO_CLEAR = "./assets/youss-logo-full.png";

  /* Splash blanc — logo complet (emblème + YOUSS + CONNECT + barres), 2s max */
  Screens.splash = function (container) {
    if (splashTimer) {
      clearTimeout(splashTimer);
      splashTimer = null;
    }
    splashLeaving = false;

    container.innerHTML = `
      <div id="yc-splash-root" class="yc-splash-white relative flex-1 flex flex-col overflow-hidden select-none">
        ${UI.statusBar()}

        <main class="flex-1 flex flex-col items-center justify-center px-space-24 text-center">
          <img
            src="${LOGO_FULL}"
            alt="YOUSS CONNECT"
            class="yc-splash-brand-logo"
            draggable="false"
          />
          <p class="yc-anim yc-anim-d1 mt-space-20 font-body-md text-body-md text-on-surface-variant max-w-[260px]">
            Se déplacer. Découvrir. Se connecter.
          </p>
        </main>

        <footer class="relative z-10 px-space-20 pb-space-24 flex items-end justify-between">
          <p class="font-label-sm text-label-sm text-primary/50">par DYNASTY KYA</p>
        </footer>
        <div class="yc-splash-waves" aria-hidden="true">
          <span class="w1"></span>
          <span class="w2"></span>
          <span class="w3"></span>
        </div>
      </div>`;

    splashTimer = setTimeout(function () {
      Screens._leaveSplash();
    }, 2000);
  };

  Screens._leaveSplash = function () {
    if (splashLeaving) return;
    if (App.current && App.current.id !== "splash") return;
    splashLeaving = true;
    if (splashTimer) {
      clearTimeout(splashTimer);
      splashTimer = null;
    }
    var root = document.getElementById("yc-splash-root");
    if (root) root.classList.add("yc-splash--exit");
    setTimeout(function () {
      App.replace("onboarding");
    }, 240);
  };

  /* Onboarding (écran 1 maquette) — fond violet + boutons */
  Screens.onboarding = function (container) {
    container.innerHTML = `
      <div class="yc-onboard relative flex-1 flex flex-col overflow-hidden text-white select-none">
        <div class="yc-splash-skyline" aria-hidden="true"></div>
        ${UI.statusBar({ light: true })}

        <main class="relative z-10 flex-1 flex flex-col px-space-24 pb-space-32 justify-end">
          <div class="flex-1 flex flex-col items-center justify-center text-center pt-8">
            <div class="yc-onboard-logo-plate">
              <img
                src="${LOGO_FULL}"
                alt="YOUSS CONNECT"
                class="yc-onboard-logo"
                draggable="false"
              />
            </div>
            <h1 class="mt-space-20 font-headline-lg text-headline-lg font-extrabold leading-tight mb-space-12 max-w-[300px]">
              Se déplacer.<br/>Découvrir.<br/>Se connecter.
            </h1>
            <p class="font-body-md text-body-md text-white/75 max-w-[280px]">
              Tout ce dont vous avez besoin, en une seule application.
            </p>
          </div>

          <div class="flex flex-col gap-3 mt-space-24">
            <button type="button" onclick="App.nav('signup')"
              class="yc-btn-green w-full h-14 rounded-2xl flex items-center justify-center font-label-lg text-label-lg active:scale-[0.98] transition-transform">
              Créer un compte
            </button>
            <button type="button" onclick="App.nav('login')"
              class="yc-btn-ghost w-full h-12 rounded-2xl flex items-center justify-center font-label-lg text-label-lg active:scale-[0.98] transition-transform">
              Se connecter
            </button>
            <button type="button" onclick="Screens._enterDemo()"
              class="mt-1 text-center font-label-md text-label-md text-white/55">
              Continuer en démo
            </button>
            <p class="text-center font-label-sm text-label-sm text-white/35 pt-2">Propulsé par Dynasty KYA</p>
          </div>
        </main>
      </div>`;
  };

  Screens._enterDemo = function () {
    ACState.session.authenticated = true;
    ACState.session.onboardingSeen = true;
    App.resetTo("home");
  };

  function field(id, label, type, placeholder) {
    return `
    <label class="flex flex-col space-y-1">
      <span class="font-label-md text-label-md text-on-surface-variant">${label}</span>
      <input id="${id}" type="${type}" placeholder="${placeholder}" class="h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container"/>
    </label>`;
  }

  function showErr(el, msg) {
    el.textContent = msg;
    el.classList.remove("hidden");
  }

  var COUNTRIES = [
    { code: "BJ", name: "Bénin", dial: "+229", city: "Cotonou" }
  ];
  var defaultCountry = COUNTRIES[0]; // Bénin +229

  function countryOptions(selectedDial) {
    return COUNTRIES.map(function (c) {
      var sel = c.dial === selectedDial ? " selected" : "";
      return '<option value="' + c.dial + '" data-code="' + c.code + '" data-name="' + c.name + '" data-city="' + c.city + '"' + sel + ">" + c.name + " (" + c.dial + ")</option>";
    }).join("");
  }

  function findCountry(dial) {
    for (var i = 0; i < COUNTRIES.length; i++) {
      if (COUNTRIES[i].dial === dial) return COUNTRIES[i];
    }
    return defaultCountry;
  }

  function bindPhoneLimit(inputId) {
    var el = document.getElementById(inputId);
    if (!el) return;
    el.setAttribute("maxlength", "10");
    el.setAttribute("inputmode", "numeric");
    el.setAttribute("pattern", "[0-9]{10}");
    el.addEventListener("input", function () {
      var digits = el.value.replace(/\D/g, "").slice(0, 10);
      if (el.value !== digits) el.value = digits;
    });
    el.addEventListener("paste", function (e) {
      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData("text") || "";
      el.value = text.replace(/\D/g, "").slice(0, 10);
    });
  }

  Screens.signup = function (container) {
    var dial = defaultCountry.dial;
    container.innerHTML = `
      ${UI.statusBar()}
      ${UI.topBar({ title: "Créer un compte", back: "App.back()" })}
      <main class="flex-1 flex flex-col px-space-20 space-y-space-16 overflow-y-auto pb-space-24">
        <p class="font-body-sm text-body-sm text-on-surface-variant">Rejoignez YOUSS CONNECT — Dynasty KYA.</p>
        ${field("su-name", "Nom complet", "text", "Youss Adjovi")}
        <label class="flex flex-col space-y-1">
          <span class="font-label-md text-label-md text-on-surface-variant">Numéro de téléphone</span>
          <div class="flex items-center h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest overflow-hidden focus-within:ring-2 focus-within:ring-primary-container/30 focus-within:border-primary-container">
            <span id="su-dial" class="px-space-12 font-label-lg text-label-lg font-bold text-primary border-r border-outline-variant/40 bg-surface-container-low h-full flex items-center">${dial}</span>
            <input id="su-phone" type="tel" inputmode="numeric" maxlength="10" placeholder="9700000000"
              class="flex-1 h-full px-space-12 bg-transparent font-body-md text-body-md focus:outline-none"/>
          </div>
          <span class="font-label-sm text-label-sm text-on-surface-variant">10 chiffres (Bénin)</span>
        </label>
        ${field("su-email", "Email (optionnel)", "email", "vous@example.com")}
        <div id="su-error" class="hidden font-body-sm text-body-sm text-error"></div>
        <div class="pt-space-8">${UI.primaryButton("Recevoir mon code", "Screens._doSignup()")}</div>
        <button onclick="App.nav('login')" class="font-label-md text-label-md text-primary text-center">J'ai déjà un compte</button>
      </main>`;
    bindPhoneLimit("su-phone");
  };

  Screens._doSignup = function () {
    var name = document.getElementById("su-name").value.trim();
    var dial = defaultCountry.dial;
    var digits = document.getElementById("su-phone").value.replace(/\D/g, "");
    var err = document.getElementById("su-error");
    if (!name) return showErr(err, "Veuillez indiquer votre nom complet.");
    if (digits.length !== 10) return showErr(err, "Le numéro doit contenir exactement 10 chiffres.");
    err.classList.add("hidden");
    var country = defaultCountry;
    var phone = dial + " " + digits;
    ACState.user.fullName = name;
    ACState.user.name = name.split(" ")[0];
    ACState.user.phone = phone;
    ACState.user.dial = dial;
    ACState.user.country = country.name;
    ACState.user.city = country.city;
    var emailEl = document.getElementById("su-email");
    if (emailEl && emailEl.value.trim()) ACState.user.email = emailEl.value.trim();
    App.nav("otp", { next: "home" });
  };

  Screens.login = function (container) {
    var dial = defaultCountry.dial;
    container.innerHTML = `
      ${UI.statusBar()}
      ${UI.topBar({ title: "Connexion", back: "App.back()" })}
      <main class="flex-1 flex flex-col px-space-20 space-y-space-16">
        <label class="flex flex-col space-y-1">
          <span class="font-label-md text-label-md text-on-surface-variant">Numéro de téléphone</span>
          <div class="flex items-center h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest overflow-hidden focus-within:ring-2 focus-within:ring-primary-container/30 focus-within:border-primary-container">
            <span id="li-dial" class="px-space-12 font-label-lg text-label-lg font-bold text-primary border-r border-outline-variant/40 bg-surface-container-low h-full flex items-center">${dial}</span>
            <input id="li-phone" type="tel" inputmode="numeric" maxlength="10" placeholder="9700000000"
              class="flex-1 h-full px-space-12 bg-transparent font-body-md text-body-md focus:outline-none"/>
          </div>
          <span class="font-label-sm text-label-sm text-on-surface-variant">10 chiffres (Bénin)</span>
        </label>
        <div id="li-error" class="hidden font-body-sm text-body-sm text-error"></div>
        <div class="pt-space-8">${UI.primaryButton("Recevoir mon code", "Screens._doLogin()")}</div>
        <button onclick="App.nav('signup')" class="font-label-md text-label-md text-primary text-center pt-space-8">Créer un compte</button>
      </main>`;
    bindPhoneLimit("li-phone");
  };

  Screens._doLogin = function () {
    var dial = defaultCountry.dial;
    var digits = document.getElementById("li-phone").value.replace(/\D/g, "");
    var err = document.getElementById("li-error");
    if (digits.length !== 10) return showErr(err, "Le numéro doit contenir exactement 10 chiffres.");
    err.classList.add("hidden");
    var country = defaultCountry;
    ACState.user.phone = dial + " " + digits;
    ACState.user.dial = dial;
    ACState.user.country = country.name;
    ACState.user.city = country.city;
    App.nav("otp", { next: "home" });
  };

  Screens.otp = function (container, params) {
    container.innerHTML = `
      ${UI.statusBar()}
      ${UI.topBar({ title: "Vérification", back: "App.back()" })}
      <main class="flex-1 flex flex-col px-space-20 space-y-space-20">
        <p class="font-body-md text-body-md text-on-surface-variant">Entrez le code à 4 chiffres envoyé au ${ACState.user.phone}. (Démo : <b>1234</b>)</p>
        <input id="otp-code" inputmode="numeric" maxlength="4" placeholder="••••" class="h-14 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 text-center tracking-[0.5em] font-headline-md text-headline-md focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container"/>
        <div id="otp-error" class="hidden font-body-sm text-body-sm text-error text-center"></div>
        ${UI.primaryButton("Valider", "Screens._doOtp('" + (params.next || "home") + "')")}
      </main>`;
  };

  Screens._doOtp = function (next) {
    var code = document.getElementById("otp-code").value.trim();
    var err = document.getElementById("otp-error");
    if (code !== "1234") return showErr(err, "Code incorrect. Réessayez (indice : 1234).");
    ACState.session.authenticated = true;
    ACState.session.onboardingSeen = true;
    UI.toast("Bienvenue " + ACState.user.name + " !", "success");
    App.resetTo(next);
  };
})();
