
export enum PrayerTheme {
  DAILY = 'Hàng ngày',
  TRAVEL = 'Trước khi đi xe',
  EXAM = 'Trước khi đi thi',
  SLEEP = 'Trước khi đi ngủ',
  POPE = 'Ý cầu nguyện của Đức Giáo Hoàng',
  THANKS = 'Cảm ơn',
  GRACE = 'Xin ơn',
  FORGIVENESS = 'Tha thứ',
  FAMILY = 'Cầu cho người thân',
  WORLD = 'Cầu cho thế giới',
  DIFFICULTY = 'Khi gặp khó khăn',
  CUSTOM = 'Chủ đề tự chọn'
}

export type Language = 'vi' | 'en';

export type AppThemeColor = 'emerald' | 'amber' | 'blue' | 'rose' | 'slate' | 'gold' | 'purple' | 'crimson';

export interface UserProfile {
  name: string;
  saintName: string;
  birthYear: string;
  selectedAura?: string;
  selectedBadge?: string;
}

export interface Appointment {
  id: string;
  time: string;
  title: string;
  type: 'prayer' | 'mass' | 'confession' | 'direction' | 'church';
  days: number[]; // 0-6 for Sunday-Saturday
  active: boolean;
  location?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  expReward: number; // Keep for backward compatibility
  graceReward: number; // Ơn Chúa thưởng
  isCompleted: boolean;
  isClaimed: boolean;
  icon: string;
}

export interface FaithTreeState {
  level: number;
  experience: number; // Keep for backward compatibility
  grace: number; // Ơn Chúa
  totalPrayers: number;
  lastWatered: string | null;
  missions: Mission[];
  lastMissionReset: string | null; // ISO Date for daily reset
  lastWeeklyReset: string | null; // ISO Date for weekly reset
  unlockedRewards: string[]; // IDs of unlocked rewards
}

export interface RewardChoice {
  id: string;
  type: 'theme' | 'icon' | 'intention' | 'aura';
  name: string;
  description: string;
  value: string; // The color key, icon class, intention string, or aura class
  icon: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface PrayerHistoryItem {
  id: string;
  content: string;
  bibleVerse: string;
  theme: string;
  timestamp: string;
  isFavorite: boolean;
  journalNotes?: string;
}

export type AppView = 'dashboard' | 'prayer' | 'tree' | 'settings' | 'appointments' | 'profile' | 'favorites' | 'history' | 'parish_search' | 'theme_selection' | 'catechism_study' | 'missions' | 'reward_selection' | 'favorite_parishes' | 'favorite_prayers' | 'liturgical_prayers';

export interface DailyGospelReflection {
  verse: string;
  reference: string;
  analysis: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ParishData {
  name: string;
  address: string;
  massSchedules: {
    day: string;
    times: string[];
  }[];
}

export interface ParishSearchResponse {
  parishes: ParishData[];
  sources: GroundingSource[];
}

export type FollowItemType = 'intention' | 'theme' | 'prayer' | 'devotional' | 'saint';

export interface FollowedItem {
  id: string;
  type: FollowItemType;
  title: string;
  description?: string;
  icon?: string;
  followedAt: string; // ISO timestamp
  lastUsed?: string; // ISO timestamp
  useCount?: number;
  metadata?: Record<string, any>;
}

export interface FollowState {
  followedItems: FollowedItem[];
  lastSync?: string;
}

export interface FavoriteParish {
  name: string;
  address: string;
  addedAt: string; // ISO timestamp
  massSchedules?: {
    day: string;
    times: string[];
  }[];
  checkInPhotos?: CheckInPhoto[];
  notes?: string;
}

export interface CheckInPhoto {
  id: string;
  imageData: string; // Base64 encoded image
  timestamp: string; // ISO timestamp
  note?: string;
}

export type PrayerHour = 'readings' | 'morning' | 'midday' | 'evening' | 'night'; // Kinh Sách, Sáng, Trưa, Chiều, Tối

export interface Psalm {
  number: string; // e.g., "Ps 94 (95)"
  antiphon: string; // Điệp ca
  verses: string[];
  glory?: string; // Vinh danh Chúa Cha...
}

export interface LiturgicalReading {
  title?: string;
  reference: string; // Bible reference
  content: string;
}

export interface PrayerHourContent {
  hour: PrayerHour;
  title: string; // e.g., "Kinh Sáng", "Kinh Chiều"
  opening: string; // Lời mở đầu / Giáo đầu
  psalms: Psalm[]; // Thánh vịnh (kèm điệp ca)
  shortReading?: LiturgicalReading; // Bài đọc ngắn
  responsory?: string; // Đáp ca / Xướng đáp
  gospelCanticle?: {
    title: string; // e.g., "Bài ca của Zechariah" (Benedictus), "Bài ca của Đức Maria" (Magnificat), "Bài ca của Simeon" (Nunc Dimittis)
    antiphon: string; // Điệp ca
    content: string; // Nội dung đầy đủ
  };
  intercessions?: {
    title: string;
    prayers: string[];
  };
  concludingPrayer: string; // Lời nguyện kết thúc
  hymn?: string; // Thánh thi (nếu có)
  dismissal?: string; // Kết thúc (nếu có)
  marianAnthem?: string; // Ca vãn kính Đức Mẹ (cho Kinh Tối)
}

export interface LiturgicalPrayer {
  day: string; // Date string
  liturgicalDate: string; // e.g., "Chúa Nhật II Mùa Vọng"
  saint?: string; // Saint of the day if applicable
  color?: string; // Liturgical color (white, red, green, purple, etc.)
  hours: PrayerHourContent[]; // Tất cả các giờ kinh trong ngày
}
