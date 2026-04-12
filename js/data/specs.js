(function () {
  function l(en, es) {
    return { en: en, es: es };
  }

  window.FishFeederSpecsData = {
    constants: [
      { label: l("Main LCD", "LCD principal"), value: l("20 x 4 at I2C 0x27", "20 x 4 en I2C 0x27") },
      { label: l("Aux LCD", "LCD auxiliar"), value: l("20 x 4 at I2C 0x25", "20 x 4 en I2C 0x25") },
      { label: "RTC", value: "I2C 0x68" },
      { label: "RGB LED", value: l("Common-cathode on GPIO 26 / 25 / 27", "Catodo comun en GPIO 26 / 25 / 27") },
      { label: l("pH safe range", "Rango seguro de pH"), value: "6.2 to 8.8" },
      { label: l("Temperature safe range", "Rango seguro de temperatura"), value: "20 C to 27 C" },
      { label: l("Food level threshold", "Umbral de nivel de alimento"), value: l("Distance greater than 20 cm", "Distancia mayor a 20 cm") },
      { label: l("Feed rates", "Velocidades de alimentacion"), value: l("9.49 g/s small, 8.26 g/s medium, 7.63 g/s large", "9.49 g/s pequena, 8.26 g/s mediana, 7.63 g/s grande") },
      { label: l("Purge max duration", "Duracion maxima de purga"), value: l("600 seconds total", "600 segundos totales") }
    ],
    components: [
      {
        id: "ph",
        name: "pH",
        lead: l("Analog pH reading shown on Home and used for red alert logic.", "Lectura analogica de pH mostrada en Inicio y usada para la alerta roja."),
        bullets: [
          l("Safe range is 6.2 to 8.8.", "El rango seguro es 6.2 a 8.8."),
          l("LED turns red when pH is below 6.2 or above 8.8.", "El LED cambia a rojo cuando el pH baja de 6.2 o supera 8.8."),
          l("Probe is on GPIO 34.", "La sonda esta en GPIO 34."),
          l("Firmware averages 10 samples and smooths with EMA.", "El firmware promedia 10 muestras y suaviza con EMA.")
        ],
        meta: [
          { label: "GPIO", value: "34" },
          { label: l("LED outcome", "Resultado LED"), value: l("Red when out of range", "Rojo fuera de rango") },
          { label: l("Calibration", "Calibracion"), value: "PH_REF 7.0, slope -5.8, EMA alpha 0.12" },
          { label: l("Special note", "Nota especial"), value: l("pH display holds during motor activity and settle time", "La lectura de pH se congela durante actividad del motor y tiempo de asentamiento") }
        ]
      },
      {
        id: "temperature",
        name: l("Temperature", "Temperatura"),
        lead: l("DS18B20 temperature reading shown on Home and used for white alert logic.", "Lectura de temperatura DS18B20 mostrada en Inicio y usada para la alerta blanca."),
        bullets: [
          l("Safe range is 20 C to 27 C.", "El rango seguro es 20 C a 27 C."),
          l("LED turns white when temperature is below 20 C or above 27 C.", "El LED cambia a blanco cuando la temperatura baja de 20 C o supera 27 C."),
          l("Sensor uses OneWire on GPIO 15.", "El sensor usa OneWire en GPIO 15."),
          l("The firmware treats the configured unit as display-only.", "El firmware trata la unidad configurada solo como visualizacion.")
        ],
        meta: [
          { label: "GPIO", value: "15" },
          { label: l("LED outcome", "Resultado LED"), value: l("White when out of range", "Blanco fuera de rango") },
          { label: l("Display units", "Unidades visibles"), value: l("Celsius or Fahrenheit", "Celsius o Fahrenheit") },
          { label: l("Implementation", "Implementacion"), value: l("Single DS18B20 probe", "Una sola sonda DS18B20") }
        ]
      },
      {
        id: "food-level",
        name: l("Food level / ultrasonic distance", "Nivel de alimento / distancia ultrasonica"),
        lead: l("Ultrasonic distance acts as the food level indicator and triggers the green low-food alert.", "La distancia ultrasonica actua como indicador del nivel de alimento y activa la alerta verde de alimento bajo."),
        bullets: [
          l("Food low means distance is greater than 20 cm.", "Alimento bajo significa distancia mayor a 20 cm."),
          l("The green LED only appears if higher-priority conditions are false.", "El LED verde solo aparece si no existen condiciones de prioridad superior."),
          l("Trigger is GPIO 5 and echo is GPIO 17.", "El trigger esta en GPIO 5 y el echo en GPIO 17."),
          l("Invalid or out-of-range readings may be treated as 999 in firmware.", "Las lecturas invalidas o fuera de rango pueden tratarse como 999 en el firmware.")
        ],
        meta: [
          { label: "GPIO", value: l("Trigger 5, Echo 17", "Trigger 5, Echo 17") },
          { label: l("LED outcome", "Resultado LED"), value: l("Green for low food", "Verde por alimento bajo") },
          { label: l("Threshold", "Umbral"), value: "FEED_THRESHOLD_CM = 20.0" },
          { label: l("Implementation", "Implementacion"), value: l("Average of three readings", "Promedio de tres lecturas") }
        ]
      },
      {
        id: "motor",
        name: l("Motor activity / feeding / purge", "Actividad del motor / alimentacion / purga"),
        lead: l("Motor activity has the top LED priority and drives the feed and purge runtime screens.", "La actividad del motor tiene la mayor prioridad LED y gobierna las pantallas de alimentacion y purga."),
        bullets: [
          l("Blue LED always wins while motor activity is active.", "El LED azul siempre gana mientras hay actividad del motor."),
          l("Manual feed uses half of the normal scheduled feed amount.", "La alimentacion manual usa la mitad de la dosis programada normal."),
          l("Feed runtime shows countdown and can be canceled with B1 short.", "La ejecucion de alimentacion muestra cuenta regresiva y puede cancelarse con B1 corta."),
          l("Timed purge duration is configured in minutes and seconds and started with B1 long on Set Purge.", "La duracion de purga temporizada se configura en minutos y segundos y se inicia con B1 larga en Set Purge.")
        ],
        meta: [
          { label: l("LED outcome", "Resultado LED"), value: l("Blue while active", "Azul mientras esta activo") },
          { label: l("Manual feed", "Alimentacion manual"), value: l("Half of scheduled dose", "Mitad de la dosis programada") },
          { label: l("Feed rates", "Velocidades"), value: l("Small 9.49, medium 8.26, large 7.63 g/s", "Pequena 9.49, mediana 8.26, grande 7.63 g/s") },
          { label: l("Purge cap", "Limite de purga"), value: l("Up to 10 minutes total", "Hasta 10 minutos en total") }
        ]
      },
      {
        id: "power",
        name: l("Sleep / monitor references", "Referencias de sueno / monitoreo"),
        lead: l("Power handling includes a screen-off monitor path and a guarded light-sleep path.", "El manejo de energia incluye una ruta de monitoreo con pantalla apagada y una ruta de sueno ligero protegida."),
        bullets: [
          l("B2 short from Home enters the monitor preview and then screen-off monitor state.", "B2 corta desde Inicio entra a la vista previa de monitoreo y luego al estado de pantalla apagada."),
          l("B2 long from Home opens the power menu.", "B2 larga desde Inicio abre el menu de energia."),
          l("The power menu branches to screen off or light sleep.", "El menu de energia se bifurca hacia pantalla apagada o sueno ligero."),
          l("Manual light sleep can be blocked when the next automatic feed is too close.", "El sueno ligero manual puede bloquearse cuando la siguiente alimentacion automatica esta demasiado cerca.")
        ],
        meta: [
          { label: l("Monitor preview", "Vista previa de monitoreo"), value: l("15 second countdown", "Cuenta regresiva de 15 segundos") },
          { label: l("Sleep preview", "Vista previa de sueno"), value: l("15 second countdown", "Cuenta regresiva de 15 segundos") },
          { label: l("Wake path", "Ruta de despertar"), value: l("B2 wakes screen-off monitor", "B2 despierta el monitor con pantalla apagada") },
          { label: l("Sleep guard", "Proteccion de sueno"), value: l("Pre-feed wake window is 120 seconds", "La ventana de despertar previa a la alimentacion es de 120 segundos") }
        ]
      }
    ]
  };
})();
