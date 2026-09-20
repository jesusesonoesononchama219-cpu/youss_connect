(function () {
  "use strict";
  window.Screens = window.Screens || {};

  /* Points d'intérêt réels du Bénin */
  const POIS = [
    { id: "haie-vive", name: "Haie Vive", lat: 6.3570, lng: 2.3910 },
    { id: "aeroport", name: "Aéroport de Cotonou (Gantin)", lat: 6.3572, lng: 2.3844 },
    { id: "dantokpa", name: "Marché Dantokpa", lat: 6.3705, lng: 2.4335 },
    { id: "amazone", name: "Place de l'Amazone", lat: 6.3654, lng: 2.4183 },
    { id: "ganvie", name: "Ganvié", lat: 6.4667, lng: 2.4167 },
    { id: "ouidah", name: "Ouidah · Porte du Non-Retour", lat: 6.3167, lng: 2.0833 },
    { id: "abomey", name: "Abomey · Palais royaux", lat: 7.1829, lng: 1.9912 },
    { id: "porto-novo", name: "Porto-Novo", lat: 6.4969, lng: 2.6283 },
    { id: "parakou", name: "Parakou", lat: 9.3372, lng: 2.6303 }
  ];

  const COTONOU = { lat: 6.3703, lng: 2.3912, zoom: 12 };
  const BENIN = { lat: 9.3, lng: 2.3, zoom: 7 };

  const trip = {
    from: POIS[0].name,
    to: POIS[1].name,
    fromLat: POIS[0].lat,
    fromLng: POIS[0].lng,
    toLat: POIS[1].lat,
    toLng: POIS[1].lng,
    km: 0,
    pickMode: "from",
    mode: "negotiate",
    offer: 2600,
    driverOffer: 2800,
    price: 3800,
    driver: null
  };

  let mapInst = null;
  let fromMarker = null;
  let toMarker = null;
  let routeLine = null;
  let doneLine = null;
  let userMarker = null;
  let carMarker = null;
  let mapInteractive = true;
  let animRaf = null;
  let geoWatchId = null;
  const userPos = { lat: null, lng: null, ok: false };

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function updateTripDistance() {
    if (trip.fromLat == null || trip.toLat == null) {
      trip.km = 0;
      return 0;
    }
    trip.km = Math.round(haversineKm(trip.fromLat, trip.fromLng, trip.toLat, trip.toLng) * 10) / 10;
    return trip.km;
  }

  function priceFromDistance() {
    const km = updateTripDistance() || 5;
    const base = 1500;
    const perKm = 350;
    return Math.max(2000, Math.round((base + km * perKm) / 100) * 100);
  }

  function destroyMap() {
    stopRideAnimation();
    stopGeoWatch();
    if (mapInst) {
      mapInst.off();
      mapInst.remove();
      mapInst = null;
    }
    fromMarker = null;
    toMarker = null;
    routeLine = null;
    doneLine = null;
    userMarker = null;
    carMarker = null;
  }

  function stopRideAnimation() {
    if (animRaf) {
      cancelAnimationFrame(animRaf);
      animRaf = null;
    }
  }

  function stopGeoWatch() {
    if (geoWatchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(geoWatchId);
      geoWatchId = null;
    }
  }

  function pinIcon(color) {
    return L.divIcon({
      className: "",
      html: `<div class="yc-gmap-pin"><span style="background:${color}"></span></div>`,
      iconSize: [28, 40],
      iconAnchor: [14, 38],
      popupAnchor: [0, -34]
    });
  }

  function userIcon() {
    return L.divIcon({
      className: "",
      html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:#4285F4;border:3px solid #fff;box-shadow:0 0 0 8px rgba(66,133,244,.28)"></span>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  }

  function carIcon(bearing) {
    const rot = bearing || 0;
    return L.divIcon({
      className: "",
      html: `<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;transform:rotate(${rot}deg)">
        <div style="width:32px;height:32px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.35);font-size:18px;line-height:1">🚗</div>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  }

  function bearingDeg(lat1, lng1, lat2, lng2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;
    const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function formatEta(totalSec) {
    const s = Math.max(0, Math.round(totalSec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    if (m <= 0) return r + " s";
    return m + " min " + String(r).padStart(2, "0") + " s";
  }

  function etaSecondsFromKm(km) {
    /* ~27 km/h urbain Cotonou (démo) */
    const hours = (km || 1) / 27;
    return Math.max(60, Math.round(hours * 3600));
  }

  function updateUserMarker() {
    if (!mapInst || userPos.lat == null) return;
    if (userMarker) userMarker.setLatLng([userPos.lat, userPos.lng]);
    else {
      userMarker = L.marker([userPos.lat, userPos.lng], { icon: userIcon(), zIndexOffset: 400 })
        .addTo(mapInst)
        .bindPopup("<b>Ma position</b>");
    }
  }

  function startGeoWatch(onUpdate) {
    stopGeoWatch();
    if (!navigator.geolocation) {
      /* Fallback démo près de Haie Vive si GPS indisponible */
      userPos.lat = 6.3585;
      userPos.lng = 2.3930;
      userPos.ok = false;
      if (onUpdate) onUpdate();
      return;
    }
    geoWatchId = navigator.geolocation.watchPosition(
      function (pos) {
        userPos.lat = pos.coords.latitude;
        userPos.lng = pos.coords.longitude;
        userPos.ok = true;
        if (onUpdate) onUpdate();
      },
      function () {
        if (userPos.lat == null) {
          userPos.lat = 6.3585;
          userPos.lng = 2.3930;
          userPos.ok = false;
          if (onUpdate) onUpdate();
        }
      },
      { enableHighAccuracy: true, maximumAge: 8000, timeout: 10000 }
    );
  }

  function syncInputs() {
    const fromEl = document.getElementById("from-input");
    const destEl = document.getElementById("dest-input");
    if (fromEl) fromEl.value = trip.from;
    if (destEl) destEl.value = trip.to;
    const kmEl = document.getElementById("trip-km");
    if (kmEl) {
      updateTripDistance();
      kmEl.textContent = trip.km ? trip.km.toFixed(1).replace(".", ",") + " km" : "—";
    }
    const priceHint = document.getElementById("fixed-price-hint");
    if (priceHint) {
      priceHint.textContent = ACStore.fmtFCFA(priceFromDistance()) + " · sans négociation";
    }
    const negoHint = document.getElementById("nego-price-hint");
    if (negoHint) {
      const p = priceFromDistance();
      negoHint.textContent = "À partir de " + ACStore.fmtFCFA(Math.max(2000, p - 800));
    }
    const hint = document.getElementById("pick-hint");
    if (hint) {
      hint.textContent = trip.pickMode === "from"
        ? "Touchez la carte ou un lieu pour le départ"
        : "Touchez la carte ou un lieu pour la destination";
    }
    const btnFrom = document.getElementById("pick-from-btn");
    const btnTo = document.getElementById("pick-to-btn");
    if (btnFrom && btnTo) {
      const base = "px-3 h-8 flex-shrink-0 rounded-full font-label-sm text-label-sm font-semibold shadow-sm ";
      btnFrom.className = base + (trip.pickMode === "from" ? "bg-[#34A853] text-white" : "bg-white text-on-surface-variant");
      btnTo.className = base + (trip.pickMode === "to" ? "bg-[#EA4335] text-white" : "bg-white text-on-surface-variant");
    }
    const modeNego = document.getElementById("mode-nego");
    const modeFixed = document.getElementById("mode-fixed");
    if (modeNego && modeFixed) {
      modeNego.className = "w-full text-left rounded-xl p-3 border-2 transition-colors " +
        (trip.mode === "negotiate" ? "border-[#34A853] bg-[#34A853]/8" : "border-outline-variant/30");
      modeFixed.className = "w-full text-left rounded-xl p-3 border-2 transition-colors " +
        (trip.mode === "fixed" ? "border-[#4285F4] bg-[#4285F4]/8" : "border-outline-variant/30");
    }
  }

  function refreshMarkers() {
    if (!mapInst) return;
    if (trip.fromLat != null) {
      if (fromMarker) fromMarker.setLatLng([trip.fromLat, trip.fromLng]);
      else fromMarker = L.marker([trip.fromLat, trip.fromLng], { icon: pinIcon("#34A853") }).addTo(mapInst);
      fromMarker.bindPopup("<b>Départ</b><br>" + trip.from);
    }
    if (trip.toLat != null) {
      if (toMarker) toMarker.setLatLng([trip.toLat, trip.toLng]);
      else toMarker = L.marker([trip.toLat, trip.toLng], { icon: pinIcon("#EA4335") }).addTo(mapInst);
      toMarker.bindPopup("<b>Destination</b><br>" + trip.to);
    }
    if (routeLine) {
      mapInst.removeLayer(routeLine);
      routeLine = null;
    }
    if (trip.fromLat != null && trip.toLat != null) {
      routeLine = L.polyline(
        [[trip.fromLat, trip.fromLng], [trip.toLat, trip.toLng]],
        { color: "#4285F4", weight: 5, opacity: 0.9 }
      ).addTo(mapInst);
    }
    syncInputs();
  }

  function fitTripBounds() {
    if (!mapInst) return;
    if (trip.fromLat != null && trip.toLat != null) {
      mapInst.fitBounds(
        L.latLngBounds([trip.fromLat, trip.fromLng], [trip.toLat, trip.toLng]),
        { paddingTopLeft: [40, 120], paddingBottomRight: [40, 260], maxZoom: 14 }
      );
    } else if (trip.fromLat != null) {
      mapInst.setView([trip.fromLat, trip.fromLng], 13);
    } else if (trip.toLat != null) {
      mapInst.setView([trip.toLat, trip.toLng], 13);
    }
  }

  function initTransportMap(elId, opts) {
    opts = opts || {};
    mapInteractive = opts.interactive !== false;
    const showUser = opts.showUser !== false;
    const animateCar = !!opts.animateCar;
    destroyMap();
    const el = document.getElementById(elId);
    if (!el || typeof L === "undefined") return;

    mapInst = L.map(elId, {
      zoomControl: false,
      attributionControl: true,
      dragging: true,
      scrollWheelZoom: true,
      tapTolerance: 15
    }).setView([COTONOU.lat, COTONOU.lng], COTONOU.zoom);

    L.control.zoom({ position: "bottomright" }).addTo(mapInst);

    /* Style rues proche de Google Maps (Carto Voyager) */
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
      subdomains: "abcd",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
    }).addTo(mapInst);

    refreshMarkers();
    fitTripBounds();

    if (mapInteractive) {
      mapInst.on("click", function (e) {
        const place = {
          name: "Point sur la carte (" + e.latlng.lat.toFixed(4) + ", " + e.latlng.lng.toFixed(4) + ")",
          lat: e.latlng.lat,
          lng: e.latlng.lng
        };
        Screens._setTripPoint(trip.pickMode, place, false);
      });
    }

    if (showUser) {
      startGeoWatch(function () {
        updateUserMarker();
      });
    }

    if (animateCar) {
      startRideAnimation();
    }

    setTimeout(function () {
      if (mapInst) {
        mapInst.invalidateSize();
        fitTripBounds();
      }
    }, 80);
  }

  function startRideAnimation() {
    stopRideAnimation();
    if (!mapInst || trip.fromLat == null || trip.toLat == null) return;

    const totalKm = updateTripDistance() || 1;
    const realEtaSec = etaSecondsFromKm(totalKm);
    /* Durée visuelle compressée pour la démo (40–90 s) */
    const animSec = Math.min(90, Math.max(40, totalKm * 10));
    const start = performance.now();
    const brg = bearingDeg(trip.fromLat, trip.fromLng, trip.toLat, trip.toLng);

    if (carMarker) mapInst.removeLayer(carMarker);
    carMarker = L.marker([trip.fromLat, trip.fromLng], {
      icon: carIcon(brg),
      zIndexOffset: 600
    }).addTo(mapInst);

    function tick(now) {
      if (!mapInst || !carMarker) return;
      const t = Math.min(1, (now - start) / (animSec * 1000));
      const lat = lerp(trip.fromLat, trip.toLat, t);
      const lng = lerp(trip.fromLng, trip.toLng, t);
      carMarker.setLatLng([lat, lng]);
      carMarker.setIcon(carIcon(brg));

      if (doneLine) {
        mapInst.removeLayer(doneLine);
        doneLine = null;
      }
      doneLine = L.polyline(
        [[trip.fromLat, trip.fromLng], [lat, lng]],
        { color: "#34A853", weight: 5, opacity: 0.95 }
      ).addTo(mapInst);

      const remainKm = Math.max(0, totalKm * (1 - t));
      const remainSec = Math.max(0, realEtaSec * (1 - t));
      const etaTitle = document.getElementById("ride-eta-title");
      const etaMeta = document.getElementById("ride-eta-meta");
      const etaBar = document.getElementById("ride-progress");
      if (etaTitle) etaTitle.textContent = t >= 1 ? "Arrivé" : formatEta(remainSec);
      if (etaMeta) {
        etaMeta.textContent = t >= 1
          ? "Destination atteinte"
          : remainKm.toFixed(1).replace(".", ",") + " km restants · " + formatEta(remainSec);
      }
      if (etaBar) etaBar.style.width = Math.round(t * 100) + "%";

      if (t < 1) {
        animRaf = requestAnimationFrame(tick);
      } else {
        animRaf = null;
        UI.toast("Vous êtes arrivé à destination", "success");
      }
    }
    animRaf = requestAnimationFrame(tick);
  }

  /* Écran 3 — Transport (format type Google Maps) */
  Screens.transport = function (container) {
    updateTripDistance();
    const body = `
    <div class="yc-gmap-wrap">
      <div id="yc-transport-map" class="absolute inset-0 z-0"></div>

      <div class="absolute top-0 left-0 right-0 z-[600] p-3 space-y-2 pointer-events-none">
        <div class="flex items-center gap-2 pointer-events-auto">
          <button type="button" onclick="App.nav('home')"
            class="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-on-surface flex-shrink-0">
            ${UI.icon("arrow_back")}
          </button>
          <div class="yc-gmap-card flex-1 px-3 py-2 space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#34A853] flex-shrink-0"></span>
              <input id="from-input" value="${trip.from}" placeholder="Point de départ" readonly
                onclick="Screens._setPickMode('from')"
                class="flex-1 bg-transparent focus:outline-none font-body-sm text-body-sm cursor-pointer truncate"/>
              <button type="button" onclick="Screens._swapTripPoints()" class="text-outline flex-shrink-0">${UI.icon("swap_vert", "text-[18px]")}</button>
            </div>
            <div class="h-px bg-outline-variant/40 ml-4"></div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#EA4335] flex-shrink-0"></span>
              <input id="dest-input" value="${trip.to}" placeholder="Destination" readonly
                onclick="Screens._setPickMode('to')"
                class="flex-1 bg-transparent focus:outline-none font-body-sm text-body-sm cursor-pointer truncate"/>
            </div>
          </div>
        </div>
        <div class="flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto pl-12">
          <button type="button" id="pick-from-btn" onclick="Screens._setPickMode('from')"
            class="px-3 h-8 flex-shrink-0 rounded-full font-label-sm text-label-sm font-semibold shadow-sm ${trip.pickMode === "from" ? "bg-[#34A853] text-white" : "bg-white text-on-surface-variant"}">Départ</button>
          <button type="button" id="pick-to-btn" onclick="Screens._setPickMode('to')"
            class="px-3 h-8 flex-shrink-0 rounded-full font-label-sm text-label-sm font-semibold shadow-sm ${trip.pickMode === "to" ? "bg-[#EA4335] text-white" : "bg-white text-on-surface-variant"}">Arrivée</button>
          ${POIS.slice(0, 6).map((p) => `
            <button type="button" onclick="Screens._pickPoi('${p.id}')"
              class="px-3 h-8 flex-shrink-0 rounded-full font-label-sm text-label-sm whitespace-nowrap bg-white shadow-sm text-on-surface-variant">
              ${p.name.split("·")[0].trim()}
            </button>`).join("")}
        </div>
        <p id="pick-hint" class="font-label-sm text-label-sm text-white pl-12 drop-shadow pointer-events-none"
          style="text-shadow:0 1px 3px rgba(0,0,0,.55)">
          ${trip.pickMode === "from" ? "Touchez la carte pour le départ" : "Touchez la carte pour la destination"}
        </p>
      </div>

      <div class="absolute right-3 z-[600] flex flex-col gap-2" style="bottom: calc(42% + 16px)">
        <button type="button" onclick="Screens._useMyPosition()"
          class="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-[#4285F4]"
          title="Ma position">${UI.icon("my_location")}</button>
        <button type="button" onclick="Screens._mapZoomCotonou()"
          class="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-on-surface-variant"
          title="Cotonou">${UI.icon("near_me")}</button>
        <button type="button" onclick="Screens._mapZoomBenin()"
          class="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-primary"
          title="Bénin">${UI.icon("public")}</button>
      </div>

      <div class="absolute bottom-0 left-0 right-0 z-[600] yc-gmap-sheet p-4 space-y-3 max-h-[46%] overflow-y-auto">
        <div class="w-10 h-1 rounded-full bg-outline-variant/50 mx-auto"></div>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-title-md text-title-md font-bold">Choisir une course</p>
            <p class="font-label-sm text-label-sm text-on-surface-variant"><span id="trip-km">${trip.km ? trip.km.toFixed(1).replace(".", ",") + " km" : "—"}</span> · Bénin</p>
          </div>
        </div>
        <button type="button" id="mode-nego" onclick="Screens._transportMode('negotiate')"
          class="w-full text-left rounded-xl p-3 border-2 transition-colors ${trip.mode === "negotiate" ? "border-[#34A853] bg-[#34A853]/8" : "border-outline-variant/30"}">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-3 min-w-0">
              ${UI.icon("handshake", "text-[#34A853] text-[24px]")}
              <div class="min-w-0">
                <p class="font-label-md text-label-md font-bold">Négocier</p>
                <p class="font-body-sm text-body-sm text-on-surface-variant truncate" id="nego-price-hint">À partir de ${ACStore.fmtFCFA(Math.max(2000, priceFromDistance() - 800))}</p>
              </div>
            </div>
            ${trip.mode === "negotiate" ? UI.icon("check_circle", "text-[#34A853] text-[20px]", true) : ""}
          </div>
        </button>
        <button type="button" id="mode-fixed" onclick="Screens._transportMode('fixed')"
          class="w-full text-left rounded-xl p-3 border-2 transition-colors ${trip.mode === "fixed" ? "border-[#4285F4] bg-[#4285F4]/8" : "border-outline-variant/30"}">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-3 min-w-0">
              ${UI.icon("directions_car", "text-[#4285F4] text-[24px]")}
              <div class="min-w-0">
                <p class="font-label-md text-label-md font-bold">Prix fixe</p>
                <p class="font-body-sm text-body-sm text-on-surface-variant truncate" id="fixed-price-hint">${ACStore.fmtFCFA(priceFromDistance())} · sans négociation</p>
              </div>
            </div>
            ${trip.mode === "fixed" ? UI.icon("check_circle", "text-[#4285F4] text-[20px]", true) : ""}
          </div>
        </button>
        <button type="button" onclick="Screens._transportRequest()"
          class="w-full h-12 rounded-full bg-[#1a73e8] text-white font-label-lg text-label-lg font-bold shadow-md active:scale-[0.99]">
          Demander un Youss
        </button>
      </div>
    </div>`;
    Shell.render(container, { topbar: "", body, nav: false, fill: true });
    initTransportMap("yc-transport-map", { interactive: true, showUser: true });
  };

  Screens._useMyPosition = function () {
    function apply() {
      if (userPos.lat == null) {
        UI.toast("Position indisponible. Autorisez la localisation.", "error");
        return;
      }
      Screens._setTripPoint("from", {
        name: userPos.ok ? "Ma position actuelle" : "Ma position (estimée)",
        lat: userPos.lat,
        lng: userPos.lng
      }, false);
      trip.pickMode = "to";
      syncInputs();
      if (mapInst) mapInst.setView([userPos.lat, userPos.lng], 14);
      UI.toast("Départ = votre position", "success");
    }
    if (userPos.lat != null) {
      apply();
      return;
    }
    let applied = false;
    UI.toast("Localisation en cours…", "info");
    startGeoWatch(function () {
      updateUserMarker();
      if (!applied && userPos.lat != null) {
        applied = true;
        apply();
      }
    });
  };

  Screens._setPickMode = function (mode) {
    trip.pickMode = mode === "to" ? "to" : "from";
    syncInputs();
  };

  Screens._mapZoomBenin = function () {
    if (mapInst) mapInst.setView([BENIN.lat, BENIN.lng], BENIN.zoom);
  };

  Screens._mapZoomCotonou = function () {
    if (mapInst) mapInst.setView([COTONOU.lat, COTONOU.lng], COTONOU.zoom);
  };

  Screens._setTripPoint = function (role, place, replace) {
    if (role === "from") {
      trip.from = place.name;
      trip.fromLat = place.lat;
      trip.fromLng = place.lng;
      if (trip.pickMode === "from") trip.pickMode = "to";
    } else {
      trip.to = place.name;
      trip.toLat = place.lat;
      trip.toLng = place.lng;
    }
    updateTripDistance();
    if (replace) {
      App.replace("transport");
    } else {
      refreshMarkers();
      fitTripBounds();
      syncInputs();
      UI.toast((role === "from" ? "Départ : " : "Destination : ") + place.name.split("(")[0].trim(), "info");
    }
  };

  Screens._pickPoi = function (id) {
    const p = POIS.find((x) => x.id === id);
    if (!p) return;
    Screens._setTripPoint(trip.pickMode, p, false);
  };

  Screens._swapTripPoints = function () {
    const f = { name: trip.from, lat: trip.fromLat, lng: trip.fromLng };
    trip.from = trip.to;
    trip.fromLat = trip.toLat;
    trip.fromLng = trip.toLng;
    trip.to = f.name;
    trip.toLat = f.lat;
    trip.toLng = f.lng;
    updateTripDistance();
    refreshMarkers();
    fitTripBounds();
    syncInputs();
  };

  Screens._transportMode = function (mode) {
    trip.mode = mode;
    syncInputs();
  };

  Screens._transportRequest = function () {
    if (trip.fromLat == null || trip.fromLng == null) {
      UI.toast("Indiquez un point de départ sur la carte.", "error");
      return;
    }
    if (trip.toLat == null || trip.toLng == null || !trip.to) {
      UI.toast("Indiquez une destination sur la carte.", "error");
      return;
    }
    const base = priceFromDistance();
    if (trip.mode === "negotiate") {
      trip.driverOffer = base;
      trip.offer = Math.max(2000, base - 200);
      App.nav("transportNegotiate");
    } else {
      trip.price = base;
      Screens._transportSearch();
    }
  };

  /* Écran 4 — Négociation */
  Screens.transportNegotiate = function (container) {
    destroyMap();
    const topbar = UI.topBar({ title: "Négociation", back: "App.back()" });
    const body = `
    <section class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-16 flex items-center gap-3">
      <img class="w-14 h-14 rounded-full object-cover" src="https://i.pravatar.cc/100?u=mamadou" alt=""/>
      <div class="flex-1 min-w-0">
        <p class="font-title-md text-title-md font-bold">Koffi Adjovi</p>
        <p class="font-body-sm text-body-sm text-on-surface-variant">Toyota Corolla · ★ 4,8</p>
      </div>
      <div class="text-center px-3 py-2 rounded-xl bg-primary/10">
        <p class="font-label-sm text-label-sm text-on-surface-variant">Temps</p>
        <p class="font-headline-sm text-headline-sm font-bold text-primary" id="nego-timer">02:45</p>
      </div>
    </section>

    <p class="font-body-sm text-body-sm text-on-surface-variant text-center">${trip.from} → ${trip.to}${trip.km ? " · " + trip.km.toFixed(1).replace(".", ",") + " km" : ""}</p>

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
    destroyMap();
    App.nav("transportSearching");
    setTimeout(() => {
      if (App.current && App.current.id === "transportSearching") {
        trip.driver = {
          name: "Koffi Adjovi",
          car: "Toyota Corolla",
          plate: "RB-4821-A",
          rating: 4.8,
          phone: "+229 97 11 22 33",
          avatar: "https://i.pravatar.cc/100?u=koffi-adjovi"
        };
        App.replace("transportInRide");
      }
    }, 2200);
  };

  Screens.transportSearching = function (container) {
    destroyMap();
    const topbar = UI.topBar({ title: "Recherche", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center justify-center text-center space-y-space-20 py-space-40">
      <div class="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full pulse-ring"></div>
        ${UI.icon("directions_car", "text-primary text-[40px]")}
      </div>
      <h2 class="font-headline-sm text-headline-sm font-bold">Recherche d'un chauffeur...</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">${trip.from} → ${trip.to}${trip.km ? " · " + trip.km.toFixed(1).replace(".", ",") + " km" : ""}</p>
      <button type="button" onclick="App.nav('home')" class="font-label-md text-label-md text-error">Annuler</button>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  /* Écran 5 — Trajet en cours (format type Google Maps) */
  Screens.transportInRide = function (container) {
    const d = trip.driver;
    updateTripDistance();
    const etaSec = etaSecondsFromKm(trip.km || 6);
    const body = `
    <div class="yc-gmap-wrap">
      <div id="yc-inride-map" class="absolute inset-0 z-0"></div>

      <div class="absolute top-3 left-3 right-3 z-[600] flex justify-between items-start pointer-events-none">
        <button type="button" onclick="App.nav('home')"
          class="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center pointer-events-auto">${UI.icon("close")}</button>
        <div class="flex gap-2 pointer-events-auto">
          <span class="inline-flex items-center gap-1 h-10 px-3 rounded-full bg-[#34A853] text-white font-label-sm text-label-sm font-bold shadow-md">
            ${UI.icon("verified_user", "text-[14px]")} En sécurité
          </span>
          <button type="button" onclick="Screens._transportSOS()"
            class="h-10 px-3 rounded-full bg-[#EA4335] text-white font-label-sm text-label-sm font-bold shadow-md">SOS</button>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 z-[600] yc-gmap-sheet p-4 space-y-3">
        <div class="w-10 h-1 rounded-full bg-outline-variant/50 mx-auto"></div>
        <div class="space-y-1.5">
          <div class="flex justify-between items-end gap-2">
            <div>
              <p class="font-label-sm text-label-sm text-on-surface-variant">Temps restant</p>
              <p class="font-headline-sm text-headline-sm font-bold text-[#1a73e8]" id="ride-eta-title">${formatEta(etaSec)}</p>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant text-right" id="ride-eta-meta">${(trip.km || 0).toFixed(1).replace(".", ",")} km · ${trip.to.split("·")[0].trim()}</p>
          </div>
          <div class="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div id="ride-progress" class="h-full bg-[#34A853] rounded-full" style="width:0%"></div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <img class="w-12 h-12 rounded-full object-cover" src="${d.avatar}" alt=""/>
          <div class="flex-1 min-w-0">
            <p class="font-title-md text-title-md font-bold truncate">${d.name} · ★ ${d.rating}</p>
            <p class="font-body-sm text-body-sm text-on-surface-variant truncate">${d.car} · ${d.plate}</p>
          </div>
          <a href="tel:${d.phone}" class="w-11 h-11 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">${UI.icon("call")}</a>
          <button type="button" onclick="UI.toast('Lien de suivi partagé', 'success')"
            class="w-11 h-11 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">${UI.icon("share")}</button>
        </div>
        <div class="flex items-center justify-between px-1">
          <span class="font-body-md text-body-md text-on-surface-variant">Montant</span>
          <span class="font-label-lg text-label-lg font-bold">${ACStore.fmtFCFA(trip.price)}</span>
        </div>
        <button type="button" onclick="Screens._transportFinish()"
          class="w-full h-12 rounded-full bg-[#1a73e8] text-white font-label-lg text-label-lg font-bold shadow-md">
          Terminer la course
        </button>
      </div>
    </div>`;
    Shell.render(container, { topbar: "", body, nav: false, fill: true });
    initTransportMap("yc-inride-map", { interactive: false, showUser: false, animateCar: true });
  };

  Screens._transportSOS = function () { App.nav("sos"); };

  Screens.sos = function (container) {
    destroyMap();
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

  Screens._transportFinish = function () {
    destroyMap();
    App.nav("transportRating");
  };

  let ratingValue = 5;
  Screens.transportRating = function (container) {
    destroyMap();
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
    destroyMap();
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
