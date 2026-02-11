import React from 'react';
import { UserProfile, FaithTreeState, Mission, AppView, Language, DailyGospelReflection, PrayerHistoryItem, Appointment } from '../types';
import { RandomBibleVerse } from '../services/geminiService';
import { getTranslation } from '../utils/translations';

interface DashboardProps {
  profile: UserProfile;
  treeState: FaithTreeState;
  lang: Language;
  customThemeInput: string;
  setCustomThemeInput: (value: string) => void;
  setView: (view: AppView) => void;
  handleGeneratePrayer: (theme: string, iconOverride?: string) => void;
  isEditingShortcuts: boolean;
  nextMission?: Mission;
  onOpenParishSearch: () => void;
  dailyGospel?: DailyGospelReflection | null;
  randomBibleVerse?: RandomBibleVerse | null;
  recentPrayers?: PrayerHistoryItem[];
  upcomingAppointments?: Appointment[];
  onMissionClick?: (mission: Mission) => void;
  onOpenCaritas?: () => void; // Optional callback to open Caritas section
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  treeState,
  lang,
  customThemeInput,
  setCustomThemeInput,
  setView,
  handleGeneratePrayer,
  isEditingShortcuts,
  nextMission,
  onOpenParishSearch,
  dailyGospel,
  randomBibleVerse,
  recentPrayers = [],
  upcomingAppointments = [],
  onMissionClick,
  onOpenCaritas
}) => {
  // Check if a mission is related to charity/good works
  const isCharityMission = (mission: Mission): boolean => {
    const charityKeywords = ['việc thiện', 'bác ái', 'charity', 'good works', 'caritas', 'ủng hộ', 'donate', 'giúp đỡ', 'help'];
    const titleLower = mission.title.toLowerCase();
    const descLower = mission.description.toLowerCase();
    return charityKeywords.some(keyword => titleLower.includes(keyword) || descLower.includes(keyword));
  };
  const t = getTranslation(lang);
  const fullName = `${profile.saintName ? profile.saintName + ' ' : ''}${profile.name}`;
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return lang === 'vi' ? 'Chào buổi sáng' : 'Good morning';
    if (hour < 18) return lang === 'vi' ? 'Chào buổi chiều' : 'Good afternoon';
    return lang === 'vi' ? 'Chào buổi tối' : 'Good evening';
  };

  const getTodayAppointments = () => {
    if (!upcomingAppointments || upcomingAppointments.length === 0) {
      return [];
    }
    const today = new Date().getDay();
    const todayApps = upcomingAppointments.filter(app => 
      app.active && app.days && app.days.includes(today)
    ).sort((a, b) => a.time.localeCompare(b.time));
    
    // Debug log
    console.log('Dashboard appointments check:', {
      total: upcomingAppointments.length,
      today: today,
      todayApps: todayApps.length,
      appointments: upcomingAppointments.map(a => ({
        id: a.id,
        title: a.title,
        active: a.active,
        days: a.days,
        time: a.time
      }))
    });
    
    return todayApps;
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Enhanced Welcome Card with Time-based Greeting */}
      <section className={`relative overflow-hidden glass p-5 rounded-[2.5rem] border-white shadow-xl ${profile.selectedAura || 'divine-glow'}`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <i className="fa-solid fa-cross text-6xl text-amber-800"></i>
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-200/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          {/* Lời Chúa ở trên cùng */}
          {randomBibleVerse && (
            <div className="mb-3 pb-3 border-b border-amber-900/5">
              <p className="text-[10px] text-slate-600/80 font-prayer italic leading-relaxed mb-1">
                "{randomBibleVerse.verse}"
              </p>
              <p className="text-[7px] text-amber-600/60 font-medium">
                {randomBibleVerse.reference}
              </p>
            </div>
          )}
          
          <div className="flex items-start justify-between">
            <div className="flex-grow">
              <p className="text-[9px] font-bold text-amber-700/60 uppercase tracking-widest mb-1">
                {getGreeting()}
              </p>
              <h2 className="text-2xl font-bold text-slate-900 font-serif-display leading-tight">
                <span className="text-amber-800 italic">{fullName}</span>
              </h2>
            </div>
            <div className="text-right ml-4">
              <p className="text-[10px] font-bold text-slate-500">
                {new Date().toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
              <p className="text-[8px] text-slate-400 mt-1">
                {lang === 'vi' ? `Lv.${treeState.level} • ${treeState.grace || treeState.experience || 0} Ơn` : `Lv.${treeState.level} • ${treeState.grace || treeState.experience || 0} Grace`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Mission Card */}
      {nextMission && (
        <section className="space-y-2">
          <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest px-1">
            {lang === 'vi' ? 'Sứ vụ linh hồn' : 'Soul Mission'}
          </h3>
          <div 
            className="relative overflow-hidden glass p-4 rounded-[2rem] border-white shadow-lg divine-glow flex items-center gap-4 active:scale-95 transition-all cursor-pointer group"
            onClick={() => {
              if (onMissionClick) {
                onMissionClick(nextMission);
              } else {
                setView('tree');
              }
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/20 rounded-full blur-2xl"></div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-110 transition-transform shadow-inner relative z-10">
              <i className={`fa-solid ${nextMission.icon} text-xl`}></i>
            </div>
            <div className="flex-grow relative z-10">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-[13px] font-bold text-slate-800 leading-tight">{nextMission.title}</p>
                <span className="text-[8px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md border border-amber-900/10 font-black uppercase shadow-sm">
                  +{((nextMission as any).graceReward || nextMission.expReward)} {lang === 'vi' ? 'Ơn' : 'Grace'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">{nextMission.description}</p>
              {isCharityMission(nextMission) && onOpenCaritas && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCaritas();
                  }}
                  className="mt-1.5 text-[9px] text-slate-500 italic flex items-center gap-1.5 hover:text-amber-700 transition-colors"
                >
                  <i className="fa-solid fa-heart text-[8px]"></i>
                  <span>
                    {lang === 'vi'
                      ? 'Nếu bạn chưa biết làm gì hôm nay, hãy đóng góp giúp Caritas để nâng đỡ những hoàn cảnh khó khăn hơn.'
                      : "If you don't know what good deed to do today, consider supporting Caritas to help those in greater need."}
                  </span>
                </button>
              )}
            </div>
            <i className="fa-solid fa-chevron-right text-[9px] text-amber-400 shrink-0 group-hover:translate-x-1 transition-transform relative z-10"></i>
          </div>
        </section>
      )}

      {/* 3. Main Action Buttons - Cầu nguyện và Tìm nhà thờ */}
      <section className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setView('theme_selection')} 
          className="relative overflow-hidden lumina-gradient p-5 rounded-[2rem] text-white shadow-xl flex flex-col items-center gap-2 active:scale-95 transition-all group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <i className="fa-solid fa-hands-praying text-2xl mb-1 group-hover:scale-110 transition-transform"></i>
            <span className="text-[9px] font-black uppercase tracking-[0.1em] block">{t.prayNow}</span>
          </div>
        </button>
        <button 
          onClick={onOpenParishSearch}
          className="relative overflow-hidden bg-white p-5 rounded-[2rem] shadow-lg border border-amber-900/10 flex flex-col items-center gap-2 active:scale-95 group transition-all hover:shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-amber-800 group-hover:scale-110 transition-transform shadow-inner">
            <i className="fa-solid fa-church text-xl"></i>
          </div>
          <span className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.05em] text-center leading-tight">
            {lang === 'vi' ? 'Nhà thờ gần đây' : 'Nearby churches'}
          </span>
        </button>
      </section>

      {/* 4. Quick Access Icons - Bạn đồng hành, Kinh phụng vụ, Kinh nguyện yêu thích */}
      <section className="grid grid-cols-3 gap-2">
        <button 
          onClick={() => setView('catechism_study')} 
          className="glass py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 border-white shadow-sm active:scale-95 hover:shadow-md transition-all"
        >
          <i className="fa-solid fa-book-open-reader text-amber-700 text-base"></i>
          <span className="text-[7px] font-bold uppercase text-slate-600 text-center leading-tight">{t.companion}</span>
        </button>
        <button 
          onClick={() => setView('liturgical_prayers')} 
          className="glass py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 border-white shadow-sm active:scale-95 hover:shadow-md transition-all"
        >
          <i className="fa-solid fa-book-bible text-amber-700 text-base"></i>
          <span className="text-[7px] font-bold uppercase text-slate-600 text-center leading-tight">
            {lang === 'vi' ? 'Kinh phụng vụ' : 'Liturgical'}
          </span>
        </button>
        <button 
          onClick={() => setView('favorite_prayers')} 
          className="glass py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 border-white shadow-sm active:scale-95 hover:shadow-md transition-all"
        >
          <i className="fa-solid fa-heart text-rose-600 text-base"></i>
          <span className="text-[7px] font-bold uppercase text-slate-600 text-center leading-tight">
            {lang === 'vi' ? 'Yêu thích' : 'Favorites'}
          </span>
        </button>
      </section>

      {/* 5. Today's Appointments */}
      {(() => {
        const todayAppointments = getTodayAppointments();
        
        // Show section even if empty, but with different message
        return (
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                {lang === 'vi' ? 'Lịch hẹn hôm nay' : "Today's Appointments"}
              </h3>
              {todayAppointments.length > 0 && (
                <button 
                  onClick={() => setView('appointments')}
                  className="text-[8px] text-amber-600 font-bold uppercase tracking-wider"
                >
                  {lang === 'vi' ? 'Xem tất cả' : 'View all'}
                </button>
              )}
            </div>
            {todayAppointments.length > 0 ? (
              <div className="space-y-2">
                {todayAppointments.map(app => (
                <div
                  key={app.id}
                  onClick={() => {
                    if (app.type === 'prayer') {
                      handleGeneratePrayer(app.title || t.types[app.type]);
                    } else {
                      setView('appointments');
                    }
                  }}
                  className="glass p-3 rounded-[1.5rem] border-white shadow-sm space-y-1.5 active:scale-98 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      app.type === 'prayer' ? 'bg-amber-100 text-amber-700' :
                      app.type === 'mass' ? 'bg-blue-100 text-blue-700' :
                      app.type === 'confession' ? 'bg-purple-100 text-purple-700' :
                      app.type === 'direction' ? 'bg-green-100 text-green-700' :
                      app.type === 'church' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      <i className={`fa-solid ${
                        app.type === 'prayer' ? 'fa-hands-praying' :
                        app.type === 'mass' ? 'fa-church' :
                        app.type === 'confession' ? 'fa-hands-asl-interpreting' :
                        app.type === 'direction' ? 'fa-compass' :
                        app.type === 'church' ? 'fa-church' :
                        'fa-bell'
                      } text-sm`}></i>
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-[12px] font-bold text-slate-900 mb-1">
                        {app.title || t.types[app.type]}
                      </p>
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fa-solid fa-clock text-[9px] text-amber-600"></i>
                        <span className="text-[10px] font-semibold text-slate-700">{app.time}</span>
                      </div>
                      {app.location && (
                        <div className="flex items-start gap-2">
                          <i className="fa-solid fa-location-dot text-[9px] text-amber-600 mt-[1px]"></i>
                          <span className="text-[9px] text-slate-600 leading-snug truncate">
                            {app.location}
                          </span>
                        </div>
                      )}
                    </div>
                    <i className="fa-solid fa-chevron-right text-[8px] text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0"></i>
                  </div>
                </div>
              ))}
              </div>
            ) : (
              <div className="glass p-4 rounded-[1.5rem] border-white shadow-sm text-center">
                <i className="fa-regular fa-calendar text-2xl text-slate-300 mb-2"></i>
                <p className="text-[9px] text-slate-400 font-medium">
                  {lang === 'vi' ? 'Không có lịch hẹn hôm nay' : 'No appointments today'}
                </p>
                <button
                  onClick={() => setView('appointments')}
                  className="mt-2 text-[8px] text-amber-600 font-bold uppercase tracking-wider hover:underline"
                >
                  {lang === 'vi' ? 'Thêm lịch hẹn' : 'Add appointment'}
                </button>
              </div>
            )}
          </section>
        );
      })()}
    </div>
  );
};
