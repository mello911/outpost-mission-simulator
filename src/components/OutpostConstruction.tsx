import React, { useState } from 'react';
import { 
  MissionSetupConfig, 
  OutpostConfiguration, 
  ModuleCategory, 
  OutpostModuleTier 
} from '../types';
import { MODULE_CATEGORIES, OUTPOST_MODULES } from '../data/modules';
import { DESTINATIONS } from '../data/destinations';
import { soundEngine } from '../utils/audio';
import { 
  DollarSign, 
  Weight, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  Check, 
  AlertTriangle,
  Home,
  Wind,
  ShieldAlert,
  Apple,
  Droplets,
  Layers,
  Sparkles
} from 'lucide-react';

interface OutpostConstructionProps {
  setupConfig: MissionSetupConfig;
  onLaunchMission: (configuration: OutpostConfiguration) => void;
  onBack: () => void;
}

export const OutpostConstruction: React.FC<OutpostConstructionProps> = ({
  setupConfig,
  onLaunchMission,
  onBack,
}) => {
  // Default balanced baseline configuration
  const [config, setConfig] = useState<OutpostConfiguration>({
    habitat: 'hab_transhab',
    life_support: 'ls_sabatier_moxie',
    power: 'pow_solar_fuel_cell',
    radiation: 'rad_polyethylene_water',
    food: 'food_hydroponic_greenhouse',
    water: 'wat_vapor_compression',
  });

  const [activeCategory, setActiveCategory] = useState<ModuleCategory>('habitat');

  const dest = DESTINATIONS[setupConfig.destination];

  // Helper to fetch current module object
  const getSelectedModule = (category: ModuleCategory): OutpostModuleTier => {
    const list = OUTPOST_MODULES[category];
    return list.find(m => m.id === config[category]) || list[0];
  };

  // Calculate current totals
  const selectedModules = (Object.keys(config) as ModuleCategory[]).map(cat => getSelectedModule(cat));
  
  const totalCost = selectedModules.reduce((acc, m) => acc + m.costMillionUSD, 0);
  const totalMass = selectedModules.reduce((acc, m) => acc + m.massKg, 0);
  const totalBudget = setupConfig.startingBudgetMillionUSD;
  const remainingBudget = totalBudget - totalCost;
  const isOverBudget = remainingBudget < 0;

  // Power demand and generation calculations
  const powerDemand = selectedModules
    .filter(m => m.category !== 'power')
    .reduce((acc, m) => acc + m.powerDrawKW, 0);
  
  const powerGenModule = getSelectedModule('power');
  const baseGen = powerGenModule.statsEffect.powerGenerationKW || 25;
  const netPowerBalance = Math.round((baseGen - powerDemand) * 10) / 10;

  const handleSelectModule = (cat: ModuleCategory, moduleId: string) => {
    soundEngine.playBeep(840, 0.03);
    setConfig(prev => ({
      ...prev,
      [cat]: moduleId
    }));
  };

  const handleConfirmLaunch = () => {
    if (isOverBudget) {
      soundEngine.playEmergencyKlaxon();
      alert(`Budget exceeded by $${Math.abs(remainingBudget)}M! Please select lower tier modules or optimize your allocation.`);
      return;
    }
    soundEngine.playQuindarTone(true);
    onLaunchMission(config);
  };

  const getCategoryIcon = (cat: ModuleCategory) => {
    switch (cat) {
      case 'habitat': return <Home className="w-4 h-4" />;
      case 'life_support': return <Wind className="w-4 h-4" />;
      case 'power': return <Zap className="w-4 h-4" />;
      case 'radiation': return <ShieldAlert className="w-4 h-4" />;
      case 'food': return <Apple className="w-4 h-4" />;
      case 'water': return <Droplets className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
          <span>PHASE 2 OF 3</span>
          <span>•</span>
          <span>SYSTEM ARCHITECTURE & BUDGET ALLOCATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
          ENGINEER YOUR SURFACE OUTPOST
        </h1>
        <p className="text-sm font-mono text-slate-400 mt-1">
          Select life support, energy, and radiation systems within payload mass and capital limits
        </p>
      </div>

      {/* Top Telemetry Gauges (Budget, Mass, Power Balance) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* Budget Bar */}
        <div className="hud-panel p-4 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <DollarSign className="w-4 h-4" />
              <span>CAPITAL BUDGET</span>
            </span>
            <span className={isOverBudget ? 'text-red-400 font-bold' : 'text-slate-300'}>
              ${totalCost}M / ${totalBudget}M
            </span>
          </div>

          <div className="w-full h-3 bg-space-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget 
                  ? 'bg-red-500' 
                  : remainingBudget < 10 
                    ? 'bg-amber-400' 
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (totalCost / totalBudget) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono mt-2">
            <span className="text-slate-500">REMAINING ALLOCATION</span>
            <span className={`font-bold ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
              {isOverBudget ? `-$${Math.abs(remainingBudget)}M (DEFICIT)` : `$${remainingBudget}M AVAILABLE`}
            </span>
          </div>
        </div>

        {/* Mass Payload Gauge */}
        <div className="hud-panel p-4 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Weight className="w-4 h-4" />
              <span>PAYLOAD LAUNCH MASS</span>
            </span>
            <span className="text-slate-300 font-bold">
              {(totalMass / 1000).toFixed(1)} Metric Tons
            </span>
          </div>

          <div className="w-full h-3 bg-space-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (totalMass / 120000) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono mt-2">
            <span className="text-slate-500">HEAVY-LIFT BOOSTERS</span>
            <span className="text-amber-300 font-semibold">
              {Math.ceil(totalMass / 45000)} × Artemis SLS / Starship Landers
            </span>
          </div>
        </div>

        {/* Power Balance Forecast */}
        <div className="hud-panel p-4 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Zap className="w-4 h-4" />
              <span>POWER GRID FORECAST</span>
            </span>
            <span className={`font-bold ${netPowerBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {netPowerBalance >= 0 ? `+${netPowerBalance} kW` : `${netPowerBalance} kW`}
            </span>
          </div>

          <div className="w-full h-3 bg-space-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                netPowerBalance < 0 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(10, (baseGen / (powerDemand + baseGen)) * 100))}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono mt-2">
            <span className="text-slate-500">OUTPUT vs LOAD</span>
            <span className="text-slate-300">
              {baseGen} kW Gen / {powerDemand.toFixed(1)} kW Demand
            </span>
          </div>
        </div>

      </div>

      {/* Main Configuration Layout: Left Categories, Center Tier Picker, Right Blueprint Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left Column: Category Tabs (3 cols) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 px-1">
            Life Support Systems (6/6)
          </div>

          {MODULE_CATEGORIES.map(cat => {
            const currentSelected = getSelectedModule(cat.id);
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundEngine.playBeep(650, 0.03);
                  setActiveCategory(cat.id);
                }}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-md shadow-cyan-950/40 text-white'
                    : 'border-slate-800 bg-space-900/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-space-950 text-slate-400'}`}>
                    {getCategoryIcon(cat.id)}
                  </div>
                  <div>
                    <div className="text-xs font-bold font-display">{cat.title}</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]">
                      {currentSelected.name}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-semibold text-amber-400">
                    ${currentSelected.costMillionUSD}M
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Center Column: Tier Selection Cards for Active Category (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Select Module Tier: {MODULE_CATEGORIES.find(c => c.id === activeCategory)?.title}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Tier 1 (Base) → Tier 3 (Bio-Closed Loop)
            </span>
          </div>

          {OUTPOST_MODULES[activeCategory].map(tierModule => {
            const isSelected = config[activeCategory] === tierModule.id;

            return (
              <div
                key={tierModule.id}
                onClick={() => handleSelectModule(activeCategory, tierModule.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-950/50'
                    : 'border-slate-800 bg-space-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        tierModule.tier === 1 ? 'bg-slate-800 text-slate-300' :
                        tierModule.tier === 2 ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
                        'bg-purple-950 text-purple-300 border border-purple-500/40'
                      }`}>
                        TIER {tierModule.tier}
                      </span>
                      <h4 className="font-display font-bold text-base text-white">
                        {tierModule.name}
                      </h4>
                    </div>
                    <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {tierModule.description}
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                    isSelected ? 'bg-cyan-400 border-cyan-300 text-space-950' : 'border-slate-700'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Technical specs */}
                <div className="bg-space-950/80 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-400 my-2.5">
                  <span className="text-cyan-300 font-semibold block mb-0.5">TECHNICAL SPECIFICATIONS:</span>
                  {tierModule.technicalSpecs}
                </div>

                {/* Metrics footer: Cost, Mass, Power */}
                <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold">
                      ${tierModule.costMillionUSD}M USD
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">
                      {(tierModule.massKg / 1000).toFixed(1)} tons
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className={tierModule.powerDrawKW < 0 ? 'text-emerald-400 font-semibold' : 'text-blue-300'}>
                      {tierModule.powerDrawKW < 0 ? `+${Math.abs(tierModule.powerDrawKW)} kW Gen` : `${tierModule.powerDrawKW} kW Draw`}
                    </span>
                  </div>

                  <a
                    href={tierModule.nasaRefUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
                    title={tierModule.nasaRefTitle}
                  >
                    <span>NASA Ref</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Outpost Blueprint Schematic Visualizer (3 cols) */}
        <div className="lg:col-span-3">
          <div className="hud-panel p-4 rounded-xl border border-slate-700 sticky top-20">
            <div className="flex items-center gap-2 mb-3 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Outpost Schematic</span>
            </div>

            {/* Interactive Blueprint Canvas Diagram */}
            <div className="aspect-square bg-space-950 rounded-xl border border-cyan-500/30 p-3 relative flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

              {/* Destination badge */}
              <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-1">
                <span>{setupConfig.destination === 'mars' ? 'MARS // ARES BASE' : 'MOON // ARTEMIS'}</span>
                <span className="text-cyan-400 font-bold">CREW: {setupConfig.crewSize}</span>
              </div>

              {/* Schematic Core Visual Layout */}
              <div className="relative z-10 grid grid-cols-2 gap-2 my-auto">
                <div className="bg-space-900/90 border border-cyan-500/40 p-2 rounded text-center">
                  <Home className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <div className="text-[9px] font-mono text-slate-300 truncate">HAB: {getSelectedModule('habitat').name.split(' ')[0]}</div>
                </div>
                <div className="bg-space-900/90 border border-blue-500/40 p-2 rounded text-center">
                  <Wind className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <div className="text-[9px] font-mono text-slate-300 truncate">ECLSS: T{getSelectedModule('life_support').tier}</div>
                </div>
                <div className="bg-space-900/90 border border-amber-500/40 p-2 rounded text-center">
                  <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-[9px] font-mono text-slate-300 truncate">GRID: T{getSelectedModule('power').tier}</div>
                </div>
                <div className="bg-space-900/90 border border-emerald-500/40 p-2 rounded text-center">
                  <Droplets className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="text-[9px] font-mono text-slate-300 truncate">H2O: {getSelectedModule('water').statsEffect.waterRecycleEfficiencyPct}%</div>
                </div>
              </div>

              <div className="relative z-10 text-[9px] font-mono text-center text-slate-500 pt-1 border-t border-slate-800">
                STATUS: READY FOR DESCENT INJECTION
              </div>
            </div>

            {/* Warning if Lunar Night and no Nuclear */}
            {setupConfig.destination === 'moon' && config.power === 'pow_solar_li_ion' && (
              <div className="mt-3 p-2.5 rounded-lg bg-amber-950/50 border border-amber-500/40 flex items-start gap-2 text-[11px] font-mono text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>Caution: Lunar night lasts 14 Earth days. Basic solar arrays will deplete batteries quickly during darkness.</span>
              </div>
            )}

            {/* Launch CTA */}
            <button
              onClick={handleConfirmLaunch}
              disabled={isOverBudget}
              className={`w-full mt-4 py-3.5 px-4 rounded-xl font-mono font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all ${
                isOverBudget
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-red-500/40'
                  : 'bg-gradient-to-r from-cyan-400 via-cyan-300 to-amber-300 text-space-950 hover:from-cyan-300 hover:to-amber-200 shadow-xl shadow-cyan-500/30'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>LAUNCH MISSION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Footer Nav */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-xs transition-colors"
        >
          ← BACK TO MISSION SETUP
        </button>
      </div>

    </div>
  );
};
