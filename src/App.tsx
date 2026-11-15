import React, { useState, useEffect } from 'react';
import { 
  GamePhase, 
  MissionSetupConfig, 
  OutpostConfiguration, 
  MissionState 
} from './types';
import { CREW_PRESETS } from './data/crew';
import { 
  initializeMissionState, 
  simulateOneSol, 
  resolveCrisisChoice 
} from './simulation/engine';
import { 
  saveMissionToStorage, 
  loadMissionFromStorage, 
  clearSavedMission 
} from './utils/storage';
import { soundEngine } from './utils/audio';

// Clean Webgame Components
import { GameTitleScreen } from './components/GameTitleScreen';
import { GameMissionSelect } from './components/GameMissionSelect';
import { Outpost3DGame } from './components/Outpost3DGame';
import { MissionDebrief } from './components/MissionDebrief';
import { EducationalHandbook } from './components/EducationalHandbook';
import { EventModal } from './components/EventModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { GameSettingsModal } from './components/GameSettingsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { GraphicsQuality } from './game3d/OutpostScene';

export function App() {
  const [phase, setPhase] = useState<GamePhase>('landing');
  const [previousPhase, setPreviousPhase] = useState<GamePhase>('landing');

  // Modals
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);

  // Settings state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [ambientHumEnabled, setAmbientHumEnabled] = useState<boolean>(true);
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(false);
  const [quality, setQuality] = useState<GraphicsQuality>('low');

  // Mission State
  const [missionState, setMissionState] = useState<MissionState | null>(null);

  // Restore game from LocalStorage on first load if available
  useEffect(() => {
    const saved = loadMissionFromStorage();
    if (saved && !saved.isMissionOver && saved.currentSol > 1) {
      setMissionState(saved);
    }
  }, []);

  // Autosave to LocalStorage when simulation state updates
  useEffect(() => {
    if (missionState && missionState.phase === 'live_simulation') {
      saveMissionToStorage(missionState);
    }
  }, [missionState]);

  // Simulation timer loop
  useEffect(() => {
    if (
      phase !== 'live_simulation' || 
      !missionState || 
      missionState.isPaused || 
      missionState.activeCrisis !== null || 
      missionState.isMissionOver
    ) {
      return;
    }

    const intervalMs = missionState.simulationSpeed === 5 ? 500 : missionState.simulationSpeed === 2 ? 1200 : 2500;

    const timer = setInterval(() => {
      setMissionState(prev => {
        if (!prev || prev.isPaused || prev.activeCrisis !== null || prev.isMissionOver) {
          return prev;
        }
        const updated = simulateOneSol(prev);
        if (updated.isMissionOver) {
          setPhase('debrief');
        }
        return updated;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [phase, missionState?.isPaused, missionState?.simulationSpeed, missionState?.activeCrisis, missionState?.isMissionOver]);

  // Launch handlers
  const handleLaunchMission = (setupConfig: MissionSetupConfig, configuration: OutpostConfiguration) => {
    const freshState = initializeMissionState(setupConfig, configuration);
    setMissionState(freshState);
    setPhase('live_simulation');
  };

  const handleQuickStart = () => {
    const quickSetupConfig: MissionSetupConfig = {
      destination: 'mars',
      crewSize: 4,
      crewRoster: CREW_PRESETS.slice(0, 4),
      targetSolDuration: 30,
      startingBudgetMillionUSD: 120,
    };
    const quickConfiguration: OutpostConfiguration = {
      habitat: 'hab_transhab',
      life_support: 'ls_sabatier_moxie',
      power: 'pow_solar_fuel_cell',
      radiation: 'rad_polyethylene_water',
      food: 'food_hydroponic_greenhouse',
      water: 'wat_vapor_compression',
    };
    handleLaunchMission(quickSetupConfig, quickConfiguration);
  };

  const handleAdvanceSol = () => {
    if (!missionState) return;
    const updated = simulateOneSol(missionState);
    setMissionState(updated);
    if (updated.isMissionOver) {
      setPhase('debrief');
    }
  };

  const handleTogglePause = () => {
    if (!missionState) return;
    setMissionState(prev => prev ? { ...prev, isPaused: !prev.isPaused } : null);
  };

  const handleChangeSpeed = (speed: 1 | 2 | 5) => {
    if (!missionState) return;
    setMissionState(prev => prev ? { ...prev, simulationSpeed: speed } : null);
  };

  const handleSilenceMasterAlarm = () => {
    if (!missionState) return;
    setMissionState(prev => prev ? { ...prev, masterAlarmActive: false } : null);
  };

  const handleManualAction = (actionType: 'purge_scrubbers' | 'rationing' | 'eva_repair' | 'battery_boost') => {
    if (!missionState) return;

    setMissionState(prev => {
      if (!prev) return null;
      const logs = [...prev.logs];
      let res = { ...prev.resources };
      let crew = [...prev.crew];

      if (actionType === 'purge_scrubbers') {
        res.storedEnergyKWh = Math.max(0, res.storedEnergyKWh - 10);
        res.oxygenKg = Math.min(res.maxOxygenKg, res.oxygenKg + 5);
        logs.unshift({
          sol: prev.currentSol,
          timestamp: '14:20:00 UTC',
          type: 'action',
          message: 'MANUAL ACTION: CO₂ Amine Scrubbers Purged and Regenerated.',
          detail: 'Consumed 10 kWh. Atmospheric purity restored.'
        });
      } else if (actionType === 'rationing') {
        res.waterConsumptionRate *= 0.75;
        res.foodConsumptionRate *= 0.75;
        crew = crew.map(c => ({ ...c, morale: Math.max(0, c.morale - 8) }));
        logs.unshift({
          sol: prev.currentSol,
          timestamp: '14:20:00 UTC',
          type: 'action',
          message: 'MANUAL ACTION: Consumables Rationing Order Enacted.',
          detail: 'Reduced daily consumption by 25%. Crew morale reduced.'
        });
      } else if (actionType === 'eva_repair') {
        res.storedEnergyKWh = Math.max(0, res.storedEnergyKWh - 15);
        res.oxygenKg = Math.max(0, res.oxygenKg - 1.5);
        res.habitatIntegrityPct = Math.min(100, res.habitatIntegrityPct + 15);
        logs.unshift({
          sol: prev.currentSol,
          timestamp: '14:20:00 UTC',
          type: 'action',
          message: 'MANUAL ACTION: 4-Hour Extravehicular Activity (EVA) Hull Seal Completed.',
          detail: 'Structural integrity improved by +15%.'
        });
      } else if (actionType === 'battery_boost') {
        res.storedEnergyKWh = Math.min(res.maxBatteryStorageKWh, res.storedEnergyKWh + 30);
        logs.unshift({
          sol: prev.currentSol,
          timestamp: '14:20:00 UTC',
          type: 'action',
          message: 'MANUAL ACTION: Emergency Auxiliary Regenerative Fuel Cell Discharged.',
          detail: 'Added +30 kWh immediate emergency power.'
        });
      }

      return {
        ...prev,
        resources: res,
        crew,
        logs: logs.slice(0, 50)
      };
    });
  };

  const handleAddResource = (
    type: 'water' | 'food' | 'energy' | 'oxygen' | 'integrity',
    amount: number,
    logMsg: string
  ) => {
    setMissionState(prev => {
      if (!prev) return null;
      const res = { ...prev.resources };
      const logs = [...prev.logs];

      if (type === 'water') {
        res.waterLiters = Math.min(res.maxWaterLiters, res.waterLiters + amount);
      } else if (type === 'food') {
        res.foodKcal = Math.min(res.maxFoodKcal, res.foodKcal + amount);
      } else if (type === 'energy') {
        res.storedEnergyKWh = Math.min(res.maxBatteryStorageKWh, res.storedEnergyKWh + amount);
      } else if (type === 'oxygen') {
        res.oxygenKg = Math.min(res.maxOxygenKg, res.oxygenKg + amount);
      } else if (type === 'integrity') {
        res.habitatIntegrityPct = Math.min(100, res.habitatIntegrityPct + amount);
      }

      logs.unshift({
        sol: prev.currentSol,
        timestamp: '15:45:00 UTC',
        type: 'action',
        message: `EVA SURFACE OPERATION: ${logMsg}`,
        detail: `Added +${amount} to reserves via field astronaut intervention.`
      });

      return {
        ...prev,
        resources: res,
        logs: logs.slice(0, 50)
      };
    });
  };

  const handleCrisisChoice = (choiceId: string) => {
    if (!missionState) return;
    const updated = resolveCrisisChoice(missionState, choiceId);
    setMissionState(updated);
  };

  const handleRestartMission = () => {
    clearSavedMission();
    setMissionState(null);
    setPhase('setup');
  };

  const handleExitToTitle = () => {
    setPhase('landing');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black text-slate-100 flex flex-col font-sans select-none relative">
      
      {/* 1. TITLE SCREEN (Zero Scrolling Arcade Menu) */}
      {phase === 'landing' && (
        <GameTitleScreen
          onStartGame={() => setPhase('setup')}
          onQuickStart={handleQuickStart}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenHandbook={() => {
            setPreviousPhase(phase);
            setPhase('handbook');
          }}
          onOpenAchievements={() => setShowAchievements(true)}
        />
      )}

      {/* 2. MISSION SELECT SCREEN (Single-Screen Game Setup) */}
      {phase === 'setup' && (
        <GameMissionSelect
          onLaunch={handleLaunchMission}
          onBack={() => setPhase('landing')}
        />
      )}

      {/* 3. 3D INTERACTIVE WEBGAME (Full-Bleed 100% Screen Viewport) */}
      {phase === 'live_simulation' && missionState && (
        <Outpost3DGame
          state={missionState}
          onAdvanceSol={handleAdvanceSol}
          onTogglePause={handleTogglePause}
          onChangeSpeed={handleChangeSpeed}
          onSilenceMasterAlarm={handleSilenceMasterAlarm}
          onManualAction={handleManualAction}
          onAbortMission={handleRestartMission}
          onExitToTitle={handleExitToTitle}
          onAddResource={handleAddResource}
        />
      )}

      {/* 4. MISSION DEBRIEF SCREEN (Victory / Defeat Arcade Report) */}
      {phase === 'debrief' && missionState && (
        <div className="w-full h-full overflow-y-auto bg-slate-950 p-4 sm:p-8">
          <MissionDebrief
            state={missionState}
            onRestart={handleRestartMission}
            onOpenHandbook={() => {
              setPreviousPhase(phase);
              setPhase('handbook');
            }}
            onExitToTitle={handleExitToTitle}
          />
        </div>
      )}

      {/* 5. EDUCATIONAL HANDBOOK VIEW */}
      {phase === 'handbook' && (
        <div className="w-full h-full overflow-y-auto bg-slate-950 p-4 sm:p-8">
          <EducationalHandbook
            onBack={() => setPhase(previousPhase || 'landing')}
          />
        </div>
      )}

      {/* TACTICAL CRISIS EVENT POPUP (Authentic Sci-Fi Dialogue Box) */}
      {missionState?.activeCrisis && (
        <EventModal
          activeCrisis={missionState.activeCrisis}
          onSelectChoice={handleCrisisChoice}
        />
      )}

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && (
        <HowToPlayModal
          onClose={() => setShowHowToPlay(false)}
        />
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <GameSettingsModal
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          ambientHumEnabled={ambientHumEnabled}
          setAmbientHumEnabled={setAmbientHumEnabled}
          bgmEnabled={bgmEnabled}
          setBgmEnabled={setBgmEnabled}
          quality={quality}
          setQuality={setQuality}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* ACHIEVEMENTS MODAL */}
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />

    </div>
  );
}

export default App;
