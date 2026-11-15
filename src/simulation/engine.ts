import type { 
  MissionState, 
  MissionSetupConfig, 
  OutpostConfiguration, 
  ResourceState, 
  SolHistoryPoint, 
  MissionScoreBreakdown,
  Astronaut,
  ActiveCrisis
} from '../types';
import { DESTINATIONS } from '../data/destinations';
import { OUTPOST_MODULES } from '../data/modules';
import { MISSION_EVENTS } from '../data/events';

/**
 * Initialize starting resources based on selected destination and outpost configuration
 */
export function initializeMissionState(
  config: MissionSetupConfig,
  configuration: OutpostConfiguration
): MissionState {
  const dest = DESTINATIONS[config.destination];
  const crewCount = config.crewRoster.length;

  // Retrieve selected modules
  const habModule = OUTPOST_MODULES.habitat.find(m => m.id === configuration.habitat) || OUTPOST_MODULES.habitat[0];
  const lsModule = OUTPOST_MODULES.life_support.find(m => m.id === configuration.life_support) || OUTPOST_MODULES.life_support[0];
  const powModule = OUTPOST_MODULES.power.find(m => m.id === configuration.power) || OUTPOST_MODULES.power[0];
  const radModule = OUTPOST_MODULES.radiation.find(m => m.id === configuration.radiation) || OUTPOST_MODULES.radiation[0];
  const foodModule = OUTPOST_MODULES.food.find(m => m.id === configuration.food) || OUTPOST_MODULES.food[0];
  const watModule = OUTPOST_MODULES.water.find(m => m.id === configuration.water) || OUTPOST_MODULES.water[0];

  // Base daily production from modules
  const o2Prod = lsModule.statsEffect.oxygenProductionKgPerDay || 4.0;
  const foodProd = foodModule.statsEffect.foodProductionKcalPerDay || 3000;
  const watRecyclePct = watModule.statsEffect.waterRecycleEfficiencyPct || 80;
  const radAttenuation = radModule.statsEffect.radiationAttenuationPct || 50;
  const habIntegrity = habModule.statsEffect.integrityRating || 85;
  const battCap = powModule.statsEffect.batteryStorageKWh || 200;
  const baseGen = powModule.statsEffect.powerGenerationKW || 25;

  // Initial reserve sizing scaled to mission duration and crew count (with ~25% safety margin)
  const days = config.targetSolDuration;
  const initO2Kg = Math.round(crewCount * 0.84 * Math.min(days, 25) * 1.3);
  const initWaterL = Math.round(crewCount * 2.8 * Math.min(days, 20) * 1.5);
  const initFoodKcal = Math.round(crewCount * 2800 * Math.min(days, 20) * 1.4);

  const ambientRad = config.destination === 'mars' ? 0.85 : 1.75; // mSv/sol base

  const resources: ResourceState = {
    oxygenKg: initO2Kg,
    maxOxygenKg: initO2Kg * 1.5,
    oxygenProductionRate: o2Prod,
    oxygenConsumptionRate: crewCount * 0.84,

    waterLiters: initWaterL,
    maxWaterLiters: initWaterL * 1.4,
    waterProductionRate: 0, // dynamic based on recycling
    waterConsumptionRate: crewCount * 2.8,
    waterRecycleRatePct: watRecyclePct,

    foodKcal: initFoodKcal,
    maxFoodKcal: initFoodKcal * 1.5,
    foodProductionRate: foodProd,
    foodConsumptionRate: crewCount * 2800,

    storedEnergyKWh: battCap,
    maxBatteryStorageKWh: battCap,
    powerGenerationKW: baseGen,
    powerConsumptionKW: (habModule.powerDrawKW + lsModule.powerDrawKW + radModule.powerDrawKW + foodModule.powerDrawKW + watModule.powerDrawKW),
    solarEfficiencyFactor: 1.0,

    habitatIntegrityPct: habIntegrity,
    radiationShieldingPct: radAttenuation,
    ambientRadiationMSvPerSol: ambientRad * (1 - radAttenuation / 100),
    accumulatedMissionDoseMSv: 0,
  };

  const initialHistory: SolHistoryPoint = {
    sol: 1,
    oxygenKg: resources.oxygenKg,
    waterLiters: resources.waterLiters,
    foodKcal: resources.foodKcal,
    storedEnergyKWh: resources.storedEnergyKWh,
    avgHealth: 100,
    avgMorale: 95,
    integrityPct: resources.habitatIntegrityPct,
    dailyRadiationMSv: resources.ambientRadiationMSvPerSol,
  };

  return {
    id: `mission_${Date.now()}`,
    phase: 'live_simulation',
    config,
    configuration,
    currentSol: 1,
    isPaused: false,
    simulationSpeed: 1,
    resources,
    crew: config.crewRoster.map(c => ({ ...c, health: 100, morale: 95, radiationDoseMSv: 0, status: 'nominal' })),
    activeCrisis: null,
    history: [initialHistory],
    logs: [
      {
        sol: 1,
        timestamp: '00:00:00 UTC',
        type: 'milestone',
        message: `Touchdown confirmed at ${dest.name}! Surface outpost systems energized and pressurized.`,
        detail: `Crew of ${crewCount} deployed. Target mission duration: ${config.targetSolDuration} Sols.`
      }
    ],
    isMissionOver: false,
    missionOutcome: 'in_progress',
    masterAlarmActive: false,
    isMuted: false,
    ambientHumEnabled: true,
  };
}

