import React, { useEffect, useRef, useState } from 'react';
import { TitleScene } from '../game3d/TitleScene';
import { soundEngine } from '../utils/audio';
import { 
  Play, 
  Zap, 
  BookOpen, 
  Settings, 
  Gamepad2, 
  Rocket, 
  Volume2, 
  VolumeX, 
  Radio, 
  Compass, 
  Cpu, 
  ChevronRight,
  ShieldCheck,
  Globe2,
  Sparkles,
  Trophy
} from 'lucide-react';

interface GameTitleScreenProps {
  onStartGame: () => void;
  onQuickStart: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onOpenHandbook: () => void;
  onOpenAchievements: () => void;
}

export const GameTitleScreen: React.FC<GameTitleScreenProps> = ({
  onStartGame,
  onQuickStart,
  onOpenHowToPlay,
  onOpenSettings,
  onOpenHandbook,
  onOpenAchievements,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TitleScene | null>(null);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Mount 3D Rotating Planet & Stars
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new TitleScene(containerRef.current);
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Toggle ambient BGM
  const handleToggleBgm = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isAudioActive;
    setIsAudioActive(next);
    soundEngine.toggleSpaceBgm(next);
    soundEngine.playButtonClick();
  };

  const menuItems = [
    {
      id: 'new_expedition',
      label: 'NEW EXPEDITION',
      subtitle: 'SELECT PLANET & CONFIGURE CREW',
      icon: Play,
      primary: true,
      action: () => {
        soundEngine.playLaunchTone();
        onStartGame();
      }
    },
    {
      id: 'quick_start',
      label: 'QUICK DEPLOY (MARS // 30 SOLS)',
      subtitle: 'INSTANT DROP INTO 3D SURFACE ACTION',
      icon: Zap,
      primary: false,
      badge: 'FAST PLAY',
      action: () => {
        soundEngine.playLaunchTone();
        onQuickStart();
      }
    },
    {
      id: 'achievements',
      label: 'NASA ACHIEVEMENTS & TROPHIES',
      subtitle: 'CAREER MILESTONES & EXPLORATION XP',
      icon: Trophy,
      primary: false,
      badge: 'TROPHIES',
      action: () => {
        soundEngine.playButtonClick();
        onOpenAchievements();
      }
    },
    {
      id: 'how_to_play',
      label: 'FLIGHT MANUAL & CONTROLS',
      subtitle: 'ASTRONAUT EVA, ROVER & LIFE SUPPORT',
      icon: Gamepad2,
      primary: false,
      action: () => {
        soundEngine.playButtonClick();
        onOpenHowToPlay();
      }
    },
    {
      id: 'settings',
      label: 'AUDIO & GRAPHICS (4GB LOW MODE)',
      subtitle: 'CONFIGURE SOUND & PERFORMANCE',
      icon: Settings,
      primary: false,
      action: () => {
        soundEngine.playButtonClick();
        onOpenSettings();
      }
    },
    {
      id: 'handbook',
      label: 'NASA SCIENCE ARCHIVE',
      subtitle: 'REAL ECLSS STANDARDS & FLIGHT DATA',
      icon: BookOpen,
      primary: false,
      action: () => {
        soundEngine.playButtonClick();
        onOpenHandbook();
      }
    },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none font-mono">
      
      {/* 1. Real-time 3D Rotating Mars & Starfield Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-default" />

      {/* 2. Cinematic Vignette & Scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_35%_50%,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.85)_80%,rgba(0,0,0,0.98)_100%)]" />

      {/* 3. TOP HUD CORNER WIDGETS */}
      <div className="absolute top-4 inset-x-6 flex items-start justify-between pointer-events-none z-10 text-xs">
        
        {/* Top-Left: Tactical Target Data */}
        <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/30 flex flex-col gap-0.5 shadow-lg">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-widest text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>ORBITAL RECON // SURFACE THEATER</span>
          </div>
          <div className="text-white font-bold text-xs flex items-center gap-2">
            <Globe2 className="w-3.5 h-3.5 text-orange-400" />
            <span>TARGET: MARS // ARES BASE CAMP</span>
          </div>
          <div className="text-[10px] text-slate-400">
            JEZERO CRATER • 0.38G GRAVITY • 590 W/m²
          </div>
        </div>

        {/* Top-Right: NASA Badge & Audio Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          
          {/* Challenge Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
            <span className="text-cyan-400 font-bold">NASA SPACE APPS 2026</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">CHALLENGE #03</span>
          </div>

          {/* Quick Sound/BGM Toggle */}
          <button
            onClick={handleToggleBgm}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition shadow-lg text-[11px] font-bold ${
              isAudioActive 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60' 
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Ambient Space Synthesizer"
          >
            {isAudioActive ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isAudioActive ? 'BGM: ON' : 'AUDIO: OFF'}</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN GAME MENU (Left-Aligned Cinematic Game Menu) */}
      <div className="absolute inset-y-0 left-6 sm:left-12 lg:left-16 flex flex-col justify-center z-10 max-w-lg pointer-events-none">
        
        {/* Game Title & Branding */}
        <div className="mb-6 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[10px] text-cyan-300 tracking-widest uppercase mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>INTERACTIVE MISSION TRAINER</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            OUTPOST
          </h1>

          <div className="flex items-center gap-2 mt-1">
            <span className="h-[2px] w-6 bg-cyan-400" />
            <span className="text-xs sm:text-sm tracking-[0.25em] text-cyan-300 uppercase font-bold">
              Humanity's Next Home
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-2.5 font-sans leading-relaxed max-w-sm drop-shadow">
            Command an extraterrestrial colony in real-time 3D. Control your astronaut on EVA, maintain life support, and survive hostile alien environments.
          </p>
        </div>

        {/* Video Game Menu Stack */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isHovered = hoveredIndex === idx;

            return (
              <button
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => {
                  setHoveredIndex(idx);
                  soundEngine.playButtonHover();
                }}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`group relative flex items-center justify-between p-3 sm:p-3.5 rounded-xl border text-left transition-all duration-150 ${
                  item.primary
                    ? 'bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black border-cyan-300 shadow-xl shadow-cyan-500/30 scale-[1.02]'
                    : isHovered
                      ? 'bg-slate-900/95 border-cyan-400/80 text-white shadow-lg shadow-cyan-950/60 translate-x-2'
                      : 'bg-slate-950/80 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    item.primary 
                      ? 'bg-slate-950/20 text-slate-950' 
                      : isHovered ? 'bg-cyan-950 text-cyan-400' : 'bg-slate-900 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black tracking-wider">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className={`text-[10px] ${
                      item.primary ? 'text-slate-900/80' : 'text-slate-400'
                    }`}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 transition-transform ${
                  item.primary 
                    ? 'text-slate-950 transform group-hover:translate-x-1' 
                    : isHovered ? 'text-cyan-400 transform translate-x-1' : 'text-slate-600'
                }`} />
              </button>
            );
          })}
        </div>

      </div>

      {/* 5. BOTTOM STATUS BAR & CAPCOM TICKER */}
      <div className="absolute bottom-4 inset-x-6 flex items-center justify-between pointer-events-none z-10 text-[11px] text-slate-400">
        
        {/* CAPCOM Ticker */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[10px]">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-400 font-bold">CAPCOM:</span>
          <span className="text-slate-200">
            "Houston confirms telemetry handshake. Ready for Junior Astronaut deployment."
          </span>
        </div>

        {/* Version & Device Optimization */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[10px]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Cpu className="w-3 h-3" />
            <span>4GB LOW MODE READY</span>
          </div>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">BUILD 2026.11 // V2.4</span>
        </div>

      </div>

    </div>
  );
};
