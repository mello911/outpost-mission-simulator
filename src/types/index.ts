export type DestinationType = 'mars' | 'moon';

export interface EnvironmentalStats {
  gravity: number; // in g
  solarInsolation: number; // W/m²
  dayLengthHours: number; // hours per day/night cycle
  avgTempCelsius: number; // °C
  minTempCelsius: number; // °C
  maxTempCelsius: number; // °C
  atmosphericPressureKPa: number; // kPa (Earth is 101.3 kPa, Mars is ~0.6 kPa, Moon is 0 kPa)
  atmosphereComposition: string;
  radiationLevel: 'high' | 'extreme'; // lunar is extreme without magnetic/atmospheric attenuation
  dustHazard: 'abrasive_electrostatic' | 'fine_perchlorate_storm';
  lunarNightCycleDays?: number; // 14 Earth days on Moon
}

export interface Destination {
  id: DestinationType;
  name: string;
  subTitle: string;
  badge: string;
  description: string;
  landingSite: string;
  siteDescription: string;
  stats: EnvironmentalStats;
  challenges: string[];
  advantages: string[];
  bgImage: string;
  planetColor: string;
}

export type CrewRole = 
  | 'commander'
  | 'life_support_engineer'
  | 'botanist'
  | 'flight_surgeon'
  | 'power_specialist'
  | 'geologist';

export interface Astronaut {
  id: string;
  name: string;
  role: CrewRole;
  roleTitle: string;
  avatarSeed: string;
  health: number; // 0 - 100
  morale: number; // 0 - 100
  radiationDoseMSv: number; // cumulative Sieverts (mSv)
  status: 'nominal' | 'strained' | 'critical' | 'incapacitated';
  perk: string;
}

export type ModuleCategory = 
  | 'habitat'
  | 'life_support'
  | 'power'
  | 'radiation'
  | 'food'
  | 'water';

export interface OutpostModuleTier {
  id: string;
  tier: 1 | 2 | 3;
  name: string;
  category: ModuleCategory;
  costMillionUSD: number;
  massKg: number;
  powerDrawKW: number; // negative means it produces power!
  description: string;
  technicalSpecs: string;
  nasaRefTitle: string;
  nasaRefUrl: string;
  statsEffect: {
    // Habitat
    crewCapacityBonus?: number;
    integrityRating?: number; // base hull durability
    thermalEfficiency?: number; // reduced heating load
    // Life Support
    oxygenProductionKgPerDay?: number;
    co2ScrubEfficiencyPct?: number;
    traceToxinFiltrationPct?: number;
    // Power
    powerGenerationKW?: number;
    batteryStorageKWh?: number;
    nightToleranceFactor?: number; // e.g. for lunar night
    // Radiation
    radiationAttenuationPct?: number; // % reduction of GCR & SPE
    stormShelterRating?: number;
    // Food
    foodProductionKcalPerDay?: number;
    waterConsumptionLPerDay?: number;
    dietaryMoraleBonus?: number;
    // Water
    waterRecycleEfficiencyPct?: number; // e.g. 85%, 93%, 98%
    waterPurificationRateLPerSol?: number;
  };
}

export type OutpostConfiguration = Record<ModuleCategory, string>;

export interface ResourceState {
  // Oxygen
  oxygenKg: number;
  maxOxygenKg: number;
  oxygenProductionRate: number; // kg/sol
  oxygenConsumptionRate: number; // kg/sol

  // Water
  waterLiters: number;
  maxWaterLiters: number;
  waterProductionRate: number; // L/sol
  waterConsumptionRate: number; // L/sol
  waterRecycleRatePct: number;

  // Food
  foodKcal: number;
  maxFoodKcal: number;
  foodProductionRate: number; // kcal/sol
  foodConsumptionRate: number; // kcal/sol

  // Energy
  storedEnergyKWh: number;
  maxBatteryStorageKWh: number;
  powerGenerationKW: number; // current Sol output
  powerConsumptionKW: number; // current Sol demand
  solarEfficiencyFactor: number; // affected by dust / night (0 to 1)

  // Structural & Radiation
  habitatIntegrityPct: number; // 0 - 100
  radiationShieldingPct: number; // 0 - 100
  ambientRadiationMSvPerSol: number;
  accumulatedMissionDoseMSv: number;
}

export interface SolHistoryPoint {
  sol: number;
  oxygenKg: number;
  waterLiters: number;
  foodKcal: number;
  storedEnergyKWh: number;
  avgHealth: number;
  avgMorale: number;
  integrityPct: number;
  dailyRadiationMSv: number;
  eventOccurred?: string;
}

export interface CrisisChoice {
  id: string;
  label: string;
  description: string;
  resourceCost?: {
    storedEnergyKWh?: number;
    waterLiters?: number;
    foodKcal?: number;
    oxygenKg?: number;
    integrityPct?: number;
  };
  crewImpact?: {
    healthDelta?: number;
    moraleDelta?: number;
    radiationDoseDeltaMSv?: number;
  };
  successProbability: number; // 0.0 - 1.0
  successOutcome: string;
  failureOutcome: string;
  scientificInsight: string;
}

export interface CrisisEvent {
  id: string;
  title: string;
  category: 'environmental' | 'system_failure' | 'medical' | 'discovery';
  severity: 'caution' | 'warning' | 'emergency';
  targetDestination?: DestinationType; // if undefined, applies to both
  description: string;
  nasaContext: string;
  nasaRefTitle: string;
  nasaRefUrl: string;
  iconName: string;
  choices: CrisisChoice[];
}

export interface ActiveCrisis {
  event: CrisisEvent;
  solTriggered: number;
}

export interface MissionLogEntry {
  sol: number;
  timestamp: string;
  type: 'info' | 'caution' | 'warning' | 'emergency' | 'action' | 'milestone';
  message: string;
  detail?: string;
}

export type GamePhase = 
  | 'landing'
  | 'setup'
  | 'construction'
  | 'live_simulation'
  | 'debrief'
  | 'handbook';

export interface MissionSetupConfig {
  destination: DestinationType;
  crewSize: number;
  crewRoster: Astronaut[];
  targetSolDuration: number; // 30, 60, or 100
  startingBudgetMillionUSD: number;
}

export interface MissionScoreBreakdown {
  survivalPoints: number;
  resourceEfficiencyPoints: number;
  engineeringStabilityPoints: number;
  crisisManagementPoints: number;
  scienceDiscoveryPoints: number;
  totalScore: number;
  rankTitle: string;
  badgeId: string;
  summaryFeedback: string;
}

export interface MissionState {
  id: string;
  phase: GamePhase;
  config: MissionSetupConfig;
  configuration: OutpostConfiguration;
  currentSol: number;
  isPaused: boolean;
  simulationSpeed: 1 | 2 | 5; // Sol step speed
  resources: ResourceState;
  crew: Astronaut[];
  activeCrisis: ActiveCrisis | null;
  history: SolHistoryPoint[];
  logs: MissionLogEntry[];
  isMissionOver: boolean;
  missionOutcome: 'in_progress' | 'success' | 'failure';
  failureReason?: string;
  scoreBreakdown?: MissionScoreBreakdown;
  masterAlarmActive: boolean;
  isMuted: boolean;
  ambientHumEnabled: boolean;
}
