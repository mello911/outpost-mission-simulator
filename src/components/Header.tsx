import React from 'react';
import { 
  Rocket, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Award, 
  Activity, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { GamePhase } from '../types';
import { soundEngine } from '../utils/audio';

interface HeaderProps {
  currentPhase: GamePhase;
  currentSol?: number;
  destinationName?: string;
  uiMode?: 'junior' | 'pro';
  onToggleUIMode?: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  ambientHumEnabled: boolean;
  setAmbientHumEnabled: (enabled: boolean) => void;
  onNavigate: (phase: GamePhase) => void;
  onRestart: () => void;
  masterAlarmActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPhase,
  currentSol,
  destinationName,
  uiMode = 'junior',
  onToggleUIMode,
  isMuted,
  setIsMuted,
  ambientHumEnabled,
  setAmbientHumEnabled,
  onNavigate,
  onRestart,
  masterAlarmActive = false
}) => {
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
    soundEngine.playBeep(next ? 440 : 880, 0.05);
  };

  const toggleHum = () => {
    const next = !ambientHumEnabled;
    setAmbientHumEnabled(next);
    soundEngine.toggleLifeSupportHum(next);
    soundEngine.playBeep(next ? 600 : 300, 0.05);
  };

  return (
    <header className="sticky top-0 z-40 bg-space-950/80 backdrop-blur-md border-b border-cyan-500/20 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Branding */}
        <div 
          onClick={() => {
            soundEngine.playQuindarTone(true);
            onNavigate('landing');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-amber-500 p-[2px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-shadow">
              <div className="w-full h-full bg-space-900 rounded-[6px] flex items-center justify-center">
                <Rocket className="w-5 h-5 text-cyan-400 transform -rotate-45 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            {masterAlarmActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold tracking-widest text-lg lg:text-xl text-white">
                OUTPOST
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-wider bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 rounded">
                NASA 2026 #03
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-wide hidden sm:block">
              Humanity's Next Home • Mission Trainer
            </p>
          </div>
        </div>

        {/* Center: Mission Clock / Sol Badge if in simulation */}
        {currentPhase === 'live_simulation' && (
          <div className="flex items-center gap-3 bg-space-900/90 border border-cyan-500/30 px-3.5 py-1.5 rounded-full shadow-inner">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                {destinationName || 'PLANETARY SURFACE'}
              </span>
            </div>
            <div className="h-4 w-[1px] bg-slate-700" />
            <div className="font-mono text-sm font-bold text-amber-400">
              SOL {currentSol?.toString().padStart(3, '0') || '001'}
            </div>
          </div>
        )}

        {/* Right: Audio Controls & Nav CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Audio Controls */}
          <div className="flex items-center bg-space-900/80 border border-slate-700/60 rounded-lg p-1">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio (Quindar & Alarms)'}
              className={`p-1.5 rounded transition-colors ${
                isMuted 
                  ? 'text-slate-500 hover:text-slate-400' 
                  : 'text-cyan-400 hover:bg-space-800'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleHum}
              title={ambientHumEnabled ? 'Disable ECLSS Hum' : 'Enable Cabin Ambiance Hum'}
              className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                ambientHumEnabled 
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' 
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              HUM
            </button>
          </div>

          {/* Navigation Links */}
          <button
            onClick={() => {
              soundEngine.playBeep(700, 0.04);
              onNavigate('handbook');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
              currentPhase === 'handbook'
                ? 'bg-cyan-600/20 border-cyan-400 text-cyan-300'
                : 'bg-space-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Science Archive</span>
          </button>

          {currentPhase === 'live_simulation' && onToggleUIMode && (
            <button
              onClick={() => {
                soundEngine.playBeep(650, 0.03);
                onToggleUIMode();
              }}
              className="px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 hover:bg-cyan-900/60 transition-colors flex items-center gap-1.5 shadow"
              title={uiMode === 'junior' ? 'Switch to Flight Director Pro Telemetry Mode' : 'Switch to Junior Astronaut Mode'}
            >
              <span>{uiMode === 'junior' ? '🚀 Cadet Mode' : '🛰️ Pro Mode'}</span>
            </button>
          )}

          {currentPhase === 'live_simulation' && (
            <button
              onClick={() => {
                soundEngine.playBeep(500, 0.05);
                onRestart();
              }}
              title="Abort / Reconfigure Mission"
              className="p-1.5 rounded-lg border border-red-500/30 bg-red-950/20 text-red-400 hover:bg-red-900/40 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {currentPhase === 'landing' && (
            <button
              onClick={() => {
                soundEngine.playQuindarTone(true);
                onNavigate('setup');
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-semibold tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-lg shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>LAUNCH TRAINER</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
