import React, { useState } from 'react';
import { NASA_SCIENCE_HANDBOOK, ScienceTopic } from '../data/nasaScience';
import { soundEngine } from '../utils/audio';
import { 
  BookOpen, 
  Search, 
  Wind, 
  Droplets, 
  Zap, 
  ShieldAlert, 
  Apple, 
  Brain, 
  ExternalLink, 
  CheckCircle2, 
  HelpCircle, 
  ArrowLeft,
  Atom,
  Sparkles
} from 'lucide-react';

interface EducationalHandbookProps {
  onBack: () => void;
}

export const EducationalHandbook: React.FC<EducationalHandbookProps> = ({ onBack }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(NASA_SCIENCE_HANDBOOK[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTopics = NASA_SCIENCE_HANDBOOK.filter(topic => {
    const matchesSearch = 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.keyFacts.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || topic.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const currentTopic = NASA_SCIENCE_HANDBOOK.find(t => t.id === selectedTopicId) || NASA_SCIENCE_HANDBOOK[0];

  const getTopicIcon = (category: string) => {
    switch (category) {
      case 'life_support': return <Wind className="w-4 h-4 text-cyan-400" />;
      case 'power': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'radiation': return <ShieldAlert className="w-4 h-4 text-purple-400" />;
      case 'agriculture': return <Apple className="w-4 h-4 text-emerald-400" />;
      case 'psychology': return <Brain className="w-4 h-4 text-blue-400" />;
      default: return <Atom className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO OUTPOST</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-cyan-400" />
            <span>NASA SCIENCE & ARCHIVES</span>
          </h1>
          <p className="text-xs sm:text-sm font-mono text-slate-400 mt-1">
            Junior Astronaut Field Manual • Real NASA Aerospace Physics vs Gameplay Models
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topics, equations, NASA missions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-space-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 text-xs font-mono">
        {[
          { id: 'all', label: 'All Disciplines' },
          { id: 'life_support', label: 'ECLSS & Life Support' },
          { id: 'power', label: 'Power & Kilopower' },
          { id: 'radiation', label: 'Radiation & Regolith' },
          { id: 'agriculture', label: 'Space Agriculture' },
          { id: 'environment', label: 'Extraterrestrial Physics' },
          { id: 'psychology', label: 'Crew Isolation' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              soundEngine.playBeep(650, 0.02);
              setActiveCategory(cat.id);
            }}
            className={`px-3.5 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 font-bold'
                : 'bg-space-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Topic List (4 cols) & Right Detailed Reader (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Topic List */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-[11px] font-mono uppercase text-slate-500 px-1">
            Science Modules ({filteredTopics.length})
          </div>

          {filteredTopics.map(topic => {
            const isSelected = selectedTopicId === topic.id;
            return (
              <div
                key={topic.id}
                onClick={() => {
                  soundEngine.playBeep(750, 0.02);
                  setSelectedTopicId(topic.id);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-lg shadow-cyan-950/40'
                    : 'bg-space-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1 rounded bg-space-950 border border-slate-800">
                    {getTopicIcon(topic.category)}
                  </div>
                  <h4 className="font-display font-bold text-sm text-white">
                    {topic.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {topic.subtitle}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Reader Panel */}
        <div className="lg:col-span-8">
          <div className="hud-panel p-6 sm:p-8 rounded-2xl border border-slate-700/80 space-y-6">
            
            {/* Topic Header */}
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">
                {getTopicIcon(currentTopic.category)}
                <span>NASA Technical Knowledge Base // {currentTopic.category.replace('_', ' ')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
                {currentTopic.title}
              </h2>
              <p className="text-sm font-mono text-amber-300">
                {currentTopic.subtitle}
              </p>
            </div>

            {/* Summary */}
            <div className="text-sm text-slate-200 leading-relaxed bg-space-950/80 p-4 rounded-xl border border-slate-800">
              {currentTopic.summary}
            </div>

            {/* Key Facts Bulleted List */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Scientific Facts & Engineering Constraints</span>
              </h3>
              <div className="space-y-2">
                {currentTopic.keyFacts.map((fact, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed bg-space-900/50 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-cyan-400 font-mono font-bold mt-0.5">•</span>
                    <span>{fact}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real NASA Fact vs Gameplay Simplification Comparison Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40">
                <span className="text-[11px] font-mono font-bold text-cyan-300 block mb-1">
                  REAL NASA SCIENTIFIC FACT
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentTopic.realNasaFact}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40">
                <span className="text-[11px] font-mono font-bold text-amber-300 block mb-1">
                  SIMPLIFIED GAMEPLAY ASSUMPTION
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentTopic.gameplaySimplification}
                </p>
              </div>

            </div>

            {/* Scientific Formulas & Equations if present */}
            {currentTopic.equationsOrSpecs && currentTopic.equationsOrSpecs.length > 0 && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                  Chemical Reactions & Mathematical Equations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentTopic.equationsOrSpecs.map((eq, i) => (
                    <div key={i} className="bg-space-950 p-3 rounded-lg border border-slate-800 font-mono text-xs">
                      <span className="text-cyan-400 font-bold block mb-1">{eq.label}</span>
                      <div className="p-2 bg-space-900 rounded border border-slate-700 text-white font-mono text-[11px] mb-1">
                        {eq.formula}
                      </div>
                      <span className="text-[10px] text-slate-400">{eq.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Official NASA Sources and Citations with working links */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>NASA Scientific References & Sources</span>
              </h3>
              <div className="space-y-1.5">
                {currentTopic.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-space-900/60 hover:bg-space-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 group-hover:underline font-semibold">{src.title}</span>
                      <span className="text-slate-500 text-[10px]">[{src.org}]</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
