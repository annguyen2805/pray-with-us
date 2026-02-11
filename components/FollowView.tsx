import React, { useState } from 'react';
import { FollowedItem, FollowItemType, AppView, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface FollowViewProps {
  followedItems: FollowedItem[];
  lang: Language;
  onUnfollow: (id: string) => void;
  onFollowItem: (item: Omit<FollowedItem, 'id' | 'followedAt'>) => void;
  setView: (view: AppView) => void;
  onUseItem?: (item: FollowedItem) => void;
}

export const FollowView: React.FC<FollowViewProps> = ({
  followedItems,
  lang,
  onUnfollow,
  onFollowItem,
  setView,
  onUseItem
}) => {
  const t = getTranslation(lang);
  const [activeFilter, setActiveFilter] = useState<FollowItemType | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState<FollowItemType>('intention');

  const filteredItems = activeFilter === 'all' 
    ? followedItems 
    : followedItems.filter(item => item.type === activeFilter);

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<FollowItemType, FollowedItem[]>);

  const handleAddFollow = () => {
    if (newItemTitle.trim()) {
      onFollowItem({
        type: newItemType,
        title: newItemTitle.trim(),
        description: '',
        followedAt: new Date().toISOString()
      });
      setNewItemTitle('');
      setShowAddForm(false);
    }
  };

  const getTypeIcon = (type: FollowItemType): string => {
    const icons: Record<FollowItemType, string> = {
      intention: 'fa-heart',
      theme: 'fa-star',
      prayer: 'fa-hands-praying',
      devotional: 'fa-book-bible',
      saint: 'fa-user-nun'
    };
    return icons[type] || 'fa-bookmark';
  };

  const getTypeLabel = (type: FollowItemType, lang: Language): string => {
    const labels: Record<FollowItemType, { vi: string; en: string }> = {
      intention: { vi: 'Ý nguyện', en: 'Intention' },
      theme: { vi: 'Chủ đề', en: 'Theme' },
      prayer: { vi: 'Lời cầu nguyện', en: 'Prayer' },
      devotional: { vi: 'Suy niệm', en: 'Devotional' },
      saint: { vi: 'Thánh', en: 'Saint' }
    };
    return labels[type]?.[lang] || type;
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setView('dashboard')} 
          className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"
        >
          <i className="fa-solid fa-chevron-left"></i> {t.back}
        </button>
        <h2 className="text-xl font-bold text-slate-900 font-serif-display">
          {lang === 'vi' ? 'Theo dõi' : 'Following'}
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-8 h-8 rounded-full lumina-gradient text-white flex items-center justify-center shadow-lg active:scale-90"
        >
          <i className={`fa-solid ${showAddForm ? 'fa-times' : 'fa-plus'} text-[10px]`}></i>
        </button>
      </div>

      {/* Add New Follow Form */}
      {showAddForm && (
        <div className="glass p-4 rounded-2xl border-white shadow-md space-y-3 animate-slideUp">
          <h3 className="text-[10px] font-bold text-amber-900/60 uppercase tracking-widest">
            {lang === 'vi' ? 'Thêm mục theo dõi' : 'Add Item to Follow'}
          </h3>
          <select
            value={newItemType}
            onChange={(e) => setNewItemType(e.target.value as FollowItemType)}
            className="w-full bg-white/50 p-2.5 rounded-xl border border-amber-900/10 text-[11px] font-medium text-slate-700 focus:outline-none"
          >
            {(['intention', 'theme', 'prayer', 'devotional', 'saint'] as FollowItemType[]).map(type => (
              <option key={type} value={type}>
                {getTypeLabel(type, lang)}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder={lang === 'vi' ? 'Tên mục theo dõi...' : 'Item name...'}
            className="w-full bg-white/50 p-2.5 rounded-xl border border-amber-900/10 text-[11px] font-medium text-slate-700 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleAddFollow()}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddFollow}
              className="flex-1 lumina-gradient text-white py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md active:scale-95"
            >
              {lang === 'vi' ? 'Thêm' : 'Add'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewItemTitle('');
              }}
              className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider active:scale-95"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
            activeFilter === 'all'
              ? 'lumina-gradient text-white shadow-md'
              : 'bg-white/50 text-slate-500 border border-amber-900/10'
          }`}
        >
          {lang === 'vi' ? 'Tất cả' : 'All'}
        </button>
        {(['intention', 'theme', 'prayer', 'devotional', 'saint'] as FollowItemType[]).map(type => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeFilter === type
                ? 'lumina-gradient text-white shadow-md'
                : 'bg-white/50 text-slate-500 border border-amber-900/10'
            }`}
          >
            {getTypeLabel(type, lang)}
          </button>
        ))}
      </div>

      {/* Followed Items List */}
      {filteredItems.length === 0 ? (
        <div className="glass p-12 rounded-2xl border-white shadow-sm flex flex-col items-center justify-center text-center opacity-40">
          <i className="fa-solid fa-bookmark text-4xl text-slate-300 mb-3"></i>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {lang === 'vi' ? 'Chưa có mục nào được theo dõi' : 'No items followed yet'}
          </p>
          <p className="text-[8px] text-slate-400 mt-2">
            {lang === 'vi' ? 'Nhấn nút + để thêm mục theo dõi' : 'Press + to add items to follow'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([type, items]) => (
            <div key={type} className="space-y-2">
              {activeFilter === 'all' && (
                <h3 className="text-[9px] font-bold text-amber-900/40 uppercase tracking-[0.2em] px-2">
                  {getTypeLabel(type as FollowItemType, lang)}
                </h3>
              )}
              {items.map(item => (
                <div
                  key={item.id}
                  className="glass p-4 rounded-2xl border-white shadow-sm flex items-center gap-3 group hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                    <i className={`fa-solid ${item.icon || getTypeIcon(item.type)} text-base`}></i>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-[12px] font-bold text-slate-800 leading-tight truncate">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-1">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      {item.useCount !== undefined && (
                        <span className="text-[7px] text-slate-400">
                          <i className="fa-solid fa-repeat text-[6px] mr-1"></i>
                          {item.useCount} {lang === 'vi' ? 'lần' : 'times'}
                        </span>
                      )}
                      <span className="text-[7px] text-slate-400">
                        {new Date(item.followedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onUseItem && (
                      <button
                        onClick={() => onUseItem(item)}
                        className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center active:scale-90 transition-all"
                        title={lang === 'vi' ? 'Sử dụng' : 'Use'}
                      >
                        <i className="fa-solid fa-play text-[9px]"></i>
                      </button>
                    )}
                    <button
                      onClick={() => onUnfollow(item.id)}
                      className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center active:scale-90 transition-all opacity-0 group-hover:opacity-100"
                      title={lang === 'vi' ? 'Bỏ theo dõi' : 'Unfollow'}
                    >
                      <i className="fa-solid fa-bookmark-slash text-[9px]"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
