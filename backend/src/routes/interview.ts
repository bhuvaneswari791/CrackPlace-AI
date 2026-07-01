import { Router } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth';
import { AIService } from '../services/AIService';
import { db } from '../config/firebase';
import { z } from 'zod';
import { calculateLevelFromXp, syncMissionsState, processMissionProgress, checkAndUnlockAchievements } from '../utils/gamification';

const router = Router();

const startInterviewSchema = z.object({
  dreamCompany: z.string().default('Google'),
  role: z.string().default('Software Engineer')
});

// 1. Start Mock HR Interview
router.post('/start', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const parseResult = startInterviewSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid parameters', details: parseResult.error.format() });
  }

  const { dreamCompany, role } = parseResult.data;

  try {
    // Fetch student profile info for context
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    const college = userData?.college || 'University';
    const department = userData?.department || 'Computer Science';
    const year = userData?.year || 3;

    const systemPrompt = `You are a professional HR director at ${dreamCompany} interviewing a candidate for a ${role} position.`;
    const prompt = `Start a professional mock interview for a candidate who is a ${year} year student studying ${department} at ${college}.
Ask exactly one typical behavior-based or HR interview question. Keep it concise, engaging, and realistic. 
Return the output in a clean JSON format.

JSON Schema:
{
  "question": "The interview question text"
}`;

    console.log(`[INTERVIEW API] Starting interview session for user ${req.user.uid}`);
    const result = await AIService.generateJSON(prompt, systemPrompt);

    res.json({
      question: result.question,
      chatHistory: [
        { role: 'assistant', content: result.question }
      ]
    });
  } catch (error) {
    console.error('[INTERVIEW API] Start failed:', error);
    res.status(500).json({ error: 'Failed to initiate interview. Try again.' });
  }
});

// 2. Respond and evaluate
const respondSchema = z.object({
  dreamCompany: z.string().default('Google'),
  chatHistory: z.array(z.object({
    role: z.enum(['assistant', 'user']),
    content: z.string()
  })),
  userAnswer: z.string()
});

router.post('/respond', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const parseResult = respondSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid parameters', details: parseResult.error.format() });
  }

  const { dreamCompany, chatHistory, userAnswer } = parseResult.data;
  
  // Track interview depth: typically 3-4 questions total
  const userResponsesCount = chatHistory.filter(c => c.role === 'user').length + 1;
  const isFinal = userResponsesCount >= 3; // 3 rounds of questions

  try {
    const systemPrompt = `You are an HR director at ${dreamCompany} evaluating a candidate's response.`;
    
    let prompt = `Evaluate the candidate's last answer in the following dialogue context:
---
Dialogue History:
${JSON.stringify(chatHistory)}
Candidate's Last Answer: "${userAnswer}"
---

Evaluate the answer. Review metrics like completeness, grammar, professionalism, and mapping to the STAR method (Situation, Task, Action, Result).
Also, determine if the interview is finished (isFinal is ${isFinal}).
If finished, compile a final scorecard summary.
If NOT finished, formulate the next typical behavior question.

Return ONLY a raw JSON object conforming strictly to the schema below.

JSON Schema:
{
  "finished": ${isFinal},
  "nextQuestion": "The next interview question text, or null if finished",
  "evaluation": {
    "score": number (1-100 representing rating for this answer),
    "feedback": "specific suggestions on structure or communication details",
    "improvedAnswer": "a model answer showing how to formulate it much better"
  },
  "finalScorecard": {
    "overallScore": number (1-100, only if finished, null otherwise),
    "grammarRating": number (1-100, only if finished),
    "completenessRating": number (1-100, only if finished),
    "clarityRating": number (1-100, only if finished),
    "professionalismRating": number (1-100, only if finished),
    "starMethodScore": number (1-100, rating for STAR method compliance, only if finished),
    "overallFeedback": "final concluding summary of candidate performance, only if finished"
  }
}`;

    console.log(`[INTERVIEW API] Processing round ${userResponsesCount} (isFinal: ${isFinal})`);
    const result = await AIService.generateJSON(prompt, systemPrompt);

    // If finished, calculate and award XP and Coins
    let rewards = { xp: 0, coins: 0 };
    if (result.finished && result.finalScorecard) {
      const overall = result.finalScorecard.overallScore || 70;
      rewards.xp = Math.round(overall * 1.5);
      rewards.coins = Math.round(overall * 0.8);

      // Save history record in Firestore
      const interviewSession = {
        userId: req.user.uid,
        dreamCompany,
        chatHistory: [...chatHistory, { role: 'user', content: userAnswer }],
        scorecard: result.finalScorecard,
        createdAt: new Date().toISOString()
      };

      await db.collection('mock_interviews').add(interviewSession);

      // Update User Level, XP, Coins and readiness index
      const userDocRef = db.collection('users').doc(req.user.uid);
      let leveledUp = false;
      let newLevel = 1;
      let newlyUnlockedAchievements: any[] = [];

      try {
        await db.runTransaction(async (transaction: any) => {
          const userDoc = await transaction.get(userDocRef);
          if (!userDoc.exists) return;

          const userData = userDoc.data()!;

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

          const currentXp = (userData.xp || 0) + rewards.xp;
          const currentCoins = (userData.coins || 0) + rewards.coins;
          const oldLevel = userData.level || 1;

          const levelDetails = calculateLevelFromXp(currentXp);
          newLevel = levelDetails.level;
          if (newLevel > oldLevel) {
            leveledUp = true;
          }

          const totalMockTests = (userData.stats?.totalMockTests || 0) + 1;
          const placementReadinessScore = Math.min(100, Math.round((userData.stats?.totalQuestionsSolved || 0) * 0.4 + (newLevel * 4) + (overall * 0.3)));

          // Increment missions progress
          const tempMissions = userData.missionsState || {};
          const syncedMissions = syncMissionsState(tempMissions, new Date());
          const r1 = processMissionProgress(syncedMissions, 'hr_completed', 1);
          const finalMissionsState = r1.state;

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
              totalQuestionsSolved: userData.stats?.totalQuestionsSolved || 0,
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
      } catch (err) {
        console.error('[INTERVIEW API] Transaction update failed:', err);
      }
    }

    res.json({
      ...result,
      rewards
    });
  } catch (error) {
    console.error('[INTERVIEW API] Dialogue processing failed:', error);
    res.status(500).json({ error: 'AI failed to process interview response. Try again.' });
  }
});

export default router;
