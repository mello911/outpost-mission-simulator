import React, { useState } from 'react';
import { 
  DestinationType, 
  MissionSetupConfig, 
  OutpostConfiguration 
} from '../types';
import { CREW_PRESETS } from '../data/crew';
import { DESTINATIONS } from '../data/destinations';
import { soundEngine } from '../utils/audio';
import { 
  ArrowLeft, 
  Rocket, 
  Globe2, 
  Clock, 
  Shield, 
  Zap, 
  Wind, 
  Droplets, 
  Check, 
  Sparkles,
  Users
} from 'lucide-react';

interface GameMissionSelectProps {
  onLaunch: (setupConfig: MissionSetupConfig, configuration: OutpostConfiguration) => void;
  onBack: () => void;
}

export const GameMissionSelect: React.FC<GameMissionSelectProps> = ({
  onLaunch,
  onBack,
}) => {
  const [destination, setDestination] = useState<DestinationType>('mars');
  const [durationSols, setDurationSols] = useState<number>(30);
  const [loadoutPreset, setLoadoutPreset] = useState<'standard' | 'nuclear' | 'bio'>('standard');

  const dest = DESTINATIONS[destination];

  // Presets
  const getPresetConfiguration = (preset: 'standard' | 'nuclear' | 'bio'): OutpostConfiguration => {
    if (preset === 'nuclear') {
      return {
        habitat: 'hab_rigid_aluminum',
        life_support: 'ls_sabatier_moxie',
        power: 'pow_kilopower_nuclear',
        radiation: 'rad_sintered_regolith',
        food: 'food_hydroponic_greenhouse',
        water: 'wat_vapor_compression',
      };
    } else if (preset === 'bio') {
      return {
        habitat: 'hab_subsurface_cavern',
        life_support: 'ls_closed_bioregenerative',
        power: 'pow_solar_fuel_cell',
        radiation: 'rad_magnetic_deflector',
        food: 'food_aeroponic_vertical',
        water: 'wat_brine_processor_98',
      };
    }
    // Standard NASA Balanced
    return {
      habitat: 'hab_transhab',
      life_support: 'ls_sabatier_moxie',
      power: 'pow_solar_fuel_cell',
      radiation: 'rad_polyethylene_water',
      food: 'food_hydroponic_greenhouse',
      water: 'wat_vapor_compression',
    };
  };

  const handleLaunchExpedition = () => {
    soundEngine.playLaunchTone();
    const setupConfig: MissionSetupConfig = {
      destination,
      crewSize: 4,
      crewRoster: CREW_PRESETS.slice(0, 4),
      targetSolDuration: durationSols,
      startingBudgetMillionUSD: 120,
    };
    const configuration = getPresetConfiguration(loadoutPreset);
    onLaunch(setupConfig, configuration);
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between p-4 sm:p-8 select-none bg-slate-950 font-mono">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button
          onClick={() => {
            soundEngine.playButtonClick();
            onBack();
          }}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>TITLE MENU</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <h2 className="text-sm sm:text-base font-black text-white tracking-widest uppercase">
            EXPEDITION CONFIGURATION // CLASS-A
          </h2>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          BUDGET: <span className="text-emerald-400 font-bold">$120M USD</span>
        </div>
      </div>

      {/* Main Single-Screen Configuration Grid (NO SCROLLING!) */}
      <div className="my-auto grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto w-full">
        
        {/* STEP 1: PLANETARY THEATER */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-3">
              <Globe2 className="w-4 h-4" />
              <span>STEP 1: SELECT PLANET</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Mars */}
              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  setDestination('mars');
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                  destination === 'mars'
                    ? 'bg-gradient-to-r from-orange-950/80 to-amber-950/60 border-orange-500 text-white shadow-lg shadow-orange-950/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-orange-400">MARS // ARES BASE</span>
                  {destination === 'mars' && <Check className="w-4 h-4 text-orange-400" />}
                </div>
                <span className="text-[11px] text-slate-300">Jezero Crater • 0.38g Gravity • MOXIE O₂</span>
                <span className="text-[10px] text-amber-500">Hazard: Global Dust Storms</span>
              </button>

              {/* Moon */}
              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  setDestination('moon');
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                  destination === 'moon'
                    ? 'bg-gradient-to-r from-slate-900/90 to-cyan-950/60 border-cyan-500 text-white shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-cyan-400">MOON // ARTEMIS CAMP</span>
                  {destination === 'moon' && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <span className="text-[11px] text-slate-300">Shackleton Rim • 0.166g • Glacial Ice</span>
                <span className="text-[10px] text-cyan-500">Hazard: 14-Day Freezing Night</span>
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Selected Site: <strong className="text-white">{dest.landingSite}</strong>
          </div>
        </div>

        {/* STEP 2: EXPEDITION DURATION */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-3">
              <Clock className="w-4 h-4" />
              <span>STEP 2: MISSION DURATION</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { sols: 30, label: '30 SOLS // SCOUT', badge: 'Casual / Fast', desc: 'Short expedition, ideal for beginners.' },
                { sols: 60, label: '60 SOLS // STANDARD', badge: 'Recommended', desc: 'Standard NASA Artemis class expedition.' },
                { sols: 100, label: '100 SOLS // SURVIVAL', badge: 'Hardcore', desc: 'Deep-space endurance survival test.' },
              ].map(d => (
                <button
                  key={d.sols}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setDurationSols(d.sols);
                  }}
                  onMouseEnter={() => soundEngine.playButtonHover()}
                  className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                    durationSols === d.sols
                      ? 'bg-amber-950/50 border-amber-500 text-white shadow-lg shadow-amber-950/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-300">{d.label}</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-400">{d.badge}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Crew: <strong className="text-white">4 Astronaut Specialists</strong>
          </div>
        </div>

        {/* STEP 3: TECH LOADOUT PRESET */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-3">
              <Zap className="w-4 h-4" />
              <span>STEP 3: HARDWARE LOADOUT</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { 
                  id: 'standard', 
                  title: 'NASA BALANCED', 
                  tag: 'Recommended',
                  detail: 'TransHab + Sabatier MOXIE + Solar PV + VCD 93% Loop' 
                },
                { 
                  id: 'nuclear', 
                  title: 'NUCLEAR FISSION', 
                  tag: 'High Energy',
                  detail: 'Rigid Isogrid + Kilopower KRUSTI 10kWe + Regolith Armor' 
                },
                { 
                  id: 'bio', 
                  title: 'BIO-REGENERATIVE', 
                  tag: 'Closed Loop',
                  detail: 'Lava-Tube + Biocore + Aeroponics + 98% ISS Water BPA' 
                },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setLoadoutPreset(p.id as any);
                  }}
                  onMouseEnter={() => soundEngine.playButtonHover()}
                  className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                    loadoutPreset === p.id
                      ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-300">{p.title}</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">{p.tag}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{p.detail}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Life Support: <strong className="text-emerald-400 font-bold">Closed-Loop Ready</strong>
          </div>
        </div>

      </div>

      {/* Bottom Launch Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-4">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          Ready for launch at <strong className="text-white">{destination.toUpperCase()}</strong> for a <strong className="text-amber-300">{durationSols} Sol</strong> expedition.
        </div>

        <button
          onClick={handleLaunchExpedition}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-amber-300 hover:from-cyan-300 hover:to-amber-200 text-slate-950 font-black text-sm tracking-widest shadow-2xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Rocket className="w-5 h-5 text-slate-950 transform -rotate-45" />
          <span>LAUNCH EXPEDITION [ENTER]</span>
        </button>
      </div>

    </div>
  );
};
