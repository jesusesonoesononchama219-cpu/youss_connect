/* =========================================================
   AFRICA CONNECT — ROUTER
   Every screen module registers itself into window.Screens.
   App.nav(id, params) pushes history; App.back() pops it.
   ========================================================= */
(function () {
  "use strict";
  const container = document.getElementById("app");
  let stack = [];
  let current = null;

  function show(id, params) {
    const fn = window.Screens && window.Screens[id];
    if (!fn) {
      console.error("Unknown screen:", id);
      container.innerHTML = `<div class="p-8 text-center font-body-md">Écran introuvable : ${id}</div>`;
      return;
    }
    current = { id, params: params || {} };
    fn(container, current.params);
    container.scrollTop = 0;
  }

  function nav(id, params) {
    if (current) stack.push(current);
    show(id, params);
  }

  function replace(id, params) {
    show(id, params);
  }

  function back() {
    const prev = stack.pop();
    show(prev ? prev.id : "home", prev ? prev.params : {});
  }

  function resetTo(id, params) {
    stack = [];
    show(id, params);
  }

  window.App = {
    nav, back, replace, resetTo,
    get current() { return current; }
  };

  // Any cross-cutting state change (wallet, rewards, notifications, activities)
  // re-renders whatever screen is currently visible so numbers stay live.
  ACStore.subscribe(function () {
    if (current) show(current.id, current.params);
  });

  document.addEventListener("DOMContentLoaded", function () {
    UI.initOfflineBanner();
    container.innerHTML = UI.skeletonBoot();
    setTimeout(function () {
      show(ACState.session.authenticated ? "home" : "splash", {});
    }, 350);
  });
})();
