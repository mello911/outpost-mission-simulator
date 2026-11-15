import React, { useState, useEffect } from 'react';
import { ResourceState, MissionSetupConfig, Astronaut } from '../types';
import { soundEngine } from '../utils/audio';
import { Sparkles, HelpCircle, MessageSquare, ChevronRight } from 'lucide-react';

interface AstroCompanionProps {
  resources: ResourceState;
  currentSol: number;
  config: MissionSetupConfig;
  crew: Astronaut[];
  masterAlarmActive: boolean;
  onOpenHandbook?: () => void;
}

const FUN_SPACE_FACTS = [
  "Did you know? Martian dust is rusty red because it has lots of iron oxide — the same mineral as rust on Earth!",
  "Fun fact: On the Moon, footprints stay sharp for millions of years because there is no wind or rain to blow them away!",
  "Did you know? Plants in space don't need gravity to grow up! They follow the LED lights and drink mist from the air.",
  "Space fact: Astronauts on the Space Station recycle 98% of all their water — even sweat and shower drops!",
  "Did you know? Mars has the biggest volcano in the solar system, Olympus Mons, and it is 3 times taller than Mount Everest!",
  "Fun fact: It takes radio messages between 4 and 20 minutes to travel from Mars to Earth because light takes time to fly across space!",
  "Did you know? A day on Mars is called a 'Sol', and it lasts 24 hours, 39 minutes, and 35 seconds — just a little longer than an Earth day!"
];

