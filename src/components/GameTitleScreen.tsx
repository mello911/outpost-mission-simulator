import React from 'react';
import { soundEngine } from '../utils/audio';
import { 
  Play, 
  Zap, 
  BookOpen, 
  Settings, 
  Gamepad2, 
  Rocket, 
  Compass,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

interface GameTitleScreenProps {
  onStartGame: () => void;
  onQuickStart: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onOpenHandbook: () => void;
}

export const GameTitleScreen: React.FC<GameTitleScreenProps> = ({
  onStartGame,
  onQuickStart,
  onOpenHowToPlay,
  onOpenSettings,
  onOpenHandbook,
}) => {
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between items-center p-6 sm:p-10 select-none bg-[radial-gradient(ellipse_at_center,#0c162d_0%,#030712_100%)]">
      
      {/* Background Animated Star Grid & Atmospheric Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-b from-cyan-600/15 via-blue-600/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-amber-600/10 blur-3xl rounded-full" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-red-600/10 blur-3xl rounded-full" />
      </div>

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-cyan-500/40 text-xs font-mono shadow-lg shadow-cyan-950/50">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-400 font-bold tracking-wider">NASA SPACE APPS 2026 // CHALLENGE #03</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">Junior Astronaut Mission Trainer</span>
        </div>
      </div>

      {/* Center Hero: Game Title & Arcade Menu Buttons */}
      <div className="relative z-10 flex flex-col items-center max-w-xl w-full text-center my-auto">
        
        {/* Glowing Game Logo */}
        <div className="mb-2">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            OUTPOST
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="h-[1px] w-8 bg-cyan-500/60" />
            <span className="text-xs sm:text-sm font-mono tracking-[0.3em] uppercase bg-gradient-to-r from-cyan-400 via-amber-300 to-orange-400 bg-clip-text text-transparent font-bold">
              Humanity's Next Home
            </span>
            <span className="h-[1px] w-8 bg-cyan-500/60" />
          </div>
        </div>

        <p className="text-xs sm:text-sm font-sans text-slate-400 mb-8 max-w-md">
          Survive long-duration human spaceflight on Mars & the Moon. Control your astronaut in real-time 3D, maintain closed-loop ECLSS life support, and overcome tactical space emergencies.
        </p>

        {/* Arcade Menu Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-sm font-mono">
          
          {/* Main Play Expedition */}
          <button
            onClick={() => {
              soundEngine.playLaunchTone();
              onStartGame();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="group relative flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-sm tracking-wider shadow-xl shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>COMMENCE MISSION EXPEDITION</span>
          </button>

          {/* Quick Launch (Mars 30 Sols) */}
          <button
            onClick={() => {
              soundEngine.playLaunchTone();
              onQuickStart();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="flex items-center justify-center gap-2.5 w-full py-3 px-6 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 font-bold text-xs tracking-wider shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>QUICK START (MARS // 30 SOLS)</span>
          </button>

          {/* How to Play & Settings in 2-column row */}
          <div className="grid grid-cols-2 gap-2.5 mt-1">
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onOpenHowToPlay();
              }}
              onMouseEnter={() => soundEngine.playButtonHover()}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 font-bold text-xs transition"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>HOW TO PLAY</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onOpenSettings();
              }}
              onMouseEnter={() => soundEngine.playButtonHover()}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 font-bold text-xs transition"
            >
              <Settings className="w-4 h-4" />
              <span>SETTINGS</span>
            </button>
          </div>

          {/* Educational Handbook */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenHandbook();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-[11px] font-mono hover:bg-slate-900/60 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>NASA SCIENCE & STANDARDS ARCHIVE</span>
          </button>
        </div>

      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 flex flex-wrap items-center justify-between w-full max-w-4xl pt-4 border-t border-slate-900 text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-500" />
          <span>Real-time 3D Engine • Ultra-Light 4GB RAM Mode</span>
        </div>
        <div>
          <span>NASA-STD-3001 • 98% ISS Water Milestone • MOXIE</span>
        </div>
      </div>

    </div>
  );
};
