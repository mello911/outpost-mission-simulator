/**
 * OUTPOST: NASA-Themed Space Exploration Achievements
 * Defines authentic achievements across planetary exploration, closed-loop engineering,
 * survival resilience, scientific discovery, and Artemis program milestones.
 */

export type AchievementCategory = 'exploration' | 'engineering' | 'survival' | 'science' | 'artemis';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  nasaContext: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'One Small Step',
    description: 'Perform your first extravehicular activity (EVA) traverse across extraterrestrial regolith.',
    category: 'exploration',
    icon: 'Footprints',
    xpReward: 50,
    unlocked: false,
    nasaContext: 'Apollo 11 (1969): Neil Armstrong and Buzz Aldrin conducted humankind\'s first lunar EVA at Tranquility Base.',
    rarity: 'common',
  },
  {
    id: 'ice_miner',
    title: 'Cryo-Water Prospector',
    description: 'Drill and extract volatile cryogenic water ice from permanently shadowed polar crater deposits.',
    category: 'science',
    icon: 'Droplets',
    xpReward: 150,
    unlocked: false,
    nasaContext: 'NASA LCROSS & VIPER: Over 600 million metric tons of volatile ice are sequestered in lunar polar cold traps at 40 Kelvin.',
    rarity: 'rare',
  },
  {
    id: 'solar_cleaner',
    title: 'Photovoltaic Sweeper',
    description: 'Clear electrostatically charged regolith and dust accumulation from solar panel arrays to restore peak power generation.',
    category: 'engineering',
    icon: 'SunMedium',
    xpReward: 100,
    unlocked: false,
    nasaContext: 'Mars Exploration Rovers Spirit and Opportunity relied on atmospheric dust cleaning events to survive years beyond their 90-sol design lifetimes.',
    rarity: 'common',
  },
  {
    id: 'alsep_deployment',
    title: 'ALSEP Geophysics Pioneer',
    description: 'Deploy an Apollo Lunar Surface Experiments Package / passive geophysics seismometer array.',
    category: 'science',
    icon: 'Radio',
    xpReward: 200,
    unlocked: false,
    nasaContext: 'Apollo ALSEP & Artemis LEMS: Autonomous scientific sensor stations continuously transmit seismic, solar wind, and heat flow telemetry to Earth.',
    rarity: 'rare',
  },
  {
    id: 'rover_driver',
    title: 'Lunar Roving Ace',
    description: 'Mount and pilot the exploration rover across high-relief crater ridges and boulder fields.',
    category: 'exploration',
    icon: 'Car',
    xpReward: 100,
    unlocked: false,
    nasaContext: 'Apollo 15-17 Lunar Roving Vehicles (LRV) and NASA\'s Lunar Terrain Vehicle (LTV) extend astronaut exploration radii by tens of kilometers.',
    rarity: 'common',
  },
  {
    id: 'eclss_master',
    title: 'Closed-Loop Guardian',
    description: 'Purge carbon dioxide amine scrubbers and maintain nominal 21 kPa partial O₂ cabin atmosphere.',
    category: 'engineering',
    icon: 'Wind',
    xpReward: 150,
    unlocked: false,
    nasaContext: 'ISS ECLSS and Orion Amine Swingbed systems demonstrate regenerable CO₂ adsorption and closed-loop oxygen loop recycling.',
    rarity: 'rare',
  },
  {
    id: 'greenhouse_harvest',
    title: 'Space Botanist',
    description: 'Cultivate and harvest fresh aeroponic crops in microgravity to boost crew nutrition and morale.',
    category: 'survival',
    icon: 'Sprout',
    xpReward: 120,
    unlocked: false,
    nasaContext: 'NASA Veggie & Advanced Plant Habitat (APH): Growing dwarf wheat, zinnia, and red romaine lettuce proves sustainable food production off-Earth.',
    rarity: 'common',
  },
  {
    id: 'dust_storm_survivor',
    title: 'Martian Haboob Survivor',
    description: 'Endure an extreme planet-encircling dust storm without ECLSS collapse or power grid blackout.',
    category: 'survival',
    icon: 'CloudRain',
    xpReward: 300,
    unlocked: false,
    nasaContext: 'Mars 2018 global dust storm darkened skies across 36 million square kilometers with optical depth tau > 10.8.',
    rarity: 'epic',
  },
  {
    id: 'radiation_shield',
    title: 'SPE Storm Haven',
    description: 'Shelter the crew through a severe Solar Particle Event behind hydrogen-rich polyethylene and water shielding.',
    category: 'survival',
    icon: 'ShieldAlert',
    xpReward: 250,
    unlocked: false,
    nasaContext: 'NASA Artemis Orion & BioSentinel utilize dual-wall water tanks and sintered regolith berms to attenuate lethal solar proton doses.',
    rarity: 'epic',
  },
  {
    id: 'geology_collector',
    title: 'Genesis Rock Disciple',
    description: 'Locate, scan, and catalog ancient anorthosite highland crust and pyroclastic volcanic glass specimens.',
    category: 'science',
    icon: 'Gem',
    xpReward: 180,
    unlocked: false,
    nasaContext: 'Apollo 15: Astronauts Dave Scott and Jim Irwin collected the 4.1-billion-year-old Genesis Rock, revealing the Moon\'s primordial magma ocean.',
    rarity: 'rare',
  },
  {
    id: 'artemis_camp_sol30',
    title: 'Artemis Base Camp Sol 30',
    description: 'Sustain outpost operations through Sol 30 on the lunar South Pole connecting ridge.',
    category: 'artemis',
    icon: 'Award',
    xpReward: 400,
    unlocked: false,
    nasaContext: 'NASA\'s Artemis Base Camp architecture plans sustained 30-day surface expeditions at the lunar South Pole with commercial power and landers.',
    rarity: 'epic',
  },
  {
    id: 'supply_salvage',
    title: 'CLPS Cargo Intercept',
    description: 'Intercept and salvage critical logistics payloads delivered by Commercial Lunar Payload Services landers.',
    category: 'exploration',
    icon: 'PackageCheck',
    xpReward: 150,
    unlocked: false,
    nasaContext: 'NASA\'s CLPS initiative contracts commercial landers (Intuitive Machines, Astrobotic) to land supply caches and instruments prior to crew arrival.',
    rarity: 'common',
  },
  {
    id: 'turbo_booster',
    title: 'Cold-Gas MMU Overdrive',
    description: 'Engage spacesuit cold-gas RCS thrusters or rover turbo-capacitors to achieve high-velocity traversal.',
    category: 'exploration',
    icon: 'Zap',
    xpReward: 100,
    unlocked: false,
    nasaContext: 'Bruce McCandless II conducted the first untethered spacewalk in 1984 utilizing nitrogen cold-gas thrusters on the Manned Maneuvering Unit (MMU).',
    rarity: 'common',
  },
  {
    id: 'master_flight_director',
    title: 'Failure Is Not An Option',
    description: 'Resolve a critical Level-3 system crisis with zero casualties, preserving crew life and outpost integrity.',
    category: 'artemis',
    icon: 'Trophy',
    xpReward: 500,
    unlocked: false,
    nasaContext: 'Apollo 13 (1970): Flight Director Gene Kranz orchestrated real-time engineering workarounds that preserved the lives of Lovell, Swigert, and Haise.',
    rarity: 'legendary',
  },
];
