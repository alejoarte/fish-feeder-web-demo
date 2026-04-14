(function () {
  var firmwareConfig = window.FishFeederFirmwareConfig;
  if (!firmwareConfig) {
    throw new Error("FishFeederFirmwareConfig is required before led-rules.js");
  }

  function l(en, es) {
    return { en: en, es: es };
  }

  var rules = [
    {
      id: "blue",
      label: l("Blue", "Azul"),
      cssClass: "is-blue",
      condition: l("Motor active: feeding, manual feed, or purge", "Motor activo: alimentacion, alimentacion manual o purga"),
      detail: l("Top priority. If the motor is active, no other LED color can appear.", "Prioridad mas alta. Si el motor esta activo, ningun otro color puede aparecer."),
      evaluate: function (context) {
        return Boolean(context.motorActive);
      }
    },
    {
      id: "red",
      label: l("Red", "Rojo"),
      cssClass: "is-red",
      condition: l("pH below 6.2 or above 8.8", "pH por debajo de 6.2 o por encima de 8.8"),
      detail: l("Safe pH range is 6.2 to 8.8.", "El rango seguro de pH es 6.2 a 8.8."),
      evaluate: function (context) {
        return context.ph < firmwareConfig.sensors.phLowLimit || context.ph > firmwareConfig.sensors.phHighLimit;
      }
    },
    {
      id: "white",
      label: l("White", "Blanco"),
      cssClass: "is-white",
      condition: l("Temperature below 20 C or above 27 C", "Temperatura por debajo de 20 C o por encima de 27 C"),
      detail: l("White indicates temperature outside the accepted water range.", "Blanco indica temperatura fuera del rango aceptado del agua."),
      evaluate: function (context) {
        return context.temp < firmwareConfig.sensors.tempLowLimitC || context.temp > firmwareConfig.sensors.tempHighLimitC;
      }
    },
    {
      id: "green",
      label: l("Green", "Verde"),
      cssClass: "is-green",
      condition: l("Food level low: distance greater than 20 cm", "Nivel de alimento bajo: distancia mayor a 20 cm"),
      detail: l("Green appears only when motor, pH, and temperature conditions are all clear.", "Verde solo aparece cuando motor, pH y temperatura estan sin alertas."),
      evaluate: function (context) {
        return context.distance > firmwareConfig.sensors.feedThresholdCm;
      }
    },
    {
      id: "off",
      label: l("Off", "Apagado"),
      cssClass: "is-off",
      condition: l("No alert conditions active", "No hay condiciones de alerta activas"),
      detail: l("Normal system state with no LED color shown.", "Estado normal del sistema sin color LED visible."),
      evaluate: function () {
        return true;
      }
    }
  ];

  function evaluateLed(context) {
    for (var i = 0; i < rules.length; i += 1) {
      if (rules[i].evaluate(context)) {
        return rules[i];
      }
    }
    return rules[rules.length - 1];
  }

  window.FishFeederLedRules = {
    priority: rules,
    evaluateLed: evaluateLed
  };
})();
