/* Shell: standard full-screen layout used by most tab screens */
(function () {
  "use strict";

  function renderShell(container, opts) {
    const { topbar, body, nav, noPad } = opts;
    container.innerHTML = `
      ${UI.statusBar()}
      ${topbar || ""}
      <main class="flex-1 flex flex-col overflow-y-auto ${noPad ? "" : "space-y-space-20 px-space-20"} pb-space-24">
        ${body}
      </main>
      ${nav !== false ? UI.bottomNav(nav) : ""}
    `;
  }

  window.Shell = { render: renderShell };
})();
