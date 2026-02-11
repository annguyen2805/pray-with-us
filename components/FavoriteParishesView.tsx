import React, { useRef, useState } from 'react';
import { FavoriteParish, CheckInPhoto, Language, AppView } from '../types';
import { getTranslation } from '../utils/translations';

interface FavoriteParishesViewProps {
  favoriteParishes: FavoriteParish[];
  lang: Language;
  setView: (view: AppView) => void;
  onRemoveFavorite: (parishName: string) => void;
  onAddCheckInPhoto: (parishName: string, imageData: string, note?: string) => void;
  onRemoveCheckInPhoto: (parishName: string, photoId: string) => void;
  onCreateAppointment?: (parish: FavoriteParish, time: string, day: string) => void;
}

export const FavoriteParishesView: React.FC<FavoriteParishesViewProps> = ({
  favoriteParishes,
  lang,
  setView,
  onRemoveFavorite,
  onAddCheckInPhoto,
  onRemoveCheckInPhoto,
  onCreateAppointment
}) => {
  const t = getTranslation(lang);
  const [selectedParish, setSelectedParish] = useState<FavoriteParish | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [photoNote, setPhotoNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedParish) return;

    if (!file.type.startsWith('image/')) {
      alert(lang === 'vi' ? 'Vui lòng chọn file ảnh' : 'Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert(lang === 'vi' ? 'Ảnh quá lớn (tối đa 5MB)' : 'Image too large (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      onAddCheckInPhoto(selectedParish.name, imageData, photoNote);
      setPhotoNote('');
      setShowPhotoUpload(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const openPhotoUpload = (parish: FavoriteParish) => {
    setSelectedParish(parish);
    setShowPhotoUpload(true);
    setPhotoNote('');
  };

  const getMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-5 animate-fadeIn">

      {favoriteParishes.length === 0 ? (
        <div className="text-center py-16 opacity-40">
          <i className="fa-solid fa-heart text-5xl text-slate-300 mb-4"></i>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            {lang === 'vi' ? 'Chưa có nhà thờ yêu thích' : 'No favorite churches yet'}
          </p>
          <p className="text-[8px] text-slate-400">
            {lang === 'vi' 
              ? 'Thêm nhà thờ yêu thích từ màn hình tìm kiếm' 
              : 'Add favorite churches from search screen'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {favoriteParishes.map((parish) => (
            <div
              key={parish.name}
              className="glass p-4 rounded-[1.5rem] border-white shadow-sm space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-grow">
                  <h3 className="text-[14px] font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <i className="fa-solid fa-church text-amber-700"></i>
                    <span>{parish.name}</span>
                  </h3>
                  <a
                    href={getMapsUrl(parish.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-amber-700 underline break-words hover:text-amber-800 transition-colors"
                  >
                    <i className="fa-solid fa-location-dot text-[8px] mr-1"></i>
                    {parish.address}
                  </a>
                  <p className="text-[8px] text-slate-400 mt-1">
                    {lang === 'vi' ? 'Thêm vào' : 'Added'} {formatDate(parish.addedAt)}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveFavorite(parish.name)}
                  className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm active:scale-90 hover:bg-rose-200 transition-colors"
                  title={lang === 'vi' ? 'Xóa khỏi yêu thích' : 'Remove from favorites'}
                >
                  <i className="fa-solid fa-heart text-[12px]"></i>
                </button>
              </div>

              {/* Mass Schedules */}
              {parish.massSchedules && parish.massSchedules.length > 0 && (
                <div className="mt-2 bg-gradient-to-br from-amber-50/80 to-white/60 rounded-xl p-3 border border-amber-100 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    <i className="fa-solid fa-calendar-days text-amber-700 text-[10px]"></i>
                    <p className="text-[9px] font-black text-amber-900/70 uppercase tracking-[0.15em]">
                      {lang === 'vi' ? 'Lịch lễ' : 'Mass Schedule'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {parish.massSchedules.map((ms, i) => (
                      <div key={`${ms.day}-${i}`} className="bg-white/70 rounded-lg p-2 border border-amber-50/50">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <i className="fa-solid fa-clock text-amber-600 text-[9px]"></i>
                            <span className="text-[10px] font-bold text-slate-800">{ms.day}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {ms.times.map((time, timeIdx) => (
                            <button
                              key={`${time}-${timeIdx}`}
                              onClick={() => onCreateAppointment && onCreateAppointment(parish, time, ms.day)}
                              className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-[9px] font-semibold hover:bg-amber-200 active:scale-95 transition-all flex items-center gap-1 group"
                              title={lang === 'vi' ? `Đặt lịch lễ ${time}` : `Schedule mass at ${time}`}
                            >
                              <span>{time}</span>
                              {onCreateAppointment && (
                                <i className="fa-solid fa-plus text-[7px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Check-in Photos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black text-amber-900/60 uppercase tracking-[0.15em]">
                    <i className="fa-solid fa-camera text-[8px] mr-1"></i>
                    {lang === 'vi' ? 'Check-in' : 'Check-ins'}
                  </p>
                  <button
                    onClick={() => openPhotoUpload(parish)}
                    className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-[8px] font-bold uppercase tracking-wider hover:bg-amber-200 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <i className="fa-solid fa-plus text-[7px]"></i>
                    {lang === 'vi' ? 'Thêm ảnh' : 'Add Photo'}
                  </button>
                </div>

                {parish.checkInPhotos && parish.checkInPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {parish.checkInPhotos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.imageData}
                          alt={`Check-in at ${parish.name}`}
                          className="w-full h-24 object-cover rounded-lg border border-amber-100"
                        />
                        <button
                          onClick={() => onRemoveCheckInPhoto(parish.name, photo.id)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                          title={lang === 'vi' ? 'Xóa ảnh' : 'Remove photo'}
                        >
                          <i className="fa-solid fa-times text-[8px]"></i>
                        </button>
                        {photo.note && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[7px] p-1 rounded-b-lg truncate">
                            {photo.note}
                          </div>
                        )}
                        <div className="absolute top-1 left-1 bg-black/40 text-white text-[6px] px-1 py-0.5 rounded">
                          {formatDate(photo.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-amber-50/50 rounded-lg border border-amber-100">
                    <i className="fa-solid fa-camera text-2xl text-amber-300 mb-2"></i>
                    <p className="text-[8px] text-slate-400">
                      {lang === 'vi' ? 'Chưa có ảnh check-in' : 'No check-in photos yet'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoUpload && selectedParish && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
          <div className="glass p-5 rounded-2xl border-white shadow-xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-bold text-slate-900">
                {lang === 'vi' ? 'Thêm ảnh check-in' : 'Add Check-in Photo'}
              </h3>
              <button
                onClick={() => {
                  setShowPhotoUpload(false);
                  setPhotoNote('');
                }}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center active:scale-90"
              >
                <i className="fa-solid fa-times text-[10px]"></i>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-amber-900/60 uppercase tracking-wider block mb-1">
                  {lang === 'vi' ? 'Chọn ảnh' : 'Select Photo'}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-amber-300 rounded-xl text-amber-700 hover:bg-amber-50 active:scale-95 transition-all flex flex-col items-center gap-2"
                >
                  <i className="fa-solid fa-camera text-xl"></i>
                  <span className="text-[10px] font-medium">
                    {lang === 'vi' ? 'Nhấn để chọn ảnh' : 'Tap to select photo'}
                  </span>
                </button>
              </div>
              <div>
                <label className="text-[9px] font-bold text-amber-900/60 uppercase tracking-wider block mb-1">
                  {lang === 'vi' ? 'Ghi chú (tùy chọn)' : 'Note (optional)'}
                </label>
                <input
                  type="text"
                  value={photoNote}
                  onChange={(e) => setPhotoNote(e.target.value)}
                  placeholder={lang === 'vi' ? 'Viết ghi chú...' : 'Write a note...'}
                  className="w-full bg-white/70 border border-amber-100 rounded-xl px-3 py-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
