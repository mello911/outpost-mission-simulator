import React, { useState } from 'react';
import { MissionState, ModuleCategory } from '../types';
import { soundEngine } from '../utils/audio';
import { 
  Home, 
  Wind, 
  Zap, 
  ShieldAlert, 
  Apple, 
  Droplets, 
  Wrench, 
  CheckCircle2, 
  Sparkles, 
  Info,
  X,
  Compass,
  Activity
} from 'lucide-react';

interface VisualOutpostProps {
  state: MissionState;
  onModuleAction?: (actionType: 'clean_solar' | 'tend_crops' | 'flush_water' | 'inspect_hab' | 'rover_scout') => void;
}

export type OutpostZone = 'habitat' | 'greenhouse' | 'power' | 'water' | 'shield' | 'rover';

export const VisualOutpost: React.FC<VisualOutpostProps> = ({ state, onModuleAction }) => {
  const [selectedZone, setSelectedZone] = useState<OutpostZone | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const { resources, config, configuration, currentSol } = state;
  const isMars = config.destination === 'mars';

  const handleZoneClick = (zone: OutpostZone) => {
    soundEngine.playBeep(840, 0.04);
    setSelectedZone(zone);
    setActionFeedback(null);
  };

  const handlePerformAction = (actionType: 'clean_solar' | 'tend_crops' | 'flush_water' | 'inspect_hab' | 'rover_scout') => {
    soundEngine.playQuindarTone(true);
    if (onModuleAction) {
      onModuleAction(actionType);
    }
    let feedback = '';
    if (actionType === 'clean_solar') feedback = '✨ Solar panels brushed! Dust removed, restoring peak solar power generation!';
    if (actionType === 'tend_crops') feedback = '🌱 Nutritive mist sprayed! Sweet potatoes and algae crops are thriving!';
    if (actionType === 'flush_water') feedback = '💧 Centrifuge filter flushed! Water reclamation efficiency running at maximum!';
    if (actionType === 'inspect_hab') feedback = '🛡️ Airlock seals vacuum-tested and micro-abrasions sealed!';
    if (actionType === 'rover_scout') feedback = '🚜 Rover deployed! Radar scanned 500m of terrain for subsurface ice deposits!';
    setActionFeedback(feedback);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl bg-space-950">
      
      {/* Sky & Space Landscape Header Banner */}
      <div className={`relative h-64 sm:h-72 w-full overflow-hidden select-none transition-colors ${
        isMars 
          ? 'bg-gradient-to-b from-[#180805] via-[#3d130a] to-[#872e12]' 
          : 'bg-gradient-to-b from-[#05070e] via-[#0d1322] to-[#1e293b]'
      }`}>
        
        {/* Stars and Moons */}
        <div className="absolute inset-0 opacity-80 pointer-events-none">
          <div className="absolute top-4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" />
          <div className="absolute top-10 left-1/3 w-1.5 h-1.5 bg-cyan-200 rounded-full" />
          <div className="absolute top-6 right-1/4 w-1 h-1 bg-amber-200 rounded-full" />
          <div className="absolute top-14 right-1/3 w-1 h-1 bg-white rounded-full" />
          
          {/* Planetary moon in sky: Phobos (Mars) or Earth (Moon) */}
          {isMars ? (
            <div className="absolute top-6 right-12 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-stone-600 via-stone-400 to-amber-200 border border-stone-500 shadow-lg shadow-orange-900/30 opacity-90" />
              <span className="text-[9px] font-mono text-orange-200/80 mt-1">Phobos</span>
            </div>
          ) : (
            <div className="absolute top-6 right-12 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 via-cyan-400 to-white border border-cyan-300 shadow-xl shadow-cyan-500/40 animate-pulse-slow" />
              <span className="text-[9px] font-mono text-cyan-300 mt-1">Home Earth</span>
            </div>
          )}
        </div>

        {/* Distant Hills / Crater Rim */}
        <div className="absolute bottom-16 inset-x-0 pointer-events-none">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20 opacity-70">
            <path 
              d={isMars 
                ? "M0,90 Q200,30 450,70 T900,40 T1200,80 L1200,120 L0,120 Z" 
                : "M0,100 Q300,50 600,85 T1100,60 T1200,90 L1200,120 L0,120 Z"
              } 
              fill={isMars ? "#5a1f0d" : "#131a29"} 
            />
          </svg>
        </div>

        {/* Foreground Terrain Floor */}
        <div className={`absolute bottom-0 inset-x-0 h-20 border-t transition-colors ${
          isMars 
            ? 'bg-gradient-to-t from-[#8c3114] to-[#a83d1c] border-orange-500/50' 
            : 'bg-gradient-to-t from-[#20293a] to-[#334155] border-cyan-500/40'
        }`}>
          {/* Regolith terrain texture dots */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
        </div>

        {/* Interactive Outpost Modules Rendered as Visual Game Entities */}
        <div className="absolute bottom-6 inset-x-4 sm:inset-x-8 flex items-end justify-between z-10">
          
          {/* 1. Solar Panels or Nuclear Reactor */}
          <div 
            onClick={() => handleZoneClick('power')}
            className="group cursor-pointer flex flex-col items-center transition-transform hover:-translate-y-1.5"
            title="Click Power Grid to inspect!"
          >
            <div className="bg-space-950/80 px-2 py-0.5 rounded-full border border-amber-400/60 text-[10px] font-mono font-bold text-amber-300 mb-1 group-hover:scale-110 shadow">
              ⚡ POWER
            </div>
            {/* Visual Solar Arrays Wing */}
            <div className="relative">
              <div className="w-16 sm:w-20 h-16 rounded-xl bg-gradient-to-tr from-blue-950 via-blue-900 to-cyan-800 border-2 border-amber-400/80 shadow-lg p-1 grid grid-cols-2 gap-1 group-hover:border-amber-300">
                <div className="bg-blue-900/60 rounded border border-cyan-500/40" />
                <div className="bg-blue-900/60 rounded border border-cyan-500/40" />
                <div className="bg-blue-900/60 rounded border border-cyan-500/40" />
                <div className="bg-blue-900/60 rounded border border-cyan-500/40" />
              </div>
              <div className="w-2 h-6 bg-slate-600 mx-auto -mt-1" />
            </div>
          </div>

          {/* 2. Water Recycling Station */}
          <div 
            onClick={() => handleZoneClick('water')}
            className="group cursor-pointer flex flex-col items-center transition-transform hover:-translate-y-1.5"
            title="Click Water Reclamation Station to inspect!"
          >
            <div className="bg-space-950/80 px-2 py-0.5 rounded-full border border-blue-400/60 text-[10px] font-mono font-bold text-blue-300 mb-1 group-hover:scale-110 shadow">
              💧 WATER RECYCLER
            </div>
            {/* Water Tank Vessel */}
            <div className="relative">
              <div className="w-14 sm:w-16 h-18 rounded-2xl bg-gradient-to-b from-slate-700 via-blue-950 to-space-950 border-2 border-blue-400 shadow-lg p-1.5 flex flex-col justify-between items-center group-hover:border-blue-300">
                {/* Water Level Window */}
                <div className="w-full h-8 bg-blue-950 rounded-lg border border-blue-400/50 overflow-hidden relative">
                  <div 
                    className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-500" 
                    style={{ height: `${Math.min(100, (resources.waterLiters / resources.maxWaterLiters) * 100)}%` }}
                  />
                  <div className="absolute top-1 left-2 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping" />
                </div>
                <Droplets className="w-3.5 h-3.5 text-cyan-300" />
              </div>
            </div>
          </div>

          {/* 3. Main Astronaut Habitat Dome (Centerpiece) */}
          <div 
            onClick={() => handleZoneClick('habitat')}
            className="group cursor-pointer flex flex-col items-center transition-transform hover:-translate-y-1.5"
            title="Click Main Habitat to inspect crew quarters!"
          >
            <div className="bg-space-950/90 px-3 py-0.5 rounded-full border border-cyan-400 text-[11px] font-mono font-bold text-cyan-300 mb-1 group-hover:scale-110 shadow-lg">
              🏠 MAIN HABITAT
            </div>
            {/* Pressurized Habitat Dome with windows & airlock */}
            <div className="relative">
              <div className="w-28 sm:w-36 h-22 sm:h-26 rounded-t-full bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border-3 border-cyan-400 shadow-2xl p-2 flex flex-col items-center justify-between group-hover:border-cyan-300 relative overflow-hidden">
                {/* Radiation Shimmer Effect Overlay */}
                <div className="absolute inset-0 bg-cyan-400/10 pointer-events-none animate-pulse-slow" />
                
                {/* Observation Windows */}
                <div className="flex gap-2 mt-2">
                  <div className="w-4 h-4 rounded-full bg-space-950 border border-cyan-400 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                  </div>
                  <div className="w-4 h-4 rounded-full bg-space-950 border border-cyan-400 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-300" />
                  </div>
                </div>

                {/* Pressure Airlock Door */}
                <div className="w-10 sm:w-12 h-8 bg-space-900 border-2 border-slate-700 rounded-t-lg flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Food Greenhouse Biome */}
          <div 
            onClick={() => handleZoneClick('greenhouse')}
            className="group cursor-pointer flex flex-col items-center transition-transform hover:-translate-y-1.5"
            title="Click Greenhouse Farm to inspect crops!"
          >
            <div className="bg-space-950/80 px-2 py-0.5 rounded-full border border-emerald-400/60 text-[10px] font-mono font-bold text-emerald-300 mb-1 group-hover:scale-110 shadow">
              🌱 GREENHOUSE
            </div>
            {/* Hydroponic Pod */}
            <div className="relative">
              <div className="w-18 sm:w-22 h-18 rounded-t-3xl bg-gradient-to-b from-purple-950 via-emerald-950 to-space-950 border-2 border-emerald-400 shadow-lg p-1.5 flex flex-col justify-between items-center group-hover:border-emerald-300">
                {/* Purple LED Grow Light bar */}
                <div className="w-full h-1.5 bg-fuchsia-400 rounded-full shadow-lg shadow-fuchsia-500/50 animate-pulse" />
                {/* Plant icons */}
                <div className="flex gap-1.5 items-end mb-1">
                  <span className="text-sm">🌿</span>
                  <span className="text-base">🌾</span>
                  <span className="text-sm">🌱</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Surface Scouting Rover */}
          <div 
            onClick={() => handleZoneClick('rover')}
            className="group cursor-pointer flex flex-col items-center transition-transform hover:-translate-y-1.5"
            title="Click Planetary Rover to launch scouting mission!"
          >
            <div className="bg-space-950/80 px-2 py-0.5 rounded-full border border-orange-400/60 text-[10px] font-mono font-bold text-orange-300 mb-1 group-hover:scale-110 shadow">
              🚜 ROVER
            </div>
            {/* Robotic Buggy */}
            <div className="relative">
              <div className="w-14 sm:w-16 h-10 bg-gradient-to-r from-slate-700 via-orange-900 to-slate-800 border-2 border-orange-400 rounded-lg p-1 flex items-center justify-between shadow-lg group-hover:border-orange-300">
                <div className="w-2 h-2 rounded bg-cyan-400" />
                <div className="w-1 h-3 bg-slate-400 rounded-full" />
              </div>
              {/* Rover Heavy-Duty Wheels */}
              <div className="flex justify-between w-full px-0.5 -mt-1">
                <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600 animate-spin" />
                <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600 animate-spin" />
              </div>
            </div>
          </div>

        </div>

        {/* Environmental Info Tag in corner */}
        <div className="absolute top-3 left-4 bg-space-950/90 border border-cyan-500/30 px-3 py-1 rounded-full text-[11px] font-mono text-cyan-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isMars ? 'MARS // ARES BASE' : 'MOON // ARTEMIS BASE'}</span>
          <span className="text-slate-500">•</span>
          <span>SOL {currentSol}</span>
        </div>

      </div>

      {/* Interactive Module Inspection Drawer when a module is clicked */}
      {selectedZone && (
        <div className="p-4 sm:p-5 bg-space-900 border-t-2 border-cyan-500/40 animate-fade-in">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-space-950 border border-cyan-500/40 text-cyan-400">
                {selectedZone === 'habitat' && <Home className="w-5 h-5 text-cyan-400" />}
                {selectedZone === 'greenhouse' && <Apple className="w-5 h-5 text-emerald-400" />}
                {selectedZone === 'power' && <Zap className="w-5 h-5 text-amber-400" />}
                {selectedZone === 'water' && <Droplets className="w-5 h-5 text-blue-400" />}
                {selectedZone === 'rover' && <Compass className="w-5 h-5 text-orange-400" />}
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  {selectedZone === 'habitat' && 'Main Astronaut Habitat Shell'}
                  {selectedZone === 'greenhouse' && 'Aeroponic & Hydroponic Greenhouse Farm'}
                  {selectedZone === 'power' && 'Outpost Power Station & Grid'}
                  {selectedZone === 'water' && 'Water Reclamation & Purification Unit'}
                  {selectedZone === 'rover' && 'Surface Autonomous Exploration Rover'}
                </h3>
                <p className="text-xs font-mono text-cyan-300">
                  {selectedZone === 'habitat' && 'Protects crew, keeps cabin air pressurized at 101.3 kPa, and provides warm sleeping quarters.'}
                  {selectedZone === 'greenhouse' && 'Grows fresh vitamin-rich space potatoes, lettuce, and microalgae for our astronauts.'}
                  {selectedZone === 'power' && 'Powers life-support heaters, pumps, computers, and greenhouse grow lights 24 hours a day.'}
                  {selectedZone === 'water' && 'Recycles 98% of all water from breath moisture and handwashing back into clean drinking water.'}
                  {selectedZone === 'rover' && 'Equipped with ground-penetrating radar to search for buried ice sheets and useful minerals.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedZone(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs font-mono">
            {selectedZone === 'habitat' && (
              <>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">HULL STRENGTH</span>
                  <span className="text-cyan-300 font-bold">{resources.habitatIntegrityPct}%</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">CABIN PRESSURE</span>
                  <span className="text-emerald-400 font-bold">101.3 kPa (Nominal)</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">RADIATION SHIELD</span>
                  <span className="text-purple-300 font-bold">{resources.radiationShieldingPct}% Protected</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">AIR SUPPLY</span>
                  <span className="text-cyan-400 font-bold">{resources.oxygenKg.toFixed(1)} kg</span>
                </div>
              </>
            )}

            {selectedZone === 'greenhouse' && (
              <>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">DAILY HARVEST</span>
                  <span className="text-emerald-400 font-bold">+{resources.foodProductionRate} kcal/Sol</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">WATER USE</span>
                  <span className="text-blue-400 font-bold">~2.5 L/Sol</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">FOOD RESERVES</span>
                  <span className="text-amber-300 font-bold">{Math.round(resources.foodKcal).toLocaleString()} kcal</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">CROP STATUS</span>
                  <span className="text-emerald-300 font-bold">Healthy & Growing</span>
                </div>
              </>
            )}

            {selectedZone === 'power' && (
              <>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">BATTERY STORED</span>
                  <span className="text-amber-400 font-bold">{resources.storedEnergyKWh.toFixed(1)} kWh</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">CURRENT OUTPUT</span>
                  <span className="text-emerald-400 font-bold">{resources.powerGenerationKW} kW</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">HABITAT LOAD</span>
                  <span className="text-blue-300 font-bold">{resources.powerConsumptionKW} kW</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">SUNLIGHT FACTOR</span>
                  <span className="text-amber-300 font-bold">{Math.round(resources.solarEfficiencyFactor * 100)}%</span>
                </div>
              </>
            )}

            {selectedZone === 'water' && (
              <>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">RECOVERY RATE</span>
                  <span className="text-cyan-400 font-bold">{resources.waterRecycleRatePct}% Closed Loop</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">STORED WATER</span>
                  <span className="text-blue-400 font-bold">{resources.waterLiters.toFixed(1)} Liters</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">CREW DEMAND</span>
                  <span className="text-slate-300 font-bold">{resources.waterConsumptionRate.toFixed(1)} L/Sol</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">PURIFICATION</span>
                  <span className="text-emerald-400 font-bold">VCD Centrifuge Active</span>
                </div>
              </>
            )}

            {selectedZone === 'rover' && (
              <>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">ROVER BATTERY</span>
                  <span className="text-emerald-400 font-bold">100% Ready</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">RADAR SCAN</span>
                  <span className="text-cyan-300 font-bold">Perimeter Clear</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">SURFACE MISSION</span>
                  <span className="text-amber-400 font-bold">ISRU Prospecting</span>
                </div>
                <div className="bg-space-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">CARGO COMPARTMENT</span>
                  <span className="text-slate-300 font-bold">Empty (Ready)</span>
                </div>
              </>
            )}
          </div>

          {/* Interactive Junior Astronaut Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div>
              {selectedZone === 'power' && (
                <button
                  onClick={() => handlePerformAction('clean_solar')}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-300 font-mono text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Brush Off Martian Dust (Boosts Solar Output)</span>
                </button>
              )}

              {selectedZone === 'greenhouse' && (
                <button
                  onClick={() => handlePerformAction('tend_crops')}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <Apple className="w-4 h-4" />
                  <span>Water Crops & Harvest Microgreens</span>
                </button>
              )}

              {selectedZone === 'water' && (
                <button
                  onClick={() => handlePerformAction('flush_water')}
                  className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/60 text-blue-300 font-mono text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <Droplets className="w-4 h-4" />
                  <span>Flush Distillation Filter (Optimizes Recycling)</span>
                </button>
              )}

              {selectedZone === 'habitat' && (
                <button
                  onClick={() => handlePerformAction('inspect_hab')}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-300 font-mono text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Inspect Airlock & Patch Hull Pressure</span>
                </button>
              )}

              {selectedZone === 'rover' && (
                <button
                  onClick={() => handlePerformAction('rover_scout')}
                  className="px-4 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/60 text-orange-300 font-mono text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <Compass className="w-4 h-4" />
                  <span>Send Rover on Ice Scouting Drive</span>
                </button>
              )}
            </div>

            {actionFeedback && (
              <span className="text-xs font-mono font-semibold text-emerald-400 animate-pulse">
                {actionFeedback}
              </span>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
