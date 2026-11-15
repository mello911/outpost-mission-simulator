import React, { useState } from 'react';
import { 
  Rocket, 
  ShieldAlert, 
  Droplets, 
  Zap, 
  Apple, 
  Compass, 
  ArrowRight, 
  BookOpen, 
  Cpu, 
  HeartPulse, 
  AlertTriangle,
  Globe2,
  CheckCircle2
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface LandingPageProps {
  onStartMission: () => void;
  onOpenHandbook: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartMission,
  onOpenHandbook,
}) => {
  const [activePlanetPreview, setActivePlanetPreview] = useState<'mars' | 'moon'>('mars');

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-between overflow-hidden">
      
      {/* Background Starfield & Glow Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-600/10 via-amber-600/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-600/10 blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 relative z-10 w-full">
        
        {/* Challenge Banner */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-space-900/90 border border-cyan-500/30 text-xs font-mono shadow-lg shadow-cyan-950/50">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-cyan-400 font-bold">2026 NASA SPACE APPS CHALLENGE #03</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300 font-bold">AGES 7–12 MISSION TRAINER</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-white mb-6">
            OUTPOST
            <span className="block text-2xl sm:text-3xl md:text-4xl font-normal font-sans tracking-wide bg-gradient-to-r from-cyan-400 via-amber-300 to-orange-400 bg-clip-text text-transparent mt-2">
              Humanity's Next Home
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-200 font-light leading-relaxed max-w-2xl mx-auto mb-8">
            Can you keep your astronauts alive on Mars or the Moon? Step into NASA Mission Control! Build your extraterrestrial outpost, grow space potatoes, recycle drinking water, and survive massive solar dust storms with your robot pal <strong className="text-cyan-400 font-bold">A.S.T.R.O.</strong>!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                soundEngine.playQuindarTone(true);
                onStartMission();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-mono font-bold tracking-wider text-space-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-amber-300 hover:from-cyan-300 hover:to-amber-200 shadow-xl shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 text-base"
            >
              <Rocket className="w-5 h-5 text-space-950 transform -rotate-45" />
              <span>COMMENCE MISSION SETUP</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                soundEngine.playBeep(650, 0.05);
                onOpenHandbook();
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-xl font-mono text-sm tracking-wide text-cyan-300 bg-space-900/80 hover:bg-space-800 border border-cyan-500/30 hover:border-cyan-400/60 transition-all flex items-center justify-center gap-2.5 backdrop-blur-sm"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>NASA SCIENCE ARCHIVE</span>
            </button>
          </div>
        </div>

        {/* Interactive Destination Preview Card */}
        <div className="hud-panel rounded-2xl p-6 sm:p-8 max-w-5xl mx-auto mb-16 border border-slate-700/60 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe2 className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-display font-bold text-white tracking-wide">
                  SELECT PLANETARY THEATER
                </h2>
              </div>
              <p className="text-xs font-mono text-slate-400">
                Compare environmental physics between the Lunar South Pole and the Martian Desert
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex bg-space-950 p-1 rounded-xl border border-slate-700 w-fit">
              <button
                onClick={() => {
                  soundEngine.playBeep(520, 0.04);
                  setActivePlanetPreview('mars');
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  activePlanetPreview === 'mars'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                MARS (ARES BASE)
              </button>
              <button
                onClick={() => {
                  soundEngine.playBeep(580, 0.04);
                  setActivePlanetPreview('moon');
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  activePlanetPreview === 'moon'
                    ? 'bg-gradient-to-r from-slate-600 to-cyan-700 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                MOON (ARTEMIS CAMP)
              </button>
            </div>
          </div>

          {activePlanetPreview === 'mars' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-orange-950 text-orange-400 border border-orange-500/40">
                    0.38G GRAVITY
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-950 text-amber-400 border border-amber-500/40">
                    24.6H SOL DAY
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                    95% CO₂ ATMOSPHERE
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white font-display">
                  Jezero Crater Delta • Arcadia Planitia
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Mars offers a day length nearly identical to Earth and abundant atmospheric carbon dioxide that can be split into breathing oxygen via NASA's <strong className="text-cyan-400">MOXIE</strong> solid oxide electrolysis technology. However, surface solar energy is less than half of Earth's, and global dust storms can blanket the planet for months.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                  <div className="bg-space-900/90 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">KEY ADVANTAGE</span>
                    <span className="text-emerald-400 font-semibold">In-Situ MOXIE O₂ Extraction</span>
                  </div>
                  <div className="bg-space-900/90 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">CRITICAL HAZARD</span>
                    <span className="text-amber-400 font-semibold">Global Atmospheric Dust Storms</span>
                  </div>
                </div>
              </div>

              {/* Mars Visual Widget */}
              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-orange-950/40 to-space-950 rounded-xl border border-orange-500/20 text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-orange-700 via-amber-600 to-orange-400 shadow-2xl shadow-orange-600/40 border-2 border-orange-400/50 relative overflow-hidden mb-4 animate-pulse-slow">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)]" />
                  <div className="absolute -bottom-4 -right-4 w-16 h-8 bg-amber-900/60 rounded-full blur-xs" />
                </div>
                <div className="font-mono text-xs text-orange-400 font-bold tracking-wider">ARES SURFACE OUTPOST</div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">Transit Time: 6 - 9 Months</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-600">
                    0.166G GRAVITY
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-950 text-blue-400 border border-blue-500/40">
                    14-DAY NIGHT
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-purple-950 text-purple-400 border border-purple-500/40">
                    HARD VACUUM
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white font-display">
                  Shackleton Crater Rim • Lunar South Pole
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Located on the connecting ridge of Shackleton Crater, the outpost commands peaks of near-continuous sunlight alongside permanently shadowed craters holding billions of tons of ancient water ice. The brutal 14-day lunar night elsewhere requires <strong className="text-cyan-400">Kilopower nuclear fission</strong> or massive regenerative fuel cell storage.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                  <div className="bg-space-900/90 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">KEY ADVANTAGE</span>
                    <span className="text-emerald-400 font-semibold">3-Day Transit & Rapid Comms</span>
                  </div>
                  <div className="bg-space-900/90 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">CRITICAL HAZARD</span>
                    <span className="text-red-400 font-semibold">14-Day Freezing Darkness</span>
                  </div>
                </div>
              </div>

              {/* Moon Visual Widget */}
              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900/40 to-space-950 rounded-xl border border-slate-500/20 text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-slate-700 via-slate-400 to-slate-200 shadow-2xl shadow-cyan-500/20 border-2 border-slate-400/50 relative overflow-hidden mb-4 animate-pulse-slow">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]" />
                  <div className="absolute top-6 left-8 w-6 h-6 rounded-full bg-slate-600/60" />
                  <div className="absolute bottom-8 right-10 w-8 h-8 rounded-full bg-slate-800/50" />
                </div>
                <div className="font-mono text-xs text-cyan-300 font-bold tracking-wider">ARTEMIS BASE CAMP</div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">Transit Time: 3 Days</div>
              </div>
            </div>
          )}
        </div>

        {/* How To Play Walkthrough Section */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
              HOW TO TRAIN AS A JUNIOR ASTRONAUT
            </h2>
            <p className="text-sm font-mono text-slate-400">
              Four steps from Mission Director launch authorization to surface operational survival
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="hud-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-lg mb-4">
                  01
                </div>
                <h4 className="font-display font-bold text-white text-base mb-2">Mission Setup</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Choose Mars or Moon, select crew size (2 to 6 specialists with unique perks), and set your mission duration.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Environmental Physics</span>
              </div>
            </div>

            <div className="hud-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-lg mb-4">
                  02
                </div>
                <h4 className="font-display font-bold text-white text-base mb-2">Outpost Engineering</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Allocate your starting capital into Habitat modules, ECLSS life support, Kilopower nuclear, and 98% water recovery.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Trade-off Budgeting</span>
              </div>
            </div>

            <div className="hud-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-lg mb-4">
                  03
                </div>
                <h4 className="font-display font-bold text-white text-base mb-2">Live Telemetry</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Advance Sol by Sol. Monitor real-time rates for oxygen, water recycling, food calorie balance, power, and radiation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-blue-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mathematical Engine</span>
              </div>
            </div>

            <div className="hud-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-400 font-mono font-bold text-lg mb-4">
                  04
                </div>
                <h4 className="font-display font-bold text-white text-base mb-2">Crisis Command</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Make critical decisions during dust storms, solar particle events, and ECLSS pump jams. Every choice alters survival.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-red-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NASA Scientific Context</span>
              </div>
            </div>

          </div>
        </div>

        {/* Scientific Authenticity & Educational Mission Statement */}
        <div className="hud-panel rounded-2xl p-6 sm:p-8 max-w-5xl mx-auto border border-cyan-500/30 bg-gradient-to-r from-space-950 via-space-900 to-space-950">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center shrink-0">
              <Cpu className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-lg font-display font-bold text-white tracking-wide">
                Built on Real NASA Human Spaceflight Engineering Data
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                OUTPOST utilizes verified human metabolic standards from <span className="text-cyan-300 font-mono">NASA-STD-3001</span> (0.84 kg O₂/day, 2.8 L water/day), the flight-proven <span className="text-amber-300 font-mono">98% Water Recovery System</span> benchmark achieved on the International Space Station in 2023, and real-world technology demonstrators including <span className="text-orange-300 font-mono">MOXIE</span> on Mars and the <span className="text-purple-300 font-mono">Kilopower KRUSTI</span> nuclear fission reactor.
              </p>
            </div>
            <button
              onClick={() => {
                soundEngine.playBeep(880, 0.04);
                onOpenHandbook();
              }}
              className="shrink-0 px-4 py-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-semibold transition-colors"
            >
              VIEW SOURCES & LINKS
            </button>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-space-950/80 py-4 px-4 text-center text-xs font-mono text-slate-500">
        <p>
          NASA Space Apps Challenge 2026 • Challenge #03: Junior Astronaut Mission Trainer • OUTPOST
        </p>
      </footer>

    </div>
  );
};
