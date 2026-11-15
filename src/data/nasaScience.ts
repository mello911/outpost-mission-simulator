export interface ScienceTopic {
  id: string;
  title: string;
  subtitle: string;
  category: 'life_support' | 'power' | 'radiation' | 'agriculture' | 'environment' | 'psychology';
  icon: string;
  summary: string;
  keyFacts: string[];
  realNasaFact: string;
  gameplaySimplification: string;
  equationsOrSpecs?: { label: string; formula: string; explanation: string }[];
  sources: { title: string; url: string; org: string }[];
}

export const NASA_SCIENCE_HANDBOOK: ScienceTopic[] = [
  {
    id: 'eclss_oxygen_co2',
    title: 'ECLSS: Breathing in Deep Space',
    subtitle: 'Extracting Oxygen & Scrubbing Carbon Dioxide',
    category: 'life_support',
    icon: 'Wind',
    summary: 
      'On Earth, photosynthesizing plants and oceans continuously replenish atmospheric oxygen and absorb CO₂. On Mars or the Moon, every cubic centimeter of breathable air must be artificially manufactured, pressurized, scrubbed of toxic exhaled carbon dioxide, and meticulously recycled.',
    keyFacts: [
      'A standard human consumes approximately 0.84 kg (590 liters) of pure O₂ per day at standard metabolic burn (NASA-STD-3001).',
      'Exhaled air contains ~4% CO₂. If habitat CO₂ concentration exceeds 0.7 kPa (0.7% at sea level), astronauts suffer headaches, cognitive impairment, and acidosis.',
      'NASA MOXIE on the Perseverance rover successfully produced 122 grams of 98% pure oxygen on Mars by solid oxide electrolysis of atmospheric CO₂ at 800°C.',
      'The Sabatier catalytic reactor on the International Space Station combines exhaled CO₂ with hydrogen at 400°C to create water and methane: CO₂ + 4H₂ → CH₄ + 2H₂O.'
    ],
    realNasaFact: 
      'MOXIE proved In-Situ Resource Utilization (ISRU) works on another world. Future human missions will land a scaled-up 25-30 kW MOXIE unit years before astronauts arrive to produce 25,000 kg of liquid oxygen for the return rocket propellant.',
    gameplaySimplification: 
      'In OUTPOST, oxygen is measured in kilograms with a daily production/consumption ledger. In reality, partial pressures of nitrogen and oxygen (78% N₂ / 21% O₂ at 101.3 kPa) must be balanced to prevent fire hazards and oxygen toxicity.',
    equationsOrSpecs: [
      {
        label: 'MOXIE Solid Oxide Electrolysis',
        formula: '2 CO₂ + heat (800°C) → 2 CO + O₂',
        explanation: 'Splits Martian carbon dioxide molecules using a specialized ceramic catalytic membrane.'
      },
      {
        label: 'Sabatier Methanation Reaction',
        formula: 'CO₂ + 4 H₂ → CH₄ + 2 H₂O + Heat',
        explanation: 'Catalyzed over ruthenium or nickel to recover precious oxygen as liquid water.'
      }
    ],
    sources: [
      {
        title: 'NASA MOXIE Mission Overview & Results',
        url: 'https://mars.nasa.gov/technology/moxie/gui/',
        org: 'NASA Jet Propulsion Laboratory'
      },
      {
        title: 'NASA-STD-3001 Human Integration Design Handbook (HIDH)',
        url: 'https://www.nasa.gov/general/nasa-technical-standards-system/',
        org: 'NASA Johnson Space Center'
      }
    ]
  },

  {
    id: 'eclss_water_recovery',
    title: 'Water Recycling & The 98% Milestone',
    subtitle: 'From Perspiration and Urine to Drinking Water',
    category: 'life_support',
    icon: 'Droplets',
    summary: 
      'Water is among the heaviest consumables to lift out of Earth\'s gravity well (~1 kg per liter). Without closed-loop recycling, a 4-person crew would need over 4,000 kg of water resupply annually. In 2023, NASA hit a historic breakthrough on the ISS: 98% total water recovery.',
    keyFacts: [
      'Each astronaut requires 2.5 to 3.0 liters of potable water daily for drinking, rehydrating food, and basic hygiene.',
      'Wastewater comes from three primary sources: atmospheric humidity (breath and perspiration), graywater (hand wash), and urine.',
      'The ISS Water Recovery System (WRS) uses Vapor Compression Distillation (VCD) inside a centrifuge to evaporate water from urine under microgravity vacuum.',
      'The newly deployed Brine Processor Assembly (BPA) recovers water from the dense leftover salty sludge, pushing total recovery from 93% to over 98%.'
    ],
    realNasaFact: 
      'The water produced by NASA\'s ECLSS on the ISS is actually cleaner and purer than most municipal municipal tap water on Earth, tested to parts-per-billion standards.',
    gameplaySimplification: 
      'In OUTPOST, water recycling is modeled as a tiered percentage efficiency (78% to 98%). Real systems require catalytic oxidizers to destroy trace volatile fatty acids and iodine biocide dosing.',
    equationsOrSpecs: [
      {
        label: 'Crew Daily Water Balance',
        formula: 'Daily Required = Consumption - (Wastewater × Efficiency%)',
        explanation: 'At 98% recovery, a 4-crew outpost only loses ~0.24 liters per day to brine waste.'
      }
    ],
    sources: [
      {
        title: 'NASA Achieves 98% Water Recovery Milestone on ISS (June 2023)',
        url: 'https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-the-international-space-station/',
        org: 'NASA ISS Program Office'
      },
      {
        title: 'NASA Technical Paper: Water Recovery System Architecture for Deep Space',
        url: 'https://ntrs.nasa.gov/citations/20205001478',
        org: 'NASA NTRS'
      }
    ]
  },

  {
    id: 'power_fission_vs_solar',
    title: 'Powering the Colony: Fission vs Solar',
    subtitle: 'Kilopower, Solar Arrays, and Surviving the 14-Day Lunar Night',
    category: 'power',
    icon: 'Zap',
    summary: 
      'An outpost without continuous power is a frozen tomb. Life support heaters, water pumps, CO₂ scrubbers, and communication antennas demand steady electricity 24 hours a day. However, Mars receives less than half Earth\'s solar energy and suffers global dust storms, while the Moon experiences 14 consecutive Earth days of freezing darkness.',
    keyFacts: [
      'Solar irradiance at Mars averages 590 W/m² compared to 1,360 W/m² at Earth orbit. A planet-wide dust storm can reduce daylight irradiance by 99% (Optical Depth Tau > 5).',
      'The Moon\'s South Pole features high ridges near Shackleton Crater with 80-90% annual sunlight, but lower craters stay in total darkness for billions of years.',
      'NASA and the Department of Energy developed Kilopower (KRUSTI): a 10 kW compact uranium-235 fission reactor using sodium heat pipes and Stirling engines.',
      'Kilopower requires zero maintenance for 10 years, weighing just 1,500 kg per reactor—compact enough to fit inside a single lander payload bay.'
    ],
    realNasaFact: 
      'NASA\'s Opportunity rover died on Mars in 2018 when a massive global dust storm blanketed its solar panels. The Curiosity and Perseverance rovers continue operating because they carry nuclear MMRTG radioisotope power sources.',
    gameplaySimplification: 
      'OUTPOST simulates day/night cycles and dust storm attenuation factors. Tier 3 Kilopower nuclear units provide guaranteed continuous baseload independent of environmental cycles.',
    equationsOrSpecs: [
      {
        label: 'Solar Flux Attenuation under Dust',
        formula: 'I = I₀ × e^(-τ / cos(θ))',
        explanation: 'Beer-Lambert law calculating solar intensity loss as atmospheric dust optical depth (τ) increases.'
      }
    ],
    sources: [
      {
        title: 'NASA Kilopower Project (KRUSTI) Surface Fission Nuclear Power',
        url: 'https://www.nasa.gov/directorates/stmd/kilopower-fact-sheet/',
        org: 'NASA Space Technology Mission Directorate'
      },
      {
        title: 'NASA Fission Surface Power System for Artemis Moon Base',
        url: 'https://www.nasa.gov/tdm/fission-surface-power/',
        org: 'NASA Glenn Research Center'
      }
    ]
  },

  {
    id: 'radiation_hazards',
    title: 'Cosmic Radiation & Regolith Armor',
    subtitle: 'Galactic Cosmic Rays (GCR) and Solar Particle Events (SPE)',
    category: 'radiation',
    icon: 'ShieldAlert',
    summary: 
      'Earth is protected by a strong magnetic field (magnetosphere) and a thick atmosphere (equivalent to 10 meters of water). Neither the Moon nor Mars possesses a global dipole magnetic field. Unshielded astronauts face lethal acute solar flares and long-term cancer-causing cosmic ray bombardment.',
    keyFacts: [
      'Galactic Cosmic Rays (GCR) are atomic nuclei (mostly protons and iron ions) accelerated to near light-speed by distant supernovae. They penetrate deeply and cause secondary neutron showers.',
      'Solar Particle Events (SPE) are intense bursts of relativistic protons ejected during coronal mass ejections. A single unshielded SPE can deliver fatal doses (>3,000 mSv) in hours.',
      'NASA career astronaut radiation limit is approximately 600 mSv (capped to limit lifetime fatal cancer risk to <3%).',
      'Hydrogen is the most effective element at absorbing cosmic radiation. Water walls, high-density polyethylene (HDPE), and thick local regolith (soil) make ideal shields.'
    ],
    realNasaFact: 
      'Buried habitats or 3D-printed regolith overburden domes at least 2 meters thick can attenuate radiation to below Earth background levels, shielding crews indefinitely.',
    gameplaySimplification: 
      'OUTPOST tracks cumulative Sieverts per astronaut. If cumulative dose exceeds safety thresholds, crew health deteriorates and radiation sickness risks emerge.',
    equationsOrSpecs: [
      {
        label: 'Regolith Attenuation Mass Stopping Power',
        formula: 'Dose(x) = Dose₀ × e^(-μ × ρ × x)',
        explanation: 'Where ρ is regolith density (~1.5 g/cm³) and x is shield thickness.'
      }
    ],
    sources: [
      {
        title: 'NASA Space Radiation Program Element & Health Risks',
        url: 'https://www.nasa.gov/hrp/elements/radiation/',
        org: 'NASA Human Research Program'
      },
      {
        title: 'Autonomous In-Situ Regolith 3D Printing (MMPACT)',
        url: 'https://www.nasa.gov/technology/autonomous-space-construction-mmpact/',
        org: 'NASA Marshall Space Flight Center'
      }
    ]
  },

  {
    id: 'space_agriculture',
    title: 'Bio-Regenerative Farming: Microgreens to Crops',
    subtitle: 'Growing Food in Low Gravity & Toxic Perchlorates',
    category: 'agriculture',
    icon: 'Apple',
    summary: 
      'Shipping pre-packaged freeze-dried food across millions of kilometers is costly, and vitamins (especially B1, C, and K) break down over multi-year missions. Growing fresh food on-site provides fresh nutrients, absorbs CO₂, produces oxygen, and provides profound psychological benefits for isolated crews.',
    keyFacts: [
      'Martian soil is rich in iron, silica, and calcium, but contains 0.5% to 1.0% toxic perchlorate salts (ClO₄⁻) that damage the human thyroid gland and kill plants unless leached with water.',
      'NASA Veggie and Advanced Plant Habitat (APH) aboard the ISS have successfully grown red romaine lettuce, mizuna mustard, radishes, and dwarf chili peppers.',
      'Plants do not require gravity to grow upwards; they use phototropism (growing toward LED light sources) and gravitate roots along moisture gradients.',
      'Aeroponic systems mist bare roots with nutrient fog, using 95% less water and zero soil, making them ideal for high-yield space outposts.'
    ],
    realNasaFact: 
      'NASA astronauts reported that caring for fresh green plants on the ISS provided an invaluable morale and mood boost, breaking the sensory deprivation of metal and electronics.',
    gameplaySimplification: 
      'OUTPOST models food as daily caloric production (kcal). Advanced tiers reduce water loss and boost crew morale ratings.',
    equationsOrSpecs: [
      {
        label: 'Photosynthetic Oxygen & Biomass Equation',
        formula: '6 CO₂ + 6 H₂O + Photons → C₆H₁₂O₆ + 6 O₂',
        explanation: 'Converts cabin carbon dioxide and irrigation water into edible biomass and oxygen.'
      }
    ],
    sources: [
      {
        title: 'NASA Advanced Plant Habitat (APH) on the ISS',
        url: 'https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=2032',
        org: 'NASA Kennedy Space Center'
      },
      {
        title: 'NASA Spinoff: Aeroponics - High-Performance Agriculture for Space',
        url: 'https://spinoff.nasa.gov/Spinoff2006/er_2.html',
        org: 'NASA Spinoff'
      }
    ]
  },

  {
    id: 'human_psychology_isolation',
    title: 'Crew Dynamics, Sleep & Extreme Isolation',
    subtitle: 'Circadian Lighting, Workload Shifts, and Morale',
    category: 'psychology',
    icon: 'Brain',
    summary: 
      'A deep space outpost is the most isolated workplace in human history. Astronauts live in confined quarters with no quick return home, no immediate fresh air, and communication delays of up to 24 minutes. Maintaining psychological resilience and team cohesion is just as vital as oxygen.',
    keyFacts: [
      'The Mars500 and NASA CHAPEA (Crew Health and Performance Exploration Analog) missions study 4 to 6 people living inside 3D-printed habitats for up to 378 days.',
      'Without natural sunlight cycles, humans suffer severe circadian rhythm disruption. NASA installed solid-state dynamic LED lighting on the ISS that shifts from blue-enriched morning light to dim red spectrum at night.',
      'Team cohesion requires diverse skill sets: cross-trained engineers, medical doctors, botanists, and seasoned mission commanders.',
      'Nutrition diversity, meaningful recreation, exercise (2 hours daily to combat 0.38g/0.16g muscle atrophy and osteopenia), and communication with loved ones prevent burnout.'
    ],
    realNasaFact: 
      'During NASA CHAPEA missions at Johnson Space Center, crews live with simulated 22-minute communication delays to replicate Mars distances—forcing the crew to solve emergencies autonomously.',
    gameplaySimplification: 
      'In OUTPOST, crew members possess unique roles and perks, with individual health and morale meters affected by ration quality, emergencies, and system stability.',
    equationsOrSpecs: [],
    sources: [
      {
        title: 'NASA CHAPEA: Ground-Based Mars Mission Simulator',
        url: 'https://www.nasa.gov/chapea',
        org: 'NASA Johnson Space Center'
      },
      {
        title: 'NASA Human Factors and Behavioral Health & Performance',
        url: 'https://www.nasa.gov/hrp/elements/bhp/',
        org: 'NASA Human Research Program'
      }
    ]
  }
];
