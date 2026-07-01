/**
 * Dynamic XP Requirement calculation for each level.
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 100;
  let total = 100;
  for (let i = 2; i <= level; i++) {
    total += 50 + 100 * (i - 1);
  }
  return total;
}

/**
 * Calculates current level based on total accumulated XP.
 */
export function calculateLevelFromXp(xp: number): { level: number; xpProgress: number; xpRequired: number } {
  let level = 1;
  while (true) {
    const requiredForNext = getXpRequiredForLevel(level);
    if (xp < requiredForNext) {
      break;
    }
    level++;
  }
  
  const currentLevelBaseXp = level === 1 ? 0 : getXpRequiredForLevel(level - 1);
  const nextLevelRequiredXp = getXpRequiredForLevel(level);
  
  const xpProgress = xp - currentLevelBaseXp;
  const xpRequired = nextLevelRequiredXp - currentLevelBaseXp;

  return {
    level,
    xpProgress,
    xpRequired
  };
}

export interface Mission {
  id: string;
  title: string;
  actionKey: 'questions_solved' | 'quiz_completed' | 'coding_completed' | 'hr_completed' | 'battle_won' | 'xp_earned';
  target: number;
  current: number;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  claimed: boolean;
}

export interface MissionsState {
  lastUpdatedDate: string;
  lastUpdatedWeek: string;
  lastUpdatedMonth: string;
  dailyMissions: Mission[];
  weeklyMissions: Mission[];
  monthlyMissions: Mission[];
}

/**
 * Helper to calculate ISO Week String (e.g. 2026-W27)
 */
export function getIsoWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

/**
 * Generates fresh lists of daily, weekly, and monthly missions if timezone date checks roll over.
 */
