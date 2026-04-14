(function () {
  var firmwareConfig = window.FishFeederFirmwareConfig;
  if (!firmwareConfig) {
    throw new Error("FishFeederFirmwareConfig is required before screens.js");
  }

  function l(en, es) {
    return { en: en, es: es };
  }

  var defaultDay = 34;
  var defaultWeight = firmwareConfig.weightForDay(defaultDay);

  var menuOrder = [
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
    "STATE_FACTORY_RESET",
    "STATE_HOME"
  ];

  var screens = {
    STATE_HOME: {
      title: l("Home", "Inicio"),
      category: l("Home and monitoring", "Inicio y monitoreo"),
      summary: l("Dashboard showing day cycle, status, last feed, fish count, weight, pH, temperature, and current time.", "Panel que muestra dia de ciclo, estado, ultima alimentacion, cantidad de peces, peso, pH, temperatura y hora actual."),
      notes: l("B1 short enters settings. B2 short enters monitor path. B2 long opens power menu. B3 short starts manual feed. B3 long triggers purge behavior.", "B1 corta entra a configuracion. B2 corta entra a monitoreo. B2 larga abre energia. B3 corta inicia alimentacion manual. B3 larga activa purga."),
      hints: [l("B1 next settings", "B1 siguiente ajuste"), l("B2 monitor path", "B2 ruta de monitoreo"), l("B2 long power menu", "B2 larga menu energia"), l("B3 short manual feed", "B3 corta alimentacion manual"), l("B3 long purge", "B3 larga purga")],
      preview: {
        main: { en: ["HOME           08:15", "Day Cycle: 34", "Last Feed: 07:30", "State: Halted"], es: ["INICIO         08:15", "Ciclo dia: 34", "Ult. comida: 07:30", "Estado: Detenido"] },
        aux: { en: ["Fish: 120", "Weight: " + defaultWeight + "g", "pH: 7.3", "Temp: 24.4 C"], es: ["Peces: 120", "Peso: " + defaultWeight + "g", "pH: 7.3", "Temp: 24.4 C"] }
      }
    },
    STATE_MONITOR_ENTRY: {
      title: l("Monitor Entry", "Entrada a Monitoreo"),
      category: l("Home and monitoring", "Inicio y monitoreo"),
      summary: l("Short preview screen shown before the monitor mode turns the LCDs off.", "Pantalla corta de vista previa antes de que el modo monitoreo apague los LCD."),
      notes: l("Entered with B2 short from Home or by selecting Screen Off in the power menu.", "Se entra con B2 corta desde Inicio o al elegir Screen Off en el menu de energia."),
      hints: [l("B2 cancel to home", "B2 cancelar a inicio"), l("Countdown to screen-off", "Cuenta regresiva a pantalla apagada")],
      preview: {
        main: { en: ["MONITOR MODE", "Screen-off soon", "Preview state", "Remain 15 sec"], es: ["MODO MONITOR", "Pantalla se apaga", "Estado previo", "Quedan 15 s"] },
        aux: { en: ["Wake with B2", "Status preview", "", ""], es: ["Despierta con B2", "Vista de estado", "", ""] }
      }
    },
    STATE_SCREEN_OFF_MONITOR: {
      title: l("Screen Off Monitor", "Monitor con Pantalla Apagada"),
      category: l("Home and monitoring", "Inicio y monitoreo"),
      summary: l("LCD backlights are off while the system keeps monitoring in the background.", "Las luces del LCD estan apagadas mientras el sistema sigue monitoreando en segundo plano."),
      notes: l("B2 wakes the interface back to Home.", "B2 despierta la interfaz y vuelve a Inicio."),
      hints: [l("B2 wakes display", "B2 despierta la pantalla")],
      preview: {
        main: ["", "", "", ""],
        aux: ["", "", "", ""]
      }
    },
    STATE_SET_AMOUNT: {
      title: l("Set Amount", "Configurar Cantidad"),
      category: l("Settings flow", "Flujo de configuracion"),
      summary: l("Edit fish count with the encoder while comparing saved and draft values.", "Edita la cantidad de peces con el encoder comparando valor guardado y borrador."),
      notes: l("B1 short moves to Set Cycle. B2 short returns to Home. B3 short saves.", "B1 corta va a Set Cycle. B2 corta vuelve a Inicio. B3 corta guarda."),
      hints: [l("Encoder adjust fish count", "Encoder ajusta peces"), l("B3 save", "B3 guardar"), l("B1 next", "B1 siguiente"), l("B2 previous", "B2 anterior")],
      preview: {
        main: { en: ["CONFIG. AMOUNT", "Current Amount: 120", "", "Press B3 to Save"], es: ["CONFIG. CANTIDAD", "Cantidad act.: 120", "", "Pulsa B3 guardar"] },
        aux: { en: ["Changing:", ">>> 125 <<<", "", "Turn Dial"], es: ["Cambio:", ">>> 125 <<<", "", "Girar dial"] }
      }
    },
    STATE_SET_CYCLE: {
      title: l("Set Cycle", "Configurar Ciclo"),
      category: l("Settings flow", "Flujo de configuracion"),
      summary: l("Adjust growth by day or by target grams. Encoder press switches edit mode.", "Ajusta el crecimiento por dia o por gramos objetivo. Presionar encoder cambia el modo de edicion."),
      notes: l("This screen mirrors the firmware dual edit mode behavior.", "Esta pantalla refleja el comportamiento real de doble modo del firmware."),
      hints: [l("Encoder left/right edit", "Encoder izquierda/derecha"), l("Encoder press switch mode", "Encoder presion cambia modo"), l("B3 save", "B3 guardar")],
      preview: {
        main: { en: ["CONFIG. GROWTH", "Saved: Day 34", "", "Press B3 to Save"], es: ["CONFIG. CRECIM.", "Guard.: Dia 34", "", "Pulsa B3 guardar"] },
        aux: { en: ["Mode: By Day", "New Day: 34", "Table: " + defaultWeight + "g", "SW:Mode Dial:Edit"], es: ["Modo: Por dia", "Nuevo dia: 34", "Tabla: " + defaultWeight + "g", "SW:Modo Dial:Edit"] }
      }
    },
    STATE_SET_AUTO: {
      title: l("Set Auto", "Configurar Auto"),
      category: l("Settings flow", "Flujo de configuracion"),
      summary: l("Toggle automatic scheduled feeding on or off.", "Activa o desactiva la alimentacion automatica programada."),
      notes: l("Part of the auto-feed cluster before AM and PM feed times.", "Parte del grupo de auto-feed antes de horarios AM y PM."),
      hints: [l("Encoder toggles", "Encoder alterna"), l("B3 save", "B3 guardar"), l("B1 next", "B1 siguiente"), l("B2 previous", "B2 anterior")],
      preview: {
        main: { en: ["CONFIG. AUTO FEED", "Saved: YES", "", "Press B3 to Save"], es: ["CONFIG. AUTO ALIM", "Guardado: SI", "", "Pulsa B3 guardar"] },
        aux: { en: ["System automatic", ">>> YES <<<", "", "Turn Dial"], es: ["Sistema automatico", ">>> SI <<<", "", "Girar dial"] }
      }
    },
    STATE_SET_FEED_AM: {
      title: l("Set Feed AM", "Configurar Feed AM"),
      category: l("Settings flow", "Flujo de configuracion"),
      summary: l("Adjust the morning feed time. Encoder press switches hour and minute fields.", "Ajusta la hora de alimentacion AM. Presionar encoder cambia hora y minuto."),
      notes: l("AM and PM schedules are saved as a cluster.", "Los horarios AM y PM se guardan como un grupo."),
      hints: [l("Encoder adjust", "Encoder ajusta"), l("Encoder press hour/min", "Encoder presion hora/min"), l("B3 save", "B3 guardar")],
      preview: {
        main: { en: ["FEED AM", "Saved 07:30", "Draft 07:45", "Field hour"], es: ["FEED AM", "Guardado 07:30", "Borrador 07:45", "Campo hora"] },
        aux: { en: ["Press hour/min", "", "", ""], es: ["Pulsa hora/min", "", "", ""] }
      }
    },
    STATE_SET_FEED_PM: {
      title: l("Set Feed PM", "Configurar Feed PM"),
      category: l("Settings flow", "Flujo de configuracion"),
      summary: l("Adjust the afternoon feed time with the same field-switching pattern as AM.", "Ajusta la hora de alimentacion PM con el mismo patron de cambio de campo que AM."),
      notes: l("B1 short moves to Set Purge.", "B1 corta avanza a Set Purge."),
      hints: [l("Encoder adjust", "Encoder ajusta"), l("Encoder press hour/min", "Encoder presion hora/min"), l("B3 save", "B3 guardar")],
      preview: {
        main: { en: ["FEED PM", "Saved 18:00", "Draft 18:15", "Field minute"], es: ["FEED PM", "Guardado 18:00", "Borrador 18:15", "Campo minuto"] },
        aux: { en: ["Press hour/min", "", "", ""], es: ["Pulsa hora/min", "", "", ""] }
      }
    },
    STATE_SET_PURGE: {
      title: l("Set Purge", "Configurar Purga"),
      category: l("Settings flow", "Flujo de configuracion"),
      summary: l("Configure minutes and seconds for a timed purge run.", "Configura minutos y segundos para una purga temporizada."),
      notes: l("Encoder press switches the active field. B1 long starts the timed purge runtime.", "Presionar encoder cambia el campo activo. B1 larga inicia la purga temporizada."),
      hints: [l("Encoder adjust", "Encoder ajusta"), l("Encoder press min/sec", "Encoder presion min/seg"), l("B1 long start purge", "B1 larga inicia purga")],
      preview: {
        main: { en: ["SET PURGE", "Total 00:30", "Min 00  Sec 30", "Field seconds"], es: ["PURGA", "Total 00:30", "Min 00  Seg 30", "Campo segundos"] },
        aux: { en: ["B1 long run", "B3 save not used", "", ""], es: ["B1 larga inicia", "B3 no se usa", "", ""] }
      }
    },
    STATE_PURGE_RUNNING: {
      title: l("Purge Running", "Purga en Ejecucion"),
      category: l("Feeding and purge states", "Estados de alimentacion y purga"),
      summary: l("Timed purge runtime with a visible countdown and a cancel action on B1 short.", "Estado de purga temporizada con cuenta regresiva visible y cancelacion con B1 corta."),
      notes: l("If it finishes naturally, the firmware returns to Home.", "Si termina normalmente, el firmware vuelve a Inicio."),
      hints: [l("B1 cancel purge", "B1 cancela purga"), l("B2 no action", "B2 sin accion")],
      preview: {
        main: { en: ["PURGING", "Left 28s", "", "B1: Cancel"], es: ["PURGANDO", "Quedan 28s", "", "B1: Cancelar"] },
        aux: { en: ["Left 28s", "", "B1: Cancel", ""], es: ["Quedan 28s", "", "B1: Cancelar", ""] }
      }
    },
    STATE_FEED_RUNNING: {
      title: l("Feed Running", "Alimentacion en Ejecucion"),
      category: l("Feeding and purge states", "Estados de alimentacion y purga"),
      summary: l("Motor runtime state for manual or scheduled feed events.", "Estado de ejecucion del motor para alimentacion manual o programada."),
      notes: l("B1 short cancels feed runtime. When complete it returns to the saved previous screen.", "B1 corta cancela la alimentacion. Al terminar vuelve a la pantalla previa guardada."),
      hints: [l("B1 cancel feed", "B1 cancela feed"), l("B2 no action", "B2 sin accion")],
      preview: {
        main: { en: ["FEEDING", "Left 9s", "Manual Feed", "B1: Cancel"], es: ["ALIMENTANDO", "Quedan 9s", "Manual", "B1: Cancelar"] },
        aux: { en: ["Fish: 120", "Weight: " + defaultWeight + "g", "Day Cycle: 34", "B1: Cancel"], es: ["Peces: 120", "Peso: " + defaultWeight + "g", "Ciclo dia: 34", "B1: Cancelar"] }
      }
    },
    STATE_SET_ENCLOSURE: {
      title: l("Set Enclosure", "Configurar Recinto"),
      category: l("Settings flow", "Flujo de configuracion"),
      summary: l("Select tank or pond so fish capacity limits match the enclosure type.", "Selecciona tanque o estanque para que el limite de peces coincida con el recinto."),
      notes: l("Changing enclosure affects the maximum fish count allowed.", "Cambiar el recinto afecta la cantidad maxima de peces permitida."),
      hints: [l("Encoder toggles tank/pond", "Encoder alterna tanque/estanque"), l("B3 save", "B3 guardar")],
      preview: {
        main: { en: ["ENCLOSURE", "Saved tank", "Draft pond", "Cap 2000 fish"], es: ["RECINTO", "Guardado tanque", "Borrador estanque", "Cap 2000 peces"] },
        aux: { en: ["B3 save", "", "", ""], es: ["B3 guarda", "", "", ""] }
      }
    },
    STATE_SET_HARVEST_GOAL: {
      title: l("Set Harvest Goal", "Configurar Meta de Cosecha"),
      category: l("Settings flow", "Flujo de configuracion"),
      summary: l("Choose the harvest target, which changes the allowed growth cap.", "Elige la meta de cosecha, lo que cambia el limite permitido de crecimiento."),
      notes: l("The firmware uses 1 lb or 1.5 lb target modes.", "El firmware usa metas de 1 lb o 1.5 lb."),
      hints: [l("Encoder toggles goal", "Encoder alterna meta"), l("B3 save", "B3 guardar")],
      preview: {
        main: { en: ["HARVEST GOAL", "Saved 1.0 lb", "Draft 1.5 lb", "Max day 226"], es: ["META COSECHA", "Guardado 1.0 lb", "Borrador 1.5 lb", "Max dia 226"] },
        aux: { en: ["B3 save", "", "", ""], es: ["B3 guarda", "", "", ""] }
      }
    },
    STATE_SET_TIME: {
      title: l("Set Time", "Configurar Hora"),
      category: l("Settings flow", "Flujo de configuracion"),
      summary: l("Edit RTC day, month, year, hour, and minute. Encoder press moves the active field.", "Edita dia, mes, ano, hora y minuto del RTC. Presionar encoder mueve el campo activo."),
      notes: l("Saving time re-anchors the cycle start in firmware.", "Guardar la hora vuelve a anclar el inicio del ciclo en el firmware."),
      hints: [l("Encoder adjust field", "Encoder ajusta campo"), l("Encoder press next field", "Encoder presion siguiente campo"), l("B3 save", "B3 guardar")],
      preview: {
        main: { en: ["SET TIME", "14/04/2026", "08:15", "Cursor month"], es: ["HORA", "14/04/2026", "08:15", "Cursor mes"] },
        aux: { en: ["Press next field", "", "", ""], es: ["Pulsa siguiente", "", "", ""] }
      }
    },
    STATE_SET_LANGUAGE: {
      title: l("Set Language", "Configurar Idioma"),
      category: l("Settings flow", "Flujo de configuracion"),
      summary: l("Switch between English and Spanish UI language modes.", "Cambia entre modos de idioma Ingles y Espanol."),
      notes: l("The simulator language follows this saved setting.", "El idioma del simulador sigue esta configuracion guardada."),
      hints: [l("Encoder toggles language", "Encoder alterna idioma"), l("B3 save", "B3 guardar")],
      preview: {
        main: { en: ["LANGUAGE", "Saved English", "Draft Spanish", "ENC to toggle"], es: ["IDIOMA", "Guardado Ingles", "Borrador Espanol", "ENC alterna"] },
        aux: { en: ["B3 save", "", "", ""], es: ["B3 guarda", "", "", ""] }
      }
    },
    STATE_SET_TEMP_UNIT: {
      title: l("Set Temp Unit", "Configurar Unidad Temp"),
      category: l("Settings flow", "Flujo de configuracion"),
      summary: l("Change displayed temperature units between Celsius and Fahrenheit.", "Cambia las unidades visibles de temperatura entre Celsius y Fahrenheit."),
      notes: l("Display-only change in firmware.", "Cambio solo de visualizacion en el firmware."),
      hints: [l("Encoder toggles unit", "Encoder alterna unidad"), l("B3 save", "B3 guardar")],
      preview: {
        main: { en: ["TEMP UNIT", "Saved Celsius", "Draft Fahrenheit", "ENC to toggle"], es: ["UNIDAD TEMP", "Guardado Celsius", "Borrador Fahrenheit", "ENC alterna"] },
        aux: { en: ["B3 save", "", "", ""], es: ["B3 guarda", "", "", ""] }
      }
    },
    STATE_POWER_MENU: {
      title: l("Power Menu", "Menu de Energia"),
      category: l("Power and sleep states", "Estados de energia y sueno"),
      summary: l("Choose Screen Off or Light Sleep after a long B2 press from Home.", "Elige pantalla apagada o sueno ligero despues de una pulsacion larga de B2 desde Inicio."),
      notes: l("B3 short confirms the selected power behavior.", "B3 corta confirma el comportamiento de energia seleccionado."),
      hints: [l("Encoder toggles option", "Encoder alterna opcion"), l("B3 confirm option", "B3 confirma opcion")],
      preview: {
        main: { en: ["POWER", "", ">Monitor Mode", " Sleep Mode"], es: ["ENERGIA", "", ">Modo monitor", " Modo sueno"] },
        aux: { en: ["Turn Dial", "B3: Select", "B1/B2: Back", ""], es: ["Girar dial", "B3: Elegir", "B1/B2: Atras", ""] }
      }
    },
    STATE_SLEEP_ENTRY: {
      title: l("Sleep Entry", "Entrada a Sueno"),
      category: l("Power and sleep states", "Estados de energia y sueno"),
      summary: l("Short summary screen shown before manual light sleep begins.", "Pantalla corta de resumen antes de entrar en sueno ligero manual."),
      notes: l("The preview references auto-feed readiness and time until the next feed.", "La vista previa muestra el estado de auto-feed y el tiempo hasta la siguiente alimentacion."),
      hints: [l("B2 cancel to home", "B2 cancelar a inicio"), l("Countdown before sleep", "Cuenta regresiva antes de dormir")],
      preview: {
        main: { en: ["SLEEP MODE", "Next auto feed in", "2h 10m", "Wakes 2 min early"], es: ["MODO SUENO", "Prox alim auto en", "2h 10m", "Despierta 2 min ant"] },
        aux: { en: ["", "", "Sleeping in 15s", "Press B2 to cancel"], es: ["", "", "Durmiendo en 15s", "Pulsa B2 cancelar"] }
      }
    },
    STATE_SLEEP_BLOCKED: {
      title: l("Sleep Blocked", "Sueno Bloqueado"),
      category: l("Power and sleep states", "Estados de energia y sueno"),
      summary: l("Warning state shown when the next automatic feed is too close for manual sleep.", "Estado de advertencia cuando la siguiente alimentacion automatica esta demasiado cerca para dormir manualmente."),
      notes: l("B1 or B2 returns to Home depending on the firmware branch.", "B1 o B2 vuelven a Inicio segun la rama del firmware."),
      hints: [l("B1 return home", "B1 vuelve a inicio"), l("B2 return home", "B2 vuelve a inicio")],
      preview: {
        main: { en: ["SLEEP BLOCKED", "Next feed in <2min", "Auto Feed must be", "set to NO"], es: ["SUENO BLOQUEADO", "Prox comida <2min", "Auto alim. debe", "ponerse en NO"] },
        aux: { en: ["to allow sleep.", "", "B1/B2: Back", ""], es: ["para dormir.", "", "B1/B2: Atras", ""] }
      }
    },
    STATE_FACTORY_RESET: {
      title: l("Factory Reset", "Reinicio de Fabrica"),
      category: l("Factory reset states", "Estados de reinicio de fabrica"),
      summary: l("Intro screen before the destructive confirmation step.", "Pantalla inicial antes del paso destructivo de confirmacion."),
      notes: l("Reached at the end of the settings loop.", "Se alcanza al final del ciclo de configuracion."),
      hints: [l("B3 enter confirm", "B3 entra a confirmar"), l("B1 next loops home", "B1 siguiente vuelve a inicio")],
      preview: {
        main: { en: ["FACTORY RESET", "Delete all saved", "data and settings.", "B3: Continue"], es: ["RESET FABRICA", "Borra datos y", "config guardada.", "B3: Continuar"] },
        aux: { en: ["", "", "B1: Skip", ""], es: ["", "", "B1: Saltar", ""] }
      }
    },
    STATE_FACTORY_RESET_CONFIRM: {
      title: l("Factory Reset Confirm", "Confirmar Reinicio"),
      category: l("Factory reset states", "Estados de reinicio de fabrica"),
      summary: l("Final destructive confirmation state for a full reset.", "Estado final y destructivo de confirmacion para un reinicio completo."),
      notes: l("B1 long performs reset. Short B1 or B2 returns to the intro screen.", "B1 larga realiza el reinicio. B1 corta o B2 vuelven a la pantalla inicial."),
      hints: [l("B1 long reset", "B1 larga reinicia"), l("B1 short back", "B1 corta atras"), l("B2 back", "B2 atras"), l("B3 toggle back", "B3 vuelve atras")],
      preview: {
        main: { en: ["RESET CONFIRM", "This is permanent.", "All data will go.", "Hold B1 to reset"], es: ["CONFIRMAR RESET", "Esto es final.", "Todo se borrara.", "Mant. B1 reset"] },
        aux: { en: ["", "", "B2/B3: Cancel", ""], es: ["", "", "B2/B3: Cancelar", ""] }
      }
    }
  };

  var groups = [
    {
      id: "home-monitoring",
      title: l("Home and monitoring", "Inicio y monitoreo"),
      description: l("The everyday dashboard plus the monitor preview and screen-off path.", "El panel diario junto con la vista previa de monitoreo y la ruta de pantalla apagada."),
      states: ["STATE_HOME", "STATE_MONITOR_ENTRY", "STATE_SCREEN_OFF_MONITOR"]
    },
    {
      id: "settings-flow",
      title: l("Settings flow", "Flujo de configuracion"),
      description: l("The ordered configuration loop driven by B1 next and B2 previous.", "El ciclo ordenado de configuracion guiado por B1 siguiente y B2 anterior."),
      states: [
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
        "STATE_SET_TEMP_UNIT"
      ]
    },
    {
      id: "runtime",
      title: l("Feeding and purge states", "Estados de alimentacion y purga"),
      description: l("Motor-active runtime views with countdown behavior and cancel actions.", "Vistas de ejecucion con motor activo, cuenta regresiva y acciones de cancelacion."),
      states: ["STATE_FEED_RUNNING", "STATE_PURGE_RUNNING"]
    },
    {
      id: "power-sleep",
      title: l("Power and sleep states", "Estados de energia y sueno"),
      description: l("The alternate branch triggered from Home by a long B2 press.", "La rama alternativa activada desde Inicio con una pulsacion larga de B2."),
      states: ["STATE_POWER_MENU", "STATE_SLEEP_ENTRY", "STATE_SLEEP_BLOCKED"]
    },
    {
      id: "factory-reset",
      title: l("Factory reset states", "Estados de reinicio de fabrica"),
      description: l("The final settings branch with an explicit confirmation screen.", "La rama final de configuracion con una pantalla explicita de confirmacion."),
      states: ["STATE_FACTORY_RESET", "STATE_FACTORY_RESET_CONFIRM"]
    }
  ];

  window.FishFeederScreensData = {
    menuOrder: menuOrder,
    screens: screens,
    groups: groups
  };
})();
