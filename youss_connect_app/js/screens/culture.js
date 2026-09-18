(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const SITES = {
    c1: {
      id: "c1",
      name: "Palais royaux d'Abomey",
      place: "Abomey, Bénin",
      body: "Classés au patrimoine mondial de l'UNESCO, les palais royaux d'Abomey témoignent de l'histoire du royaume du Dahomey et de sa culture.",
      img: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=70"
    },
    c2: {
      id: "c2",
      name: "Porte du Non-Retour",
      place: "Ouidah, Bénin",
      body: "Monument emblématique de la Route des Esclaves à Ouidah, lieu de mémoire de la traite négrière et du patrimoine béninois.",
      img: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=70"
    },
    c3: {
      id: "c3",
      name: "Place de l'Amazone",
      place: "Cotonou, Bénin",
      body: "Monument moderne de Cotonou rendant hommage aux Agojié, les guerrières amazones du royaume du Dahomey.",
      img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=70"
    }
  };
  let lang = "fr";
  const saved = new Set();

  Screens.culture = function (container) {
    const topbar = UI.topBar({ title: "Tourisme & Culture", subtitle: "Découvrez le Bénin", back: "App.nav('home')" });
    const body = `
    <section onclick="App.nav('culturalScanner')"
      class="rounded-2xl bg-gradient-to-br from-primary to-primary-container text-white p-space-16 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform shadow-lg shadow-primary/20">
      <div>
        <p class="font-label-sm text-label-sm text-white/70 mb-1">Scanner un monument</p>
        <h3 class="font-title-md text-title-md font-bold">Découvrez son histoire</h3>
      </div>
      <span class="w-12 h-12 rounded-full bg-yc-green flex items-center justify-center">${UI.icon("qr_code_scanner", "text-[24px]", true)}</span>
    </section>

    <section class="flex flex-col space-y-space-12">
      <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Lieux populaires</h2>
      <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        ${Object.values(SITES).map((s) => `
          <button type="button" onclick="App.nav('cultureDetail', {id:'${s.id}'})"
            class="min-w-[200px] rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest text-left shadow-sm active:scale-[0.98]">
            <div class="h-28 bg-cover bg-center" style="background-image:url('${s.img}')"></div>
            <div class="p-space-12">
              <h3 class="font-label-md text-label-md font-bold text-on-surface line-clamp-2">${s.name}</h3>
              <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">${s.place}</p>
            </div>
          </button>
        `).join("")}
      </div>
    </section>`;
    Shell.render(container, { topbar, body, nav: "culturalScanner" });
  };

  Screens.cultureDetail = function (container, params) {
    const s = SITES[params.id] || SITES.c1;
    Screens._showPlace(container, s, true);
  };

  function placeTabs(active) {
    return ["Aperçu", "Vidéo", "Audio", "Texte"].map((t) => `
      <button type="button" class="px-3 py-1.5 rounded-full font-label-sm text-label-sm font-semibold ${t === active ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant"}">${t}</button>
    `).join("");
  }

  Screens._showPlace = function (container, s, withBack) {
    const topbar = UI.topBar({ title: "Découverte", back: withBack ? "App.back()" : "App.nav('culture')" });
    const body = `
    <section class="h-44 rounded-2xl bg-cover bg-center relative overflow-hidden" style="background-image:url('${s.img}')">
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div class="absolute bottom-3 left-3 right-3 text-white">
        <h2 class="font-headline-sm text-headline-sm font-bold">${s.name}</h2>
        <p class="font-body-sm text-body-sm text-white/80">${s.place}</p>
      </div>
    </section>

    <div class="flex gap-2 overflow-x-auto no-scrollbar">${placeTabs("Aperçu")}</div>

    <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">${s.body}</p>

    <section class="w-full">
      <p class="font-label-md text-label-md font-semibold text-on-surface mb-2">Langue</p>
      <div class="flex gap-2">
        ${[
          { id: "fr", flag: "FR", label: "FR" },
          { id: "en", flag: "EN", label: "EN" },
          { id: "fon", flag: "FON", label: "Fon" },
          { id: "yo", flag: "YO", label: "Yoruba" }
        ].map((l) => `
          <button type="button" onclick="Screens._setLang('${l.id}')"
            class="flex-1 h-10 rounded-xl border font-label-sm text-label-sm font-semibold ${lang === l.id ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/40 text-on-surface-variant"}">
            ${l.label}
          </button>
        `).join("")}
      </div>
    </section>

    <div class="flex gap-3">
      ${UI.secondaryButton(saved.has(s.id) ? "Sauvegardé ✓" : "Sauvegarder", `Screens._toggleSaveSite('${s.id}')`)}
      ${UI.primaryButton("Explorer autour", "App.nav('restaurants')", { green: true })}
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._setLang = function (id) {
    lang = id;
    UI.toast("Langue : " + id.toUpperCase() + " (démo)", "info");
    App.replace(App.current.id, App.current.params);
  };

  Screens._toggleSaveSite = function (id) {
    if (saved.has(id)) saved.delete(id); else saved.add(id);
    App.replace(App.current.id, App.current.params);
  };

  Screens.culturalScanner = function (container) {
    container.innerHTML = `
      <div class="flex-1 flex flex-col bg-black relative overflow-hidden">
        <div class="absolute inset-0 bg-cover bg-center opacity-80"
          style="background-image:url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=900&q=70')"></div>
        <div class="absolute inset-0 bg-black/35"></div>
        <header class="relative z-10 w-full h-11 px-space-20 flex items-center justify-between text-white pt-space-2">
          <button type="button" onclick="App.back()" class="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">${UI.icon("close")}</button>
          <span class="font-label-md text-label-md font-semibold">Scan Monument</span>
          <span class="w-9"></span>
        </header>
        <main class="relative z-10 flex-1 flex flex-col items-center justify-center px-space-24">
          <div class="w-64 h-64 relative">
            <div class="absolute inset-0 border-2 border-yc-green/80 rounded-2xl"></div>
            <div class="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-4 border-l-4 border-yc-green rounded-tl-xl"></div>
            <div class="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-4 border-r-4 border-yc-green rounded-tr-xl"></div>
            <div class="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-4 border-l-4 border-yc-green rounded-bl-xl"></div>
            <div class="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-4 border-r-4 border-yc-green rounded-br-xl"></div>
            <div class="absolute left-3 right-3 h-0.5 bg-yc-green/90 top-1/3 animate-pulse shadow-[0_0_12px_#22C55E]"></div>
          </div>
          <p class="mt-space-20 text-center text-white font-body-md text-body-md max-w-[280px]">
            Placez le QR Code du monument dans le cadre pour scanner
          </p>
        </main>
        <footer class="relative z-10 p-space-20 pb-space-32">
          <button type="button" onclick="Screens._runScan()"
            class="w-full h-14 rounded-2xl bg-yc-green text-white font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-yc-green/30">
            ${UI.icon("qr_code_scanner", "text-[22px]")} Scanner maintenant
          </button>
        </footer>
      </div>`;
  };

  Screens._runScan = function () {
    App.nav("scannerAnalyzing");
    setTimeout(() => {
      if (App.current && App.current.id === "scannerAnalyzing") App.replace("scannerResult");
    }, 1600);
  };

  Screens.scannerAnalyzing = function (container) {
    const topbar = UI.topBar({ title: "Analyse", back: "App.back()" });
    const body = `<div class="flex-1 flex flex-col items-center justify-center space-y-space-16 py-space-40">
      <div class="w-16 h-16 rounded-full border-4 border-yc-green/20 border-t-yc-green animate-spin"></div>
      <p class="font-body-md text-body-md text-on-surface-variant">Reconnaissance du monument...</p>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.scannerResult = function (container) {
    Screens._showPlace(container, SITES.c3, true);
  };
})();
