(function () {
  "use strict";
  window.Screens = window.Screens || {};

  /* Lieux culturels RÉELS du Bénin — photos Wikimedia Commons */
  const WM = (file) =>
    "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(file) + "?width=800";

  const SITES = {
    c1: {
      id: "c1",
      name: "Palais royaux d'Abomey",
      place: "Abomey, Zou · Bénin",
      body: "Site du patrimoine mondial de l'UNESCO depuis 1985. Les palais des rois du Dahomey (XVIIIe–XIXe s.) abritent aujourd'hui le Musée historique d'Abomey, témoin de l'histoire du royaume et de ses traditions.",
      tone: "from-[#5B2A8F] to-[#3B1466]",
      icon: "account_balance",
      img: WM("Palais_du_roi_Glele.jpg")
    },
    c2: {
      id: "c2",
      name: "Porte du Non-Retour",
      place: "Ouidah, Atlantique · Bénin",
      body: "Monument situé au bout de la Route des Esclaves à Ouidah. Elle marque le point d'embarquement des captifs vers les Amériques et constitue un haut lieu de mémoire de la traite atlantique au Bénin.",
      tone: "from-[#0E7C6B] to-[#0B5A4D]",
      icon: "castle",
      img: WM("Door_of_no_return.jpg")
    },
    c3: {
      id: "c3",
      name: "Place de l'Amazone",
      place: "Cotonou, Littoral · Bénin",
      body: "Place publique de Cotonou inaugurée en 2022, dominée par la statue de l'Amazone. Elle rend hommage aux Agojié, guerrières du royaume du Dahomey, symbole fort de l'identité béninoise.",
      tone: "from-[#B45309] to-[#7C2D12]",
      icon: "museum",
      img: WM("Monument_de_l'Amazone_au_Benin.jpg")
    },
    c4: {
      id: "c4",
      name: "Village lacustre de Ganvié",
      place: "Lac Nokoué · Bénin",
      body: "Surnommé la « Venise de l'Afrique », Ganvié est un village sur pilotis sur le lac Nokoué, près de Cotonou. Ses habitants, les Tofinu, y vivent de la pêche et du commerce depuis plusieurs siècles.",
      tone: "from-[#0369A1] to-[#0C4A6E]",
      icon: "water",
      img: WM("Ganvié.jpg")
    },
    c5: {
      id: "c5",
      name: "Marché Dantokpa",
      place: "Cotonou · Bénin",
      body: "Plus grand marché ouvert d'Afrique de l'Ouest, Dantokpa s'étend le long de la lagune de Cotonou. On y trouve tissus wax, produits alimentaires, artisanat et commerce régional.",
      tone: "from-[#CA8A04] to-[#854D0E]",
      icon: "storefront",
      img: WM("Dantokpa.jpg")
    }
  };
  let lang = "fr";
  const saved = new Set();

  function siteThumb(s, iconSize) {
    return `
      <img class="absolute inset-0 w-full h-full object-cover" src="${s.img}" alt="${s.name}"
        onerror="this.style.display='none';var fb=this.parentElement&&this.parentElement.querySelector('[data-fallback]');if(fb)fb.classList.remove('hidden')"/>
      <div data-fallback class="absolute inset-0 hidden bg-gradient-to-br ${s.tone} flex items-center justify-center text-white">
        ${UI.icon(s.icon, iconSize || "text-[40px]")}
      </div>`;
  }

  function siteCard(s) {
    return `
    <button type="button" onclick="App.nav('cultureDetail', {id:'${s.id}'})"
      class="min-w-[200px] rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest text-left shadow-sm active:scale-[0.98]">
      <div class="h-28 relative bg-surface-container-low">
        ${siteThumb(s)}
      </div>
      <div class="p-space-12">
        <h3 class="font-label-md text-label-md font-bold text-on-surface line-clamp-2">${s.name}</h3>
        <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">${s.place}</p>
      </div>
    </button>`;
  }

  Screens.culture = function (container) {
    const topbar = UI.topBar({ title: "Tourisme & Culture", subtitle: "Découvrez le Bénin", back: "App.nav('home')" });
    const body = `
    <section onclick="App.nav('culturalScanner')"
      class="rounded-2xl bg-gradient-to-br from-primary to-primary-container text-white p-space-16 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform shadow-lg shadow-primary/20">
      <div>
        <p class="font-label-sm text-label-sm text-white/70 mb-1">Scanner un monument</p>
        <h3 class="font-title-md text-title-md font-bold">Histoire du patrimoine béninois</h3>
      </div>
      <span class="w-12 h-12 rounded-full bg-yc-green flex items-center justify-center">${UI.icon("qr_code_scanner", "text-[24px]", true)}</span>
    </section>

    <section class="flex flex-col space-y-space-12">
      <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Lieux emblématiques</h2>
      <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        ${Object.values(SITES).map(siteCard).join("")}
      </div>
    </section>

    <section class="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-space-16">
      <p class="font-label-md text-label-md font-bold text-on-surface mb-1">Destinations</p>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Cotonou · Porto-Novo · Ouidah · Abomey · Parakou · Natitingou · Grand-Popo · Ganvié</p>
    </section>`;
    Shell.render(container, { topbar, body, nav: "culturalScanner" });
  };

  Screens.cultureDetail = function (container, params) {
    const s = SITES[params.id] || SITES.c1;
    Screens._showPlace(container, s, true);
  };

  function placeTabs(active) {
    return ["Aperçu", "Histoire", "Visite", "Infos"].map((t) => `
      <button type="button" class="px-3 py-1.5 rounded-full font-label-sm text-label-sm font-semibold ${t === active ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant"}">${t}</button>
    `).join("");
  }

  Screens._showPlace = function (container, s, withBack) {
    const topbar = UI.topBar({ title: "Découverte", back: withBack ? "App.back()" : "App.nav('culture')" });
    const body = `
    <section class="h-44 rounded-2xl relative overflow-hidden flex items-end bg-surface-container-low">
      ${siteThumb(s, "text-[88px]")}
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"></div>
      <div class="relative z-10 p-space-16 text-white w-full">
        <h2 class="font-headline-sm text-headline-sm font-bold">${s.name}</h2>
        <p class="font-body-sm text-body-sm text-white/85">${s.place}</p>
      </div>
    </section>

    <div class="flex gap-2 overflow-x-auto no-scrollbar">${placeTabs("Aperçu")}</div>

    <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">${s.body}</p>

    <section class="w-full">
      <p class="font-label-md text-label-md font-semibold text-on-surface mb-2">Langue</p>
      <div class="flex gap-2">
        ${[
          { id: "fr", label: "FR" },
          { id: "en", label: "EN" },
          { id: "fon", label: "Fon" },
          { id: "yo", label: "Yoruba" }
        ].map((l) => `
          <button type="button" onclick="Screens._setLang('${l.id}')"
            class="flex-1 h-10 rounded-xl border font-label-sm text-label-sm font-semibold ${lang === l.id ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/40 text-on-surface-variant"}">
            ${l.label}
          </button>
        `).join("")}
      </div>
      <p class="font-label-sm text-label-sm text-on-surface-variant mt-2">Langues nationales du Bénin (démo)</p>
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
    const scanBg = SITES.c3.img;
    container.innerHTML = `
      <div class="flex-1 flex flex-col bg-[#1a1228] relative overflow-hidden">
        <img class="absolute inset-0 w-full h-full object-cover opacity-40" src="${scanBg}" alt=""
          onerror="this.remove()"/>
        <div class="absolute inset-0 bg-gradient-to-b from-[#3B1466]/75 via-[#2A0D4A]/85 to-[#1a1228]"></div>
        <header class="relative z-10 w-full h-11 px-space-20 flex items-center justify-between text-white pt-space-2">
          <button type="button" onclick="App.back()" class="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">${UI.icon("close")}</button>
          <span class="font-label-md text-label-md font-semibold">Scan Monument · Bénin</span>
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
            Scannez un QR Code sur un site patrimonial béninois
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
      <p class="font-body-md text-body-md text-on-surface-variant">Reconnaissance du site béninois...</p>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.scannerResult = function (container) {
    Screens._showPlace(container, SITES.c3, true);
  };
})();
