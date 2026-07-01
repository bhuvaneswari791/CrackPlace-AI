import { Router } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth';
import { AIService } from '../services/AIService';
import { db } from '../config/firebase';
import { z } from 'zod';
import { calculateLevelFromXp, getXpRequiredForLevel, syncMissionsState, processMissionProgress, checkAndUnlockAchievements } from '../utils/gamification';

const router = Router();

const generateQuizSchema = z.object({
  category: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  count: z.number().min(5).max(30),
  language: z.string().default('English'),
  company: z.string().optional()
});

interface MCQQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

router.post('/generate', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const parseResult = generateQuizSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid parameters', details: parseResult.error.format() });
  }

  const { category, difficulty, count, language, company } = parseResult.data;

  try {
    const systemPrompt = `You are a strict technical placement examiner. Your task is to output multiple choice questions (MCQs) in raw JSON format.`;
    
    let prompt = `Generate exactly ${count} unique multiple choice questions (MCQs) for the topic "${category}".
Difficulty level: ${difficulty}.
Target exam style: ${company ? `${company} hiring test pattern` : 'General placement test pattern'}.
Language: ${language}.

Each question must have exactly 4 choices under the "options" array.
The response MUST be a JSON array of objects conforming to the schema below.

JSON Schema:
[
  {
    "questionText": "string - clear and concise question",
    "options": ["string", "string", "string", "string"],
    "correctOptionIndex": number - 0-indexed number representing the correct index in options,
    "explanation": "string - reasoning behind the correct option"
  }
]`;

    console.log(`[QUIZ API] Querying AI for custom quiz: ${category} (${difficulty}), count: ${count}`);
    const questions = await AIService.generateJSON<MCQQuestion[]>(prompt, systemPrompt);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid JSON structure returned by AI');
    }

    const quizData = {
      userId: req.user.uid,
      category,
      difficulty,
      language,
      company: company || 'General',
      questions: questions.map((q) => ({
        questionText: q.questionText || '',
        options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
        correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
        explanation: q.explanation || ''
      })),
      results: null,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('quizzes').add(quizData);

    res.json({
      id: docRef.id,
      quizId: docRef.id,
      ...quizData
    });
  } catch (error: any) {
    console.error('[QUIZ API] Generation failed:', error);
    res.status(500).json({ error: 'AI Quiz Generation failed. Please try again.' });
  }
});

// Update quiz score upon completion
const updateQuizSchema = z.object({
  correctAnswers: z.number(),
  timeTakenSeconds: z.number()
});

