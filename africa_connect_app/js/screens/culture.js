(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const SITES = {
    c1: { id: "c1", name: "Palais Royaux d'Abomey", place: "Abomey", body: "Classés au patrimoine mondial de l'UNESCO, les palais royaux d'Abomey témoignent de l'histoire du royaume du Dahomey." },
    c2: { id: "c2", name: "Route des Esclaves", place: "Ouidah", body: "Un parcours mémoriel retraçant l'histoire de la traite négrière depuis Ouidah jusqu'à la Porte du Non-Retour." }
  };
  const saved = new Set();

  Screens.culture = function (container) {
    const topbar = UI.topBar({ title: "Culture & Tourisme", subtitle: "Patrimoine et découvertes", back: "App.nav('home')" });
    const body = `
    <section onclick="App.nav('culturalScanner')" class="rounded-xl bg-primary-container text-on-primary p-space-16 flex items-center justify-between cursor-pointer">
      <div class="flex items-center space-x-3">${UI.icon("center_focus_strong")}<span class="font-title-md text-title-md">Scanner culturel</span></div>
      ${UI.icon("arrow_forward")}
    </section>
    <section class="flex flex-col space-y-3">
      ${Object.values(SITES).map(s => `
      <div onclick="App.nav('cultureDetail', {id:'${s.id}'})" class="rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest cursor-pointer">
        <div class="h-28 bg-surface-container-low flex items-center justify-center text-primary-container">${UI.icon("account_balance", "text-[32px]")}</div>
        <div class="p-space-16"><h3 class="font-title-md text-title-md">${s.name}</h3><p class="font-body-sm text-body-sm text-on-surface-variant">${s.place}</p></div>
      </div>`).join("")}
    </section>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.cultureDetail = function (container, params) {
    const s = SITES[params.id] || Object.values(SITES)[0];
    const isSaved = saved.has(s.id);
    const topbar = UI.topBar({ title: s.name, back: "App.back()" });
    const body = `
    <section class="h-40 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container">${UI.icon("account_balance", "text-[48px]")}</section>
    <p class="font-body-md text-body-md text-on-surface-variant">${s.body}</p>
    <div class="flex space-x-3">
      ${UI.secondaryButton(isSaved ? "Sauvegardé ✓" : "Sauvegarder", `Screens._toggleSaveSite('${s.id}')`)}
      ${UI.secondaryButton("Partager", "Screens._shareSite()")}
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._toggleSaveSite = function (id) {
    if (saved.has(id)) saved.delete(id); else saved.add(id);
    App.replace(App.current.id, App.current.params);
  };
  Screens._shareSite = function () { UI.toast("Lien de partage copié.", "success"); };

  Screens.culturalScanner = function (container) {
    const topbar = UI.topBar({ title: "Scanner culturel", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center justify-center text-center space-y-space-16 py-space-16">
      <div class="w-full h-64 rounded-xl bg-surface-container-low border-2 border-dashed border-primary-container/40 flex flex-col items-center justify-center text-primary-container">
        ${UI.icon("center_focus_strong", "text-[64px]")}
        <span class="font-label-md text-label-md mt-2">Visez un monument ou une œuvre</span>
      </div>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">Démonstration : la reconnaissance visuelle réelle n'est pas connectée. Cette simulation montre le parcours complet.</p>
      <div class="w-full px-space-20">${UI.primaryButton("Simuler une analyse", "Screens._runScan()", { icon: "center_focus_strong" })}</div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._runScan = function () {
    App.nav("scannerAnalyzing");
    setTimeout(() => { if (App.current.id === "scannerAnalyzing") App.replace("scannerResult"); }, 1800);
  };
  Screens.scannerAnalyzing = function (container) {
    const topbar = UI.topBar({ title: "Analyse en cours", back: "App.back()" });
    const body = `<div class="flex-1 flex flex-col items-center justify-center space-y-space-16 py-space-40">
      <div class="w-16 h-16 rounded-full border-4 border-primary-container/20 border-t-primary-container animate-spin"></div>
      <p class="font-body-md text-body-md text-on-surface-variant">Analyse de l'image (simulation)...</p>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens.scannerResult = function (container) {
    const topbar = UI.topBar({ title: "Résultat", back: "App.back()" });
    const body = `
    <section class="h-40 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container">${UI.icon("account_balance", "text-[48px]")}</section>
    <section class="flex flex-col space-y-2">
      <h2 class="font-headline-md text-headline-md font-bold">Monument de l'Amazone</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Cotonou, Bénin</p>
      <p class="font-body-md text-body-md text-on-surface-variant">Ce monument emblématique rend hommage aux guerrières Agojié du royaume du Dahomey, symbole de courage et de résistance.</p>
      ${UI.badge("Contenu de démonstration", "neutral")}
    </section>
    <div class="pt-space-8">${UI.secondaryButton("Nouvelle analyse", "App.nav('culturalScanner')")}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
})();