export function syncMissionsState(existingState: any, dateNow: Date): MissionsState {
  const tzOffset = 5.5 * 60 * 60 * 1000; // IST Timezone (UTC+5:30)
  const localDate = new Date(dateNow.getTime() + tzOffset);
  
  const todayStr = localDate.toISOString().split('T')[0];
  const weekStr = getIsoWeekString(localDate);
  const monthStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}`;

  const state: MissionsState = {
    lastUpdatedDate: existingState?.lastUpdatedDate || '',
    lastUpdatedWeek: existingState?.lastUpdatedWeek || '',
    lastUpdatedMonth: existingState?.lastUpdatedMonth || '',
    dailyMissions: existingState?.dailyMissions || [],
    weeklyMissions: existingState?.weeklyMissions || [],
    monthlyMissions: existingState?.monthlyMissions || []
  };

  // 1. Refresh Daily Missions
  if (state.lastUpdatedDate !== todayStr) {
    state.dailyMissions = [
      {
        id: 'daily_questions',
        title: 'Solve 10 Questions',
        actionKey: 'questions_solved',
        target: 10,
        current: 0,
        xpReward: 100,
        coinReward: 20,
        completed: false,
        claimed: false
      },
      {
        id: 'daily_quiz',
        title: 'Finish One Subject Quiz',
        actionKey: 'quiz_completed',
        target: 1,
        current: 0,
        xpReward: 80,
        coinReward: 15,
        completed: false,
        claimed: false
      },
      {
        id: 'daily_coding',
        title: 'Submit Algorithmic Code Solution',
        actionKey: 'coding_completed',
        target: 1,
        current: 0,
        xpReward: 150,
        coinReward: 30,
        completed: false,
        claimed: false
      }
    ];
    state.lastUpdatedDate = todayStr;
  }

  // 2. Refresh Weekly Missions
  if (state.lastUpdatedWeek !== weekStr) {
    state.weeklyMissions = [
      {
        id: 'weekly_questions',
        title: 'Solve 100 Practice Questions',
        actionKey: 'questions_solved',
        target: 100,
        current: 0,
        xpReward: 500,
        coinReward: 100,
        completed: false,
        claimed: false
      },
      {
        id: 'weekly_coding',
        title: 'Submit 5 Coding Compiler Executions',
        actionKey: 'coding_completed',
        target: 5,
        current: 0,
        xpReward: 600,
        coinReward: 150,
        completed: false,
        claimed: false
      },
      {
        id: 'weekly_battles',
        title: 'Win 5 Live PvP Arena Battles',
        actionKey: 'battle_won',
        target: 5,
        current: 0,
        xpReward: 800,
        coinReward: 200,
        completed: false,
        claimed: false
      }
    ];
    state.lastUpdatedWeek = weekStr;
  }

  // 3. Refresh Monthly Missions
  if (state.lastUpdatedMonth !== monthStr) {
    state.monthlyMissions = [
      {
        id: 'monthly_questions',
        title: 'Conquer 500 Total Questions',
        actionKey: 'questions_solved',
        target: 500,
        current: 0,
        xpReward: 2000,
        coinReward: 500,
        completed: false,
        claimed: false
      },
      {
        id: 'monthly_battles',
        title: 'Secure 20 PvP Matches Victories',
        actionKey: 'battle_won',
        target: 20,
        current: 0,
        xpReward: 2500,
        coinReward: 600,
        completed: false,
        claimed: false
      }
    ];
    state.lastUpdatedMonth = monthStr;
  }

  return state;
}

/**
 * Increments progress indicators across matching actions keys.
 */
export function processMissionProgress(
  missionsState: MissionsState, 
  actionKey: 'questions_solved' | 'quiz_completed' | 'coding_completed' | 'hr_completed' | 'battle_won' | 'xp_earned', 
  increment: number
): { state: MissionsState; completedCount: number } {
  let completedCount = 0;
  
  const updateProgress = (list: Mission[]) => {
    return list.map(m => {
      if (m.actionKey === actionKey && !m.completed) {
        const nextVal = Math.min(m.current + increment, m.target);
        const newlyCompleted = nextVal >= m.target;
        if (newlyCompleted) completedCount++;
        return {
          ...m,
          current: nextVal,
          completed: newlyCompleted
        };
      }
      return m;
    });
  };

  missionsState.dailyMissions = updateProgress(missionsState.dailyMissions);
  missionsState.weeklyMissions = updateProgress(missionsState.weeklyMissions);
  missionsState.monthlyMissions = updateProgress(missionsState.monthlyMissions);

  return { state: missionsState, completedCount };
}

export interface AchievementTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  checkUnlock: (userData: any) => boolean;
}

export const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  {
    id: 'first_quiz',
    title: 'First Step',
    description: 'Complete your first subject placement quiz.',
    icon: '📝',
    xpReward: 100,
    coinReward: 20,
    checkUnlock: (user) => (user.stats?.totalMockTests || 0) >= 1
  },
  {
    id: 'solve_100',
    title: 'Centurion Scholar',
    description: 'Solve 100 questions total across quizes.',
    icon: '💯',
    xpReward: 200,
    coinReward: 50,
    checkUnlock: (user) => (user.stats?.totalQuestionsSolved || 0) >= 100
  },
  {
    id: 'solve_500',
    title: 'Elite Cadet',
    description: 'Solve 500 questions total across training decks.',
    icon: '🎓',
    xpReward: 500,
    coinReward: 100,
    checkUnlock: (user) => (user.stats?.totalQuestionsSolved || 0) >= 500
  },
  {
    id: 'streak_7',
    title: 'Consistent Routine',
    description: 'Maintain a daily active streak of 7 days.',
    icon: '🔥',
    xpReward: 300,
    coinReward: 80,
    checkUnlock: (user) => (user.dailyStreak || 0) >= 7
  },
  {
    id: 'streak_30',
    title: 'Unstoppable Habit',
    description: 'Maintain a daily active streak of 30 days.',
    icon: '⚡',
    xpReward: 1000,
    coinReward: 300,
    checkUnlock: (user) => (user.dailyStreak || 0) >= 30
  },
  {
    id: 'coding_master',
    title: 'Algorithmic Master',
    description: 'Successfully pass compiler checks on 5 coding challenges.',
    icon: '💻',
    xpReward: 400,
    coinReward: 100,
    checkUnlock: (user) => (user.stats?.totalQuestionsSolved || 0) >= 5 && (user.stats?.totalMockTests || 0) >= 1
  },
  {
    id: 'hr_expert',
    title: 'Dialogue Pro',
    description: 'Complete 3 full HR director mock interviews.',
    icon: '💼',
    xpReward: 300,
    coinReward: 80,
    checkUnlock: (user) => (user.stats?.totalMockTests || 0) >= 3
  },
  {
    id: 'battle_champion',
    title: 'Arena Gladiator',
    description: 'Secure 5 wins inside the live PvP Matchmaker.',
    icon: '⚔️',
    xpReward: 500,
    coinReward: 150,
    checkUnlock: (user) => (user.stats?.totalBattlesWon || 0) >= 5
  },
  {
    id: 'placement_ready',
    title: 'Industry Ready',
    description: 'Reach a Placement Readiness quotient of 80% or higher.',
    icon: '🚀',
    xpReward: 600,
    coinReward: 200,
    checkUnlock: (user) => (user.placementReadinessScore || 0) >= 80
  }
];

/**
 * Iterates through templates and unlocks qualifying items. Returns unlocked IDs and added rewards.
 */
export function checkAndUnlockAchievements(userProfile: any): {
  unlockedList: string[];
  newlyUnlocked: AchievementTemplate[];
  xpGranted: number;
  coinsGranted: number;
} {
  const currentUnlocked = userProfile.unlockedAchievements || [];
  const newlyUnlocked: AchievementTemplate[] = [];
  let xpGranted = 0;
  let coinsGranted = 0;

  for (const ach of ACHIEVEMENT_TEMPLATES) {
    if (!currentUnlocked.includes(ach.id) && ach.checkUnlock(userProfile)) {
      newlyUnlocked.push(ach);
      xpGranted += ach.xpReward;
      coinsGranted += ach.coinReward;
    }
  }

  const unlockedList = [...currentUnlocked, ...newlyUnlocked.map(a => a.id)];

  return {
    unlockedList,
    newlyUnlocked,
    xpGranted,
    coinsGranted
  };
}

export interface StoreItem {
  id: string;
  name: string;
  category: 'theme' | 'frame' | 'badge';
  cost: number;
  description: string;
}

export const STORE_ITEMS: StoreItem[] = [
  { id: 'theme_neon_purple', name: 'Neon Purple Glow', category: 'theme', cost: 100, description: 'Infuse your cockpit view with glowing purple neon gasmorphism overlays.' },
  { id: 'theme_cyber_cyan', name: 'Cyberpunk Cyan', category: 'theme', cost: 200, description: 'A sleek retro-futuristic cyan theme designed for elite programmers.' },
  { id: 'theme_golden_legend', name: 'Golden Legend', category: 'theme', cost: 500, description: 'Bask in premium gold trim headers and active golden crown indicators.' },
  { id: 'frame_silicon', name: 'Silicon Valley Frame', category: 'frame', cost: 150, description: 'Wrap your cadet profile with circuit boards from Silicon Valley.' },
  { id: 'frame_antigravity', name: 'Antigravity Frame', category: 'frame', cost: 300, description: 'Defy gravity with floating neon rings around your avatar.' },
  { id: 'frame_ai_master', name: 'AI Master Frame', category: 'frame', cost: 500, description: 'Surround your picture with neural networks and deep brain structures.' }
];

export interface SpinSector {
  id: string;
  label: string;
  type: 'coins' | 'xp' | 'mystery_box';
  value: number;
  weight: number;
}

export const SPIN_SECTORS: SpinSector[] = [
  { id: 'coins_10', label: '10 Coins', type: 'coins', value: 10, weight: 35 },
  { id: 'coins_50', label: '50 Coins', type: 'coins', value: 50, weight: 15 },
  { id: 'xp_50', label: '50 XP', type: 'xp', value: 50, weight: 25 },
  { id: 'xp_200', label: '200 XP', type: 'xp', value: 200, weight: 10 },
  { id: 'mystery_box', label: 'Mystery Box', type: 'mystery_box', value: 1, weight: 5 },
  { id: 'coins_100', label: '100 Coins', type: 'coins', value: 100, weight: 8 },
  { id: 'jackpot', label: '500 XP', type: 'xp', value: 500, weight: 2 }
];

export function rollLuckySpin(): SpinSector {
  const totalWeight = SPIN_SECTORS.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  for (const s of SPIN_SECTORS) {
    if (random < s.weight) {
      return s;
    }
    random -= s.weight;
  }
  return SPIN_SECTORS[0];
}

export interface BoxLoot {
  type: 'coins' | 'xp' | 'frame';
  value: number | string;
  label: string;
  weight: number;
}

export const MYSTERY_BOX_LOOT: BoxLoot[] = [
  { type: 'coins', value: 100, label: '100 Coins', weight: 40 },
  { type: 'coins', value: 300, label: '300 Coins', weight: 15 },
  { type: 'xp', value: 250, label: '250 XP', weight: 30 },
  { type: 'xp', value: 750, label: '750 XP', weight: 10 },
  { type: 'frame', value: 'frame_mystery_elite', label: 'Elite Gladiator Avatar Frame', weight: 5 }
];

export function openMysteryBoxLoot(): BoxLoot {
  const totalWeight = MYSTERY_BOX_LOOT.reduce((sum, l) => sum + l.weight, 0);
  let random = Math.random() * totalWeight;
  for (const l of MYSTERY_BOX_LOOT) {
    if (random < l.weight) {
      return l;
    }
    random -= l.weight;
  }
  return MYSTERY_BOX_LOOT[0];
}

/**
 * Calculates standard Elo rating updates.
 */
export function calculateElo(ratingA: number, ratingB: number, scoreA: number, kFactor: number = 32): number {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  return Math.round(ratingA + kFactor * (scoreA - expectedA));
}
