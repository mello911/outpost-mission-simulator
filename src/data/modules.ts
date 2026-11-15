import { OutpostModuleTier, ModuleCategory } from '../types';

export const MODULE_CATEGORIES: { id: ModuleCategory; title: string; subtitle: string; icon: string }[] = [
  { id: 'habitat', title: 'Habitat Shell', subtitle: 'Pressurization, thermal volume, living quarters', icon: 'Home' },
  { id: 'life_support', title: 'ECLSS Life Support', subtitle: 'Atmospheric scrubbers, MOXIE O₂ generation', icon: 'Wind' },
  { id: 'power', title: 'Power Grid', subtitle: 'Fission nuclear, solar PV, regenerative batteries', icon: 'Zap' },
  { id: 'radiation', title: 'Radiation Armor', subtitle: 'Water walls, sintered regolith, active deflection', icon: 'ShieldAlert' },
  { id: 'food', title: 'Agriculture & Food', subtitle: 'Algae photobioreactors, aeroponic plant bays', icon: 'Apple' },
  { id: 'water', title: 'Water Reclamation', subtitle: 'Vapor compression distillation, urine processor', icon: 'Droplets' },
];

export const OUTPOST_MODULES: Record<ModuleCategory, OutpostModuleTier[]> = {
  habitat: [
    {
      id: 'hab_transhab',
      tier: 1,
      category: 'habitat',
      name: 'TransHab Inflatable Habitat',
      costMillionUSD: 18,
      massKg: 12000,
      powerDrawKW: 4.5,
      description: 'Expandable multi-layer Kevlar and Nextel weave inflatable module, based on NASA Johnson Space Center TransHab design.',
      technicalSpecs: 'Usable volume: 340 m³. Multi-layer insulation (MLI) with micrometeorite containment weave. 4-person comfortable capacity.',
      nasaRefTitle: 'NASA TransHab Concept & Bigelow Expandable Activity Module (BEAM)',
      nasaRefUrl: 'https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=1141',
      statsEffect: {
        crewCapacityBonus: 4,
        integrityRating: 70,
        thermalEfficiency: 65,
      }
    },
    {
      id: 'hab_rigid_aluminum',
      tier: 2,
      category: 'habitat',
      name: 'Rigid Isogrid Double-Hull Habitat',
      costMillionUSD: 32,
      massKg: 28000,
      powerDrawKW: 6.0,
      description: 'Orthogrid milled Aluminum-Lithium pressure vessel with reinforced airlock interconnects and external structural mounting hardpoints.',
      technicalSpecs: 'Usable volume: 520 m³. High rigidity, dual compartmentalized airlocks, withstands external regolith burial load up to 2.5 meters.',
      nasaRefTitle: 'NASA Mars Design Reference Architecture 5.0 Surface Habitat',
      nasaRefUrl: 'https://www.nasa.gov/exploration/library/features/mars_dra5.html',
      statsEffect: {
        crewCapacityBonus: 6,
        integrityRating: 90,
        thermalEfficiency: 82,
      }
    },
    {
      id: 'hab_subsurface_cavern',
      tier: 3,
      category: 'habitat',
      name: 'Subsurface Lava-Tube Biosphere',
      costMillionUSD: 46,
      massKg: 42000,
      powerDrawKW: 8.5,
      description: 'Engineered subsurface outpost constructed inside natural basaltic lava tubes. Provides unparalleled thermal stability and impact shielding.',
      technicalSpecs: 'Usable volume: 1,200 m³. Natural basalt ceiling >15m thickness completely eliminates surface temperature swings and micrometeorite threats.',
      nasaRefTitle: 'NASA Lunar & Martian Subsurface Lava Tube Habitation Studies',
      nasaRefUrl: 'https://www.nasa.gov/general/exploration-of-lunar-pits-and-lava-tubes/',
      statsEffect: {
        crewCapacityBonus: 8,
        integrityRating: 99,
        thermalEfficiency: 95,
      }
    }
  ],

  life_support: [
    {
      id: 'ls_basic_scrubber',
      tier: 1,
      category: 'life_support',
      name: 'Open-Loop LiOH & O₂ Bottled Reserve',
      costMillionUSD: 14,
      massKg: 9500,
      powerDrawKW: 3.2,
      description: 'Consumable Lithium Hydroxide canisters for CO₂ capture paired with compressed cryogenic liquid oxygen reserves.',
      technicalSpecs: 'O₂ production: 3.5 kg/sol via boil-off vaporizers. High resupply dependency. CO₂ scrubbing capacity: 4.8 kg CO₂/sol.',
      nasaRefTitle: 'Apollo & Shuttle Environmental Control Systems (LiOH scrubbers)',
      nasaRefUrl: 'https://www.nasa.gov/history/apollo-command-service-module-news-reference/',
      statsEffect: {
        oxygenProductionKgPerDay: 3.5,
        co2ScrubEfficiencyPct: 75,
        traceToxinFiltrationPct: 70
      }
    },
    {
      id: 'ls_sabatier_moxie',
      tier: 2,
      category: 'life_support',
      name: 'Sabatier Reactor & MOXIE Electrolysis Suite',
      costMillionUSD: 26,
      massKg: 16000,
      powerDrawKW: 7.8,
      description: 'Solid Oxide Electrolysis (MOXIE) extracting O₂ from ambient CO₂ combined with catalytic Sabatier methanation converting exhale into water.',
      technicalSpecs: 'Produces 7.2 kg O₂/sol continuously. Sabatier reactor recovers 50% hydrogen as potable water: CO₂ + 4H₂ → CH₄ + 2H₂O.',
      nasaRefTitle: 'NASA MOXIE on Mars 2020 Perseverance Rover & ISS Sabatier System',
      nasaRefUrl: 'https://mars.nasa.gov/technology/moxie/gui/',
      statsEffect: {
        oxygenProductionKgPerDay: 7.2,
        co2ScrubEfficiencyPct: 92,
        traceToxinFiltrationPct: 90
      }
    },
    {
      id: 'ls_closed_bioregenerative',
      tier: 3,
      category: 'life_support',
      name: 'Bio-Regenerative Closed ECLSS Core',
      costMillionUSD: 39,
      massKg: 24000,
      powerDrawKW: 11.0,
      description: 'Next-generation bioregenerative life support uniting high-pressure water electrolysis, biological Chlorella algae scrubbers, and regenerative amine beds.',
      technicalSpecs: 'Continuous 12.0 kg O₂/sol output. 99.4% CO₂ catalytic extraction with automatic VOC (Volatile Organic Compounds) catalytic oxidizers.',
      nasaRefTitle: 'NASA Bio-regenerative Life Support Systems (BLSS) & CELSS',
      nasaRefUrl: 'https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=8043',
      statsEffect: {
        oxygenProductionKgPerDay: 12.0,
        co2ScrubEfficiencyPct: 99,
        traceToxinFiltrationPct: 98
      }
    }
  ],

  power: [
    {
      id: 'pow_solar_li_ion',
      tier: 1,
      category: 'power',
      name: 'Roll-Out Solar Arrays (ROSA) + Li-Ion Bank',
      costMillionUSD: 16,
      massKg: 8500,
      powerDrawKW: -18.0, // negative means it produces 18 kW average during day
      description: 'Flexible thin-film GaAs multi-junction solar roll-out wings paired with 140 kWh lithium-ion battery buffer.',
      technicalSpecs: 'Peak daylight generation: 22 kW (Mars) / 34 kW (Moon day). Battery storage: 140 kWh. Vulnerable to dust deposition and lunar 14-day nights.',
      nasaRefTitle: 'NASA ISS Roll-Out Solar Array (iROSA) Mission Technology',
      nasaRefUrl: 'https://www.nasa.gov/mission_pages/station/structure/irosa/',
      statsEffect: {
        powerGenerationKW: 18.0,
        batteryStorageKWh: 140,
        nightToleranceFactor: 0.35
      }
    },
    {
      id: 'pow_solar_fuel_cell',
      tier: 2,
      category: 'power',
      name: 'Deployable Solar Arrays + Regenerative Fuel Cells (RFC)',
      costMillionUSD: 29,
      massKg: 19000,
      powerDrawKW: -32.0,
      description: 'High-efficiency dual solar tracking arrays backed by closed-loop Hydrogen-Oxygen regenerative fuel cells (electrolyze water by day, generate power by night).',
      technicalSpecs: 'Peak generation: 36 kW. RFC storage equivalent: 380 kWh. Can survive 7-day brownout cycles by combusting stored H₂ and O₂.',
      nasaRefTitle: 'NASA Glenn Research Center Regenerative Fuel Cell Systems',
      nasaRefUrl: 'https://www.nasa.gov/centers/glenn/technology/regenerative_fuel_cells.html',
      statsEffect: {
        powerGenerationKW: 32.0,
        batteryStorageKWh: 380,
        nightToleranceFactor: 0.70
      }
    },
    {
      id: 'pow_kilopower_nuclear',
      tier: 3,
      category: 'power',
      name: 'Kilopower KRUSTI 10kWe Fission Reactor Pair',
      costMillionUSD: 44,
      massKg: 27000,
      powerDrawKW: -55.0,
      description: 'Twin solid-cast U-235 molybdenum core nuclear fission surface power units coupled to sodium heat pipes and high-efficiency Stirling engines.',
      technicalSpecs: 'Continuous 55 kW baseload electricity, completely immune to solar angle, dust storms, darkness, and lunar polar nights for 10+ operational years.',
      nasaRefTitle: 'NASA Kilopower Project (KRUSTI) Surface Fission Nuclear Power',
      nasaRefUrl: 'https://www.nasa.gov/directorates/stmd/kilopower-fact-sheet/',
      statsEffect: {
        powerGenerationKW: 55.0,
        batteryStorageKWh: 500,
        nightToleranceFactor: 1.00
      }
    }
  ],

  radiation: [
    {
      id: 'rad_polyethylene_water',
      tier: 1,
      category: 'radiation',
      name: 'High-Density Polyethylene (HDPE) & Graywater Wall',
      costMillionUSD: 11,
      massKg: 7800,
      powerDrawKW: 1.0,
      description: 'Hydrogen-rich polyethylene panels backed by habitat water storage tanks surrounding crew bunks for passive secondary radiation absorption.',
      technicalSpecs: 'Provides 4.2 g/cm² aerial density. Effective against low-energy solar flare protons; moderate GCR (Galactic Cosmic Ray) attenuation.',
      nasaRefTitle: 'NASA Langley Polyethylene Radiation Shielding Evaluation',
      nasaRefUrl: 'https://ntrs.nasa.gov/citations/20050180432',
      statsEffect: {
        radiationAttenuationPct: 45,
        stormShelterRating: 55
      }
    },
    {
      id: 'rad_sintered_regolith',
      tier: 2,
      category: 'radiation',
      name: 'Robotic 3D-Sintered Regolith Overburden Dome',
      costMillionUSD: 24,
      massKg: 18000,
      powerDrawKW: 2.5,
      description: 'Autonomous rovers microwave-sinter in-situ planetary dirt into a 2-meter interlocking protective outer masonry vault over the habitat.',
      technicalSpecs: 'Mass shielding density >250 g/cm². Stops Solar Particle Events (SPEs) by 90% and reduces chronic cosmic ray background to Earth-comparable levels.',
      nasaRefTitle: 'NASA Autonomous In-Situ Regolith 3D Printing & Construction (MMPACT)',
      nasaRefUrl: 'https://www.nasa.gov/technology/autonomous-space-construction-mmpact/',
      statsEffect: {
        radiationAttenuationPct: 78,
        stormShelterRating: 88
      }
    },
    {
      id: 'rad_active_magnetic',
      tier: 3,
      category: 'radiation',
      name: 'Active Superconducting Magnetic Deflector Array',
      costMillionUSD: 38,
      massKg: 29000,
      powerDrawKW: 8.0,
      description: 'High-temperature superconducting (HTS) magnetic coils generating an artificial mini-magnetosphere (3.5 Tesla) deflecting charged particle cascades.',
      technicalSpecs: 'Deflects 95%+ of solar cosmic ray ions and high-energy GCR iron nuclei before physical hull contact, minimizing lethal secondary neutron cascades.',
      nasaRefTitle: 'NASA NIAC Superconducting Magnetic Radiation Shielding for Deep Space',
      nasaRefUrl: 'https://www.nasa.gov/general/active-magnetic-shielding-for-crewed-deep-space-missions/',
      statsEffect: {
        radiationAttenuationPct: 94,
        stormShelterRating: 98
      }
    }
  ],

  food: [
    {
      id: 'food_packaged_rations',
      tier: 1,
      category: 'food',
      name: 'Lyophilized Packaged Rations + Microgreen Sprouter',
      costMillionUSD: 9,
      massKg: 6500,
      powerDrawKW: 1.5,
      description: 'Freeze-dried pre-packaged thermostabilized meals supplemented by a countertop seed germination tray for dietary fresh nutrients.',
      technicalSpecs: 'Supplies 2,800 kcal/person/day from stores. In-situ generation: 2,500 kcal/sol total across outpost. Requires 1.2 L water/day.',
      nasaRefTitle: 'NASA Space Food Systems & ISS Veggie Salad Crops',
      nasaRefUrl: 'https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=374',
      statsEffect: {
        foodProductionKcalPerDay: 2500,
        waterConsumptionLPerDay: 1.5,
        dietaryMoraleBonus: 5
      }
    },
    {
      id: 'food_hydroponic_greenhouse',
      tier: 2,
      category: 'food',
      name: 'Nutrient Film Technique (NFT) Hydroponic Farm',
      costMillionUSD: 21,
      massKg: 15500,
      powerDrawKW: 5.5,
      description: 'Recirculating water and liquid fertilizer channels cultivating high-calorie dwarf wheat, sweet potatoes, soybeans, and salad greens.',
      technicalSpecs: 'Produces 8,500 kcal/sol sustainable caloric output. Dual LED spectrum lighting accelerates photosynthesis cycles. Consumes 3.8 L water/sol.',
      nasaRefTitle: 'NASA Advanced Plant Habitat (APH) & Kennedy Space Center Crop Studies',
      nasaRefUrl: 'https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=2032',
      statsEffect: {
        foodProductionKcalPerDay: 8500,
        waterConsumptionLPerDay: 3.8,
        dietaryMoraleBonus: 15
      }
    },
    {
      id: 'food_aeroponic_bioreactor',
      tier: 3,
      category: 'food',
      name: 'Closed-Loop Aeroponic Vertical Array + Spirulina Vats',
      costMillionUSD: 34,
      massKg: 25000,
      powerDrawKW: 9.0,
      description: 'Misted nutrient vapor root chambers paired with photobioreactors producing dense Spirulina and engineered yeast proteins.',
      technicalSpecs: '95% less water consumption than conventional agriculture. Generates 16,000 kcal/sol. Substantially supplements atmospheric O₂ and scrubs VOCs.',
      nasaRefTitle: 'NASA Aeroponics Research & Microalgae Biomass for Long-Duration Spaceflight',
      nasaRefUrl: 'https://spinoff.nasa.gov/Spinoff2006/er_2.html',
      statsEffect: {
        foodProductionKcalPerDay: 16000,
        waterConsumptionLPerDay: 2.2,
        dietaryMoraleBonus: 25
      }
    }
  ],

  water: [
    {
      id: 'wat_condensate_loop',
      tier: 1,
      category: 'water',
      name: 'Atmospheric Condensate Dehumidifier & Graywater Filter',
      costMillionUSD: 10,
      massKg: 7000,
      powerDrawKW: 2.0,
      description: 'Condensing heat exchangers capture exhaled moisture and perspiration from the cabin atmosphere, filtered through catalytic particulate beds.',
      technicalSpecs: 'Recovers 78% of ambient graywater and perspiration. Does not process urine salts or concentrated brine.',
      nasaRefTitle: 'Early Space Station Freedom Water Reclamation Concept',
      nasaRefUrl: 'https://www.nasa.gov/centers/marshall/history/eclss.html',
      statsEffect: {
        waterRecycleEfficiencyPct: 78,
        waterPurificationRateLPerSol: 12.0
      }
    },
    {
      id: 'wat_vapor_compression',
      tier: 2,
      category: 'water',
      name: 'Vapor Compression Distillation (VCD) Urine Processor',
      costMillionUSD: 22,
      massKg: 14000,
      powerDrawKW: 4.2,
      description: 'Centrifugal vacuum distillation drum separating pure water vapor from urine salts, paired with multi-filtration catalytic oxidizers.',
      technicalSpecs: 'Recovers 93% of all wastewater including urine. Based on the flight-proven ISS Urine Processor Assembly (UPA).',
      nasaRefTitle: 'NASA ISS Urine Processor Assembly & Water Recovery System (WRS)',
      nasaRefUrl: 'https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=1037',
      statsEffect: {
        waterRecycleEfficiencyPct: 93,
        waterPurificationRateLPerSol: 22.0
      }
    },
    {
      id: 'wat_brine_processor_98',
      tier: 3,
      category: 'water',
      name: 'Brine Processor Assembly (BPA) Ultra-Recovery ECLSS',
      costMillionUSD: 35,
      massKg: 21000,
      powerDrawKW: 6.8,
      description: 'State-of-the-art dual VCD + vacuum membrane distillation system extracting water from concentrated brine residue, hitting the legendary 98% milestone.',
      technicalSpecs: 'Recovers 98.4% of all liquid inputs—the exact benchmark achieved on the International Space Station in 2023 for deep space exploration.',
      nasaRefTitle: 'NASA Achieves 98% Water Recovery Milestone on ISS (June 2023)',
      nasaRefUrl: 'https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-the-international-space-station/',
      statsEffect: {
        waterRecycleEfficiencyPct: 98,
        waterPurificationRateLPerSol: 35.0
      }
    }
  ]
};
