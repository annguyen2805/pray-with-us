
import React, { useState } from 'react';
import { FaithTreeState, Mission, RewardChoice } from '../types';
import { CROSS_LEVELS, LEVEL_REWARDS_POOL } from '../constants.tsx';

interface FaithCrossProps {
  state: FaithTreeState;
  onToggleMission: (id: string) => void;
  onClaimMission: (id: string) => void;
  onOpenCaritas?: () => void; // Optional callback to open Caritas section in Settings
}

export const FaithCross: React.FC<FaithCrossProps> = ({ state, onToggleMission, onClaimMission, onOpenCaritas }) => {
  // Check if a mission is related to charity/good works
  const isCharityMission = (mission: Mission): boolean => {
    const charityKeywords = ['việc thiện', 'bác ái', 'charity', 'good works', 'caritas', 'ủng hộ', 'donate', 'giúp đỡ', 'help'];
    const titleLower = mission.title.toLowerCase();
    const descLower = mission.description.toLowerCase();
    return charityKeywords.some(keyword => titleLower.includes(keyword) || descLower.includes(keyword));
  };
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  
  const currentLevelInfo = CROSS_LEVELS.find(l => l.level === state.level) || CROSS_LEVELS[0];
  const nextLevelInfo = CROSS_LEVELS.find(l => l.level === state.level + 1);
  
  const currentGrace = state.grace || state.experience || 0;
  const currentMin = (currentLevelInfo as any).minGrace || currentLevelInfo.minExp;
  const nextMin = nextLevelInfo ? ((nextLevelInfo as any).minGrace || nextLevelInfo.minExp) : currentMin;
  const progress = nextLevelInfo 
    ? ((currentGrace - currentMin) / (nextMin - currentMin)) * 100
    : 100;

  const levelColors = [
    'text-amber-600',   // Lvl 1
    'text-blue-500',    // Lvl 2
    'text-rose-500',    // Lvl 3
    'text-purple-500',  // Lvl 4
    'text-yellow-600',  // Lvl 5
  ];
  const colorClass = levelColors[state.level - 1] || 'text-amber-600';

  const filteredMissions = state.missions.filter(m => m.type === activeTab);

  // Group all possible rewards to show status
  const allRewards = Object.entries(LEVEL_REWARDS_POOL).flatMap(([level, rewards]) => 
    rewards.map(r => ({ ...r, level: parseInt(level) }))
  );

  return (
    <div className="flex flex-col space-y-5 animate-fadeIn pb-10">
      {/* Animated Cross Card */}
      <div className="flex flex-col items-center glass rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group divine-glow border-white">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/10 to-transparent pointer-events-none"></div>
        
        <h2 className="text-base font-bold text-amber-950 mb-1 font-serif-display z-10 tracking-wide uppercase">Hành Trình Thập Giá</h2>
        <div className="z-10 bg-white/60 px-3 py-1 rounded-full border border-amber-900/5 shadow-sm mb-4 mt-1 flex items-center gap-2">
          <span className="text-xs">{currentLevelInfo.icon}</span>
          <span className="text-[8px] font-black text-amber-800 uppercase tracking-[0.2em]">{currentLevelInfo.name}</span>
        </div>
        
        <div className="relative w-32 h-32 mb-4 flex items-center justify-center z-10">
          <div className={`absolute inset-0 ${colorClass.replace('text', 'bg')}/10 rounded-full blur-[25px] animate-pulse`}></div>
          <div className="relative z-20 transform transition-all duration-1000 group-hover:scale-110 flex items-center justify-center">
            <div className={`text-4xl filter drop-shadow-[0_0_15px_rgba(180,83,9,0.3)] ${colorClass} transition-colors duration-1000`}>
               <i className={`fa-solid ${state.level >= 4 ? 'fa-sun' : 'fa-sparkles'} divine-pulse`}></i>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
               <i className={`fa-solid fa-cross text-amber-900/40 scale-[3] transition-all duration-1000 ${state.level === 5 ? 'text-yellow-600/60' : ''}`}></i>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[200px] z-10 mb-2">
          <div className="flex justify-between items-end mb-1.5 px-1">
            <span className="text-[9px] font-black text-amber-950 uppercase tracking-widest">Lvl {state.level}</span>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[9px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded-full shadow-sm border border-amber-900/5">{Math.round(progress)}%</span>
              <span className="text-[7px] font-bold text-amber-600">
                {(state.grace || state.experience || 0).toLocaleString()} Ơn
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100/50 rounded-full h-2 overflow-hidden p-0.5 border border-white shadow-inner">
            <div className="h-full rounded-full transition-all duration-[2000ms] lumina-gradient" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Dynamic Milestones */}
        <div className="flex gap-2 z-10 mt-2 overflow-x-auto w-full px-1 no-scrollbar justify-center">
          {CROSS_LEVELS.map(lvl => {
            const isReached = state.level >= lvl.level;
            const isCurrent = state.level === lvl.level;
            return (
              <div key={lvl.level} className="flex flex-col items-center gap-1 shrink-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${isReached ? 'lumina-gradient text-white border-transparent shadow-sm' : 'bg-white/50 text-slate-300 border-slate-100'} ${isCurrent ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
                  <span className="text-[9px] font-bold">{lvl.level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sứ vụ Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[9px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Sứ vụ đức tin</h3>
          <div className="flex bg-white/50 p-0.5 rounded-lg border border-white/40 glass">
            <button 
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1 rounded-md text-[8px] font-bold uppercase transition-all ${activeTab === 'daily' ? 'lumina-gradient text-white shadow-sm' : 'text-slate-400'}`}
            >
              Ngày
            </button>
            <button 
              onClick={() => setActiveTab('weekly')}
              className={`px-3 py-1 rounded-md text-[8px] font-bold uppercase transition-all ${activeTab === 'weekly' ? 'lumina-gradient text-white shadow-sm' : 'text-slate-400'}`}
            >
              Tuần
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {filteredMissions.map((m) => {
            const isCharity = isCharityMission(m);
            return (
              <div key={m.id} className={`glass p-3 rounded-2xl border-white shadow-sm flex items-center gap-3 transition-all ${m.isClaimed ? 'opacity-60' : ''}`}>
                <div 
                  onClick={() => !m.isClaimed && onToggleMission(m.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all ${m.isCompleted ? 'bg-amber-600 border-amber-600 text-white' : 'border-amber-900/10 text-transparent'}`}
                >
                  <i className="fa-solid fa-check text-[9px]"></i>
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center gap-1.5">
                     <p className={`text-[11px] font-bold ${m.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{m.title}</p>
                     <span className="text-[7px] text-amber-700 font-bold">+{((m as any).graceReward || m.expReward)} Ơn</span>
                  </div>
                  {isCharity && onOpenCaritas && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCaritas();
                      }}
                      className="mt-1.5 text-[7px] text-slate-500 italic flex items-center gap-1 hover:text-amber-700 transition-colors"
                    >
                      <i className="fa-solid fa-heart text-[7px]"></i>
                      <span>Nếu bạn chưa biết làm gì hôm nay, hãy đóng góp giúp Caritas để nâng đỡ những hoàn cảnh khó khăn hơn.</span>
                    </button>
                  )}
                </div>

                {m.isCompleted && !m.isClaimed && (
                  <button 
                    onClick={() => onClaimMission(m.id)}
                    className="px-3 py-1.5 lumina-gradient text-white text-[8px] font-bold uppercase rounded-lg shadow-md animate-pulse"
                  >
                    Nhận ơn
                  </button>
                )}
                {m.isClaimed && <i className="fa-solid fa-circle-check text-emerald-500 text-xs"></i>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
