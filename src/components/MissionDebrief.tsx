import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MissionState, MissionScoreBreakdown } from '../types';
import { soundEngine } from '../utils/audio';
import { recordHighScore, getHighScores, SavedScore } from '../utils/storage';
import { 
  Award, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Share2, 
  ExternalLink,
  BookOpen,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface MissionDebriefProps {
  state: MissionState;
  onRestart: () => void;
  onOpenHandbook: () => void;
}

export const MissionDebrief: React.FC<MissionDebriefProps> = ({
  state,
  onRestart,
  onOpenHandbook,
}) => {
  const isVictory = state.missionOutcome === 'success';
  const score: MissionScoreBreakdown = state.scoreBreakdown || {
    survivalPoints: 2000,
    resourceEfficiencyPoints: 1200,
    engineeringStabilityPoints: 1000,
    crisisManagementPoints: 800,
    scienceDiscoveryPoints: 600,
    totalScore: 5600,
    rankTitle: 'Junior Planetary Pioneer',
    badgeId: 'badge_pioneer',
    summaryFeedback: 'Commendable effort. Outpost operations in harsh alien environments require constant balance.'
  };

  useEffect(() => {
    if (isVictory) {
      soundEngine.playSolDayChime();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } else {
      soundEngine.playCautionAlert();
    }

    // Record high score
    recordHighScore({
      id: state.id,
      destination: state.config.destination === 'mars' ? 'Mars' : 'Moon',
      solsCompleted: state.currentSol,
      totalScore: score.totalScore,
      rankTitle: score.rankTitle,
      date: new Date().toLocaleDateString(),
      outcome: state.missionOutcome === 'success' ? 'success' : 'failure'
    });
  }, [isVictory, score.totalScore, score.rankTitle, state.config.destination, state.currentSol, state.id, state.missionOutcome]);

  const handleExportLog = () => {
    soundEngine.playBeep(880, 0.04);
    const missionSummary = {
      missionId: state.id,
      destination: state.config.destination,
      durationSols: state.currentSol,
      targetDuration: state.config.targetSolDuration,
      outcome: state.missionOutcome,
      score: score.totalScore,
      rank: score.rankTitle,
      finalTelemetry: state.resources,
      crewStatus: state.crew,
      capcomLogs: state.logs
    };

    const blob = new Blob([JSON.stringify(missionSummary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OUTPOST_MISSION_${state.config.destination.toUpperCase()}_SOL${state.currentSol}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const highScores = getHighScores();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Banner */}
      <div className={`p-8 rounded-2xl border-2 mb-8 text-center relative overflow-hidden ${
        isVictory
          ? 'bg-gradient-to-b from-cyan-950/60 to-space-950 border-cyan-400 shadow-2xl shadow-cyan-500/20'
          : 'bg-gradient-to-b from-red-950/60 to-space-950 border-red-500 shadow-2xl shadow-red-500/20'
      }`}>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase mb-3 bg-space-950 border border-slate-800">
          {isVictory ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">MISSION OBJECTIVE ACCOMPLISHED</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400">EXPEDITION ABORTED / LIFE SUPPORT COLLAPSE</span>
            </>
          )}
        </div>

        <h1 className="text-4xl sm:text-5xl font-display font-black text-white mb-2">
          {isVictory ? 'HUMANITY FLOURISHES ON ANOTHER WORLD' : 'OUTPOST TELEMETRY TERMINATED'}
        </h1>

        <p className="text-sm font-mono text-slate-300 max-w-xl mx-auto mb-6">
          {isVictory 
            ? `Your outpost successfully completed the full ${state.config.targetSolDuration} Sol expedition on ${state.config.destination === 'mars' ? 'Mars' : 'the Moon'}, preserving the crew and proving the viability of long-duration settlement.`
            : state.failureReason || 'Critical depletion of life support consumables or thermal collapse forced emergency mission termination.'}
        </p>

        {/* Score & Rank Highlight */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-space-950/90 border border-slate-800 p-5 rounded-2xl">
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">FINAL EVALUATION SCORE</span>
            <span className="text-4xl font-display font-black bg-gradient-to-r from-cyan-400 to-amber-300 bg-clip-text text-transparent">
              {score.totalScore.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-slate-400"> / 10,000 PTS</span>
          </div>

          <div className="h-10 w-[1px] bg-slate-800 hidden sm:block" />

          <div className="text-center sm:text-left">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">AWARDED NASA RANK</span>
            <span className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>{score.rankTitle}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4-Pillar Score Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="hud-panel p-4 rounded-xl border border-slate-700">
          <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>CREW SURVIVAL</span>
            <span className="text-cyan-400 font-bold">{score.survivalPoints} / 4000</span>
          </div>
          <div className="w-full h-2 bg-space-950 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(score.survivalPoints / 4000) * 100}%` }} />
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-2">
            Living crew count & duration reached.
          </p>
        </div>

        <div className="hud-panel p-4 rounded-xl border border-slate-700">
          <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>RESOURCE EFFICIENCY</span>
            <span className="text-blue-400 font-bold">{score.resourceEfficiencyPoints} / 2500</span>
          </div>
          <div className="w-full h-2 bg-space-950 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(score.resourceEfficiencyPoints / 2500) * 100}%` }} />
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-2">
            Remaining reserves & water recycling closure.
          </p>
        </div>

        <div className="hud-panel p-4 rounded-xl border border-slate-700">
          <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>ENGINEERING STABILITY</span>
            <span className="text-emerald-400 font-bold">{score.engineeringStabilityPoints} / 2000</span>
          </div>
          <div className="w-full h-2 bg-space-950 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(score.engineeringStabilityPoints / 2000) * 100}%` }} />
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-2">
            Hull integrity & radiation shielding factor.
          </p>
        </div>

        <div className="hud-panel p-4 rounded-xl border border-slate-700">
          <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>SCIENCE & CRISIS</span>
            <span className="text-amber-400 font-bold">{score.scienceDiscoveryPoints} / 1500</span>
          </div>
          <div className="w-full h-2 bg-space-950 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(score.scienceDiscoveryPoints / 1500) * 100}%` }} />
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-2">
            Tactical decision trade-offs and research discoveries.
          </p>
        </div>

      </div>

      {/* Scientific Debriefing & Feedback */}
      <div className="hud-panel p-6 rounded-2xl border border-slate-700 mb-8 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          <span>Flight Director Scientific Analysis & Recommendations</span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed">
          {score.summaryFeedback}
        </p>

        <div className="bg-space-950/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white block mb-1">REAL NASA MISSIONS CORRELATION:</span>
          In real space exploration architecture, NASA addresses these exact engineering bottlenecks. The Artemis Base Camp relies on the connecting ridge of Shackleton Crater for continuous sunlight and buried regolith berms for cosmic ray shielding. Future human Mars missions under Design Reference Architecture 5.0 will land automated MOXIE and Sabatier units years in advance to pre-manufacture the return liquid oxygen propellant before crew arrival.
        </div>
      </div>

      {/* High Scores Leaderboard */}
      {highScores.length > 0 && (
        <div className="hud-panel p-6 rounded-2xl border border-slate-700 mb-8">
          <h3 className="text-sm font-mono uppercase text-cyan-400 font-bold tracking-wider mb-4">
            Flight Director Leaderboard (Saved on This Device)
          </h3>

          <div className="space-y-2">
            {highScores.slice(0, 5).map((entry, idx) => (
              <div 
                key={entry.id || idx}
                className="flex items-center justify-between p-3 rounded-xl bg-space-950 border border-slate-800 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-bold">#{idx + 1}</span>
                  <span className="text-white font-bold">{entry.destination} ({entry.solsCompleted} Sols)</span>
                  <span className="text-slate-400 hidden sm:inline">• {entry.rankTitle}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-amber-400 font-bold">{entry.totalScore.toLocaleString()} pts</span>
                  <span className="text-slate-500 text-[10px]">{entry.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={handleExportLog}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>EXPORT MISSION LOG REPORT</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              soundEngine.playBeep(700, 0.04);
              onOpenHandbook();
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-space-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 font-mono text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>SCIENCE HANDBOOK</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playQuindarTone(true);
              onRestart();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-mono font-bold tracking-wider text-space-950 bg-gradient-to-r from-cyan-400 to-amber-300 hover:from-cyan-300 hover:to-amber-200 shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 text-xs transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>NEW MISSION</span>
          </button>
        </div>
      </div>

    </div>
  );
};
