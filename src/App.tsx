import React, { useState, useEffect } from 'react';
import { 
  GamePhase, 
  MissionSetupConfig, 
  OutpostConfiguration, 
  MissionState,
  UIMode 
} from './types';
import { CREW_PRESETS } from './data/crew';
import { DESTINATIONS } from './data/destinations';
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

import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { MissionSetup } from './components/MissionSetup';
import { OutpostConstruction } from './components/OutpostConstruction';
import { JuniorMissionControl } from './components/JuniorMissionControl';
import { MissionControl } from './components/MissionControl';
import { EventModal } from './components/EventModal';
import { MissionDebrief } from './components/MissionDebrief';
import { EducationalHandbook } from './components/EducationalHandbook';

export function App() {
  const [phase, setPhase] = useState<GamePhase>('landing');
  const [previousPhase, setPreviousPhase] = useState<GamePhase>('landing');
  const [uiMode, setUiMode] = useState<UIMode>('junior');
  
  // Mission configuration
  const [setupConfig, setSetupConfig] = useState<MissionSetupConfig>({
    destination: 'mars',
    crewSize: 4,
    crewRoster: CREW_PRESETS.slice(0, 4),
    targetSolDuration: 60,
    startingBudgetMillionUSD: 120,
  });

  const [missionState, setMissionState] = useState<MissionState | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [ambientHumEnabled, setAmbientHumEnabled] = useState<boolean>(false);

  // Restore game from LocalStorage on first load if available
  useEffect(() => {
    const saved = loadMissionFromStorage();
    if (saved && !saved.isMissionOver && saved.currentSol > 1) {
      setMissionState(saved);
      setSetupConfig(saved.config);
      if (saved.uiMode) {
        setUiMode(saved.uiMode);
      }
    }
  }, []);

  // Autosave to LocalStorage when simulation state updates
  useEffect(() => {
    if (missionState && missionState.phase === 'live_simulation') {
      saveMissionToStorage({
        ...missionState,
        uiMode
      });
    }
  }, [missionState, uiMode]);

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

  // Navigation handlers
  const handleStartMission = () => {
    setPhase('setup');
  };

  const handleProceedToConstruction = (config: MissionSetupConfig) => {
    setSetupConfig(config);
    setPhase('construction');
  };

  const handleLaunchOutpost = (configuration: OutpostConfiguration) => {
    const freshState = initializeMissionState(setupConfig, configuration);
    setMissionState(freshState);
    setPhase('live_simulation');
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

  const handleModuleAction = (actionType: 'clean_solar' | 'tend_crops' | 'flush_water' | 'inspect_hab' | 'rover_scout') => {
    if (!missionState) return;

    setMissionState(prev => {
      if (!prev) return null;
      const logs = [...prev.logs];
      let res = { ...prev.resources };
      let crew = [...prev.crew];

      if (actionType === 'clean_solar') {
        res.solarEfficiencyFactor = 1.0;
        res.storedEnergyKWh = Math.min(res.maxBatteryStorageKWh, res.storedEnergyKWh + 8);
        logs.unshift({
          sol: prev.currentSol,
          timestamp: '11:00:00 UTC',
          type: 'action',
          message: 'MODULE ACTION: Solar Panels Brushed Clean of Dust.',
          detail: 'Solar efficiency restored to 100%. +8 kWh stored.'
        });
      } else if (actionType === 'tend_crops') {
        res.foodKcal = Math.min(res.maxFoodKcal, res.foodKcal + 800);
        crew = crew.map(c => ({ ...c, morale: Math.min(100, c.morale + 3) }));
        logs.unshift({
          sol: prev.currentSol,
          timestamp: '11:00:00 UTC',
          type: 'action',
          message: 'MODULE ACTION: Greenhouse Crops Tended & Harvested.',
          detail: '+800 kcal fresh microgreens harvested. Crew morale boosted!'
        });
      } else if (actionType === 'flush_water') {
        res.waterLiters = Math.min(res.maxWaterLiters, res.waterLiters + 6);
        logs.unshift({
          sol: prev.currentSol,
          timestamp: '11:00:00 UTC',
          type: 'action',
          message: 'MODULE ACTION: Water Distillation Filter Flushed.',
          detail: '+6.0 Liters clean water recovered from loop.'
        });
      } else if (actionType === 'inspect_hab') {
        res.habitatIntegrityPct = Math.min(100, res.habitatIntegrityPct + 5);
        logs.unshift({
          sol: prev.currentSol,
          timestamp: '11:00:00 UTC',
          type: 'action',
          message: 'MODULE ACTION: Habitat Airlock Tested & Sealed.',
          detail: 'Hull integrity reinforced by +5%.'
        });
      } else if (actionType === 'rover_scout') {
        res.waterLiters = Math.min(res.maxWaterLiters, res.waterLiters + 8);
        res.foodKcal = Math.min(res.maxFoodKcal, res.foodKcal + 500);
        logs.unshift({
          sol: prev.currentSol,
          timestamp: '11:00:00 UTC',
          type: 'action',
          message: 'MODULE ACTION: Surface Rover Detected Subsurface Volatiles!',
          detail: '+8 Liters ice extracted. Crew celebrations erupted!'
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

  const handleReceiveCommSupply = (bonusResource: 'power' | 'oxygen' | 'water') => {
    if (!missionState) return;

    setMissionState(prev => {
      if (!prev) return null;
      const logs = [...prev.logs];
      let res = { ...prev.resources };

      if (bonusResource === 'power') {
        res.storedEnergyKWh = Math.min(res.maxBatteryStorageKWh, res.storedEnergyKWh + 15);
        logs.unshift({
          sol: prev.currentSol,
          timestamp: '16:00:00 UTC',
          type: 'milestone',
          message: 'COMM RELAY: Houston Uplinked Emergency Battery Reserve (+15 kWh).'
        });
      } else if (bonusResource === 'oxygen') {
        res.oxygenKg = Math.min(res.maxOxygenKg, res.oxygenKg + 4);
        logs.unshift({
          sol: prev.currentSol,
          timestamp: '16:00:00 UTC',
          type: 'milestone',
          message: 'COMM RELAY: Houston Uplinked Oxygen Purge Protocol (+4 kg O₂).'
        });
      } else if (bonusResource === 'water') {
        res.waterLiters = Math.min(res.maxWaterLiters, res.waterLiters + 10);
        logs.unshift({
          sol: prev.currentSol,
          timestamp: '16:00:00 UTC',
          type: 'milestone',
          message: 'COMM RELAY: Houston Uplinked Potable Water Reserve (+10 Liters).'
        });
      }

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

  const handleNavigate = (targetPhase: GamePhase) => {
    if (targetPhase === 'handbook') {
      setPreviousPhase(phase);
      setPhase('handbook');
    } else {
      setPhase(targetPhase);
    }
  };

  const handleCloseHandbook = () => {
    setPhase(previousPhase || 'landing');
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* Global Header */}
      <Header
        currentPhase={phase}
        currentSol={missionState?.currentSol}
        destinationName={DESTINATIONS[setupConfig.destination]?.name}
        uiMode={uiMode}
        onToggleUIMode={() => setUiMode(prev => prev === 'junior' ? 'pro' : 'junior')}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        ambientHumEnabled={ambientHumEnabled}
        setAmbientHumEnabled={setAmbientHumEnabled}
        onNavigate={handleNavigate}
        onRestart={handleRestartMission}
        masterAlarmActive={missionState?.masterAlarmActive}
      />

      {/* Main Screen Phases */}
      <main className="flex-1">
        {phase === 'landing' && (
          <LandingPage
            onStartMission={handleStartMission}
            onOpenHandbook={() => handleNavigate('handbook')}
          />
        )}

        {phase === 'setup' && (
          <MissionSetup
            onProceedToConstruction={handleProceedToConstruction}
            onBack={() => setPhase('landing')}
          />
        )}

        {phase === 'construction' && (
          <OutpostConstruction
            setupConfig={setupConfig}
            onLaunchMission={handleLaunchOutpost}
            onBack={() => setPhase('setup')}
          />
        )}

        {phase === 'live_simulation' && missionState && (
          uiMode === 'junior' ? (
            <JuniorMissionControl
              state={missionState}
              onAdvanceSol={handleAdvanceSol}
              onTogglePause={handleTogglePause}
              onChangeSpeed={handleChangeSpeed}
              onSilenceMasterAlarm={handleSilenceMasterAlarm}
              onManualAction={handleManualAction}
              onModuleAction={handleModuleAction}
              onSwitchToProMode={() => setUiMode('pro')}
              onOpenHandbook={() => handleNavigate('handbook')}
              onReceiveCommSupply={handleReceiveCommSupply}
            />
          ) : (
            <MissionControl
              state={missionState}
              onAdvanceSol={handleAdvanceSol}
              onTogglePause={handleTogglePause}
              onChangeSpeed={handleChangeSpeed}
              onSilenceMasterAlarm={handleSilenceMasterAlarm}
              onManualAction={handleManualAction}
              onAbortMission={handleRestartMission}
            />
          )
        )}

        {phase === 'debrief' && missionState && (
          <MissionDebrief
            state={missionState}
            onRestart={handleRestartMission}
            onOpenHandbook={() => handleNavigate('handbook')}
          />
        )}

        {phase === 'handbook' && (
          <EducationalHandbook
            onBack={handleCloseHandbook}
          />
        )}
      </main>

      {/* Active Crisis Popup Overlay */}
      {missionState?.activeCrisis && (
        <EventModal
          activeCrisis={missionState.activeCrisis}
          onSelectChoice={handleCrisisChoice}
        />
      )}

    </div>
  );
}

export default App;
