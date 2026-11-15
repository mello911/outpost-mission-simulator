import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  MissionState, 
  Astronaut, 
  GeologicalSample, 
  DeployedScienceStation, 
  SuitEVAState,
  DiscoveryCodexItem 
} from '../types';
import { 
  OutpostScene, 
  CameraMode, 
  GraphicsQuality, 
  InteractiveTarget,
  SuitVitals,
  DrillMinigameState
} from '../game3d/OutpostScene';
import { soundEngine } from '../utils/audio';
import { checkAndUnlockAchievement } from '../utils/achievements';
import { DISCOVERY_CODEX_DATA } from '../data/nasaScience';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  AlertTriangle, 
  Wind, 
  Droplets, 
  Zap, 
  Apple, 
  ShieldAlert, 
  Compass, 
  Flashlight, 
  Camera, 
  Car, 
  User, 
  Layers, 
  Sparkles, 
  HelpCircle, 
  Target, 
  BookOpen,
  Award,
  Crosshair,
  Gauge,
  Flame,
  Radio,
  X,
  CheckCircle2,
  Lock,
  ExternalLink,
  Maximize,
  Minimize,
  Rocket,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { MissionControl } from './MissionControl';
import { GameSettingsModal } from './GameSettingsModal';
import { AchievementsModal } from './AchievementsModal';

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
  const [quality, setQuality] = useState<GraphicsQuality>('low');
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [showPauseMenu, setShowPauseMenu] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState<boolean>(state.currentSol === 1);
  const [showCodex, setShowCodex] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [selectedCodexItem, setSelectedCodexItem] = useState<DiscoveryCodexItem | null>(null);

  // Settings
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [ambientHumEnabled, setAmbientHumEnabled] = useState<boolean>(true);
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(false);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<{ title: string; detail: string } | null>(null);
  const [fps, setFps] = useState<number>(60);

  // New Physics & Game Elements State
  const [suitVitals, setSuitVitals] = useState<SuitVitals>({
    oxygenPct: 100,
    batteryPct: 100,
    rcsFuelPct: 100,
    isWarning: false,
  });
  const [scannerActive, setScannerActive] = useState<boolean>(false);
  const [carriedSample, setCarriedSample] = useState<GeologicalSample | null>(null);
  const [carriedAlsep, setCarriedAlsep] = useState<boolean>(false);
  const [drillState, setDrillState] = useState<DrillMinigameState>({
    active: false,
    targetId: null,
    targetName: '',
    pressure: 0,
    sweetSpotMin: 45,
    sweetSpotMax: 75,
    progress: 0,
    heat: 0,
    extractedLitres: 0,
  });
  const [xp, setXp] = useState<number>(100);
  const [discoveredCodexIds, setDiscoveredCodexIds] = useState<string[]>(['codex_blue_sunset', 'codex_rover_mobility']);
  const [playerCoords, setPlayerCoords] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 10 });

  // Floating 3D Waypoints
  const [waypoints, setWaypoints] = useState<ScreenWaypoint[]>([]);

  // Guided Objective Checklist
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [astroSpeech, setAstroSpeech] = useState<string>(
    `Welcome to ${state.config.destination === 'mars' ? 'Mars' : 'the Moon'}, Commander! Press [Q] to toggle your AR Visor Scanner, or follow waypoints to inspect your base!`
  );

  const { resources, crew, currentSol, config, masterAlarmActive, isPaused, simulationSpeed } = state;
  const livingCrew = crew.filter(c => c.status !== 'incapacitated');
  const crewCount = livingCrew.length;

  // Rank progression calculator
  const getAstronautRank = (points: number) => {
    if (points < 300) return { level: 1, title: 'Cadet Surveyor', nextXP: 300, perk: 'Basic EVA Suit & RCS Thruster' };
    if (points < 750) return { level: 2, title: 'Planetary Geologist', nextXP: 750, perk: '+15% Specimen Analysis Speed' };
    if (points < 1350) return { level: 3, title: 'Outpost Systems Specialist', nextXP: 1350, perk: '+20% Suit Battery Efficiency' };
    if (points < 2200) return { level: 4, title: 'Senior Expedition Commander', nextXP: 2200, perk: '+25% RCS Cold-Gas Thruster Velocity' };
    return { level: 5, title: 'Artemis & Ares Pioneer Legend', nextXP: 3500, perk: 'Golden Visor & Master Flight Director Rank' };
  };

  const rank = getAstronautRank(xp);

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

    scene.onDrillComplete = (yieldLitres) => {
      if (onAddResource) {
        onAddResource('water', yieldLitres, `Cryo-rotary drill harvested +${yieldLitres}L potable water.`);
      }
      checkAndUnlockAchievement('ice_miner');
      setXp(prev => prev + 180);
      setCompletedTasks(prev => [...prev, 'ice']);
      setDiscoveredCodexIds(prev => Array.from(new Set([...prev, 'codex_permafrost'])));
      showToast('💧 Ice Core Extracted!', `Harvested +${yieldLitres}L potable water for life support tanks (+180 Science XP).`);
      setAstroSpeech('Spectacular drilling, Commander! Subsurface cryogenic ice successfully converted to potable water!');
    };

    scene.onSampleCollected = (sample) => {
      setCarriedSample(sample);
      checkAndUnlockAchievement('geology_collector');
      setXp(prev => prev + sample.scienceValue);
      const codexId = sample.mineralType === 'hematite' ? 'codex_hematite' : sample.mineralType === 'ilmenite' ? 'codex_ilmenite' : 'codex_permafrost';
      setDiscoveredCodexIds(prev => Array.from(new Set([...prev, codexId])));
      showToast(`💎 ${sample.name} Collected!`, `Elemental analysis complete (+${sample.scienceValue} Science XP). Press [G] to throw in low gravity.`);
      setAstroSpeech(`Fascinating find! ${sample.name} contains vital extraterrestrial resources. Press [G] anytime to throw it and watch low-gravity physics!`);
    };

    scene.onStationDeployed = (station) => {
      setCarriedAlsep(false);
      checkAndUnlockAchievement('alsep_deployment');
      setXp(prev => prev + 250);
      setDiscoveredCodexIds(prev => Array.from(new Set([...prev, 'codex_alsep'])));
      showToast('📡 ALSEP Observatory Online!', 'Erected surface science package. Transmitting seismic & radiation data (+250 XP).');
      setAstroSpeech('Awesome deployment! The ALSEP station is transmitting deep-space telemetry back to Houston!');
    };

    scene.onSupplySalvaged = (salvage) => {
      if (onAddResource) {
        onAddResource('energy', salvage.energy, 'Auxiliary fuel cells salvaged: +30 kWh');
        onAddResource('water', salvage.water, 'Potable water packs recovered: +15L');
        onAddResource('integrity', salvage.integrity, 'Structural nanogel sealant applied: +12%');
      }
      checkAndUnlockAchievement('supply_salvage');
      setXp(prev => prev + 220);
      showToast('📦 Resupply Capsule Salvaged!', `Recovered +${salvage.energy} kWh power, +${salvage.water}L water, and +${salvage.integrity}% hull integrity!`);
      setAstroSpeech('Emergency payload unpacked! Crucial reserves added to outpost life support!');
    };

    scene.onSuitVitalsChange = (vitals) => {
      setSuitVitals({ ...vitals });
    };

    // FPS estimator
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

  // Project 3D Waypoints & Read Player Position / Drill State
  useEffect(() => {
    let animId: number;
    const updateLoop = () => {
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

        // Update player coordinates and drill state
        const pPos = sceneRef.current.getPlayerPosition();
        setPlayerCoords({
          x: Math.round(pPos.x * 10) / 10,
          y: Math.round(pPos.y * 10) / 10,
          z: Math.round(pPos.z * 10) / 10,
        });
        setDrillState(sceneRef.current.getDrillState());
        setCarriedAlsep(sceneRef.current.getCarriedAlsep());
      }
      animId = requestAnimationFrame(updateLoop);
    };
    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Sync alarms & weather
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.setAlarmState(masterAlarmActive);
    sceneRef.current.setStormState(state.activeCrisis?.event.category === 'environmental');
  }, [masterAlarmActive, state.activeCrisis]);

  // Dynamic A.S.T.R.O. advice based on resources & vitals
  useEffect(() => {
    if (masterAlarmActive) {
      setAstroSpeech("⚠️ RED ALERT! Check the flashing alarm on your HUD and take emergency action!");
    } else if (suitVitals.oxygenPct < 25) {
      setAstroSpeech("⚠️ SUIT OXYGEN LOW! Return to the Central Habitat or enter the pressurized rover immediately to recharge!");
    } else if (resources.oxygenKg < crewCount * 1.5) {
      setAstroSpeech("💨 OXYGEN CRITICAL! Head to the Central Habitat or ECLSS Scrubber right now!");
    } else if (resources.storedEnergyKWh < 25) {
      setAstroSpeech("⚡ BATTERIES LOW! Run to the Solar Array waypoint to wipe away dust grit!");
    } else if (resources.waterLiters < crewCount * 3.5) {
      setAstroSpeech("💧 WATER LOW! Walk or drive over to an Ice Pocket and engage the resonant rotary drill!");
    }
  }, [masterAlarmActive, suitVitals.oxygenPct, resources.oxygenKg, resources.storedEnergyKWh, resources.waterLiters, crewCount]);

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

  // Scanner toggle
  const handleToggleScanner = () => {
    if (sceneRef.current) {
      const active = sceneRef.current.toggleScanner();
      setScannerActive(active);
    }
  };

  // Throw Rock Sample
  const handleThrowRock = () => {
    if (sceneRef.current) {
      const thrown = sceneRef.current.throwRockSample();
      if (thrown) {
        setCarriedSample(null);
        showToast('🎯 Specimen Thrown!', 'Sample launched into low-gravity parabolic trajectory.');
      }
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
      setXp(prev => prev + 120);
      setAstroSpeech("Awesome! Solar panels cleared of dust grit. Restored +30 kWh auxiliary power!");
      showToast('⚡ Power Grid Serviced!', 'Cleared surface dust grit. Restored +30 kWh auxiliary reserve (+120 XP).');
    } else if (target.type === 'airlock') {
      onManualAction('eva_repair');
      setCompletedTasks(prev => [...prev, 'airlock']);
      setXp(prev => prev + 100);
      setAstroSpeech("Great work Commander! Airlock sealed and hull micro-cracks repaired (+15% integrity).");
      showToast('🛡️ Airlock & Hull Sealed!', 'Completed structural maintenance. Restored +15% habitat integrity (+100 XP).');
    } else if (target.type === 'scrubber') {
      onManualAction('purge_scrubbers');
      setCompletedTasks(prev => [...prev, 'scrubber']);
      setXp(prev => prev + 100);
      setAstroSpeech("Scrubbers purged! CO₂ levels dropped and fresh O₂ was added into the cabin.");
      showToast('💨 ECLSS Purged!', 'Regenerated amine scrubbers. Purged CO₂ and added +5 kg O₂ (+100 XP).');
    } else if (target.type === 'greenhouse') {
      if (onAddResource) {
        onAddResource('food', 400, 'Greenhouse crops tended: +400 kcal harvested.');
      }
      setCompletedTasks(prev => [...prev, 'greenhouse']);
      setXp(prev => prev + 100);
      setAstroSpeech("Delicious! Fresh aeroponic microgreens harvested for the astronaut crew (+400 kcal).");
      showToast('🌱 Crops Harvested!', 'Cultivated fresh aeroponic vegetables (+400 kcal nutrition).');
    } else if (target.type === 'rover') {
      setCompletedTasks(prev => [...prev, 'rover']);
      setXp(prev => prev + 80);
      setAstroSpeech("Rover mounted! Use WASD to steer, and hold [Shift] for high-voltage Turbo Boost!");
      showToast('🚗 Rover Mounted', 'Drive across crater ridges with 6-wheel suspension. Press Shift for Turbo Boost!');
    }
  }, [onManualAction, onAddResource]);

  // Primary action button handler (E: Interact / Drill Pulse / ALSEP deploy / Salvage)
  const handlePrimaryAction = useCallback(() => {
    if (drillState.active && sceneRef.current) {
      sceneRef.current.pulseDrillPressure();
      return;
    }
    handleExecuteTargetAction();
  }, [drillState.active, handleExecuteTargetAction]);

  // Camera cycle handler [C]
  const handleCycleCamera = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.cycleCamera();
      setCameraMode(sceneRef.current.cameraMode);
    }
  }, []);

  // Fullscreen state tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(async () => {
    soundEngine.playBeep(1100, 0.04);
    try {
      const doc = document as unknown as {
        fullscreenElement?: Element;
        webkitFullscreenElement?: Element;
        exitFullscreen?: () => Promise<void>;
        webkitExitFullscreen?: () => Promise<void>;
      };
      const docEl = document.documentElement as unknown as {
        requestFullscreen?: () => Promise<void>;
        webkitRequestFullscreen?: () => Promise<void>;
      };

      if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  }, []);

  // Prevent unwanted mobile zoom gestures and pull-to-refresh
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('gesturestart', preventGesture, { passive: false });
    document.addEventListener('gesturechange', preventGesture, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
    };
  }, []);

  const showToast = (title: string, detail: string) => {
    setActionToast({ title, detail });
    setTimeout(() => {
      setActionToast(null);
    }, 3800);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'KeyV') {
        setShowTerminal(prev => !prev);
        soundEngine.playButtonClick();
      }
      if (e.code === 'KeyJ') {
        setShowCodex(prev => !prev);
        soundEngine.playButtonClick();
      }
      if (e.code === 'Escape') {
        if (drillState.active && sceneRef.current) {
          sceneRef.current.cancelDrill();
        } else if (showCodex) {
          setShowCodex(false);
        } else if (showTerminal) {
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
  }, [showTerminal, showSettings, showWelcomeGuide, showCodex, drillState.active]);

  // Determine current active guided objective
  const getActiveObjective = () => {
    if (!completedTasks.includes('solar')) {
      return {
        title: 'TASK 1: Service Solar Array Farm',
        instruction: 'Follow the yellow waypoint marker to the Solar Farm and press [E] to clean dust grit!',
        reward: '+30 kWh Power • +120 XP'
      };
    }
    if (!completedTasks.includes('ice')) {
      return {
        title: 'TASK 2: Resonant Cryo-Drill Ice Pocket',
        instruction: 'Find the cyan Ice Pocket waypoint and press [E] to engage the rotary drill minigame!',
        reward: '+20L Potable Water • +180 XP'
      };
    }
    if (!completedTasks.includes('airlock')) {
      return {
        title: 'TASK 3: Inspect Habitat Airlock',
        instruction: 'Walk to the Central Habitat Airlock and press [E] to seal hull breaches.',
        reward: '+15% Hull Integrity • +100 XP'
      };
    }
    if (!completedTasks.includes('rover')) {
      return {
        title: 'TASK 4: Test Planetary Exploration Rover',
        instruction: 'Walk to the rover vehicle marker and press [E] to drive across craters at high speed!',
        reward: 'High-Speed Traversal & Turbo Boost'
      };
    }
    return {
      title: 'DAILY DIRECTIVE: Advance Sol (Day)',
      instruction: 'Base nominal! Press [Q] to scan for rare minerals, or click "NEXT SOL [>]" on top-right.',
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
      case 'rock_sample': return '💎';
      case 'alsep_deploy': return '📡';
      case 'supply_drop': return '📦';
      default: return '📍';
    }
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-black select-none font-mono touch-none overscroll-none"
      style={{ touchAction: 'none' }}
    >
      
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Visual Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.45)_100%)]" />

      {/* 0. MULTISPECTRAL AR VISOR SCANNER HUD OVERLAY (Press Q) */}
      {scannerActive && (
        <div className="absolute inset-0 pointer-events-none z-15 border-2 border-cyan-500/30 flex flex-col justify-between p-6 bg-cyan-950/10 backdrop-blur-[0.5px]">
          {/* Top AR Scan Lines */}
          <div className="flex items-center justify-between text-cyan-400 text-xs tracking-wider">
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-lg border border-cyan-500/40">
              <Crosshair className="w-3.5 h-3.5 animate-spin" />
              <span>AR MULTISPECTRAL VISOR ACTIVE [Q]</span>
            </div>
            <div className="bg-slate-950/80 px-3 py-1 rounded-lg border border-cyan-500/40">
              <span>GPS: X {playerCoords.x}m • Z {playerCoords.z}m • ALT {playerCoords.y}m</span>
            </div>
          </div>

          {/* Center Targeting Reticle */}
          <div className="self-center flex flex-col items-center gap-1 opacity-75">
            <div className="w-8 h-8 border border-cyan-400/50 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            </div>
            <span className="text-[10px] text-cyan-300">XRF LASER SPECTROMETER READY</span>
          </div>

          {/* Bottom Mineral Legend */}
          <div className="flex items-center justify-between text-[11px] text-cyan-300/80">
            <div className="bg-slate-950/85 px-3 py-1.5 rounded-lg border border-cyan-500/30 flex gap-4">
              <span>🔴 Fe₂O₃ Hematite</span>
              <span>🌑 FeTiO₃ Ilmenite (ISRU O₂)</span>
              <span>🧊 H₂O Cryo-Ice</span>
              <span>🟡 ClO₄⁻ Perchlorate</span>
            </div>
            <span className="text-slate-400">PRESS [Q] / [TAB] TO CLOSE SCANNER</span>
          </div>
        </div>
      )}

      {/* 1. TOP SCI-FI GAME HUD */}
      <div className="absolute top-3 inset-x-3 pointer-events-none flex flex-col gap-2 z-20">
        <div className="flex items-center justify-between gap-3">
          
          {/* Mission & Sol Pill */}
          <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 shadow-xl text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <span>{config.destination === 'mars' ? 'MARS // ARES BASE' : 'MOON // ARTEMIS BASE'}</span>
                <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1 rounded border border-cyan-800">
                  RANK: {rank.title.toUpperCase()}
                </span>
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

          {/* Real-Time Astronaut Suit EVA Vitals Bar */}
          <div className="hidden md:flex pointer-events-auto items-center gap-3 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-xl text-xs">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mr-1">
              <User className="w-3 h-3 text-cyan-400" />
              <span>EVA SUIT</span>
            </div>

            {/* Suit O2 */}
            <div className="flex flex-col" title="Astronaut EVA suit oxygen reserves. Recharges inside airlock/rover.">
              <div className="flex justify-between text-[9px] text-cyan-300">
                <span>O₂</span>
                <span>{Math.round(suitVitals.oxygenPct)}%</span>
              </div>
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div 
                  className={`h-full transition-all duration-200 ${
                    suitVitals.oxygenPct < 25 ? 'bg-red-500 animate-pulse' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${suitVitals.oxygenPct}%` }}
                />
              </div>
            </div>

            {/* Suit Battery & Thermal */}
            <div className="flex flex-col" title="Suit thermal heating and electronics battery.">
              <div className="flex justify-between text-[9px] text-amber-300">
                <span>BATT</span>
                <span>{Math.round(suitVitals.batteryPct)}%</span>
              </div>
              <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full bg-amber-400 transition-all duration-200"
                  style={{ width: `${suitVitals.batteryPct}%` }}
                />
              </div>
            </div>

            {/* RCS Cold-Gas Thruster Fuel */}
            <div className="flex flex-col" title="Nitrogen propellant for mid-air jetpack flight (Hold Space in air).">
              <div className="flex justify-between text-[9px] text-emerald-300">
                <span>RCS</span>
                <span>{Math.round(suitVitals.rcsFuelPct)}%</span>
              </div>
              <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-200"
                  style={{ width: `${suitVitals.rcsFuelPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Survival Vitals Bars */}
          <div className="hidden lg:flex pointer-events-auto items-center gap-2 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-xl text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800/50">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-cyan-400 font-bold">OXYGEN</span>
                <span className="font-bold text-xs">{Math.round(resources.oxygenKg)} kg</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/50 text-blue-300 border border-blue-800/50">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-blue-400 font-bold">WATER</span>
                <span className="font-bold text-xs">{Math.round(resources.waterLiters)} L</span>
              </div>
            </div>

            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition ${
              resources.storedEnergyKWh < 30 ? 'bg-amber-950/80 text-amber-300 border-amber-500 animate-pulse' : 'bg-amber-950/50 text-amber-300 border-amber-800/50'
            }`}>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-amber-400 font-bold">POWER</span>
                <span className="font-bold text-xs">{Math.round(resources.storedEnergyKWh)} kWh</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800/50">
              <Apple className="w-3.5 h-3.5 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-emerald-400 font-bold">FOOD</span>
                <span className="font-bold text-xs">{Math.round(resources.foodKcal / 1000)}k kcal</span>
              </div>
            </div>

            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition ${
              resources.habitatIntegrityPct < 40 ? 'bg-red-950/80 text-red-300 border-red-500 animate-pulse' : 'bg-indigo-950/50 text-indigo-300 border-indigo-800/50'
            }`}>
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-indigo-400 font-bold">HULL</span>
                <span className="font-bold text-xs">{Math.round(resources.habitatIntegrityPct)}%</span>
              </div>
            </div>
          </div>

          {/* Right Action Docks */}
          <div className="pointer-events-auto flex items-center gap-2">
            
            {/* Field Journal / Discovery Codex [J] */}
            <button
              onClick={() => {
                setShowCodex(prev => !prev);
                soundEngine.playButtonClick();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-lg"
              title="Open Scientific Field Journal [J]"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CODEX [J]</span>
            </button>

            {/* Visor Scanner [Q] */}
            <button
              onClick={handleToggleScanner}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-lg ${
                scannerActive
                  ? 'bg-cyan-500 text-slate-950 border border-cyan-300'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40'
              }`}
              title="Toggle Multispectral Visor Scanner [Q]"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SCANNER [Q]</span>
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-lg ${
                showTerminal 
                  ? 'bg-cyan-500 text-slate-950 border border-cyan-400' 
                  : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TELEMETRY [V]</span>
            </button>

            {/* Fullscreen Toggle Button */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition shadow-lg active:scale-95"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Maximize className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="hidden sm:inline">{isFullscreen ? 'WINDOW' : 'FULLSCREEN'}</span>
            </button>

            {/* Menu [ESC] */}
            <button
              onClick={() => {
                setShowPauseMenu(prev => !prev);
                soundEngine.playButtonClick();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition shadow-lg"
              title="Pause Game [ESC]"
            >
              <span>MENU [ESC]</span>
            </button>
          </div>
        </div>

        {/* 2. DYNAMIC MISSION DIRECTIVE & STATUS BANNERS */}
        <div className="flex flex-col items-center gap-1 mt-1">
          {/* Active Task Card */}
          <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md px-5 py-2 rounded-2xl border-2 border-amber-500/60 shadow-2xl shadow-black flex items-center gap-3 max-w-xl text-center">
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

          {/* Carried Item Pill (ALSEP or Sample) */}
          {carriedAlsep && (
            <div className="pointer-events-auto bg-emerald-950/90 border border-emerald-400 px-4 py-1.5 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-bounce shadow-lg">
              <Radio className="w-3.5 h-3.5" />
              <span>CARRYING ALSEP STATION: Walk to a high ridge (&gt;22m from base) and press [E] to deploy!</span>
            </div>
          )}

          {carriedSample && (
            <div className="pointer-events-auto bg-indigo-950/90 border border-indigo-400 px-4 py-1.5 rounded-xl text-xs text-indigo-300 flex items-center gap-2 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>CARRYING SPECIMEN: {carriedSample.name} | Press [G] to throw in low gravity!</span>
              <button 
                onClick={handleThrowRock}
                className="bg-indigo-800 hover:bg-indigo-700 text-white text-[10px] px-2 py-0.5 rounded ml-2"
              >
                THROW [G]
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. 3D IN-WORLD WAYPOINTS */}
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
            <div className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-2xl flex items-center gap-1.5 border transition ${
              isNear 
                ? 'bg-gradient-to-r from-cyan-400 to-amber-300 text-slate-950 border-white shadow-cyan-500/60 animate-pulse' 
                : 'bg-slate-950/85 backdrop-blur-md text-cyan-300 border-cyan-500/40 shadow-black'
            }`}>
              <span>{icon}</span>
              <span>{wp.target.name}</span>
              <span className="opacity-75 font-normal">[{wp.screenPos.distance}m]</span>
            </div>

            <div className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${
              isNear ? 'border-t-cyan-300' : 'border-t-cyan-500/60'
            }`} />
          </div>
        );
      })}

      {/* 4. INTERACTIVE ACTION PROMPT (Center Screen) */}
      {activeTarget && !drillState.active && (
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

      {/* 5. RESONANT CRYO-ROTARY DRILL MINIGAME OVERLAY */}
      {drillState.active && (
        <div className="absolute inset-x-0 bottom-16 flex justify-center z-40 pointer-events-none animate-in fade-in slide-in-from-bottom-6">
          <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-2xl border-2 border-cyan-400 rounded-3xl p-5 sm:p-6 max-w-lg w-full mx-4 shadow-2xl shadow-cyan-950/90 flex flex-col items-center gap-4 text-center">
            
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                <Gauge className="w-4 h-4 animate-spin" />
                <span>RESONANT ROTARY CRYODRILL // {drillState.targetName.toUpperCase()}</span>
              </div>
              <button
                onClick={() => sceneRef.current?.cancelDrill()}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-900 border border-slate-800"
              >
                ABORT [ESC]
              </button>
            </div>

            {/* Pressure Gauge Meter with Sweet Spot */}
            <div className="w-full flex flex-col gap-1 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">DRILL TORQUE PRESSURE</span>
                <span className={
                  drillState.pressure >= drillState.sweetSpotMin && drillState.pressure <= drillState.sweetSpotMax
                    ? 'text-emerald-400'
                    : drillState.pressure > drillState.sweetSpotMax
                    ? 'text-red-400'
                    : 'text-amber-400'
                }>
                  {Math.round(drillState.pressure)} PSI {
                    drillState.pressure >= drillState.sweetSpotMin && drillState.pressure <= drillState.sweetSpotMax
                      ? '(RESONANT HARMONIC)'
                      : drillState.pressure > drillState.sweetSpotMax
                      ? '(OVERHEATING SUBLIMATION!)'
                      : '(UNDERPOWERED)'
                  }
                </span>
              </div>

              {/* Graphical Bar */}
              <div className="relative w-full h-6 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                {/* Green Sweet Spot Zone */}
                <div 
                  className="absolute top-0 bottom-0 bg-emerald-500/30 border-x-2 border-emerald-400"
                  style={{ left: `${drillState.sweetSpotMin}%`, width: `${drillState.sweetSpotMax - drillState.sweetSpotMin}%` }}
                />
                {/* Red Danger Zone */}
                <div 
                  className="absolute top-0 bottom-0 right-0 bg-red-500/30"
                  style={{ width: `${100 - drillState.sweetSpotMax}%` }}
                />
                {/* Needle Indicator */}
                <div 
                  className="absolute top-0 bottom-0 w-2 bg-white shadow-lg transition-all duration-75"
                  style={{ left: `${drillState.pressure}%` }}
                />
              </div>
            </div>

            {/* Core Extraction Progress & Cryo Sublimation Heat */}
            <div className="w-full grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-slate-400 text-[10px]">CORE DEPTH PROGRESS</span>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 transition-all" style={{ width: `${drillState.progress}%` }} />
                </div>
                <span className="text-cyan-300 font-bold">{Math.round(drillState.progress)}% EXTRACTED</span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-slate-400 text-[10px]">SUBLIMATION THERMAL RISK</span>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${drillState.heat > 60 ? 'bg-red-500' : 'bg-amber-400'}`} 
                    style={{ width: `${drillState.heat}%` }} 
                  />
                </div>
                <span className={drillState.heat > 60 ? 'text-red-400 font-bold' : 'text-amber-300 font-bold'}>
                  {Math.round(drillState.heat)}°C (KEEP LOW)
                </span>
              </div>
            </div>

            {/* Action Pulse Button */}
            <button
              onClick={() => sceneRef.current?.pulseDrillPressure()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm tracking-wider shadow-xl shadow-cyan-500/40 active:scale-95 transition"
            >
              TAP / HOLD [SPACE] OR CLICK TO PULSE DRILL
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

      {/* 6. BOTTOM-LEFT: A.S.T.R.O. ROBOT GUIDE & CONTROLS HELPER */}
      <div className={`absolute left-4 z-20 flex flex-col gap-2 pointer-events-none max-w-sm ${showTouchControls ? 'bottom-44 sm:bottom-48' : 'bottom-4'}`}>
        
        {/* A.S.T.R.O. Robot Assistant */}
        <div 
          onClick={() => {
            soundEngine.playBeep(980, 0.04);
            setAstroSpeech(
              activeObj.instruction + " " +
              "Tip: Hold [Space] while jumping to fire your cold-gas RCS jetpack!"
            );
          }}
          className="pointer-events-auto bg-slate-950/90 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-cyan-500/40 shadow-2xl flex items-center gap-3 cursor-pointer hover:border-cyan-400 transition group"
          title="Click A.S.T.R.O. for a mission tip!"
        >
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
        <div className="hidden md:flex pointer-events-auto flex-wrap items-center gap-2 text-[10px] text-slate-400 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">WASD</kbd> Move</span>
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">Space</kbd> Jump/RCS</span>
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">Shift</kbd> Boost</span>
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">E</kbd> Action</span>
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">Q</kbd> Scanner</span>
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">G</kbd> Throw</span>
          <span><kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">J</kbd> Codex</span>
        </div>
      </div>

      {/* 7. BOTTOM-RIGHT: MINIMAP RADAR & TOUCH CONTROLS */}
      <div 
        className="absolute bottom-4 right-4 z-30 flex flex-col items-end gap-2.5 pointer-events-none touch-none select-none"
        style={{ touchAction: 'none' }}
      >
        {/* Toggle touch HUD */}
        <button
          onClick={() => {
            soundEngine.playBeep(950, 0.04);
            setShowTouchControls(prev => !prev);
          }}
          className="pointer-events-auto px-2.5 py-1 rounded-xl bg-slate-950/90 hover:bg-slate-900 text-cyan-300 border border-cyan-500/40 text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition"
          style={{ touchAction: 'none' }}
          title="Toggle on-screen touch controls HUD"
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showTouchControls ? 'HIDE TOUCH' : 'TOUCH HUD'}</span>
        </button>

        {/* Surface Radar (compact on mobile) */}
        <div className="pointer-events-auto w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 p-1.5 sm:p-2 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-cyan-400 tracking-wider">
            <span>SURFACE RADAR</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          
          <div className="relative flex-1 rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden mt-1 flex items-center justify-center">
            <div className="absolute w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-cyan-500/15" />
            <div className="absolute w-8 h-8 sm:w-12 sm:h-12 rounded-full border border-cyan-500/25" />
            
            <div className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" title="Central Hab" />
            <div className="absolute -left-4 sm:-left-6 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded bg-amber-400" title="Solar Array" />
            <div className="absolute left-4 sm:left-6 -top-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded bg-emerald-400" title="Greenhouse" />
            <div className="absolute top-2 right-2 sm:right-3 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" title="Ice Pocket" />
            <div className="absolute -bottom-2 -left-2 sm:-left-3 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" title="Ice Pocket" />
            
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-pulse" />
          </div>
        </div>

        {/* 7B. ON-SCREEN ACTION TOUCH CONTROLS (RIGHT THUMB) */}
        {showTouchControls && (
          <div 
            className="pointer-events-auto flex flex-col items-end gap-2 select-none touch-none"
            style={{ touchAction: 'none' }}
          >
            {/* Top row: [CAMERA C] [SCANNER Q] [THROW G] */}
            <div className="flex items-center gap-2">
              {/* CAMERA (C) */}
              <button
                type="button"
                onClick={handleCycleCamera}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/90 hover:bg-slate-900 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-white flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform"
                style={{ touchAction: 'none' }}
                title="Switch Camera Mode (EVA / Rover / Drone) [C]"
                aria-label="Camera Mode"
              >
                {cameraMode === 'astronaut' ? (
                  <User className="w-4 h-4 text-cyan-400" />
                ) : cameraMode === 'rover' ? (
                  <Car className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Camera className="w-4 h-4 text-cyan-400" />
                )}
                <span className="text-[7px] sm:text-[8px] font-bold leading-none text-slate-400">CAM</span>
              </button>

              {/* SCANNER (Q) */}
              <button
                type="button"
                onClick={handleToggleScanner}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full backdrop-blur-md border flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform ${
                  scannerActive
                    ? 'bg-cyan-400 text-slate-950 border-white shadow-cyan-400/60'
                    : 'bg-slate-950/90 text-cyan-300 border-cyan-500/50 hover:bg-slate-900'
                }`}
                style={{ touchAction: 'none' }}
                title="Toggle Multispectral Visor Scanner [Q]"
                aria-label="Visor Scanner"
              >
                <Crosshair className={`w-4 h-4 ${scannerActive ? 'animate-spin' : ''}`} />
                <span className="text-[7px] sm:text-[8px] font-bold leading-none">SCAN</span>
              </button>

              {/* THROW (G) */}
              <button
                type="button"
                onClick={handleThrowRock}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full backdrop-blur-md border flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform ${
                  carriedSample
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white border-indigo-300 animate-pulse shadow-indigo-500/50'
                    : 'bg-slate-950/90 text-slate-400 border-slate-700 opacity-60'
                }`}
                style={{ touchAction: 'none' }}
                title="Throw Geological Specimen [G]"
                aria-label="Throw Specimen"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-[7px] sm:text-[8px] font-bold leading-none">THROW</span>
              </button>
            </div>

            {/* Main Action Row: [TURBO / SPRINT] [JUMP / RCS] (( LARGE CIRCULAR ACTION [E] )) */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* TURBO / SPRINT (Shift) */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  soundEngine.initContext();
                  sceneRef.current?.setVirtualInput('sprint', true);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  sceneRef.current?.setVirtualInput('sprint', false);
                }}
                onPointerLeave={() => sceneRef.current?.setVirtualInput('sprint', false)}
                onPointerCancel={() => sceneRef.current?.setVirtualInput('sprint', false)}
                className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-slate-950/90 backdrop-blur-md border border-amber-500/60 text-amber-300 hover:text-amber-200 flex flex-col items-center justify-center shadow-lg active:bg-amber-500 active:text-slate-950 active:scale-90 transition-transform"
                style={{ touchAction: 'none' }}
                title="Hold for Sprint & Rover Turbo Boost [Shift]"
                aria-label="Turbo Boost"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-[8px] font-black leading-none mt-0.5">TURBO</span>
              </button>

              {/* JUMP / RCS (Space) */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  soundEngine.initContext();
                  sceneRef.current?.setVirtualInput('jump', true);
                  if (drillState.active) {
                    sceneRef.current?.pulseDrillPressure();
                  }
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  sceneRef.current?.setVirtualInput('jump', false);
                }}
                onPointerLeave={() => sceneRef.current?.setVirtualInput('jump', false)}
                onPointerCancel={() => sceneRef.current?.setVirtualInput('jump', false)}
                className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-emerald-600/80 hover:bg-emerald-500 backdrop-blur-md border-2 border-emerald-400 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-950/60 active:bg-emerald-400 active:text-slate-950 active:scale-90 transition-transform"
                style={{ touchAction: 'none' }}
                title="Jump / Fire RCS Jetpack Thruster [Space]"
                aria-label="Jump / RCS"
              >
                <Rocket className="w-5 h-5 text-emerald-200" />
                <span className="text-[8px] sm:text-[9px] font-black leading-none mt-0.5">JUMP</span>
              </button>

              {/* [ACTION E] - Large circular button for quick interaction/drilling/salvaging */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePrimaryAction();
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  soundEngine.initContext();
                }}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center shadow-2xl active:scale-90 transition-transform select-none ${
                  drillState.active
                    ? 'bg-gradient-to-tr from-emerald-500 via-cyan-400 to-amber-300 border-3 border-white text-slate-950 shadow-cyan-400/80 animate-pulse'
                    : activeTarget
                    ? 'bg-gradient-to-tr from-cyan-400 via-amber-300 to-yellow-400 border-3 border-white text-slate-950 shadow-amber-400/80 animate-bounce'
                    : carriedAlsep
                    ? 'bg-gradient-to-tr from-emerald-500 to-cyan-400 border-2 border-emerald-300 text-slate-950 shadow-emerald-400/80'
                    : 'bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 border-2 border-cyan-300/80 text-white shadow-cyan-600/50'
                }`}
                style={{ touchAction: 'none' }}
                title="Primary Action / Drill Pulse / Salvage [E]"
                aria-label="Primary Action [E]"
              >
                {(drillState.active || activeTarget) && (
                  <span className="absolute -inset-1 rounded-full border border-cyan-400 animate-ping opacity-60 pointer-events-none" />
                )}
                <div className="flex items-center justify-center gap-0.5">
                  {drillState.active ? (
                    <Gauge className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : activeTarget ? (
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  ) : carriedAlsep ? (
                    <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  <span className="text-sm sm:text-base font-black tracking-tight font-mono">E</span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-black tracking-wider uppercase mt-0.5 leading-none">
                  {drillState.active ? 'PULSE' : carriedAlsep ? 'DEPLOY' : activeTarget ? 'INTERACT' : 'ACTION'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 8. SCIENTIFIC FIELD JOURNAL & DISCOVERY CODEX MODAL [J] */}
      {showCodex && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-950 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl shadow-amber-950/90 flex flex-col gap-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-wider">
                    SURFACE FIELD JOURNAL & NASA CODEX
                  </h2>
                  <div className="text-xs text-amber-400 flex items-center gap-2">
                    <span>RANK: {rank.title}</span>
                    <span>•</span>
                    <span>XP: {xp} / {rank.nextXP}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCodex(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Discoveries Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DISCOVERY_CODEX_DATA.map((item) => {
                const isUnlocked = discoveredCodexIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCodexItem(item)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isUnlocked
                        ? 'bg-slate-900/90 hover:bg-slate-800 border-amber-500/50 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{item.icon}</span>
                        {isUnlocked ? (
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700">
                            ANALYZED
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>LOCKED</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-200 text-sm mt-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {item.headline}
                      </p>
                    </div>

                    <div className="text-[10px] text-cyan-400 font-mono mt-3">
                      NASA Mission: {item.nasaMission}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Codex Detailed Popup */}
            {selectedCodexItem && (
              <div className="mt-2 p-4 rounded-2xl bg-slate-900 border border-cyan-500/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{selectedCodexItem.icon}</span>
                    <span>{selectedCodexItem.title}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedCodexItem(null)} 
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  <strong className="text-amber-400 block font-mono">REAL NASA SCIENTIFIC TRUTH:</strong>
                  {selectedCodexItem.scientificTruth}
                </p>
                <p className="text-xs text-cyan-300 font-sans">
                  <strong className="text-cyan-400 block font-mono">HOW OUTPOST MODELS IT:</strong>
                  {selectedCodexItem.howGameModelsIt}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. ON-SCREEN MOBILE TOUCH D-PAD (LEFT THUMB) */}
      {showTouchControls && (
        <div 
          className="absolute bottom-4 left-4 z-30 pointer-events-auto select-none touch-none"
          style={{ touchAction: 'none' }}
        >
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 bg-slate-950/75 backdrop-blur-md rounded-full border border-cyan-500/30 p-2 shadow-2xl flex items-center justify-center">
            {/* Forward (W) */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                soundEngine.initContext();
                sceneRef.current?.setVirtualInput('forward', true);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                sceneRef.current?.setVirtualInput('forward', false);
              }}
              onPointerLeave={() => sceneRef.current?.setVirtualInput('forward', false)}
              onPointerCancel={() => sceneRef.current?.setVirtualInput('forward', false)}
              className="absolute top-1.5 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-900/90 border border-cyan-500/50 text-cyan-300 font-black flex flex-col items-center justify-center shadow-md active:bg-cyan-400 active:text-slate-950 active:scale-95 transition-transform"
              style={{ touchAction: 'none' }}
              aria-label="Move Forward [W]"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="text-[8px] leading-none font-bold">W</span>
            </button>

            {/* Left (A) */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                soundEngine.initContext();
                sceneRef.current?.setVirtualInput('left', true);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                sceneRef.current?.setVirtualInput('left', false);
              }}
              onPointerLeave={() => sceneRef.current?.setVirtualInput('left', false)}
              onPointerCancel={() => sceneRef.current?.setVirtualInput('left', false)}
              className="absolute left-1.5 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-900/90 border border-cyan-500/50 text-cyan-300 font-black flex items-center justify-center shadow-md active:bg-cyan-400 active:text-slate-950 active:scale-95 transition-transform"
              style={{ touchAction: 'none' }}
              aria-label="Turn Left [A]"
            >
              <ArrowLeft className="w-4 h-4 mr-0.5" />
              <span className="text-[8px] leading-none font-bold">A</span>
            </button>

            {/* Center Logo Hub */}
            <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center pointer-events-none">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
            </div>

            {/* Right (D) */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                soundEngine.initContext();
                sceneRef.current?.setVirtualInput('right', true);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                sceneRef.current?.setVirtualInput('right', false);
              }}
              onPointerLeave={() => sceneRef.current?.setVirtualInput('right', false)}
              onPointerCancel={() => sceneRef.current?.setVirtualInput('right', false)}
              className="absolute right-1.5 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-900/90 border border-cyan-500/50 text-cyan-300 font-black flex items-center justify-center shadow-md active:bg-cyan-400 active:text-slate-950 active:scale-95 transition-transform"
              style={{ touchAction: 'none' }}
              aria-label="Turn Right [D]"
            >
              <span className="text-[8px] leading-none font-bold">D</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            {/* Backward (S) */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                soundEngine.initContext();
                sceneRef.current?.setVirtualInput('backward', true);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                sceneRef.current?.setVirtualInput('backward', false);
              }}
              onPointerLeave={() => sceneRef.current?.setVirtualInput('backward', false)}
              onPointerCancel={() => sceneRef.current?.setVirtualInput('backward', false)}
              className="absolute bottom-1.5 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-900/90 border border-cyan-500/50 text-cyan-300 font-black flex flex-col items-center justify-center shadow-md active:bg-cyan-400 active:text-slate-950 active:scale-95 transition-transform"
              style={{ touchAction: 'none' }}
              aria-label="Move Backward [S]"
            >
              <span className="text-[8px] leading-none font-bold">S</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 10. IN-GAME PAUSE MENU MODAL */}
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
                  setShowCodex(true);
                  soundEngine.playButtonClick();
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 transition"
              >
                📖 SURFACE FIELD JOURNAL & CODEX [J]
              </button>

              <button
                onClick={() => {
                  setShowPauseMenu(false);
                  setShowAchievements(true);
                  soundEngine.playButtonClick();
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-yellow-300 border border-yellow-700/50 transition flex items-center justify-center gap-2"
              >
                <span>🏆 NASA TROPHIES & ACHIEVEMENTS</span>
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
                ⚙️ AUDIO & GRAPHICS SETTINGS
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

      {/* 11. EXPANDABLE TELEMETRY TERMINAL */}
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

      {/* 12. GAME SETTINGS MODAL */}
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

      {/* NASA ACHIEVEMENTS & TROPHIES MODAL */}
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />

      {/* 13. SOL 1 WELCOME GUIDE */}
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
                  <strong className="text-cyan-300 block font-mono">1. SURVIVAL OBJECTIVE</strong>
                  Maintain Oxygen, Water, and Battery Power above zero until Sol {config.targetSolDuration}. Watch your EVA Suit vitals when venturing far from base!
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <span className="text-xl">🚀</span>
                <div>
                  <strong className="text-amber-300 block font-mono">2. LOW-GRAVITY KINEMATICS & RCS</strong>
                  Jump into floaty arcs with low gravity. Hold <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white font-mono">Space</kbd> while airborne to fire cold-gas RCS jetpack thrusters!
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <span className="text-xl">🔬</span>
                <div>
                  <strong className="text-emerald-300 block font-mono">3. AR SCANNER & FIELD CODEX</strong>
                  Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white font-mono">Q</kbd> to toggle the multispectral visor, scan geological minerals, and press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white font-mono">J</kbd> to view your NASA Field Journal.
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
              ROGER THAT, LET'S EXPLORE! [ENTER]
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
