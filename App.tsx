
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PrayerTheme, FaithTreeState, PrayerHistoryItem, AppView, Language, UserProfile, AppThemeColor, Appointment, ParishSearchResponse, ParishData, ChatMessage, Mission, DailyGospelReflection, RewardChoice, FavoriteParish, CheckInPhoto, LiturgicalPrayer } from './types';
import { DEFAULT_REMINDERS, GRACE_PER_PRAYER, CROSS_LEVELS, THEME_COLORS, FALLBACK_PRAYER, DASHBOARD_THEMES, DAILY_MISSION_TEMPLATES, WEEKLY_MISSION_TEMPLATES, TRADITIONAL_PRAYERS_BANK, LEVEL_REWARDS_POOL } from './constants.tsx';
import { generatePrayer, GeneratedPrayerResponse, studyCatechism, getDailyGospelAnalysis, generateGeneralIntentions, searchNearbyParishes, getLiturgicalPrayers, generateDailyFaithMissions, GeneratedDailyMission, generateWeeklyFaithMissions, GeneratedWeeklyMission, generateRandomBibleVerse, RandomBibleVerse } from './services/geminiService';
import { FaithCross } from './components/FaithCross';
import { Dashboard } from './components/Dashboard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { FollowButton } from './components/FollowButton';
import { ErrorMessage } from './components/ErrorMessage';
import { FavoriteParishesView } from './components/FavoriteParishesView';
import { FavoritePrayersView } from './components/FavoritePrayersView';
import { LiturgicalPrayersView } from './components/LiturgicalPrayersView';
import { showEnvWarning } from './utils/envValidation';
import { getTranslation } from './utils/translations';
import { FollowedItem, FollowItemType } from './types';
import { handleApiError, AppError } from './utils/errorHandler';

declare const confetti: any;

