import React, { useState, useEffect } from 'react';
import { DestinationType } from '../types';
import { soundEngine } from '../utils/audio';
import { Radio, Send, CheckCircle2, Globe, Clock, ShieldCheck, X, Sparkles } from 'lucide-react';

interface CommDelayRelayProps {
  destination: DestinationType;
  onReceiveAdvice: (bonusResource: 'power' | 'oxygen' | 'water') => void;
  onClose: () => void;
}

const HOUSTON_RESPONSES = [
  {
    title: "Houston Flight Director Response:",
    message: "Outpost, this is Houston. Telemetry received. Flight Dynamics recommends routing auxiliary battery bus to primary life support heaters.",
    bonus: 'power' as const,
    bonusText: "+15 kWh Emergency Battery Allocation from Orbital Relay"
  },
  {
    title: "Houston ECLSS Console Advice:",
    message: "Ares Base, Houston CAPCOM here. Regenerate molecular sieve beds on the Sabatier loop. We have uplinked an optimized flow valve sequence.",
    bonus: 'oxygen' as const,
    bonusText: "+4.0 kg Purified Oxygen Vapor Reserve"
  },
  {
    title: "Houston Medical & Life Operations:",
    message: "Outpost, we copy your signal loud and clear. Flight Surgeon reports crew hydration levels look stable. Keep water recycling centrifuge at nominal RPM.",
    bonus: 'water' as const,
    bonusText: "+10.0 Liters Potable Water Reserve from Service Module"
  }
];

export const CommDelayRelay: React.FC<CommDelayRelayProps> = ({
  destination,
  onReceiveAdvice,
  onClose
}) => {
  const isMars = destination === 'mars';
  const realDistanceKm = isMars ? '225,000,000 km' : '384,400 km';
  const realDelayText = isMars ? '12.5 Minutes (One-Way)' : '1.3 Seconds';

  const [transmitting, setTransmitting] = useState(false);
  const [countdown, setCountdown] = useState(6);
  const [responseReceived, setResponseReceived] = useState<typeof HOUSTON_RESPONSES[0] | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (transmitting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
        soundEngine.playBeep(1100, 0.02);
      }, 1000);
    } else if (transmitting && countdown === 0) {
      setTransmitting(false);
      soundEngine.playQuindarTone(false);
      const chosen = HOUSTON_RESPONSES[Math.floor(Math.random() * HOUSTON_RESPONSES.length)];
      setResponseReceived(chosen);
      onReceiveAdvice(chosen.bonus);
    }
    return () => clearTimeout(timer);
  }, [transmitting, countdown, onReceiveAdvice]);

  const handleStartTransmission = () => {
    soundEngine.playQuindarTone(true);
    setTransmitting(true);
    setCountdown(isMars ? 5 : 2); // 5 sec scaled simulation for Mars, 2 sec for Moon
    setResponseReceived(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md animate-fade-in">
      <div className="hud-panel rounded-2xl max-w-xl w-full border-2 border-cyan-400 shadow-2xl p-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase font-bold tracking-wider">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>NASA Deep Space Interplanetary Radio Relay</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Interplanetary Space Bridge Diagram */}
        <div className="bg-space-950 rounded-xl p-4 border border-slate-800 mb-5 relative overflow-hidden">
          
          <div className="flex items-center justify-between relative z-10">
            {/* Earth Side */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-400 to-emerald-300 border-2 border-cyan-300 shadow-lg shadow-cyan-500/30 flex items-center justify-center text-xs font-bold text-space-950">
                EARTH
              </div>
              <span className="text-[10px] font-mono text-cyan-300 mt-1">Houston CAPCOM</span>
            </div>

            {/* Radio Signal Wave Bridge */}
            <div className="flex-1 px-4 flex flex-col items-center">
              <div className="w-full flex items-center justify-center relative">
                <div className="h-0.5 w-full bg-slate-700" />
                {transmitting && (
                  <div className="absolute inset-0 flex items-center justify-around">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-2 text-center">
                Light Speed: 300,000 km/s • Distance: {realDistanceKm}
              </span>
            </div>

            {/* Outpost Side */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full border-2 shadow-lg flex items-center justify-center text-xs font-bold text-space-950 ${
                isMars 
                  ? 'bg-gradient-to-tr from-orange-600 to-amber-400 border-orange-300 shadow-orange-500/30' 
                  : 'bg-gradient-to-tr from-slate-400 to-slate-200 border-slate-300 shadow-cyan-500/20'
              }`}>
                {isMars ? 'MARS' : 'MOON'}
              </div>
              <span className="text-[10px] font-mono text-amber-300 mt-1">Our Outpost</span>
            </div>
          </div>

          {/* Educational Callout Box */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans">
            <strong className="text-cyan-300 font-mono">Junior Astronaut Science Lesson:</strong> In real life, radio waves travel at the speed of light. Across the vast distance between Earth and Mars, radio signals take <strong className="text-amber-400">{realDelayText}</strong> to reach Earth! That means astronauts must solve emergencies themselves without waiting for Houston.
          </div>
        </div>

        {/* Transmission Controls / State */}
        {!transmitting && !responseReceived && (
          <div className="text-center space-y-3">
            <p className="text-xs text-slate-300">
              Transmit our latest outpost telemetry to NASA Mission Control in Houston to request backup technical advice and emergency supplies.
            </p>
            <button
              onClick={handleStartTransmission}
              className="w-full py-3 px-4 rounded-xl font-mono font-bold text-xs tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-space-950 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>TRANSMIT RADIO PACKET TO EARTH</span>
            </button>
          </div>
        )}

        {transmitting && (
          <div className="p-4 bg-space-950 rounded-xl border border-cyan-500/50 text-center space-y-2">
            <div className="text-cyan-400 font-mono font-bold text-sm animate-pulse flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Interplanetary Signal in Transit...</span>
            </div>
            <div className="text-2xl font-mono font-extrabold text-white">
              {countdown}s
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              (Simulating 12 minutes of real-world light speed travel across deep space!)
            </p>
          </div>
        )}

        {responseReceived && (
          <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-500/50 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{responseReceived.title}</span>
            </div>
            <p className="text-xs text-slate-200 italic leading-relaxed">
              "{responseReceived.message}"
            </p>
            <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-xs font-mono text-emerald-300 font-bold">
              <span>SUPPLY GRANTED:</span>
              <span>{responseReceived.bonusText}</span>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-space-950 font-mono text-xs font-bold transition-colors"
            >
              Apply Supplies & Resume Mission
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
