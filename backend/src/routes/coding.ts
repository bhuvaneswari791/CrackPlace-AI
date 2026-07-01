import { Router } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth';
import { AIService } from '../services/AIService';
import { db } from '../config/firebase';
import { z } from 'zod';
import { calculateLevelFromXp, syncMissionsState, processMissionProgress, checkAndUnlockAchievements } from '../utils/gamification';

const router = Router();

const generateCodingSchema = z.object({
  category: z.string().default('Arrays'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('easy')
});

interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

interface CodingProblem {
  title: string;
  description: string;
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
  sampleCases: TestCase[];
  hiddenCases: TestCase[];
  starterCode: {
    python: string;
    java: string;
    javascript: string;
    cpp: string;
  };
}

// 1. Generate coding challenge
router.post('/generate', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const parseResult = generateCodingSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid parameters', details: parseResult.error.format() });
  }

  const { category, difficulty } = parseResult.data;

  try {
    const systemPrompt = `You are a Google/Meta software engineer interviewer. Your task is to output coding challenges in raw JSON format.`;
    const prompt = `Generate a coding problem for the category "${category}" with "${difficulty}" difficulty.
The output MUST be a single raw JSON object conforming strictly to the schema below.

JSON Schema:
{
  "title": "Problem Title",
  "description": "Clear and detailed problem description, using markdown for code blocks or math formatting.",
  "constraints": ["Constraint 1 (e.g. 1 <= nums.length <= 10^5)", "Constraint 2"],
  "inputFormat": "Description of input format",
  "outputFormat": "Description of output format",
  "sampleCases": [
    { "input": "sample input", "output": "sample output", "explanation": "optional explanation of sample case" }
  ],
  "hiddenCases": [
    { "input": "hidden case 1", "output": "expected output 1" },
    { "input": "hidden case 2", "output": "expected output 2" },
    { "input": "hidden case 3", "output": "expected output 3" }
  ],
  "starterCode": {
    "python": "starter code string (e.g. def solve(self, ...):\\n    pass)",
    "java": "starter code string (e.g. class Solution {\\n    public ...\\n})",
    "javascript": "starter code string (e.g. function solve(...) {\\n\\n})",
    "cpp": "starter code string (e.g. class Solution {\\npublic:\\n    ...\\n};)"
  }
}`;

    console.log(`[CODING API] Requesting coding problem for category ${category} (${difficulty})`);
    const problem = await AIService.generateJSON<CodingProblem>(prompt, systemPrompt);

    // Save problem session details to Firestore (without revealing hidden cases directly to frontend)
    const problemData = {
      userId: req.user.uid,
      category,
      difficulty,
      title: problem.title,
      description: problem.description,
      constraints: problem.constraints,
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat,
      sampleCases: problem.sampleCases,
      hiddenCases: problem.hiddenCases, // cached securely in Firestore
      starterCode: problem.starterCode,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('coding_problems').add(problemData);

    // Return to client, omitting hiddenCases to prevent front-end cheat-inspecting
    const { hiddenCases, ...clientProblem } = problemData;
    
    res.json({
      problemId: docRef.id,
      ...clientProblem
    });
  } catch (error) {
    console.error('[CODING API] Generation failed:', error);
    res.status(500).json({ error: 'AI Coding Generator failed. Try again.' });
  }
});

// 2. Run code against test cases (using Kimi K2.6 model code simulation)
const runCodeSchema = z.object({
  problemId: z.string(),
  code: z.string(),
  language: z.enum(['python', 'java', 'javascript', 'cpp'])
});