/**
 * Step the simulation forward by 1 Sol
 */
export function simulateOneSol(currentState: MissionState): MissionState {
  if (currentState.isMissionOver || currentState.phase !== 'live_simulation') {
    return currentState;
  }

  // If there is an unresolved active crisis, pause progression until the player makes an engineering decision!
  if (currentState.activeCrisis) {
    return {
      ...currentState,
      isPaused: true
    };
  }

  const nextSol = currentState.currentSol + 1;
  const config = currentState.config;
  const dest = DESTINATIONS[config.destination];
  const modules = currentState.configuration;

  const habModule = OUTPOST_MODULES.habitat.find(m => m.id === modules.habitat) || OUTPOST_MODULES.habitat[0];
  const lsModule = OUTPOST_MODULES.life_support.find(m => m.id === modules.life_support) || OUTPOST_MODULES.life_support[0];
  const powModule = OUTPOST_MODULES.power.find(m => m.id === modules.power) || OUTPOST_MODULES.power[0];
  const radModule = OUTPOST_MODULES.radiation.find(m => m.id === modules.radiation) || OUTPOST_MODULES.radiation[0];
  const foodModule = OUTPOST_MODULES.food.find(m => m.id === modules.food) || OUTPOST_MODULES.food[0];
  const watModule = OUTPOST_MODULES.water.find(m => m.id === modules.water) || OUTPOST_MODULES.water[0];

  const livingCrew = currentState.crew.filter(c => c.status !== 'incapacitated');
  const crewCount = livingCrew.length;

  const logs = [...currentState.logs];

  // 1. Environmental factors (Lunar night or Mars seasonal dust)
  let solarFactor = 1.0;
  let isLunarNight = false;

  if (config.destination === 'moon') {
    // 14 days light, 14 days night cycle
    const cycleDay = (nextSol - 1) % 28;
    if (cycleDay >= 14) {
      isLunarNight = true;
      solarFactor = powModule.id === 'pow_kilopower_nuclear' ? 1.0 : (powModule.statsEffect.nightToleranceFactor || 0.1);
      if (cycleDay === 14) {
        logs.unshift({
          sol: nextSol,
          timestamp: '00:00:00 UTC',
          type: 'warning',
          message: 'Lunar Night Commenced: Outpost entered 14-day freezing darkness cycle.',
          detail: 'Solar arrays output dropped to zero. Relying on stored battery reserves and auxiliary power.'
        });
      }
    }
  } else if (config.destination === 'mars') {
    // Slight random dust optical depth variations (occasional mild haze)
    solarFactor = 0.85 + (Math.sin(nextSol * 0.2) * 0.12);
  }

  // 2. Power Balance
  const isNuclear = powModule.id === 'pow_kilopower_nuclear';
  const rawGeneration = powModule.statsEffect.powerGenerationKW || 25;
  const powerGenerated = isNuclear ? rawGeneration : Math.round(rawGeneration * solarFactor * 10) / 10;

  // Base power demand
  const baseDemand = (
    habModule.powerDrawKW + 
    lsModule.powerDrawKW + 
    radModule.powerDrawKW + 
    foodModule.powerDrawKW + 
    watModule.powerDrawKW
  );
  // Thermal heating penalty during extreme cold
  const thermalDraw = (isLunarNight ? 6.5 : 1.5) * (1 - (habModule.statsEffect.thermalEfficiency || 70) / 100);
  const totalPowerDemand = Math.round((baseDemand + thermalDraw) * 10) / 10;

  const netPowerKW = powerGenerated - totalPowerDemand;
  let newStoredEnergy = currentState.resources.storedEnergyKWh + (netPowerKW * 24 * 0.4); // 24h factor with duty cycle
  newStoredEnergy = Math.max(0, Math.min(currentState.resources.maxBatteryStorageKWh, newStoredEnergy));

  const isPowerDeficit = newStoredEnergy <= 0 && netPowerKW < 0;

  // 3. Water Balance & Recycling
  const crewWaterDemand = crewCount * 2.8;
  const cropWaterDemand = foodModule.statsEffect.waterConsumptionLPerDay || 2.0;
  const grossWaterDemand = crewWaterDemand + cropWaterDemand;

  const recycleEff = (watModule.statsEffect.waterRecycleEfficiencyPct || 80) / 100;
  // If power is completely dead, recycling drops to 30%
  const activeRecycleEff = isPowerDeficit ? 0.3 : recycleEff;
  const waterRecovered = Math.round(crewWaterDemand * activeRecycleEff * 10) / 10;

  let newWater = currentState.resources.waterLiters - grossWaterDemand + waterRecovered;
  newWater = Math.max(0, Math.min(currentState.resources.maxWaterLiters, newWater));

  // 4. Oxygen Balance & MOXIE Generation
  const crewO2Demand = crewCount * 0.84;
  let o2Produced = lsModule.statsEffect.oxygenProductionKgPerDay || 4.0;
  if (isPowerDeficit) {
    o2Produced *= 0.25; // Life support throttled under brownout
  }

  let newOxygen = currentState.resources.oxygenKg - crewO2Demand + (o2Produced * 0.8);
  newOxygen = Math.max(0, Math.min(currentState.resources.maxOxygenKg, newOxygen));

  // 5. Food & Biomass
  const crewFoodDemand = crewCount * 2800;
  let foodHarvest = foodModule.statsEffect.foodProductionKcalPerDay || 3000;
  if (isPowerDeficit || newWater < 10) {
    foodHarvest *= 0.3; // Crops wither without power/water
  }

  let newFood = currentState.resources.foodKcal - crewFoodDemand + foodHarvest;
  newFood = Math.max(0, Math.min(currentState.resources.maxFoodKcal, newFood));

  // 6. Radiation and Shielding
  const baseRadMSv = dest.stats.radiationLevel === 'extreme' ? 1.8 : 0.85;
  const shieldingPct = radModule.statsEffect.radiationAttenuationPct || 50;
  const dailyRadiationDose = Math.round((baseRadMSv * (1 - shieldingPct / 100)) * 100) / 100;
  const totalMissionDose = currentState.resources.accumulatedMissionDoseMSv + dailyRadiationDose;

  // 7. Habitat Structural Degradation
  let newIntegrity = currentState.resources.habitatIntegrityPct - 0.15; // Natural micrometeorite wear
  if (isPowerDeficit) newIntegrity -= 0.5; // Thermal contraction stresses
  newIntegrity = Math.max(0, Math.min(100, Math.round(newIntegrity * 10) / 10));

  // 8. Crew Vitals Simulation
  const updatedCrew: Astronaut[] = currentState.crew.map(ast => {
    if (ast.status === 'incapacitated') return ast;

    let healthDelta = 0;
    let moraleDelta = 0;

    // Hypoxia
    if (newOxygen <= 0) {
      healthDelta -= 30;
      moraleDelta -= 25;
    } else if (newOxygen < crewCount * 1.5) {
      healthDelta -= 5;
      moraleDelta -= 10;
    }

    // Dehydration
    if (newWater <= 0) {
      healthDelta -= 22;
      moraleDelta -= 20;
    } else if (newWater < crewCount * 5) {
      healthDelta -= 3;
      moraleDelta -= 5;
    }

    // Starvation
    if (newFood <= 0) {
      healthDelta -= 12;
      moraleDelta -= 15;
    }

    // Power / Thermal Freeze
    if (isPowerDeficit) {
      healthDelta -= 15;
      moraleDelta -= 20;
    }

    // Radiation accumulation
    const newAstDose = ast.radiationDoseMSv + dailyRadiationDose;
    if (newAstDose > 600) {
      healthDelta -= 8; // Radiation sickness
    }

    // Natural Recovery if all systems nominal
    if (newOxygen > crewCount * 3 && newWater > crewCount * 8 && newFood > crewCount * 5000 && !isPowerDeficit) {
      healthDelta += 3;
      moraleDelta += 2;
    }

    const updatedHealth = Math.max(0, Math.min(100, ast.health + healthDelta));
    const updatedMorale = Math.max(0, Math.min(100, ast.morale + moraleDelta));

    let status: Astronaut['status'] = 'nominal';
    if (updatedHealth <= 0) {
      status = 'incapacitated';
    } else if (updatedHealth < 35 || updatedMorale < 25) {
      status = 'critical';
    } else if (updatedHealth < 70 || updatedMorale < 50) {
      status = 'strained';
    }

    return {
      ...ast,
      health: updatedHealth,
      morale: updatedMorale,
      radiationDoseMSv: newAstDose,
      status
    };
  });

  // Check Master Caution & Warning conditions
  const isMasterAlarm = (
    newOxygen < (crewCount * 1.2) ||
    newWater < (crewCount * 3.0) ||
    newFood < (crewCount * 3000) ||
    (newStoredEnergy <= 0 && netPowerKW < 0) ||
    newIntegrity < 25 ||
    updatedCrew.some(c => c.status === 'critical')
  );

  // 9. Periodic Event Roll
  // Trigger events at Sol 6, 14, 22, 35, 50, 75, or randomly with 12% probability if none active
  let activeCrisis: ActiveCrisis | null = currentState.activeCrisis;
  const isEventSol = [6, 14, 22, 35, 52, 70].includes(nextSol);

  if (!activeCrisis && (isEventSol || Math.random() < 0.10) && nextSol > 3 && nextSol < config.targetSolDuration) {
    // Select an applicable event
    const applicableEvents = MISSION_EVENTS.filter(e => !e.targetDestination || e.targetDestination === config.destination);
    const chosenEvent = applicableEvents[Math.floor(Math.random() * applicableEvents.length)];

    activeCrisis = {
      event: chosenEvent,
      solTriggered: nextSol
    };

    logs.unshift({
      sol: nextSol,
      timestamp: '08:14:22 UTC',
      type: chosenEvent.severity === 'emergency' ? 'emergency' : 'warning',
      message: `ALERT: ${chosenEvent.title}`,
      detail: chosenEvent.description
    });
  }

  // 10. Check Win / Loss conditions
  const allIncapacitated = updatedCrew.every(c => c.status === 'incapacitated');
  const isComplete = nextSol >= config.targetSolDuration;

  let isMissionOver: boolean = currentState.isMissionOver;
  let missionOutcome: 'in_progress' | 'success' | 'failure' = currentState.missionOutcome;
  let failureReason: string | undefined = currentState.failureReason;
  let scoreBreakdown: MissionScoreBreakdown | undefined = currentState.scoreBreakdown;

  if (allIncapacitated) {
    isMissionOver = true;
    missionOutcome = 'failure';
    failureReason = 'All crew members perished due to life support collapse, hypothermia, or resource exhaustion.';
    logs.unshift({
      sol: nextSol,
      timestamp: '23:59:59 UTC',
      type: 'emergency',
      message: 'MISSION TERMINATED: Outpost telemetry lost. All crew incapacitated.',
      detail: failureReason
    });
    scoreBreakdown = calculateFinalScore(nextSol, config.targetSolDuration, updatedCrew, {
      ...currentState.resources,
      oxygenKg: newOxygen,
      waterLiters: newWater,
      foodKcal: newFood,
      storedEnergyKWh: newStoredEnergy,
      habitatIntegrityPct: newIntegrity,
      accumulatedMissionDoseMSv: totalMissionDose
    }, false);
  } else if (newIntegrity <= 0) {
    isMissionOver = true;
    missionOutcome = 'failure';
    failureReason = 'Catastrophic pressure hull failure. Habitat depressurized.';
    logs.unshift({
      sol: nextSol,
      timestamp: '23:59:59 UTC',
      type: 'emergency',
      message: 'CATASTROPHIC FAILURE: Habitat pressure hull rupture.',
      detail: failureReason
    });
    scoreBreakdown = calculateFinalScore(nextSol, config.targetSolDuration, updatedCrew, {
      ...currentState.resources,
      oxygenKg: newOxygen,
      waterLiters: newWater,
      foodKcal: newFood,
      storedEnergyKWh: newStoredEnergy,
      habitatIntegrityPct: 0,
      accumulatedMissionDoseMSv: totalMissionDose
    }, false);
  } else if (isComplete) {
    isMissionOver = true;
    missionOutcome = 'success';
    logs.unshift({
      sol: nextSol,
      timestamp: '23:59:59 UTC',
      type: 'milestone',
      message: `MISSION ACCOMPLISHED! Reached target duration of ${config.targetSolDuration} Sols.`,
      detail: 'Relief expedition approaching. Outpost operational and crew returning home!'
    });
    scoreBreakdown = calculateFinalScore(nextSol, config.targetSolDuration, updatedCrew, {
      ...currentState.resources,
      oxygenKg: newOxygen,
      waterLiters: newWater,
      foodKcal: newFood,
      storedEnergyKWh: newStoredEnergy,
      habitatIntegrityPct: newIntegrity,
      accumulatedMissionDoseMSv: totalMissionDose
    }, true);
  }

  // 11. History datapoint for Recharts
  const livingAvgHealth = livingCrew.length > 0 
    ? Math.round(livingCrew.reduce((acc, c) => acc + c.health, 0) / livingCrew.length)
    : 0;
  const livingAvgMorale = livingCrew.length > 0
    ? Math.round(livingCrew.reduce((acc, c) => acc + c.morale, 0) / livingCrew.length)
    : 0;

  const historyPoint: SolHistoryPoint = {
    sol: nextSol,
    oxygenKg: Math.round(newOxygen * 10) / 10,
    waterLiters: Math.round(newWater * 10) / 10,
    foodKcal: Math.round(newFood),
    storedEnergyKWh: Math.round(newStoredEnergy * 10) / 10,
    avgHealth: livingAvgHealth,
    avgMorale: livingAvgMorale,
    integrityPct: Math.round(newIntegrity),
    dailyRadiationMSv: dailyRadiationDose,
    eventOccurred: activeCrisis ? activeCrisis.event.title : undefined
  };

  return {
    ...currentState,
    currentSol: nextSol,
    resources: {
      ...currentState.resources,
      oxygenKg: Math.round(newOxygen * 10) / 10,
      waterLiters: Math.round(newWater * 10) / 10,
      foodKcal: Math.round(newFood),
      storedEnergyKWh: Math.round(newStoredEnergy * 10) / 10,
      powerGenerationKW: powerGenerated,
      powerConsumptionKW: totalPowerDemand,
      solarEfficiencyFactor: solarFactor,
      habitatIntegrityPct: Math.round(newIntegrity),
      ambientRadiationMSvPerSol: dailyRadiationDose,
      accumulatedMissionDoseMSv: Math.round(totalMissionDose * 10) / 10
    },
    crew: updatedCrew,
    activeCrisis,
    history: [...currentState.history, historyPoint],
    logs: logs.slice(0, 50), // keep latest 50 logs
    isMissionOver,
    missionOutcome,
    failureReason,
    scoreBreakdown,
    masterAlarmActive: isMasterAlarm,
    isPaused: activeCrisis !== null || isMissionOver
  };
}

