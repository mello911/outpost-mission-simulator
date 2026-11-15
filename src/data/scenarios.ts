/**
 * OUTPOST: NASA Mission Scenarios
 * Curated mission campaigns based on authentic NASA exploration roadmaps:
 * 1. Artemis Base Camp Sol 30 (Lunar South Pole permanent settlement expedition)
 * 2. Martian Dust Storm Crisis (Extreme survival: global optical depth attenuation & ECLSS stress test)
 * 3. South Pole Cryo-Ice Rush (High-tempo ISRU volatile extraction & ALSEP geophysics blitz)
 */

import { DestinationType, OutpostConfiguration, MissionSetupConfig } from '../types';
import { CREW_PRESETS } from './crew';

export interface ScenarioObjective {
  id: string;
  title: string;
  description: string;
  isPrimary: boolean;
  target?: number;
  unit?: string;
}

export interface MissionScenario {
  id: string;
  title: string;
  subtitle: string;
  destination: DestinationType;
  difficulty: 'nominal' | 'challenging' | 'extreme';
  targetSolDuration: number;
  location: string;
  coordinates: string;
  badge: string;
  summary: string;
  briefing: string;
  scientificContext: string;
  nasaProgram: string;
  objectives: ScenarioObjective[];
  configuration: OutpostConfiguration;
  startingBudgetMillionUSD: number;
  environmentalModifiers: {
    solarEfficiencyModifier: number;
    dustStormActive?: boolean;
    ambientRadiationModifier: number;
    hazardDescription: string;
  };
}

