import React, { useState } from 'react';
import { 
  DestinationType, 
  MissionSetupConfig, 
  Astronaut 
} from '../types';
import { DESTINATIONS } from '../data/destinations';
import { CREW_PRESETS, CREW_ROLES } from '../data/crew';
import { soundEngine } from '../utils/audio';
import { 
  Globe2, 
  Users, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  Sun, 
  Flame, 
  Compass, 
  Check, 
  Info,
  Sparkles
} from 'lucide-react';

interface MissionSetupProps {
  onProceedToConstruction: (config: MissionSetupConfig) => void;
  onBack: () => void;
}

export const MissionSetup: React.FC<MissionSetupProps> = ({
  onProceedToConstruction,
  onBack,
}) => {
  const [selectedDestination, setSelectedDestination] = useState<DestinationType>('mars');
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>(['ast_1', 'ast_2', 'ast_3', 'ast_4']);
  const [targetSols, setTargetSols] = useState<number>(60);

  const dest = DESTINATIONS[selectedDestination];

  const toggleCrewMember = (id: string) => {
    soundEngine.playBeep(700, 0.03);
    if (selectedCrewIds.includes(id)) {
      if (selectedCrewIds.length <= 2) {
        alert('Mission safety requirement: Minimum crew size is 2 astronauts.');
        return;
      }
      setSelectedCrewIds(selectedCrewIds.filter(cid => cid !== id));
    } else {
      if (selectedCrewIds.length >= 6) {
        alert('Maximum habitat capacity is currently 6 astronauts for this expedition class.');
        return;
      }
      setSelectedCrewIds([...selectedCrewIds, id]);
    }
  };

  const handleStartConstruction = () => {
    soundEngine.playQuindarTone(true);
    const chosenCrew: Astronaut[] = CREW_PRESETS.filter(c => selectedCrewIds.includes(c.id));
    const setupConfig: MissionSetupConfig = {
      destination: selectedDestination,
      crewSize: chosenCrew.length,
      crewRoster: chosenCrew,
      targetSolDuration: targetSols,
      startingBudgetMillionUSD: 120, // $120M starting budget
    };
    onProceedToConstruction(setupConfig);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
          <span>PHASE 1 OF 3</span>
          <span>•</span>
          <span>FLIGHT DIRECTIVE AUTHORIZATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
          MISSION PARAMETERS & SETUP
        </h1>
        <p className="text-sm font-mono text-slate-400 mt-1">
          Configure destination physics, astronaut crew roster, and expedition operational duration
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Step 1: Destination Selection */}
        <section className="hud-panel rounded-2xl p-6 border border-slate-700/80">
          <div className="flex items-center gap-2 mb-4 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <Globe2 className="w-4 h-4" />
            <span>01 // Target Planetary Destination</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Mars Card */}
            <div
              onClick={() => {
                soundEngine.playBeep(520, 0.04);
                setSelectedDestination('mars');
              }}
              className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                selectedDestination === 'mars'
                  ? 'border-orange-500 bg-orange-950/30 shadow-lg shadow-orange-950/50'
                  : 'border-slate-800 bg-space-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-orange-950 border border-orange-500/40 text-orange-300">
                    0.38G • 24.6H SOL
                  </span>
                  <h3 className="text-xl font-display font-bold text-white mt-1">
                    Mars (Ares Surface Base)
                  </h3>
                  <div className="text-xs text-orange-400 font-mono">
                    Jezero Crater Rim & Delta
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  selectedDestination === 'mars'
                    ? 'bg-orange-500 border-orange-400 text-space-950'
                    : 'border-slate-700'
                }`}>
                  {selectedDestination === 'mars' && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Cold desert planet with atmospheric carbon dioxide (0.6 kPa) enabling MOXIE oxygen generation. Experiences seasonal planet-wide dust storms.
              </p>

              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-space-950/80 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block">SOLAR</span>
                  <span className="text-amber-400 font-semibold">590 W/m²</span>
                </div>
                <div>
                  <span className="text-slate-500 block">AVG TEMP</span>
                  <span className="text-cyan-400 font-semibold">-63°C</span>
                </div>
                <div>
                  <span className="text-slate-500 block">RADIATION</span>
                  <span className="text-red-400 font-semibold">High (GCR)</span>
                </div>
              </div>
            </div>

            {/* Moon Card */}
            <div
              onClick={() => {
                soundEngine.playBeep(580, 0.04);
                setSelectedDestination('moon');
              }}
              className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                selectedDestination === 'moon'
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-950/50'
                  : 'border-slate-800 bg-space-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    0.166G • 14-DAY NIGHT
                  </span>
                  <h3 className="text-xl font-display font-bold text-white mt-1">
                    Moon (Artemis Base Camp)
                  </h3>
                  <div className="text-xs text-cyan-400 font-mono">
                    Shackleton Crater Connecting Ridge
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  selectedDestination === 'moon'
                    ? 'bg-cyan-400 border-cyan-300 text-space-950'
                    : 'border-slate-700'
                }`}>
                  {selectedDestination === 'moon' && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Airless vacuum world at the lunar south pole with polar sunlight and water ice cold traps. Hard 14-day night elsewhere demands nuclear or high storage.
              </p>

              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-space-950/80 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block">SOLAR</span>
                  <span className="text-amber-400 font-semibold">1,360 W/m²</span>
                </div>
                <div>
                  <span className="text-slate-500 block">AVG TEMP</span>
                  <span className="text-cyan-400 font-semibold">-80°C</span>
                </div>
                <div>
                  <span className="text-slate-500 block">RADIATION</span>
                  <span className="text-red-400 font-semibold">Extreme</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Step 2: Crew Roster Customizer */}
        <section className="hud-panel rounded-2xl p-6 border border-slate-700/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>02 // Assemble Astronaut Crew Roster</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Selected: <span className="text-cyan-300 font-bold">{selectedCrewIds.length} / 6</span> astronauts (Consumes ~{Math.round(selectedCrewIds.length * 0.84 * 10) / 10} kg O₂ & {selectedCrewIds.length * 2.8} L H₂O per Sol)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CREW_PRESETS.map((astronaut) => {
              const isSelected = selectedCrewIds.includes(astronaut.id);
              return (
                <div
                  key={astronaut.id}
                  onClick={() => toggleCrewMember(astronaut.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-500/70 bg-cyan-950/30 shadow-md'
                      : 'border-slate-800 bg-space-900/50 opacity-60 hover:opacity-100 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-sm font-bold text-white">{astronaut.name}</div>
                      <div className="text-[11px] font-mono text-cyan-400">{astronaut.roleTitle}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs ${
                      isSelected
                        ? 'bg-cyan-400 border-cyan-300 text-space-950 font-bold'
                        : 'border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="bg-space-950/90 p-2 rounded border border-slate-800 text-[10px] font-mono text-slate-300 mt-2">
                    <span className="text-amber-400 font-bold block mb-0.5">SPECIALTY PERK</span>
                    {astronaut.perk}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 3: Mission Duration */}
        <section className="hud-panel rounded-2xl p-6 border border-slate-700/80">
          <div className="flex items-center gap-2 mb-4 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>03 // Target Operational Duration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div
              onClick={() => {
                soundEngine.playBeep(600, 0.03);
                setTargetSols(30);
              }}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${
                targetSols === 30
                  ? 'border-cyan-400 bg-cyan-950/40 text-white'
                  : 'border-slate-800 bg-space-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-2xl font-bold font-mono text-cyan-400 mb-1">30 SOLS</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200">Reconnaissance Push</div>
              <div className="text-[11px] font-mono text-slate-400 mt-2">Short duration; fast-paced trial for beginners.</div>
            </div>

            <div
              onClick={() => {
                soundEngine.playBeep(660, 0.03);
                setTargetSols(60);
              }}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${
                targetSols === 60
                  ? 'border-amber-400 bg-amber-950/40 text-white'
                  : 'border-slate-800 bg-space-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-2xl font-bold font-mono text-amber-400 mb-1">60 SOLS</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200">Standard Science Expedition</div>
              <div className="text-[11px] font-mono text-slate-400 mt-2">Recommended: tests full agricultural & ECLSS cycles.</div>
            </div>

            <div
              onClick={() => {
                soundEngine.playBeep(720, 0.03);
                setTargetSols(100);
              }}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${
                targetSols === 100
                  ? 'border-red-400 bg-red-950/40 text-white'
                  : 'border-slate-800 bg-space-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-2xl font-bold font-mono text-red-400 mb-1">100 SOLS</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200">Deep Space Colonization</div>
              <div className="text-[11px] font-mono text-slate-400 mt-2">Severe stress testing; requires near 100% recycling loops.</div>
            </div>

          </div>
        </section>

        {/* Environmental Comparison Matrix Alert */}
        <div className="p-4 rounded-xl bg-space-900/90 border border-slate-700/80 flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-white">Junior Astronaut Flight Briefing:</span> You have a starting allocation budget of <strong className="text-amber-400">$120 Million USD</strong> to configure life support modules in the next phase. Ensure you allocate adequate power and water recovery for your crew of <strong className="text-cyan-300">{selectedCrewIds.length}</strong> over the <strong className="text-amber-300">{targetSols} Sol</strong> deployment window.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-xs transition-colors"
          >
            ← BACK TO BRIEFING
          </button>

          <button
            onClick={handleStartConstruction}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-mono font-bold tracking-wider text-space-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-amber-300 hover:from-cyan-300 hover:to-amber-200 shadow-xl shadow-cyan-500/30 transition-all flex items-center justify-center gap-3 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>PROCEED TO OUTPOST CONSTRUCTION</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
