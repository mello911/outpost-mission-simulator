import { CrisisEvent } from '../types';

export const MISSION_EVENTS: CrisisEvent[] = [
  {
    id: 'evt_dust_storm',
    title: 'Martian Global Dust Storm Warning',
    category: 'environmental',
    severity: 'warning',
    targetDestination: 'mars',
    description: 
      'High-altitude thermal orbiters have detected a massive regional dust storm rapidly expanding across the Tharsis bulge. Airborne atmospheric dust (tau > 2.8) is reducing surface solar flux by 75% and depositing abrasive electrostatic dust onto exterior radiators.',
    nasaContext: 
      'Global dust storms on Mars occur every 3 to 4 Martian years. In 2018, a planet-encircling storm starved the Opportunity rover of sunlight and permanently ended its 15-year mission.',
    nasaRefTitle: 'NASA: The Anatomy of a Martian Dust Storm',
    nasaRefUrl: 'https://mars.nasa.gov/news/8348/opportunity-weathering-martian-dust-storm/',
    iconName: 'Wind',
    choices: [
      {
        id: 'storm_conservation',
        label: 'Implement Brownout Protocol',
        description: 'Divert power from science bays and secondary life support to essential heaters. Conserves stored battery energy at the cost of crop light cycles.',
        resourceCost: {
          storedEnergyKWh: 15,
          foodKcal: 400
        },
        crewImpact: {
          moraleDelta: -8
        },
        successProbability: 0.95,
        successOutcome: 'Brownout protocols held successfully. Vital heaters remained active without depleting reserves.',
        failureOutcome: 'Minor thermal dip caused auxiliary sensor freezing before stabilization.',
        scientificInsight: 'Strategic load-shedding is the primary survival protocol for planetary surface assets during high optical depth atmospheric events.'
      },
      {
        id: 'storm_purge_radiators',
        label: 'Deploy Electrostatic Dust-Repulsion Fields',
        description: 'Pulse high-voltage electrostatic waves across solar panels to loft dust away. Requires high immediate power surge.',
        resourceCost: {
          storedEnergyKWh: 45
        },
        crewImpact: {
          healthDelta: 0,
          moraleDelta: 5
        },
        successProbability: 0.75,
        successOutcome: 'Electrostatic pulse successfully cleared 60% of surface dust, boosting solar capture by 35%!',
        failureOutcome: 'High voltage arc tripped a circuit breaker; solar wings remain 50% covered with dust.',
        scientificInsight: 'NASA develops Electrodynamic Dust Shields (EDS) utilizing alternating electric fields to migrate abrasive regolith without moving parts.'
      }
    ]
  },

  {
    id: 'evt_spe_radiation',
    title: 'Coronal Mass Ejection: Solar Particle Event (SPE)',
    category: 'environmental',
    severity: 'emergency',
    description: 
      'Deep Space Climate Observatory (DSCOVR) has detected an X-class solar flare directed toward the planetary outpost. A relativistic proton cascade will hit the surface in 45 minutes, with ambient radiation spiking by over 800%.',
    nasaContext: 
      'Solar Particle Events (SPEs) can deliver over 2,000 mSv of ionizing radiation within hours. Without a dedicated "storm shelter" surrounded by water or regolith, astronauts face acute radiation sickness (ARS).',
    nasaRefTitle: 'NASA Space Radiation Analysis Group: Solar Proton Events',
    nasaRefUrl: 'https://www.nasa.gov/hrp/elements/radiation/',
    iconName: 'Sun',
    choices: [
      {
        id: 'spe_shelter',
        label: 'Evacuate Crew to Central Water-Shielded Shelter',
        description: 'Order all personnel into the central core surrounded by freshwater tanks and polyethylene panels for 36 hours. Cramped and halts standard operations.',
        resourceCost: {
          storedEnergyKWh: 20
        },
        crewImpact: {
          healthDelta: -2,
          moraleDelta: -12,
          radiationDoseDeltaMSv: 15
        },
        successProbability: 0.98,
        successOutcome: 'Crew safely hunkered down inside the water storm shelter. The water hydrogen bonds effectively absorbed the proton storm.',
        failureOutcome: 'Storm lingered longer than expected, causing mild claustrophobia and slight elevated dose.',
        scientificInsight: 'Water contains high hydrogen density (2 H atoms per oxygen), which scatters and absorbs dangerous protons far better than heavy lead.'
      },
      {
        id: 'spe_active_shield_overcharge',
        label: 'Overclock Active Electromagnetic Deflection Field',
        description: 'Route all auxiliary generator output into the superconducting coil array to deflect the incoming solar ion storm.',
        resourceCost: {
          storedEnergyKWh: 60
        },
        crewImpact: {
          healthDelta: 0,
          moraleDelta: 10,
          radiationDoseDeltaMSv: 5
        },
        successProbability: 0.80,
        successOutcome: 'The 4.2-Tesla artificial magnetic bubble successfully deflected the proton wave! Hab stayed open and crew continued duties.',
        failureOutcome: 'Cryocooler temperature spiked, tripping thermal protection; crew took a moderate 40 mSv radiation burst.',
        scientificInsight: 'Active magnetic shielding mimics Earth\'s Van Allen belts, bending charged particles with the Lorentz force (F = q(E + v × B)).'
      }
    ]
  },

  {
    id: 'evt_water_distillation_jam',
    title: 'ECLSS Vapor Compression Distillation Jam',
    category: 'system_failure',
    severity: 'warning',
    description: 
      'High calcium sulfate precipitate from the wastewater inlet has crystallized inside the centrifuge distillation drum. The water recycling loop has automatically tripped offline, cutting water reclamation efficiency to zero.',
    nasaContext: 
      'On the ISS, urine distillation centrifuge assemblies frequently suffered precipitation clogging caused by astronauts losing bone calcium into their urine in low gravity.',
    nasaRefTitle: 'NASA ISS Research: Urine Distillation & Gypsum Precipitation Mitigation',
    nasaRefUrl: 'https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-the-international-space-station/',
    iconName: 'Droplet',
    choices: [
      {
        id: 'vcd_chemical_flush',
        label: 'Execute Phosphoric Acid Descaling Flush',
        description: 'Inject specialized acid pre-treat chemical into the distillation chamber to dissolve mineral buildup. Fast and low-risk to equipment.',
        resourceCost: {
          waterLiters: 15,
          storedEnergyKWh: 10
        },
        crewImpact: {
          healthDelta: 0,
          moraleDelta: -3
        },
        successProbability: 0.90,
        successOutcome: 'Acid flush dissolved the crystalline buildup! Centrifuge drum spinning smoothly at nominal 3,200 RPM.',
        failureOutcome: 'Acid bath required secondary neutralizer; flushed 15 additional liters of rinse water.',
        scientificInsight: 'NASA uses a chromic/phosphoric acid mixture known as "Pre-treat" on ISS wastewater to prevent calcium gypsum formation.'
      },
      {
        id: 'vcd_manual_overhaul',
        label: 'Manual Centrifuge Disassembly & Rotor Replacement',
        description: 'Life support engineer manually dismantles the high-speed centrifuge assembly, replaces the gasket, and cleans the heat exchanger.',
        resourceCost: {
          storedEnergyKWh: 5
        },
        crewImpact: {
          healthDelta: -5,
          moraleDelta: -8
        },
        successProbability: 0.82,
        successOutcome: 'Expert engineering repair completed! Centrifuge tolerances recalibrated to factory precision.',
        failureOutcome: 'High torque on a frozen hex bolt stripped a ceramic collar; took 8 hours of extra triage.',
        scientificInsight: 'In closed loops, mechanical components face abrasive chemical wear, requiring robust modular Line Replaceable Units (LRUs).'
      }
    ]
  },

  {
    id: 'evt_greenhouse_blight',
    title: 'Aeroponic Root Misting Nozzle Calcification',
    category: 'system_failure',
    severity: 'caution',
    description: 
      'Nutrient solution salts have clogged 40% of the ultrasonic atomizing nozzles in the food production bay. The crop root systems are drying out, risking premature wilting and caloric harvest deficit.',
    nasaContext: 
      'In NASA\'s Advanced Plant Habitat (APH), fluid dynamics without natural gravity behave unpredictably. Surface tension causes liquid fertilizers to clump and dry into micro-nozzles.',
    nasaRefTitle: 'NASA Advanced Plant Habitat Engineering Challenges',
    nasaRefUrl: 'https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=2032',
    iconName: 'Apple',
    choices: [
      {
        id: 'farm_ultrasonic_pulse',
        label: 'Ultrasonic Degassing & Backflush Cycle',
        description: 'Reverse feed pressure and fire high-frequency acoustic waves to shatter mineral blockages without opening the sealed biome.',
        resourceCost: {
          waterLiters: 8,
          storedEnergyKWh: 12
        },
        crewImpact: {
          moraleDelta: 2
        },
        successProbability: 0.88,
        successOutcome: 'Acoustic pulse cleared the micro-orifices! Nutritive fog restored across all plant trays.',
        failureOutcome: 'Backpressure leaked into drain manifold; 12 liters of nutrient broth had to be filtered.',
        scientificInsight: 'Acoustic cleaning uses cavitation bubbles to break salt scales without damaging delicate roots.'
      },
      {
        id: 'farm_ration_supplement',
        label: 'Emergency Crop Thinning & Ration Rebalancing',
        description: 'Cull stressed seedlings and prioritize hardy dwarf tubers, while augmenting crew meals with packaged emergency reserves.',
        resourceCost: {
          foodKcal: 800
        },
        crewImpact: {
          moraleDelta: -6
        },
        successProbability: 0.95,
        successOutcome: 'Hardy crop varieties survived and yields stabilized. No further moisture stress detected.',
        failureOutcome: 'Yield dropped by 10% for the subsequent harvest cycle.',
        scientificInsight: 'Polyculture cropping with resilient varieties (sweet potatoes and radishes) provides redundancy against single-pathway crop failures.'
      }
    ]
  },

  {
    id: 'evt_micrometeorite_hull',
    title: 'Micrometeorite Hypervelocity Puncture Alert',
    category: 'system_failure',
    severity: 'emergency',
    description: 
      'A 3mm cosmic dust particle traveling at 22 km/s has penetrated the secondary outer bumper and caused a microscopic pinhole leak in the habitat service module. Cabin pressure is falling at 0.15 kPa/hour!',
    nasaContext: 
      'Whipple shields (multi-sheet spaced armor) are standard on the ISS. When a hypervelocity projectile strikes the thin outer sheet, it vaporizes into an expanding cloud of harmless debris before reaching the pressure wall.',
    nasaRefTitle: 'NASA Hypervelocity Impact Technology: Whipple Shields',
    nasaRefUrl: 'https://www.nasa.gov/mission_pages/station/structure/elements/shields.html',
    iconName: 'AlertTriangle',
    choices: [
      {
        id: 'hull_acoustic_patch',
        label: 'Deploy Ultrasonic Leak-Detector & Epoxy Sealant',
        description: 'Use directional acoustic microphone to pinpoint the hiss of escaping air through the wall and apply fast-curing polyurethane epoxy.',
        resourceCost: {
          oxygenKg: 2.5,
          storedEnergyKWh: 8
        },
        crewImpact: {
          healthDelta: 0,
          moraleDelta: -4
        },
        successProbability: 0.92,
        successOutcome: 'Pinhole located in Section D ceiling panel! Epoxy patch solidified instantly under vacuum suction, halting pressure loss.',
        failureOutcome: 'Took 45 minutes to locate the leak behind thermal insulation blankets; lost 4 kg of O₂.',
        scientificInsight: 'Acoustic sensors identify turbulent ultrasound generated by gas leaking from high pressure to vacuum.'
      },
      {
        id: 'hull_regolith_seal',
        label: 'Autonomous External Rover Patch',
        description: 'Command the exterior robotic arm to apply an external sintered regolith sealant patch over the outer bumper.',
        resourceCost: {
          storedEnergyKWh: 25
        },
        crewImpact: {
          healthDelta: 0,
          moraleDelta: 6
        },
        successProbability: 0.85,
        successOutcome: 'Rover robotic weld perfectly bonded over the impact crater! Structural integrity restored to 100%.',
        failureOutcome: 'Rover arm motor stalled due to cold bearings; patch delayed by 2 hours.',
        scientificInsight: 'External sealing from the outside-in prevents structural fatigue cracks from propagating along the pressurized hull.'
      }
    ]
  },

  {
    id: 'evt_ice_discovery',
    title: 'Subsurface Glacial Ice Pocket Detected!',
    category: 'discovery',
    severity: 'caution',
    description: 
      'Autonomous ground-penetrating radar on the scouting rover has verified a shallow (1.2m depth) deposit of 94% pure water ice buried beneath dry regolith just 300 meters from the outpost perimeter!',
    nasaContext: 
      'NASA\'s SHARAD radar and the Phoenix Mars Lander discovered pure subterranean water ice in Martian northern plains, proving massive In-Situ water extraction is technically viable.',
    nasaRefTitle: 'NASA Phoenix Mars Lander Confirms Water-Ice on Mars',
    nasaRefUrl: 'https://www.nasa.gov/mission_pages/phoenix/news/phoenix-20080620.html',
    iconName: 'Sparkles',
    choices: [
      {
        id: 'ice_excavate_full',
        label: 'Deploy Automated Thermal Mining Drill Rig',
        description: 'Sublimate the ice in-situ and pump condensed water directly into habitat storage tanks. High power draw for massive long-term return.',
        resourceCost: {
          storedEnergyKWh: 35
        },
        crewImpact: {
          healthDelta: 0,
          moraleDelta: 15
        },
        successProbability: 0.88,
        successOutcome: 'Thermal extraction pumped 85 liters of pristine freshwater into outpost storage! Crew celebrations erupted.',
        failureOutcome: 'Sublimation pipe suffered minor vapor freeze-up, yielding 35 liters instead of 85.',
        scientificInsight: 'Rodriguez wells use heated downhole probes to melt subsurface ice and siphon water to the surface without extensive excavation.'
      },
      {
        id: 'ice_sample_science',
        label: 'Core Sample for Astrobiology & Paleoclimate Science',
        description: 'Carefully extract stratified ice cores for laboratory analysis to study ancient planetary climate cycles and preserve pristine reserves.',
        resourceCost: {
          storedEnergyKWh: 12
        },
        crewImpact: {
          moraleDelta: 20
        },
        successProbability: 0.96,
        successOutcome: 'Groundbreaking discovery! Stratified layers reveal 100,000-year planetary climate records. Major scientific prestige!',
        failureOutcome: 'Core drill suffered minor diamond bit wear, but delivered high scientific return.',
        scientificInsight: 'Planetary ice cores trap atmospheric gas bubbles from ancient epochs, acting as natural climate archives of planetary evolution.'
      }
    ]
  }
];
