export interface UserStats {
  totalQuestionsSolved: number;
  totalBattlesWon: number;
  totalMockTests: number;
}

export interface FavoriteItems {
  avatars?: string[];
  rings?: string[];
  backgrounds?: string[];
  frames?: string[];
  titles?: string[];
  themes?: string[];
  emotes?: string[];
  stickers?: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'student' | 'admin' | 'recruiter' | 'mentor';
  college: string;
  department: string;
  year: number;
  dreamCompany: string;
  skills: string[];
  bio: string;
  xp: number;
  coins: number;
  level: number;
  battleRating: number;
  dailyStreak: number;
  lastActiveDate: any; // Firebase Timestamp or ISO String
  placementReadinessScore: number;
  stats: UserStats;
  unlockedAchievements: string[];
  longestStreak?: number;
  lastLoginRewardClaimedDate?: string;
  loginStreakCount?: number;
  missionsState?: any;
  unlockedFrames?: string[];
  unlockedThemes?: string[];
  lastSpinDate?: string;
  mysteryBoxes?: number;
  createdAt: any;

  // Cosmetics System
  equippedAvatar?: string | null;
  equippedRing?: string | null;
  equippedFrame?: string | null;
  equippedBackground?: string | null;
  equippedTitle?: string | null;
  equippedTheme?: string | null;
  unlockedAvatars?: string[];
  unlockedRings?: string[];
  unlockedBackgrounds?: string[];
  unlockedTitles?: string[];
  unlockedEmotes?: string[];
  unlockedStickers?: string[];
  favoriteCosmetics?: string[];
  recentlyUsedCosmetics?: string[];
  favoriteItems?: FavoriteItems;
}
