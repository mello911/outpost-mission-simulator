import { Destination } from '../types';

export const DESTINATIONS: Record<'mars' | 'moon', Destination> = {
  mars: {
    id: 'mars',
    name: 'Mars (Ares Base)',
    subTitle: 'The Red Planet • Jezero Delta / Arcadia Planitia',
    badge: '0.38G GRAVITY • 24.6H SOL',
    description: 
      'A cold, dry desert world with a tenuous carbon dioxide atmosphere, seasonal dust storms, and buried glacial ice sheets.',
    landingSite: 'Jezero Crater Rim (18.38°N, 77.58°E)',
    siteDescription: 
      'Ancient river-lake delta offering accessible phyllosilicates, clay minerals, and subsurface permafrost deposits for in-situ water extraction.',
    stats: {
      gravity: 0.38,
      solarInsolation: 590, // W/m² (Earth is ~1360)
      dayLengthHours: 24.65, // 24h 39m 35s
      avgTempCelsius: -63,
      minTempCelsius: -125,
      maxTempCelsius: 20,
      atmosphericPressureKPa: 0.61, // ~0.6% of Earth
      atmosphereComposition: '95.3% CO₂, 2.6% N₂, 1.9% Ar, 0.13% O₂',
      radiationLevel: 'high',
      dustHazard: 'fine_perchlorate_storm',
    },
    challenges: [
      'Seasonal and planet-encircling dust storms can slash solar panel output by over 80%.',
      'Atmospheric pressure is below the Armstrong limit (6.3 kPa)—unprotected blood boils instantly.',
      'Martian regolith contains toxic perchlorates (ClO₄⁻) hazardous to human thyroids and plants.',
      'Communication latency with Mission Control averages 4 to 24 minutes one way.'
    ],
    advantages: [
      'Day/night cycle of 24h 39m closely mirrors human circadian rhythms.',
      'Atmospheric CO₂ can be cracked into pure breathing oxygen via MOXIE (CO₂ → CO + ½O₂).',
      'Abundant subsurface water ice sheets detected by Mars Reconnaissance Orbiter (SHARAD radar).',
      'Tenuous atmosphere provides partial aerodynamic braking for incoming landers.'
    ],
    bgImage: 'linear-gradient(180deg, #180907 0%, #0d0605 100%)',
    planetColor: '#ff5722'
  },
  moon: {
    id: 'moon',
    name: 'Moon (Artemis Base Camp)',
    subTitle: 'The Lunar South Pole • Shackleton Crater Rim',
    badge: '0.166G GRAVITY • 14-DAY NIGHT',
    description: 
      'A harsh, airless world of stark extremes, eternal peaks of sunlight, and permanently shadowed craters containing ancient volatile water ice.',
    landingSite: 'Connecting Ridge, Shackleton Crater (89.9°S, 0.0°E)',
    siteDescription: 
      'Peak of quasi-eternal light (86-92% continuous sunlight) adjacent to deep craters with cold traps preserving billions of tons of water ice at 40 Kelvin.',
    stats: {
      gravity: 0.166,
      solarInsolation: 1360, // W/m² (during illumination)
      dayLengthHours: 708, // ~29.5 Earth days (14 days day / 14 days night)
      avgTempCelsius: -80,
      minTempCelsius: -233, // permanently shadowed regions
      maxTempCelsius: 120,
      atmosphericPressureKPa: 0.0, // Hard vacuum (10⁻¹⁰ Pa)
      atmosphereComposition: 'Vacuum (traces of Helium, Neon, Hydrogen)',
      radiationLevel: 'extreme',
      dustHazard: 'abrasive_electrostatic',
      lunarNightCycleDays: 14
    },
    challenges: [
      '14 Earth-days of continuous freezing darkness if situated away from polar peaks—requires nuclear power or enormous energy storage.',
      'Electrostatic, razor-sharp regolith dust (no atmospheric weathering) destroys seals and human lung tissue.',
      'Zero atmosphere: no shielding against micrometeorites or Galactic Cosmic Rays (GCR).',
      'Extreme thermal cycle swings from +120°C in direct sunlight to -130°C in shadow.'
    ],
    advantages: [
      'Close proximity to Earth: only 3 days transit time and ~1.3-second light-speed communications.',
      'Shackleton Rim receives quasi-continuous solar energy during peak seasons.',
      'South Pole-Aitken basin water ice deposits can be electrolyzed for rocket propellant (LOX/LH₂).',
      'Ideal deep-space staging platform for testing long-duration ECLSS systems.'
    ],
    bgImage: 'linear-gradient(180deg, #0a0c12 0%, #040508 100%)',
    planetColor: '#90a4ae'
  }
};