export const AstroCompanion: React.FC<AstroCompanionProps> = ({
  resources,
  currentSol,
  config,
  crew,
  masterAlarmActive,
  onOpenHandbook
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTalking, setIsTalking] = useState(false);

  // Determine emotional state and context message
  const livingCrew = crew.filter(c => c.status !== 'incapacitated');
  const isO2Low = resources.oxygenKg < livingCrew.length * 2.0;
  const isWaterLow = resources.waterLiters < livingCrew.length * 4.0;
  const isPowerLow = resources.storedEnergyKWh < 25;
  const isIntegrityLow = resources.habitatIntegrityPct < 40;

  let mood: 'happy' | 'warning' | 'alert' | 'celebrate' = 'happy';
  let speech = '';

  if (masterAlarmActive || isO2Low || isWaterLow) {
    mood = 'alert';
    if (isO2Low) {
      speech = "Beep-boop! Warning, Junior Astronaut! Our breathing oxygen is running low! Check the life-support scrubber right away!";
    } else if (isWaterLow) {
      speech = "Caution! Our clean drinking water is below safe levels! Make sure our water recycler is running smoothly!";
    } else {
      speech = "Emergency alert! One of our outpost systems needs your attention, Commander! Check your status dials!";
    }
  } else if (isPowerLow || isIntegrityLow) {
    mood = 'warning';
    if (isPowerLow) {
      speech = "Power is dipping low! We might need to turn off extra lights or wait for sunrise so our solar panels recharge!";
    } else {
      speech = "Our outer habitat wall has some scratches from space dust! Let's schedule an astronaut spacewalk to patch it up.";
    }
  } else if (currentSol === 1) {
    mood = 'celebrate';
    speech = `Welcome to ${config.destination === 'mars' ? 'Mars' : 'the Moon'}, Junior Commander! I'm A.S.T.R.O., your robotic guide. I'll help you look after our crew and outpost!`;
  } else if (currentSol === config.targetSolDuration) {
    mood = 'celebrate';
    speech = "Hooray! We reached our mission goal! The relief spaceship is landing to pick us up. Fantastic engineering job!";
  } else {
    mood = 'happy';
    const fact = FUN_SPACE_FACTS[(currentSol + currentMessageIndex) % FUN_SPACE_FACTS.length];
    speech = `Sol ${currentSol} status is nominal! All systems are humming. ${fact}`;
  }

  const triggerAstroVoice = () => {
    soundEngine.playBeep(980, 0.04);
    setIsTalking(true);
    setCurrentMessageIndex(prev => prev + 1);
    setTimeout(() => {
      soundEngine.playBeep(1200, 0.04);
      setIsTalking(false);
    }, 250);
  };

  return (
    <div className="bg-gradient-to-r from-space-900/90 via-space-850/90 to-space-900/90 border-2 border-cyan-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden">
      
      {/* Decorative ambient glow */}
      <div className={`absolute -left-10 -top-10 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-colors ${
        mood === 'alert' ? 'bg-red-500/20' : mood === 'warning' ? 'bg-amber-500/20' : 'bg-cyan-500/20'
      }`} />

      {/* A.S.T.R.O. Animated Robot Face */}
      <div 
        onClick={triggerAstroVoice}
        className="cursor-pointer group flex flex-col items-center shrink-0"
        title="Click A.S.T.R.O. for a fun space tip!"
      >
        <div className="relative">
          {/* Antenna */}
          <div className="w-1.5 h-3 bg-cyan-400 mx-auto rounded-t" />
          <div className={`w-3 h-3 rounded-full mx-auto -mt-1 shadow-lg ${
            mood === 'alert' ? 'bg-red-500 animate-ping' : mood === 'warning' ? 'bg-amber-400 animate-pulse' : 'bg-cyan-300 animate-pulse'
          }`} />

          {/* Robot Head */}
          <div className="w-16 h-14 rounded-2xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 p-2 flex flex-col items-center justify-between group-hover:scale-105 transition-transform">
            
            {/* Eyes Screen */}
            <div className="w-full h-6 bg-space-950 rounded-lg flex items-center justify-around px-2 border border-cyan-500/40">
              {/* Left Eye */}
              <div className={`w-2.5 h-3.5 rounded-full transition-all ${
                isTalking ? 'h-1 bg-cyan-300' :
                mood === 'alert' ? 'bg-red-400 animate-bounce' :
                mood === 'warning' ? 'bg-amber-300' : 'bg-cyan-300 animate-pulse-slow'
              }`} />
              {/* Right Eye */}
              <div className={`w-2.5 h-3.5 rounded-full transition-all ${
                isTalking ? 'h-1 bg-cyan-300' :
                mood === 'alert' ? 'bg-red-400 animate-bounce' :
                mood === 'warning' ? 'bg-amber-300' : 'bg-cyan-300 animate-pulse-slow'
              }`} />
            </div>

            {/* Mouth / Speaker Grille */}
            <div className="flex gap-1 items-center justify-center">
              <div className="w-1 h-1 bg-cyan-400/80 rounded-full" />
              <div className={`w-3 h-1 rounded-full ${isTalking ? 'bg-cyan-300 animate-pulse' : 'bg-cyan-400/80'}`} />
              <div className="w-1 h-1 bg-cyan-400/80 rounded-full" />
            </div>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-cyan-300 mt-1 tracking-wider bg-space-950 px-2 py-0.5 rounded border border-cyan-500/30">
          A.S.T.R.O.
        </span>
      </div>

      {/* Speech Bubble */}
      <div className="flex-1 bg-space-950/90 border border-slate-700/80 rounded-xl p-3 sm:p-3.5 relative shadow-inner">
        <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-400 mb-1 border-b border-slate-800 pb-1">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              mood === 'alert' ? 'bg-red-400 animate-ping' : mood === 'warning' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`} />
            <span className="text-white font-display">ROBOT FLIGHT COMPANION</span>
          </div>
          <span className="text-cyan-400 text-[10px] hidden sm:inline">Tap A.S.T.R.O. for tips!</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          {speech}
        </p>

        {onOpenHandbook && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={triggerAstroVoice}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Next Space Tip</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playBeep(750, 0.03);
                onOpenHandbook();
              }}
              className="text-[11px] font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
            >
              <span>Why this happens (NASA Science)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
