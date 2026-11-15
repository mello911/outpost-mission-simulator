import React from 'react';
import { soundEngine } from '../utils/audio';
import { 
  X, 
  Gamepad2, 
  Wind, 
  Zap, 
  Droplets, 
  ShieldAlert, 
  Apple, 
  Compass, 
  Sparkles,
  Car,
  User,
  Flashlight
} from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-950 border-2 border-cyan-500/50 rounded-2xl p-6 shadow-2xl shadow-cyan-950/80 flex flex-col gap-5 text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-mono font-black text-white tracking-wider">
                FIELD FLIGHT MANUAL // HOW TO PLAY
              </h2>
              <p className="text-xs font-mono text-cyan-400">
                SURVIVAL OBJECTIVES & CONTROLS FOR JUNIOR ASTRONAUTS
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Controls Grid */}
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Core Game Controls</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center text-center">
              <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-bold mb-1">WASD / ARROWS</span>
              <span className="text-slate-300">Move / Drive</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center text-center">
              <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-bold mb-1">SPACE</span>
              <span className="text-slate-300">Low-G Jump & RCS Jetpack</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center text-center">
              <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-bold mb-1">E / TAP</span>
              <span className="text-slate-300">Interact & Field Action</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center text-center">
              <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-bold mb-1">Q / TAB</span>
              <span className="text-slate-300">AR Visor Scanner</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center text-center">
              <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-bold mb-1">G</span>
              <span className="text-slate-300">Throw Sample in Low-G</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center text-center">
              <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-bold mb-1">J</span>
              <span className="text-slate-300">NASA Field Journal</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center text-center">
              <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-bold mb-1">SHIFT</span>
              <span className="text-slate-300">Sprint / Turbo Boost</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center text-center">
              <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-bold mb-1">C</span>
              <span className="text-slate-300">Camera (EVA/Rover/Drone)</span>
            </div>
          </div>
        </div>

        {/* 2. Survival Objectives */}
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Extraterrestrial Survival Objectives</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono">
                <Wind className="w-4 h-4" />
                <span>1. Preserve Life Support</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Humans burn <strong className="text-cyan-300 font-mono">0.84 kg O₂</strong> and <strong className="text-blue-300 font-mono">2.8 L H₂O</strong> every Sol. Ensure scrubbers and recyclers are powered and nominal.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono">
                <Zap className="w-4 h-4" />
                <span>2. Clean Solar Panels</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Martian dust storms accumulate grit on solar cells, dropping power to critical levels. Walk up to the solar farm and press <strong className="text-amber-300 font-mono">[E]</strong> to wipe dust!
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold font-mono">
                <Droplets className="w-4 h-4" />
                <span>3. Drill Ice & Repair</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Drive your rover to blue glacial ice deposits to extract fresh water, and patch micrometeorite cracks at the central habitat airlock.
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs tracking-wider shadow-lg shadow-cyan-500/20"
          >
            ROGER THAT, FLIGHT! [ENTER]
          </button>
        </div>

      </div>
    </div>
  );
};
