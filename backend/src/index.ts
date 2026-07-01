import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { verifyToken, AuthenticatedRequest } from './middleware/auth';
import { db } from './config/firebase';
import quizRouter from './routes/quiz';
import codingRouter from './routes/coding';
import interviewRouter from './routes/interview';
import studyRouter from './routes/study';
import { AIService } from './services/AIService';
import { 
  getXpRequiredForLevel, 
  calculateLevelFromXp, 
  syncMissionsState, 
  checkAndUnlockAchievements,
  rollLuckySpin,
  openMysteryBoxLoot,
  calculateElo,
  processMissionProgress
} from './utils/gamification';
import { COSMETICS_CATALOG } from './utils/cosmetics';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Mount Routers
app.use('/api/quiz', quizRouter);
app.use('/api/coding', codingRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/study', studyRouter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Verify JWT and get user profile
app.post('/api/auth/verify', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userDocRef = db.collection('users').doc(req.user.uid);
  
  try {
    const tzOffset = 5.5 * 60 * 60 * 1000; // IST Timezone (UTC+5:30)
    const todayStr = new Date(Date.now() + tzOffset).toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() + tzOffset - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let loginRewardClaimed: any = null;
    let leveledUp = false;
    let oldLevel = 1;
    let newLevel = 1;
    let newlyUnlockedAchievements: any[] = [];

    await db.runTransaction(async (transaction: any) => {
      const userDoc = await transaction.get(userDocRef);
      let userData: any;
      
      if (!userDoc.exists) {
        userData = {
          uid: req.user!.uid,
          email: req.user!.email || 'student@crackplace.ai',
          displayName: req.user!.name || 'Anonymous Cadet',
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${req.user!.uid}`,
          role: 'student',
          college: '',
          department: '',
          year: 1,
          dreamCompany: '',
          skills: [],
          bio: '',
          xp: 0,
          coins: 100,
          level: 1,
          battleRating: 1000,
          dailyStreak: 0,
          longestStreak: 0,
          lastActiveDate: '',
          lastLoginRewardClaimedDate: '',
          loginStreakCount: 0,
          stats: {
            totalQuestionsSolved: 0,
            totalBattlesWon: 0,
            totalMockTests: 0
          },
          unlockedAchievements: [],
          missionsState: syncMissionsState({}, new Date()),
          createdAt: new Date().toISOString()
        };
        transaction.set(userDocRef, userData);
      } else {
        userData = userDoc.data();
      }
      
      const lastActiveDate = userData.lastActiveDate || '';
      const lastLoginRewardClaimedDate = userData.lastLoginRewardClaimedDate || '';
      let loginStreakCount = userData.loginStreakCount || 0;
      let xp = userData.xp || 0;
      let coins = userData.coins || 0;
      oldLevel = userData.level || 1;
      
      let updatedFields: any = {};
      
      // Sync or initialize missions state
      const currentMissions = userData.missionsState || {};
      const missionsState = syncMissionsState(currentMissions, new Date());
      updatedFields.missionsState = missionsState;
      
      // 1. Reset streak count if missed a learning day
      if (lastActiveDate && lastActiveDate !== yesterdayStr && lastActiveDate !== todayStr) {
        updatedFields.dailyStreak = 0;
      }
      
      // 2. Claim daily login reward if not claimed today
      if (lastLoginRewardClaimedDate !== todayStr) {
        if (lastLoginRewardClaimedDate === yesterdayStr) {
          loginStreakCount = (loginStreakCount % 7) + 1;
        } else {
          loginStreakCount = 1;
        }
        
        let rewardXp = 50 * loginStreakCount;
        let rewardCoins = 10 * loginStreakCount;
        if (loginStreakCount === 7) {
          rewardXp = 500;
          rewardCoins = 150;
        }
        
        xp += rewardXp;
        coins += rewardCoins;
        
        const levelDetails = calculateLevelFromXp(xp);
        newLevel = levelDetails.level;
        
        updatedFields.xp = xp;
        updatedFields.coins = coins;
        updatedFields.level = newLevel;
        updatedFields.lastLoginRewardClaimedDate = todayStr;
        updatedFields.loginStreakCount = loginStreakCount;
        
        loginRewardClaimed = {
          day: loginStreakCount,
          xp: rewardXp,
          coins: rewardCoins,
          mysteryBox: loginStreakCount === 7
        };
        
        if (newLevel > oldLevel) {
          leveledUp = true;
        }
      }

      // 3. Check achievements
      const tempUserStats = {
        xp,
        coins,
        level: newLevel,
        dailyStreak: updatedFields.dailyStreak !== undefined ? updatedFields.dailyStreak : (userData.dailyStreak || 0),
        longestStreak: userData.longestStreak || 0,
        placementReadinessScore: userData.placementReadinessScore || 0,
        stats: userData.stats || {},
        unlockedAchievements: userData.unlockedAchievements || []
      };

      const achDetails = checkAndUnlockAchievements(tempUserStats);
      if (achDetails.newlyUnlocked.length > 0) {
        xp += achDetails.xpGranted;
        coins += achDetails.coinsGranted;
        
        const finalLevelDetails = calculateLevelFromXp(xp);
        newLevel = finalLevelDetails.level;
        
        updatedFields.xp = xp;
        updatedFields.coins = coins;
        updatedFields.level = newLevel;
        updatedFields.unlockedAchievements = achDetails.unlockedList;
        
        newlyUnlockedAchievements = achDetails.newlyUnlocked;
        if (newLevel > oldLevel) {
          leveledUp = true;
        }
      }
      
      if (Object.keys(updatedFields).length > 0) {
        transaction.update(userDocRef, updatedFields);
      }
    });
    
    // Generate notification logs outside of Transaction to prevent block delays
    if (leveledUp) {
      const notifRef = db.collection('notifications').doc();
      await notifRef.set({
        userId: req.user.uid,
        type: 'level_up',
        title: 'Level Up! 🎉',
        message: `Congratulations! You leveled up to Level ${newLevel}! Keep solving challenges to maximize readiness.`,
        createdAt: new Date().toISOString(),
        read: false
      });
    }

    if (loginRewardClaimed) {
      const notifRef = db.collection('notifications').doc();
      await notifRef.set({
        userId: req.user.uid,
        type: 'login_reward',
        title: `Day ${loginRewardClaimed.day} Reward Claimed! 🪙`,
        message: `Awarded +${loginRewardClaimed.xp} XP and +${loginRewardClaimed.coins} Coins!`,
        createdAt: new Date().toISOString(),
        read: false
      });
    }

    if (newlyUnlockedAchievements.length > 0) {
      for (const ach of newlyUnlockedAchievements) {
        const notifRef = db.collection('notifications').doc();
        await notifRef.set({
          userId: req.user.uid,
          type: 'achievement',
          title: `Achievement Unlocked! ${ach.icon}`,
          message: `Unlocked "${ach.title}": ${ach.description} (Reward: +${ach.xpReward} XP, +${ach.coinReward} Coins)`,
          createdAt: new Date().toISOString(),
          read: false
        });
      }
    }
    
    const freshUserDoc = await userDocRef.get();
    res.json({ 
      message: 'Authentication valid', 
      profile: freshUserDoc.data(),
      loginRewardClaimed
    });
  } catch (error) {
    console.error('Error fetching user profile in verify route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch Top 50 global leaderboard
app.get('/api/leaderboard', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    const snapshot = await db.collection('users')
      .orderBy('battleRating', 'desc')
      .limit(50)
      .get();
      
    const ranks: any[] = [];
    snapshot.forEach((doc: any) => {
      const data = doc.data();
      ranks.push({
        uid: doc.id,
        displayName: data.displayName || 'Anonymous Cadet',
        photoURL: data.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${doc.id}`,
        level: data.level || 1,
        battleRating: data.battleRating || 1000,
        xp: data.xp || 0
      });
    });
    
    // Sort in-memory as safety fallback if orderby failed
    if (ranks.length === 0) {
      throw new Error('No users found in database');
    }
    
    res.json(ranks);
  } catch (error) {
    console.warn('Firestore leaderboard query failed (probably index indexing or empty DB), using in-memory sorted fallback:', error);
    
    // Fallback to top users in-memory or static items for clean setup preview
    try {
      const snapshot = await db.collection('users').get();
      const ranks: any[] = [];
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        ranks.push({
          uid: doc.id,
          displayName: data.displayName || 'Anonymous Cadet',
          photoURL: data.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${doc.id}`,
          level: data.level || 1,
          battleRating: data.battleRating || 1000,
          xp: data.xp || 0
        });
      });
      ranks.sort((a, b) => b.battleRating - a.battleRating);
      
      if (ranks.length > 0) {
        return res.json(ranks.slice(0, 50));
      }
    } catch (innerErr) {
      console.error('Inner fallback retrieval failed:', innerErr);
    }

    const fallbackRanks = [
      { uid: '1', displayName: 'Sandhya P', photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=1', level: 12, battleRating: 1420, xp: 6200 },
      { uid: '2', displayName: 'Lokesh A', photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=2', level: 10, battleRating: 1350, xp: 5100 },
      { uid: '3', displayName: 'Ramesh K', photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=3', level: 8, battleRating: 1210, xp: 4200 },
      { uid: '4', displayName: 'Divya M', photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=4', level: 7, battleRating: 1150, xp: 3500 }
    ];
    res.json(fallbackRanks);
  }
});

// AI Mentor Chat assistant route
app.post('/api/study/chat', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const systemPrompt = `You are a helpful AI Placement Mentor assisting students in cracking technical coding and HR interview placement rounds.
Be concise, highly structured, encouraging, and provide formatting in clear Markdown.`;

    const response = await AIService.generateText(prompt, systemPrompt);
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Assistant is busy. Try again later.' });
  }
});

// Claim completed mission rewards
app.post('/api/auth/missions/claim', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { missionId } = req.body;
  if (!missionId) {
    return res.status(400).json({ error: 'missionId is required' });
  }

  const userDocRef = db.collection('users').doc(req.user.uid);
  
  try {
    let claimedXp = 0;
    let claimedCoins = 0;
    let leveledUp = false;
    let newLevel = 1;

    await db.runTransaction(async (transaction: any) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists) {
        throw new Error('User profile not found');
      }
      
      const userData = userDoc.data();
      const missionsState = { ...(userData.missionsState || {}) };
      
      let missionFound = false;
      const claimFromList = (list: any[]) => {
        if (!list) return [];
        return list.map(m => {
          if (m.id === missionId) {
            if (m.claimed) {
              throw new Error('Mission reward already claimed');
            }
            if (!m.completed) {
              throw new Error('Mission not completed yet');
            }
            m.claimed = true;
            claimedXp = m.xpReward;
            claimedCoins = m.coinReward;
            missionFound = true;
          }
          return m;
        });
      };

      missionsState.dailyMissions = claimFromList(missionsState.dailyMissions);
      missionsState.weeklyMissions = claimFromList(missionsState.weeklyMissions);
      missionsState.monthlyMissions = claimFromList(missionsState.monthlyMissions);

      if (!missionFound) {
        throw new Error('Mission not found');
      }

      const currentXp = (userData.xp || 0) + claimedXp;
      const currentCoins = (userData.coins || 0) + claimedCoins;
      const oldLevel = userData.level || 1;

      const levelDetails = calculateLevelFromXp(currentXp);
      newLevel = levelDetails.level;
      if (newLevel > oldLevel) {
        leveledUp = true;
      }

      transaction.update(userDocRef, {
        xp: currentXp,
        coins: currentCoins,
        level: newLevel,
        missionsState
      });
    });

    if (leveledUp) {
      const notifRef = db.collection('notifications').doc();
      await notifRef.set({
        userId: req.user.uid,
        type: 'level_up',
        title: 'Level Up! 🎉',
        message: `Congratulations! You leveled up to Level ${newLevel}! Keep solving challenges to maximize readiness.`,
        createdAt: new Date().toISOString(),
        read: false
      });
    }

    const freshUserDoc = await userDocRef.get();
    res.json({
      message: 'Mission claimed successfully',
      claimedXp,
      claimedCoins,
      profile: freshUserDoc.data()
    });
  } catch (error: any) {
    console.error('Claim mission error:', error);
    res.status(500).json({ error: error.message || 'Failed to claim mission.' });
  }
});

// Spend coins to buy shop items
app.post('/api/auth/store/buy', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { itemId } = req.body;
  if (!itemId) return res.status(400).json({ error: 'itemId is required' });

  const item = COSMETICS_CATALOG.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const userDocRef = db.collection('users').doc(req.user.uid);
  try {
    await db.runTransaction(async (transaction: any) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists) throw new Error('Profile not found');
      const userData = userDoc.data()!;

      const coins = userData.coins || 0;
      if (coins < item.cost) {
        throw new Error('Insufficient coins balance');
      }

      // Determine corresponding unlocked field
      let fieldName = '';
      if (item.category === 'avatar') fieldName = 'unlockedAvatars';
      else if (item.category === 'ring') fieldName = 'unlockedRings';
      else if (item.category === 'frame') fieldName = 'unlockedFrames';
      else if (item.category === 'background') fieldName = 'unlockedBackgrounds';
      else if (item.category === 'title') fieldName = 'unlockedTitles';
      else if (item.category === 'theme') fieldName = 'unlockedThemes';
      else if (item.category === 'emote') fieldName = 'unlockedEmotes';
      else if (item.category === 'sticker') fieldName = 'unlockedStickers';

      const unlockedList = userData[fieldName] || [];
      if (unlockedList.includes(item.id)) {
        throw new Error('Item already purchased');
      }

      const nextCoins = coins - item.cost;
      const updates: any = { 
        coins: nextCoins,
        [fieldName]: [...unlockedList, item.id]
      };

      transaction.update(userDocRef, updates);
    });

    const freshUserDoc = await userDocRef.get();
    res.json({ message: `Successfully purchased ${item.name}!`, profile: freshUserDoc.data() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Purchase failed.' });
  }
});

// Equip unlocked cosmetics
app.post('/api/auth/profile/equip', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { category, itemId } = req.body;
  if (!category || itemId === undefined) {
    return res.status(400).json({ error: 'category and itemId are required' });
  }

  // Validate category
  const validCategories = ['avatar', 'ring', 'frame', 'background', 'title', 'theme'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid cosmetic category' });
  }

  // Allow un-equipping items (if itemId is null or empty)
  const isUnequip = itemId === null || itemId === '';

  if (!isUnequip) {
    const item = COSMETICS_CATALOG.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ error: 'Cosmetic item not found' });
    if (item.category !== category) {
      return res.status(400).json({ error: 'Item category mismatch' });
    }
  }

  const userDocRef = db.collection('users').doc(req.user.uid);
  try {
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) return res.status(404).json({ error: 'Profile not found' });
    const userData = userDoc.data()!;

    if (!isUnequip) {
      // Validate that the user owns it
      let fieldName = '';
      if (category === 'avatar') fieldName = 'unlockedAvatars';
      else if (category === 'ring') fieldName = 'unlockedRings';
      else if (category === 'frame') fieldName = 'unlockedFrames';
      else if (category === 'background') fieldName = 'unlockedBackgrounds';
      else if (category === 'title') fieldName = 'unlockedTitles';
      else if (category === 'theme') fieldName = 'unlockedThemes';

      const unlockedList = userData[fieldName] || [];
      if (!unlockedList.includes(itemId)) {
        return res.status(403).json({ error: 'You do not own this cosmetic item' });
      }
    }

    // Determine target equipped field
    let equipField = '';
    if (category === 'avatar') equipField = 'equippedAvatar';
    else if (category === 'ring') equipField = 'equippedRing';
    else if (category === 'frame') equipField = 'equippedFrame';
    else if (category === 'background') equipField = 'equippedBackground';
    else if (category === 'title') equipField = 'equippedTitle';
    else if (category === 'theme') equipField = 'equippedTheme';

    const updates: any = { [equipField]: isUnequip ? null : itemId };

    if (category === 'avatar') {
      if (isUnequip) {
        updates.photoURL = `https://api.dicebear.com/7.x/adventurer/svg?seed=${req.user.uid}`;
      } else {
        const item = COSMETICS_CATALOG.find(i => i.id === itemId);
        if (item) {
          let avatarUrl = '';
          const visual = item.visual;
          if (visual.startsWith('http')) {
            avatarUrl = visual;
          } else if (visual === 'ai_robot' || visual === 'martian' || visual === 'robot_cat' || visual === 'cyber_dog') {
            avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${visual}`;
          } else if (visual === 'pixel_hero' || visual === '8bit_knight') {
            avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${visual}`;
          } else {
            avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${visual}`;
          }
          updates.photoURL = avatarUrl;
        }
      }
    }

    // Update recently used cosmetics list (limit 5 items)
    if (!isUnequip) {
      let recentlyUsed = userData.recentlyUsedCosmetics || [];
      recentlyUsed = [itemId, ...recentlyUsed.filter((id: string) => id !== itemId)].slice(0, 5);
      updates.recentlyUsedCosmetics = recentlyUsed;
    }

    await userDocRef.update(updates);

    const freshUserDoc = await userDocRef.get();
    res.json({ message: isUnequip ? `Cosmetic unequipped.` : `Cosmetic equipped successfully!`, profile: freshUserDoc.data() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Equip operation failed.' });
  }
});

// Toggle favorite cosmetic items
app.post('/api/auth/profile/favorite', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { itemId } = req.body;
  if (!itemId) return res.status(400).json({ error: 'itemId is required' });

  const userDocRef = db.collection('users').doc(req.user.uid);
  try {
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) return res.status(404).json({ error: 'Profile not found' });
    const userData = userDoc.data()!;

    const item = COSMETICS_CATALOG.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ error: 'Cosmetic item not found' });

    // Verify user owns the item before favoriting it
    let fieldName = '';
    const category = item.category;
    if (category === 'avatar') fieldName = 'unlockedAvatars';
    else if (category === 'ring') fieldName = 'unlockedRings';
    else if (category === 'frame') fieldName = 'unlockedFrames';
    else if (category === 'background') fieldName = 'unlockedBackgrounds';
    else if (category === 'title') fieldName = 'unlockedTitles';
    else if (category === 'theme') fieldName = 'unlockedThemes';
    else if (category === 'emote') fieldName = 'unlockedEmotes';
    else if (category === 'sticker') fieldName = 'unlockedStickers';

    const unlockedList = userData[fieldName] || [];
    if (!unlockedList.includes(itemId)) {
      return res.status(403).json({ error: 'You do not own this cosmetic item' });
    }

    const favoriteItems = userData.favoriteItems || {};
    const key = `${category}s`; // e.g. avatars, rings
    let list = favoriteItems[key] || [];
    let message = '';

    if (list.includes(itemId)) {
      list = list.filter((id: string) => id !== itemId);
      message = 'Item removed from favorites.';
    } else {
      list = [...list, itemId];
      message = 'Item added to favorites.';
    }

    favoriteItems[key] = list;

    await userDocRef.update({ favoriteItems });
    const freshUserDoc = await userDocRef.get();
    res.json({ message, profile: freshUserDoc.data() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Favorite toggle failed.' });
  }
});

// Run Daily Lucky Spin wheel
app.post('/api/auth/lucky-spin', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const userDocRef = db.collection('users').doc(req.user.uid);
  const cost = 50;

  try {
    let sector: any;
    let leveledUp = false;
    let newLevel = 1;

    await db.runTransaction(async (transaction: any) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists) throw new Error('Profile not found');
      const userData = userDoc.data()!;

      const tzOffset = 5.5 * 60 * 60 * 1000; // IST Timezone (UTC+5:30)
      const todayStr = new Date(Date.now() + tzOffset).toISOString().split('T')[0];
      const lastSpinDate = userData.lastSpinDate || '';
      
      const isFree = lastSpinDate !== todayStr;
      const currentCoins = userData.coins || 0;

      if (!isFree && currentCoins < cost) {
        throw new Error('Insufficient coins (Lucky Spin costs 50 coins)');
      }

      sector = rollLuckySpin();

      let xp = userData.xp || 0;
      let coins = currentCoins;
      let mysteryBoxes = userData.mysteryBoxes || 0;

      if (!isFree) {
        coins -= cost;
      }

      if (sector.type === 'coins') {
        coins += sector.value;
      } else if (sector.type === 'xp') {
        xp += sector.value;
      } else if (sector.type === 'mystery_box') {
        mysteryBoxes += sector.value;
      }

      const oldLevel = userData.level || 1;
      const levelDetails = calculateLevelFromXp(xp);
      newLevel = levelDetails.level;
      if (newLevel > oldLevel) {
        leveledUp = true;
      }

      transaction.update(userDocRef, {
        xp,
        coins,
        level: newLevel,
        mysteryBoxes,
        lastSpinDate: todayStr
      });
    });

    if (leveledUp) {
      const notifRef = db.collection('notifications').doc();
      await notifRef.set({
        userId: req.user.uid,
        type: 'level_up',
        title: 'Level Up! 🎉',
        message: `Congratulations! You leveled up to Level ${newLevel}! Keep solving challenges to maximize readiness.`,
        createdAt: new Date().toISOString(),
        read: false
      });
    }

    const freshUserDoc = await userDocRef.get();
    res.json({
      message: `Wheel spun successfully! You won: ${sector.label}`,
      sector,
      profile: freshUserDoc.data()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Spin failed.' });
  }
});

// Open a Mystery Box
app.post('/api/auth/mystery-box/open', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const userDocRef = db.collection('users').doc(req.user.uid);
  try {
    let loot: any;
    let leveledUp = false;
    let newLevel = 1;

    await db.runTransaction(async (transaction: any) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists) throw new Error('Profile not found');
      const userData = userDoc.data()!;

      const mysteryBoxes = userData.mysteryBoxes || 0;
      if (mysteryBoxes < 1) {
        throw new Error('No mystery boxes available to open');
      }

      loot = openMysteryBoxLoot();

      let xp = userData.xp || 0;
      let coins = userData.coins || 0;
      const unlockedFrames = userData.unlockedFrames || [];

      if (loot.type === 'coins') {
        coins += loot.value;
      } else if (loot.type === 'xp') {
        xp += loot.value;
      } else if (loot.type === 'frame') {
        if (!unlockedFrames.includes(loot.value)) {
          unlockedFrames.push(loot.value);
        }
      }

      const oldLevel = userData.level || 1;
      const levelDetails = calculateLevelFromXp(xp);
      newLevel = levelDetails.level;
      if (newLevel > oldLevel) {
        leveledUp = true;
      }

      transaction.update(userDocRef, {
        xp,
        coins,
        level: newLevel,
        mysteryBoxes: mysteryBoxes - 1,
        unlockedFrames
      });
    });

    if (leveledUp) {
      const notifRef = db.collection('notifications').doc();
      await notifRef.set({
        userId: req.user.uid,
        type: 'level_up',
        title: 'Level Up! 🎉',
        message: `Congratulations! You leveled up to Level ${newLevel}! Keep solving challenges to maximize readiness.`,
        createdAt: new Date().toISOString(),
        read: false
      });
    }

    const freshUserDoc = await userDocRef.get();
    res.json({
      message: `Opened Mystery Box! Revealed: ${loot.label}`,
      loot,
      profile: freshUserDoc.data()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to open mystery box.' });
  }
});

// Create custom battle room invitation
app.post('/api/auth/battle-room/create', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { battleType, questionsCount, difficulty, timeLimit, category, company, isPrivate } = req.body;
  if (!battleType) return res.status(400).json({ error: 'battleType is required' });

  try {
    // Generate Room ID
    const prefixes: { [key: string]: string } = {
      'Aptitude': 'APT',
      'DSA': 'DSA',
      'DBMS': 'DBM',
      'Operating Systems': 'OPS',
      'Mixed': 'MIX',
      'Company Mock': 'COM',
      'HR': 'HRB',
      'Rapid Fire': 'RAP'
    };
    const pfx = prefixes[battleType] || 'BAT';
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomId = `${pfx}-${rand}`;

    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User profile not found' });
    const userData = userDoc.data()!;

    const now = new Date();
    const expiration = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

    const newRoom = {
      roomId,
      hostUid: req.user.uid,
      hostName: userData.displayName || 'Anonymous Host',
      hostAvatar: userData.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${req.user.uid}`,
      battleType,
      settings: {
        questionsCount: Number(questionsCount) || 5,
        difficulty: difficulty || 'Medium',
        timeLimit: Number(timeLimit) || 30,
        category: category || 'All',
        company: company || 'All',
        isPrivate: isPrivate === undefined ? true : !!isPrivate
      },
      status: 'waiting',
      createdTime: now.toISOString(),
      expirationTime: expiration.toISOString(),
      players: {
        [req.user.uid]: {
          uid: req.user.uid,
          displayName: userData.displayName || 'Anonymous Host',
          photoURL: userData.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${req.user.uid}`,
          level: userData.level || 1,
          battleRating: userData.battleRating || 1200,
          college: userData.college || '',
          ready: true,
          online: true,
          score: 0,
          progressIndex: 0,
          finished: false,
          equippedRing: userData.equippedRing || '',
          equippedFrame: userData.equippedFrame || '',
          equippedBackground: userData.equippedBackground || '',
          equippedTitle: userData.equippedTitle || ''
        }
      }
    };

    await db.collection('battleRooms').doc(roomId).set(newRoom);
    res.json({ message: 'Battle room created successfully', room: newRoom });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create battle room' });
  }
});

// Fetch battle room details by roomId
app.get('/api/auth/battle-room/info/:roomId', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { roomId } = req.params;
  try {
    const roomDoc = await db.collection('battleRooms').doc(roomId).get();
    if (!roomDoc.exists) {
      return res.status(404).json({ error: 'Lobby not found. The room may have been deleted or canceled.' });
    }
    const roomData = roomDoc.data()!;

    // Check expiration
    const now = new Date();
    const expiration = new Date(roomData.expirationTime);
    if (roomData.status === 'expired' || now > expiration) {
      if (roomData.status !== 'expired') {
        await db.collection('battleRooms').doc(roomId).update({ status: 'expired' });
      }
      return res.status(410).json({ error: 'This invitation has expired.', status: 'expired' });
    }

    if (roomData.status === 'concluded') {
      return res.status(400).json({ error: 'This battle has already concluded.' });
    }

    const players = roomData.players || {};
    const playerUids = Object.keys(players);

    // Prevent third players from joining
    if (playerUids.length >= 2 && !playerUids.includes(req.user.uid)) {
      return res.status(403).json({ error: 'This battle lobby is full (maximum 2 players).' });
    }

    res.json({ room: roomData });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get room details' });
  }
});

// Fetch user battle history
app.get('/api/auth/battle/history', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const historySnap = await db.collection('battleHistory')
      .where('uids', 'array-contains', req.user.uid)
      .get();

    const historyList: any[] = [];
    historySnap.forEach((doc: any) => {
      historyList.push({ id: doc.id, ...doc.data() });
    });

    // Sort in-memory by createdAt in descending order (newest first)
    historyList.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    // Slice to limit 20
    const limitedHistory = historyList.slice(0, 20);

    res.json({ history: limitedHistory });
  } catch (error: any) {
    console.error('Failed to get battle history:', error);
    res.status(500).json({ error: error.message || 'Failed to get battle history' });
  }
});

// Setup Server
const server = http.createServer(app);

// Bind Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Lobbies state map
interface LobbyPlayer {
  userId: string;
  battleType: string;
  rating: number;
  socketId: string;
  profile: {
    displayName: string;
    level: number;
    avatar?: string;
    equippedRing?: string | null;
    equippedFrame?: string | null;
    equippedBackground?: string | null;
    equippedTitle?: string | null;
  };
}

const matchmakingLobby = new Map<string, LobbyPlayer>();

// Helper to update player stats on battle conclusion
async function updateUserBattleStats(userId: string, eloDelta: number, xpDelta: number, coinsDelta: number, isDraw: boolean) {
  console.log(`[PVP STATS UPDATE] Updating userId: ${userId}, eloDelta: ${eloDelta}, xpDelta: ${xpDelta}, coinsDelta: ${coinsDelta}, isDraw: ${isDraw}`);
  try {
    const userRef = db.collection('users').doc(userId);
    let leveledUp = false;
    let newLevel = 1;
    let newlyUnlockedAchievements: any[] = [];

    await db.runTransaction(async (transaction: any) => {
      const userDoc = await transaction.get(userRef);
      let userData: any;
      
      if (!userDoc.exists) {
        console.log(`[PVP STATS UPDATE] Profile doc for ${userId} does not exist, creating default profile template.`);
        userData = {
          uid: userId,
          email: 'student@crackplace.ai',
          displayName: 'Anonymous Cadet',
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`,
          role: 'student',
          college: '',
          department: '',
          year: 1,
          dreamCompany: '',
          skills: [],
          bio: '',
          xp: 0,
          coins: 100,
          level: 1,
          battleRating: 1200,
          dailyStreak: 0,
          longestStreak: 0,
          lastActiveDate: '',
          lastLoginRewardClaimedDate: '',
          loginStreakCount: 0,
          stats: {
            totalQuestionsSolved: 0,
            totalBattlesWon: 0,
            totalMockTests: 0
          },
          unlockedAchievements: [],
          missionsState: syncMissionsState({}, new Date()),
          createdAt: new Date().toISOString()
        };
        transaction.set(userRef, userData);
      } else {
        userData = userDoc.data();
      }

      // Calculate streak triggers
      const tzOffset = 5.5 * 60 * 60 * 1000; // IST Timezone (UTC+5:30)
      const todayStr = new Date(Date.now() + tzOffset).toISOString().split('T')[0];
      const yesterdayStr = new Date(Date.now() + tzOffset - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let dailyStreak = Number(userData.dailyStreak || 0);
      let longestStreak = Number(userData.longestStreak || 0);
      let lastActiveDate = userData.lastActiveDate || '';

      if (lastActiveDate !== todayStr) {
        if (lastActiveDate === yesterdayStr || lastActiveDate === '') {
          dailyStreak += 1;
        } else {
          dailyStreak = 1;
        }
        longestStreak = Math.max(longestStreak, dailyStreak);
        lastActiveDate = todayStr;
      }

      const baseRating = Number(userData.battleRating !== undefined ? userData.battleRating : 1200);
      const currentElo = Math.max(100, baseRating + eloDelta);
      let xp = Number(userData.xp || 0) + xpDelta;
      let coins = Number(userData.coins || 0) + coinsDelta;
      const oldLevel = Number(userData.level || 1);

      console.log(`[PVP STATS UPDATE] Current User ELO calculated: base ${baseRating} -> new ${currentElo}`);

      const levelDetails = calculateLevelFromXp(xp);
      newLevel = levelDetails.level;
      if (newLevel > oldLevel) {
        leveledUp = true;
      }

      const stats = { ...(userData.stats || {}) };
      stats.totalMockTests = (stats.totalMockTests || 0) + 1; // Count pvp battle as a mock test for stats
      if (!isDraw && eloDelta > 0) {
        stats.totalBattlesWon = (stats.totalBattlesWon || 0) + 1;
      }
      stats.totalQuestionsSolved = (stats.totalQuestionsSolved || 0) + 5; // Solve 5 questions in a PvP battle

      // 1. Process Missions Progress
      let tempMissions = userData.missionsState || {};
      let syncedMissions = syncMissionsState(tempMissions, new Date());
      if (!isDraw && eloDelta > 0) {
        syncedMissions = processMissionProgress(syncedMissions, 'battle_won', 1).state;
      }
      syncedMissions = processMissionProgress(syncedMissions, 'questions_solved', 5).state;
      
      // 2. Check achievements
      let unlockedAchievementsList = userData.unlockedAchievements || [];
      const tempUserStats = {
        xp,
        coins,
        level: newLevel,
        dailyStreak,
        longestStreak,
        placementReadinessScore: Number(userData.placementReadinessScore || 0),
        stats,
        unlockedAchievements: unlockedAchievementsList
      };

      const achDetails = checkAndUnlockAchievements(tempUserStats);
      if (achDetails.newlyUnlocked.length > 0) {
        xp += achDetails.xpGranted;
        coins += achDetails.coinsGranted;
        
        const finalLevelDetails = calculateLevelFromXp(xp);
        newLevel = finalLevelDetails.level;
        unlockedAchievementsList = achDetails.unlockedList;
        newlyUnlockedAchievements = achDetails.newlyUnlocked;
        if (newLevel > oldLevel) {
          leveledUp = true;
        }
      }

      transaction.update(userRef, {
        battleRating: currentElo,
        xp,
        coins,
        level: newLevel,
        dailyStreak,
        longestStreak,
        lastActiveDate,
        stats,
        missionsState: syncedMissions,
        unlockedAchievements: unlockedAchievementsList
      });
      console.log(`[PVP STATS UPDATE] Transaction updates queued for write successfully.`);
    });

    if (leveledUp) {
      const notifRef = db.collection('notifications').doc();
      await notifRef.set({
        userId,
        type: 'level_up',
        title: 'Level Up! 🎉',
        message: `Congratulations! You leveled up to Level ${newLevel}! Keep solving challenges to maximize readiness.`,
        createdAt: new Date().toISOString(),
        read: false
      });
    }

    if (newlyUnlockedAchievements.length > 0) {
      for (const ach of newlyUnlockedAchievements) {
        const notifRef = db.collection('notifications').doc();
        await notifRef.set({
          userId,
          type: 'achievement',
          title: `Achievement Unlocked! ${ach.icon}`,
          message: `Unlocked "${ach.title}": ${ach.description} (Reward: +${ach.xpReward} XP, +${ach.coinReward} Coins)`,
          createdAt: new Date().toISOString(),
          read: false
        });
      }
    }
  } catch (err) {
    console.error(`Failed to update battle stats for user ${userId}:`, err);
  }
}

// Conclude active battles
async function concludePvPBattle(battleId: string, battleRef: any, players: any) {
  console.log(`[PVP BATTLE CONCLUDE] Concluding battle room ID: ${battleId}`);
  try {
    const uids = Object.keys(players);
    if (uids.length < 2) {
      console.log(`[PVP BATTLE CONCLUDE] Aborted: room has less than 2 players.`);
      return;
    }
    const p1 = players[uids[0]];
    const p2 = players[uids[1]];
    console.log(`[PVP BATTLE CONCLUDE] Players found: P1 score = ${p1.score}, P2 score = ${p2.score}`);

    let winnerId = '';
    let loserId = '';

    if (p1.score > p2.score) {
      winnerId = uids[0];
      loserId = uids[1];
    } else if (p2.score > p1.score) {
      winnerId = uids[1];
      loserId = uids[0];
    } else {
      winnerId = 'draw';
    }
    console.log(`[PVP BATTLE CONCLUDE] Winner determined: ${winnerId}`);

    const p1Doc = await db.collection('users').doc(uids[0]).get();
    const p2Doc = await db.collection('users').doc(uids[1]).get();

    const r1 = Number(p1Doc.exists ? (p1Doc.data()?.battleRating || 1200) : 1200);
    const r2 = Number(p2Doc.exists ? (p2Doc.data()?.battleRating || 1200) : 1200);
    console.log(`[PVP BATTLE CONCLUDE] Calculated initial ratings: P1 Elo = ${r1}, P2 Elo = ${r2}`);

    let score1 = 0.5;
    let score2 = 0.5;
    let isDraw = true;

    if (winnerId === uids[0]) {
      score1 = 1;
      score2 = 0;
      isDraw = false;
      loserId = uids[1];
    } else if (winnerId === uids[1]) {
      score1 = 0;
      score2 = 1;
      isDraw = false;
      loserId = uids[0];
    }

    const newR1 = calculateElo(r1, r2, score1);
    const newR2 = calculateElo(r2, r1, score2);

    const delta1 = newR1 - r1;
    const delta2 = newR2 - r2;
    console.log(`[PVP BATTLE CONCLUDE] ELO deltas: P1 delta = ${delta1}, P2 delta = ${delta2}`);

    // Award variables
    let xp1 = 10, coins1 = 5;
    let xp2 = 10, coins2 = 5;

    if (!isDraw) {
      if (winnerId === uids[0]) {
        xp1 = 25; coins1 = 15;
        xp2 = 5; coins2 = 2;
      } else {
        xp1 = 5; coins1 = 2;
        xp2 = 25; coins2 = 15;
      }
    }

    // Await stats update to guarantee all user writes complete successfully
    await updateUserBattleStats(uids[0], delta1, xp1, coins1, isDraw);
    await updateUserBattleStats(uids[1], delta2, xp2, coins2, isDraw);

    // Save to battleHistory collection
    try {
      const roomDoc = await battleRef.get();
      const roomData = roomDoc.exists ? roomDoc.data() : null;
      const categoryName = roomData?.battleType || 'Mixed';
      const difficultyVal = roomData?.settings?.difficulty || 'Medium';
      const qCount = roomData?.settings?.questionsCount || 5;
      const timeLimitVal = roomData?.settings?.timeLimit || 30;

      const p1Correct = Math.round(p1.score / 20);
      const p1Wrong = Math.max(0, qCount - p1Correct);
      const p1Accuracy = Math.round((p1Correct / qCount) * 100);

      const p2Correct = Math.round(p2.score / 20);
      const p2Wrong = Math.max(0, qCount - p2Correct);
      const p2Accuracy = Math.round((p2Correct / qCount) * 100);

      const p1Name = p1Doc.exists ? (p1Doc.data()?.displayName || 'Anonymous') : 'Anonymous';
      const p1Avatar = p1Doc.exists ? (p1Doc.data()?.photoURL || '') : '';
      const p2Name = p2Doc.exists ? (p2Doc.data()?.displayName || 'Anonymous') : 'Anonymous';
      const p2Avatar = p2Doc.exists ? (p2Doc.data()?.photoURL || '') : '';

      // Create permanent history record
      await db.collection('battleHistory').add({
        battleId,
        uids: [uids[0], uids[1]],
        winnerId,
        loserId,
        isDraw,
        category: categoryName,
        battleType: categoryName,
        difficulty: difficultyVal,
        createdAt: new Date().toISOString(),
        players: {
          [uids[0]]: {
            uid: uids[0],
            displayName: p1Name,
            photoURL: p1Avatar,
            opponentUid: uids[1],
            opponentName: p2Name,
            opponentAvatar: p2Avatar,
            eloChange: delta1,
            battleRatingBefore: r1,
            battleRatingAfter: newR1,
            xpEarned: xp1,
            coinsEarned: coins1,
            score: p1.score,
            finalScore: p1.score,
            correctAnswers: p1Correct,
            wrongAnswers: p1Wrong,
            accuracy: p1Accuracy,
            averageResponseTime: timeLimitVal,
            battleDuration: qCount * timeLimitVal
          },
          [uids[1]]: {
            uid: uids[1],
            displayName: p2Name,
            photoURL: p2Avatar,
            opponentUid: uids[0],
            opponentName: p1Name,
            opponentAvatar: p1Avatar,
            eloChange: delta2,
            battleRatingBefore: r2,
            battleRatingAfter: newR2,
            xpEarned: xp2,
            coinsEarned: coins2,
            score: p2.score,
            finalScore: p2.score,
            correctAnswers: p2Correct,
            wrongAnswers: p2Wrong,
            accuracy: p2Accuracy,
            averageResponseTime: timeLimitVal,
            battleDuration: qCount * timeLimitVal
          }
        }
      });
      console.log(`[PVP BATTLE CONCLUDE] Saved to battleHistory collection successfully.`);
    } catch (historyErr) {
      console.error('Failed to log battle history:', historyErr);
    }

    // Safely delete temporary battle room document
    await battleRef.delete();
    console.log(`[PVP BATTLE CLEANUP] Temporary battle document ${battleId} deleted successfully.`);

    // Broadcast battle finished results AFTER all database writes and deletions complete successfully
    io.of('/battle').to(battleId).emit('battle_concluded', { 
      winnerId,
      playerDeltas: {
        [uids[0]]: { elo: delta1, xp: xp1, coins: coins1 },
        [uids[1]]: { elo: delta2, xp: xp2, coins: coins2 }
      }
    });
  } catch (err) {
    console.error('Error concluding battle:', err);
  }
}

// Async task to generate AI battle questions and emit details to sockets
async function prepareMatch(p1: LobbyPlayer, p2: LobbyPlayer, battleType: string) {
  const battleId = `battle_${Date.now()}`;
  
  // Notify match found is generating
  io.of('/matchmaking').to(p1.socketId).emit('match_status', { message: 'Player found! Compiling battle questions...' });
  io.of('/matchmaking').to(p2.socketId).emit('match_status', { message: 'Player found! Compiling battle questions...' });

  try {
    const systemPrompt = `You are an expert placement exam board compiling questions.`;
    const prompt = `Generate a set of exactly 5 multiple choice questions for a competitive speed PvP battle in the category "${battleType}". Difficulty should be medium.
The output MUST be a single raw JSON object conforming strictly to the schema below.

JSON Schema:
{
  "questions": [
    {
      "questionText": "Clear and challenging question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctOptionIndex": number (0-3),
      "explanation": "Brief solution explanation"
    }
  ]
}`;

    const quiz = await AIService.generateJSON<{ questions: any[] }>(prompt, systemPrompt);

    const battleData = {
      battleId,
      battleType,
      players: {
        [p1.userId]: { score: 0, progressIndex: 0, finished: false, displayName: p1.profile.displayName },
        [p2.userId]: { score: 0, progressIndex: 0, finished: false, displayName: p2.profile.displayName }
      },
      quiz: quiz.questions,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    await db.collection('battles').doc(battleId).set(battleData);

    io.of('/matchmaking').to(p1.socketId).emit('match_found', {
      battleId,
      opponent: {
        userId: p2.userId,
        displayName: p2.profile.displayName,
        level: p2.profile.level,
        rating: p2.rating,
        photoURL: p2.profile.avatar,
        equippedRing: p2.profile.equippedRing || '',
        equippedFrame: p2.profile.equippedFrame || '',
        equippedBackground: p2.profile.equippedBackground || '',
        equippedTitle: p2.profile.equippedTitle || ''
      },
      quiz: quiz.questions
    });

    io.of('/matchmaking').to(p2.socketId).emit('match_found', {
      battleId,
      opponent: {
        userId: p1.userId,
        displayName: p1.profile.displayName,
        level: p1.profile.level,
        rating: p1.rating,
        photoURL: p1.profile.avatar,
        equippedRing: p1.profile.equippedRing || '',
        equippedFrame: p1.profile.equippedFrame || '',
        equippedBackground: p1.profile.equippedBackground || '',
        equippedTitle: p1.profile.equippedTitle || ''
      },
      quiz: quiz.questions
    });
  } catch (error) {
    console.error('Failed to prepare PvP match:', error);
    io.of('/matchmaking').to(p1.socketId).emit('match_error', { message: 'Generation failed. Match aborted.' });
    io.of('/matchmaking').to(p2.socketId).emit('match_error', { message: 'Generation failed. Match aborted.' });
  }
}

// Simple connection handler for matchmaking
io.of('/matchmaking').on('connection', (socket) => {
  console.log(`Socket connected to /matchmaking: ${socket.id}`);
  
  socket.on('join_lobby', async (data: { userId: string; battleType: string; rating: number; profile: { displayName: string; level: number } }) => {
    console.log(`User ${data.userId} joined matchmaking lobby for ${data.battleType}`);
    
    // Check if there is any other user waiting in lobby for the same battleType
    let opponent: LobbyPlayer | null = null;
    for (const [uid, player] of matchmakingLobby.entries()) {
      if (player.battleType === data.battleType && uid !== data.userId) {
        opponent = player;
        break;
      }
    }

    if (opponent) {
      // Remove opponent from lobby map
      matchmakingLobby.delete(opponent.userId);
      // Construct LobbyPlayer object for current player
      const currentPlayer: LobbyPlayer = { ...data, socketId: socket.id };
      
      // Trigger match preparation
      prepareMatch(currentPlayer, opponent, data.battleType);
    } else {
      // Add user to lobby
      matchmakingLobby.set(data.userId, { ...data, socketId: socket.id });
    }
  });

  socket.on('leave_lobby', (data: { userId: string }) => {
    console.log(`User ${data.userId} left matchmaking lobby`);
    matchmakingLobby.delete(data.userId);
  });

  socket.on('disconnect', () => {
    for (const [userId, lobbyData] of matchmakingLobby.entries()) {
      if (lobbyData.socketId === socket.id) {
        matchmakingLobby.delete(userId);
        console.log(`Disconnected user ${userId} removed from lobby`);
        break;
      }
    }
  });
});

io.of('/battle').on('connection', (socket) => {
  console.log(`Socket connected to /battle: ${socket.id}`);
  
  socket.on('join_room', async (data: { battleId: string; userId: string }) => {
    socket.data = { userId: data.userId, battleId: data.battleId };
    socket.join(data.battleId);
    console.log(`User ${data.userId} joined battle room: ${data.battleId}`);

    // Matchmaking room
    if (data.battleId.startsWith('battle_')) {
      socket.to(data.battleId).emit('player_joined', { userId: data.userId });
      return;
    }

    // Friend battle lobby room
    try {
      const roomRef = db.collection('battleRooms').doc(data.battleId);
      const roomDoc = await roomRef.get();
      if (!roomDoc.exists) {
        socket.emit('room_error', { message: 'Battle room not found.' });
        return;
      }
      
      const roomData = roomDoc.data()!;
      const now = new Date();
      const expiration = new Date(roomData.expirationTime);

      if (now > expiration || roomData.status === 'expired') {
        socket.emit('room_error', { message: 'This invitation has expired.' });
        return;
      }

      if (roomData.status === 'finished') {
        socket.emit('room_error', { message: 'This battle has already concluded.' });
        return;
      }

      const players = { ...roomData.players };
      const playerIds = Object.keys(players);

      if (roomData.status === 'active') {
        if (!players[data.userId]) {
          socket.emit('room_error', { message: 'This battle is in progress. Joining blocked.' });
          return;
        }
      } else if (playerIds.length >= 2 && !players[data.userId]) {
        socket.emit('room_error', { message: 'This battle lobby is full.' });
        return;
      }

      // Add guest profile details if joining for the first time
      if (!players[data.userId]) {
        const userDoc = await db.collection('users').doc(data.userId).get();
        const userData = userDoc.exists ? userDoc.data()! : {};
        players[data.userId] = {
          uid: data.userId,
          displayName: userData.displayName || 'Anonymous Guest',
          photoURL: userData.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.userId}`,
          level: userData.level || 1,
          battleRating: userData.battleRating || 1200,
          college: userData.college || '',
          ready: false,
          online: true,
          score: 0,
          progressIndex: 0,
          finished: false,
          equippedRing: userData.equippedRing || '',
          equippedFrame: userData.equippedFrame || '',
          equippedBackground: userData.equippedBackground || '',
          equippedTitle: userData.equippedTitle || ''
        };
      } else {
        players[data.userId].online = true;
      }

      await roomRef.update({ players });
      
      // Notify details
      io.of('/battle').to(data.battleId).emit('lobby_updated', { ...roomData, players });
      socket.to(data.battleId).emit('player_joined', { userId: data.userId });
    } catch (err) {
      console.error('Error joining friend lobby:', err);
      socket.emit('room_error', { message: 'Internal error joining room.' });
    }
  });

  socket.on('toggle_ready', async (data: { battleId: string; userId: string }) => {
    try {
      const roomRef = db.collection('battleRooms').doc(data.battleId);
      const roomDoc = await roomRef.get();
      if (roomDoc.exists) {
        const roomData = roomDoc.data()!;
        const players = { ...roomData.players };
        if (players[data.userId]) {
          players[data.userId].ready = !players[data.userId].ready;
          await roomRef.update({ players });
          io.of('/battle').to(data.battleId).emit('lobby_updated', { ...roomData, players });
        }
      }
    } catch (err) {
      console.error('Error toggling ready state:', err);
    }
  });

  socket.on('start_battle_request', async (data: { battleId: string; userId: string }) => {
    try {
      const roomRef = db.collection('battleRooms').doc(data.battleId);
      const roomDoc = await roomRef.get();
      if (!roomDoc.exists) return;
      
      const roomData = roomDoc.data()!;
      if (roomData.hostUid !== data.userId) {
        socket.emit('room_error', { message: 'Only the lobby host can start the battle.' });
        return;
      }

      const players = { ...roomData.players };
      const allPlayers = Object.values(players);
      if (allPlayers.length < 2) {
        socket.emit('room_error', { message: 'Waiting for an opponent to join...' });
        return;
      }

      const allReady = allPlayers.every((p: any) => p.ready);
      if (!allReady) {
        socket.emit('room_error', { message: 'All players must be ready to start.' });
        return;
      }

      // Notify clients immediately that battle preparation has started
      io.of('/battle').to(data.battleId).emit('battle_preparing', { message: '⚔️ Preparing Battle...' });

      // Generate Questions list using Gemini AI
      const prompt = `Generate a set of exactly ${roomData.settings.questionsCount || 5} multiple choice questions for a competitive speed PvP battle in the category "${roomData.battleType}". Difficulty should be ${roomData.settings.difficulty || 'Medium'}.
The output MUST be a single raw JSON object conforming strictly to the schema below.

JSON Schema:
{
  "questions": [
    {
      "questionText": "Clear and challenging question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctOptionIndex": number (0-3),
      "explanation": "Brief solution explanation"
    }
  ]
}`;
      const systemPrompt = `You are an expert placement exam board compiling questions.`;
      const quiz = await AIService.generateJSON<{ questions: any[] }>(prompt, systemPrompt);

      await roomRef.update({
        quiz: quiz.questions,
        status: 'active'
      });

      io.of('/battle').to(data.battleId).emit('battle_starting', { quiz: quiz.questions });
    } catch (err) {
      console.error('Error starting friend battle:', err);
      socket.emit('room_error', { message: 'Failed to compile battle questions. Please try again.' });
    }
  });

  socket.on('submit_step', async (data: { battleId: string; questionIndex: number; isCorrect: boolean; score: number; userId: string; isFinal?: boolean }) => {
    socket.to(data.battleId).emit('step_update', {
      uid: data.userId,
      score: data.score,
      progressIndex: data.questionIndex,
      finished: data.isFinal || false
    });

    try {
      const collectionName = data.battleId.startsWith('battle_') ? 'battles' : 'battleRooms';
      const battleRef = db.collection(collectionName).doc(data.battleId);
      const battleDoc = await battleRef.get();
      if (battleDoc.exists) {
        const battle = battleDoc.data();
        const players = { ...battle?.players };
        if (players[data.userId]) {
          players[data.userId].score = data.score;
          players[data.userId].progressIndex = data.questionIndex;
          if (data.isFinal) {
            players[data.userId].finished = true;
          }
          await battleRef.update({ players });

          const allFinished = Object.values(players).every((p: any) => p.finished);
          if (allFinished && battle?.status === 'active') {
            await concludePvPBattle(data.battleId, battleRef, players);
          }
        }
      }
    } catch (err) {
      console.error('Error saving step to Firestore:', err);
    }
  });

  socket.on('chat_message', (data: { battleId: string; senderId: string; text: string }) => {
    socket.to(data.battleId).emit('receive_message', {
      senderId: data.senderId,
      text: data.text
    });
  });

  socket.on('disconnect', async () => {
    const { userId, battleId } = socket.data || {};
    if (userId && battleId) {
      const collectionName = battleId.startsWith('battle_') ? 'battles' : 'battleRooms';
      try {
        const roomRef = db.collection(collectionName).doc(battleId);
        const roomDoc = await roomRef.get();
        if (roomDoc.exists) {
          const roomData = roomDoc.data()!;
          const players = { ...roomData.players };
          
          if (battleId.startsWith('battle_')) {
            // Matchmaking active battle
            if (players[userId]) {
              players[userId].online = false;
              const allOffline = Object.values(players).every((p: any) => !p.online);
              if (allOffline) {
                await roomRef.delete();
                console.log(`[PVP CLEANUP] All players offline in active matchmaking battle ${battleId}. Deleted room.`);
              } else {
                await roomRef.update({ players });
              }
            }
          } else {
            // Custom friend battle lobby
            if (roomData.status === 'waiting') {
              // If the host leaves or disconnects, delete the lobby entirely!
              if (userId === roomData.hostUid) {
                await roomRef.delete();
                console.log(`[PVP CLEANUP] Host left waiting lobby ${battleId}. Deleted room.`);
                io.of('/battle').to(battleId).emit('room_error', { message: 'Lobby cancelled because the host disconnected.' });
              } else {
                // Opponent left waiting lobby, remove guest from list
                delete players[userId];
                await roomRef.update({ players });
                console.log(`[PVP CLEANUP] Guest ${userId} left waiting lobby ${battleId}. Removed player slot.`);
                io.of('/battle').to(battleId).emit('lobby_updated', { ...roomData, players });
              }
            } else if (roomData.status === 'active') {
              if (players[userId]) {
                players[userId].online = false;
                const allOffline = Object.values(players).every((p: any) => !p.online);
                if (allOffline) {
                  await roomRef.delete();
                  console.log(`[PVP CLEANUP] All players offline in active custom battle ${battleId}. Deleted room.`);
                } else {
                  await roomRef.update({ players });
                  io.of('/battle').to(battleId).emit('lobby_updated', { ...roomData, players });
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error handling player disconnect cleanup:', err);
      }
    }
  });
});

// Periodic Cloud Firestore database lifecycle sweep task
async function runAutomaticDatabaseCleanup() {
  console.log(`[AUTOMATIC CLEANUP] Starting Firestore database lifecycle optimization sweep...`);
  try {
    const now = new Date();
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
    const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const refsToDelete: any[] = [];

    // 1. Clean custom battleRooms
    const roomsSnap = await db.collection('battleRooms').get();
    roomsSnap.forEach((doc: any) => {
      const data = doc.data();
      const createdTime = data.createdTime || data.createdAt || '';
      const status = data.status || 'waiting';

      if (status === 'waiting' && createdTime && createdTime < thirtyMinsAgo) {
        refsToDelete.push(doc.ref);
      }
      else if (status === 'active' && createdTime && createdTime < tenMinsAgo) {
        refsToDelete.push(doc.ref);
      }
      else if ((status === 'expired' || status === 'finished') && createdTime && createdTime < tenMinsAgo) {
        refsToDelete.push(doc.ref);
      }
    });

    // 2. Clean matchmaking battles
    const battlesSnap = await db.collection('battles').get();
    battlesSnap.forEach((doc: any) => {
      const data = doc.data();
      const createdTime = data.createdAt || data.createdTime || '';
      const status = data.status || 'active';

      if (status === 'active' && createdTime && createdTime < tenMinsAgo) {
        refsToDelete.push(doc.ref);
      }
      else if (status === 'finished' && createdTime && createdTime < tenMinsAgo) {
        refsToDelete.push(doc.ref);
      }
    });

    // 3. Clean draft practice quizzes (results == null and older than 24 hours)
    const quizzesSnap = await db.collection('quizzes').get();
    quizzesSnap.forEach((doc: any) => {
      const data = doc.data();
      const results = data.results;
      const createdAt = data.createdAt || '';
      if (results === null && createdAt && createdAt < twentyFourHoursAgo) {
        refsToDelete.push(doc.ref);
      }
    });

    // 4. Prune notifications exceeding 100 per user
    const notifsSnap = await db.collection('notifications').get();
    const userNotifsMap = new Map<string, any[]>();
    notifsSnap.forEach((doc: any) => {
      const data = doc.data();
      const userId = data.userId;
      if (userId) {
        if (!userNotifsMap.has(userId)) {
          userNotifsMap.set(userId, []);
        }
        userNotifsMap.get(userId)!.push({
          ref: doc.ref,
          createdAt: data.createdAt || ''
        });
      }
    });

    for (const [userId, notifsList] of userNotifsMap.entries()) {
      if (notifsList.length > 100) {
        // Sort descending (newest first)
        notifsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const toPrune = notifsList.slice(100);
        toPrune.forEach(item => {
          refsToDelete.push(item.ref);
        });
      }
    }

    // 5. Commit batch deletes in chunks of 400 to prevent Firestore limit errors
    let deletionsCount = 0;
    while (refsToDelete.length > 0) {
      const chunk = refsToDelete.splice(0, 400);
      const batch = db.batch();
      chunk.forEach(ref => {
        batch.delete(ref);
        deletionsCount++;
      });
      await batch.commit();
    }

    if (deletionsCount > 0) {
      console.log(`[AUTOMATIC CLEANUP] Sweep completed. Batch deleted ${deletionsCount} obsolete document nodes.`);
    } else {
      console.log(`[AUTOMATIC CLEANUP] Sweep completed. Database is fully optimized, 0 entries pruned.`);
    }
  } catch (err) {
    console.error('[AUTOMATIC CLEANUP] Error running database sweep:', err);
  }
}

// Run cleanup every 30 minutes in the background
setInterval(runAutomaticDatabaseCleanup, 30 * 60 * 1000);

server.listen(port, () => {
  console.log(`CrackPlace AI Backend listening on port ${port}`);
});
