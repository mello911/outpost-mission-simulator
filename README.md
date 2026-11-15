# OUTPOST — Humanity's Next Home
### 2026 NASA Space Apps Challenge • Challenge #03: Junior Astronaut Mission Trainer

[![NASA Space Apps 2026](https://img.shields.io/badge/NASA%20Space%20Apps-2026%20Challenge%20%2303-0b3d91.svg)](https://www.spaceappschallenge.org/)
[![React 19](https://img.shields.io/badge/React-19.3-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%204.0-38bdf8.svg)](https://tailwindcss.com/)
[![Built with Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg)](https://vitejs.dev/)

---

## 🚀 Overview

**OUTPOST** is a cinematic, educational space survival simulation game and flight trainer built for the **2026 NASA Space Apps Challenge (#03: Junior Astronaut Mission Trainer)**. 

Young learners and aspiring aerospace engineers step into the shoes of a **NASA Flight Director** at Mission Control. Players must select an extraterrestrial theater (Mars or Moon), allocate capital budgets across critical life support modules, monitor mathematical resource flows, resolve emergent environmental crises, and safely complete long-duration human spaceflight expeditions.

---

## 🌟 Core Features

### 1. 🌌 Planetary Theater Selection
- **Mars (Ares Surface Base — Jezero Crater Rim / Arcadia Planitia)**:
  - `0.38g` gravity, `24h 39m` Sol day, `590 W/m²` solar insolation.
  - Atmosphere: 95.3% CO₂ (0.61 kPa) enabling in-situ oxygen extraction via **MOXIE**.
  - Hazards: Seasonal global dust storms slashing solar generation by >75%, fine perchlorate regolith toxicity.
- **Moon (Artemis Base Camp — Shackleton Crater Connecting Ridge)**:
  - `0.166g` gravity, `1,360 W/m²` solar insolation, hard vacuum (10⁻¹⁰ Pa).
  - South Pole cold-trap craters preserving volatile water ice at 40 Kelvin.
  - Hazards: 14-day continuous freezing darkness (-130°C to -233°C), unattenuated Galactic Cosmic Rays (GCR), electrostatic razor-sharp regolith dust.

### 2. 🧑‍🚀 Astronaut Crew Customization
- Assemble a crew of 2 to 6 specialists with individual vitals (Health, Morale, Radiation Accumulation, Status):
  - **Mission Commander** (*Cmdr. Maya Lin*): Crisis Leadership buff (+10% morale resilience).
  - **Chief ECLSS Systems Engineer** (*Marcus Vance*): Closed-Loop Master (+12% recycling efficiency).
  - **Lead Astrobotanist** (*Dr. Elena Rostova*): Bio-Regenerative (+20% caloric crop yields).
  - **Chief Medical Officer** (*Dr. Tariq Al-Mansoor*): Space Medicine (halves health loss from acute hypoxia & radiation).
  - **Power & Automation Specialist** (*Kenji Sato*): Grid Optimizer (-15% base habitat idle load).
  - **Planetary Geologist** (*Dr. Sarah Jenkins*): ISRU Extraction (+25% in-situ water/mineral discovery yields).

### 3. 🛠️ Modular Outpost Engineering & Budget Allocation
Allocate a **$120 Million USD** payload budget across 6 vital life support systems across 3 technology tiers:
1. **Habitat Shell**: TransHab Expandable Module vs Rigid Double-Hull Aluminum-Lithium vs Subsurface Basalt Lava Tube.
2. **ECLSS Life Support**: LiOH Consumable Canisters vs Sabatier & MOXIE Suite vs Bioregenerative Closed Core.
3. **Power Grid**: Roll-Out Solar Arrays (ROSA) vs Solar + Regenerative Fuel Cells vs Kilopower KRUSTI 10kWe Fission Nuclear Reactors.
4. **Radiation Armor**: High-Density Polyethylene (HDPE) Water Wall vs Robotic 3D-Sintered Regolith Dome vs Active Superconducting Magnetic Deflector (3.5 Tesla).
5. **Agriculture & Food**: Lyophilized Packaged Rations vs NFT Hydroponic Greenhouse vs Closed-Loop Aeroponic Vertical Array + Spirulina Vats.
6. **Water Reclamation**: Condensate Graywater Loop vs Vapor Compression Distillation (VCD) vs 2023 ISS-milestone 98% Brine Processor Assembly (BPA).

### 4. 📊 Live Mission Control Telemetry
- Authentic Apollo / Shuttle / Orion inspired **Master Caution & Warning (C&W)** annunciator matrix (`O₂ SYS`, `H₂O REC`, `POWER`, `HULL PRES`, `RAD ALARM`, `CREW MED`).
- Telemetry gauges with Sol burn rates and days-remaining forecasts:
  - **Oxygen (kg)**: Daily consumption (0.84 kg/astronaut/Sol) vs MOXIE production.
  - **Water (Liters)**: 2.8 L/astronaut/Sol vs ECLSS recycling percentage recovery.
  - **Food (kcal)**: 2,800 kcal/astronaut/Sol vs greenhouse harvest cycles.
  - **Power (kWh / kW)**: Battery storage, net generation vs load, solar dust attenuation factor.
  - **Habitat Structural Integrity (%)**: Micrometeorite abrasions and thermal stress.
  - **Radiation Cumulative Dose (mSv)**: Compared against the NASA 600 mSv career limit.
- Interactive **Recharts** multi-stream telemetry visualizations (Consumables, Power Grid, Crew Vitals, Radiation Trends).
- Live timestamped **CAPCOM Communication Feed**.

### 5. ⚠️ Authentic Tactical Crisis Events
Encounter real deep-space emergencies with multi-choice operational decisions and scientific explanations:
- *Martian Global Dust Storm Warning* (tau > 2.8 load-shedding vs electrostatic repulsion).
- *Coronal Mass Ejection: Solar Particle Event (SPE)* (water storm shelter vs magnetic overclock).
- *ECLSS Vapor Compression Distillation Jam* (phosphoric acid pre-treat vs manual overhaul).
- *Aeroponic Root Misting Calcification* (ultrasonic degassing vs crop thinning).
- *Micrometeorite Hypervelocity Puncture Alert* (acoustic leak detection vs robotic patch).
- *Subsurface Glacial Ice Pocket Detected* (thermal mining drill vs astrobiological core sampling).

### 6. 🏆 Mission Results & Scientific Debriefing
- 10,000-point 4-pillar evaluation: Crew Survival (40%), Resource Efficiency (25%), Engineering Stability (20%), Crisis & Science (15%).
- NASA Career Rank & Badge awards (*Flight Director Emeritus*, *Senior Mission Commander*, *Outpost Systems Specialist*, *Junior Planetary Pioneer*).
- Real NASA Program correlation analysis.
- One-click JSON **Mission Log Report Export**.
- Persistent high-score leaderboard via browser `LocalStorage`.

### 7. 📖 NASA Science Handbook & Field Manual
- Comprehensive interactive educational guide covering:
  - Why Mars is difficult to inhabit (atmospheric pressure below Armstrong limit, perchlorates, communication lag).
  - Why radiation shielding matters (GCR vs SPE, secondary neutron cascades, hydrogen stopping power).
  - Why water recycling matters (the 2023 ISS 98% milestone, VCD centrifuge physics).
  - Why power generation is critical (surviving 14-day lunar nights, Kilopower fission vs solar).
  - Why food production is challenging (phototropism, aeroponic misting, nutrient recycling).
- Clear distinction between **Real NASA Facts** and **Simplified Gameplay Assumptions**.
- Direct working links to official NASA technical portals.

---

## 🔬 Scientific References & Verification

All human spaceflight equations and values are derived from published NASA standards:

1. **Human Metabolic Consumables (0.84 kg O₂, 2.8 L H₂O, 2,800 kcal daily)**:
   - [NASA-STD-3001: Space Flight Human-System Standard](https://www.nasa.gov/general/nasa-technical-standards-system/)
   - [NASA Human Integration Design Handbook (HIDH)](https://ntrs.nasa.gov/citations/20100028882)
2. **98% Water Recovery System (WRS & BPA)**:
   - [NASA Achieves 98% Water Recovery Milestone on ISS (June 2023)](https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-the-international-space-station/)
3. **MOXIE Mars In-Situ Oxygen Extraction**:
   - [NASA Jet Propulsion Laboratory — MOXIE on Mars 2020 Perseverance](https://mars.nasa.gov/technology/moxie/gui/)
4. **Kilopower 10kWe Fission Surface Power (KRUSTI)**:
   - [NASA Space Technology Mission Directorate — Kilopower Project](https://www.nasa.gov/directorates/stmd/kilopower-fact-sheet/)
   - [NASA Glenn Fission Surface Power for Artemis](https://www.nasa.gov/tdm/fission-surface-power/)
5. **Radiation Hazards & Regolith Shielding**:
   - [NASA Human Research Program — Space Radiation Element](https://www.nasa.gov/hrp/elements/radiation/)
   - [NASA Marshall Autonomous In-Situ Regolith 3D Printing (MMPACT)](https://www.nasa.gov/technology/autonomous-space-construction-mmpact/)
6. **Bio-Regenerative Plant Production in Space**:
   - [NASA Advanced Plant Habitat (APH) on the ISS](https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=2032)
   - [NASA Spinoff: Aeroponics in Space Agriculture](https://spinoff.nasa.gov/Spinoff2006/er_2.html)
7. **Artemis Lunar Base Camp & Mars Architecture**:
   - [NASA Artemis Plan: Lunar Exploration Program Overview](https://www.nasa.gov/specials/artemis/)
   - [NASA Mars Design Reference Architecture 5.0](https://www.nasa.gov/exploration/library/features/mars_dra5.html)

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) with custom HUD glassmorphism and scanline overlays
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Visualizations**: [Recharts](https://recharts.org/)
- **Audio Synthesis**: Native **Web Audio API** (Quindar communication beeps, Master Alarm klaxons, and life support drone without external assets)
- **State Persistence**: Browser `LocalStorage`
- **Effects**: `canvas-confetti`

---

## 🏃 Local Development & Build

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/mello911/outpost-mission-simulator.git
cd outpost-mission-simulator

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:5173
```

### Production Build
```bash
# Type check and bundle for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🛰️ 2026 NASA Space Apps Challenge Alignment

| Requirement | Implementation in OUTPOST |
| :--- | :--- |
| **Junior Astronaut Mission Trainer** | Complete roleplay experience as NASA Flight Director with clear educational progression. |
| **Mars or Moon Settlement** | High-fidelity comparative environmental physics between Jezero Crater and Shackleton Crater. |
| **Resource Management** | Quantitative daily burn and production of Oxygen, Water, Food, Energy, and Radiation. |
| **Outpost Construction** | Budget allocation ($120M) across 6 systems, with direct stat and survival impacts. |
| **Simulation Engine** | Mathematical daily stepping engine with degradation, night cycles, and failure states. |
| **Emergent Crises** | Historical and realistic emergencies with tactical trade-offs and NASA scientific explanations. |
| **Educational Mode** | Dedicated NASA Science Handbook with real vs simplified comparisons and working citations. |
| **Design Direction** | Cinematic dark space UI inspired by NASA Orion/ISS flight director consoles. |

---

*Built with passion for the 2026 NASA Space Apps Challenge.*
