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
  ChevronDown,
  HelpCircle,
  CheckCircle2,
  Check,
  Target,
  X,
  Sun
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

interface ScreenWaypoint {
  target: InteractiveTarget;
  screenPos: { x: number; y: number; visible: boolean; distance: number };
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
  const [showWelcomeGuide, setShowWelcomeGuide] = useState<boolean>(state.currentSol === 1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [ambientHumEnabled, setAmbientHumEnabled] = useState<boolean>(true);
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(false);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<{ title: string; detail: string } | null>(null);
  const [fps, setFps] = useState<number>(60);

  // Floating 3D Waypoints
  const [waypoints, setWaypoints] = useState<ScreenWaypoint[]>([]);

  // Guided Objective Checklist
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [astroSpeech, setAstroSpeech] = useState<string>(
    `Welcome to ${state.config.destination === 'mars' ? 'Mars' : 'the Moon'}, Commander! Follow the floating waypoints to inspect your base!`
  );

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

  // Project 3D Waypoints to Screen Coordinates
  useEffect(() => {
    let animId: number;
    const updateScreenWaypoints = () => {
      if (sceneRef.current) {
        const targets = sceneRef.current.getTargets();
        const pts: ScreenWaypoint[] = [];
        for (const t of targets) {
          const coords = sceneRef.current.getScreenCoordinates(t.position);
          if (coords && coords.visible) {
            pts.push({ target: t, screenPos: coords });
          }
        }
        setWaypoints(pts);
      }
      animId = requestAnimationFrame(updateScreenWaypoints);
    };
    animId = requestAnimationFrame(updateScreenWaypoints);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Sync alarms & weather
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.setAlarmState(masterAlarmActive);
    sceneRef.current.setStormState(state.activeCrisis?.event.category === 'environmental');
  }, [masterAlarmActive, state.activeCrisis]);

  // Dynamic A.S.T.R.O. advice based on resources
  useEffect(() => {
    if (masterAlarmActive) {
      setAstroSpeech("⚠️ RED ALERT! Check the flashing alarm on your HUD and take emergency action!");
    } else if (resources.oxygenKg < crewCount * 1.5) {
      setAstroSpeech("💨 OXYGEN CRITICAL! Head to the Central Habitat or ECLSS Scrubber right now!");
    } else if (resources.storedEnergyKWh < 25) {
      setAstroSpeech("⚡ BATTERIES LOW! Run to the Solar Array waypoint to wipe away dust grit!");
    } else if (resources.waterLiters < crewCount * 3.5) {
      setAstroSpeech("💧 WATER LOW! Walk or drive over to a blue Ice Pocket and drill fresh water!");
    }
  }, [masterAlarmActive, resources.oxygenKg, resources.storedEnergyKWh, resources.waterLiters, crewCount]);

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
      setCompletedTasks(prev => [...prev, 'solar']);
      setAstroSpeech("Awesome! Solar panels cleared of dust grit. Restored +30 kWh auxiliary power!");
      showToast('⚡ Power Grid Serviced!', 'Cleared surface dust grit. Restored +30 kWh auxiliary reserve.');
    } else if (target.type === 'airlock') {
      onManualAction('eva_repair');
      setCompletedTasks(prev => [...prev, 'airlock']);
      setAstroSpeech("Great work Commander! Airlock sealed and hull micro-cracks repaired (+15% integrity).");
      showToast('🛡️ Airlock & Hull Sealed!', 'Completed structural maintenance. Restored +15% habitat integrity.');
    } else if (target.type === 'scrubber') {
      onManualAction('purge_scrubbers');
      setCompletedTasks(prev => [...prev, 'scrubber']);
      setAstroSpeech("Scrubbers purged! CO₂ levels dropped and fresh O₂ was added into the cabin.");
      showToast('💨 ECLSS Purged!', 'Regenerated amine scrubbers. Purged CO₂ and added +5 kg O₂.');
    } else if (target.type === 'greenhouse') {
      if (onAddResource) {
        onAddResource('food', 400, 'Greenhouse crops tended: +400 kcal harvested.');
      }
      setCompletedTasks(prev => [...prev, 'greenhouse']);
      setAstroSpeech("Delicious! Fresh aeroponic microgreens harvested for the astronaut crew (+400 kcal).");
      showToast('🌱 Crops Harvested!', 'Cultivated fresh aeroponic vegetables (+400 kcal nutrition).');
    } else if (target.type === 'ice_deposit') {
      if (onAddResource) {
        onAddResource('water', 15, 'Drilled subsurface ice pocket: +15L purified water extracted.');
      }
      setCompletedTasks(prev => [...prev, 'ice']);
      setAstroSpeech("Excellent drilling! Volatile glacial water ice extracted (+15 Liters) into life support tanks!");
      showToast('💧 Glacial Ice Extracted!', 'Drilled subsurface volatile ice pocket (+15 Liters potable water).');
    } else if (target.type === 'rover') {
      setCompletedTasks(prev => [...prev, 'rover']);
      setAstroSpeech("Rover mounted! Use WASD to drive across crater ridges at double speed.");
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
        } else if (showWelcomeGuide) {
          setShowWelcomeGuide(false);
        } else {
          setShowPauseMenu(prev => !prev);
        }
        soundEngine.playButtonClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTerminal, showSettings, showWelcomeGuide]);

  // Determine current active guided objective
  const getActiveObjective = () => {
    if (!completedTasks.includes('solar')) {
      return {
        title: 'TASK 1: Service Solar Array Farm',
        instruction: 'Follow the yellow waypoint marker to the Solar Farm and press [E] to clean dust!',
        reward: '+30 kWh Power'
      };
    }
    if (!completedTasks.includes('ice')) {
      return {
        title: 'TASK 2: Drill Glacial Water Ice Pocket',
        instruction: 'Find the cyan Ice Pocket waypoint in the crater and press [E] to drill fresh water!',
        reward: '+15L Potable Water'
      };
    }
    if (!completedTasks.includes('airlock')) {
      return {
        title: 'TASK 3: Inspect Habitat Airlock',
        instruction: 'Walk to the Central Habitat Airlock and press [E] to seal hull breaches.',
        reward: '+15% Hull Integrity'
      };
    }
    if (!completedTasks.includes('rover')) {
      return {
        title: 'TASK 4: Test Planetary Exploration Rover',
        instruction: 'Walk to the rover vehicle marker and press [E] to drive across the crater at 2x speed.',
        reward: 'High-Speed Traversal'
      };
    }
    return {
      title: 'DAILY DIRECTIVE: Advance Sol (Day)',
      instruction: 'All maintenance nominal! Click "ADVANCE SOL [>]" on top-right to progress to next day.',
      reward: `Goal: Survive to Sol ${config.targetSolDuration}`
    };
  };

  const activeObj = getActiveObjective();

  const getWaypointIcon = (type: string) => {
    switch (type) {
      case 'solar': return '☀️';
      case 'airlock': return '🏠';
      case 'greenhouse': return '🌱';
      case 'scrubber': return '💨';
      case 'ice_deposit': return '💧';
      case 'rover': return '🚗';
      default: return '📍';
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none font-mono">
      
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Visual Scanline Effect (Ultra-light CSS) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.45)_100%)]" />

      {/* 1. TOP SCI-FI GAME HUD */}
      <div className="absolute top-3 inset-x-3 pointer-events-none flex flex-col gap-2 z-20">
        <div className="flex items-center justify-between gap-3">
          
          {/* Mission & Sol Pill */}
          <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 shadow-xl text-xs">
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
                onClick={() => {
                  onAdvanceSol();
                  soundEngine.playSolDayChime();
                }}
                title="Advance to Next Sol (Day)"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-[10px] shadow-lg shadow-cyan-500/30 active:scale-95 transition"
              >
                <span>NEXT SOL</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Survival Vitals Bars (Plain English & Color Coded) */}
          <div className="hidden lg:flex pointer-events-auto items-center gap-2 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-xl text-xs">
            
            {/* O2 */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800/50" title="Oxygen: 0.84kg/astronaut daily burn">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-cyan-400 font-bold">OXYGEN</span>
                <span className="font-bold text-xs">{Math.round(resources.oxygenKg)} kg</span>
              </div>
            </div>

            {/* H2O */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/50 text-blue-300 border border-blue-800/50" title="Water: 2.8L/astronaut daily + recycling">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-blue-400 font-bold">WATER</span>
                <span className="font-bold text-xs">{Math.round(resources.waterLiters)} L</span>
              </div>
            </div>

            {/* Power */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition ${
              resources.storedEnergyKWh < 30 
                ? 'bg-amber-950/80 text-amber-300 border-amber-500 animate-pulse' 
                : 'bg-amber-950/50 text-amber-300 border-amber-800/50'
            }`} title="Stored battery power. Clean solar panels if low!">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-amber-400 font-bold">POWER</span>
                <span className="font-bold text-xs">{Math.round(resources.storedEnergyKWh)} kWh</span>
              </div>
            </div>

            {/* Food */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800/50" title="Crew food calories">
              <Apple className="w-3.5 h-3.5 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-emerald-400 font-bold">FOOD</span>
                <span className="font-bold text-xs">{Math.round(resources.foodKcal / 1000)}k kcal</span>
              </div>
            </div>

            {/* Integrity */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition ${
              resources.habitatIntegrityPct < 40
                ? 'bg-red-950/80 text-red-300 border-red-500 animate-pulse'
                : 'bg-indigo-950/50 text-indigo-300 border-indigo-800/50'
            }`} title="Habitat structural hull durability">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-indigo-400 font-bold">HULL</span>
                <span className="font-bold text-xs">{Math.round(resources.habitatIntegrityPct)}%</span>
              </div>
            </div>
          </div>

          {/* Right Controls: Quality, Telemetry, Menu */}
          <div className="pointer-events-auto flex items-center gap-2">
            
            {/* Quick How to Play Guide Button */}
            <button
              onClick={() => {
                setShowWelcomeGuide(true);
                soundEngine.playButtonClick();
              }}
              onMouseEnter={() => soundEngine.playButtonHover()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition shadow-lg"
              title="View Mission Instructions"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GUIDE [?]</span>
            </button>

            {/* Master Alarm Silence */}
            {masterAlarmActive && (
              <button
                onClick={onSilenceMasterAlarm}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs animate-bounce shadow-lg shadow-red-900/50"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SILENCE ALARM</span>
              </button>
            )}

            {/* Telemetry Modal [V] */}
            <button
              onClick={() => {
                setShowTerminal(prev => !prev);
                soundEngine.playButtonClick();
              }}
              onMouseEnter={() => soundEngine.playButtonHover()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-lg ${
                showTerminal 
                  ? 'bg-cyan-500 text-slate-950 border border-cyan-400' 
                  : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TELEMETRY [V]</span>
            </button>

            {/* In-Game Menu [ESC] */}
            <button
              onClick={() => {
                setShowPauseMenu(prev => !prev);
                soundEngine.playButtonClick();
              }}
              onMouseEnter={() => soundEngine.playButtonHover()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition shadow-lg"
              title="Pause Game [ESC]"
            >
              <span>MENU [ESC]</span>
            </button>
          </div>
        </div>

        {/* 2. DYNAMIC MISSION DIRECTIVE (Always tells player what to do!) */}
        <div className="flex justify-center mt-1">
          <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border-2 border-amber-500/60 shadow-2xl shadow-black flex items-center gap-3 max-w-xl text-center animate-in fade-in slide-in-from-top-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Target className="w-4 h-4 animate-spin" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <span>{activeObj.title}</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400">Reward: {activeObj.reward}</span>
              </div>
              <div className="text-xs text-slate-200 font-sans">
                {activeObj.instruction}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 3D FLOATING IN-WORLD WAYPOINTS (Projects directly onto 3D buildings!) */}
      {waypoints.map((wp) => {
        const isNear = wp.screenPos.distance <= wp.target.radius;
        const icon = getWaypointIcon(wp.target.type);

        return (
          <div
            key={wp.target.id}
            style={{
              left: `${wp.screenPos.x}px`,
              top: `${wp.screenPos.y - 30}px`,
              transform: 'translate(-50%, -100%)',
            }}
            onClick={() => {
              if (isNear) handleExecuteTargetAction();
            }}
            className={`absolute pointer-events-auto cursor-pointer transition-transform duration-75 flex flex-col items-center select-none z-10 ${
              isNear ? 'scale-110' : 'hover:scale-105'
            }`}
          >
            {/* Floating Tag */}
            <div className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-2xl flex items-center gap-1.5 border transition ${
              isNear 
                ? 'bg-gradient-to-r from-cyan-400 to-amber-300 text-slate-950 border-white shadow-cyan-500/60 animate-pulse' 
                : 'bg-slate-950/85 backdrop-blur-md text-cyan-300 border-cyan-500/40 shadow-black'
            }`}>
              <span>{icon}</span>
              <span>{wp.target.name}</span>
              <span className="opacity-75 font-normal">[{wp.screenPos.distance}m]</span>
            </div>

            {/* Pointer Down Arrow */}
            <div className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${
              isNear ? 'border-t-cyan-300' : 'border-t-cyan-500/60'
            }`} />
          </div>
        );
      })}

      {/* 4. INTERACTIVE ACTION PROMPT (Center Screen when near any module) */}
      {activeTarget && (
        <div className="absolute bottom-20 sm:bottom-24 inset-x-0 flex justify-center z-30 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-xl border-2 border-cyan-400/90 rounded-2xl p-4 sm:p-5 max-w-md mx-4 shadow-2xl shadow-cyan-950/90 text-center flex flex-col items-center gap-2">
            
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{activeTarget.name}</span>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm font-sans">
              {activeTarget.detail}
            </p>

            <button
              onClick={handleExecuteTargetAction}
              className="mt-1 flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-amber-300 hover:from-cyan-300 hover:to-amber-200 text-slate-950 font-black text-sm tracking-wider shadow-xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition"
            >
              <span className="bg-slate-950 text-cyan-300 px-2 py-0.5 rounded text-xs">PRESS E</span>
              <span>{activeTarget.actionPrompt.replace(/^\[E\]\s*/, '')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTION CONFIRMATION TOAST */}
      {actionToast && (
        <div className="absolute top-28 inset-x-0 flex justify-center z-30 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="bg-emerald-950/95 border-2 border-emerald-500/80 rounded-xl px-5 py-2.5 shadow-2xl shadow-emerald-950/80 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-emerald-300 font-bold text-xs">{actionToast.title}</div>
              <div className="text-emerald-100/80 text-[11px]">{actionToast.detail}</div>
            </div>
          </div>
        </div>
      )}

      {/* 5. BOTTOM-LEFT: A.S.T.R.O. ROBOT GUIDE & CONTROLS HELPER */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 pointer-events-none max-w-sm">
        
        {/* A.S.T.R.O. Robot Assistant */}
        <div 
          onClick={() => {
            soundEngine.playBeep(980, 0.04);
            setAstroSpeech(
              activeObj.instruction + " " +
              "Tip: Click Next Sol in the top right whenever your maintenance is finished!"
            );
          }}
          className="pointer-events-auto bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/40 shadow-2xl flex items-center gap-3 cursor-pointer hover:border-cyan-400 transition group"
          title="Click A.S.T.R.O. for a mission hint!"
        >
          {/* Animated Robot Face */}
          <div className="relative w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400 flex items-center justify-center shrink-0">
            <div className="flex gap-1.5">
              <span className="w-1.5 h-2.5 bg-cyan-300 rounded-full animate-pulse" />
              <span className="w-1.5 h-2.5 bg-cyan-300 rounded-full animate-pulse" />
            </div>
            <span className="absolute -top-1 w-2 h-1 bg-cyan-400 rounded-full" />
          </div>

          <div className="text-left font-sans">
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>A.S.T.R.O. ASSISTANT</span>
              <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1 rounded">CLICK FOR HINT</span>
            </div>
            <div className="text-xs text-slate-200 mt-0.5 leading-snug">
              {astroSpeech}
            </div>
          </div>
        </div>

        {/* Camera Selector Dock */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl text-xs">
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

        {/* Keyboard Legend Helper */}
        <div className="hidden md:flex pointer-events-auto items-center gap-2 text-[10px] text-slate-400 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">WASD</kbd> Walk</span>
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">Space</kbd> Jump</span>
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">E</kbd> Action</span>
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">C</kbd> Camera</span>
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">V</kbd> Graphs</span>
        </div>
      </div>

      {/* 6. BOTTOM-RIGHT: MINIMAP RADAR & TOUCH D-PAD */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
        
        {/* Toggle on-screen touch D-Pad */}
        <button
          onClick={() => setShowTouchControls(prev => !prev)}
          className="pointer-events-auto md:hidden px-3 py-1.5 rounded-xl bg-slate-900/90 text-cyan-300 border border-slate-700 text-xs flex items-center gap-1.5"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{showTouchControls ? 'Hide Touch' : 'Touch D-Pad'}</span>
        </button>

        {/* Holographic Radar / Minimap */}
        <div className="pointer-events-auto w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 p-2 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between text-[9px] text-cyan-400 tracking-wider">
            <span>SURFACE RADAR</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          
          <div className="relative flex-1 rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden mt-1 flex items-center justify-center">
            {/* Concentric distance rings */}
            <div className="absolute w-24 h-24 rounded-full border border-cyan-500/15" />
            <div className="absolute w-12 h-12 rounded-full border border-cyan-500/25" />
            
            {/* Central Hab marker */}
            <div className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" title="Central Hab" />
            
            {/* Solar Farm */}
            <div className="absolute -left-6 w-2 h-2 rounded bg-amber-400" title="Solar Array" />
            {/* Greenhouse */}
            <div className="absolute left-6 -top-1 w-2 h-2 rounded bg-emerald-400" title="Greenhouse" />
            {/* Water Ice Deposits */}
            <div className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" title="Ice Pocket" />
            <div className="absolute -bottom-2 -left-3 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" title="Ice Pocket" />
            
            {/* Scanner line */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-pulse" />
          </div>
        </div>
      </div>

      {/* 7. WELCOME / HOW TO PLAY POPUP (Sol 1 Quick Guide) */}
      {showWelcomeGuide && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-950 border-2 border-cyan-400/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-cyan-950/90 flex flex-col gap-4 text-center">
            
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-bold tracking-widest uppercase mx-auto">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>EXPEDITION BRIEFING</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider">
              HOW TO PLAY & SURVIVE
            </h2>

            <div className="grid grid-cols-1 gap-2.5 text-left text-xs font-sans mt-1">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <span className="text-xl">🎯</span>
                <div>
                  <strong className="text-cyan-300 block font-mono">1. YOUR GOAL</strong>
                  Keep Oxygen, Water, and Power above 0 until Sol {config.targetSolDuration}! If any tank empties, the mission fails.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <strong className="text-amber-300 block font-mono">2. FOLLOW 3D WAYPOINTS</strong>
                  Floating badges show where to walk. Walk to the Solar Farm to clear dust, or drill blue Ice Pockets for water!
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <span className="text-xl">⏭️</span>
                <div>
                  <strong className="text-emerald-300 block font-mono">3. ADVANCE EACH SOL</strong>
                  Each Sol represents 1 full day. When your daily field tasks are done, click <span className="text-cyan-300 font-mono font-bold">NEXT SOL</span> on top-right to progress!
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowWelcomeGuide(false);
                soundEngine.playLaunchTone();
              }}
              className="mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-amber-300 hover:from-cyan-300 hover:to-amber-200 text-slate-950 font-black text-sm tracking-widest shadow-xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition"
            >
              ROGER THAT, LET'S SURVIVE! [SPACE / ENTER]
            </button>
          </div>
        </div>
      )}

      {/* 8. MOBILE TOUCH D-PAD */}
      {showTouchControls && (
        <div className="absolute bottom-20 left-4 z-30 flex flex-col items-center gap-1 pointer-events-auto md:hidden">
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

      {/* 9. IN-GAME PAUSE MENU MODAL */}
      {showPauseMenu && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-950 border-2 border-cyan-500/60 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl shadow-cyan-950/80 flex flex-col items-center gap-4 text-center">
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
                  setShowWelcomeGuide(true);
                  soundEngine.playButtonClick();
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 transition"
              >
                📖 HOW TO PLAY BRIEFING
              </button>

              <button
                onClick={() => {
                  setShowPauseMenu(false);
                  setShowTerminal(true);
                  soundEngine.playButtonClick();
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
              >
                📊 FLIGHT TELEMETRY DATA [V]
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

      {/* 10. EXPANDABLE TELEMETRY TERMINAL (Flight Director Console) */}
      {showTerminal && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200">
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

      {/* 11. GAME SETTINGS MODAL */}
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
