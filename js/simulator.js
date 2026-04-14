(function () {
  if (!document.body || document.body.getAttribute("data-page") !== "simulator") {
    return;
  }

  var screensData = window.FishFeederScreensData || { screens: {}, menuOrder: [] };
  var firmwareConfig = window.FishFeederFirmwareConfig;
  var virtualLcd = window.FishFeederVirtualLcd;
  var ledRules = window.FishFeederLedRules || { evaluateLed: function () { return { label: "Off" }; } };
  var i18n = window.FishFeederI18n;
  if (!firmwareConfig) {
    throw new Error("FishFeederFirmwareConfig is required before simulator.js");
  }
  if (!virtualLcd) {
    throw new Error("FishFeederVirtualLcd is required before simulator.js");
  }

  var V = virtualLcd.VirtualStr;

  function localize(value, lang) {
    return i18n ? i18n.localize(value, lang) : value;
  }

  function pair(en, es) {
    return { en: en, es: es };
  }

  function translateLcdLine(line) {
    return line;
  }

  var settingsStates = [
    "STATE_HOME",
    "STATE_SET_AMOUNT",
    "STATE_SET_CYCLE",
    "STATE_SET_AUTO",
    "STATE_SET_FEED_AM",
    "STATE_SET_FEED_PM",
    "STATE_SET_PURGE",
    "STATE_SET_ENCLOSURE",
    "STATE_SET_HARVEST_GOAL",
    "STATE_SET_TIME",
    "STATE_SET_LANGUAGE",
    "STATE_SET_TEMP_UNIT",
    "STATE_FACTORY_RESET"
  ];

  var nodes = {
    stateTitle: document.getElementById("state-title"),
    stateSummary: document.getElementById("state-summary"),
    buttonHints: {
      b1: document.getElementById("b1-hint-action"),
      b2: document.getElementById("b2-hint-action"),
      b3: document.getElementById("b3-hint-action")
    },
    transitionHints: document.getElementById("transition-hints"),
    lcdMain: document.getElementById("lcd-main"),
    lcdAux: document.getElementById("lcd-aux"),
    lcdShell: document.getElementById("lcd-shell"),
    ledIndicator: document.getElementById("led-indicator"),
    ledLabel: document.getElementById("led-label"),
    eventLog: document.getElementById("event-log"),
    resetButton: document.getElementById("reset-simulator"),
    pressButtons: Array.from(document.querySelectorAll("[data-press-mode]")),
    pressModeGroup: document.getElementById("press-mode-group"),
    controlButtons: Array.from(document.querySelectorAll("[data-control]")),
    ph: document.getElementById("sensor-ph"),
    temp: document.getElementById("sensor-temp"),
    distance: document.getElementById("sensor-distance"),
    time: document.getElementById("sensor-time")
  };

  function hintLongUnused() {
    return text("Not used", "Sin uso");
  }

  function getInlineButtonHints() {
    if (store.currentState === "STATE_HOME") {
      return {
        b1: {
          short: text("Set Amount", "Configurar Cantidad"),
          long: text("No action", "Sin accion")
        },
        b2: {
          short: text("Monitor", "Monitoreo"),
          long: text("Power menu", "Menu energia")
        },
        b3: {
          short: text("Feed run", "Alimentar"),
          long: text("Purge hold", "Purga sostenida")
        }
      };
    }
    if (store.currentState === "STATE_SET_PURGE") {
      return {
        b1: {
          short: text("Next", "Siguiente"),
          long: text("Start timed purge", "Iniciar purga")
        },
        b2: {
          short: text("Previous setting", "Ajuste anterior"),
          long: hintLongUnused()
        },
        b3: {
          short: text("Save purge values", "Guardar valores de purga"),
          long: hintLongUnused()
        }
      };
    }
    if (store.currentState === "STATE_POWER_MENU") {
      return {
        b1: {
          short: text("Return home", "Volver a inicio"),
          long: hintLongUnused()
        },
        b2: {
          short: text("Return home", "Volver a inicio"),
          long: hintLongUnused()
        },
        b3: {
          short: text("Confirm power option", "Confirmar opcion de energia"),
          long: hintLongUnused()
        }
      };
    }
    return {
      b1: {
        short: text("Next setting", "Siguiente ajuste"),
        long: hintLongUnused()
      },
      b2: {
        short: text("Previous setting", "Ajuste anterior"),
        long: hintLongUnused()
      },
      b3: {
        short: text("Save or state action", "Guardar o accion del estado"),
        long: hintLongUnused()
      }
    };
  }

  function getStateNote(description) {
    var notesByState = {
      STATE_HOME: text(
        "Ready state. Use buttons to open settings, monitor, or runtime actions.",
        "Estado listo. Usa los botones para abrir ajustes, monitoreo o acciones de ejecucion."
      ),
      STATE_SET_AMOUNT: text(
        "Editing fish count. Rotate encoder to change value, then save with B3.",
        "Editando cantidad de peces. Gira el encoder para cambiar, luego guarda con B3."
      ),
      STATE_SET_CYCLE: text(
        "Editing growth cycle. Encoder changes value; press encoder to switch mode.",
        "Editando ciclo de crecimiento. Encoder cambia valor; presiona encoder para cambiar modo."
      ),
      STATE_SET_PURGE: text(
        "Purge timer setup. Encoder edits minutes/seconds; B1 long starts purge.",
        "Configuracion de purga. Encoder edita minutos/segundos; B1 larga inicia purga."
      ),
      STATE_POWER_MENU: text(
        "Power decision point. Choose screen-off or sleep and confirm with B3.",
        "Punto de decision de energia. Elige pantalla apagada o sueno y confirma con B3."
      ),
      STATE_MONITOR_ENTRY: text(
        "Monitor preview active. It will transition automatically after countdown.",
        "Vista previa de monitoreo activa. Transiciona automaticamente tras la cuenta regresiva."
      ),
      STATE_SLEEP_ENTRY: text(
        "Sleep preview active. Simulator will return after countdown.",
        "Vista previa de sueno activa. El simulador volvera tras la cuenta regresiva."
      ),
      STATE_FEED_RUNNING: text(
        "Runtime active. B1 short can cancel the current feeding cycle.",
        "Ejecucion activa. B1 corta puede cancelar el ciclo actual de alimentacion."
      ),
      STATE_PURGE_RUNNING: text(
        "Timed purge active. B1 short cancels and returns to setup.",
        "Purga temporizada activa. B1 corta cancela y vuelve a configuracion."
      ),
      STATE_FACTORY_RESET_CONFIRM: text(
        "High-risk state. Use B1 long only when reset is intentional.",
        "Estado de alto riesgo. Usa B1 larga solo cuando el reinicio sea intencional."
      )
    };
    return (
      notesByState[store.currentState] ||
      description.summary ||
      text("Interact with controls to update this state.", "Interactua con los controles para actualizar este estado.")
    );
  }

  function maxFishCount(enclosure) {
    return firmwareConfig.maxFishCountForEnclosure(enclosure);
  }

  function maxDayForGoal(goal) {
    return firmwareConfig.maxDayForGoal(goal);
  }

  function maxGramsForGoal(goal) {
    return firmwareConfig.maxGramsForGoal(goal);
  }

  function estimateWeightByDay(day) {
    var weight = firmwareConfig.weightForDay(day);
    return weight < 0 ? 0 : weight;
  }

  function closestDayForTargetGrams(target, goal) {
    return firmwareConfig.closestDayForTargetGrams(target, goal);
  }

  function calculateFeedAmount(saved) {
    return firmwareConfig.calculateFeedAmount(saved.fishCount, saved.dayCycle);
  }

  function calculateRuntimeMs(saved, grams) {
    return firmwareConfig.calculateRuntimeMs(saved.dayCycle, grams);
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function createDefaultStore() {
    var now = new Date(2026, 3, 12, 8, 15, 0, 0);
    var languageId = 0;
    return {
      currentState: "STATE_HOME",
      pressMode: "short",
      simulatedNow: now,
      sensors: {
        ph: 7.3,
        temp: 24.4,
        distance: 14
      },
      saved: {
        fishCount: 120,
        dayCycle: 34,
        autoFeedEnabled: firmwareConfig.defaults.autoFeedEnabled,
        feedAmHour: 7,
        feedAmMin: 30,
        feedPmHour: 18,
        feedPmMin: 0,
        enclosure: 0,
        harvestGoal: 0,
        language: languageId,
        tempUnit: 0,
        purgeMinutes: 0,
        purgeSeconds: 30,
        lastFeed: "07:30"
      },
      draft: {
        amount: 120,
        dayCycle: 34,
        targetGrams: estimateWeightByDay(34),
        autoFeedEnabled: firmwareConfig.defaults.autoFeedEnabled,
        feedAmHour: 7,
        feedAmMin: 30,
        feedPmHour: 18,
        feedPmMin: 0,
        enclosure: 0,
        harvestGoal: 0,
        language: languageId,
        tempUnit: 0,
        purgeMinutes: 0,
        purgeSeconds: 30,
        purgeField: 0,
        feedField: 0,
        cycleMode: "day",
        time: {
          day: 12,
          month: 4,
          year: 2026,
          hour: 8,
          minute: 15,
          cursor: 0
        }
      },
      powerOption: "screenOff",
      runtime: {
        kind: null,
        remainingMs: 0,
        returnState: "STATE_HOME"
      },
      previewCountdownMs: 0,
      homePurgeActive: false,
      eventLog: [
        {
          time: String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0"),
          message: pair("Simulator ready", "Simulador listo")
        }
      ]
    };
  }

  var store = createDefaultStore();

  // Virtual device UI follows saved language (same as firmware gUiLanguage); not the site EN/ES toggle.
  function deviceUiLang() {
    return store.saved.language === 1 ? "es" : "en";
  }

  function text(en, es) {
    return localize({ en: en, es: es }, deviceUiLang());
  }

  function vl(id) {
    return virtualLcd.virtualTr(id, store.saved.language);
  }

  function formatTime(date) {
    return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
  }

  function toInputTime(date) {
    return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
  }

  function logEvent(message) {
    var timestamp = formatTime(store.simulatedNow);
    store.eventLog.unshift({ time: timestamp, message: message });
    store.eventLog = store.eventLog.slice(0, 8);
  }

  function loadDraftForState(state) {
    if (state === "STATE_SET_AMOUNT") {
      store.draft.amount = store.saved.fishCount;
    }
    if (state === "STATE_SET_CYCLE") {
      store.draft.dayCycle = store.saved.dayCycle;
      store.draft.cycleMode = "day";
      store.draft.targetGrams = estimateWeightByDay(store.saved.dayCycle);
    }
    if (state === "STATE_SET_AUTO" || state === "STATE_SET_FEED_AM" || state === "STATE_SET_FEED_PM") {
      store.draft.autoFeedEnabled = store.saved.autoFeedEnabled;
      store.draft.feedAmHour = store.saved.feedAmHour;
      store.draft.feedAmMin = store.saved.feedAmMin;
      store.draft.feedPmHour = store.saved.feedPmHour;
      store.draft.feedPmMin = store.saved.feedPmMin;
      store.draft.feedField = 0;
    }
    if (state === "STATE_SET_PURGE") {
      store.draft.purgeMinutes = store.saved.purgeMinutes;
      store.draft.purgeSeconds = store.saved.purgeSeconds;
      store.draft.purgeField = 0;
    }
    if (state === "STATE_SET_ENCLOSURE") {
      store.draft.enclosure = store.saved.enclosure;
    }
    if (state === "STATE_SET_HARVEST_GOAL") {
      store.draft.harvestGoal = store.saved.harvestGoal;
    }
    if (state === "STATE_SET_TIME") {
      store.draft.time = {
        day: store.simulatedNow.getDate(),
        month: store.simulatedNow.getMonth() + 1,
        year: store.simulatedNow.getFullYear(),
        hour: store.simulatedNow.getHours(),
        minute: store.simulatedNow.getMinutes(),
        cursor: 0
      };
    }
    if (state === "STATE_SET_LANGUAGE") {
      store.draft.language = store.saved.language;
    }
    if (state === "STATE_SET_TEMP_UNIT") {
      store.draft.tempUnit = store.saved.tempUnit;
    }
    if (state === "STATE_POWER_MENU") {
      store.powerOption = "screenOff";
    }
  }

  function setState(nextState) {
    if (store.currentState !== nextState) {
      if (nextState !== "STATE_HOME") {
        store.homePurgeActive = false;
      }
      loadDraftForState(nextState);
      store.currentState = nextState;
    }
    render();
  }

  function getCurrentWeight() {
    return estimateWeightByDay(store.saved.dayCycle);
  }

  function getDisplayedTemperatureCelsius() {
    return store.sensors.temp;
  }

  function getDisplayedTemperature() {
    var L = store.saved.language;
    if (store.saved.tempUnit === 1) {
      return ((store.sensors.temp * 9) / 5 + 32).toFixed(1) + virtualLcd.virtualTr(V.SuffixTempF, L);
    }
    return store.sensors.temp.toFixed(1) + virtualLcd.virtualTr(V.SuffixTempC, L);
  }

  function evaluateLedRule() {
    return ledRules.evaluateLed({
      motorActive: store.homePurgeActive || store.currentState === "STATE_FEED_RUNNING" || store.currentState === "STATE_PURGE_RUNNING",
      ph: store.sensors.ph,
      temp: store.sensors.temp,
      distance: store.sensors.distance
    });
  }

  function secondsUntilNextFeed() {
    if (!store.saved.autoFeedEnabled) {
      return Number.POSITIVE_INFINITY;
    }

    var current = clone({
      year: store.simulatedNow.getFullYear(),
      month: store.simulatedNow.getMonth(),
      date: store.simulatedNow.getDate()
    });

    function buildTime(hour, minute, dayOffset) {
      return new Date(current.year, current.month, current.date + dayOffset, hour, minute, 0, 0);
    }

    var now = store.simulatedNow;
    var amToday = buildTime(store.saved.feedAmHour, store.saved.feedAmMin, 0);
    var pmToday = buildTime(store.saved.feedPmHour, store.saved.feedPmMin, 0);
    var amNext = buildTime(store.saved.feedAmHour, store.saved.feedAmMin, 1);
    var pmNext = buildTime(store.saved.feedPmHour, store.saved.feedPmMin, 1);

    var candidates = [amToday, pmToday, amNext, pmNext].filter(function (candidate) {
      return candidate.getTime() > now.getTime();
    });

    if (!candidates.length) {
      return Number.POSITIVE_INFINITY;
    }

    candidates.sort(function (a, b) {
      return a.getTime() - b.getTime();
    });
    return Math.round((candidates[0].getTime() - now.getTime()) / 1000);
  }

  function isSleepBlocked() {
    return store.saved.autoFeedEnabled && secondsUntilNextFeed() <= firmwareConfig.runtime.preFeedWakeSec;
  }

  function moveNext() {
    if (store.currentState === "STATE_POWER_MENU") {
      setState("STATE_HOME");
      return;
    }
    var index = settingsStates.indexOf(store.currentState);
    if (index === -1) {
      return;
    }
    setState(settingsStates[(index + 1) % settingsStates.length]);
  }

  function movePrevious() {
    if (store.currentState === "STATE_POWER_MENU") {
      setState("STATE_HOME");
      return;
    }
    var index = settingsStates.indexOf(store.currentState);
    if (index <= 0) {
      setState("STATE_HOME");
      return;
    }
    setState(settingsStates[index - 1]);
  }

  function startFeedRuntime(isManual) {
    var grams = calculateFeedAmount(store.saved) / 2;
    if (grams <= 0) {
      logEvent(
        pair(
          "Manual feed ignored because fish count or day cycle is zero",
          "Alimentacion manual ignorada porque peces o dia de ciclo es cero"
        )
      );
      render();
      return;
    }
    store.runtime.kind = isManual ? "manualFeed" : "autoFeed";
    store.runtime.remainingMs = calculateRuntimeMs(store.saved, grams);
    store.runtime.returnState =
      store.currentState === "STATE_SLEEP_BLOCKED" || store.currentState === "STATE_SLEEP_ENTRY"
        ? "STATE_HOME"
        : store.currentState;
    store.currentState = "STATE_FEED_RUNNING";
    logEvent(
      isManual
        ? pair("Manual feed runtime started", "Alimentacion manual iniciada")
        : pair("Auto feed runtime started", "Alimentacion automatica iniciada")
    );
    render();
  }

  function startTimedPurge() {
    var totalSeconds = Math.max(1, store.draft.purgeMinutes * 60 + store.draft.purgeSeconds);
    store.runtime.kind = "timedPurge";
    store.runtime.remainingMs = totalSeconds * 1000;
    store.runtime.returnState = "STATE_HOME";
    store.currentState = "STATE_PURGE_RUNNING";
    logEvent(
      pair(
        "Timed purge started for " + totalSeconds + " seconds",
        "Purga temporizada iniciada por " + totalSeconds + " segundos"
      )
    );
    render();
  }

  function performFactoryReset() {
    var fresh = createDefaultStore();
    store.saved = fresh.saved;
    store.draft = fresh.draft;
    store.sensors = fresh.sensors;
    store.runtime = fresh.runtime;
    store.powerOption = fresh.powerOption;
    store.previewCountdownMs = 0;
    store.homePurgeActive = false;
    store.simulatedNow = fresh.simulatedNow;
    store.currentState = "STATE_HOME";
    logEvent(pair("Factory reset completed", "Reinicio de fabrica completado"));
    render();
  }

  function saveCurrentScreen() {
    if (store.currentState === "STATE_SET_AMOUNT") {
      store.saved.fishCount = Math.min(maxFishCount(store.saved.enclosure), Math.max(0, store.draft.amount));
      logEvent(pair("Saved fish count", "Cantidad de peces guardada"));
    }
    if (store.currentState === "STATE_SET_CYCLE") {
      if (store.draft.cycleMode === "day") {
        store.saved.dayCycle = Math.max(0, Math.min(maxDayForGoal(store.saved.harvestGoal), store.draft.dayCycle));
      } else {
        store.saved.dayCycle = closestDayForTargetGrams(store.draft.targetGrams, store.saved.harvestGoal);
      }
      logEvent(pair("Saved growth cycle", "Ciclo de crecimiento guardado"));
    }
    if (store.currentState === "STATE_SET_AUTO" || store.currentState === "STATE_SET_FEED_AM" || store.currentState === "STATE_SET_FEED_PM") {
      store.saved.autoFeedEnabled = store.draft.autoFeedEnabled;
      store.saved.feedAmHour = store.draft.feedAmHour;
      store.saved.feedAmMin = store.draft.feedAmMin;
      store.saved.feedPmHour = store.draft.feedPmHour;
      store.saved.feedPmMin = store.draft.feedPmMin;
      logEvent(pair("Saved auto-feed settings", "Configuracion de auto-feed guardada"));
    }
    if (store.currentState === "STATE_SET_ENCLOSURE") {
      store.saved.enclosure = store.draft.enclosure;
      store.saved.fishCount = Math.min(store.saved.fishCount, maxFishCount(store.saved.enclosure));
      logEvent(pair("Saved enclosure", "Recinto guardado"));
    }
    if (store.currentState === "STATE_SET_HARVEST_GOAL") {
      store.saved.harvestGoal = store.draft.harvestGoal;
      store.saved.dayCycle = Math.min(store.saved.dayCycle, maxDayForGoal(store.saved.harvestGoal));
      logEvent(pair("Saved harvest goal", "Meta de cosecha guardada"));
    }
    if (store.currentState === "STATE_SET_TIME") {
      store.simulatedNow = new Date(
        store.draft.time.year,
        store.draft.time.month - 1,
        store.draft.time.day,
        store.draft.time.hour,
        store.draft.time.minute,
        0,
        0
      );
      logEvent(pair("Saved RTC time", "Hora del RTC guardada"));
    }
    if (store.currentState === "STATE_SET_LANGUAGE") {
      store.saved.language = store.draft.language;
      logEvent(pair("Saved language", "Idioma guardado"));
    }
    if (store.currentState === "STATE_SET_TEMP_UNIT") {
      store.saved.tempUnit = store.draft.tempUnit;
      logEvent(pair("Saved temperature unit", "Unidad de temperatura guardada"));
    }
    render();
  }

  function pressButton(button, mode) {
    var state = store.currentState;

    if (button === "B1") {
      if (state === "STATE_SLEEP_BLOCKED") {
        setState("STATE_HOME");
        logEvent(pair("Returned home from sleep blocked", "Volvio a inicio desde sueno bloqueado"));
        return;
      }
      if (state === "STATE_FACTORY_RESET_CONFIRM") {
        if (mode === "long") {
          performFactoryReset();
        } else {
          setState("STATE_FACTORY_RESET");
          logEvent(pair("Left reset confirm", "Salio de confirmar reinicio"));
        }
        return;
      }
      if (mode === "short") {
        if (state === "STATE_PURGE_RUNNING") {
          store.runtime.kind = null;
          setState("STATE_SET_PURGE");
          logEvent(pair("Timed purge canceled", "Purga temporizada cancelada"));
          return;
        }
        if (state === "STATE_FEED_RUNNING") {
          store.runtime.kind = null;
          setState(store.runtime.returnState || "STATE_HOME");
          logEvent(pair("Feed runtime canceled", "Alimentacion cancelada"));
          return;
        }
        moveNext();
        logEvent(pair("B1 short moved to next state", "B1 corta cambio al siguiente estado"));
        return;
      }
      if (mode === "long" && state === "STATE_SET_PURGE") {
        startTimedPurge();
        return;
      }
    }

    if (button === "B2") {
      if (
        state === "STATE_SLEEP_BLOCKED" ||
        state === "STATE_SLEEP_ENTRY" ||
        state === "STATE_MONITOR_ENTRY" ||
        state === "STATE_SCREEN_OFF_MONITOR"
      ) {
        setState("STATE_HOME");
        logEvent(pair("B2 returned home", "B2 volvio a inicio"));
        return;
      }
      if (state === "STATE_FACTORY_RESET_CONFIRM") {
        setState("STATE_FACTORY_RESET");
        logEvent(pair("Canceled reset confirmation", "Confirmacion de reinicio cancelada"));
        return;
      }
      if (mode === "short") {
        if (state === "STATE_PURGE_RUNNING" || state === "STATE_FEED_RUNNING") {
          logEvent(pair("B2 has no short action in runtime", "B2 no tiene accion corta en ejecucion"));
          render();
          return;
        }
        if (state === "STATE_HOME") {
          store.previewCountdownMs = firmwareConfig.runtime.previewCountdownMs;
          setState("STATE_MONITOR_ENTRY");
          logEvent(pair("Entered monitor preview", "Entro a vista previa de monitoreo"));
          return;
        }
        movePrevious();
        logEvent(pair("B2 short moved to previous state", "B2 corta cambio al estado anterior"));
        return;
      }
      if (mode === "long" && state === "STATE_HOME") {
        setState("STATE_POWER_MENU");
        logEvent(pair("Opened power menu", "Abrio menu de energia"));
        return;
      }
    }

    if (button === "B3") {
      if (mode === "short") {
        if (state === "STATE_HOME") {
          startFeedRuntime(true);
          return;
        }
        if (state === "STATE_POWER_MENU") {
          if (store.powerOption === "screenOff") {
            store.previewCountdownMs = firmwareConfig.runtime.previewCountdownMs;
            setState("STATE_MONITOR_ENTRY");
            logEvent(pair("Power menu selected screen off", "Menu energia selecciono pantalla apagada"));
          } else if (isSleepBlocked()) {
            setState("STATE_SLEEP_BLOCKED");
            logEvent(pair("Light sleep blocked by upcoming feed", "Sueno ligero bloqueado por alimentacion proxima"));
          } else {
            store.previewCountdownMs = firmwareConfig.runtime.previewCountdownMs;
            setState("STATE_SLEEP_ENTRY");
            logEvent(pair("Entered sleep preview", "Entro a vista previa de sueno"));
          }
          return;
        }
        if (state === "STATE_FACTORY_RESET") {
          setState("STATE_FACTORY_RESET_CONFIRM");
          logEvent(pair("Entered reset confirmation", "Entro a confirmacion de reinicio"));
          return;
        }
        if (state === "STATE_FACTORY_RESET_CONFIRM") {
          setState("STATE_FACTORY_RESET");
          logEvent(pair("Toggled back to reset intro", "Volvio a introduccion de reinicio"));
          return;
        }
        if (
          state !== "STATE_PURGE_RUNNING" &&
          state !== "STATE_FEED_RUNNING" &&
          state !== "STATE_SET_PURGE" &&
          state !== "STATE_SLEEP_BLOCKED" &&
          state !== "STATE_MONITOR_ENTRY" &&
          state !== "STATE_SLEEP_ENTRY"
        ) {
          saveCurrentScreen();
          return;
        }
      }

      if (mode === "long" && state === "STATE_HOME") {
        store.homePurgeActive = !store.homePurgeActive;
        logEvent(
          store.homePurgeActive
            ? pair("Manual purge hold simulated", "Purga manual sostenida simulada")
            : pair("Manual purge hold stopped", "Purga manual sostenida detenida")
        );
        render();
      }
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function adjustEncoder(direction) {
    var state = store.currentState;
    var cursor;
    if (state === "STATE_SET_AMOUNT") {
      store.draft.amount = clamp(store.draft.amount + direction, 0, maxFishCount(store.saved.enclosure));
    } else if (state === "STATE_SET_CYCLE") {
      if (store.draft.cycleMode === "day") {
        store.draft.dayCycle = clamp(store.draft.dayCycle + direction, 0, maxDayForGoal(store.saved.harvestGoal));
      } else {
        store.draft.targetGrams = clamp(store.draft.targetGrams + direction, 0, maxGramsForGoal(store.saved.harvestGoal));
      }
    } else if (state === "STATE_SET_TIME") {
      cursor = store.draft.time.cursor;
      if (cursor === 0) store.draft.time.day = clamp(store.draft.time.day + direction, 1, 31);
      if (cursor === 1) store.draft.time.month = clamp(store.draft.time.month + direction, 1, 12);
      if (cursor === 2) store.draft.time.year = clamp(store.draft.time.year + direction, 2026, 2099);
      if (cursor === 3) store.draft.time.hour = (store.draft.time.hour + direction + 24) % 24;
      if (cursor === 4) store.draft.time.minute = (store.draft.time.minute + direction + 60) % 60;
    } else if (state === "STATE_SET_AUTO") {
      store.draft.autoFeedEnabled = !store.draft.autoFeedEnabled;
    } else if (state === "STATE_SET_LANGUAGE") {
      store.draft.language = store.draft.language ? 0 : 1;
    } else if (state === "STATE_SET_TEMP_UNIT") {
      store.draft.tempUnit = store.draft.tempUnit ? 0 : 1;
    } else if (state === "STATE_SET_ENCLOSURE") {
      store.draft.enclosure = store.draft.enclosure ? 0 : 1;
    } else if (state === "STATE_SET_HARVEST_GOAL") {
      store.draft.harvestGoal = store.draft.harvestGoal ? 0 : 1;
    } else if (state === "STATE_POWER_MENU") {
      store.powerOption = store.powerOption === "screenOff" ? "lightSleep" : "screenOff";
    } else if (state === "STATE_SET_FEED_AM") {
      if (store.draft.feedField === 0) {
        store.draft.feedAmHour = (store.draft.feedAmHour + direction + 24) % 24;
      } else {
        store.draft.feedAmMin = (store.draft.feedAmMin + direction + 60) % 60;
      }
    } else if (state === "STATE_SET_FEED_PM") {
      if (store.draft.feedField === 0) {
        store.draft.feedPmHour = (store.draft.feedPmHour + direction + 24) % 24;
      } else {
        store.draft.feedPmMin = (store.draft.feedPmMin + direction + 60) % 60;
      }
    } else if (state === "STATE_SET_PURGE") {
      if (store.draft.purgeField === 0) {
        store.draft.purgeMinutes = clamp(
          store.draft.purgeMinutes + direction,
          0,
          Math.floor(firmwareConfig.limits.purgeTotalSecMax / 60)
        );
      } else {
        store.draft.purgeSeconds = clamp(store.draft.purgeSeconds + direction, 0, 59);
      }
      var totalSeconds = store.draft.purgeMinutes * 60 + store.draft.purgeSeconds;
      if (totalSeconds > firmwareConfig.limits.purgeTotalSecMax) {
        totalSeconds = firmwareConfig.limits.purgeTotalSecMax;
        store.draft.purgeMinutes = Math.floor(firmwareConfig.limits.purgeTotalSecMax / 60);
        store.draft.purgeSeconds = 0;
      }
    }
    render();
  }

  function pressEncoder() {
    var state = store.currentState;
    if (state === "STATE_SET_PURGE") {
      store.draft.purgeField = store.draft.purgeField ? 0 : 1;
    } else if (state === "STATE_SET_CYCLE") {
      if (store.draft.cycleMode === "day") {
        store.draft.cycleMode = "weight";
        store.draft.targetGrams = estimateWeightByDay(store.draft.dayCycle);
      } else {
        store.draft.cycleMode = "day";
        store.draft.dayCycle = closestDayForTargetGrams(store.draft.targetGrams, store.saved.harvestGoal);
      }
    } else if (state === "STATE_SET_TIME") {
      store.draft.time.cursor = (store.draft.time.cursor + 1) % 5;
    } else if (state === "STATE_SET_FEED_AM" || state === "STATE_SET_FEED_PM") {
      store.draft.feedField = store.draft.feedField ? 0 : 1;
    }
    render();
  }

  function stateTitle(state) {
    return screensData.screens[state] ? screensData.screens[state].title : state;
  }

  function formatSleepEntryCountdown(secondsUntilNextFeed) {
    var totalMinutes = Math.ceil(secondsUntilNextFeed / 60);
    if (totalMinutes < 60) {
      return totalMinutes + "m";
    }
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;
    if (minutes === 0) {
      return hours + "h";
    }
    return hours + "h " + minutes + "m";
  }

  function secUp(ms) {
    return Math.max(1, Math.ceil(ms / 1000));
  }

  function describeState() {
    var state = store.currentState;
    var screen = screensData.screens[state] || {};
    var weight = getCurrentWeight();

    function padHomeLine(title, timeStr) {
      var total = 20;
      var gap = total - title.length - timeStr.length;
      if (gap < 0) {
        return (title + timeStr).slice(0, total);
      }
      return title + " ".repeat(gap) + timeStr;
    }

    var main = [];
    var aux = [];
    var rtcSectionIds = [V.SecDay, V.SecMonth, V.SecYear, V.SecHour, V.SecMinute];

    if (state === "STATE_HOME") {
      var statusId = V.StatusHalted;
      if (store.homePurgeActive) {
        statusId = V.StatusPurging;
      }
      var timeStr = formatTime(store.simulatedNow);
      main = [
        padHomeLine(vl(V.HomeTitle), timeStr),
        vl(V.LblDayCycle) + store.saved.dayCycle,
        vl(V.LblLastFeed) + store.saved.lastFeed,
        vl(V.LblState) + vl(statusId)
      ];
      aux = [
        vl(V.LblFish) + store.saved.fishCount,
        vl(V.LblWeight) + weight + "g",
        vl(V.LblPh) + store.sensors.ph.toFixed(1),
        vl(V.LblTemp) + getDisplayedTemperature()
      ];
    } else if (state === "STATE_SET_AMOUNT") {
      main = [
        vl(V.ConfigAmount),
        vl(V.LblCurrentAmount) + store.saved.fishCount,
        "",
        vl(V.PressB3Save)
      ];
      aux = [vl(V.LblChanging), ">>> " + store.draft.amount + " <<<", "", vl(V.TurnDial)];
    } else if (state === "STATE_SET_CYCLE") {
      if (store.draft.cycleMode === "day") {
        var tableWeight = estimateWeightByDay(store.draft.dayCycle);
        main = [vl(V.ConfigGrowth), vl(V.SavedDay) + store.saved.dayCycle, "", vl(V.PressB3Save)];
        aux = [
          vl(V.LblMode) + vl(V.ModeByDay),
          vl(V.LblNewDay) + store.draft.dayCycle,
          vl(V.LblTable) + tableWeight + "g",
          vl(V.SwModeDialEdit)
        ];
      } else {
        var matchedDay = closestDayForTargetGrams(store.draft.targetGrams, store.saved.harvestGoal);
        main = [vl(V.ConfigGrowth), vl(V.SavedDay) + store.saved.dayCycle, "", vl(V.PressB3Save)];
        aux = [
          vl(V.LblMode) + vl(V.ModeByGram),
          vl(V.LblTarget) + store.draft.targetGrams + "g",
          vl(V.LblMatch) + estimateWeightByDay(matchedDay) + "g d" + matchedDay,
          vl(V.SwModeDialEdit)
        ];
      }
    } else if (state === "STATE_SET_AUTO") {
      main = [
        vl(V.ConfigAutoFeed),
        vl(V.Saved) + virtualLcd.virtualYesNo(store.saved.autoFeedEnabled, store.saved.language),
        "",
        vl(V.PressB3Save)
      ];
      aux = [
        vl(V.SystemAuto),
        ">>> " + virtualLcd.virtualYesNo(store.draft.autoFeedEnabled, store.saved.language) + " <<<",
        "",
        vl(V.TurnDial)
      ];
    } else if (state === "STATE_SET_FEED_AM") {
      main = [
        vl(V.ConfigAmFeed),
        vl(V.SavedTimePrefix) +
          String(store.saved.feedAmHour).padStart(2, "0") +
          ":" +
          String(store.saved.feedAmMin).padStart(2, "0"),
        "",
        vl(V.PressB3Save)
      ];
      aux = [
        vl(V.NewTime),
        String(store.draft.feedAmHour).padStart(2, "0") + ":" + String(store.draft.feedAmMin).padStart(2, "0"),
        vl(store.draft.feedField === 0 ? V.SecHour : V.SecMinute),
        vl(V.SwHourMin)
      ];
    } else if (state === "STATE_SET_FEED_PM") {
      main = [
        vl(V.ConfigPmFeed),
        vl(V.SavedTimePrefix) +
          String(store.saved.feedPmHour).padStart(2, "0") +
          ":" +
          String(store.saved.feedPmMin).padStart(2, "0"),
        "",
        vl(V.PressB3Save)
      ];
      aux = [
        vl(V.NewTime),
        String(store.draft.feedPmHour).padStart(2, "0") + ":" + String(store.draft.feedPmMin).padStart(2, "0"),
        vl(store.draft.feedField === 0 ? V.SecHour : V.SecMinute),
        vl(V.SwHourMin)
      ];
    } else if (state === "STATE_SET_PURGE") {
      var purgeTotal = store.draft.purgeMinutes * 60 + store.draft.purgeSeconds;
      var purgeTop = vl(V.PurgeTotalLabel) + store.draft.purgeMinutes + "m" + store.draft.purgeSeconds + "s(" + purgeTotal + "s)";
      if (purgeTop.length > 20) purgeTop = vl(V.PurgeTotalLabel) + purgeTotal + "s";
      main = [purgeTop, vl(V.ConfigPurge), "", vl(V.PurgeHoldB1Run)];
      aux = [
        vl(V.PurgeLblMin) +
          (store.draft.purgeField === 0 ? ">>> " + store.draft.purgeMinutes + " <<<" : "    " + store.draft.purgeMinutes),
        vl(V.PurgeLblSec) +
          (store.draft.purgeField === 1 ? ">>> " + store.draft.purgeSeconds + " <<<" : "    " + store.draft.purgeSeconds),
        vl(V.PurgeSwMinSec),
        vl(V.TurnDial)
      ];
    } else if (state === "STATE_PURGE_RUNNING") {
      var leftSec = vl(V.PurgeLeftPrefix) + secUp(store.runtime.remainingMs) + "s";
      main = [vl(V.PurgeRunning), leftSec, "", vl(V.PurgePressB1Cancel)];
      aux = [leftSec, "", vl(V.PurgePressB1Cancel), ""];
    } else if (state === "STATE_FEED_RUNNING") {
      var feedLine3 =
        store.runtime.kind === "manualFeed" ? vl(V.StatusManual) : vl(V.StatusFeeding);
      var leftFeed = vl(V.PurgeLeftPrefix) + secUp(store.runtime.remainingMs) + "s";
      main = [vl(V.FeedRunningTitle), leftFeed, feedLine3, vl(V.PurgePressB1Cancel)];
      aux = [
        vl(V.LblFish) + store.saved.fishCount,
        vl(V.LblWeight) + weight + "g",
        vl(V.LblDayCycle) + store.saved.dayCycle,
        vl(V.PurgePressB1Cancel)
      ];
    } else if (state === "STATE_SET_ENCLOSURE") {
      main = [
        vl(V.ConfigEnclosure),
        vl(V.Saved) + virtualLcd.virtualEnclosureName(store.saved.enclosure, store.saved.language),
        vl(V.LblMaxFish) + maxFishCount(store.saved.enclosure),
        vl(V.PressB3Save)
      ];
      aux = [
        vl(V.LblEnclosure),
        ">>> " + virtualLcd.virtualEnclosureName(store.draft.enclosure, store.saved.language) + " <<<",
        vl(V.LblMaxFish) + maxFishCount(store.draft.enclosure),
        vl(V.TurnDial)
      ];
    } else if (state === "STATE_SET_HARVEST_GOAL") {
      main = [
        vl(V.ConfigHarvestGoal),
        vl(V.Saved) + virtualLcd.virtualHarvestGoalName(store.saved.harvestGoal, store.saved.language),
        vl(V.LblMaxGrowthDay) + maxDayForGoal(store.saved.harvestGoal),
        vl(V.PressB3Save)
      ];
      aux = [
        vl(V.LblHarvestGoal),
        ">>> " + virtualLcd.virtualHarvestGoalName(store.draft.harvestGoal, store.saved.language) + " <<<",
        vl(V.LblMaxGrowthDay) + maxDayForGoal(store.draft.harvestGoal),
        vl(V.TurnDial)
      ];
    } else if (state === "STATE_SET_TIME") {
      main = [
        vl(V.ConfigDateTime),
        vl(V.LblCurrent) +
          store.simulatedNow.getDate() +
          "/" +
          (store.simulatedNow.getMonth() + 1) +
          "/" +
          store.simulatedNow.getFullYear(),
        "         " +
          String(store.simulatedNow.getHours()).padStart(2, "0") +
          ":" +
          String(store.simulatedNow.getMinutes()).padStart(2, "0"),
        vl(V.PressB3Save)
      ];
      aux = [
        vl(V.LblChanging),
        store.draft.time.day + "/" + store.draft.time.month + "/" + store.draft.time.year,
        String(store.draft.time.hour).padStart(2, "0") + ":" + String(store.draft.time.minute).padStart(2, "0"),
        vl(rtcSectionIds[store.draft.time.cursor])
      ];
    } else if (state === "STATE_SET_LANGUAGE") {
      var sv = store.saved.language;
      var dv = store.draft.language;
      main = [
        virtualLcd.virtualTr(V.ConfigLanguage, sv),
        virtualLcd.virtualTr(V.Saved, sv) + virtualLcd.virtualLanguageName(sv, sv),
        "",
        virtualLcd.virtualTr(V.PressB3Save, sv)
      ];
      aux = [
        virtualLcd.virtualTr(V.LblLanguage, sv),
        ">>> " + virtualLcd.virtualLanguageName(dv, sv) + " <<<",
        "",
        virtualLcd.virtualTr(V.TurnDial, sv)
      ];
    } else if (state === "STATE_SET_TEMP_UNIT") {
      main = [
        vl(V.ConfigTempUnit),
        vl(V.Saved) + virtualLcd.virtualTempUnitName(store.saved.tempUnit, store.saved.language),
        "",
        vl(V.PressB3Save)
      ];
      aux = [
        vl(V.LblTempUnit),
        ">>> " + virtualLcd.virtualTempUnitName(store.draft.tempUnit, store.saved.language) + " <<<",
        "",
        vl(V.TurnDial)
      ];
    } else if (state === "STATE_POWER_MENU") {
      main = [
        vl(V.PowerMenuTitle),
        "",
        (store.powerOption === "screenOff" ? ">" : " ") + vl(V.PowerMenuScreenOff),
        (store.powerOption === "lightSleep" ? ">" : " ") + vl(V.PowerMenuLightSleep)
      ];
      aux = [vl(V.PowerMenuTurnDial), vl(V.PowerMenuSelect), vl(V.PowerMenuBack), ""];
    } else if (state === "STATE_MONITOR_ENTRY") {
      if (store.previewCountdownMs <= 1000) {
        main = ["", "", "", ""];
        aux = ["", "", "", vl(V.MonitorEntryB2TurnsOn)];
      } else {
        main = [
          vl(V.MonitorEntryTitle),
          vl(V.MonitorEntryPreparing),
          "",
          vl(V.MonitorEntryTurningOffIn) + secUp(store.previewCountdownMs) + "s"
        ];
        aux = ["", "", "", vl(V.MonitorEntryCancelWithB2)];
      }
    } else if (state === "STATE_SCREEN_OFF_MONITOR") {
      main = ["", "", "", ""];
      aux = ["", "", "", ""];
    } else if (state === "STATE_SLEEP_ENTRY") {
      var nextFeedSeconds = secondsUntilNextFeed();
      if (store.previewCountdownMs <= 1000) {
        main = ["", "", "", ""];
        aux = ["", "", "", vl(V.SleepEntryB2TurnsOn)];
      } else if (store.saved.autoFeedEnabled && Number.isFinite(nextFeedSeconds)) {
        main = [
          vl(V.SleepEntryTitle),
          vl(V.SleepEntryNextAuto),
          formatSleepEntryCountdown(nextFeedSeconds),
          vl(V.SleepEntryWakeEarly)
        ];
        aux = [
          "",
          "",
          vl(V.SleepEntrySleepingIn) + secUp(store.previewCountdownMs) + "s",
          vl(V.SleepEntryCancelWithB2)
        ];
      } else {
        main = [
          vl(V.SleepEntryTitle),
          vl(V.SleepEntryNoNextAuto),
          vl(V.SleepEntryStayAsleep),
          vl(V.SleepEntryWakeWithB2)
        ];
        aux = [
          "",
          "",
          vl(V.SleepEntrySleepingIn) + secUp(store.previewCountdownMs) + "s",
          vl(V.SleepEntryCancelWithB2)
        ];
      }
    } else if (state === "STATE_SLEEP_BLOCKED") {
      main = [
        vl(V.SleepBlockedTitle),
        vl(V.SleepBlockedNextFeed),
        vl(V.SleepBlockedAutoFeed),
        vl(V.SleepBlockedSetNo)
      ];
      aux = [vl(V.SleepBlockedAllowSleep), "", vl(V.SleepBlockedBack), ""];
    } else if (state === "STATE_FACTORY_RESET") {
      main = [
        vl(V.FactoryResetTitle),
        vl(V.FactoryResetInfoLine1),
        vl(V.FactoryResetInfoLine2),
        vl(V.FactoryResetContinue)
      ];
      aux = ["", "", vl(V.FactoryResetSkip), ""];
    } else if (state === "STATE_FACTORY_RESET_CONFIRM") {
      main = [
        vl(V.FactoryResetConfirmTitle),
        vl(V.FactoryResetConfirmLine1),
        vl(V.FactoryResetConfirmLine2),
        vl(V.FactoryResetConfirmHoldB1)
      ];
      aux = ["", "", vl(V.FactoryResetConfirmCancel), ""];
    } else {
      main = localize((screen.preview && screen.preview.main) || ["", "", "", ""], deviceUiLang());
      aux = localize((screen.preview && screen.preview.aux) || ["", "", "", ""], deviceUiLang());
    }

    return {
      title: localize(screen.title, deviceUiLang()) || state,
      summary: localize(screen.summary, deviceUiLang()) || "",
      hints: localize(screen.hints || [], deviceUiLang()),
      notes: localize(screen.notes, deviceUiLang()) || "",
      main: main.map(translateLcdLine),
      aux: aux.map(translateLcdLine)
    };
  }

  function renderTransitionHints() {
    var hints = [];
    if (store.currentState === "STATE_HOME") {
      hints = [
        text("B1 short -> Set Amount", "B1 corta -> Configurar Cantidad"),
        text("B2 short -> Monitor Entry", "B2 corta -> Entrada a Monitoreo"),
        text("B2 long -> Power Menu", "B2 larga -> Menu de Energia"),
        text("B3 short -> Feed Running", "B3 corta -> Alimentacion"),
        text("B3 long -> Home purge hold", "B3 larga -> Purga manual")
      ];
    } else if (store.currentState === "STATE_SET_PURGE") {
      hints = [
        text("B1 long -> Purge Running", "B1 larga -> Purga en Ejecucion"),
        text("B2 short -> Set Feed PM", "B2 corta -> Configurar Feed PM"),
        text("B1 short -> Set Enclosure", "B1 corta -> Configurar Recinto")
      ];
    } else if (store.currentState === "STATE_POWER_MENU") {
      hints = [
        text("B3 short -> Screen Off or Sleep path", "B3 corta -> Pantalla apagada o Sueno"),
        text("Encoder -> toggle option", "Encoder -> alternar opcion"),
        text("B1 or B2 -> Home", "B1 o B2 -> Inicio")
      ];
    } else if (store.currentState === "STATE_FACTORY_RESET_CONFIRM") {
      hints = [
        text("B1 long -> Full reset", "B1 larga -> Reinicio completo"),
        text("B1 short -> Factory Reset", "B1 corta -> Reinicio de Fabrica"),
        text("B2 short -> Factory Reset", "B2 corta -> Reinicio de Fabrica")
      ];
    } else if (store.currentState === "STATE_FEED_RUNNING") {
      hints = [
        text("B1 short -> cancel runtime", "B1 corta -> cancelar ejecucion"),
        text("Auto return -> previous state", "Retorno auto -> estado previo")
      ];
    } else if (store.currentState === "STATE_PURGE_RUNNING") {
      hints = [
        text("B1 short -> Set Purge", "B1 corta -> Configurar Purga"),
        text("Auto return -> Home", "Retorno auto -> Inicio")
      ];
    } else if (store.currentState === "STATE_SCREEN_OFF_MONITOR") {
      hints = [text("B2 short -> Home", "B2 corta -> Inicio")];
    } else if (store.currentState === "STATE_SLEEP_ENTRY") {
      hints = [
        text(
          "Countdown -> simulated sleep and return Home",
          "Cuenta regresiva -> sueno simulado y retorno a Inicio"
        ),
        text("B2 short -> Home", "B2 corta -> Inicio")
      ];
    } else {
      hints = [
        text("B1 short -> next settings page", "B1 corta -> siguiente pagina de ajustes"),
        text("B2 short -> previous settings page", "B2 corta -> pagina de ajustes anterior"),
        text("B3 short -> save when allowed", "B3 corta -> guardar cuando este permitido")
      ];
    }

    nodes.transitionHints.innerHTML = "";
    hints.forEach(function (hint) {
      var chip = document.createElement("div");
      chip.className = "hint-chip";
      chip.textContent = hint;
      nodes.transitionHints.appendChild(chip);
    });
  }

  function render() {
    var description = describeState();
    var led = evaluateLedRule();

    nodes.stateTitle.textContent = description.title;
    nodes.stateSummary.textContent = getStateNote(description);
    nodes.lcdMain.textContent = description.main.join("\n");
    nodes.lcdAux.textContent = description.aux.join("\n");
    nodes.ledIndicator.setAttribute("data-color", localize(led.label, "en"));
    nodes.ledLabel.textContent = localize(led.label, deviceUiLang());
    nodes.lcdShell.classList.toggle("is-dark", store.currentState === "STATE_SCREEN_OFF_MONITOR");

    var inlineHints = getInlineButtonHints();
    var modeKey = store.pressMode === "long" ? "long" : "short";
    ["b1", "b2", "b3"].forEach(function (key) {
      var hint = inlineHints[key];
      var slot = nodes.buttonHints[key];
      var action = hint[modeKey];
      if (slot) slot.textContent = action;
    });

    renderTransitionHints();

    nodes.eventLog.innerHTML = "";
    store.eventLog.forEach(function (entry) {
      var item = document.createElement("li");
      if (typeof entry === "string") {
        item.textContent = entry;
      } else {
        item.textContent = entry.time + " - " + localize(entry.message, deviceUiLang());
      }
      nodes.eventLog.appendChild(item);
    });

    nodes.ph.value = store.sensors.ph.toFixed(1);
    nodes.temp.value = getDisplayedTemperatureCelsius().toFixed(1);
    nodes.distance.value = store.sensors.distance.toFixed(1);
    nodes.time.value = toInputTime(store.simulatedNow);
    nodes.pressButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-press-mode") === store.pressMode);
    });
    if (nodes.pressModeGroup) {
      nodes.pressModeGroup.setAttribute("data-active-mode", store.pressMode === "long" ? "long" : "short");
    }
  }

  function tick() {
    store.simulatedNow = new Date(store.simulatedNow.getTime() + 1000);

    if ((store.currentState === "STATE_MONITOR_ENTRY" || store.currentState === "STATE_SLEEP_ENTRY") && store.previewCountdownMs > 0) {
      store.previewCountdownMs -= 1000;
      if (store.previewCountdownMs <= 0) {
        if (store.currentState === "STATE_MONITOR_ENTRY") {
          store.currentState = "STATE_SCREEN_OFF_MONITOR";
          logEvent(
            pair(
              "Display entered screen-off monitor",
              "Pantalla entro a monitor con pantalla apagada"
            )
          );
        } else if (store.currentState === "STATE_SLEEP_ENTRY") {
          store.currentState = "STATE_HOME";
          logEvent(pair("Simulated light sleep completed", "Sueno ligero simulado completado"));
        }
      }
    }

    if ((store.currentState === "STATE_FEED_RUNNING" || store.currentState === "STATE_PURGE_RUNNING") && store.runtime.kind) {
      store.runtime.remainingMs -= 1000;
      if (store.runtime.remainingMs <= 0) {
        if (store.currentState === "STATE_FEED_RUNNING") {
          store.saved.lastFeed = formatTime(store.simulatedNow);
          store.currentState = store.runtime.returnState || "STATE_HOME";
          logEvent(pair("Feed runtime finished", "Alimentacion finalizada"));
        } else {
          store.currentState = "STATE_HOME";
          logEvent(pair("Timed purge finished", "Purga temporizada finalizada"));
        }
        store.runtime.kind = null;
        store.runtime.remainingMs = 0;
      }
    }

    render();
  }

  nodes.pressButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      store.pressMode = button.getAttribute("data-press-mode");
      render();
    });
  });

  nodes.controlButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var control = button.getAttribute("data-control");
      if (control === "encoder-left") {
        adjustEncoder(-1);
        return;
      }
      if (control === "encoder-right") {
        adjustEncoder(1);
        return;
      }
      if (control === "encoder-press") {
        pressEncoder();
        return;
      }
      pressButton(control, store.pressMode);
    });
  });

  nodes.ph.addEventListener("input", function () {
    store.sensors.ph = parseFloat(nodes.ph.value) || 0;
    render();
  });

  nodes.temp.addEventListener("input", function () {
    store.sensors.temp = parseFloat(nodes.temp.value) || 0;
    render();
  });

  nodes.distance.addEventListener("input", function () {
    store.sensors.distance = parseFloat(nodes.distance.value) || 0;
    render();
  });

  nodes.time.addEventListener("input", function () {
    var parts = nodes.time.value.split(":");
    if (parts.length === 2) {
      store.simulatedNow.setHours(parseInt(parts[0], 10));
      store.simulatedNow.setMinutes(parseInt(parts[1], 10));
      store.simulatedNow.setSeconds(0);
      logEvent(pair("Clock adjusted from simulator input", "Reloj ajustado desde entrada del simulador"));
      render();
    }
  });

  nodes.resetButton.addEventListener("click", function () {
    store = createDefaultStore();
    logEvent(pair("Simulator reset", "Simulador reiniciado"));
    render();
  });

  document.addEventListener("fishfeeder:languagechange", function (event) {
    render();
  });

  render();
  window.setInterval(tick, 1000);
})();
