(function (root, factory) {
  var config = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = config;
  }
  root.FishFeederFirmwareConfig = config;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var growthTable = [
    0, 9, 10, 10, 11, 11, 11, 12, 12, 13, 13, 14, 15, 15, 16, 16, 17, 18, 18, 19,
    20, 21, 22, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
    39, 40, 42, 43, 44, 45, 47, 48, 50, 51, 53, 54, 56, 57, 58, 58, 59, 60, 61, 62,
    63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 78, 79, 80, 81, 82, 84,
    85, 86, 87, 89, 90, 91, 93, 94, 95, 97, 98, 100, 101, 103, 104, 106, 108, 109, 111, 112,
    114, 116, 118, 119, 121, 123, 125, 127, 129, 131, 132, 134, 136, 136, 138, 140, 142, 144, 146, 149,
    151, 153, 155, 158, 160, 162, 165, 167, 170, 172, 175, 178, 180, 183, 186, 189, 191, 194, 197, 200,
    203, 206, 209, 212, 216, 219, 222, 225, 229, 232, 236, 239, 243, 246, 250, 254, 258, 262, 266, 269,
    274, 278, 282, 286, 290, 295, 299, 304, 308, 313, 317, 322, 327, 332, 337, 342, 347, 352, 358, 363,
    368, 374, 380, 385, 391, 397, 403, 409, 415, 421, 428, 434, 440, 447, 454, 455, 461, 468, 474, 481,
    487, 494, 501, 508, 514, 521, 528, 536, 543, 550, 557, 565, 572, 580, 588, 595, 603, 611, 619, 627,
    635, 643, 652, 660, 669, 677, 686
  ];

  var config = {
    sensors: {
      phLowLimit: 6.2,
      phHighLimit: 8.8,
      tempLowLimitC: 20,
      tempHighLimitC: 27,
      feedThresholdCm: 20
    },
    feeding: {
      smallFeedRate: 9.49,
      mediumFeedRate: 8.26,
      largeFeedRate: 7.63,
      broadcasterClearMs: 5000
    },
    runtime: {
      preFeedWakeSec: 120,
      previewCountdownMs: 15000
    },
    limits: {
      maxFishCountTank: 200,
      maxFishCountPond: 2000,
      harvestGoal1lbGrams: 454,
      harvestGoal15lbGrams: 688,
      purgeTotalSecMax: 600
    },
    defaults: {
      feedHourAm: 0,
      feedMinAm: 0,
      feedHourPm: 0,
      feedMinPm: 0,
      lastFeed: "--:--",
      autoFeedEnabled: true,
      fishCount: 0,
      dayCycle: 0
    },
    growthTable: growthTable,
    statuses: {
      idle: "Halted",
      feeding: "Feeding...",
      purging: "Purging...",
      manualFeed: "Manual Feed"
    }
  };

  config.maxDayForGoal = function (goal) {
    var cap = goal ? config.limits.harvestGoal15lbGrams : config.limits.harvestGoal1lbGrams;
    var maxDay = 0;
    for (var day = 0; day < growthTable.length; day += 1) {
      if (growthTable[day] <= cap) {
        maxDay = day;
      } else {
        break;
      }
    }
    return maxDay;
  };

  config.maxGramsForGoal = function (goal) {
    return goal ? config.limits.harvestGoal15lbGrams : config.limits.harvestGoal1lbGrams;
  };

  config.maxFishCountForEnclosure = function (enclosure) {
    return enclosure ? config.limits.maxFishCountPond : config.limits.maxFishCountTank;
  };

  config.weightForDay = function (day) {
    if (day < 0 || day >= growthTable.length) {
      return -1;
    }
    return growthTable[day];
  };

  config.closestDayForTargetGrams = function (targetGrams, goal) {
    var maxDay = config.maxDayForGoal(goal);
    var bestDay = 0;
    var bestAbsDiff = Math.abs(growthTable[0] - targetGrams);
    for (var day = 1; day <= maxDay; day += 1) {
      var absDiff = Math.abs(growthTable[day] - targetGrams);
      if (absDiff < bestAbsDiff) {
        bestAbsDiff = absDiff;
        bestDay = day;
      }
    }
    return bestDay;
  };

  config.getFeedRateForDay = function (dayCycle) {
    if (dayCycle <= 28) {
      return config.feeding.smallFeedRate;
    }
    if (dayCycle <= 52) {
      return config.feeding.mediumFeedRate;
    }
    return config.feeding.largeFeedRate;
  };

  config.calculateFeedAmount = function (fishCount, dayCycle) {
    var fishWeight = config.weightForDay(dayCycle);
    if (dayCycle <= 0 || fishCount <= 0 || fishWeight < 0) {
      return 0;
    }
    if (dayCycle <= 28) {
      return fishCount * (0.04 * fishWeight - 0.0004);
    }
    if (dayCycle <= 52) {
      return fishCount * (0.03 * fishWeight - 0.00003);
    }
    return fishCount * (0.015 * fishWeight + 0.0005);
  };

  config.calculateRuntimeMs = function (dayCycle, grams) {
    if (grams <= 0) {
      return 0;
    }
    var runMs = Math.round((grams / config.getFeedRateForDay(dayCycle)) * 1000);
    var total = runMs + config.feeding.broadcasterClearMs;
    return total < 1 ? 1 : total;
  };

  return config;
});
