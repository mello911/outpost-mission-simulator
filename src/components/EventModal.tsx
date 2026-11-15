import React, { useEffect } from 'react';
import { ActiveCrisis, CrisisChoice } from '../types';
import { soundEngine } from '../utils/audio';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Zap, 
  Droplet, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';

interface EventModalProps {
  activeCrisis: ActiveCrisis;
  onSelectChoice: (choiceId: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  activeCrisis,
  onSelectChoice,
}) => {
  const { event, solTriggered } = activeCrisis;

  useEffect(() => {
    if (event.severity === 'emergency') {
      soundEngine.playEmergencyKlaxon();
    } else {
      soundEngine.playCautionAlert();
    }
  }, [event.severity]);

  const handleChoice = (choiceId: string) => {
    soundEngine.playQuindarTone(false);
    onSelectChoice(choiceId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md animate-fade-in">
      <div className="hud-panel rounded-2xl max-w-2xl w-full border-2 border-red-500/50 shadow-2xl p-6 relative overflow-hidden">
        
        {/* Top Warning Banner */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${
              event.severity === 'emergency' 
                ? 'bg-red-950 text-red-400 border border-red-500/60 animate-warning' 
                : event.severity === 'warning'
                  ? 'bg-amber-950 text-amber-400 border border-amber-500/60 animate-caution'
                  : 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  event.severity === 'emergency' ? 'bg-red-900 text-red-200' :
                  event.severity === 'warning' ? 'bg-amber-900 text-amber-200' :
                  'bg-cyan-900 text-cyan-200'
                }`}>
                  {event.severity}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  SOL {solTriggered.toString().padStart(3, '0')} // FLIGHT DIRECTOR DIRECTIVE
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-white mt-1">
                {event.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Incident Narrative */}
        <div className="text-sm text-slate-200 leading-relaxed mb-4">
          {event.description}
        </div>

        {/* NASA Scientific Context Card */}
        <div className="p-3.5 rounded-xl bg-space-950/90 border border-cyan-500/30 mb-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-mono font-bold text-cyan-300 block mb-0.5">
                  NASA REAL MISSION CONTEXT
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {event.nasaContext}
                </p>
              </div>
            </div>

            <a
              href={event.nasaRefUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
              title={event.nasaRefTitle}
            >
              <span>NASA Ref</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Tactical Choices Heading */}
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 px-1">
          Tactical Engineering Protocol Decisions (Select One):
        </div>

        {/* Decision Cards */}
        <div className="space-y-3">
          {event.choices.map((choice: CrisisChoice) => (
            <button
              key={choice.id}
              onClick={() => handleChoice(choice.id)}
              className="w-full p-4 rounded-xl border border-slate-700 bg-space-900/80 hover:border-cyan-400 hover:bg-space-850 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <span className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                  {choice.label}
                </span>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-950 border border-slate-700 text-cyan-300 shrink-0">
                  {Math.round(choice.successProbability * 100)}% Success Probability
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                {choice.description}
              </p>

              {/* Resource Cost / Crew Impact tags */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                {choice.resourceCost?.storedEnergyKWh && (
                  <span className="px-2 py-0.5 rounded bg-space-950 border border-slate-800 text-amber-400">
                    Energy: -{choice.resourceCost.storedEnergyKWh} kWh
                  </span>
                )}
                {choice.resourceCost?.waterLiters && (
                  <span className="px-2 py-0.5 rounded bg-space-950 border border-slate-800 text-blue-400">
                    Water: -{choice.resourceCost.waterLiters} L
                  </span>
                )}
                {choice.resourceCost?.oxygenKg && (
                  <span className="px-2 py-0.5 rounded bg-space-950 border border-slate-800 text-cyan-400">
                    Oxygen: -{choice.resourceCost.oxygenKg} kg
                  </span>
                )}
                {choice.crewImpact?.moraleDelta !== undefined && (
                  <span className={`px-2 py-0.5 rounded bg-space-950 border border-slate-800 ${
                    choice.crewImpact.moraleDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    Morale: {choice.crewImpact.moraleDelta >= 0 ? `+${choice.crewImpact.moraleDelta}` : choice.crewImpact.moraleDelta}%
                  </span>
                )}
                {choice.crewImpact?.radiationDoseDeltaMSv && (
                  <span className="px-2 py-0.5 rounded bg-space-950 border border-slate-800 text-red-400">
                    Rad Exposure: +{choice.crewImpact.radiationDoseDeltaMSv} mSv
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
