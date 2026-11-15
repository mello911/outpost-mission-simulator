import React from 'react';
import { soundEngine } from '../utils/audio';
import { GraphicsQuality } from '../game3d/OutpostScene';
import { 
  X, 
  Settings, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Music, 
  Radio,
  CheckCircle2
} from 'lucide-react';

interface GameSettingsModalProps {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  ambientHumEnabled: boolean;
  setAmbientHumEnabled: (enabled: boolean) => void;
  bgmEnabled: boolean;
  setBgmEnabled: (enabled: boolean) => void;
  quality: GraphicsQuality;
  setQuality: (quality: GraphicsQuality) => void;
  onClose: () => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isMuted,
  setIsMuted,
  ambientHumEnabled,
  setAmbientHumEnabled,
  bgmEnabled,
  setBgmEnabled,
  quality,
  setQuality,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-950 border-2 border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-slate-100 font-mono">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wider">GAME SETTINGS</h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Graphics Performance Settings */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Graphics Engine (Device Memory)</span>
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                setQuality('low');
              }}
              onMouseEnter={() => soundEngine.playButtonHover()}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                quality === 'low'
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>4GB LOW</span>
              <span className="text-[10px] opacity-80">Smooth 60fps</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playButtonClick();
                setQuality('med');
              }}
              onMouseEnter={() => soundEngine.playButtonHover()}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                quality === 'med'
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>MEDIUM</span>
              <span className="text-[10px] opacity-80">Balanced</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playButtonClick();
                setQuality('high');
              }}
              onMouseEnter={() => soundEngine.playButtonHover()}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                quality === 'high'
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>HIGH</span>
              <span className="text-[10px] opacity-80">Soft Shadows</span>
            </button>
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Audio & Synthesis</span>
          </label>
          
          <div className="flex flex-col gap-2 text-xs">
            {/* Master Audio */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-200">Master Sound</span>
              <button
                onClick={() => {
                  const next = !isMuted;
                  setIsMuted(next);
                  soundEngine.setMuted(next);
                  if (!next) soundEngine.playButtonClick();
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  !isMuted ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {!isMuted ? 'ENABLED' : 'MUTED'}
              </button>
            </div>

            {/* Ambient Space Music */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-200">Space Ambient Theme</span>
              <button
                onClick={() => {
                  const next = !bgmEnabled;
                  setBgmEnabled(next);
                  soundEngine.toggleSpaceBgm(next);
                  soundEngine.playButtonClick();
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  bgmEnabled ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {bgmEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Life Support Cabin Hum */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-200">Life Support Hum</span>
              <button
                onClick={() => {
                  const next = !ambientHumEnabled;
                  setAmbientHumEnabled(next);
                  soundEngine.toggleLifeSupportHum(next);
                  soundEngine.playButtonClick();
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  ambientHumEnabled ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {ambientHumEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            soundEngine.playButtonClick();
            onClose();
          }}
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider"
        >
          CONFIRM SETTINGS
        </button>

      </div>
    </div>
  );
};
