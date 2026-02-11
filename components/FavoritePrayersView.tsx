import React from 'react';
import { PrayerHistoryItem, AppView, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface FavoritePrayersViewProps {
  favoritePrayers: PrayerHistoryItem[];
  lang: Language;
  setView: (view: AppView) => void;
  onRemoveFavorite: (id: string) => void;
  onUseFavorite: (prayer: PrayerHistoryItem) => void;
}

export const FavoritePrayersView: React.FC<FavoritePrayersViewProps> = ({
  favoritePrayers,
  lang,
  setView,
  onRemoveFavorite,
  onUseFavorite
}) => {
  const t = getTranslation(lang);

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
          {lang === 'vi' ? 'Lời cầu nguyện đã lưu' : 'Saved Prayers'}
        </h2>
        <div className="w-8"></div>
      </div>

      {favoritePrayers.length === 0 ? (
        <div className="glass p-12 rounded-2xl border-white shadow-sm flex flex-col items-center justify-center text-center opacity-40">
          <i className="fa-regular fa-heart text-4xl text-slate-300 mb-3"></i>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {lang === 'vi' ? 'Chưa có lời cầu nguyện đã lưu' : 'No saved prayers yet'}
          </p>
          <p className="text-[8px] text-slate-400 mt-2">
            {lang === 'vi' ? 'Nhấn vào biểu tượng trái tim khi cầu nguyện để lưu' : 'Tap the heart icon while praying to save'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {favoritePrayers.map(prayer => (
            <div
              key={prayer.id}
              className="glass p-4 rounded-[1.5rem] border-white shadow-sm space-y-3 group hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[8px] font-black text-amber-800 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md">
                      {prayer.theme}
                    </span>
                    <span className="text-[7px] text-slate-400">
                      {new Date(prayer.timestamp).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {prayer.bibleVerse && (
                    <div className="bg-amber-50/40 p-3 rounded-xl mb-2 border border-amber-900/5">
                      <p className="text-[11px] text-slate-800 font-prayer italic font-bold leading-relaxed">
                        "{prayer.bibleVerse}"
                      </p>
                    </div>
                  )}
                  
                  <p className="text-[12px] text-slate-700 font-prayer italic leading-relaxed">
                    {prayer.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-amber-900/5">
                <button
                  onClick={() => onUseFavorite(prayer)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-wider active:scale-95 transition-all hover:bg-amber-200"
                >
                  <i className="fa-solid fa-play text-[8px]"></i>
                  {lang === 'vi' ? 'Sử dụng' : 'Use'}
                </button>
                <button
                  onClick={() => onRemoveFavorite(prayer.id)}
                  className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center active:scale-90 transition-all opacity-0 group-hover:opacity-100"
                  title={lang === 'vi' ? 'Xóa khỏi yêu thích' : 'Remove from favorites'}
                >
                  <i className="fa-solid fa-heart-crack text-[10px]"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