/**
 * Resolve an active crisis when player selects an engineering choice
 */
export function resolveCrisisChoice(
  state: MissionState,
  choiceId: string
): MissionState {
  if (!state.activeCrisis) return state;

  const crisis = state.activeCrisis.event;
  const choice = crisis.choices.find(c => c.id === choiceId);
  if (!choice) return state;

  const isSuccess = Math.random() < choice.successProbability;
  const outcomeText = isSuccess ? choice.successOutcome : choice.failureOutcome;

  // Apply resource costs
  let newStoredEnergy = state.resources.storedEnergyKWh;
  let newWater = state.resources.waterLiters;
  let newFood = state.resources.foodKcal;
  let newOxygen = state.resources.oxygenKg;
  let newIntegrity = state.resources.habitatIntegrityPct;

  if (choice.resourceCost) {
    if (choice.resourceCost.storedEnergyKWh) newStoredEnergy = Math.max(0, newStoredEnergy - choice.resourceCost.storedEnergyKWh);
    if (choice.resourceCost.waterLiters) newWater = Math.max(0, newWater - choice.resourceCost.waterLiters);
    if (choice.resourceCost.foodKcal) newFood = Math.max(0, newFood - choice.resourceCost.foodKcal);
    if (choice.resourceCost.oxygenKg) newOxygen = Math.max(0, newOxygen - choice.resourceCost.oxygenKg);
    if (choice.resourceCost.integrityPct) newIntegrity = Math.max(0, newIntegrity - choice.resourceCost.integrityPct);
  }

  // Apply crew impact
  const updatedCrew = state.crew.map(c => {
    if (c.status === 'incapacitated') return c;
    const hDelta = choice.crewImpact?.healthDelta || 0;
    const mDelta = choice.crewImpact?.moraleDelta || 0;
    const radDelta = choice.crewImpact?.radiationDoseDeltaMSv || 0;

    const newH = Math.max(0, Math.min(100, c.health + (isSuccess ? hDelta : hDelta - 8)));
    const newM = Math.max(0, Math.min(100, c.morale + (isSuccess ? mDelta : mDelta - 12)));
    const newRad = c.radiationDoseMSv + radDelta;

    return {
      ...c,
      health: newH,
      morale: newM,
      radiationDoseMSv: newRad
    };
  });

  const logs = [...state.logs];
  logs.unshift({
    sol: state.currentSol,
    timestamp: '09:30:00 UTC',
    type: isSuccess ? 'action' : 'warning',
    message: `ACTION TAKEN: ${choice.label} — ${isSuccess ? 'SUCCESS' : 'SYSTEM RESISTANCE'}`,
    detail: `${outcomeText} (${choice.scientificInsight})`
  });

  return {
    ...state,
    resources: {
      ...state.resources,
      storedEnergyKWh: newStoredEnergy,
      waterLiters: newWater,
      foodKcal: newFood,
      oxygenKg: newOxygen,
      habitatIntegrityPct: newIntegrity
    },
    crew: updatedCrew,
    activeCrisis: null, // Dismiss crisis modal
    isPaused: false, // resume
    logs: logs.slice(0, 50)
  };
}

