(function () {
  if (!document.body || document.body.getAttribute("data-page") !== "simulator") {
    return;
  }

  var screensData = window.FishFeederScreensData || { screens: {}, menuOrder: [] };
  var ledRules = window.FishFeederLedRules || { evaluateLed: function () { return { label: "Off" }; } };
  var i18n = window.FishFeederI18n;

  function localize(value, lang) {
    return i18n ? i18n.localize(value, lang) : value;
  }

  function text(en, es) {
    return localize({ en: en, es: es });
  }

  function translateLcdLine(line) {
    var activeLanguage = store.saved.language;
    if (activeLanguage !== 1 || !line) {
      return line;
    }

    var replacements = [
      ["DAY ", "DIA "],
      ["STATUS", "ESTADO"],
      ["LASTFD", "ULTALM"],
      ["FISH", "PECES"],
      ["WEIGHT", "PESO"],
      ["LEVEL", "NIVEL"],
      ["SET AMOUNT", "CANTIDAD"],
      ["SET CYCLE", "CICLO"],
      ["SET PURGE", "PURGA"],
      ["SET TIME", "HORA"],
      ["LANGUAGE", "IDIOMA"],
      ["TEMP UNIT", "UNIDAD TEMP"],
      ["POWER MENU", "MENU ENERGIA"],
      ["MONITOR MODE", "MODO MONITOR"],
      ["LIGHT SLEEP", "SUENO LIGERO"],
      ["SLEEP BLOCKED", "SUENO BLOQ."],
      ["FACTORY RESET", "REINICIO FAB."],
      ["CONFIRM RESET", "CONFIRMAR"],
      ["FEED RUNNING", "FEED ACTIVO"],
      ["PURGE ACTIVE", "PURGA ACTIVA"],
      ["Saved", "Guardado"],
      ["Draft", "Borrador"],
      ["English", "Ingles"],
      ["Spanish", "Espanol"],
      ["Field", "Campo"],
      ["Weight", "Peso"],
      ["Day", "Dia"],
      ["Target", "Meta"],
      ["Option", "Opcion"],
      ["Next", "Siguiente"],
      ["Remain", "Quedan"],
      ["minute", "minuto"],
      ["second", "segundo"],
      ["hour", "hora"],
      ["Screen off", "Pantalla apagada"],
      ["Light sleep", "Sueno ligero"],
      ["Manual feed", "Feed manual"],
      ["Auto feed", "Feed automatico"],
      ["LED blue", "LED azul"],
      ["B1 cancel", "B1 cancela"],
      ["B2 cancel", "B2 cancela"],
      ["B3 save", "B3 guarda"],
      ["ENC to adjust", "ENC ajusta"],
      ["ENC toggle", "ENC alterna"],
      ["ENC press field", "ENC cambia campo"],
      ["ENC press mode", "ENC cambia modo"],
      ["Mode by day", "Modo por dia"],
      ["Mode by gram", "Modo por gramos"],
      ["Preview state", "Estado previo"],
      ["Status preview", "Vista de estado"],
      ["Wake with B2", "Despierta con B2"],
      ["Screen-off soon", "Pantalla se apaga"],
      ["Cursor", "Cursor"],
      ["Preview active", "Vista activa"],
      ["Stay awake", "Mantener activo"],
      ["Needs confirm", "Necesita confirmar"],
      ["Reset all values", "Reinicia valores"],
      ["All settings clear", "Todo se borra"],
      ["Danger state", "Estado de riesgo"]
    ];

    var translated = line;
    replacements.forEach(function (pair) {
      translated = translated.replace(pair[0], pair[1]);
    });
    return translated;
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
    b1Hint: document.getElementById("b1-hint"),
    b2Hint: document.getElementById("b2-hint"),
    b3Hint: document.getElementById("b3-hint"),
    transitionHints: document.getElementById("transition-hints"),
    lcdMain: document.getElementById("lcd-main"),
    lcdAux: document.getElementById("lcd-aux"),
    lcdShell: document.getElementById("lcd-shell"),
    ledIndicator: document.getElementById("led-indicator"),
    ledLabel: document.getElementById("led-label"),
    eventLog: document.getElementById("event-log"),
    resetButton: document.getElementById("reset-simulator"),
    pressButtons: Array.from(document.querySelectorAll("[data-press-mode]")),
    controlButtons: Array.from(document.querySelectorAll("[data-control]")),
    ph: document.getElementById("sensor-ph"),
    temp: document.getElementById("sensor-temp"),
    distance: document.getElementById("sensor-distance"),
    time: document.getElementById("sensor-time")
  };

  function getInlineButtonHints() {
    if (store.currentState === "STATE_HOME") {
      return {
        b1: "Short: Set Amount | Long: No action",
        b2: "Short: Monitor | Long: Power menu",
        b3: "Short: Feed run | Long: Purge hold"
      };
    }
    if (store.currentState === "STATE_SET_PURGE") {
      return {
        b1: "Short: Next | Long: Start timed purge",
        b2: "Short: Previous setting",
        b3: "Short: Save purge values"
      };
    }
    if (store.currentState === "STATE_POWER_MENU") {
      return {
        b1: "Short: Return home",
        b2: "Short: Return home",
        b3: "Short: Confirm power option"
      };
    }
    return {
      b1: "Short: Next setting",
      b2: "Short: Previous setting",
      b3: "Short: Save or state action"
    };
  }

  function getStateNote(description) {
    var notesByState = {
      STATE_HOME: "Ready state. Use buttons to open settings, monitor, or runtime actions.",
      STATE_SET_AMOUNT: "Editing fish count. Rotate encoder to change value, then save with B3.",
      STATE_SET_CYCLE: "Editing growth cycle. Encoder changes value; press encoder to switch mode.",
      STATE_SET_PURGE: "Purge timer setup. Encoder edits minutes/seconds; B1 long starts purge.",
      STATE_POWER_MENU: "Power decision point. Choose screen-off or sleep and confirm with B3.",
      STATE_MONITOR_ENTRY: "Monitor preview active. It will transition automatically after countdown.",
      STATE_SLEEP_ENTRY: "Sleep preview active. Simulator will return after countdown.",
      STATE_FEED_RUNNING: "Runtime active. B1 short can cancel the current feeding cycle.",
      STATE_PURGE_RUNNING: "Timed purge active. B1 short cancels and returns to setup.",
      STATE_FACTORY_RESET_CONFIRM: "High-risk state. Use B1 long only when reset is intentional."
    };
    return notesByState[store.currentState] || (description.summary || "Interact with controls to update this state.");
  }

  function maxFishCount(enclosure) {
    return enclosure ? 2000 : 200;
  }

  function maxDayForGoal(goal) {
    return goal ? 226 : 194;
  }

  function maxGramsForGoal(goal) {
    return goal ? 688 : 454;
  }

  function estimateWeightByDay(day, goal) {
    var maxDay = maxDayForGoal(goal);
    var maxWeight = maxGramsForGoal(goal);
    if (day <= 0) {
      return 0;
    }
    var ratio = Math.min(day / maxDay, 1);
    return Math.round(Math.pow(ratio, 1.18) * maxWeight);
  }

  function closestDayForTargetGrams(target, goal) {
    var bestDay = 0;
    var bestDiff = Infinity;
    for (var day = 0; day <= maxDayForGoal(goal); day += 1) {
      var diff = Math.abs(estimateWeightByDay(day, goal) - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestDay = day;
      }
    }
    return bestDay;
  }

  function getFeedRate(dayCycle) {
    if (dayCycle <= 28) return 9.49;
    if (dayCycle <= 52) return 8.26;
    return 7.63;
  }

  function calculateFeedAmount(saved) {
    var fishWeight = estimateWeightByDay(saved.dayCycle, saved.harvestGoal);
    if (saved.dayCycle <= 0 || saved.fishCount <= 0) {
      return 0;
    }
    if (saved.dayCycle <= 28) {
      return saved.fishCount * (0.04 * fishWeight - 0.0004);
    }
    if (saved.dayCycle <= 52) {
      return saved.fishCount * (0.03 * fishWeight - 0.00003);
    }
    return saved.fishCount * (0.015 * fishWeight + 0.0005);
  }

  function calculateRuntimeMs(saved, grams) {
    return Math.max(1000, Math.round((grams / getFeedRate(saved.dayCycle)) * 1000 + 5000));
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
        autoFeedEnabled: true,
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
        targetGrams: estimateWeightByDay(34, 0),
        autoFeedEnabled: true,
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
      eventLog: [text("Simulator ready", "Simulador listo")]
    };
  }

  var store = createDefaultStore();

  function formatTime(date) {
    return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
  }

  function toInputTime(date) {
    return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
  }

  function logEvent(message) {
    var timestamp = formatTime(store.simulatedNow);
    store.eventLog.unshift(timestamp + " - " + localize(message));
    store.eventLog = store.eventLog.slice(0, 8);
  }

  function loadDraftForState(state) {
    if (state === "STATE_SET_AMOUNT") {
      store.draft.amount = store.saved.fishCount;
    }
    if (state === "STATE_SET_CYCLE") {
      store.draft.dayCycle = store.saved.dayCycle;
      store.draft.cycleMode = "day";
      store.draft.targetGrams = estimateWeightByDay(store.saved.dayCycle, store.saved.harvestGoal);
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
    return estimateWeightByDay(store.saved.dayCycle, store.saved.harvestGoal);
  }

  function getDisplayedTemperatureCelsius() {
    return store.sensors.temp;
  }

  function getDisplayedTemperature() {
    if (store.saved.tempUnit === 1) {
      return ((store.sensors.temp * 9) / 5 + 32).toFixed(1) + " F";
    }
    return store.sensors.temp.toFixed(1) + " C";
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
    return store.saved.autoFeedEnabled && secondsUntilNextFeed() <= 120;
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
      logEvent("Manual feed ignored because fish count or day cycle is zero");
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
    logEvent((isManual ? "Manual" : "Auto") + " feed runtime started");
    render();
  }

  function startTimedPurge() {
    var totalSeconds = Math.max(1, store.draft.purgeMinutes * 60 + store.draft.purgeSeconds);
    store.runtime.kind = "timedPurge";
    store.runtime.remainingMs = totalSeconds * 1000;
    store.runtime.returnState = "STATE_HOME";
    store.currentState = "STATE_PURGE_RUNNING";
    logEvent("Timed purge started for " + totalSeconds + " seconds");
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
    logEvent("Factory reset completed");
    render();
  }

  function saveCurrentScreen() {
    if (store.currentState === "STATE_SET_AMOUNT") {
      store.saved.fishCount = Math.min(maxFishCount(store.saved.enclosure), Math.max(0, store.draft.amount));
      logEvent("Saved fish count");
    }
    if (store.currentState === "STATE_SET_CYCLE") {
      if (store.draft.cycleMode === "day") {
        store.saved.dayCycle = Math.max(0, Math.min(maxDayForGoal(store.saved.harvestGoal), store.draft.dayCycle));
      } else {
        store.saved.dayCycle = closestDayForTargetGrams(store.draft.targetGrams, store.saved.harvestGoal);
      }
      logEvent("Saved growth cycle");
    }
    if (store.currentState === "STATE_SET_AUTO" || store.currentState === "STATE_SET_FEED_AM" || store.currentState === "STATE_SET_FEED_PM") {
      store.saved.autoFeedEnabled = store.draft.autoFeedEnabled;
      store.saved.feedAmHour = store.draft.feedAmHour;
      store.saved.feedAmMin = store.draft.feedAmMin;
      store.saved.feedPmHour = store.draft.feedPmHour;
      store.saved.feedPmMin = store.draft.feedPmMin;
      logEvent("Saved auto-feed settings");
    }
    if (store.currentState === "STATE_SET_ENCLOSURE") {
      store.saved.enclosure = store.draft.enclosure;
      store.saved.fishCount = Math.min(store.saved.fishCount, maxFishCount(store.saved.enclosure));
      logEvent("Saved enclosure");
    }
    if (store.currentState === "STATE_SET_HARVEST_GOAL") {
      store.saved.harvestGoal = store.draft.harvestGoal;
      store.saved.dayCycle = Math.min(store.saved.dayCycle, maxDayForGoal(store.saved.harvestGoal));
      logEvent("Saved harvest goal");
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
      logEvent("Saved RTC time");
    }
    if (store.currentState === "STATE_SET_LANGUAGE") {
      store.saved.language = store.draft.language;
      logEvent(text("Saved language", "Idioma guardado"));
    }
    if (store.currentState === "STATE_SET_TEMP_UNIT") {
      store.saved.tempUnit = store.draft.tempUnit;
      logEvent("Saved temperature unit");
    }
    render();
  }

  function pressButton(button, mode) {
    var state = store.currentState;

    if (button === "B1") {
      if (state === "STATE_SLEEP_BLOCKED") {
        setState("STATE_HOME");
        logEvent("Returned home from sleep blocked");
        return;
      }
      if (state === "STATE_FACTORY_RESET_CONFIRM") {
        if (mode === "long") {
          performFactoryReset();
        } else {
          setState("STATE_FACTORY_RESET");
          logEvent("Left reset confirm");
        }
        return;
      }
      if (mode === "short") {
        if (state === "STATE_PURGE_RUNNING") {
          store.runtime.kind = null;
          setState("STATE_SET_PURGE");
          logEvent("Timed purge canceled");
          return;
        }
        if (state === "STATE_FEED_RUNNING") {
          store.runtime.kind = null;
          setState(store.runtime.returnState || "STATE_HOME");
          logEvent("Feed runtime canceled");
          return;
        }
        moveNext();
        logEvent("B1 short moved to next state");
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
        logEvent("B2 returned home");
        return;
      }
      if (state === "STATE_FACTORY_RESET_CONFIRM") {
        setState("STATE_FACTORY_RESET");
        logEvent("Canceled reset confirmation");
        return;
      }
      if (mode === "short") {
        if (state === "STATE_PURGE_RUNNING" || state === "STATE_FEED_RUNNING") {
          logEvent("B2 has no short action in runtime");
          render();
          return;
        }
        if (state === "STATE_HOME") {
          store.previewCountdownMs = 15000;
          setState("STATE_MONITOR_ENTRY");
          logEvent("Entered monitor preview");
          return;
        }
        movePrevious();
        logEvent("B2 short moved to previous state");
        return;
      }
      if (mode === "long" && state === "STATE_HOME") {
        setState("STATE_POWER_MENU");
        logEvent("Opened power menu");
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
            store.previewCountdownMs = 15000;
            setState("STATE_MONITOR_ENTRY");
            logEvent("Power menu selected screen off");
          } else if (isSleepBlocked()) {
            setState("STATE_SLEEP_BLOCKED");
            logEvent("Light sleep blocked by upcoming feed");
          } else {
            store.previewCountdownMs = 15000;
            setState("STATE_SLEEP_ENTRY");
            logEvent("Entered sleep preview");
          }
          return;
        }
        if (state === "STATE_FACTORY_RESET") {
          setState("STATE_FACTORY_RESET_CONFIRM");
          logEvent("Entered reset confirmation");
          return;
        }
        if (state === "STATE_FACTORY_RESET_CONFIRM") {
          setState("STATE_FACTORY_RESET");
          logEvent("Toggled back to reset intro");
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
        logEvent(store.homePurgeActive ? "Manual purge hold simulated" : "Manual purge hold stopped");
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
        store.draft.purgeMinutes = clamp(store.draft.purgeMinutes + direction, 0, 10);
      } else {
        store.draft.purgeSeconds = clamp(store.draft.purgeSeconds + direction, 0, 59);
      }
      var totalSeconds = store.draft.purgeMinutes * 60 + store.draft.purgeSeconds;
      if (totalSeconds > 600) {
        totalSeconds = 600;
        store.draft.purgeMinutes = 10;
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
        store.draft.targetGrams = estimateWeightByDay(store.draft.dayCycle, store.saved.harvestGoal);
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

  function describeState() {
    var state = store.currentState;
    var screen = screensData.screens[state] || {};
    var weight = getCurrentWeight();
    var status = "Idle";
    if (store.homePurgeActive) {
      status = "Purging";
    }
    if (store.runtime.kind === "manualFeed" && state === "STATE_FEED_RUNNING") {
      status = "Manual";
    }
    if (store.runtime.kind === "autoFeed" && state === "STATE_FEED_RUNNING") {
      status = "Feeding";
    }

    var main = [];
    var aux = [];

    if (state === "STATE_HOME") {
      main = [
        "DAY " + String(store.saved.dayCycle).padStart(3, "0") + "  " + formatTime(store.simulatedNow),
        "STATUS  " + status.toUpperCase(),
        "LASTFD  " + store.saved.lastFeed,
        "FISH    " + store.saved.fishCount
      ];
      aux = [
        "WEIGHT  " + weight + " g",
        "pH      " + store.sensors.ph.toFixed(1),
        "TEMP    " + getDisplayedTemperature(),
        "LEVEL   " + store.sensors.distance.toFixed(1) + " cm"
      ];
    } else if (state === "STATE_SET_AMOUNT") {
      main = ["SET AMOUNT", "Saved " + store.saved.fishCount, "Draft " + store.draft.amount, "ENC to adjust"];
      aux = ["B3 save", "B1 next", "B2 previous", ""];
    } else if (state === "STATE_SET_CYCLE") {
      if (store.draft.cycleMode === "day") {
        main = [
          "SET CYCLE",
          "Mode by day",
          "Day " + String(store.draft.dayCycle).padStart(3, "0"),
          "Weight " + estimateWeightByDay(store.draft.dayCycle, store.saved.harvestGoal) + " g"
        ];
      } else {
        var matchedDay = closestDayForTargetGrams(store.draft.targetGrams, store.saved.harvestGoal);
        main = [
          "SET CYCLE",
          "Mode by gram",
          "Target " + store.draft.targetGrams + " g",
          "Match D" + matchedDay
        ];
      }
      aux = ["ENC press mode", "Saved D" + store.saved.dayCycle, "B3 save", ""];
    } else if (state === "STATE_SET_AUTO") {
      main = ["AUTO FEED", "Saved " + (store.saved.autoFeedEnabled ? "YES" : "NO"), "Draft " + (store.draft.autoFeedEnabled ? "YES" : "NO"), "ENC toggle"];
      aux = ["B3 save", "", "", ""];
    } else if (state === "STATE_SET_FEED_AM") {
      main = [
        "FEED AM",
        "Saved " + String(store.saved.feedAmHour).padStart(2, "0") + ":" + String(store.saved.feedAmMin).padStart(2, "0"),
        "Draft " + String(store.draft.feedAmHour).padStart(2, "0") + ":" + String(store.draft.feedAmMin).padStart(2, "0"),
        "Field " + (store.draft.feedField === 0 ? "hour" : "minute")
      ];
      aux = ["ENC press field", "B3 save", "", ""];
    } else if (state === "STATE_SET_FEED_PM") {
      main = [
        "FEED PM",
        "Saved " + String(store.saved.feedPmHour).padStart(2, "0") + ":" + String(store.saved.feedPmMin).padStart(2, "0"),
        "Draft " + String(store.draft.feedPmHour).padStart(2, "0") + ":" + String(store.draft.feedPmMin).padStart(2, "0"),
        "Field " + (store.draft.feedField === 0 ? "hour" : "minute")
      ];
      aux = ["ENC press field", "B3 save", "", ""];
    } else if (state === "STATE_SET_PURGE") {
      main = [
        "SET PURGE",
        "Total " + String(store.draft.purgeMinutes).padStart(2, "0") + ":" + String(store.draft.purgeSeconds).padStart(2, "0"),
        "Field " + (store.draft.purgeField === 0 ? "minute" : "second"),
        "B1 long to run"
      ];
      aux = ["ENC press field", "B2 previous", "", ""];
    } else if (state === "STATE_PURGE_RUNNING") {
      main = ["PURGE ACTIVE", "Remain " + Math.ceil(store.runtime.remainingMs / 1000) + " sec", "Motor reverse", "LED blue"];
      aux = ["B1 cancel", "Ends at home", "", ""];
    } else if (state === "STATE_FEED_RUNNING") {
      main = [
        "FEED RUNNING",
        store.runtime.kind === "manualFeed" ? "Manual feed" : "Auto feed",
        "Remain " + Math.ceil(store.runtime.remainingMs / 1000) + " sec",
        "LED blue"
      ];
      aux = ["Fish " + store.saved.fishCount, "Weight " + weight + " g", "Day " + store.saved.dayCycle, "B1 cancel"];
    } else if (state === "STATE_SET_ENCLOSURE") {
      main = ["ENCLOSURE", "Saved " + (store.saved.enclosure ? "pond" : "tank"), "Draft " + (store.draft.enclosure ? "pond" : "tank"), "Cap " + maxFishCount(store.draft.enclosure)];
      aux = ["ENC toggle", "B3 save", "", ""];
    } else if (state === "STATE_SET_HARVEST_GOAL") {
      main = ["HARVEST GOAL", "Saved " + (store.saved.harvestGoal ? "1.5 lb" : "1.0 lb"), "Draft " + (store.draft.harvestGoal ? "1.5 lb" : "1.0 lb"), "Max day " + maxDayForGoal(store.draft.harvestGoal)];
      aux = ["ENC toggle", "B3 save", "", ""];
    } else if (state === "STATE_SET_TIME") {
      main = [
        "SET TIME",
        String(store.draft.time.day).padStart(2, "0") + "/" + String(store.draft.time.month).padStart(2, "0") + "/" + store.draft.time.year,
        String(store.draft.time.hour).padStart(2, "0") + ":" + String(store.draft.time.minute).padStart(2, "0"),
        "Cursor " + ["day", "month", "year", "hour", "minute"][store.draft.time.cursor]
      ];
      aux = ["ENC press field", "B3 save", "", ""];
    } else if (state === "STATE_SET_LANGUAGE") {
      main = ["LANGUAGE", "Saved " + (store.saved.language ? "Spanish" : "English"), "Draft " + (store.draft.language ? "Spanish" : "English"), "ENC toggle"];
      aux = ["B3 save", "", "", ""];
    } else if (state === "STATE_SET_TEMP_UNIT") {
      main = ["TEMP UNIT", "Saved " + (store.saved.tempUnit ? "F" : "C"), "Draft " + (store.draft.tempUnit ? "F" : "C"), "ENC toggle"];
      aux = ["B3 save", "", "", ""];
    } else if (state === "STATE_POWER_MENU") {
      main = ["POWER MENU", "Option", store.powerOption === "screenOff" ? "Screen off" : "Light sleep", "B3 confirm"];
      aux = ["ENC switch", "B1 or B2 home", "", ""];
    } else if (state === "STATE_MONITOR_ENTRY") {
      main = ["MONITOR MODE", "Preview active", "Remain " + Math.ceil(store.previewCountdownMs / 1000) + " sec", "B2 cancel"];
      aux = ["Next screen off", "", "", ""];
    } else if (state === "STATE_SCREEN_OFF_MONITOR") {
      main = ["", "", "", ""];
      aux = ["", "", "", ""];
    } else if (state === "STATE_SLEEP_ENTRY") {
      var nextFeedSeconds = secondsUntilNextFeed();
      main = [
        "LIGHT SLEEP",
        "Auto " + (store.saved.autoFeedEnabled ? "YES" : "NO"),
        "Next " + (Number.isFinite(nextFeedSeconds) ? Math.ceil(nextFeedSeconds / 60) + " min" : "n/a"),
        "Remain " + Math.ceil(store.previewCountdownMs / 1000) + " sec"
      ];
      aux = ["B2 cancel", "", "", ""];
    } else if (state === "STATE_SLEEP_BLOCKED") {
      main = ["SLEEP BLOCKED", "Feed window close", "Stay awake", ""];
      aux = ["B1 or B2 home", "", "", ""];
    } else if (state === "STATE_FACTORY_RESET") {
      main = ["FACTORY RESET", "Reset all values", "Needs confirm", "B3 continue"];
      aux = ["B1 next loops", "", "", ""];
    } else if (state === "STATE_FACTORY_RESET_CONFIRM") {
      main = ["CONFIRM RESET", "All settings clear", "B1 long reset", "B2 or B3 back"];
      aux = ["Danger state", "", "", ""];
    } else {
      main = (screen.preview && screen.preview.main) || ["", "", "", ""];
      aux = (screen.preview && screen.preview.aux) || ["", "", "", ""];
    }

    return {
      title: localize(screen.title) || state,
      summary: localize(screen.summary) || "",
      hints: localize(screen.hints || []),
      notes: localize(screen.notes) || "",
      main: localize(main).map(translateLcdLine),
      aux: localize(aux).map(translateLcdLine)
    };
  }

  function renderTransitionHints() {
    var hints = [];
    if (store.currentState === "STATE_HOME") {
      hints = ["B1 short -> Set Amount", "B2 short -> Monitor Entry", "B2 long -> Power Menu", "B3 short -> Feed Running", "B3 long -> Home purge hold"];
    } else if (store.currentState === "STATE_SET_PURGE") {
      hints = ["B1 long -> Purge Running", "B2 short -> Set Feed PM", "B1 short -> Set Enclosure"];
    } else if (store.currentState === "STATE_POWER_MENU") {
      hints = ["B3 short -> Screen Off or Sleep path", "Encoder -> toggle option", "B1 or B2 -> Home"];
    } else if (store.currentState === "STATE_FACTORY_RESET_CONFIRM") {
      hints = ["B1 long -> Full reset", "B1 short -> Factory Reset", "B2 short -> Factory Reset"];
    } else if (store.currentState === "STATE_FEED_RUNNING") {
      hints = ["B1 short -> cancel runtime", "Auto return -> previous state"];
    } else if (store.currentState === "STATE_PURGE_RUNNING") {
      hints = ["B1 short -> Set Purge", "Auto return -> Home"];
    } else if (store.currentState === "STATE_SCREEN_OFF_MONITOR") {
      hints = ["B2 short -> Home"];
    } else if (store.currentState === "STATE_SLEEP_ENTRY") {
      hints = ["Countdown -> simulated sleep and return Home", "B2 short -> Home"];
    } else {
      hints = ["B1 short -> next settings page", "B2 short -> previous settings page", "B3 short -> save when allowed"];
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
    nodes.ledLabel.textContent = localize(led.label);
    nodes.lcdShell.classList.toggle("is-dark", store.currentState === "STATE_SCREEN_OFF_MONITOR");

    var inlineHints = getInlineButtonHints();
    if (nodes.b1Hint) nodes.b1Hint.textContent = inlineHints.b1;
    if (nodes.b2Hint) nodes.b2Hint.textContent = inlineHints.b2;
    if (nodes.b3Hint) nodes.b3Hint.textContent = inlineHints.b3;

    renderTransitionHints();

    nodes.eventLog.innerHTML = "";
    store.eventLog.forEach(function (entry) {
      var item = document.createElement("li");
      item.textContent = entry;
      nodes.eventLog.appendChild(item);
    });

    nodes.ph.value = store.sensors.ph.toFixed(1);
    nodes.temp.value = getDisplayedTemperatureCelsius().toFixed(1);
    nodes.distance.value = store.sensors.distance.toFixed(1);
    nodes.time.value = toInputTime(store.simulatedNow);
    nodes.pressButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-press-mode") === store.pressMode);
    });
  }

  function tick() {
    store.simulatedNow = new Date(store.simulatedNow.getTime() + 1000);

    if ((store.currentState === "STATE_MONITOR_ENTRY" || store.currentState === "STATE_SLEEP_ENTRY") && store.previewCountdownMs > 0) {
      store.previewCountdownMs -= 1000;
      if (store.previewCountdownMs <= 0) {
        if (store.currentState === "STATE_MONITOR_ENTRY") {
          store.currentState = "STATE_SCREEN_OFF_MONITOR";
          logEvent("Display entered screen-off monitor");
        } else if (store.currentState === "STATE_SLEEP_ENTRY") {
          store.currentState = "STATE_HOME";
          logEvent("Simulated light sleep completed");
        }
      }
    }

    if ((store.currentState === "STATE_FEED_RUNNING" || store.currentState === "STATE_PURGE_RUNNING") && store.runtime.kind) {
      store.runtime.remainingMs -= 1000;
      if (store.runtime.remainingMs <= 0) {
        if (store.currentState === "STATE_FEED_RUNNING") {
          store.saved.lastFeed = formatTime(store.simulatedNow);
          store.currentState = store.runtime.returnState || "STATE_HOME";
          logEvent("Feed runtime finished");
        } else {
          store.currentState = "STATE_HOME";
          logEvent("Timed purge finished");
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
      logEvent("Clock adjusted from simulator input");
      render();
    }
  });

  nodes.resetButton.addEventListener("click", function () {
    store = createDefaultStore();
    logEvent("Simulator reset");
    render();
  });

  document.addEventListener("fishfeeder:languagechange", function (event) {
    render();
  });

  render();
  window.setInterval(tick, 1000);
})();
