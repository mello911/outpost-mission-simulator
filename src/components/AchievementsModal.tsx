import React, { useState } from 'react';
import { getAchievementsList, getAchievementStats } from '../utils/achievements';
import { AchievementCategory } from '../data/achievements';
import { soundEngine } from '../utils/audio';
import { 
  Trophy, 
  X, 
  Award, 
  Compass, 
  Cpu, 
  ShieldAlert, 
  Atom, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const achievements = getAchievementsList();
  const stats = getAchievementStats();

  const categories: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'ALL TROPHIES', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'artemis', label: 'ARTEMIS', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'exploration', label: 'EXPLORATION', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'engineering', label: 'ENGINEERING', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'survival', label: 'SURVIVAL', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'science', label: 'SCIENCE', icon: <Atom className="w-3.5 h-3.5" /> },
  ];

  const filtered = achievements.filter(a => {
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.nasaContext.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20">Legendary</span>;
      case 'epic':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/50">Epic</span>;
      case 'rare':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/50">Rare</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">Common</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md font-mono select-none">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/80 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-amber-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-md">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h2 className="text-sm sm:text-base font-black text-white tracking-widest uppercase">
                  NASA EXPEDITION ACHIEVEMENTS & TROPHIES
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Unlock career milestones by surviving extreme planetary conditions and operating base systems.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Overview Bar */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">UNLOCKED</div>
              <div className="text-lg font-black text-cyan-400">
                {stats.unlocked} <span className="text-xs text-slate-500 font-normal">/ {stats.total}</span>
              </div>
            </div>
            <div className="h-7 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">SCIENCE XP EARNED</div>
              <div className="text-lg font-black text-amber-400">
                +{stats.earnedXP} <span className="text-xs text-slate-500 font-normal">/ {stats.totalXP} XP</span>
              </div>
            </div>
            <div className="h-7 w-px bg-slate-800 hidden sm:block" />
            <div className="hidden sm:block">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">COMPLETION</div>
              <div className="text-lg font-black text-emerald-400">
                {stats.percentComplete}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full sm:w-48 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${stats.percentComplete}%` }}
            />
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  soundEngine.playButtonClick();
                  setSelectedCategory(cat.id);
                }}
                onMouseEnter={() => soundEngine.playButtonHover()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search achievements..."
              className="w-full bg-slate-950/70 border border-slate-700 focus:border-cyan-400 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Achievement Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5 scrollbar-thin scrollbar-thumb-slate-700">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs">
              No achievements match your query.
            </div>
          ) : (
            filtered.map(ach => (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  ach.unlocked
                    ? 'bg-gradient-to-br from-slate-900/90 to-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-950/30'
                    : 'bg-slate-950/60 border-slate-800 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl border ${
                        ach.unlocked
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        {ach.unlocked ? '🏆' : <Lock className="w-4 h-4 text-slate-500" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-black text-sm tracking-tight ${
                            ach.unlocked ? 'text-white' : 'text-slate-400'
                          }`}>
                            {ach.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {getRarityBadge(ach.rarity)}
                          <span className="text-[10px] text-amber-400 font-bold">+{ach.xpReward} XP</span>
                        </div>
                      </div>
                    </div>

                    {ach.unlocked ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-md whitespace-nowrap">
                        <CheckCircle2 className="w-3 h-3" />
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md whitespace-nowrap">
                        <Lock className="w-3 h-3" />
                        LOCKED
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                    {ach.description}
                  </p>
                </div>

                {/* NASA Historical Reference Box */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 bg-slate-950/40 rounded-lg p-2 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1 text-cyan-400 font-bold mb-0.5">
                    <Sparkles className="w-3 h-3" />
                    <span>NASA FLIGHT HISTORICAL CONTEXT:</span>
                  </div>
                  <p className="text-slate-400 italic leading-snug">
                    {ach.nasaContext}
                  </p>
                  {ach.unlocked && ach.unlockedAt && (
                    <div className="mt-1 text-[9px] text-slate-500">
                      Unlocked on: {new Date(ach.unlockedAt).toLocaleDateString()} at {new Date(ach.unlockedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>Outpost Mission Simulator Career System</span>
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 transition"
          >
            CLOSE [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