export const MISSION_SCENARIOS: MissionScenario[] = [
  {
    id: 'artemis_base_camp_sol30',
    title: 'Artemis Base Camp Sol 30',
    subtitle: 'Lunar South Pole Settlement Expedition',
    destination: 'moon',
    difficulty: 'nominal',
    targetSolDuration: 30,
    location: 'Shackleton Crater Connecting Ridge (Peak of Eternal Light)',
    coordinates: '89.9°S, 0.0°E',
    badge: 'ARTEMIS BASE CAMP',
    summary: 'Standard NASA lunar South Pole expedition. Establish surface operations, verify closed-loop water/O2 recycling, and complete a 30-Sol sustained settlement mission.',
    briefing:
      'Welcome to Artemis Base Camp, Commander. Your crew has touched down on the Connecting Ridge adjacent to Shackleton Crater. Your mission directives are to inspect the photovoltaic array, verify ECLSS closed-loop water and oxygen recovery, extract volatile water ice from shadowed crater cold traps, and maintain crew morale across a full 30-Sol lunar expedition.',
    scientificContext:
      'NASA\'s Artemis Base Camp architecture plans a sustained surface presence at the lunar South Pole. Positioned along ridges with 86–92% continuous solar illumination, the camp leverages water ice in permanently shadowed regions (PSRs) at 40 Kelvin for in-situ life support and propellant manufacturing.',
    nasaProgram: 'NASA Artemis Program (Artemis III–V)',
    objectives: [
      {
        id: 'obj_eclss_nominal',
        title: 'Maintain Closed-Loop ECLSS',
        description: 'Sustain nominal oxygen partial pressure and water recycling throughout all 30 Sols.',
        isPrimary: true,
      },
      {
        id: 'obj_cryo_drill',
        title: 'Extract Polar Water Ice',
        description: 'Drill and extract volatile cryo-ice from shadowed crater floor deposits.',
        isPrimary: true,
        target: 20,
        unit: 'Liters',
      },
      {
        id: 'obj_alsep_station',
        title: 'Deploy ALSEP Geophysics Array',
        description: 'Deploy lunar passive seismometer and solar wind telemetry sensors on the crater ridge.',
        isPrimary: false,
      },
      {
        id: 'obj_crew_vitals',
        title: 'Preserve Crew Vitals',
        description: 'Keep all 4 astronaut crew members healthy and morale above 75%.',
        isPrimary: false,
      },
    ],
    configuration: {
      habitat: 'hab_transhab',
      life_support: 'ls_sabatier_moxie',
      power: 'pow_solar_fuel_cell',
      radiation: 'rad_polyethylene_water',
      food: 'food_hydroponic_greenhouse',
      water: 'wat_vapor_compression',
    },
    startingBudgetMillionUSD: 120,
    environmentalModifiers: {
      solarEfficiencyModifier: 1.0,
      ambientRadiationModifier: 1.0,
      hazardDescription: 'Low gravity (0.166g), abrasive electrostatically charged highland regolith, and extreme thermal gradients (-180°C to +120°C).',
    },
  },

  {
    id: 'martian_dust_storm_crisis',
    title: 'Martian Dust Storm Crisis',
    subtitle: 'Global Haboob Survival & Power Management',
    destination: 'mars',
    difficulty: 'extreme',
    targetSolDuration: 60,
    location: 'Jezero Crater Paleolake Basin',
    coordinates: '18.38°N, 77.58°E',
    badge: 'EXTREME SURVIVAL',
    summary: 'High-difficulty crisis scenario: A planet-encircling dust storm slashes solar insolation by 80%. Test ECLSS emergency throttling, rely on auxiliary fuel cells, and salvage an orbital cargo container.',
    briefing:
      'PRIORITY COMM FROM MRO: A regional dust storm has merged into a planet-encircling haboob. Atmospheric optical depth has spiked to tau > 9.0, slashing solar panel output by over 80%. You must immediately throttle non-essential base subsystems, cycle auxiliary fuel cells, clear dust from photovoltaic collectors, and intercept an autonomous CLPS resupply drop before life support batteries deplete.',
    scientificContext:
      'Mars global dust storms occur every 3 to 4 Martian years. In 2018, atmospheric dust engulfed 36 million square kilometers and blocked 99% of surface sunlight, ending the 14-year Opportunity rover mission. Surviving such storms necessitates compact nuclear fission (Kilopower KRUSTI) and high-density regenerative fuel cells.',
    nasaProgram: 'NASA Mars Architecture / Jezero Surface Outpost',
    objectives: [
      {
        id: 'obj_storm_survival',
        title: 'Endure Global Dust Storm',
        description: 'Survive 60 Sols without catastrophic outpost power collapse or life support blackout.',
        isPrimary: true,
      },
      {
        id: 'obj_scrubber_purge',
        title: 'Prevent Scrubber Saturation',
        description: 'Purge amine CO₂ scrubbers regularly to avoid carbon dioxide narcosis inside the habitat.',
        isPrimary: true,
      },
      {
        id: 'obj_cargo_salvage',
        title: 'Salvage CLPS Orbital Cargo Drop',
        description: 'Traverse the dust-swept surface in the rover to recover the emergency fuel cell cargo canister.',
        isPrimary: true,
      },
      {
        id: 'obj_radiation_limit',
        title: 'Contain Solar Particle Exposure',
        description: 'Keep astronaut cumulative radiation dosage below the 50 mSv safe mission threshold.',
        isPrimary: false,
      },
    ],
    configuration: {
      habitat: 'hab_rigid_aluminum',
      life_support: 'ls_sabatier_moxie',
      power: 'pow_kilopower_nuclear',
      radiation: 'rad_sintered_regolith',
      food: 'food_hydroponic_greenhouse',
      water: 'wat_vapor_compression',
    },
    startingBudgetMillionUSD: 140,
    environmentalModifiers: {
      solarEfficiencyModifier: 0.20,
      dustStormActive: true,
      ambientRadiationModifier: 1.35,
      hazardDescription: 'Severe solar attenuation (80% drop in insolation), fine perchlorate dust infiltration, and high atmospheric electrostatic discharge.',
    },
  },

  {
    id: 'south_pole_cryo_ice_rush',
    title: 'South Pole Cryo-Ice Rush',
    subtitle: 'High-Tempo Volatile ISRU & Geophysics Blitz',
    destination: 'moon',
    difficulty: 'challenging',
    targetSolDuration: 15,
    location: 'Faustini Crater Cold Traps / Cabeus Impact Rim',
    coordinates: '87.3°S, 77.0°E',
    badge: 'ISRU SPEED RUN',
    summary: 'High-tempo objective: Drill and extract 50 Liters of volatile water ice and deploy ALSEP geophysical stations within a strict 15-Sol launch window before cryogenic dusk sets in.',
    briefing:
      'EXPEDITION DISPATCH: Orbital neutron spectrometers onboard LRO and LCROSS detected high hydrogen concentrations in shallow regolith along Faustini Crater. You have a strict 15-Sol daylight window before the sun dips below crater rim elevations. Engage the rotary drill minigame to harvest 50 Liters of cryogenic water ice, deploy ALSEP geophysics arrays, and survey the crater ridge in the exploration rover!',
    scientificContext:
      'In-situ resource utilization (ISRU) of lunar volatile ice is the critical foundation of human deep-space architecture. Extracted water can be purified for human consumption, cracked into breathable oxygen, and combined with hydrogen to create liquid rocket propellants (LH₂/LOX) for return trips and Mars departures.',
    nasaProgram: 'NASA VIPER & Artemis Science Surface Operations',
    objectives: [
      {
        id: 'obj_ice_quota_50',
        title: 'Extract 50 Liters of Water Ice',
        description: 'Locate cryo-ice pockets and complete rotary drill extraction to reach 50L potable water reserve.',
        isPrimary: true,
        target: 50,
        unit: 'Liters',
      },
      {
        id: 'obj_alsep_deploy',
        title: 'Deploy ALSEP Geophysical Station',
        description: 'Position and activate the passive seismic and solar wind telemetry station on crater rim.',
        isPrimary: true,
      },
      {
        id: 'obj_rover_recon',
        title: 'Planetary Rover Ridge Recon',
        description: 'Mount the exploration rover and map the outer crater ridge perimeter within 15 Sols.',
        isPrimary: false,
      },
      {
        id: 'obj_zero_hypoxia',
        title: 'Zero EVA Hypoxia Incidents',
        description: 'Manage spacesuit consumables so suit oxygen never drops below 25% during surface EVAs.',
        isPrimary: false,
      },
    ],
    configuration: {
      habitat: 'hab_transhab',
      life_support: 'ls_sabatier_moxie',
      power: 'pow_solar_fuel_cell',
      radiation: 'rad_polyethylene_water',
      food: 'food_aeroponic_vertical',
      water: 'wat_brine_processor_98',
    },
    startingBudgetMillionUSD: 115,
    environmentalModifiers: {
      solarEfficiencyModifier: 0.90,
      ambientRadiationModifier: 1.05,
      hazardDescription: 'Low solar elevation angles, rapid shadow movement, extreme cryo-temperatures (40K in shadow), and steep crater slopes.',
    },
  },
];

export const SCENARIOS_MAP: Record<string, MissionScenario> = {
  artemis_base_camp_sol30: MISSION_SCENARIOS[0],
  martian_dust_storm_crisis: MISSION_SCENARIOS[1],
  south_pole_cryo_ice_rush: MISSION_SCENARIOS[2],
};

/**
 * Retrieve scenario by ID
 */
export function getScenarioById(id: string): MissionScenario | undefined {
  return SCENARIOS_MAP[id] || MISSION_SCENARIOS.find(s => s.id === id);
}

/**
 * Generate MissionSetupConfig and OutpostConfiguration from a scenario
 */
export function createScenarioMissionConfig(scenario: MissionScenario): {
  setupConfig: MissionSetupConfig;
  configuration: OutpostConfiguration;
} {
  const setupConfig: MissionSetupConfig = {
    destination: scenario.destination,
    crewSize: 4,
    crewRoster: CREW_PRESETS.slice(0, 4),
    targetSolDuration: scenario.targetSolDuration,
    startingBudgetMillionUSD: scenario.startingBudgetMillionUSD,
  };

  return {
    setupConfig,
    configuration: { ...scenario.configuration },
  };
}