/**
 * Calculate final debrief score and badges
 */
function calculateFinalScore(
  solsCompleted: number,
  targetSols: number,
  crew: Astronaut[],
  resources: ResourceState,
  isVictory: boolean
): MissionScoreBreakdown {
  const survivedCount = crew.filter(c => c.status !== 'incapacitated').length;
  const survivalPct = crew.length > 0 ? (survivedCount / crew.length) : 0;

  const solProgressPct = Math.min(1, solsCompleted / targetSols);

  // Survival Points (max 4,000)
  const survivalPoints = Math.round(survivalPct * solProgressPct * 4000);

  // Resource Efficiency Points (max 2,500)
  const o2Ratio = Math.min(1, resources.oxygenKg / (resources.maxOxygenKg * 0.3));
  const waterRatio = Math.min(1, resources.waterLiters / (resources.maxWaterLiters * 0.3));
  const foodRatio = Math.min(1, resources.foodKcal / (resources.maxFoodKcal * 0.3));
  const resourceEfficiencyPoints = Math.round(((o2Ratio + waterRatio + foodRatio) / 3) * 2500);

  // Engineering Stability Points (max 2,000)
  const integrityRatio = resources.habitatIntegrityPct / 100;
  const radiationPenalty = Math.max(0, 1 - (resources.accumulatedMissionDoseMSv / 500));
  const engineeringStabilityPoints = Math.round(((integrityRatio + radiationPenalty) / 2) * 2000);

  // Crisis & Science Bonus (max 1,500)
  const scienceDiscoveryPoints = isVictory ? 1500 : Math.round(solProgressPct * 800);
  const crisisManagementPoints = Math.round(solProgressPct * 1000);

  const totalScore = survivalPoints + resourceEfficiencyPoints + engineeringStabilityPoints + scienceDiscoveryPoints;

  let rankTitle = 'Junior Planetary Pioneer';
  let badgeId = 'badge_pioneer';
  let summaryFeedback = 'Commendable effort. Outpost operations in harsh alien environments require constant balance of life support and power generation.';

  if (totalScore >= 8800) {
    rankTitle = 'Flight Director Emeritus (Exceptional)';
    badgeId = 'badge_flight_director';
    summaryFeedback = 'Outstanding engineering judgment! Your outpost maintained textbook ECLSS closure, impeccable power margins, and 100% crew survival.';
  } else if (totalScore >= 7200) {
    rankTitle = 'Senior Mission Commander';
    badgeId = 'badge_commander';
    summaryFeedback = 'Superior performance! The crew thrived through severe planetary hazards, demonstrating exemplary resource allocation.';
  } else if (totalScore >= 5500) {
    rankTitle = 'Outpost Systems Specialist';
    badgeId = 'badge_specialist';
    summaryFeedback = 'Solid mission execution. Several systems experienced critical strain, but the habitat weathered the duration.';
  } else if (!isVictory) {
    rankTitle = 'Mission Cadet in Remedial Simulation';
    badgeId = 'badge_cadet';
    summaryFeedback = 'Mission aborted early. Analyze your life support consumption and thermal reserves in the NASA Science Handbook before re-attempting.';
  }

  return {
    survivalPoints,
    resourceEfficiencyPoints,
    engineeringStabilityPoints,
    crisisManagementPoints,
    scienceDiscoveryPoints,
    totalScore,
    rankTitle,
    badgeId,
    summaryFeedback
  };
}