router.post('/:quizId/results', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { quizId } = req.params;
  console.log(`[QUIZ API] Recording results for quiz: ${quizId} for user: ${req.user.uid}`);
  const parseResult = updateQuizSchema.safeParse(req.body);
  
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid results payload', details: parseResult.error.format() });
  }

  const { correctAnswers, timeTakenSeconds } = parseResult.data;

  try {
    const quizDocRef = db.collection('quizzes').doc(quizId);
    const quizDoc = await quizDocRef.get();

    if (!quizDoc.exists) {
      console.warn(`[QUIZ API] Quiz not found in database: ${quizId}`);
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quizData = quizDoc.data();
    if (quizData?.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    const questionCount = quizData.questions.length;
    const score = Math.round((correctAnswers / questionCount) * 100);

    let multiplier = 1;
    if (quizData.difficulty === 'medium') multiplier = 1.5;
    if (quizData.difficulty === 'hard') multiplier = 2;

    const xpEarned = Math.round(correctAnswers * 10 * multiplier);
    const coinsEarned = Math.round(correctAnswers * 5 * multiplier);

    const results = {
      score,
      correctAnswers,
      timeTakenSeconds,
      xpEarned,
      coinsEarned
    };

    const userDocRef = db.collection('users').doc(req.user.uid);
    let leveledUp = false;
    let newLevel = 1;
    let newlyUnlockedAchievements: any[] = [];

    await db.runTransaction(async (transaction: any) => {
      const userDoc = await transaction.get(userDocRef);
      const quizDocSnapshot = await transaction.get(quizDocRef);

      if (!quizDocSnapshot.exists) {
        throw new Error('Quiz not found');
      }

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

      // Calculate streak triggers
      const tzOffset = 5.5 * 60 * 60 * 1000; // IST Timezone (UTC+5:30)
      const todayStr = new Date(Date.now() + tzOffset).toISOString().split('T')[0];
      const yesterdayStr = new Date(Date.now() + tzOffset - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let dailyStreak = userData.dailyStreak || 0;
      let longestStreak = userData.longestStreak || 0;
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

      const currentXp = (userData.xp || 0) + xpEarned;
      const currentCoins = (userData.coins || 0) + coinsEarned;
      const oldLevel = userData.level || 1;

      const levelDetails = calculateLevelFromXp(currentXp);
      newLevel = levelDetails.level;
      if (newLevel > oldLevel) {
        leveledUp = true;
      }

      const totalQuestionsSolved = (userData.stats?.totalQuestionsSolved || 0) + questionCount;
      const totalMockTests = (userData.stats?.totalMockTests || 0) + 1;
      const placementReadinessScore = Math.min(100, Math.round((totalQuestionsSolved * 0.4) + (newLevel * 4) + (score * 0.2)));

      // Increment missions progress
      const tempMissions = userData.missionsState || {};
      const syncedMissions = syncMissionsState(tempMissions, new Date());
      const r1 = processMissionProgress(syncedMissions, 'questions_solved', questionCount);
      const r2 = processMissionProgress(r1.state, 'quiz_completed', 1);
      const finalMissionsState = r2.state;

      // Check achievements
      let finalXp = currentXp;
      let finalCoins = currentCoins;
      let finalLevel = newLevel;
      let unlockedAchievementsList = userData.unlockedAchievements || [];

      const tempUserStats = {
        xp: finalXp,
        coins: finalCoins,
        level: finalLevel,
        dailyStreak,
        longestStreak,
        placementReadinessScore,
        stats: {
          totalQuestionsSolved,
          totalMockTests,
          totalBattlesWon: userData.stats?.totalBattlesWon || 0
        },
        unlockedAchievements: unlockedAchievementsList
      };

      const achDetails = checkAndUnlockAchievements(tempUserStats);
      if (achDetails.newlyUnlocked.length > 0) {
        finalXp += achDetails.xpGranted;
        finalCoins += achDetails.coinsGranted;
        
        const finalLevelDetails = calculateLevelFromXp(finalXp);
        finalLevel = finalLevelDetails.level;
        unlockedAchievementsList = achDetails.unlockedList;
        newlyUnlockedAchievements = achDetails.newlyUnlocked;
        if (finalLevel > oldLevel) {
          leveledUp = true;
          newLevel = finalLevel;
        }
      }

      transaction.update(quizDocRef, { results });
      transaction.update(userDocRef, {
        xp: finalXp,
        coins: finalCoins,
        level: finalLevel,
        dailyStreak,
        longestStreak,
        lastActiveDate,
        placementReadinessScore,
        missionsState: finalMissionsState,
        unlockedAchievements: unlockedAchievementsList,
        'stats.totalQuestionsSolved': totalQuestionsSolved,
        'stats.totalMockTests': totalMockTests
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

    res.json({
      message: 'Quiz results recorded successfully',
      results
    });
  } catch (error) {
    console.error('[QUIZ API] Result update failed:', error);
    res.status(500).json({ error: 'Failed to record quiz results.' });
  }
});

// Fetch quiz history (In-memory sorting prevents composite indexing issues during local run)
router.get('/history', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const snapshot = await db.collection('quizzes')
      .where('userId', '==', req.user.uid)
      .get();

    const quizzes: any[] = [];
    snapshot.forEach((doc: any) => {
      quizzes.push({ id: doc.id, ...doc.data() });
    });

    // In-memory sort by date desc, then slice to top 10
    quizzes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const recentQuizzes = quizzes.slice(0, 10);

    res.json(recentQuizzes);
  } catch (error) {
    console.error('[QUIZ API] Failed to fetch history:', error);
    res.status(500).json({ error: 'Failed to retrieve quiz history.' });
  }
});

export default router;
