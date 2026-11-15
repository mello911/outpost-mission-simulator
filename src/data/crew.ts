import { Astronaut, CrewRole } from '../types';

export const CREW_PRESETS: Astronaut[] = [
  {
    id: 'ast_1',
    name: 'Cmdr. Maya Lin',
    role: 'commander',
    roleTitle: 'Mission Commander',
    avatarSeed: 'maya',
    health: 100,
    morale: 95,
    radiationDoseMSv: 12,
    status: 'nominal',
    perk: 'Crisis Leadership: Buffs all crew morale by +10% during emergency events'
  },
  {
    id: 'ast_2',
    name: 'Marcus Vance',
    role: 'life_support_engineer',
    roleTitle: 'Chief ECLSS Systems Engineer',
    avatarSeed: 'marcus',
    health: 100,
    morale: 90,
    radiationDoseMSv: 15,
    status: 'nominal',
    perk: 'Closed-Loop Master: Boosts water and oxygen recycling efficiency by +12%'
  },
  {
    id: 'ast_3',
    name: 'Dr. Elena Rostova',
    role: 'botanist',
    roleTitle: 'Lead Astrobotanist',
    avatarSeed: 'elena',
    health: 100,
    morale: 92,
    radiationDoseMSv: 8,
    status: 'nominal',
    perk: 'Bio-Regenerative: +20% caloric yield from greenhouse crop cycles'
  },
  {
    id: 'ast_4',
    name: 'Dr. Tariq Al-Mansoor',
    role: 'flight_surgeon',
    roleTitle: 'Chief Medical Officer',
    avatarSeed: 'tariq',
    health: 100,
    morale: 94,
    radiationDoseMSv: 10,
    status: 'nominal',
    perk: 'Space Medicine: Halves health loss rates from acute radiation and hypoxia'
  },
  {
    id: 'ast_5',
    name: 'Kenji Sato',
    role: 'power_specialist',
    roleTitle: 'Power & Automation Specialist',
    avatarSeed: 'kenji',
    health: 100,
    morale: 88,
    radiationDoseMSv: 14,
    status: 'nominal',
    perk: 'Grid Optimizer: Reduces outpost idle energy consumption by 15%'
  },
  {
    id: 'ast_6',
    name: 'Dr. Sarah Jenkins',
    role: 'geologist',
    roleTitle: 'In-Situ Planetary Geologist',
    avatarSeed: 'sarah',
    health: 100,
    morale: 91,
    radiationDoseMSv: 18,
    status: 'nominal',
    perk: 'ISRU Extraction: Unlocks higher yields from planetary ice and mineral pockets'
  }
];

export const CREW_ROLES: { role: CrewRole; title: string; desc: string; icon: string }[] = [
  { role: 'commander', title: 'Mission Commander', desc: 'Maintains mission discipline, procedures, and high crew morale.', icon: 'Compass' },
  { role: 'life_support_engineer', title: 'ECLSS Engineer', desc: 'Maintains oxygen scrubbers, VCD water distillers, and pressure seals.', icon: 'Wrench' },
  { role: 'botanist', title: 'Astrobotanist', desc: 'Optimizes hydroponic nutrient cycles and accelerates harvest growth.', icon: 'Sprout' },
  { role: 'flight_surgeon', title: 'Flight Surgeon', desc: 'Monitors physiological vitals, radiation exposure, and crew well-being.', icon: 'HeartPulse' },
  { role: 'power_specialist', title: 'Power Specialist', desc: 'Manages nuclear reactors, battery arrays, and microgrid loads.', icon: 'Zap' },
  { role: 'geologist', title: 'Planetary Geologist', desc: 'Explores local terrain for subsurface ice deposits and construction regolith.', icon: 'Mountain' },
];
