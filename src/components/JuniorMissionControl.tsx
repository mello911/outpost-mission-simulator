import React, { useState } from 'react';
import { MissionState } from '../types';
import { soundEngine } from '../utils/audio';
import { VisualOutpost } from './VisualOutpost';
import { AstroCompanion } from './AstroCompanion';
import { CommDelayRelay } from './CommDelayRelay';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  Wind, 
  Droplets, 
  Zap, 
  Apple, 
  ShieldAlert, 
  Radio, 
  HeartPulse, 
  Sparkles,
  Award,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface JuniorMissionControlProps {
  state: MissionState;
  onAdvanceSol: () => void;
  onTogglePause: () => void;
  onChangeSpeed: (speed: 1 | 2 | 5) => void;
  onSilenceMasterAlarm: () => void;
  onManualAction: (actionType: 'purge_scrubbers' | 'rationing' | 'eva_repair' | 'battery_boost') => void;
  onModuleAction?: (actionType: 'clean_solar' | 'tend_crops' | 'flush_water' | 'inspect_hab' | 'rover_scout') => void;
  onSwitchToProMode: () => void;
  onOpenHandbook: () => void;
  onReceiveCommSupply: (bonusResource: 'power' | 'oxygen' | 'water') => void;
}

export const JuniorMissionControl: React.FC<JuniorMissionControlProps> = ({
  state,
  onAdvanceSol,
  onTogglePause,
  onChangeSpeed,
  onSilenceMasterAlarm,
  onManualAction,
  onModuleAction,
  onSwitchToProMode,
  onOpenHandbook,
  onReceiveCommSupply,
}) => {
  const [showCommModal, setShowCommModal] = useState(false);

  const { resources, crew, currentSol, config, masterAlarmActive, isPaused, simulationSpeed } = state;
  const livingCrew = crew.filter(c => c.status !== 'incapacitated');
  const crewCount = livingCrew.length;

  // Simple, kid-friendly calculations
  const o2Pct = Math.min(100, Math.round((resources.oxygenKg / resources.maxOxygenKg) * 100));
  const waterPct = Math.min(100, Math.round((resources.waterLiters / resources.maxWaterLiters) * 100));
  const batteryPct = Math.min(100, Math.round((resources.storedEnergyKWh / resources.maxBatteryStorageKWh) * 100));
  const foodPct = Math.min(100, Math.round((resources.foodKcal / resources.maxFoodKcal) * 100));
  const integrityPct = resources.habitatIntegrityPct;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Top Banner: Mission Control Bar */}
      <div className="bg-gradient-to-r from-space-900 via-space-850 to-space-900 rounded-2xl p-4 sm:p-5 border-2 border-cyan-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Sol Badge & Mission Tag */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-space-950 font-bold text-xl shadow-lg shadow-cyan-500/30">
            ☀️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                SOL {currentSol}
              </span>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                DAY {currentSol} OF {config.targetSolDuration}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-300">
              {config.destination === 'mars' ? 'Mars Jezero Outpost' : 'Lunar South Pole Camp'} • {livingCrew.length} Healthy Astronauts
            </p>
          </div>
        </div>

        {/* Center: Comm Delay Relay CTA Button */}
        <button
          onClick={() => {
            soundEngine.playQuindarTone(true);
            setShowCommModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-space-950 hover:bg-space-800 border-2 border-cyan-400 text-cyan-300 font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-950/50 hover:scale-102 transition-all"
        >
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Call Houston on Earth (Radio Delay)</span>
        </button>

        {/* Right: Time Controls & Pro Switcher */}
        <div className="flex items-center gap-2">
          
          {/* Speed Toggles */}
          <div className="flex bg-space-950 p-1 rounded-xl border border-slate-800">
            {([1, 2, 5] as const).map(speed => (
              <button
                key={speed}
                onClick={() => {
                  soundEngine.playBeep(600, 0.02);
                  onChangeSpeed(speed);
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                  simulationSpeed === speed
                    ? 'bg-cyan-500 text-space-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Pause / Play */}
          <button
            onClick={() => {
              soundEngine.playBeep(isPaused ? 880 : 440, 0.04);
              onTogglePause();
            }}
            className={`p-2.5 rounded-xl border transition-all ${
              isPaused
                ? 'bg-amber-500 text-space-950 border-amber-400'
                : 'bg-emerald-500 text-space-950 border-emerald-400'
            }`}
            title={isPaused ? 'Resume Mission' : 'Pause Mission'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>

          {/* Big Next Sol Button */}
          <button
            onClick={() => {
              soundEngine.playSolDayChime();
              onAdvanceSol();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-amber-300 hover:from-cyan-300 hover:to-amber-200 text-space-950 font-display font-bold text-xs tracking-wider shadow-lg shadow-cyan-500/30 transition-transform hover:scale-105 active:scale-95"
          >
            <span>NEXT SOL</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Switch to Flight Director Pro Mode */}
          <button
            onClick={() => {
              soundEngine.playBeep(700, 0.03);
              onSwitchToProMode();
            }}
            className="p-2.5 rounded-xl bg-space-900 hover:bg-space-800 border border-slate-700 text-slate-300 hover:text-cyan-300 text-xs font-mono flex items-center gap-1 transition-colors"
            title="Switch to Advanced NASA Flight Director Console"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline text-[11px]">Pro Telemetry</span>
          </button>

        </div>

      </div>

      {/* Simplified, Kid-Friendly Visual Resource Indicators (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* 1. Oxygen (Air) */}
        <div className="bg-space-900/90 border-2 border-cyan-500/40 rounded-2xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-300 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-base">💨</span>
              <span>BREATHING AIR</span>
            </span>
            <span>{o2Pct}%</span>
          </div>

          <div className="w-full h-3 bg-space-950 rounded-full overflow-hidden border border-slate-800 my-1.5">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${o2Pct < 25 ? 'bg-red-500' : 'bg-cyan-400'}`}
              style={{ width: `${o2Pct}%` }}
            />
          </div>

          <div className="text-[11px] font-mono text-slate-300 flex justify-between">
            <span>{resources.oxygenKg.toFixed(1)} kg tank</span>
            <span className={o2Pct < 25 ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'}>
              {o2Pct < 25 ? 'LOW O₂!' : 'PLENTY'}
            </span>
          </div>
        </div>

        {/* 2. Water (Clean Drink) */}
        <div className="bg-space-900/90 border-2 border-blue-500/40 rounded-2xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-blue-300 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-base">💧</span>
              <span>DRINKING WATER</span>
            </span>
            <span>{waterPct}%</span>
          </div>

          <div className="w-full h-3 bg-space-950 rounded-full overflow-hidden border border-slate-800 my-1.5">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${waterPct < 25 ? 'bg-red-500' : 'bg-blue-400'}`}
              style={{ width: `${waterPct}%` }}
            />
          </div>

          <div className="text-[11px] font-mono text-slate-300 flex justify-between">
            <span>{resources.waterLiters.toFixed(1)} L stored</span>
            <span className="text-cyan-300 font-semibold">
              {resources.waterRecycleRatePct}% Recycled
            </span>
          </div>
        </div>

        {/* 3. Electricity (Battery) */}
        <div className="bg-space-900/90 border-2 border-amber-500/40 rounded-2xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-300 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-base">⚡</span>
              <span>BATTERY POWER</span>
            </span>
            <span>{batteryPct}%</span>
          </div>

          <div className="w-full h-3 bg-space-950 rounded-full overflow-hidden border border-slate-800 my-1.5">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${batteryPct < 20 ? 'bg-red-500' : 'bg-amber-400'}`}
              style={{ width: `${batteryPct}%` }}
            />
          </div>

          <div className="text-[11px] font-mono text-slate-300 flex justify-between">
            <span>{resources.storedEnergyKWh.toFixed(1)} kWh</span>
            <span className={resources.powerGenerationKW >= resources.powerConsumptionKW ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-bold'}>
              {resources.powerGenerationKW >= resources.powerConsumptionKW ? '+GENERATING' : 'DRAWING'}
            </span>
          </div>
        </div>

        {/* 4. Food Supplies */}
        <div className="bg-space-900/90 border-2 border-emerald-500/40 rounded-2xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-300 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🍎</span>
              <span>CREW FOOD</span>
            </span>
            <span>{foodPct}%</span>
          </div>

          <div className="w-full h-3 bg-space-950 rounded-full overflow-hidden border border-slate-800 my-1.5">
            <div 
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${foodPct}%` }}
            />
          </div>

          <div className="text-[11px] font-mono text-slate-300 flex justify-between">
            <span>{Math.round(resources.foodKcal).toLocaleString()} kcal</span>
            <span className="text-emerald-300 font-semibold">Crops Growing</span>
          </div>
        </div>

        {/* 5. Habitat Protection Shield */}
        <div className="bg-space-900/90 border-2 border-purple-500/40 rounded-2xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-300 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🛡️</span>
              <span>BASE SHIELD</span>
            </span>
            <span>{integrityPct}%</span>
          </div>

          <div className="w-full h-3 bg-space-950 rounded-full overflow-hidden border border-slate-800 my-1.5">
            <div 
              className="h-full bg-purple-400 rounded-full transition-all duration-300"
              style={{ width: `${integrityPct}%` }}
            />
          </div>

          <div className="text-[11px] font-mono text-slate-300 flex justify-between">
            <span>Hull Integrity</span>
            <span className="text-purple-300 font-semibold">Pressurized</span>
          </div>
        </div>

      </div>

      {/* Main Interactive Visual Outpost Base Environment */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Interactive Outpost Base (Click any module to inspect or manage!)</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Tap Habitat, Greenhouse, Solar Panels, Water Tank, or Rover
          </span>
        </div>

        <VisualOutpost
          state={state}
          onModuleAction={onModuleAction}
        />
      </div>

      {/* A.S.T.R.O. Friendly Robot Companion */}
      <AstroCompanion
        resources={resources}
        currentSol={currentSol}
        config={config}
        crew={crew}
        masterAlarmActive={masterAlarmActive}
        onOpenHandbook={onOpenHandbook}
      />

      {/* Astronaut Crew Health Roster with friendly badges */}
      <div className="bg-space-900/90 rounded-2xl p-4 border-2 border-slate-800">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 mb-3 border-b border-slate-800 pb-2">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <HeartPulse className="w-4 h-4" />
            <span>Astronaut Crew Health & Happiness</span>
          </span>
          <span className="text-slate-400 text-[11px]">All Astronauts Nominally Pressurized</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {crew.map(astronaut => {
            const isCritical = astronaut.health < 40 || astronaut.morale < 30;
            return (
              <div 
                key={astronaut.id}
                className={`p-3 rounded-xl border text-center transition-all ${
                  astronaut.status === 'incapacitated' ? 'bg-red-950/20 border-red-900 opacity-40' :
                  isCritical ? 'bg-red-950/40 border-red-500 animate-pulse' :
                  'bg-space-950/80 border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 mx-auto mb-1.5 flex items-center justify-center text-lg border border-cyan-400 shadow">
                  {astronaut.role === 'commander' ? '🧑‍🚀' :
                   astronaut.role === 'botanist' ? '🌱' :
                   astronaut.role === 'life_support_engineer' ? '🔧' :
                   astronaut.role === 'flight_surgeon' ? '🩺' :
                   astronaut.role === 'power_specialist' ? '⚡' : '⛏️'}
                </div>
                <div className="text-xs font-bold text-white truncate">{astronaut.name}</div>
                <div className="text-[10px] font-mono text-cyan-400 truncate mb-1.5">
                  {astronaut.roleTitle.split(' ')[0]}
                </div>

                <div className="space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Health:</span>
                    <span className="text-emerald-400 font-bold">{astronaut.health}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Morale:</span>
                    <span className="text-cyan-300 font-bold">{astronaut.morale}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interplanetary Communication Delay Relay Modal */}
      {showCommModal && (
        <CommDelayRelay
          destination={config.destination}
          onReceiveAdvice={onReceiveCommSupply}
          onClose={() => setShowCommModal(false)}
        />
      )}

    </div>
  );
};
