import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  MissionState, 
  Astronaut 
} from '../types';
import { 
  OutpostScene, 
  CameraMode, 
  GraphicsQuality, 
  InteractiveTarget 
} from '../game3d/OutpostScene';
import { soundEngine } from '../utils/audio';
import { 
  Play, 
  Pause, 
  FastForward, 
  ChevronRight, 
  AlertTriangle, 
  Wind, 
  Droplets, 
  Zap, 
  Apple, 
  ShieldAlert, 
  HeartPulse, 
  Radio, 
  Maximize2,
  Compass,
  Cpu,
  Flashlight,
  Camera,
  Car,
  User,
  Activity,
  Layers,
  Sparkles,
  Info,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { MissionControl } from './MissionControl';
import { GameSettingsModal } from './GameSettingsModal';

interface Outpost3DGameProps {
  state: MissionState;
  onAdvanceSol: () => void;
  onTogglePause: () => void;
  onChangeSpeed: (speed: 1 | 2 | 5) => void;
  onSilenceMasterAlarm: () => void;
  onManualAction: (actionType: 'purge_scrubbers' | 'rationing' | 'eva_repair' | 'battery_boost') => void;
  onAbortMission: () => void;
  onExitToTitle: () => void;
  onAddResource?: (type: 'water' | 'food' | 'energy' | 'oxygen' | 'integrity', amount: number, logMsg: string) => void;
}

export const Outpost3DGame: React.FC<Outpost3DGameProps> = ({
  state,
  onAdvanceSol,
  onTogglePause,
  onChangeSpeed,
  onSilenceMasterAlarm,
  onManualAction,
  onAbortMission,
  onExitToTitle,
  onAddResource,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<OutpostScene | null>(null);

  // UI States
  const [activeTarget, setActiveTarget] = useState<InteractiveTarget | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>('astronaut');
  const [quality, setQuality] = useState<GraphicsQuality>('low'); // Default to low for 4GB RAM compatibility!
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [showPauseMenu, setShowPauseMenu] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [ambientHumEnabled, setAmbientHumEnabled] = useState<boolean>(true);
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(false);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<{ title: string; detail: string } | null>(null);
  const [fps, setFps] = useState<number>(60);

  const { resources, crew, currentSol, config, masterAlarmActive, isPaused, simulationSpeed } = state;
  const livingCrew = crew.filter(c => c.status !== 'incapacitated');
  const crewCount = livingCrew.length;

  // Initialize 3D Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new OutpostScene(
      containerRef.current,
      config.destination,
      state.configuration,
      quality
    );
    sceneRef.current = scene;

    scene.onNearTargetChange = (target) => {
      setActiveTarget(target);
    };

    // Simple FPS estimator
    let lastTime = performance.now();
    let frameCount = 0;
    const fpsTimer = setInterval(() => {
      const now = performance.now();
      const measuredFps = Math.round((frameCount * 1000) / (now - lastTime));
      setFps(measuredFps > 0 ? Math.min(60, measuredFps) : 60);
      frameCount = 0;
      lastTime = now;
    }, 1000);

    const frameHook = () => {
      frameCount++;
      requestAnimationFrame(frameHook);
    };
    const reqId = requestAnimationFrame(frameHook);

    return () => {
      clearInterval(fpsTimer);
      cancelAnimationFrame(reqId);
      scene.dispose();
      sceneRef.current = null;
    };
  }, [config.destination, state.configuration]);

  // Sync alarms & weather
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.setAlarmState(masterAlarmActive);
    sceneRef.current.setStormState(state.activeCrisis?.event.category === 'environmental');
  }, [masterAlarmActive, state.activeCrisis]);

  // Quality switch
  const handleQualityChange = (newQ: GraphicsQuality) => {
    setQuality(newQ);
    if (sceneRef.current) {
      sceneRef.current.setQuality(newQ);
    }
    soundEngine.playBeep(1100, 0.05, 'triangle');
  };

  // Camera switch
  const handleCameraChange = (mode: CameraMode) => {
    setCameraMode(mode);
    if (sceneRef.current) {
      sceneRef.current.cameraMode = mode;
    }
    soundEngine.playBeep(1200, 0.06, 'sine');
  };

  // Flashlight toggle
  const handleToggleLight = () => {
    if (sceneRef.current) {
      sceneRef.current.toggleFlashlight();
    }
  };

  // Trigger Action
  const handleExecuteTargetAction = useCallback(() => {
    if (!sceneRef.current) return;
    const target = sceneRef.current.triggerCurrentAction();
    if (!target) return;

    if (target.type === 'solar') {
      onManualAction('battery_boost');
      showToast('⚡ Power Grid Serviced!', 'Cleared surface dust grit. Restored +30 kWh auxiliary reserve.');
    } else if (target.type === 'airlock') {
      onManualAction('eva_repair');
      showToast('🛡️ Airlock & Hull Sealed!', 'Completed structural maintenance. Restored +15% habitat integrity.');
    } else if (target.type === 'scrubber') {
      onManualAction('purge_scrubbers');
      showToast('💨 ECLSS Purged!', 'Regenerated amine scrubbers. Purged CO₂ and added +5 kg O₂.');
    } else if (target.type === 'greenhouse') {
      if (onAddResource) {
        onAddResource('food', 400, 'Greenhouse crops tended: +400 kcal harvested.');
      }
      showToast('🌱 Crops Harvested!', 'Cultivated fresh aeroponic vegetables (+400 kcal nutrition).');
    } else if (target.type === 'ice_deposit') {
      if (onAddResource) {
        onAddResource('water', 15, 'Drilled subsurface ice pocket: +15L purified water extracted.');
      }
      showToast('💧 Glacial Ice Extracted!', 'Drilled subsurface volatile ice pocket (+15 Liters potable water).');
    } else if (target.type === 'rover') {
      showToast('🚗 Rover Mounted', 'Drive across the crater at 2x speed using WASD / Arrow keys.');
    }
  }, [onManualAction, onAddResource]);

  const showToast = (title: string, detail: string) => {
    setActionToast({ title, detail });
    setTimeout(() => {
      setActionToast(null);
    }, 3500);
  };

  // Keyboard shortcuts for [V] and [ESC]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'KeyV') {
        setShowTerminal(prev => !prev);
        soundEngine.playButtonClick();
      }
      if (e.code === 'Escape') {
        if (showTerminal) {
          setShowTerminal(false);
        } else if (showSettings) {
          setShowSettings(false);
        } else {
          setShowPauseMenu(prev => !prev);
        }
        soundEngine.playButtonClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTerminal, showSettings]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Visual Scanline Effect (Ultra-light CSS) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.45)_100%)]" />

      {/* TOP SCI-FI GAME HUD */}
      <div className="absolute top-3 inset-x-3 pointer-events-none flex flex-col gap-2 z-10">
        <div className="flex items-center justify-between gap-3">
          
          {/* Mission & Sol Pill */}
          <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/30 shadow-lg text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                {config.destination === 'mars' ? 'MARS // ARES BASE' : 'MOON // ARTEMIS BASE'}
              </div>
              <div className="text-white font-black text-sm">
                SOL <span className="text-cyan-300">{currentSol}</span> / {config.targetSolDuration}
              </div>
            </div>

            {/* Time Controls */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
              <button
                onClick={onTogglePause}
                title={isPaused ? "Resume Simulation" : "Pause Simulation"}
                className={`p-1.5 rounded transition ${
                  isPaused ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => onChangeSpeed(simulationSpeed === 1 ? 2 : simulationSpeed === 2 ? 5 : 1)}
                className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-cyan-400 font-bold text-[10px] border border-slate-700"
              >
                {simulationSpeed}x
              </button>
              <button
                onClick={onAdvanceSol}
                title="Advance 1 Sol"
                className="p-1.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Consumables Bar */}
          <div className="hidden sm:flex pointer-events-auto items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-lg text-xs font-mono">
            {/* O2 */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>{Math.round(resources.oxygenKg)} kg</span>
            </div>
            {/* H2O */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>{Math.round(resources.waterLiters)} L</span>
            </div>
            {/* Power */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{Math.round(resources.storedEnergyKWh)} kWh</span>
            </div>
            {/* Food */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
              <Apple className="w-3.5 h-3.5 text-emerald-400" />
              <span>{Math.round(resources.foodKcal / 1000)}k kcal</span>
            </div>
            {/* Integrity */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
              <span>{Math.round(resources.habitatIntegrityPct)}%</span>
            </div>
          </div>

          {/* Right Controls: Quality, Master Alarm, Terminal Button */}
          <div className="pointer-events-auto flex items-center gap-2">
            
            {/* Master Alarm Silence */}
            {masterAlarmActive && (
              <button
                onClick={onSilenceMasterAlarm}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-mono font-bold text-xs animate-bounce shadow-lg shadow-red-900/50"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SILENCE ALARM</span>
              </button>
            )}

            {/* Graphics Quality Selector (Crucial for 4GB RAM devices!) */}
            <div className="flex items-center bg-slate-950/85 backdrop-blur-md rounded-xl p-1 border border-slate-800 font-mono text-[10px]">
              <span className="px-2 text-slate-400 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span className="hidden md:inline">{fps}fps</span>
              </span>
              <button
                onClick={() => handleQualityChange('low')}
                className={`px-2 py-0.5 rounded transition ${
                  quality === 'low' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Optimized for 4GB RAM & Low-End GPUs"
              >
                4GB LOW
              </button>
              <button
                onClick={() => handleQualityChange('med')}
                className={`px-2 py-0.5 rounded transition ${
                  quality === 'med' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MED
              </button>
              <button
                onClick={() => handleQualityChange('high')}
                className={`px-2 py-0.5 rounded transition ${
                  quality === 'high' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                HIGH
              </button>
            </div>

            {/* Toggle Telemetry Terminal Modal */}
            <button
              onClick={() => {
                setShowTerminal(prev => !prev);
                soundEngine.playButtonClick();
              }}
              onMouseEnter={() => soundEngine.playButtonHover()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition shadow-lg ${
                showTerminal 
                  ? 'bg-cyan-500 text-slate-950 border border-cyan-400' 
                  : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TELEMETRY [V]</span>
            </button>

            {/* In-Game Menu / Pause Button */}
            <button
              onClick={() => {
                setShowPauseMenu(prev => !prev);
                soundEngine.playButtonClick();
              }}
              onMouseEnter={() => soundEngine.playButtonHover()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs font-bold transition shadow-lg"
              title="Pause Game [ESC]"
            >
              <span>MENU [ESC]</span>
            </button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE ACTION PROMPT (Center Screen / Proximity Hologram) */}
      {activeTarget && (
        <div className="absolute bottom-20 sm:bottom-24 inset-x-0 flex justify-center z-20 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-xl border-2 border-cyan-400/80 rounded-2xl p-4 sm:p-5 max-w-md mx-4 shadow-2xl shadow-cyan-950/80 text-center flex flex-col items-center gap-2">
            
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{activeTarget.name}</span>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm">
              {activeTarget.detail}
            </p>

            <button
              onClick={handleExecuteTargetAction}
              className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black font-mono text-sm tracking-wider shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition"
            >
              <span className="bg-slate-950 text-cyan-300 px-2 py-0.5 rounded text-xs">PRESS E</span>
              <span>{activeTarget.actionPrompt.replace(/^\[E\]\s*/, '')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTION CONFIRMATION TOAST */}
      {actionToast && (
        <div className="absolute top-20 inset-x-0 flex justify-center z-30 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="bg-emerald-950/95 border border-emerald-500/80 rounded-xl px-5 py-2.5 shadow-2xl shadow-emerald-950/80 flex items-center gap-3 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-emerald-300 font-bold text-xs">{actionToast.title}</div>
              <div className="text-emerald-100/80 text-[11px]">{actionToast.detail}</div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM-LEFT: CONTROLS & CAMERA DOCK */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        
        {/* Camera Selector */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl font-mono text-xs">
          <button
            onClick={() => handleCameraChange('astronaut')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition ${
              cameraMode === 'astronaut' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Astronaut 3rd-Person View [C]"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">EVA</span>
          </button>
          <button
            onClick={() => handleCameraChange('rover')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition ${
              cameraMode === 'rover' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Rover Drive View [C]"
          >
            <Car className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ROVER</span>
          </button>
          <button
            onClick={() => handleCameraChange('tactical')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition ${
              cameraMode === 'tactical' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Flight Director Drone View [C]"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DRONE</span>
          </button>

          <button
            onClick={handleToggleLight}
            className="p-1.5 ml-1 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-slate-800"
            title="Suit Flashlight / Rover Headlights [F]"
          >
            <Flashlight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Keyboard Legend */}
        <div className="hidden md:flex pointer-events-auto items-center gap-2 text-[10px] font-mono text-slate-400 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80">
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">WASD</kbd> Move</span>
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">Space</kbd> Jump</span>
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">Shift</kbd> Run</span>
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">E</kbd> Interact</span>
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">C</kbd> Camera</span>
        </div>
      </div>

      {/* BOTTOM-RIGHT: MINIMAP & TOUCH TOGGLE */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2 pointer-events-none">
        
        {/* Toggle on-screen touch D-Pad */}
        <button
          onClick={() => setShowTouchControls(prev => !prev)}
          className="pointer-events-auto md:hidden px-3 py-1.5 rounded-xl bg-slate-900/90 text-cyan-300 border border-slate-700 font-mono text-xs flex items-center gap-1.5"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{showTouchControls ? 'Hide Touch' : 'Touch D-Pad'}</span>
        </button>

        {/* Holographic Radar / Minimap */}
        <div className="pointer-events-auto w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 p-2 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400 tracking-wider">
            <span>SURFACE RADAR</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          
          <div className="relative flex-1 rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden mt-1 flex items-center justify-center">
            {/* Concentric distance rings */}
            <div className="absolute w-24 h-24 rounded-full border border-cyan-500/15" />
            <div className="absolute w-12 h-12 rounded-full border border-cyan-500/25" />
            
            {/* Central Outpost marker */}
            <div className="absolute w-3 h-3 rounded-full bg-cyan-400/80 shadow-sm shadow-cyan-400" title="Central Hab" />
            
            {/* Solar Farm */}
            <div className="absolute -left-6 w-2 h-2 rounded bg-amber-400/80" title="Solar Array" />
            {/* Greenhouse */}
            <div className="absolute left-6 -top-1 w-2 h-2 rounded bg-emerald-400/80" title="Greenhouse" />
            {/* Water Ice Deposits */}
            <div className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" title="Ice Pocket" />
            <div className="absolute -bottom-2 -left-3 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" title="Ice Pocket" />
            
            {/* Scanner line */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-pulse" />
          </div>
        </div>
      </div>

      {/* MOBILE / TOUCH ONSCREEN JOYSTICK (Shown when enabled) */}
      {showTouchControls && (
        <div className="absolute bottom-20 left-4 z-20 flex flex-col items-center gap-1 pointer-events-auto md:hidden">
          <button
            onPointerDown={() => sceneRef.current?.setVirtualInput('forward', true)}
            onPointerUp={() => sceneRef.current?.setVirtualInput('forward', false)}
            className="w-12 h-12 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center active:bg-cyan-500 active:text-slate-950"
          >
            W
          </button>
          <div className="flex gap-2">
            <button
              onPointerDown={() => sceneRef.current?.setVirtualInput('left', true)}
              onPointerUp={() => sceneRef.current?.setVirtualInput('left', false)}
              className="w-12 h-12 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center active:bg-cyan-500 active:text-slate-950"
            >
              A
            </button>
            <button
              onPointerDown={() => sceneRef.current?.setVirtualInput('backward', true)}
              onPointerUp={() => sceneRef.current?.setVirtualInput('backward', false)}
              className="w-12 h-12 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center active:bg-cyan-500 active:text-slate-950"
            >
              S
            </button>
            <button
              onPointerDown={() => sceneRef.current?.setVirtualInput('right', true)}
              onPointerUp={() => sceneRef.current?.setVirtualInput('right', false)}
              className="w-12 h-12 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center active:bg-cyan-500 active:text-slate-950"
            >
              D
            </button>
          </div>
          <button
            onPointerDown={() => sceneRef.current?.setVirtualInput('jump', true)}
            onPointerUp={() => sceneRef.current?.setVirtualInput('jump', false)}
            className="w-28 py-2 mt-1 rounded-xl bg-cyan-600/60 border border-cyan-400 text-white font-bold text-xs"
          >
            JUMP
          </button>
        </div>
      )}

      {/* EXPANDABLE TELEMETRY TERMINAL MODAL (Flight Director Console) */}
      {showTerminal && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200">
          <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-lg font-mono font-black text-white tracking-wider">
                MISSION CONTROL // FLIGHT DIRECTOR TELEMETRY TERMINAL
              </h2>
            </div>
            
            <button
              onClick={() => setShowTerminal(false)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-cyan-500/20"
            >
              RETURN TO 3D SURFACE VIEW [ESC / V]
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <MissionControl
              state={state}
              onAdvanceSol={onAdvanceSol}
              onTogglePause={onTogglePause}
              onChangeSpeed={onChangeSpeed}
              onSilenceMasterAlarm={onSilenceMasterAlarm}
              onManualAction={onManualAction}
              onAbortMission={onAbortMission}
            />
          </div>
        </div>
      )}

      {/* IN-GAME PAUSE MENU MODAL */}
      {showPauseMenu && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-950 border-2 border-cyan-500/60 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl shadow-cyan-950/80 flex flex-col items-center gap-4 text-center font-mono">
            <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-widest text-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>EXPEDITION PAUSED</span>
            </div>
            
            <h2 className="text-2xl font-black text-white tracking-wider">
              MISSION PAUSE
            </h2>

            <div className="flex flex-col gap-2.5 w-full mt-2 text-xs font-bold">
              <button
                onClick={() => {
                  setShowPauseMenu(false);
                  soundEngine.playButtonClick();
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black tracking-wider transition shadow-lg hover:scale-105 active:scale-95"
              >
                ▶ RESUME EXPEDITION [ESC]
              </button>

              <button
                onClick={() => {
                  setShowPauseMenu(false);
                  setShowTerminal(true);
                  soundEngine.playButtonClick();
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 transition"
              >
                📊 FLIGHT TELEMETRY & RECHARTS [V]
              </button>

              <button
                onClick={() => {
                  setShowSettings(true);
                  soundEngine.playButtonClick();
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
              >
                ⚙️ AUDIO & 4GB LOW SETTINGS
              </button>

              <button
                onClick={() => {
                  if (confirm('Restart current expedition from Sol 1?')) {
                    setShowPauseMenu(false);
                    onAbortMission();
                  }
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className="py-2.5 px-4 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-amber-400 border border-amber-900/40 transition"
              >
                🔄 RESTART EXPEDITION
              </button>

              <button
                onClick={() => {
                  if (confirm('Quit to Title Menu? Current progress is saved.')) {
                    setShowPauseMenu(false);
                    onExitToTitle();
                  }
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className="py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 transition mt-1"
              >
                🚪 QUIT TO TITLE MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME SETTINGS MODAL */}
      {showSettings && (
        <GameSettingsModal
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          ambientHumEnabled={ambientHumEnabled}
          setAmbientHumEnabled={setAmbientHumEnabled}
          bgmEnabled={bgmEnabled}
          setBgmEnabled={setBgmEnabled}
          quality={quality}
          setQuality={handleQualityChange}
          onClose={() => setShowSettings(false)}
        />
      )}

    </div>
  );
};