const BASE_CUSTOM_ICONS = [
  { id: 'fa-heart', label: 'Yêu thương' },
  { id: 'fa-cross', label: 'Đức tin' },
  { id: 'fa-house-chimney-window', label: 'Gia đình' },
  { id: 'fa-briefcase', label: 'Công việc' },
  { id: 'fa-graduation-cap', label: 'Học tập' },
  { id: 'fa-shield-heart', label: 'Bảo vệ' }
];

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lumina_lang') as Language) || 'vi');
  const [appTheme, setAppTheme] = useState<AppThemeColor>(() => (localStorage.getItem('lumina_theme') as AppThemeColor) || 'amber');
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lumina_profile');
    return saved ? JSON.parse(saved) : { name: 'An Phúc', saintName: 'Phêrô', birthYear: '' };
  });
  const [view, setView] = useState<AppView>('dashboard');
  const [history, setHistory] = useState<PrayerHistoryItem[]>(() => {
    const saved = localStorage.getItem('lumina_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('lumina_appointments');
    return saved ? JSON.parse(saved) : [];
  });
  const [treeState, setTreeState] = useState<FaithTreeState>(() => {
    const saved = localStorage.getItem('lumina_tree');
    const defaultState = { level: 1, experience: 0, grace: 0, totalPrayers: 0, lastWatered: null, missions: [], lastMissionReset: null, lastWeeklyReset: null, unlockedRewards: [] };
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old format: add grace field if missing
      if (parsed.experience !== undefined && parsed.grace === undefined) {
        parsed.grace = parsed.experience;
      }
      return parsed;
    }
    return defaultState;
  });

  const [prayerData, setPrayerData] = useState<GeneratedPrayerResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [customThemeInput, setCustomThemeInput] = useState('');
  const [selectedCustomIcon, setSelectedCustomIcon] = useState('fa-cross');
  const [prayerCountdown, setPrayerCountdown] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [parishTab, setParishTab] = useState<'search' | 'favorites'>('search');

  const [dailyGospel, setDailyGospel] = useState<DailyGospelReflection | null>(null);
  const [isLoadingGospel, setIsLoadingGospel] = useState(false);
  const [randomBibleVerse, setRandomBibleVerse] = useState<RandomBibleVerse | null>(null);
  const [liturgicalPrayer, setLiturgicalPrayer] = useState<LiturgicalPrayer | null>(() => {
    // Try to load from cache on initial mount
    const today = new Date().toLocaleDateString('vi-VN');
    const cacheKey = `liturgical_prayers_${today}_${(localStorage.getItem('lumina_lang') as Language) || 'vi'}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.day === today && parsed.hours && parsed.hours.length > 0) {
          return parsed;
        }
      } catch (e) {
        // Invalid cache
      }
    }
    return null;
  });
  const [isLoadingLiturgical, setIsLoadingLiturgical] = useState(false);
  const [liturgicalError, setLiturgicalError] = useState<AppError | null>(null);
  const [catechismQuery, setCatechismQuery] = useState('');
  const [catechismResponse, setCatechismResponse] = useState<ChatMessage[]>([]);
  const [isStudying, setIsStudying] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [dailyShortcuts, setDailyShortcuts] = useState<string[]>(() => {
    const saved = localStorage.getItem('lumina_daily_shortcuts');
    return saved ? JSON.parse(saved) : ['Kinh Sáng', 'Kinh Tối', 'Ơn Bình An', 'Gia Đình'];
  });
  const [isEditingShortcuts, setIsEditingShortcuts] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [generalIntentions, setGeneralIntentions] = useState<string[]>(() => {
    const saved = localStorage.getItem('lumina_general_intentions');
    return saved ? JSON.parse(saved) : [];
  });

  const [dashboardThemes, setDashboardThemes] = useState<string[]>([]);
  const [pendingRewardLevel, setPendingRewardLevel] = useState<number | null>(null);
  const [followedItems, setFollowedItems] = useState<FollowedItem[]>(() => {
    const saved = localStorage.getItem('lumina_followed');
    return saved ? JSON.parse(saved) : [];
  });
  const [parishSearchResult, setParishSearchResult] = useState<ParishSearchResponse | null>(null);
  const [parishQuery, setParishQuery] = useState('');
  const [isSearchingParish, setIsSearchingParish] = useState(false);
  const [parishError, setParishError] = useState<AppError | null>(null);
  const [favoriteParishes, setFavoriteParishes] = useState<FavoriteParish[]>(() => {
    const saved = localStorage.getItem('lumina_favorite_parishes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate old format (string[]) to new format (FavoriteParish[])
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          return parsed.map((name: string) => ({
            name,
            address: '',
            addedAt: new Date().toISOString(),
            checkInPhotos: []
          }));
        }
        return parsed;
      } catch {
        return [];
      }
    }
    return [];
  });
  const [favoritePrayers, setFavoritePrayers] = useState<PrayerHistoryItem[]>(() => {
    const saved = localStorage.getItem('lumina_favorite_prayers');
    return saved ? JSON.parse(saved) : [];
  });

  // Settings sections collapse state
  const [settingsExpanded, setSettingsExpanded] = useState<{
    profile: boolean;
    language: boolean;
    theme: boolean;
    caritas: boolean;
    donate: boolean;
  }>({
    profile: true,
    language: false,
    theme: false,
    caritas: false,
    donate: false,
  });

  const t = getTranslation(lang);
  const c = THEME_COLORS[appTheme];
  
  // Apply night theme class to body when slate theme is selected
  useEffect(() => {
    if (appTheme === 'slate') {
      document.body.classList.add('night-theme');
    } else {
      document.body.classList.remove('night-theme');
    }
    return () => {
      document.body.classList.remove('night-theme');
    };
  }, [appTheme]);

  // Validate environment on mount
  useEffect(() => {
    showEnvWarning();
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_lang', lang);
    localStorage.setItem('lumina_theme', appTheme);
    localStorage.setItem('lumina_profile', JSON.stringify(profile));
    localStorage.setItem('lumina_tree', JSON.stringify(treeState));
    localStorage.setItem('lumina_history', JSON.stringify(history));
    localStorage.setItem('lumina_appointments', JSON.stringify(appointments));
    localStorage.setItem('lumina_daily_shortcuts', JSON.stringify(dailyShortcuts));
    localStorage.setItem('lumina_general_intentions', JSON.stringify(generalIntentions));
    localStorage.setItem('lumina_followed', JSON.stringify(followedItems));
    localStorage.setItem('lumina_favorite_parishes', JSON.stringify(favoriteParishes));
    localStorage.setItem('lumina_favorite_prayers', JSON.stringify(favoritePrayers));
  }, [lang, appTheme, profile, treeState, history, appointments, dailyShortcuts, generalIntentions, followedItems, favoriteParishes, favoritePrayers]);

  useEffect(() => {
    const today = new Date().toDateString();
    if (treeState.lastMissionReset !== today) {
       generateGeneralIntentions(lang).then(setGeneralIntentions);
       getDailyGospelAnalysis(lang).then(setDailyGospel);
       generateRandomBibleVerse(lang).then(setRandomBibleVerse);
       
       generateDailyFaithMissions(lang)
         .then((aiMissions: GeneratedDailyMission[]) => {
           const newDailyMissions: Mission[] = aiMissions.map((m, idx) => ({
             id: `daily-${idx}-${Date.now()}`,
             title: m.title,
             description: m.description,
             type: 'daily',
             expReward: m.graceReward, // giữ tương thích cũ
             graceReward: m.graceReward,
             isCompleted: false,
             isClaimed: false,
             icon: m.icon || 'fa-star'
           }));

           setTreeState(prev => ({
             ...prev,
             missions: [...newDailyMissions, ...prev.missions.filter(m => m.type === 'weekly')],
             lastMissionReset: today
           }));
         })
         .catch(error => {
           console.error('Error generating AI daily missions, falling back to templates:', error);
           const fallbackMissions: Mission[] = DAILY_MISSION_TEMPLATES.map((tmpl, idx) => ({
             id: `daily-${idx}-${Date.now()}`,
             ...tmpl,
             type: 'daily',
             isCompleted: false,
             isClaimed: false,
             graceReward: (tmpl as any).graceReward || tmpl.expReward || 0
           }));

           setTreeState(prev => ({
             ...prev,
             missions: [...fallbackMissions, ...prev.missions.filter(m => m.type === 'weekly')],
             lastMissionReset: today
           }));
         });
    }
  }, [lang, treeState.lastMissionReset]);

  // Reset weekly missions mỗi tuần (bắt đầu từ Chủ Nhật)
  useEffect(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Chủ Nhật
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    const weekStartStr = startOfWeek.toISOString();
    
    if (!treeState.lastWeeklyReset || treeState.lastWeeklyReset !== weekStartStr) {
      generateWeeklyFaithMissions(lang)
        .then((aiMissions: GeneratedWeeklyMission[]) => {
          const newWeeklyMissions: Mission[] = aiMissions.map((m, idx) => ({
            id: `weekly-${idx}-${Date.now()}`,
            title: m.title,
            description: m.description,
            type: 'weekly',
            expReward: m.graceReward, // giữ tương thích cũ
            graceReward: m.graceReward,
            isCompleted: false,
            isClaimed: false,
            icon: m.icon || 'fa-star'
          }));

          setTreeState(prev => ({
            ...prev,
            missions: [...prev.missions.filter(m => m.type === 'daily'), ...newWeeklyMissions],
            lastWeeklyReset: weekStartStr
          }));
        })
        .catch(error => {
          console.error('Error generating AI weekly missions, falling back to templates:', error);
          const fallbackMissions: Mission[] = WEEKLY_MISSION_TEMPLATES.slice(0, 3).map((tmpl, idx) => ({
            id: `weekly-${idx}-${Date.now()}`,
            ...tmpl,
            type: 'weekly',
            isCompleted: false,
            isClaimed: false,
            graceReward: (tmpl as any).graceReward || tmpl.expReward || 0
          }));

          setTreeState(prev => ({
            ...prev,
            missions: [...prev.missions.filter(m => m.type === 'daily'), ...fallbackMissions],
            lastWeeklyReset: weekStartStr
          }));
        });
    }
  }, [lang, treeState.lastWeeklyReset]);

  // Load random Bible verse on mount and when language changes
  useEffect(() => {
    if (!randomBibleVerse) {
      generateRandomBibleVerse(lang).then(setRandomBibleVerse);
    }
  }, [lang]);

  // Load daily gospel when entering catechism_study view if not already loaded
  useEffect(() => {
    if (view === 'catechism_study' && !dailyGospel && !isLoadingGospel) {
      console.log('Loading daily gospel for catechism_study view');
      setIsLoadingGospel(true);
      getDailyGospelAnalysis(lang)
        .then((data) => {
          console.log('Daily gospel loaded:', data);
          setDailyGospel(data);
        })
        .catch((error) => {
          console.error('Error loading daily gospel:', error);
        })
        .finally(() => setIsLoadingGospel(false));
    }
  }, [view, dailyGospel, lang, isLoadingGospel]);

  useEffect(() => {
    const pool = [...dailyShortcuts, ...generalIntentions];
    if (pool.length > 0) {
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      setDashboardThemes(shuffled.slice(0, 4));
    }
  }, [dailyShortcuts, generalIntentions, view]);

  const handleGeneratePrayer = async (theme: string, iconOverride?: string) => {
    if (isEditingShortcuts) return;
    setIsGenerating(true);
    setView('prayer');
    setSelectedTheme(theme);
    if (iconOverride) setSelectedCustomIcon(iconOverride);
    setPrayerData(null);
    setPrayerCountdown(10); 
    setIsExpanded(false);
    setIsFavorite(false);
    try {
      const data = await generatePrayer(theme, "day", lang);
      setPrayerData(data);
      const timer = setInterval(() => {
        setPrayerCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (error) { console.error(error); } finally { setIsGenerating(false); }
  };

  const checkLevelUp = (oldLevel: number, newLevel: number) => {
    if (newLevel > oldLevel) {
      setPendingRewardLevel(newLevel);
      setView('reward_selection');
      if (typeof confetti === 'function') {
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
      }
    }
  };

  const completePrayer = () => {
    if (!prayerData || prayerCountdown > 0) return;
    
    // Complete active mission if exists
    const currentActiveMissionId = activeMissionId;
    
    setTreeState(prev => {
      const newGrace = (prev.grace || prev.experience || 0) + GRACE_PER_PRAYER;
      let newLevel = prev.level;
      for (let i = CROSS_LEVELS.length - 1; i >= 0; i--) {
        const minRequired = (CROSS_LEVELS[i] as any).minGrace || CROSS_LEVELS[i].minExp;
        if (newGrace >= minRequired) { newLevel = CROSS_LEVELS[i].level; break; }
      }
      checkLevelUp(prev.level, newLevel);
      
      // Update missions: complete active mission if exists
      let updatedMissions = prev.missions;
      if (currentActiveMissionId) {
        updatedMissions = prev.missions.map(mission => {
          if (mission.id === currentActiveMissionId && !mission.isCompleted) {
            console.log('Completing mission:', mission.title);
            return { ...mission, isCompleted: true };
          }
          return mission;
        });
        console.log('Updated missions:', updatedMissions.map(m => ({ id: m.id, title: m.title, isCompleted: m.isCompleted })));
      }
      
      return { 
        ...prev, 
        experience: newGrace, // Keep for backward compatibility
        grace: newGrace, 
        level: newLevel, 
        totalPrayers: prev.totalPrayers + 1,
        missions: updatedMissions
      };
    });
    
    // Clear active mission after completing
    if (currentActiveMissionId) {
      setActiveMissionId(null);
    }
    const newHistoryItem: PrayerHistoryItem = {
      id: Date.now().toString(), 
      content: prayerData.personalOffering, 
      bibleVerse: prayerData.bibleVerse, 
      theme: selectedTheme, 
      timestamp: new Date().toISOString(), 
      isFavorite: isFavorite 
    };
    setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
    
    // Save to favorites if marked as favorite
    if (isFavorite) {
      setFavoritePrayers(prev => {
        // Check if already exists (by content and theme)
        const exists = prev.find(p => p.content === newHistoryItem.content && p.theme === newHistoryItem.theme);
        if (!exists) {
          return [newHistoryItem, ...prev];
        }
        return prev;
      });
    } else {
      // Remove from favorites if unmarked
      setFavoritePrayers(prev => prev.filter(p => p.id !== newHistoryItem.id));
    }
    
    if (!pendingRewardLevel) setView('dashboard');
  };

  const updateShortcut = (index: number, value: string) => {
    const newShortcuts = [...dailyShortcuts];
    newShortcuts[index] = value;
    setDailyShortcuts(newShortcuts);
  };

  const handleClaimReward = (reward: RewardChoice) => {
    setTreeState(prev => ({
      ...prev,
      unlockedRewards: [...prev.unlockedRewards, reward.id]
    }));

    if (reward.type === 'theme') {
      setAppTheme(reward.value as AppThemeColor);
    } else if (reward.type === 'intention') {
      const newIntents = reward.value.split(', ');
      setGeneralIntentions(prev => [...new Set([...prev, ...newIntents])]);
    } else if (reward.type === 'aura') {
      setProfile(prev => ({ ...prev, selectedAura: reward.value }));
    }

    setPendingRewardLevel(null);
    setView('dashboard');
  };

  const availableIcons = useMemo(() => {
    const icons = [...BASE_CUSTOM_ICONS];
    if (treeState.unlockedRewards.includes('reward_special_icons')) {
      icons.push({ id: 'fa-dove', label: 'Thánh Linh' });
      icons.push({ id: 'fa-fire-flame-curved', label: 'Lửa Mến' });
    }
    return icons;
  }, [treeState.unlockedRewards]);

  const toggleMissionStatus = (id: string) => {
    setTreeState(prev => ({
      ...prev,
      missions: prev.missions.map(m => m.id === id ? { ...m, isCompleted: !m.isCompleted } : m)
    }));
  };

  const handleClaimMission = (id: string) => {
    const mission = treeState.missions.find(m => m.id === id);
    if (!mission || !mission.isCompleted || mission.isClaimed) return;
    setTreeState(prev => {
      const currentGrace = prev.grace || prev.experience || 0;
      const rewardGrace = (mission as any).graceReward || mission.expReward;
      const newGrace = currentGrace + rewardGrace;
      let newLevel = prev.level;
      for (let i = CROSS_LEVELS.length - 1; i >= 0; i--) {
        const minRequired = (CROSS_LEVELS[i] as any).minGrace || CROSS_LEVELS[i].minExp;
        if (newGrace >= minRequired) { newLevel = CROSS_LEVELS[i].level; break; }
      }
      checkLevelUp(prev.level, newLevel);
      return { 
        ...prev, 
        experience: newGrace, // Keep for backward compatibility
        grace: newGrace, 
        level: newLevel, 
        missions: prev.missions.map(m => m.id === id ? { ...m, isClaimed: true } : m) 
      };
    });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [catechismResponse, isStudying]);

  const handleStudyCatechism = async (queryOverride?: string) => {
    const query = queryOverride || catechismQuery;
    if (!query.trim()) return;
    
    setIsStudying(true);
    setCatechismResponse(prev => [...prev, { role: 'user', text: query, timestamp: new Date().toISOString() }]);
    
    // Clear input if using current query
    if (!queryOverride) {
      setCatechismQuery('');
    }
    
    try {
      const result = await studyCatechism(query, "", lang);
      setCatechismResponse(prev => [...prev, { role: 'model', text: result, timestamp: new Date().toISOString() }]);
    } catch (e) { 
      console.error(e);
      setCatechismResponse(prev => [...prev, { 
        role: 'model', 
        text: lang === 'vi' 
          ? "Xin lỗi bạn, mình đang gặp chút vấn đề kỹ thuật. Bạn thử lại sau nhé!" 
          : "Sorry, I'm experiencing some technical issues. Please try again later!",
        timestamp: new Date().toISOString() 
      }]);
    } finally { 
      setIsStudying(false); 
    }
  };

  const quickQuestions = lang === 'vi' 
    ? [
        "Đức tin là gì?",
        "Tại sao phải cầu nguyện?",
        "Làm sao để sống đức tin mỗi ngày?",
        "Thiên Chúa có yêu thương con không?"
      ]
    : [
        "What is faith?",
        "Why should I pray?",
        "How to live faith daily?",
        "Does God love me?"
      ];

  const removeReminder = (id: string) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
  };

  const removeFavoriteParish = (parishName: string) => {
    setFavoriteParishes(prev => prev.filter(p => p.name !== parishName));
  };

  const toggleAppointmentActive = (id: string) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, active: !app.active } : app));
  };

  const saveAppointment = (app: Appointment) => {
    if (appointments.find(a => a.id === app.id)) {
      setAppointments(prev => prev.map(a => a.id === app.id ? app : a));
    } else {
      setAppointments(prev => [...prev, app]);
    }
    setEditingAppointment(null);
  };

  const startNewAppointment = () => {
    setEditingAppointment({
      id: Date.now().toString(),
      title: '',
      time: '08:00',
      type: 'prayer',
      days: [1, 2, 3, 4, 5],
      active: true
    });
  };

  const handleFollowItem = (item: Omit<FollowedItem, 'id' | 'followedAt'>) => {
    const newItem: FollowedItem = {
      ...item,
      id: Date.now().toString(),
      followedAt: new Date().toISOString(),
      useCount: 0
    };
    setFollowedItems(prev => [...prev, newItem]);
  };

  const handleUnfollowItem = (id: string) => {
    setFollowedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUseFollowedItem = (item: FollowedItem) => {
    setFollowedItems(prev => prev.map(fi =>
      fi.id === item.id
        ? { ...fi, useCount: (fi.useCount || 0) + 1, lastUsed: new Date().toISOString() }
        : fi
    ));

    if (item.type === 'intention' || item.type === 'theme' || item.type === 'prayer') {
      handleGeneratePrayer(item.title);
    }
  };

  const isFollowing = (title: string, type: FollowItemType): boolean => {
    return followedItems.some(item => item.title === title && item.type === type);
  };

  const toggleFollow = (title: string, type: FollowItemType, description?: string, icon?: string) => {
    const existing = followedItems.find(item => item.title === title && item.type === type);
    if (existing) {
      handleUnfollowItem(existing.id);
    } else {
      handleFollowItem({ title, type, description, icon });
    }
  };

  const performParishSearch = async (locationHint: string) => {
    if (!locationHint.trim()) return;
    setIsSearchingParish(true);
    setParishError(null);
    try {
      const result = await searchNearbyParishes(locationHint, lang);
      setParishSearchResult(result);
    } catch (error) {
      const appError = handleApiError(error);
      setParishError(appError);
    } finally {
      setIsSearchingParish(false);
    }
  };

  const initParishSearch = () => {
    setView('parish_search');
    setParishTab('search');
    setParishError(null);
    setParishSearchResult(null);

    if ('geolocation' in navigator) {
      setIsSearchingParish(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const hint = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setParishQuery('');
          performParishSearch(hint);
        },
        () => {
          setIsSearchingParish(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const handleParishSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parishQuery.trim()) return;
    performParishSearch(parishQuery);
  };

  const loadLiturgicalPrayers = async (forceRefresh: boolean = false) => {
    setIsLoadingLiturgical(true);
    setLiturgicalError(null);
    try {
      const prayers = await getLiturgicalPrayers(lang, forceRefresh);
      setLiturgicalPrayer(prayers);
    } catch (error) {
      const appError = handleApiError(error);
      setLiturgicalError(appError);
    } finally {
      setIsLoadingLiturgical(false);
    }
  };

  // Load liturgical prayers when view changes to liturgical_prayers
  // Check cache first - only load if not cached for today
  useEffect(() => {
    if (view === 'liturgical_prayers') {
      const today = new Date().toLocaleDateString('vi-VN');
      const cacheKey = `liturgical_prayers_${today}_${lang}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.day === today && parsed.hours && parsed.hours.length > 0) {
            // Use cached data immediately
            setLiturgicalPrayer(parsed);
            return; // Don't call API
          }
        } catch (e) {
          // Invalid cache, continue to load
        }
      }
      
      // No valid cache, load from API
      if (!liturgicalPrayer || liturgicalPrayer.day !== today) {
        loadLiturgicalPrayers();
      }
    }
  }, [view, lang]);

  const toggleFavoriteParish = (parish: ParishData) => {
    setFavoriteParishes(prev => {
      const existing = prev.find(p => p.name === parish.name);
      if (existing) {
        return prev.filter(p => p.name !== parish.name);
      } else {
        return [...prev, {
          name: parish.name,
          address: parish.address,
          addedAt: new Date().toISOString(),
          massSchedules: parish.massSchedules || [],
          checkInPhotos: []
        }];
      }
    });
  };

  const addCheckInPhoto = (parishName: string, imageData: string, note?: string) => {
    setFavoriteParishes(prev => prev.map(parish => {
      if (parish.name === parishName) {
        const newPhoto: CheckInPhoto = {
          id: Date.now().toString(),
          imageData,
          timestamp: new Date().toISOString(),
          note
        };
        return {
          ...parish,
          checkInPhotos: [...(parish.checkInPhotos || []), newPhoto]
        };
      }
      return parish;
    }));
  };

  const removeCheckInPhoto = (parishName: string, photoId: string) => {
    setFavoriteParishes(prev => prev.map(parish => {
      if (parish.name === parishName) {
        return {
          ...parish,
          checkInPhotos: (parish.checkInPhotos || []).filter(p => p.id !== photoId)
        };
      }
      return parish;
    }));
  };

  const isParishFavorite = (parishName: string): boolean => {
    return favoriteParishes.some(p => p.name === parishName);
  };

  // Lùi giờ nhắc trước Thánh lễ 1 tiếng (định dạng HH:mm)
  const getReminderTimeOneHourBefore = (time: string): string => {
    const [h, m] = time.split(':').map(part => parseInt(part, 10));
    if (isNaN(h) || isNaN(m)) return time;
    const date = new Date();
    date.setHours(h, m, 0, 0);
    date.setHours(date.getHours() - 1);
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const createAppointmentFromMass = (parish: ParishData, time: string, day: string) => {
    // Convert day string to day number (0 = Sunday, 1 = Monday, etc.)
    const dayMap: Record<string, number> = {
      'Chủ nhật': 0, 'CN': 0, 'Sunday': 0, 'Sun': 0,
      'Thứ hai': 1, 'T2': 1, 'Monday': 1, 'Mon': 1,
      'Thứ ba': 2, 'T3': 2, 'Tuesday': 2, 'Tue': 2,
      'Thứ tư': 3, 'T4': 3, 'Wednesday': 3, 'Wed': 3,
      'Thứ năm': 4, 'T5': 4, 'Thursday': 4, 'Thu': 4,
      'Thứ sáu': 5, 'T6': 5, 'Friday': 5, 'Fri': 5,
      'Thứ bảy': 6, 'T7': 6, 'Saturday': 6, 'Sat': 6,
    };
    
    const dayNumber = dayMap[day] !== undefined ? dayMap[day] : 0;
    // Nhắc vào ngày lễ + ngày trước đó (VD: CN -> T7 & CN, thứ 3 -> thứ 2 & thứ 3)
    const previousDay = (dayNumber + 6) % 7;
    const reminderDays = Array.from(new Set([previousDay, dayNumber])).sort();
    const reminderTime = getReminderTimeOneHourBefore(time);
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      title: `${lang === 'vi' ? 'Thánh lễ' : 'Mass'} - ${parish.name} (${lang === 'vi' ? 'lễ lúc' : 'mass at'} ${time})`,
      time: reminderTime,
      type: 'mass',
      days: reminderDays,
      active: true,
      location: parish.address
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    setView('appointments');
  };

  const createAppointmentFromFavoriteParish = (parish: FavoriteParish, time: string, day: string) => {
    // Convert day string to day number (0 = Sunday, 1 = Monday, etc.)
    const dayMap: Record<string, number> = {
      'Chủ nhật': 0, 'CN': 0, 'Sunday': 0, 'Sun': 0,
      'Thứ hai': 1, 'T2': 1, 'Monday': 1, 'Mon': 1,
      'Thứ ba': 2, 'T3': 2, 'Tuesday': 2, 'Tue': 2,
      'Thứ tư': 3, 'T4': 3, 'Wednesday': 3, 'Wed': 3,
      'Thứ năm': 4, 'T5': 4, 'Thursday': 4, 'Thu': 4,
      'Thứ sáu': 5, 'T6': 5, 'Friday': 5, 'Fri': 5,
      'Thứ bảy': 6, 'T7': 6, 'Saturday': 6, 'Sat': 6,
    };
    
    const dayNumber = dayMap[day] !== undefined ? dayMap[day] : 0;
    const previousDay = (dayNumber + 6) % 7;
    const reminderDays = Array.from(new Set([previousDay, dayNumber])).sort();
    const reminderTime = getReminderTimeOneHourBefore(time);
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      title: `${lang === 'vi' ? 'Thánh lễ' : 'Mass'} - ${parish.name} (${lang === 'vi' ? 'lễ lúc' : 'mass at'} ${time})`,
      time: reminderTime,
      type: 'mass',
      days: reminderDays,
      active: true,
      location: parish.address
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    setView('appointments');
  };

  const currentLevelInfo = CROSS_LEVELS.find(l => l.level === treeState.level) || CROSS_LEVELS[0];
  const currentTradPrayer = prayerData ? TRADITIONAL_PRAYERS_BANK[prayerData.tradPrayerId] : null;
  const fullName = `${profile.saintName ? profile.saintName + ' ' : ''}${profile.name}`;
  
  // Find the first uncompleted mission for the dashboard highlight
  const nextMission = treeState.missions.find(m => !m.isCompleted);
  
  // Check if a mission is related to prayer
  const isPrayerMission = (mission: Mission): boolean => {
    const prayerKeywords = ['Kinh', 'kinh', 'Prayer', 'prayer', 'Cầu nguyện', 'cầu nguyện', 'Lời Chúa', 'lời chúa'];
    return prayerKeywords.some(keyword => 
      mission.title.includes(keyword) || mission.description.includes(keyword)
    );
  };
  
  // Handle mission click
  const handleMissionClick = (mission: Mission) => {
    console.log('Mission clicked:', mission.title, 'Is prayer mission:', isPrayerMission(mission));
    if (isPrayerMission(mission)) {
      // Set active mission and navigate to prayer
      setActiveMissionId(mission.id);
      console.log('Set active mission ID:', mission.id);
      handleGeneratePrayer(mission.title || mission.description);
    } else {
      // Navigate to tree view for non-prayer missions
      setView('tree');
    }
  };

  return (
    <div className={`max-w-md mx-auto h-screen ${c.bg} flex flex-col relative overflow-hidden transition-all duration-700`}>
      <header className="px-5 py-4 glass sticky top-0 z-50 flex items-center justify-between border-b border-amber-900/10">
        <div className="flex items-center gap-3" onClick={() => setView('dashboard')}>
          <div className="w-9 h-9 rounded-xl lumina-gradient flex items-center justify-center shadow-lg shadow-amber-950/10 divine-pulse">
            <i className="fa-solid fa-hand-holding-heart text-white text-base"></i>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-[0.05em] font-serif-display shimmer-text leading-none uppercase">Pray with God</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('tree')} className="bg-white/90 border border-white px-3 py-1.5 rounded-xl shadow-sm active:scale-95 flex items-center gap-1.5">
             <span className="text-xs">{currentLevelInfo.icon}</span>
             <span className="text-[9px] font-black text-amber-950 uppercase tracking-widest">Lvl {treeState.level}</span>
          </button>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto px-5 pt-4 pb-24 relative z-10 scroll-smooth">
        {view === 'dashboard' && (
          <Dashboard
            profile={profile}
            treeState={treeState}
            lang={lang}
            customThemeInput={customThemeInput}
            setCustomThemeInput={setCustomThemeInput}
            setView={setView}
            handleGeneratePrayer={handleGeneratePrayer}
            isEditingShortcuts={isEditingShortcuts}
            nextMission={nextMission}
            onOpenParishSearch={initParishSearch}
            dailyGospel={dailyGospel}
            randomBibleVerse={randomBibleVerse}
            recentPrayers={history.slice(0, 2)}
            upcomingAppointments={appointments}
            onMissionClick={handleMissionClick}
            onOpenCaritas={() => {
              setSettingsExpanded(prev => ({ ...prev, caritas: true }));
              setView('settings');
            }}
          />
        )}

        {view === 'reward_selection' && pendingRewardLevel && (
          <div className="flex flex-col items-center justify-start min-h-[70vh] animate-fadeIn space-y-5 px-4 pt-8 pb-6">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setView('dashboard')}
                  className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center text-[10px] text-slate-400 active:scale-95 transition-transform"
                >
                  <i className="fa-solid fa-arrow-left" />
                </button>
                <div className="flex flex-col items-end text-right">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.18em]">
                    {lang === 'vi' ? 'Hồng ân cấp độ' : 'Grace Level'}
                  </span>
                  <span className="text-sm font-bold text-amber-800">
                    Lv {pendingRewardLevel}
                  </span>
                </div>
              </div>

              <div className="glass rounded-2xl px-4 py-3 border-white shadow-sm space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-800">
                  {lang === 'vi'
                    ? 'Mỗi lần con hoàn tất giờ cầu nguyện, con được cộng thêm ơn.'
                    : 'Each time you finish a prayer session, your grace increases.'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {lang === 'vi'
                    ? `Khi “thanh ơn” đầy 100%, con lên cấp mới và được chọn một hồng ân đặc biệt từ Thiên Chúa.`
                    : `When your “grace bar” reaches 100%, you level up and can choose a special gift of grace.`}
                </p>
              </div>

              <h2 className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.18em] mt-1">
                {lang === 'vi' ? 'Chọn 1 hồng ân cho cấp độ này' : 'Choose one grace for this level'}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 w-full max-w-sm pt-1">
              {(LEVEL_REWARDS_POOL[pendingRewardLevel] || []).map(reward => (
                <button
                  key={reward.id}
                  onClick={() => handleClaimReward(reward)}
                  className="glass p-4 rounded-2xl border-white shadow-sm hover:shadow-md active:scale-95 transition-all text-left flex items-center gap-3 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                    <i className={`fa-solid ${reward.icon} text-lg`} />
                  </div>
                  <div className="flex-grow pr-2">
                    <h3 className="text-[13px] font-semibold text-slate-900 tracking-tight">
                      {reward.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                      {reward.description}
                    </p>
                  </div>
                  <i className="fa-solid fa-chevron-right text-[9px] text-amber-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'theme_selection' && (
          <div className="space-y-5 animate-fadeIn pb-24">
            <div className="flex flex-col items-center mb-6 mt-1">
              <div className="flex items-center justify-between w-full px-1">
                <button onClick={() => setView('dashboard')} className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center active:scale-90 transition-transform">
                  <i className="fa-solid fa-arrow-left text-slate-400 text-[9px]"></i>
                </button>
                <h2 className="text-xl font-black text-amber-950 font-serif-display uppercase tracking-widest shimmer-text">{t.prayNow}</h2>
                <div className="w-8"></div>
              </div>
            </div>
            
            <section className="space-y-3 animate-slideUp">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[9px] font-black text-amber-900/50 uppercase tracking-[0.15em]">{t.dailyIntentions}</h3>
                <button 
                  onClick={() => setIsEditingShortcuts(!isEditingShortcuts)} 
                  className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all border ${isEditingShortcuts ? 'bg-amber-800 text-white border-amber-900' : 'bg-white text-amber-800 border-amber-900/10'}`}
                >
                  {isEditingShortcuts ? t.save : t.edit}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {dailyShortcuts.map((theme, idx) => (
                  <div key={idx} className="relative">
                    {isEditingShortcuts ? (
                      <div className="glass p-2.5 rounded-xl border-amber-500/30 shadow-inner flex items-center ring-1 ring-amber-500/10">
                        <input 
                          type="text" 
                          value={theme}
                          onChange={(e) => updateShortcut(idx, e.target.value)}
                          className="w-full bg-transparent text-[10px] font-bold text-slate-700 outline-none text-center"
                        />
                      </div>
                    ) : (
                      <div className="relative group">
                        <button 
                          onClick={() => handleGeneratePrayer(theme, idx % 2 === 0 ? 'fa-star' : 'fa-heart')} 
                          className="w-full glass p-2.5 rounded-xl border-white shadow-sm flex items-center gap-2.5 active:scale-95 transition-all overflow-hidden"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                             <i className={`fa-solid ${idx % 2 === 0 ? 'fa-star' : 'fa-heart'} text-[9px]`}></i>
                          </div>
                          <p className="text-[10px] font-bold text-slate-700 tracking-tight truncate flex-grow">{theme}</p>
                        </button>
                        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <FollowButton
                            isFollowing={isFollowing(theme, 'theme')}
                            onToggle={() => toggleFollow(theme, 'theme', '', idx % 2 === 0 ? 'fa-star' : 'fa-heart')}
                            size="sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Ý nguyện riêng */}
            <section className="space-y-3 animate-slideUp" style={{ animationDelay: '0.05s' }}>
              <h3 className="text-[9px] font-black text-amber-900/50 uppercase tracking-[0.15em] px-1">{t.customIntention}</h3>
              <div className="bg-white/70 p-1 rounded-2xl border border-white shadow-md flex gap-2 items-center backdrop-blur-md">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 ml-0.5">
                  <i className="fa-solid fa-heart text-[10px]"></i>
                </div>
                <input 
                  type="text" 
                  value={customThemeInput} 
                  onChange={e => setCustomThemeInput(e.target.value)} 
                  className="flex-grow bg-transparent py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none" 
                  placeholder={t.customPlaceholder} 
                />
                <button 
                  onClick={() => customThemeInput && handleGeneratePrayer(customThemeInput)} 
                  disabled={!customThemeInput}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md shrink-0 ${customThemeInput ? 'lumina-gradient text-white' : 'bg-slate-100 text-slate-300'}`}
                >
                  <i className="fa-solid fa-arrow-right text-[8px]"></i>
                </button>
              </div>
            </section>

            {/* Ý nguyện chung */}
            <section className="space-y-3 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-[9px] font-black text-amber-900/50 uppercase tracking-[0.15em] px-1">{t.generalIntentions}</h3>
              <div className="flex flex-wrap gap-2">
                {generalIntentions.slice(0, 5).map((intention, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleGeneratePrayer(intention)}
                    className="px-3 py-2 bg-white/70 hover:bg-amber-50 border border-white rounded-full text-[10px] font-medium text-slate-700 transition-all hover:scale-105 active:scale-95 shadow-sm"
                  >
                    {intention}
                  </button>
                ))}
              </div>
            </section>

            {/* Lời cầu nguyện đã lưu */}
            <section className="space-y-3 animate-slideUp" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[9px] font-black text-amber-900/50 uppercase tracking-[0.15em]">
                  {lang === 'vi' ? 'Lời cầu nguyện đã lưu' : 'Saved Prayers'}
                </h3>
                <button
                  onClick={() => setView('favorite_prayers')}
                  className="w-8 h-8 rounded-full bg-white/70 hover:bg-amber-50 border border-white flex items-center justify-center text-amber-700 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <i className="fa-solid fa-heart text-[10px]"></i>
                </button>
              </div>
              {favoritePrayers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {favoritePrayers.slice(0, 3).map((prayer) => (
                    <button
                      key={prayer.id}
                      onClick={() => handleGeneratePrayer(prayer.theme)}
                      className="px-3 py-2 bg-white/70 hover:bg-rose-50 border border-white rounded-full text-[10px] font-medium text-slate-700 transition-all hover:scale-105 active:scale-95 shadow-sm flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-heart text-[8px] text-rose-500"></i>
                      <span className="truncate max-w-[120px]">{prayer.theme}</span>
                    </button>
                  ))}
                  {favoritePrayers.length > 3 && (
                    <button
                      onClick={() => setView('favorite_prayers')}
                      className="px-3 py-2 bg-white/70 hover:bg-amber-50 border border-white rounded-full text-[10px] font-medium text-slate-700 transition-all hover:scale-105 active:scale-95 shadow-sm"
                    >
                      +{favoritePrayers.length - 3} {lang === 'vi' ? 'khác' : 'more'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 text-slate-400 text-[10px]">
                  {lang === 'vi' ? 'Chưa có mẫu yêu thích. Hãy lưu các lời cầu nguyện bạn thích!' : 'No favorites yet. Save prayers you love!'}
                </div>
              )}
            </section>
          </div>
        )}

        {view === 'prayer' && (
          <div className="flex flex-col h-[calc(100vh-160px)] animate-slideUp pb-12">
            <div className="mb-4 flex items-center justify-between px-2">
              <button onClick={() => setView('dashboard')} className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-slate-400 active:scale-90 transition-all border border-amber-900/5">
                <i className="fa-solid fa-chevron-left text-[9px]"></i>
              </button>
              <h2 className="text-[12px] font-black text-amber-950 font-serif-display uppercase tracking-widest truncate max-w-[180px]">
                {selectedTheme}
              </h2>
              {prayerData ? (
                <button 
                  onClick={() => {
                    const newFavoriteState = !isFavorite;
                    setIsFavorite(newFavoriteState);
                    // Immediately update favorites if prayer data exists
                    if (newFavoriteState && prayerData) {
                      const favoriteItem: PrayerHistoryItem = {
                        id: Date.now().toString(),
                        content: prayerData.personalOffering,
                        bibleVerse: prayerData.bibleVerse,
                        theme: selectedTheme,
                        timestamp: new Date().toISOString(),
                        isFavorite: true
                      };
                      setFavoritePrayers(prev => {
                        // Check if similar prayer already exists (by content)
                        const exists = prev.find(p => p.content === favoriteItem.content && p.theme === favoriteItem.theme);
                        if (!exists) {
                          return [favoriteItem, ...prev];
                        }
                        return prev;
                      });
                    }
                  }} 
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/30 border border-amber-900/5 ${isFavorite ? 'text-rose-500 scale-105 shadow-sm' : 'text-slate-300'}`}
                >
                  <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart text-sm`}></i>
                </button>
              ) : <div className="w-8"></div>}
            </div>
            
            <div className="glass rounded-[2.5rem] flex-grow flex flex-col relative overflow-hidden shadow-xl border-white divine-glow">
              {isGenerating ? (
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-6 relative flex items-center justify-center scale-75">
                    <div className="absolute w-20 h-20 border-[2px] border-transparent border-t-amber-600/60 rounded-full animate-spin-slow"></div>
                    <i className="fa-solid fa-cross text-amber-800 text-2xl relative z-10"></i>
                  </div>
                  <p className="text-amber-900/40 font-black tracking-widest text-[8px] uppercase">{t.generating}</p>
                </div>
              ) : prayerData && currentTradPrayer ? (
                <div className="flex flex-col h-full animate-fadeIn overflow-y-auto px-6 py-6 space-y-5">
                  <div className="text-center pb-2 border-b border-amber-900/5">
                    <div className="text-[9px] font-black text-amber-900/30 uppercase tracking-widest">{currentTradPrayer.name}</div>
                  </div>
                  <div className="bg-amber-50/40 p-4 rounded-[1.5rem] text-center border border-amber-900/5">
                    <p className="text-[12px] text-slate-900 font-prayer italic font-bold">"{prayerData.bibleVerse}"</p>
                  </div>
                  <div className="relative">
                    <div 
                      className={`bg-white/50 p-4 rounded-[1.5rem] border border-white/80 transition-all duration-300 overflow-hidden ${!isExpanded ? 'max-h-[100px]' : 'max-h-[1000px]'}`}
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      <p className="text-[12px] text-slate-800 font-prayer italic leading-relaxed whitespace-pre-wrap">
                        {isExpanded ? currentTradPrayer.full : currentTradPrayer.firstLine}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-amber-900/5 text-center">
                    <p className="text-[13px] text-amber-950 font-prayer italic font-bold leading-relaxed">{prayerData.personalOffering}</p>
                  </div>
                </div>
              ) : null}
            </div>

            {prayerData && (
              <div className="mt-4">
                <button disabled={prayerCountdown > 0} onClick={completePrayer} className={`w-full py-4 rounded-[1.8rem] font-bold shadow-lg active:scale-95 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all ${prayerCountdown > 0 ? 'bg-slate-100 text-slate-400' : 'lumina-gradient text-white'}`}>
                  {prayerCountdown > 0 ? (
                    <><i className="fa-solid fa-hourglass-start animate-spin"></i><span>{t.meditating}</span></>
                  ) : (
                    <><i className="fa-solid fa-check-circle"></i><span>{t.finish}</span></>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {view === 'tree' && (
          <FaithCross
            state={treeState}
            onToggleMission={toggleMissionStatus}
            onClaimMission={handleClaimMission}
            onOpenCaritas={() => {
              setSettingsExpanded(prev => ({ ...prev, caritas: true }));
              setView('settings');
            }}
          />
        )}
        
        {view === 'settings' && (
          <div className="space-y-6 animate-fadeIn pb-24">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('dashboard')}
                className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center"
              >
                <i className="fa-solid fa-arrow-left text-slate-400 text-[9px]"></i>
              </button>
              <h2 className="text-xl font-bold text-slate-900 font-serif-display">{t.settings}</h2>
            </div>

            {/* 1. Hồ sơ & Phòng trưng bày Hồng ân */}
            <section className="glass rounded-[2rem] border-white overflow-hidden">
              <button
                onClick={() =>
                  setSettingsExpanded(prev => ({ ...prev, profile: !prev.profile }))
                }
                className="w-full px-5 py-4 flex items-center justify-between bg-white/70 active:scale-[0.99] transition-all"
              >
                <div>
                  <h3 className="text-[10px] font-black text-amber-900/70 uppercase tracking-[0.22em]">
                    {lang === 'vi' ? 'Hồ sơ & Hồng ân' : 'Profile & graces'}
                  </h3>
                </div>
                <i
                  className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${
                    settingsExpanded.profile ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>
              {settingsExpanded.profile && (
                <div className="px-5 pb-4 pt-3 space-y-4 bg-white/40">
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full bg-slate-50 p-3.5 rounded-xl focus:outline-none text-[11px] font-bold text-slate-800"
                      value={profile.saintName}
                      onChange={e => setProfile({ ...profile, saintName: e.target.value })}
                      placeholder={t.saintName}
                    />
                    <input
                      type="text"
                      className="w-full bg-slate-50 p-3.5 rounded-xl focus:outline-none text-[11px] font-bold text-slate-800"
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      placeholder={t.name}
                    />
                  </div>
                  <div className="pt-3 border-t border-amber-900/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-amber-900/50 uppercase tracking-[0.2em]">
                        {lang === 'vi' ? 'Phòng trưng bày Hồng ân' : 'Grace gallery'}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {treeState.unlockedRewards.length} /{' '}
                        {Object.values(LEVEL_REWARDS_POOL).flat().length}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.values(LEVEL_REWARDS_POOL)
                        .flat()
                        .slice(0, 8)
                        .map(reward => {
                          const isUnlocked = treeState.unlockedRewards.includes(reward.id);
                          return (
                            <div
                              key={reward.id}
                              className={`glass p-2 rounded-xl flex flex-col items-center gap-1 border-white shadow-sm ${
                                isUnlocked ? 'bg-amber-50/70' : 'opacity-40 grayscale'
                              }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                                  isUnlocked ? 'lumina-gradient text-white' : 'bg-slate-100 text-slate-300'
                                }`}
                              >
                                <i className={`fa-solid ${reward.icon}`}></i>
                              </div>
                              <p className="text-[7px] font-bold text-center text-slate-700 leading-tight uppercase tracking-tighter truncate w-full">
                                {reward.name}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 2. Ngôn ngữ */}
            <section className="glass rounded-[2rem] border-white overflow-hidden">
              <button
                onClick={() =>
                  setSettingsExpanded(prev => ({ ...prev, language: !prev.language }))
                }
                className="w-full px-5 py-4 flex items-center justify-between bg-white/70 active:scale-[0.99] transition-all"
              >
                <div>
                  <h3 className="text-[10px] font-black text-amber-900/70 uppercase tracking-[0.22em]">
                    {lang === 'vi' ? 'Ngôn ngữ' : 'Language'}
                  </h3>
                </div>
                <i
                  className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${
                    settingsExpanded.language ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>
              {settingsExpanded.language && (
                <div className="px-5 pb-4 pt-3 bg-white/40 space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLang('vi')}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                        lang === 'vi'
                          ? 'lumina-gradient text-white border-transparent shadow-md'
                          : 'bg-white text-slate-700 border-amber-900/10'
                      }`}
                    >
                      Tiếng Việt
                    </button>
                    <button
                      onClick={() => setLang('en')}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                        lang === 'en'
                          ? 'lumina-gradient text-white border-transparent shadow-md'
                          : 'bg-white text-slate-700 border-amber-900/10'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* 3. Giao diện ngày / đêm (dựa trên theme có sẵn) */}
            <section className="glass rounded-[2rem] border-white overflow-hidden">
              <button
                onClick={() => setSettingsExpanded(prev => ({ ...prev, theme: !prev.theme }))}
                className="w-full px-5 py-4 flex items-center justify-between bg-white/70 active:scale-[0.99] transition-all"
              >
                <div>
                  <h3 className="text-[10px] font-black text-amber-900/70 uppercase tracking-[0.22em]">
                    {lang === 'vi' ? 'Giao diện Ngày / Đêm' : 'Day / Night theme'}
                  </h3>
                </div>
                <i
                  className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${
                    settingsExpanded.theme ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>
              {settingsExpanded.theme && (
                <div className="px-5 pb-4 pt-3 bg-white/40 space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAppTheme('amber')}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase border transition-all flex items-center justify-center gap-2 ${
                        appTheme === 'amber'
                          ? 'lumina-gradient text-white border-transparent shadow-md'
                          : 'bg-white text-slate-700 border-amber-900/10'
                      }`}
                    >
                      <i className="fa-solid fa-sun text-xs text-amber-400"></i>
                      {lang === 'vi' ? 'Ngày' : 'Day'}
                    </button>
                    <button
                      onClick={() => setAppTheme('slate')}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase border transition-all flex items-center justify-center gap-2 ${
                        appTheme === 'slate'
                          ? 'bg-slate-900 text-white border-slate-800 shadow-md'
                          : 'bg-white text-slate-700 border-amber-900/10'
                      }`}
                    >
                      <i className="fa-solid fa-moon text-xs text-slate-200"></i>
                      {lang === 'vi' ? 'Đêm' : 'Night'}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* 4. Ủng hộ quỹ Caritas giáo phận */}
            <section className="glass rounded-[2rem] border-white overflow-hidden">
              <button
                onClick={() => setSettingsExpanded(prev => ({ ...prev, caritas: !prev.caritas }))}
                className="w-full px-5 py-4 flex items-center justify-between bg-white/70 active:scale-[0.99] transition-all"
              >
                <div>
                  <h3 className="text-[10px] font-black text-amber-900/70 uppercase tracking-[0.22em]">
                    {lang === 'vi' ? 'Ủng hộ quỹ Caritas giáo phận' : 'Support Caritas Diocese Fund'}
                  </h3>
                </div>
                <i
                  className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${
                    settingsExpanded.caritas ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>
              {settingsExpanded.caritas && (
                <div className="px-5 pb-4 pt-3 bg-white/40 space-y-3 text-[10px] text-slate-600">
                  <p className="font-semibold">
                    {lang === 'vi' ? 'Thông tin chuyển khoản / QR:' : 'Bank / QR information:'}
                  </p>
                  <div className="bg-slate-50 border border-dashed border-amber-900/20 rounded-xl p-3 text-[10px] text-slate-500">
                    {lang === 'vi'
                      ? 'Bạn có thể điền thông tin chuyển khoản ủng hộ quỹ Caritas giáo phận tại đây.'
                      : 'You can place bank transfer or QR information to support Caritas Diocese Fund here.'}
                  </div>
                </div>
              )}
            </section>

            {/* 5. Ủng hộ tác giả */}
            <section className="glass rounded-[2rem] border-white overflow-hidden">
              <button
                onClick={() => setSettingsExpanded(prev => ({ ...prev, donate: !prev.donate }))}
                className="w-full px-5 py-4 flex items-center justify-between bg-white/70 active:scale-[0.99] transition-all"
              >
                <div>
                  <h3 className="text-[10px] font-black text-amber-900/70 uppercase tracking-[0.22em]">
                    {lang === 'vi' ? 'Ủng hộ tác giả' : 'Support the creator'}
                  </h3>
                </div>
                <i
                  className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${
                    settingsExpanded.donate ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>
              {settingsExpanded.donate && (
                <div className="px-5 pb-4 pt-3 bg-white/40 space-y-3 text-[10px] text-slate-600">
                  <p className="font-semibold italic text-slate-500">
                    {lang === 'vi'
                      ? 'Một người con Công giáo nhỏ nhoi đang cố gắng duy trì app này. Nếu thấy hữu ích, bạn có thể góp một chút chi phí cà phê để app tiếp tục phục vụ cộng đoàn nhé.'
                      : 'A small Catholic developer is trying to keep this app running. If it blesses you, you can add a little “coffee fund” to help cover the costs.'}
                  </p>
                  <div className="bg-slate-50 border border-dashed border-amber-900/20 rounded-xl p-3 text-[10px] text-slate-500">
                    {lang === 'vi'
                      ? 'Bạn có thể điền thông tin Momo, VietQR hoặc tài khoản ngân hàng của bạn tại đây.'
                      : 'You can place your Momo, QR or bank account information here.'}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-5 animate-fadeIn pb-24">
            <button onClick={() => setView('dashboard')} className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-chevron-left"></i> {t.back}</button>
            <h2 className="text-xl font-bold text-slate-900 font-serif-display">{t.journeyLabel}</h2>
            <div className="space-y-3">
              {history.map(item => (
                <div key={item.id} className="glass p-4 rounded-[1.5rem] border-white shadow-sm">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[8px] font-black text-amber-800 uppercase tracking-widest">{item.theme}</span>
                    <span className="text-[7px] text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 italic font-medium leading-relaxed">"{item.content}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'catechism_study' && (
          <div className="flex flex-col animate-fadeIn h-full pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sticky top-0 z-10 bg-gradient-to-b from-white/95 to-transparent pb-2 pt-1">
              <button 
                onClick={() => setView('dashboard')} 
                className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-amber-700 transition-colors"
              >
                <i className="fa-solid fa-chevron-left"></i> {t.back}
              </button>
              <h2 className="text-lg font-bold text-slate-900 font-serif-display">{t.chatHeading}</h2>
              <div className="w-16"></div> {/* Spacer for centering */}
            </div>
            
            {/* Chat Container with Scroll */}
            <div 
              ref={chatContainerRef}
              className="flex-grow overflow-y-auto space-y-4 mb-4 px-1 scroll-smooth"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              {isLoadingGospel && catechismResponse.length === 0 ? (
                <div className="flex justify-center items-center h-full py-12">
                  <LoadingSpinner size="md" text={lang === 'vi' ? 'Đang tải Tin Mừng...' : 'Loading Gospel...'} />
                </div>
              ) : catechismResponse.length === 0 && dailyGospel && dailyGospel.verse && dailyGospel.analysis ? (
                <>
                  {/* Welcome Card with Daily Gospel */}
                  <div className="animate-slideUp">
                    <section className="glass border-white rounded-[1.5rem] p-5 shadow-lg divine-glow space-y-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-full lumina-gradient flex items-center justify-center shadow-md">
                          <i className="fa-solid fa-book-bible text-white text-[12px]"></i>
                        </div>
                        <div>
                          <h3 className="text-[10px] font-black text-amber-900/80 uppercase tracking-widest">
                            {lang === 'vi' ? 'Lịch Phụng Vụ Hôm Nay' : 'Today\'s Liturgical Calendar'}
                          </h3>
                          <p className="text-[8px] text-slate-500">{dailyGospel.reference}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-amber-50/80 to-white/60 rounded-xl p-4 border border-amber-100">
                        <p className="text-[13px] text-slate-800 font-prayer italic font-bold leading-relaxed">
                          "{dailyGospel.verse}"
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50/80 to-white/60 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="fa-solid fa-lightbulb text-blue-600 text-[10px]"></i>
                          <p className="text-[9px] font-black text-blue-900/70 uppercase tracking-wider">
                            {lang === 'vi' ? 'Suy Niệm' : 'Reflection'}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          {dailyGospel.analysis}
                        </p>
                      </div>
                    </section>

                    {/* Welcome Message */}
                    <div className="glass border-white rounded-[1.5rem] p-5 shadow-md space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                          <i className="fa-solid fa-hands-praying text-white text-[14px]"></i>
                        </div>
                        <div>
                          <h3 className="text-[12px] font-bold text-slate-900">
                            {lang === 'vi' ? 'Chào bạn! 👋' : 'Hello! 👋'}
                          </h3>
                          <p className="text-[10px] text-slate-600">
                            {lang === 'vi' 
                              ? 'Mình là bạn đồng hành đức tin của bạn. Hãy hỏi mình bất cứ điều gì về đức tin nhé!'
                              : 'I\'m your faith companion. Ask me anything about faith!'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Quick Questions */}
                      <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                          {lang === 'vi' ? 'Câu hỏi gợi ý:' : 'Suggested questions:'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {quickQuestions.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleStudyCatechism(q)}
                              className="px-3 py-1.5 bg-white/60 hover:bg-amber-50 border border-slate-200 rounded-full text-[10px] font-medium text-slate-700 transition-all hover:scale-105 active:scale-95"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Chat Messages */}
                  <div className="space-y-4 w-full">
                    {catechismResponse.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full items-start gap-2 animate-fadeIn`}
                        style={{ 
                          animationDelay: `${i * 0.1}s`,
                          flexShrink: 0 
                        }}
                      >
                        {/* Avatar for AI */}
                        {msg.role === 'model' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md">
                            <i className="fa-solid fa-hands-praying text-white text-[10px]"></i>
                          </div>
                        )}
                        
                        <div 
                          className={`px-4 py-3 rounded-[1.2rem] text-[12px] font-medium leading-relaxed shadow-sm transition-all hover:shadow-md ${
                            msg.role === 'user' 
                              ? 'lumina-gradient text-white rounded-br-none max-w-[85%]' 
                              : 'glass border-white text-slate-800 rounded-bl-none max-w-[85%]'
                          }`}
                          style={{
                            minWidth: '0',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            overflow: 'visible',
                            display: 'block',
                            width: 'auto',
                            height: 'auto',
                            maxHeight: 'none',
                            flexShrink: 0,
                            minHeight: 'auto'
                          }}
                        >
                          <span style={{ 
                            display: 'block', 
                            wordBreak: 'break-word', 
                            overflowWrap: 'break-word', 
                            whiteSpace: 'pre-wrap',
                            overflow: 'visible',
                            maxHeight: 'none',
                            height: 'auto'
                          }}>{msg.text}</span>
                          <span className={`text-[8px] mt-1.5 block opacity-60 ${msg.role === 'user' ? 'text-white/70' : 'text-slate-500'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>

                        {/* Avatar for User */}
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                            <i className="fa-solid fa-user text-white text-[10px]"></i>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Thinking indicator when AI is processing */}
                    {isStudying && (
                      <div className="flex justify-start w-full items-start gap-2 animate-fadeIn">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md">
                          <i className="fa-solid fa-hands-praying text-white text-[10px]"></i>
                        </div>
                        <div className="max-w-[85%] px-4 py-3 rounded-[1.2rem] glass border-white text-slate-800 rounded-bl-none flex items-center gap-2 shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                          </div>
                          <span className="text-[11px] font-medium text-slate-600 italic">
                            {lang === 'vi' ? 'Đang suy nghĩ...' : 'Thinking...'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={chatEndRef} />
                </>
              )}
            </div>
            
            {/* Input Field - Fixed at bottom */}
            <div className="glass p-2 rounded-full border-white shadow-xl flex gap-2 sticky bottom-0 z-10 backdrop-blur-sm bg-white/90">
              <input 
                type="text" 
                value={catechismQuery} 
                onChange={e => setCatechismQuery(e.target.value)} 
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && !isStudying) {
                    e.preventDefault();
                    handleStudyCatechism();
                  }
                }}
                disabled={isStudying}
                className="flex-grow bg-transparent px-4 py-2.5 text-[12px] focus:outline-none font-medium placeholder:text-slate-400 disabled:opacity-50" 
                placeholder={lang === 'vi' ? "Hỏi về đức tin, cầu nguyện, hoặc bất cứ điều gì..." : "Ask about faith, prayer, or anything..."}
              />
              <button 
                onClick={handleStudyCatechism} 
                disabled={isStudying || !catechismQuery.trim()}
                className="w-10 h-10 lumina-gradient text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isStudying ? (
                  <i className="fa-solid fa-circle-notch animate-spin text-[12px]"></i>
                ) : (
                  <i className="fa-solid fa-paper-plane text-[12px]"></i>
                )}
              </button>
            </div>
          </div>
        )}

        {view === 'parish_search' && (
          <div className="space-y-5 animate-fadeIn pb-24">
            <button
              onClick={() => setView('dashboard')}
              className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"
            >
              <i className="fa-solid fa-chevron-left"></i> {t.back}
            </button>
            
            {/* Tab Switcher */}
            <div className="flex bg-white/50 p-1 rounded-xl border border-white/40 glass">
              <button
                onClick={() => setParishTab('search')}
                className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  parishTab === 'search'
                    ? 'lumina-gradient text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <i className="fa-solid fa-magnifying-glass mr-1.5"></i>
                {lang === 'vi' ? 'Tìm kiếm' : 'Search'}
              </button>
              <button
                onClick={() => setParishTab('favorites')}
                className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  parishTab === 'favorites'
                    ? 'lumina-gradient text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <i className="fa-solid fa-heart mr-1.5"></i>
                {lang === 'vi' ? 'Yêu thích' : 'Favorites'}
              </button>
            </div>

            {parishTab === 'search' ? (
              <>
                <h2 className="text-xl font-bold text-slate-900 font-serif-display">
                  {lang === 'vi' ? 'Nhà thờ gần đây' : 'Nearby Churches'}
                </h2>

            <form onSubmit={handleParishSearchSubmit} className="glass p-3 rounded-2xl border-white space-y-2">
              <label className="text-[9px] font-black text-amber-900/40 uppercase tracking-widest px-1">
                {lang === 'vi'
                  ? 'Tìm theo địa chỉ (quận/huyện, thành phố)'
                  : 'Search by address (city, district)'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={parishQuery}
                  onChange={e => setParishQuery(e.target.value)}
                  className="flex-grow bg-white/70 border border-white rounded-xl px-3 py-2 text-[11px] text-slate-700 focus:outline-none"
                  placeholder={
                    lang === 'vi' ? 'Ví dụ: Quận 1, TP.HCM' : 'e.g. District 1, Ho Chi Minh City'
                  }
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-xl lumina-gradient text-white flex items-center justify-center shadow-md active:scale-95"
                >
                  <i className="fa-solid fa-magnifying-glass text-[10px]"></i>
                </button>
              </div>
              <p className="text-[9px] text-slate-400 px-1">
                {lang === 'vi'
                  ? 'Mặc định ứng dụng sẽ cố gắng dùng vị trí hiện tại (nếu được cho phép).'
                  : 'By default the app tries to use your current location (if permitted).'}
              </p>
            </form>

            {isSearchingParish && (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" text={lang === 'vi' ? 'Đang tìm Nhà thờ...' : 'Searching churches...'} />
              </div>
            )}

            {parishError && (
              <ErrorMessage
                error={parishError}
                onRetry={() => {
                  if (parishQuery.trim()) {
                    performParishSearch(parishQuery);
                  }
                }}
              />
            )}

            {parishSearchResult && parishSearchResult.parishes.length > 0 && (
              <div className="space-y-3">
                {parishSearchResult.parishes.slice(0, 5).map((parish, index) => {
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${parish.name} ${parish.address}`
                  )}`;
                  return (
                    <div
                      key={`${parish.name}-${index}`}
                      className="glass p-4 rounded-[1.5rem] border-white shadow-sm space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-grow">
                          <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                            <span className="inline-flex w-6 h-6 rounded-full bg-amber-100 text-amber-700 items-center justify-center text-[10px] font-bold shrink-0">
                              {index + 1}
                            </span>
                            <span className="flex-grow">{parish.name}</span>
                          </h3>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-amber-700 underline break-words hover:text-amber-800 transition-colors"
                          >
                            <i className="fa-solid fa-location-dot text-[8px] mr-1"></i>
                            {parish.address}
                          </a>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => toggleFavoriteParish(parish)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all ${
                              isParishFavorite(parish.name)
                                ? 'bg-rose-100 text-rose-600'
                                : 'bg-white/50 text-slate-400 hover:bg-rose-50 hover:text-rose-500'
                            }`}
                            title={isParishFavorite(parish.name) ? (lang === 'vi' ? 'Bỏ yêu thích' : 'Remove favorite') : (lang === 'vi' ? 'Yêu thích' : 'Add to favorites')}
                          >
                            <i className={`fa-${isParishFavorite(parish.name) ? 'solid' : 'regular'} fa-heart text-[12px]`}></i>
                          </button>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shadow-sm active:scale-90 hover:bg-amber-200 transition-colors"
                            title={lang === 'vi' ? 'Mở Google Maps' : 'Open in Google Maps'}
                          >
                            <i className="fa-solid fa-location-dot text-[12px]"></i>
                          </a>
                        </div>
                      </div>
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
                                      onClick={() => createAppointmentFromMass(parish, time, ms.day)}
                                      className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-[9px] font-semibold hover:bg-amber-200 active:scale-95 transition-all flex items-center gap-1 group"
                                      title={lang === 'vi' ? `Đặt lịch lễ ${time}` : `Schedule mass at ${time}`}
                                    >
                                      <span>{time}</span>
                                      <i className="fa-solid fa-plus text-[7px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="mt-2 text-[8px] text-slate-400 italic">
                            {lang === 'vi'
                              ? 'Lịch lễ được AI gợi ý dựa trên các nguồn công khai, ưu tiên website chính thức của giáo phận/giáo xứ (ví dụ: trang Tổng Giáo Phận, trang giáo hạt/chính tòa...) và có thể thay đổi. Vui lòng luôn kiểm tra lại trên kênh chính thức của giáo xứ.'
                              : 'Mass times are AI-suggested from public data, prioritising official diocesan/parish websites (e.g. archdiocesan and deanery/parish pages) and may change. Please always confirm with official parish channels.'}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {parishSearchResult.sources && parishSearchResult.sources.length > 0 && (
                  <div className="mt-3 px-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1">
                      {lang === 'vi' ? 'Nguồn tham khảo lịch lễ' : 'Mass schedule sources'}
                    </p>
                    <ul className="space-y-0.5">
                      {parishSearchResult.sources.slice(0, 4).map((src, idx) => (
                        <li key={idx} className="text-[8px] text-slate-400">
                          <span className="font-semibold">{src.title}</span>{' '}
                          <a
                            href={src.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-amber-700 hover:text-amber-800 break-all"
                          >
                            {src.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {parishSearchResult && parishSearchResult.parishes.length === 0 && !isSearchingParish && !parishError && (
              <div className="text-center py-10 opacity-60">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {lang === 'vi' ? 'Chưa tìm thấy Nhà thờ phù hợp' : 'No churches found yet'}
                </p>
              </div>
            )}
              </>
            ) : (
              <FavoriteParishesView
                favoriteParishes={favoriteParishes}
                lang={lang}
                setView={setView}
                onRemoveFavorite={removeFavoriteParish}
                onAddCheckInPhoto={addCheckInPhoto}
                onRemoveCheckInPhoto={removeCheckInPhoto}
                onCreateAppointment={createAppointmentFromFavoriteParish}
              />
            )}
          </div>
        )}

        {view === 'appointments' && (
          <div className="space-y-5 animate-fadeIn pb-24">
            <div className="flex items-center justify-between">
              <button onClick={() => setView('dashboard')} className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-chevron-left"></i> {t.back}</button>
              <button 
                onClick={startNewAppointment} 
                className="w-8 h-8 rounded-full lumina-gradient text-white flex items-center justify-center shadow-lg active:scale-90"
                disabled={editingAppointment !== null}
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-serif-display">{t.appointments}</h2>
            
            {/* Appointment Form */}
            {editingAppointment && (
              <div className="glass p-5 rounded-[2rem] border-white shadow-xl space-y-4 animate-slideUp">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[13px] font-bold text-amber-950 uppercase tracking-wider">
                    {editingAppointment.id && appointments.find(a => a.id === editingAppointment.id) 
                      ? t.editAppointment 
                      : t.addAppointment}
                  </h3>
                  <button
                    onClick={() => setEditingAppointment(null)}
                    className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center active:scale-90"
                  >
                    <i className="fa-solid fa-times text-[9px]"></i>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-amber-900/60 uppercase tracking-wider block mb-1.5">
                      {t.appointmentTitle}
                    </label>
                    <input
                      type="text"
                      value={editingAppointment.title}
                      onChange={(e) => setEditingAppointment({ ...editingAppointment, title: e.target.value })}
                      className="w-full bg-white/70 border border-amber-900/10 rounded-xl px-3 py-2.5 text-[12px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      placeholder={t.types[editingAppointment.type]}
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-amber-900/60 uppercase tracking-wider block mb-1.5">
                      {t.appointmentType}
                    </label>
                    <select
                      value={editingAppointment.type}
                      onChange={(e) => setEditingAppointment({ ...editingAppointment, type: e.target.value as Appointment['type'] })}
                      className="w-full bg-white/70 border border-amber-900/10 rounded-xl px-3 py-2.5 text-[12px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      {(['prayer', 'mass', 'confession', 'direction', 'church'] as Appointment['type'][]).map(type => (
                        <option key={type} value={type}>{t.types[type]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-amber-900/60 uppercase tracking-wider block mb-1.5">
                      {t.appointmentTime}
                    </label>
                    <input
                      type="time"
                      value={editingAppointment.time}
                      onChange={(e) => setEditingAppointment({ ...editingAppointment, time: e.target.value })}
                      className="w-full bg-white/70 border border-amber-900/10 rounded-xl px-3 py-2.5 text-[12px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-amber-900/60 uppercase tracking-wider block mb-1.5">
                      {t.appointmentDays}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 4, 5, 6].map(day => {
                        const dayLabels = lang === 'vi' ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        const isSelected = editingAppointment.days.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const newDays = isSelected
                                ? editingAppointment.days.filter(d => d !== day)
                                : [...editingAppointment.days, day].sort();
                              setEditingAppointment({ ...editingAppointment, days: newDays });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                              isSelected
                                ? 'lumina-gradient text-white shadow-md'
                                : 'bg-white/50 text-slate-600 border border-amber-900/10'
                            }`}
                          >
                            {dayLabels[day]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-amber-900/60 uppercase tracking-wider block mb-1.5">
                      {lang === 'vi' ? 'Địa điểm (tùy chọn)' : 'Location (optional)'}
                    </label>
                    <input
                      type="text"
                      value={editingAppointment.location || ''}
                      onChange={(e) => setEditingAppointment({ ...editingAppointment, location: e.target.value })}
                      className="w-full bg-white/70 border border-amber-900/10 rounded-xl px-3 py-2.5 text-[12px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      placeholder={lang === 'vi' ? 'Ví dụ: Nhà thờ Đức Bà' : 'e.g. Notre Dame Cathedral'}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setEditingAppointment(null)}
                    className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider active:scale-95"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={() => saveAppointment(editingAppointment)}
                    className="flex-1 lumina-gradient text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md active:scale-95"
                  >
                    {t.saveAppointment}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {appointments.length > 0 ? appointments.map(app => {
                const dayLabels = lang === 'vi' ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayNames = lang === 'vi' 
                  ? ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
                  : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const selectedDays = app.days.map(d => dayNames[d]).join(', ');
                const mapsUrl = app.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(app.location)}` : null;
                
                return (
                  <div
                    key={app.id}
                    className="glass p-4 rounded-[1.5rem] border-white shadow-sm space-y-2 group"
                  >
                    <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3">
                      <div
                        className="col-span-2 flex items-start gap-3 cursor-pointer"
                        onClick={() => {
                          if (app.type === 'prayer') {
                            handleGeneratePrayer(app.title || t.types[app.type]);
                          } else {
                            setEditingAppointment(app);
                          }
                        }}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0 ${
                            app.active ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <i
                            className={`fa-solid ${
                              app.type === 'mass'
                                ? 'fa-church'
                                : app.type === 'confession'
                                ? 'fa-hands-asl-interpreting'
                                : app.type === 'direction'
                                ? 'fa-compass'
                                : app.type === 'church'
                                ? 'fa-church'
                                : 'fa-bell'
                            } text-base`}
                          ></i>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p
                            className={`text-[13px] font-bold mb-1 ${
                              app.active ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {app.title || t.types[app.type]}
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <i className="fa-solid fa-clock text-[9px] text-amber-600"></i>
                              <span
                                className={`text-[11px] font-semibold ${
                                  app.active ? 'text-slate-700' : 'text-slate-400'
                                }`}
                              >
                                {app.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <i className="fa-solid fa-calendar-week text-[9px] text-amber-600"></i>
                              <span
                                className={`text-[10px] ${
                                  app.active ? 'text-slate-600' : 'text-slate-400'
                                }`}
                              >
                                {selectedDays}
                              </span>
                            </div>
                            {app.location && (
                              <div className="flex items-start gap-2">
                                <i className="fa-solid fa-location-dot text-[9px] text-amber-600 mt-[1px]"></i>
                                {mapsUrl ? (
                                  <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[10px] text-amber-700 underline truncate hover:text-amber-800 leading-snug"
                                  >
                                    {app.location}
                                  </a>
                                ) : (
                                  <span
                                    className={`text-[10px] ${
                                      app.active ? 'text-slate-600' : 'text-slate-400'
                                    } truncate leading-snug`}
                                  >
                                    {app.location}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAppointmentActive(app.id);
                        }}
                        className={`w-8 h-5 rounded-full relative transition-colors shrink-0 ${
                          app.active ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                            app.active ? 'left-3.5' : 'left-0.5'
                          }`}
                        ></div>
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-12 opacity-20">
                  <p className="text-[9px] font-black uppercase tracking-widest">{t.noAppointments}</p>
                  <p className="text-[8px] text-slate-400 mt-2">
                    {lang === 'vi' ? 'Nhấn nút + để thêm lịch nhắc' : 'Press + to add a reminder'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}


        {view === 'favorite_prayers' && (
          <FavoritePrayersView
            favoritePrayers={favoritePrayers}
            lang={lang}
            setView={setView}
            onRemoveFavorite={(id) => {
              setFavoritePrayers(prev => prev.filter(p => p.id !== id));
              // Also update history
              setHistory(prev => prev.map(item => 
                item.id === id ? { ...item, isFavorite: false } : item
              ));
            }}
            onUseFavorite={(prayer) => {
              handleGeneratePrayer(prayer.theme);
            }}
          />
        )}

        {view === 'liturgical_prayers' && (
          <LiturgicalPrayersView
            liturgicalPrayer={liturgicalPrayer}
            isLoading={isLoadingLiturgical}
            error={liturgicalError}
            lang={lang}
            setView={setView}
            onRefresh={loadLiturgicalPrayers}
          />
        )}
      </main>

      {/* Navigation - More compact */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-5 pt-1 pointer-events-none">
        <div className="max-w-md mx-auto h-14 glass rounded-[1.8rem] shadow-xl border-white/60 flex justify-around items-center px-2 pointer-events-auto">
          {[
            { icon: 'fa-house-chimney', view: 'dashboard' as AppView },
            { icon: 'fa-calendar-days', view: 'appointments' as AppView },
            { icon: 'fa-book-open-reader', view: 'catechism_study' as AppView },
            { icon: 'fa-award', view: 'tree' as AppView },
            { icon: 'fa-sliders', view: 'settings' as AppView }
          ].map(item => (
            <button key={item.view} onClick={() => setView(item.view)} className={`relative flex flex-col items-center justify-center w-10 h-10 transition-all ${view === item.view ? 'text-amber-800 scale-110' : 'text-slate-400 opacity-60'}`}>
              <i className={`fa-solid ${item.icon} text-lg`}></i>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
