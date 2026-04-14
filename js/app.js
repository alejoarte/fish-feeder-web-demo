(function () {
  var screensData = window.FishFeederScreensData || { screens: {}, groups: [] };
  var specsData = window.FishFeederSpecsData || { components: [], constants: [] };
  var ledRules = window.FishFeederLedRules || { priority: [] };
  var i18n = window.FishFeederI18n;
  var activeComponentId = null;
  var activePriorityTabIndex = 0;
  var featureIndex = 0;

  function t(key, vars) {
    return i18n ? i18n.t(key, vars) : key;
  }

  function localize(value) {
    return i18n ? i18n.localize(value) : value;
  }

  function createElement(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (typeof text === "string") {
      node.textContent = text;
    }
    return node;
  }

  function renderHome() {
    var spotlight = document.getElementById("feature-spotlight");
    var prev = document.getElementById("feature-prev");
    var next = document.getElementById("feature-next");
    var dots = document.getElementById("feature-dots");
    if (!spotlight || !prev || !next || !dots) {
      return;
    }

    var features = [
      {
        tag: localize({ en: "LED + Specs", es: "LED + Especificaciones" }),
        title: localize({ en: "See the exact thresholds behind every color.", es: "Mira los umbrales exactos detras de cada color." }),
        body: localize({ en: "Blue always wins for motor activity, followed by red for pH, white for temperature, green for food low, and off for normal.", es: "Azul siempre gana por actividad del motor, seguido por rojo para pH, blanco para temperatura, verde para alimento bajo y apagado para normal." }),
        bullets: localize([{ en: "Printable spec layout", es: "Formato imprimible" }, { en: "Clickable component details", es: "Detalles por componente" }, { en: "Hardware pins and constants", es: "Pines y constantes" }]),
        href: "pages/specs.html"
      },
      {
        tag: localize({ en: "Screens Gallery", es: "Galeria de Pantallas" }),
        title: localize({ en: "Scroll through the firmware story without interacting.", es: "Recorre la historia del firmware sin interactuar." }),
        body: localize({ en: "Grouped cards explain Home, monitoring, settings, feeding, purge, power, sleep, and factory reset states in a clear visual archive.", es: "Tarjetas agrupadas explican Inicio, monitoreo, configuracion, alimentacion, purga, energia, sueno y reinicio de fabrica en un archivo visual claro." }),
        bullets: localize([{ en: "Categorized screen catalog", es: "Catalogo categorizado" }, { en: "State summaries", es: "Resumenes de estados" }, { en: "LCD-style previews", es: "Vistas previas estilo LCD" }]),
        href: "pages/gallery.html"
      },
      {
        tag: localize({ en: "Simulator", es: "Simulador" }),
        title: localize({ en: "Drive the real screen order with virtual controls.", es: "Recorre el orden real de pantallas con controles virtuales." }),
        body: localize({ en: "Use B1, B2, B3, and the encoder to move through the settings loop, trigger monitor and power flows, and test LED logic from live inputs.", es: "Usa B1, B2, B3 y el encoder para recorrer el ciclo de configuracion, activar flujos de monitoreo y energia, y probar la logica LED con entradas en vivo." }),
        bullets: localize([{ en: "State machine model", es: "Modelo de maquina de estados" }, { en: "Live LED evaluation", es: "Evaluacion LED en vivo" }, { en: "Event log and hints", es: "Registro y pistas" }]),
        href: "pages/simulator.html"
      }
    ];

    featureIndex = featureIndex % features.length;
    spotlight.innerHTML = "";
    dots.innerHTML = "";

    function draw() {
      var feature = features[featureIndex];
      spotlight.innerHTML = "";
      spotlight.appendChild(createElement("p", "card-tag", feature.tag));
      spotlight.appendChild(createElement("h3", "", feature.title));
      spotlight.appendChild(createElement("p", "", feature.body));

      var list = createElement("ul", "pill-row");
      feature.bullets.forEach(function (bullet) {
        list.appendChild(createElement("li", "pill", bullet));
      });
      spotlight.appendChild(list);

      var link = createElement("a", "button button-primary", t("dynamic.openFeature"));
      link.href = feature.href;
      link.setAttribute("aria-label", feature.title);
      spotlight.appendChild(link);

      dots.querySelectorAll("button").forEach(function (button, index) {
        var isActive = index === featureIndex;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    }

    function showPreviousFeature() {
      featureIndex = (featureIndex - 1 + features.length) % features.length;
      draw();
    }

    function showNextFeature() {
      featureIndex = (featureIndex + 1) % features.length;
      draw();
    }

    features.forEach(function (_, index) {
      var button = createElement("button", "feature-dot", "");
      button.type = "button";
      button.setAttribute("aria-label", t("dynamic.goToFeature", { index: index + 1 }));
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", function () {
        featureIndex = index;
        draw();
      });
      dots.appendChild(button);
    });

    prev.onclick = showPreviousFeature;
    next.onclick = showNextFeature;

    if (!spotlight.dataset.boundSwipe) {
      var touchStartX = 0;
      var touchStartY = 0;

      spotlight.dataset.boundSwipe = "true";
      spotlight.addEventListener("touchstart", function (event) {
        if (!event.touches || !event.touches.length) {
          return;
        }
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      }, { passive: true });

      spotlight.addEventListener("touchend", function (event) {
        if (!event.changedTouches || !event.changedTouches.length) {
          return;
        }

        var deltaX = event.changedTouches[0].clientX - touchStartX;
        var deltaY = event.changedTouches[0].clientY - touchStartY;

        if (Math.abs(deltaX) < 40 || Math.abs(deltaX) <= Math.abs(deltaY)) {
          return;
        }

        if (deltaX < 0) {
          showNextFeature();
          return;
        }

        showPreviousFeature();
      }, { passive: true });
    }

    draw();
  }

  function renderSpecs() {
    var priorityTabs = document.getElementById("priority-tabs");
    var priorityDetail = document.getElementById("priority-detail");
    var priorityPrintAll = document.getElementById("priority-print-all");
    var selector = document.getElementById("component-selector");
    var detail = document.getElementById("component-detail");
    var constantsTable = document.getElementById("constants-table");
    var printButton = document.getElementById("print-specs");
    var componentPrintAll = document.getElementById("component-print-all");
    if (!priorityTabs || !priorityDetail || !selector || !detail || !constantsTable) {
      return;
    }

    if (printButton && !printButton.dataset.boundPrint) {
      printButton.dataset.boundPrint = "true";
      printButton.addEventListener("click", function () {
        window.print();
      });
    }

    selector.innerHTML = "";
    constantsTable.innerHTML = "";

    if (priorityPrintAll) {
      priorityPrintAll.innerHTML = "";
      ledRules.priority.forEach(function (rule, index) {
        var item = createElement("article", "priority-item");
        item.appendChild(createElement("div", "priority-rank", String(index + 1)));
        item.appendChild(createElement("span", "color-chip " + rule.cssClass, ""));
        var copy = createElement("div");
        copy.appendChild(createElement("strong", "", localize(rule.label)));
        copy.appendChild(createElement("p", "", localize(rule.condition) + ". " + localize(rule.detail)));
        item.appendChild(copy);
        priorityPrintAll.appendChild(item);
      });
    }

    function renderPriorityDetail(rule, index) {
      var total = ledRules.priority.length;
      priorityDetail.innerHTML = "";
      var header = createElement("div", "priority-detail-header");
      header.appendChild(createElement("div", "priority-rank", String(index + 1)));
      var titleRow = createElement("div", "priority-detail-title");
      titleRow.appendChild(createElement("span", "color-chip " + rule.cssClass, ""));
      titleRow.appendChild(createElement("h3", "", localize(rule.label)));
      header.appendChild(titleRow);
      priorityDetail.appendChild(header);
      priorityDetail.appendChild(
        createElement(
          "p",
          "card-tag",
          t("specsPage.priorityRank", { rank: String(index + 1), total: String(total) })
        )
      );
      priorityDetail.appendChild(createElement("p", "detail-section-label", t("specsPage.priorityWhen")));
      priorityDetail.appendChild(createElement("p", "priority-detail-body", localize(rule.condition)));
      priorityDetail.appendChild(createElement("p", "detail-section-label", t("specsPage.priorityMeaning")));
      priorityDetail.appendChild(createElement("p", "priority-detail-body", localize(rule.detail)));
    }

    function selectPriorityTab(index) {
      var max = ledRules.priority.length - 1;
      activePriorityTabIndex = Math.max(0, Math.min(index, max));
      priorityTabs.querySelectorAll('[role="tab"]').forEach(function (tab, i) {
        var selected = i === activePriorityTabIndex;
        tab.classList.toggle("is-active", selected);
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
      });
      var rule = ledRules.priority[activePriorityTabIndex];
      priorityDetail.setAttribute("aria-labelledby", "priority-tab-" + activePriorityTabIndex);
      renderPriorityDetail(rule, activePriorityTabIndex);
    }

    priorityTabs.innerHTML = "";
    ledRules.priority.forEach(function (rule, index) {
      var tab = createElement("button", "priority-tab");
      tab.type = "button";
      tab.role = "tab";
      tab.id = "priority-tab-" + index;
      tab.setAttribute("aria-selected", index === activePriorityTabIndex ? "true" : "false");
      tab.setAttribute("aria-controls", "priority-detail");
      tab.tabIndex = index === activePriorityTabIndex ? 0 : -1;
      var inner = createElement("span", "priority-tab-inner");
      inner.appendChild(createElement("span", "priority-tab-rank", String(index + 1)));
      inner.appendChild(createElement("span", "color-chip " + rule.cssClass, ""));
      inner.appendChild(createElement("span", "priority-tab-label", localize(rule.label)));
      tab.appendChild(inner);
      tab.addEventListener("click", function () {
        selectPriorityTab(index);
        tab.focus();
      });
      priorityTabs.appendChild(tab);
    });

    if (!priorityTabs.dataset.boundKeynav) {
      priorityTabs.dataset.boundKeynav = "true";
      priorityTabs.addEventListener("keydown", function (event) {
        var max = ledRules.priority.length - 1;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          selectPriorityTab(Math.min(activePriorityTabIndex + 1, max));
          var next = document.getElementById("priority-tab-" + activePriorityTabIndex);
          if (next) next.focus();
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          selectPriorityTab(Math.max(activePriorityTabIndex - 1, 0));
          var prev = document.getElementById("priority-tab-" + activePriorityTabIndex);
          if (prev) prev.focus();
        } else if (event.key === "Home") {
          event.preventDefault();
          selectPriorityTab(0);
          var first = document.getElementById("priority-tab-0");
          if (first) first.focus();
        } else if (event.key === "End") {
          event.preventDefault();
          selectPriorityTab(max);
          var last = document.getElementById("priority-tab-" + max);
          if (last) last.focus();
        }
      });
    }

    selectPriorityTab(activePriorityTabIndex);

    function renderComponentDetail(container, component) {
      container.innerHTML = "";
      container.appendChild(createElement("p", "card-tag", localize(component.name)));
      container.appendChild(createElement("h3", "", localize(component.name)));
      container.appendChild(createElement("p", "", localize(component.lead)));

      container.appendChild(
        createElement(
          "p",
          "detail-section-label",
          localize({ en: "Technical metadata", es: "Metadatos tecnicos" })
        )
      );
      var meta = createElement("div", "detail-meta");
      component.meta.forEach(function (item) {
        var card = createElement("div", "meta-card");
        card.appendChild(createElement("strong", "", localize(item.label)));
        card.appendChild(createElement("p", "", localize(item.value)));
        meta.appendChild(card);
      });
      container.appendChild(meta);

      container.appendChild(
        createElement(
          "p",
          "detail-section-label",
          localize({ en: "Behavior notes", es: "Notas de comportamiento" })
        )
      );
      var list = createElement("div", "detail-list");
      localize(component.bullets).forEach(function (bullet) {
        list.appendChild(createElement("div", "meta-card", bullet));
      });
      container.appendChild(list);
    }

    function showComponent(component) {
      renderComponentDetail(detail, component);
    }

    if (componentPrintAll) {
      componentPrintAll.innerHTML = "";
      specsData.components.forEach(function (component) {
        var block = createElement("article", "component-print-block print-panel");
        renderComponentDetail(block, component);
        componentPrintAll.appendChild(block);
      });
    }

    specsData.components.forEach(function (component, index) {
      var button = createElement("button", "selector-button", localize(component.name));
      button.type = "button";
      button.addEventListener("click", function () {
        activeComponentId = component.id;
        selector.querySelectorAll(".selector-button").forEach(function (node) {
          node.classList.remove("is-active");
        });
        button.classList.add("is-active");
        showComponent(component);
      });
      selector.appendChild(button);
      if ((activeComponentId && activeComponentId === component.id) || (!activeComponentId && index === 0)) {
        activeComponentId = component.id;
        button.classList.add("is-active");
        showComponent(component);
      }
    });

    var wrapper = createElement("div", "constant-table");
    specsData.constants.forEach(function (constant, index) {
      if (index % 2 === 0) {
        wrapper.appendChild(createElement("div", "constant-row"));
      }
      var row = wrapper.lastChild;
      var cell = createElement("div");
      cell.appendChild(createElement("strong", "", localize(constant.label)));
      cell.appendChild(createElement("p", "", localize(constant.value)));
      row.appendChild(cell);
    });
    constantsTable.appendChild(wrapper);
  }

  function renderGallery() {
    var jumpLinks = document.getElementById("gallery-jump-links");
    var sections = document.getElementById("gallery-sections");
    if (!sections || !jumpLinks) {
      return;
    }
    jumpLinks.innerHTML = "";
    sections.innerHTML = "";

    screensData.groups.forEach(function (group) {
      var jump = createElement("a", "pill", localize(group.title));
      jump.href = "#" + group.id;
      jumpLinks.appendChild(jump);

      var section = createElement("section", "gallery-group");
      section.id = group.id;
      var header = createElement("header");
      header.appendChild(createElement("p", "eyebrow", localize(group.title)));
      header.appendChild(createElement("h2", "", localize(group.title)));
      header.appendChild(createElement("p", "", localize(group.description)));
      section.appendChild(header);

      var grid = createElement("div", "gallery-grid");
      group.states.forEach(function (stateKey) {
        var screen = screensData.screens[stateKey];
        if (!screen) {
          return;
        }
        var card = createElement("article", "screen-card");
        card.appendChild(createElement("p", "card-tag", stateKey));
        card.appendChild(createElement("h3", "", localize(screen.title)));
        card.appendChild(createElement("p", "", localize(screen.summary)));
        card.appendChild(createElement("small", "", localize(screen.notes)));
        card.appendChild(createElement("pre", "", localize(screen.preview.main).join("\n")));
        card.appendChild(createElement("pre", "", localize(screen.preview.aux).join("\n")));

        var pills = createElement("div", "pill-row");
        localize(screen.hints).forEach(function (hint) {
          pills.appendChild(createElement("span", "hint-chip", hint));
        });
        card.appendChild(pills);
        grid.appendChild(card);
      });
      section.appendChild(grid);
      sections.appendChild(section);
    });
  }

  function renderPage() {
    var page = document.body ? document.body.getAttribute("data-page") : "";
    if (page === "home") renderHome();
    if (page === "specs") renderSpecs();
    if (page === "gallery") renderGallery();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderPage);
  } else {
    renderPage();
  }

  document.addEventListener("fishfeeder:languagechange", renderPage);
})();