router.post('/run', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const parseResult = runCodeSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid compilation parameters', details: parseResult.error.format() });
  }

  const { problemId, code, language } = parseResult.data;

  try {
    const problemDoc = await db.collection('coding_problems').doc(problemId).get();
    if (!problemDoc.exists) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const problemData = problemDoc.data() as CodingProblem;

    // Combine sample and hidden cases for evaluation
    const allCases = [...problemData.sampleCases, ...problemData.hiddenCases];

    const systemPrompt = `You are a high-performance code compiler and test-case runner. Your job is to simulate code execution and output JSON results.`;
    const prompt = `Review the following ${language} code written to solve the challenge "${problemData.title}".
Problem Constraints: ${JSON.stringify(problemData.constraints)}

Code Submitted:
\`\`\`${language}
${code}
\`\`\`

Evaluate this code against these test cases:
${JSON.stringify(allCases)}

Determine if the code compiles, executes within constraints, and handles all cases correctly.
Return ONLY a raw JSON object conforming strictly to the schema below.

JSON Schema:
{
  "passed": true | false (true only if ALL test cases pass),
  "output": "stdout logs of the execution",
  "error": "compilation or runtime error text, or null if successful",
  "testCaseResults": [
    {
      "input": "input evaluated",
      "expected": "expected output",
      "actual": "actual output produced by code",
      "passed": true | false
    }
  ]
}`;

    console.log(`[CODING API] Simulating execution for problem: ${problemData.title} in ${language}`);
    const result = await AIService.generateJSON(prompt, systemPrompt);

    // If passed, award user coins/XP and update problem count
    let rewards = { xp: 0, coins: 0 };
    if (result.passed) {
      let multiplier = 1;
      if (problemDoc.data()?.difficulty === 'medium') multiplier = 1.5;
      if (problemDoc.data()?.difficulty === 'hard') multiplier = 2;

      rewards.xp = Math.round(15 * multiplier);
      rewards.coins = Math.round(10 * multiplier);

      // Increment stats in user profile
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

          const totalQuestionsSolved = (userData.stats?.totalQuestionsSolved || 0) + 1;
          const placementReadinessScore = Math.min(100, Math.round((totalQuestionsSolved * 0.4) + (newLevel * 4) + 20));

          // Increment missions progress
          const tempMissions = userData.missionsState || {};
          const syncedMissions = syncMissionsState(tempMissions, new Date());
          const r1 = processMissionProgress(syncedMissions, 'coding_completed', 1);
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
              totalQuestionsSolved,
              totalMockTests: userData.stats?.totalMockTests || 0,
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
            'stats.totalQuestionsSolved': totalQuestionsSolved
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
        console.error('[CODING API] Transaction update failed:', err);
      }
    }

    res.json({
      ...result,
      rewards
    });
  } catch (error) {
    console.error('[CODING API] Execution simulation failed:', error);
    res.status(500).json({ error: 'Code execution simulation failed. Please try again.' });
  }
});

// 3. AI Code Review
router.post('/review', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const parseResult = runCodeSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid parameters', details: parseResult.error.format() });
  }

  const { problemId, code, language } = parseResult.data;

  try {
    const problemDoc = await db.collection('coding_problems').doc(problemId).get();
    if (!problemDoc.exists) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const problemData = problemDoc.data() as CodingProblem;

    const systemPrompt = `You are a principal software engineer and expert code reviewer. You output review reports in raw JSON.`;
    const prompt = `Review this code for problem "${problemData.title}".
Problem description: ${problemData.description}
Constraints: ${JSON.stringify(problemData.constraints)}

Code Submitted:
\`\`\`${language}
${code}
\`\`\`

Perform static analysis. Estimate time/space complexity, grade readability and optimization, and provide advice.
Return ONLY a raw JSON object conforming strictly to the schema below.

JSON Schema:
{
  "timeComplexity": "O(N) | O(log N) etc",
  "spaceComplexity": "O(1) | O(N) etc",
  "qualityScore": number (1-100),
  "readabilityComments": "feedback on naming, structure, formatting",
  "optimizationComments": "feedback on efficiency, redundant calculations, memory allocations",
  "optimalSolutionExplanation": "brief description of how to solve this optimally",
  "editorialCode": "fully written optimal solution code in this language"
}`;

    console.log(`[CODING API] Performing AI Code Review for problem: ${problemData.title}`);
    const review = await AIService.generateJSON(prompt, systemPrompt);

    res.json(review);
  } catch (error) {
    console.error('[CODING API] Review failed:', error);
    res.status(500).json({ error: 'AI Code Review failed. Please try again.' });
  }
});

export default router;
