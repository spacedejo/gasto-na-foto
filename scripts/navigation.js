(function initializeNavigation(global) {
  const ROUTES = {
    "": "overview",
    "#visao-geral": "overview",
    "#historico": "history",
    "#comprovantes-teste": "samples",
    "#sobre": "about",
  };

  function updateView() {
    const hash = global.location.hash;
    const activeView = ROUTES[hash];

    if (!activeView) {
      global.location.hash = "#visao-geral";
      return;
    }

    document.querySelectorAll("[data-app-view]").forEach((view) => {
      view.hidden = view.dataset.appView !== activeView;
    });
  }

  global.addEventListener("hashchange", updateView);
  updateView();
})(window);
