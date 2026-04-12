(function () {
  var storageKey = "fish-feeder-demo-language";

  var dictionary = {
    nav: {
      brandTitle: { en: "Fish Feeder Demo", es: "Demo del Alimentador de Peces" },
      menu: { en: "Menu", es: "Menu" },
      overview: { en: "Overview", es: "Resumen" },
      specs: { en: "LED + Specs", es: "LED + Especificaciones" },
      gallery: { en: "Screens Gallery", es: "Galeria de Pantallas" },
      simulator: { en: "Simulator", es: "Simulador" },
      language: { en: "Language", es: "Idioma" }
    },
    home: {
      title: { en: "Fish Feeder Web Demo", es: "Demo Web del Alimentador de Peces" },
      description: {
        en: "Static public demo for the Fish Feeder firmware, including LED logic, screen gallery, and an interactive simulator.",
        es: "Demo publica y estatica del firmware Fish Feeder, con logica LED, galeria de pantallas y simulador interactivo."
      },
      eyebrow: { en: "Firmware-informed public showcase", es: "Vitrina publica guiada por el firmware" },
      heading: { en: "Explore the Fish Feeder without touching the hardware.", es: "Explora el alimentador sin tocar el hardware." },
      body: {
        en: "This static web demo mirrors the real firmware screen order, button behavior, LED alert priorities, and the main monitoring and configuration flows.",
        es: "Este demo web estatico refleja el orden real de pantallas del firmware, el comportamiento de botones, las prioridades LED y los flujos principales de monitoreo y configuracion."
      },
      launch: { en: "Launch simulator", es: "Abrir simulador" },
      browse: { en: "Browse all screens", es: "Ver todas las pantallas" },
      metricsStates: { en: "UI states represented", es: "Estados de UI representados" },
      metricsPages: { en: "Main pages", es: "Paginas principales" },
      metricsPriority: { en: "LED priority levels", es: "Niveles de prioridad LED" },
      guidedEyebrow: { en: "Guided exploration", es: "Exploracion guiada" },
      guidedHeading: { en: "Preview each destination before you open it.", es: "Previsualiza cada destino antes de abrirlo." },
      prevFeature: { en: "Previous feature", es: "Caracteristica anterior" },
      nextFeature: { en: "Next feature", es: "Caracteristica siguiente" },
      featureSelector: { en: "Feature selector", es: "Selector de caracteristicas" },
      pathsEyebrow: { en: "Fast paths", es: "Rutas rapidas" },
      pathsHeading: { en: "Everything the demo covers", es: "Todo lo que cubre el demo" },
      cardSpecsTag: { en: "LED + Specs", es: "LED + Especificaciones" },
      cardSpecsTitle: { en: "Thresholds, priorities, and printable technical notes", es: "Umbrales, prioridades y notas tecnicas imprimibles" },
      cardSpecsBody: {
        en: "See why the LED turns blue, red, white, green, or off, then inspect sensor and motor details in a print-friendly layout.",
        es: "Mira por que el LED cambia a azul, rojo, blanco, verde o apagado, y luego revisa detalles de sensores y motor en un formato listo para imprimir."
      },
      cardSpecsLink: { en: "Open specifications", es: "Abrir especificaciones" },
      cardGalleryTag: { en: "Gallery", es: "Galeria" },
      cardGalleryTitle: { en: "The story of the system flow", es: "La historia del flujo del sistema" },
      cardGalleryBody: {
        en: "Scroll through the main screens by purpose, from home monitoring to sleep, purge, and factory reset confirmation.",
        es: "Recorre las pantallas principales por proposito, desde el monitoreo inicial hasta el sueno, la purga y la confirmacion de reinicio de fabrica."
      },
      cardGalleryLink: { en: "Open screens gallery", es: "Abrir galeria de pantallas" },
      cardSimulatorTag: { en: "Simulator", es: "Simulador" },
      cardSimulatorTitle: { en: "Try the button and encoder logic", es: "Prueba la logica de botones y encoder" },
      cardSimulatorBody: {
        en: "Use B1, B2, B3, and the encoder controls to move across the actual menu order and preview runtime states.",
        es: "Usa B1, B2, B3 y los controles del encoder para recorrer el orden real del menu y ver estados de ejecucion."
      },
      cardSimulatorLink: { en: "Open simulator", es: "Abrir simulador" },
      preservedEyebrow: { en: "Preserved from firmware", es: "Preservado del firmware" },
      preservedHeading: { en: "What stays faithful in this web demo", es: "Que se mantiene fiel en este demo web" },
      preserved1: { en: "Screen order preserved", es: "Orden de pantallas preservado" },
      preserved2: { en: "B1 / B2 / B3 behavior preserved", es: "Comportamiento de B1 / B2 / B3 preservado" },
      preserved3: { en: "Encoder editing modeled", es: "Edicion con encoder modelada" },
      preserved4: { en: "LED priority preserved", es: "Prioridad LED preservada" },
      preserved5: { en: "Static-host friendly", es: "Listo para hosting estatico" },
      footerLead: { en: "Static Fish Feeder demo for preview", es: "Demo estatico de Fish Feeder para vista previa" },
      footerStack: { en: "Alejandro Arteaga", es: "Alejandro Arteaga" }
    },
    specsPage: {
      title: { en: "Fish Feeder LED and Specifications", es: "LED y Especificaciones de Fish Feeder" },
      description: { en: "Technical overview of Fish Feeder LED rules, thresholds, sensor details, and printable specifications.", es: "Resumen tecnico de reglas LED, umbrales, detalles de sensores y especificaciones imprimibles de Fish Feeder." },
      eyebrow: { en: "LED logic and technical details", es: "Logica LED y detalles tecnicos" },
      heading: { en: "One color at a time, with strict priority.", es: "Un color a la vez, con prioridad estricta." },
      body: { en: "This page explains every LED outcome, the exact thresholds behind it, and the component-level notes that drive the Fish Feeder status system.", es: "Esta pagina explica cada resultado del LED, los umbrales exactos y las notas por componente que gobiernan el sistema de estado del alimentador." },
      print: { en: "Print specifications", es: "Imprimir especificaciones" },
      testSimulator: { en: "Test rules in simulator", es: "Probar reglas en el simulador" },
      priorityEyebrow: { en: "Priority ladder", es: "Escalera de prioridad" },
      priorityHeading: { en: "LED decisions that must stay in this order", es: "Decisiones LED que deben mantenerse en este orden" },
      colorsEyebrow: { en: "Colors and triggers", es: "Colores y activadores" },
      colorsHeading: { en: "Exact LED meanings", es: "Significados exactos del LED" },
      componentsEyebrow: { en: "Component details", es: "Detalles de componentes" },
      componentsHeading: { en: "Select a subsystem to inspect its rules and specs", es: "Selecciona un subsistema para inspeccionar sus reglas y especificaciones" },
      componentSelector: { en: "Component selector", es: "Selector de componentes" },
      constantsEyebrow: { en: "Reference snapshot", es: "Referencia rapida" },
      constantsHeading: { en: "Quick constants", es: "Constantes rapidas" },
      footerLead: { en: "Static Fish Feeder demo for preview", es: "Demo estatico de Fish Feeder para vista previa" },
      footerStack: { en: "Alejandro Arteaga", es: "Alejandro Arteaga" }
    },
    galleryPage: {
      title: { en: "Fish Feeder Screens Gallery", es: "Galeria de Pantallas Fish Feeder" },
      description: { en: "Scrollable visual catalog of Fish Feeder screens grouped by monitoring, settings, runtime, power, and reset flows.", es: "Catalogo visual desplazable de pantallas Fish Feeder agrupadas por monitoreo, configuracion, ejecucion, energia y reinicio." },
      eyebrow: { en: "Scrollable system archive", es: "Archivo desplazable del sistema" },
      heading: { en: "Every major screen in one narrative flow.", es: "Cada pantalla principal en un solo recorrido narrativo." },
      body: { en: "This page groups the firmware screens by purpose so you can understand the monitoring, configuration, runtime, sleep, and reset experience without using the interactive simulator.", es: "Esta pagina agrupa las pantallas del firmware por proposito para entender la experiencia de monitoreo, configuracion, ejecucion, sueno y reinicio sin usar el simulador interactivo." },
      storyEyebrow: { en: "Screen story", es: "Historia de pantallas" },
      storyHeading: { en: "Visual catalog of states and transitions", es: "Catalogo visual de estados y transiciones" },
      footerLead: { en: "Static Fish Feeder demo for preview", es: "Demo estatico de Fish Feeder para vista previa" },
      footerStack: { en: "Alejandro Arteaga", es: "Alejandro Arteaga" }
    },
    simulatorPage: {
      title: { en: "Fish Feeder Simulator", es: "Simulador Fish Feeder" },
      description: { en: "Interactive Fish Feeder simulator with firmware-based state order, button logic, encoder edits, and LED rules.", es: "Simulador interactivo de Fish Feeder con orden de estados basado en firmware, logica de botones, ediciones con encoder y reglas LED." },
      eyebrow: { en: "Interactive screen flow", es: "Flujo interactivo de pantallas" },
      heading: { en: "Press buttons, rotate the encoder, and watch the state machine move.", es: "Presiona botones, gira el encoder y mira moverse la maquina de estados." },
      body: { en: "The simulator follows the firmware menu order, preserves the special home shortcuts, models editable fields, and computes LED output from live sensor inputs.", es: "El simulador sigue el orden de menus del firmware, preserva los accesos especiales de inicio, modela campos editables y calcula la salida LED desde entradas de sensores en vivo." },
      reset: { en: "Reset simulator", es: "Reiniciar simulador" },
      compare: { en: "Compare with gallery", es: "Comparar con la galeria" },
      currentState: { en: "Current state", es: "Estado actual" },
      led: { en: "LED", es: "LED" },
      mainLcd: { en: "Main LCD", es: "LCD principal" },
      auxLcd: { en: "Aux LCD", es: "LCD auxiliar" },
      pressMode: { en: "Button press mode", es: "Modo de pulsacion" },
      short: { en: "Short", es: "Corta" },
      long: { en: "Long", es: "Larga" },
      buttons: { en: "Buttons", es: "Botones" },
      encoder: { en: "Encoder", es: "Encoder" },
      left: { en: "Left", es: "Izquierda" },
      press: { en: "Press", es: "Presionar" },
      right: { en: "Right", es: "Derecha" },
      stateNotes: { en: "State notes", es: "Notas del estado" },
      transitionHints: { en: "Transition hints", es: "Pistas de transicion" },
      liveInputs: { en: "Live inputs", es: "Entradas en vivo" },
      temperature: { en: "Temperature (C)", es: "Temperatura (C)" },
      distance: { en: "Distance cm", es: "Distancia cm" },
      clock: { en: "Clock", es: "Reloj" },
      eventLog: { en: "Event log", es: "Registro de eventos" },
      footerLead: { en: "Static Fish Feeder demo for preview", es: "Demo estatico de Fish Feeder para vista previa" },
      footerStack: { en: "Alejandro Arteaga", es: "Alejandro Arteaga" }
    },
    dynamic: {
      openFeature: { en: "Open feature", es: "Abrir seccion" },
      goToFeature: { en: "Go to feature {index}", es: "Ir a la seccion {index}" }
    }
  };

  function getFromPath(path) {
    return path.split(".").reduce(function (acc, part) {
      return acc && typeof acc === "object" ? acc[part] : undefined;
    }, dictionary);
  }

  function interpolate(text, vars) {
    if (!vars) {
      return text;
    }
    return String(text).replace(/\{(\w+)\}/g, function (_, key) {
      return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : "";
    });
  }

  function normalizeLanguage(value) {
    return value === "es" ? "es" : "en";
  }

  function getLanguage() {
    try {
      return normalizeLanguage(localStorage.getItem(storageKey) || "en");
    } catch (error) {
      return "en";
    }
  }

  function localize(value, lang) {
    var activeLang = normalizeLanguage(lang || getLanguage());
    if (value == null) {
      return "";
    }
    if (typeof value === "string") {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(function (item) {
        return localize(item, activeLang);
      });
    }
    if (typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "en")) {
      return value[activeLang] || value.en || "";
    }
    return value;
  }

  function t(key, vars, lang) {
    var entry = getFromPath(key);
    return interpolate(localize(entry, lang), vars);
  }

  function applyTranslations(root) {
    var lang = getLanguage();
    var scope = root || document;
    document.documentElement.lang = lang;

    scope.querySelectorAll("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"), null, lang);
    });

    scope.querySelectorAll("[data-i18n-placeholder]").forEach(function (node) {
      node.setAttribute("placeholder", t(node.getAttribute("data-i18n-placeholder"), null, lang));
    });

    scope.querySelectorAll("[data-i18n-aria-label]").forEach(function (node) {
      node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria-label"), null, lang));
    });

    scope.querySelectorAll("[data-i18n-title]").forEach(function (node) {
      node.title = t(node.getAttribute("data-i18n-title"), null, lang);
    });

    var titleNode = document.querySelector("[data-i18n-document-title]");
    if (titleNode) {
      document.title = t(titleNode.getAttribute("data-i18n-document-title"), null, lang);
    }

    var descriptionNode = document.querySelector('meta[name="description"][data-i18n-document-description]');
    if (descriptionNode) {
      descriptionNode.setAttribute("content", t(descriptionNode.getAttribute("data-i18n-document-description"), null, lang));
    }

    document.querySelectorAll("[data-lang-choice]").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-lang-choice") === lang);
    });
  }

  function setLanguage(lang, persist) {
    var next = normalizeLanguage(lang);
    if (persist !== false) {
      try {
        localStorage.setItem(storageKey, next);
      } catch (error) {
        // Ignore storage failures.
      }
    }
    applyTranslations(document);
    document.dispatchEvent(new CustomEvent("fishfeeder:languagechange", { detail: { language: next } }));
  }

  window.FishFeederI18n = {
    t: t,
    localize: localize,
    getLanguage: getLanguage,
    setLanguage: setLanguage,
    applyTranslations: applyTranslations
  };
})();
