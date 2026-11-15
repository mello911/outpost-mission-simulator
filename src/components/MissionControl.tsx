import React, { useState } from 'react';
import { 
  MissionState, 
  Astronaut, 
  ResourceState 
} from '../types';
import { soundEngine } from '../utils/audio';
import { 
  Play, 
  Pause, 
  FastForward, 
  ChevronRight, 
  AlertTriangle, 
  AlertCircle,
  Wind, 
  Droplets, 
  Zap, 
  Apple, 
  ShieldAlert, 
  HeartPulse, 
  Smile, 
  Activity, 
  Wrench, 
  RotateCcw,
  Volume2,
  VolumeX,
  Radio,
  Flame,
  CheckCircle2,
  Clock,
  BatteryCharging,
  Maximize2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

interface MissionControlProps {
  state: MissionState;
  onAdvanceSol: () => void;
  onTogglePause: () => void;
  onChangeSpeed: (speed: 1 | 2 | 5) => void;
  onSilenceMasterAlarm: () => void;
  onManualAction: (actionType: 'purge_scrubbers' | 'rationing' | 'eva_repair' | 'battery_boost') => void;
  onAbortMission: () => void;
}

export const MissionControl: React.FC<MissionControlProps> = ({
  state,
  onAdvanceSol,
  onTogglePause,
  onChangeSpeed,
  onSilenceMasterAlarm,
  onManualAction,
  onAbortMission,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'consumables' | 'power' | 'vitals' | 'radiation'>('consumables');

  const { resources, crew, currentSol, config, masterAlarmActive, isPaused, simulationSpeed } = state;
  const livingCrew = crew.filter(c => c.status !== 'incapacitated');
  const crewCount = livingCrew.length;

  // Days remaining approximations
  const netO2Delta = resources.oxygenProductionRate - (crewCount * 0.84);
  const o2DaysRemaining = netO2Delta < 0 ? Math.floor(resources.oxygenKg / Math.abs(netO2Delta)) : 999;

  const netWaterDelta = (resources.waterProductionRate) - (resources.waterConsumptionRate);
  const waterDaysRemaining = netWaterDelta < 0 ? Math.floor(resources.waterLiters / Math.abs(netWaterDelta)) : 999;

  const netFoodDelta = resources.foodProductionRate - resources.foodConsumptionRate;
  const foodDaysRemaining = netFoodDelta < 0 ? Math.floor(resources.foodKcal / Math.abs(netFoodDelta)) : 999;

  // Caution & Warning annunciator flags
  const flagO2 = resources.oxygenKg < (crewCount * 1.5);
  const flagWater = resources.waterLiters < (crewCount * 4.0);
  const flagPower = resources.storedEnergyKWh < 20 || (resources.powerGenerationKW < resources.powerConsumptionKW && resources.storedEnergyKWh < 50);
  const flagPressure = resources.habitatIntegrityPct < 40;
  const flagRadiation = resources.ambientRadiationMSvPerSol > 1.2;
  const flagCrew = crew.some(c => c.status === 'critical' || c.status === 'incapacitated');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner: Master Caution & Warning Matrix & Time Controls */}
      <div className="hud-panel rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Sol Counter & Status Indicator */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                {config.destination === 'mars' ? 'MARS // ARES BASE' : 'MOON // ARTEMIS BASE'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-display font-extrabold text-white tracking-wider">
                  SOL {currentSol.toString().padStart(3, '0')}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  / {config.targetSolDuration}
                </span>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-slate-800 hidden sm:block" />

            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">MISSION PROGRESS</span>
              <div className="w-36 h-2 bg-space-950 rounded-full overflow-hidden border border-slate-800 mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (currentSol / config.targetSolDuration) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Center: Master Caution & Warning Annunciator Matrix (Apollo / Shuttle Style) */}
          <div className="flex items-center gap-1.5 bg-space-950 p-2 rounded-xl border border-slate-800 overflow-x-auto">
            
            <div className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-colors ${
              flagO2 ? 'bg-red-950 text-red-400 border border-red-500/60 animate-warning' : 'bg-space-900 text-slate-600'
            }`}>
              O₂ SYS
            </div>

            <div className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-colors ${
              flagWater ? 'bg-red-950 text-red-400 border border-red-500/60 animate-warning' : 'bg-space-900 text-slate-600'
            }`}>
              H₂O REC
            </div>

            <div className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-colors ${
              flagPower ? 'bg-amber-950 text-amber-400 border border-amber-500/60 animate-caution' : 'bg-space-900 text-slate-600'
            }`}>
              POWER
            </div>

            <div className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-colors ${
              flagPressure ? 'bg-red-950 text-red-400 border border-red-500/60 animate-warning' : 'bg-space-900 text-slate-600'
            }`}>
              HULL PRES
            </div>

            <div className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-colors ${
              flagRadiation ? 'bg-amber-950 text-amber-400 border border-amber-500/60 animate-caution' : 'bg-space-900 text-slate-600'
            }`}>
              RAD ALARM
            </div>

            <div className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-colors ${
              flagCrew ? 'bg-red-950 text-red-400 border border-red-500/60 animate-warning' : 'bg-space-900 text-slate-600'
            }`}>
              CREW MED
            </div>

            {masterAlarmActive && (
              <button
                onClick={() => {
                  soundEngine.playBeep(440, 0.05);
                  onSilenceMasterAlarm();
                }}
                className="ml-2 px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-bold tracking-wider animate-pulse transition-colors"
                title="Silence Active Master Alarm"
              >
                ACK ALARM
              </button>
            )}
          </div>

          {/* Right: Simulation Controls (Play/Pause, Speeds, Next Sol) */}
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
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Play/Pause */}
            <button
              onClick={() => {
                soundEngine.playBeep(isPaused ? 880 : 440, 0.04);
                onTogglePause();
              }}
              className={`p-2.5 rounded-xl border transition-all ${
                isPaused
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
              }`}
              title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>

            {/* Advance Single Sol */}
            <button
              onClick={() => {
                soundEngine.playSolDayChime();
                onAdvanceSol();
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-mono font-bold text-xs tracking-wider shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02]"
            >
              <span>+1 SOL</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>

          </div>

        </div>
      </div>

      {/* Primary Resource Telemetry Grid (6 Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Oxygen Card */}
        <div className="hud-panel p-3.5 rounded-xl border border-slate-700/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Wind className="w-3.5 h-3.5" />
              <span>OXYGEN (O₂)</span>
            </span>
            <span className="text-slate-500">kg</span>
          </div>

          <div className="text-xl font-bold font-mono text-white mb-1">
            {resources.oxygenKg.toFixed(1)}
          </div>

          <div className="w-full h-1.5 bg-space-950 rounded-full overflow-hidden border border-slate-800 mb-2">
            <div 
              className={`h-full rounded-full transition-all ${
                resources.oxygenKg < (crewCount * 1.5) ? 'bg-red-500' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, (resources.oxygenKg / resources.maxOxygenKg) * 100)}%` }}
            />
          </div>

          <div className="text-[10px] font-mono flex justify-between items-center text-slate-400">
            <span>Burn: {(crewCount * 0.84).toFixed(1)}/Sol</span>
            <span className={o2DaysRemaining < 5 ? 'text-red-400 font-bold' : 'text-slate-400'}>
              {o2DaysRemaining > 200 ? 'STABLE' : `${o2DaysRemaining}d left`}
            </span>
          </div>
        </div>

        {/* Water Card */}
        <div className="hud-panel p-3.5 rounded-xl border border-slate-700/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-blue-400 font-semibold">
              <Droplets className="w-3.5 h-3.5" />
              <span>WATER (H₂O)</span>
            </span>
            <span className="text-slate-500">Liters</span>
          </div>

          <div className="text-xl font-bold font-mono text-white mb-1">
            {resources.waterLiters.toFixed(1)}
          </div>

          <div className="w-full h-1.5 bg-space-950 rounded-full overflow-hidden border border-slate-800 mb-2">
            <div 
              className={`h-full rounded-full transition-all ${
                resources.waterLiters < (crewCount * 4) ? 'bg-red-500' : 'bg-blue-400'
              }`}
              style={{ width: `${Math.min(100, (resources.waterLiters / resources.maxWaterLiters) * 100)}%` }}
            />
          </div>

          <div className="text-[10px] font-mono flex justify-between items-center text-slate-400">
            <span>ECLSS: {resources.waterRecycleRatePct}%</span>
            <span className={waterDaysRemaining < 5 ? 'text-red-400 font-bold' : 'text-slate-400'}>
              {waterDaysRemaining > 200 ? 'STABLE' : `${waterDaysRemaining}d left`}
            </span>
          </div>
        </div>

        {/* Food Calories Card */}
        <div className="hud-panel p-3.5 rounded-xl border border-slate-700/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Apple className="w-3.5 h-3.5" />
              <span>FOOD RATIONS</span>
            </span>
            <span className="text-slate-500">kcal</span>
          </div>

          <div className="text-xl font-bold font-mono text-white mb-1">
            {Math.round(resources.foodKcal).toLocaleString()}
          </div>

          <div className="w-full h-1.5 bg-space-950 rounded-full overflow-hidden border border-slate-800 mb-2">
            <div 
              className="h-full bg-amber-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, (resources.foodKcal / resources.maxFoodKcal) * 100)}%` }}
            />
          </div>

          <div className="text-[10px] font-mono flex justify-between items-center text-slate-400">
            <span>Yield: +{resources.foodProductionRate}</span>
            <span className={foodDaysRemaining < 5 ? 'text-red-400 font-bold' : 'text-slate-400'}>
              {foodDaysRemaining > 200 ? 'STABLE' : `${foodDaysRemaining}d left`}
            </span>
          </div>
        </div>

        {/* Power Grid Card */}
        <div className="hud-panel p-3.5 rounded-xl border border-slate-700/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>POWER GRID</span>
            </span>
            <span className="text-slate-500">kWh</span>
          </div>

          <div className="text-xl font-bold font-mono text-white mb-1">
            {resources.storedEnergyKWh.toFixed(1)}
          </div>

          <div className="w-full h-1.5 bg-space-950 rounded-full overflow-hidden border border-slate-800 mb-2">
            <div 
              className={`h-full rounded-full transition-all ${
                resources.storedEnergyKWh < 20 ? 'bg-red-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (resources.storedEnergyKWh / resources.maxBatteryStorageKWh) * 100)}%` }}
            />
          </div>

          <div className="text-[10px] font-mono flex justify-between items-center text-slate-400">
            <span>Gen: {resources.powerGenerationKW} kW</span>
            <span className={resources.powerGenerationKW < resources.powerConsumptionKW ? 'text-amber-400' : 'text-emerald-400'}>
              Load: {resources.powerConsumptionKW} kW
            </span>
          </div>
        </div>

        {/* Habitat Integrity Card */}
        <div className="hud-panel p-3.5 rounded-xl border border-slate-700/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-purple-400 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>HULL INTEGRITY</span>
            </span>
            <span className="text-slate-500">%</span>
          </div>

          <div className="text-xl font-bold font-mono text-white mb-1">
            {resources.habitatIntegrityPct}%
          </div>

          <div className="w-full h-1.5 bg-space-950 rounded-full overflow-hidden border border-slate-800 mb-2">
            <div 
              className={`h-full rounded-full transition-all ${
                resources.habitatIntegrityPct < 30 ? 'bg-red-500' : 'bg-purple-400'
              }`}
              style={{ width: `${resources.habitatIntegrityPct}%` }}
            />
          </div>

          <div className="text-[10px] font-mono flex justify-between items-center text-slate-400">
            <span>Cabin: 101.3 kPa</span>
            <span className="text-emerald-400">NOMINAL</span>
          </div>
        </div>

        {/* Radiation Exposure Card */}
        <div className="hud-panel p-3.5 rounded-xl border border-slate-700/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-red-400 font-semibold">
              <Flame className="w-3.5 h-3.5" />
              <span>RAD DOSE</span>
            </span>
            <span className="text-slate-500">mSv</span>
          </div>

          <div className="text-xl font-bold font-mono text-white mb-1">
            {resources.accumulatedMissionDoseMSv.toFixed(1)}
          </div>

          <div className="w-full h-1.5 bg-space-950 rounded-full overflow-hidden border border-slate-800 mb-2">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (resources.accumulatedMissionDoseMSv / 600) * 100)}%` }}
            />
          </div>

          <div className="text-[10px] font-mono flex justify-between items-center text-slate-400">
            <span>Flux: {resources.ambientRadiationMSvPerSol.toFixed(2)}/Sol</span>
            <span className="text-slate-400">Limit: 600</span>
          </div>
        </div>

      </div>

      {/* Middle Row: Left Astronaut Roster (4 cols) & Right Telemetry Recharts (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Astronaut Crew Health & Morale Vitals */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4" />
              <span>Astronaut Vitals ({livingCrew.length} Active)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              NASA Career Rad Cap: 600 mSv
            </span>
          </div>

          <div className="space-y-2.5">
            {crew.map(astronaut => {
              const isDead = astronaut.status === 'incapacitated';
              return (
                <div
                  key={astronaut.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isDead
                      ? 'border-red-900 bg-red-950/20 opacity-50'
                      : astronaut.status === 'critical'
                        ? 'border-red-500 bg-red-950/30 animate-pulse'
                        : 'border-slate-800 bg-space-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{astronaut.name}</span>
                        <span className="text-[10px] font-mono text-cyan-400 font-normal">
                          [{astronaut.roleTitle.split(' ')[0]}]
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        astronaut.status === 'nominal' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                        astronaut.status === 'strained' ? 'bg-amber-950 text-amber-400 border border-amber-500/40' :
                        astronaut.status === 'critical' ? 'bg-red-950 text-red-400 border border-red-500/60' :
                        'bg-slate-900 text-slate-500'
                      }`}>
                        {astronaut.status}
                      </span>
                    </div>
                  </div>

                  {/* Dual Vitals Bars: Health & Morale */}
                  <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>HEALTH</span>
                        <span className={astronaut.health < 40 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {astronaut.health}%
                        </span>
                      </div>
                      <div className="w-full h-1 bg-space-950 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            astronaut.health < 40 ? 'bg-red-500' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${astronaut.health}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>MORALE</span>
                        <span className={astronaut.morale < 35 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                          {astronaut.morale}%
                        </span>
                      </div>
                      <div className="w-full h-1 bg-space-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 rounded-full transition-all"
                          style={{ width: `${astronaut.morale}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Radiation Cumulative */}
                  <div className="mt-1.5 flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Rad Dose: {astronaut.radiationDoseMSv.toFixed(1)} mSv</span>
                    <span className="text-slate-400 truncate max-w-[170px]">{astronaut.perk.split(':')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flight Director Tactical Interventions Panel */}
          <div className="hud-panel p-4 rounded-xl border border-slate-700/80 mt-4">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-cyan-400 font-semibold mb-3">
              <Wrench className="w-3.5 h-3.5" />
              <span>Flight Director Operations</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  soundEngine.playBeep(700, 0.04);
                  onManualAction('purge_scrubbers');
                }}
                disabled={resources.storedEnergyKWh < 10}
                className="p-2 rounded-lg bg-space-950 hover:bg-space-800 border border-slate-700 hover:border-cyan-500/40 text-left transition-colors disabled:opacity-40"
              >
                <div className="text-[11px] font-bold text-white">Purge Scrubbers</div>
                <div className="text-[9px] font-mono text-slate-400">-10 kWh • Purifies O₂</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playBeep(700, 0.04);
                  onManualAction('rationing');
                }}
                className="p-2 rounded-lg bg-space-950 hover:bg-space-800 border border-slate-700 hover:border-cyan-500/40 text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-white">Rationing Order</div>
                <div className="text-[9px] font-mono text-slate-400">-25% Food/H₂O burn</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playBeep(700, 0.04);
                  onManualAction('eva_repair');
                }}
                disabled={resources.storedEnergyKWh < 15 || resources.oxygenKg < 2}
                className="p-2 rounded-lg bg-space-950 hover:bg-space-800 border border-slate-700 hover:border-cyan-500/40 text-left transition-colors disabled:opacity-40"
              >
                <div className="text-[11px] font-bold text-white">EVA Hull Repair</div>
                <div className="text-[9px] font-mono text-slate-400">+15% Integrity • -15 kWh</div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playBeep(700, 0.04);
                  onManualAction('battery_boost');
                }}
                className="p-2 rounded-lg bg-space-950 hover:bg-space-800 border border-slate-700 hover:border-cyan-500/40 text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-white">Aux Fuel Cell</div>
                <div className="text-[9px] font-mono text-slate-400">+30 kWh Reserve</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Recharts Interactive Telemetry (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              <span>Mission Telemetry & Historical Trends</span>
            </span>

            {/* Chart View Tabs */}
            <div className="flex bg-space-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  soundEngine.playBeep(600, 0.02);
                  setActiveChartTab('consumables');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  activeChartTab === 'consumables' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Consumables
              </button>
              <button
                onClick={() => {
                  soundEngine.playBeep(600, 0.02);
                  setActiveChartTab('power');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  activeChartTab === 'power' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Power Grid
              </button>
              <button
                onClick={() => {
                  soundEngine.playBeep(600, 0.02);
                  setActiveChartTab('vitals');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  activeChartTab === 'vitals' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Crew Vitals
              </button>
              <button
                onClick={() => {
                  soundEngine.playBeep(600, 0.02);
                  setActiveChartTab('radiation');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  activeChartTab === 'radiation' ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Radiation
              </button>
            </div>
          </div>

          {/* Chart Display Area */}
          <div className="hud-panel p-4 rounded-xl border border-slate-700/80 h-72">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === 'consumables' ? (
                <LineChart data={state.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="sol" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} label={{ value: 'SOL', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} 
                  />
                  <Line type="monotone" dataKey="oxygenKg" stroke="#22d3ee" name="Oxygen (kg)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="waterLiters" stroke="#3b82f6" name="Water (L)" strokeWidth={2} dot={false} />
                </LineChart>
              ) : activeChartTab === 'power' ? (
                <AreaChart data={state.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="sol" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} 
                  />
                  <Area type="monotone" dataKey="storedEnergyKWh" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Battery (kWh)" />
                </AreaChart>
              ) : activeChartTab === 'vitals' ? (
                <LineChart data={state.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="sol" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} 
                  />
                  <Line type="monotone" dataKey="avgHealth" stroke="#10b981" name="Avg Health %" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="avgMorale" stroke="#38bdf8" name="Avg Morale %" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="integrityPct" stroke="#a855f7" name="Hull Integrity %" strokeWidth={2} dot={false} />
                </LineChart>
              ) : (
                <LineChart data={state.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="sol" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} 
                  />
                  <Line type="monotone" dataKey="dailyRadiationMSv" stroke="#ef4444" name="Daily Rad (mSv)" strokeWidth={2} dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* CAPCOM Live Telemetry Log Feed */}
          <div className="hud-panel p-4 rounded-xl border border-slate-700/80">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 mb-2 border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <Radio className="w-3.5 h-3.5" />
                <span>CAPCOM Mission Telemetry Feed</span>
              </span>
              <span className="text-[10px] text-slate-500">Live Sol Log</span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {state.logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`text-[11px] font-mono p-2 rounded border ${
                    log.type === 'emergency' ? 'bg-red-950/40 border-red-500/40 text-red-300' :
                    log.type === 'warning' ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' :
                    log.type === 'milestone' ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300' :
                    log.type === 'action' ? 'bg-blue-950/40 border-blue-500/40 text-blue-300' :
                    'bg-space-950/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>SOL {log.sol.toString().padStart(3, '0')}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="font-semibold">{log.message}</div>
                  {log.detail && (
                    <div className="text-[10px] text-slate-400 mt-0.5">{log.detail}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
