import React, { useState } from 'react';
import { LiturgicalPrayer, AppView, Language, PrayerHour, PrayerHourContent } from '../types';
import { getTranslation } from '../utils/translations';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface LiturgicalPrayersViewProps {
  liturgicalPrayer: LiturgicalPrayer | null;
  isLoading: boolean;
  error: any;
  lang: Language;
  setView: (view: AppView) => void;
  onRefresh: (forceRefresh?: boolean) => void;
}

export const LiturgicalPrayersView: React.FC<LiturgicalPrayersViewProps> = ({
  liturgicalPrayer,
  isLoading,
  error,
  lang,
  setView,
  onRefresh
}) => {
  const [selectedHour, setSelectedHour] = useState<PrayerHour>('morning');
  const t = getTranslation(lang);

  const hourLabels: Record<PrayerHour, string> = {
    readings: lang === 'vi' ? 'Kinh Sách' : 'Office of Readings',
    morning: lang === 'vi' ? 'Kinh Sáng' : 'Morning Prayer',
    midday: lang === 'vi' ? 'Kinh Trưa' : 'Midday Prayer',
    evening: lang === 'vi' ? 'Kinh Chiều' : 'Evening Prayer',
    night: lang === 'vi' ? 'Kinh Tối' : 'Night Prayer'
  };

  const hourIcons: Record<PrayerHour, string> = {
    readings: 'fa-book-open',
    morning: 'fa-sun',
    midday: 'fa-sun',
    evening: 'fa-moon',
    night: 'fa-moon'
  };

  const colorClasses: Record<string, string> = {
    'white': 'bg-white text-slate-800 border-slate-200',
    'red': 'bg-red-50 text-red-900 border-red-200',
    'green': 'bg-green-50 text-green-900 border-green-200',
    'purple': 'bg-purple-50 text-purple-900 border-purple-200',
    'pink': 'bg-pink-50 text-pink-900 border-pink-200',
    'violet': 'bg-violet-50 text-violet-900 border-violet-200'
  };

  const currentColor = liturgicalPrayer?.color || 'green';
  const colorClass = colorClasses[currentColor] || colorClasses['green'];

  const getCurrentHourContent = (): PrayerHourContent | null => {
    if (!liturgicalPrayer) return null;
    return liturgicalPrayer.hours.find(h => h.hour === selectedHour) || null;
  };

  const availableHours: PrayerHour[] = liturgicalPrayer?.hours.map(h => h.hour) || ['morning', 'midday', 'evening', 'night'];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <LoadingSpinner />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          {lang === 'vi' ? 'Đang tải các giờ kinh phụng vụ...' : 'Loading liturgical hours...'}
        </p>
        <p className="text-[8px] text-slate-300 text-center max-w-xs px-4">
          {lang === 'vi' 
            ? 'Lần đầu tải có thể mất vài giây. Các lần sau sẽ nhanh hơn nhờ cache.' 
            : 'First load may take a few seconds. Subsequent loads will be faster with cache.'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5 animate-fadeIn pb-24">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setView('dashboard')} 
            className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <i className="fa-solid fa-chevron-left"></i> {t.back}
          </button>
          <h2 className="text-xl font-bold text-slate-900 font-serif-display">
            {lang === 'vi' ? 'Các giờ kinh phụng vụ' : 'Liturgical Hours'}
          </h2>
          <div className="w-8"></div>
        </div>
        <ErrorMessage 
          message={error.message || (lang === 'vi' ? 'Không thể tải các giờ kinh phụng vụ' : 'Failed to load liturgical hours')}
          onRetry={onRefresh}
        />
      </div>
    );
  }

  if (!liturgicalPrayer) {
    return null;
  }

  const currentHour = getCurrentHourContent();

  return (
    <div className="space-y-5 animate-fadeIn pb-24">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setView('dashboard')} 
          className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"
        >
          <i className="fa-solid fa-chevron-left"></i> {t.back}
        </button>
        <h2 className="text-xl font-bold text-slate-900 font-serif-display">
          {lang === 'vi' ? 'Các giờ kinh phụng vụ' : 'Liturgical Hours'}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              // Clear cache and refresh
              const today = new Date().toLocaleDateString('vi-VN');
              const cacheKey = `liturgical_prayers_${today}_${lang}`;
              localStorage.removeItem(cacheKey);
              onRefresh(true);
            }}
            className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-slate-400 active:scale-90 transition-all border border-amber-900/5"
            title={lang === 'vi' ? 'Xóa cache và tải lại' : 'Clear cache and reload'}
          >
            <i className="fa-solid fa-trash text-[9px]"></i>
          </button>
          <button 
            onClick={() => onRefresh(true)}
            className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-slate-400 active:scale-90 transition-all border border-amber-900/5"
            title={lang === 'vi' ? 'Làm mới (tải lại từ API)' : 'Refresh (reload from API)'}
          >
            <i className="fa-solid fa-rotate text-[10px]"></i>
          </button>
        </div>
      </div>

      {/* Liturgical Date Card */}
      <div className={`glass p-4 rounded-[1.5rem] border-white shadow-sm ${colorClass}`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">
              {lang === 'vi' ? 'Ngày phụng vụ' : 'Liturgical Date'}
            </p>
            <p className="text-[13px] font-bold text-current">
              {liturgicalPrayer.liturgicalDate}
            </p>
            {liturgicalPrayer.saint && (
              <p className="text-[9px] text-current/70 mt-1 italic">
                {lang === 'vi' ? 'Thánh' : 'Saint'}: {liturgicalPrayer.saint}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/40 flex items-center justify-center">
            <i className="fa-solid fa-book-bible text-2xl text-current"></i>
          </div>
        </div>
      </div>

      {/* Hour Selector */}
      <div className="grid grid-cols-5 gap-2">
        {(['readings', 'morning', 'midday', 'evening', 'night'] as PrayerHour[]).map((hour) => {
          if (!availableHours.includes(hour)) return null;
          return (
            <button
              key={hour}
              onClick={() => setSelectedHour(hour)}
              className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                selectedHour === hour
                  ? 'glass border-2 border-amber-500 shadow-lg'
                  : 'glass border border-white shadow-sm opacity-60'
              }`}
            >
              <i className={`fa-solid ${hourIcons[hour]} text-base ${
                selectedHour === hour ? 'text-amber-700' : 'text-slate-400'
              }`}></i>
              <span className={`text-[7px] font-bold uppercase text-center leading-tight ${
                selectedHour === hour ? 'text-slate-700' : 'text-slate-400'
              }`}>
                {hourLabels[hour]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Prayer Hour Content */}
      {currentHour ? (
        <div className="space-y-4">
          {/* 1. Lời mở đầu */}
          <div className="glass p-4 rounded-[1.5rem] border-white shadow-sm">
            <h3 className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-2">
              {lang === 'vi' ? '1. Lời mở đầu' : '1. Opening'}
            </h3>
            <p className="text-[12px] text-slate-700 font-prayer italic leading-relaxed whitespace-pre-line">
              {currentHour.opening}
            </p>
          </div>

          {/* 2. Thánh vịnh */}
          {currentHour.psalms && currentHour.psalms.length > 0 && (
            <div className="glass p-4 rounded-[1.5rem] border-white shadow-sm space-y-4">
              <h3 className="text-[9px] font-black text-amber-800 uppercase tracking-widest">
                {lang === 'vi' ? '2. Thánh vịnh' : '2. Psalms'}
              </h3>
              {currentHour.psalms.map((psalm, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-900/5">
                    <p className="text-[9px] font-black text-amber-800 uppercase tracking-wider mb-1">
                      {psalm.number}
                    </p>
                    <p className="text-[10px] font-bold text-slate-700 italic">
                      ĐC: {psalm.antiphon}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {psalm.verses.map((verse, vIdx) => (
                      <p key={vIdx} className="text-[11px] text-slate-700 font-prayer italic leading-relaxed">
                        {verse}
                      </p>
                    ))}
                  </div>
                  {psalm.glory && (
                    <p className="text-[10px] text-slate-600 font-prayer italic mt-2">
                      {psalm.glory}
                    </p>
                  )}
                  <div className="bg-amber-50/40 p-2 rounded-lg border border-amber-900/5 mt-2">
                    <p className="text-[9px] font-bold text-slate-700 italic">
                      ĐC: {psalm.antiphon}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Bài đọc ngắn */}
          {currentHour.shortReading && (
            <div className="glass p-4 rounded-[1.5rem] border-white shadow-sm">
              <h3 className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-2">
                {lang === 'vi' ? '3. Bài đọc ngắn' : '3. Short Reading'}
              </h3>
              <p className="text-[10px] font-bold text-amber-700 mb-2">
                {currentHour.shortReading.reference}
              </p>
              <p className="text-[12px] text-slate-700 font-prayer italic leading-relaxed whitespace-pre-line">
                {currentHour.shortReading.content}
              </p>
            </div>
          )}

          {/* 4. Đáp ca */}
          {currentHour.responsory && (
            <div className="glass p-4 rounded-[1.5rem] border-white shadow-sm">
              <h3 className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-2">
                {lang === 'vi' ? '4. Đáp ca' : '4. Responsory'}
              </h3>
              <p className="text-[12px] text-slate-700 font-prayer italic leading-relaxed whitespace-pre-line">
                {currentHour.responsory}
              </p>
            </div>
          )}

          {/* 5. Ca vịnh Tin Mừng */}
          {currentHour.gospelCanticle && (
            <div className="glass p-4 rounded-[1.5rem] border-white shadow-sm space-y-3">
              <h3 className="text-[9px] font-black text-amber-800 uppercase tracking-widest">
                {lang === 'vi' ? '5. Ca vịnh Tin Mừng' : '5. Gospel Canticle'}
              </h3>
              <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-900/5">
                <p className="text-[10px] font-bold text-slate-700 italic mb-1">
                  {currentHour.gospelCanticle.title}
                </p>
                <p className="text-[9px] font-bold text-amber-700 mb-2">
                  ĐC: {currentHour.gospelCanticle.antiphon}
                </p>
                <p className="text-[12px] text-slate-700 font-prayer italic leading-relaxed whitespace-pre-line">
                  {currentHour.gospelCanticle.content}
                </p>
                <div className="bg-amber-100/40 p-2 rounded-lg border border-amber-900/5 mt-3">
                  <p className="text-[9px] font-bold text-slate-700 italic">
                    ĐC: {currentHour.gospelCanticle.antiphon}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 6. Lời cầu */}
          {currentHour.intercessions && (
            <div className="glass p-4 rounded-[1.5rem] border-white shadow-sm space-y-2">
              <h3 className="text-[9px] font-black text-amber-800 uppercase tracking-widest">
                {lang === 'vi' ? '6. Lời cầu' : '6. Intercessions'}
              </h3>
              {currentHour.intercessions.title && (
                <p className="text-[10px] font-bold text-slate-600 mb-2">
                  {currentHour.intercessions.title}
                </p>
              )}
              {currentHour.intercessions.prayers.map((prayer, idx) => (
                <p key={idx} className="text-[12px] text-slate-700 font-prayer italic leading-relaxed">
                  {prayer}
                </p>
              ))}
            </div>
          )}

          {/* 7. Lời nguyện */}
          <div className="glass p-4 rounded-[1.5rem] border-white shadow-sm">
            <h3 className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-2">
              {lang === 'vi' ? '7. Lời nguyện' : '7. Concluding Prayer'}
            </h3>
            <p className="text-[12px] text-slate-700 font-prayer italic leading-relaxed whitespace-pre-line">
              {currentHour.concludingPrayer}
            </p>
          </div>

          {/* Thánh thi (nếu có) */}
          {currentHour.hymn && (
            <div className="glass p-4 rounded-[1.5rem] border-white shadow-sm">
              <h3 className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-2">
                {lang === 'vi' ? 'Thánh thi' : 'Hymn'}
              </h3>
              <p className="text-[12px] text-slate-700 font-prayer italic leading-relaxed whitespace-pre-line">
                {currentHour.hymn}
              </p>
            </div>
          )}

          {/* Dismissal */}
          {currentHour.dismissal && (
            <div className="glass p-4 rounded-[1.5rem] border-white shadow-sm">
              <h3 className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-2">
                {lang === 'vi' ? 'Kết thúc' : 'Dismissal'}
              </h3>
              <p className="text-[12px] text-slate-700 font-prayer italic leading-relaxed whitespace-pre-line">
                {currentHour.dismissal}
              </p>
            </div>
          )}

          {/* Marian Anthem */}
          {currentHour.marianAnthem && (
            <div className="glass p-4 rounded-[1.5rem] border-white shadow-sm">
              <h3 className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-2">
                {lang === 'vi' ? 'Ca vãn kính Đức Mẹ' : 'Marian Anthem'}
              </h3>
              <p className="text-[12px] text-slate-700 font-prayer italic leading-relaxed whitespace-pre-line">
                {currentHour.marianAnthem}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="glass p-12 rounded-2xl border-white shadow-sm flex flex-col items-center justify-center text-center opacity-40">
          <i className="fa-regular fa-book-prayer text-4xl text-slate-300 mb-3"></i>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {lang === 'vi' ? 'Chưa có giờ kinh này' : 'This hour is not available'}
          </p>
        </div>
      )}
    </div>
  );
};
