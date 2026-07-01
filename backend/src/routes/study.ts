import { Router } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth';
import { AIService } from '../services/AIService';
import { db } from '../config/firebase';
import { z } from 'zod';

const router = Router();

const generateNotesSchema = z.object({
  category: z.string(),
  topic: z.string(),
  subtopic: z.string().optional().default(''),
  depth: z.enum(['cheat_sheet', 'detailed'])
});

interface MCQSelfTestQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

interface StudyNotesResponse {
  title: string;
  notesMarkdown: string;
  questions: MCQSelfTestQuestion[];
}

// Generate new study notes using AI and save to Firestore
router.post('/notes/generate', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const parseResult = generateNotesSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid parameters', details: parseResult.error.format() });
  }

  const { category, topic, subtopic, depth } = parseResult.data;

  try {
    const systemPrompt = `You are an elite technical placement trainer and computer science professor. 
Your goal is to generate exceptionally structured, detailed study notes/cheat sheets and matching review questions in strict raw JSON format.`;

    const detailInstruction = depth === 'cheat_sheet' 
      ? 'A quick reference cheat sheet containing key summary definitions, syntax, time complexity, and core formulas.'
      : 'A detailed conceptual guide explaining architecture, edge cases, implementation patterns, step-by-step algorithms, and clear examples.';

    const prompt = `Create comprehensive placement study notes for:
Topic: "${topic}"
Category: "${category}" (e.g., DSA, DBMS, Operating Systems, Aptitude)
Subtopic focus: "${subtopic || 'General Overview'}"
Format style: ${detailInstruction}

The notes content MUST use clean Markdown (headers, code snippets, key bullet lists, bold highlights) and be returned under "notesMarkdown".

Also, compile exactly 3 multiple choice questions (MCQs) to self-test understanding of this note. Each question must have exactly 4 choices and a brief explanation.

Output the result strictly as a single JSON object matching this schema:
{
  "title": "Title of the study note (e.g. Master Binary Search)",
  "notesMarkdown": "Full notes text in Markdown",
  "questions": [
    {
      "questionText": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctOptionIndex": 0,
      "explanation": "Brief explanation"
    }
  ]
}`;

    const aiResult = await AIService.generateJSON<StudyNotesResponse>(prompt, systemPrompt);

    if (!aiResult.title || !aiResult.notesMarkdown || !aiResult.questions) {
      throw new Error('AI response structure is invalid.');
    }

    const noteId = `note_${Date.now()}`;
    const newNote = {
      noteId,
      uid: req.user.uid,
      category,
      topic,
      subtopic: subtopic || 'Overview',
      title: aiResult.title,
      content: aiResult.notesMarkdown,
      questions: aiResult.questions,
      isFavorite: false,
      createdTime: new Date().toISOString()
    };

    // Save to Firestore
    await db.collection('studyNotes').doc(noteId).set(newNote);

    res.json({ message: 'Study note generated successfully', note: newNote });
  } catch (error: any) {
    console.error('Study notes generation failed:', error);
    res.status(500).json({ error: error.message || 'Failed to generate study notes.' });
  }
});

// Retrieve all saved study notes for the active user
router.get('/notes', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const notesSnapshot = await db.collection('studyNotes')
      .where('uid', '==', req.user.uid)
      .get();

    const notesList: any[] = [];
    notesSnapshot.forEach((doc: any) => {
      notesList.push(doc.data());
    });

    // Sort by createdTime descending
    notesList.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());

    res.json({ notes: notesList });
  } catch (error: any) {
    console.error('Failed to fetch study notes:', error);
    res.status(500).json({ error: 'Failed to retrieve study notes.' });
  }
});

// Toggle favorite state
router.post('/notes/:noteId/favorite', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { noteId } = req.params;

  try {
    const noteRef = db.collection('studyNotes').doc(noteId);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) {
      return res.status(404).json({ error: 'Study note not found' });
    }

    const noteData = noteDoc.data()!;
    if (noteData.uid !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const newFavState = !noteData.isFavorite;
    await noteRef.update({ isFavorite: newFavState });

    res.json({ message: 'Favorite state updated', isFavorite: newFavState });
  } catch (error: any) {
    console.error('Failed to toggle note favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite.' });
  }
});

// Delete a study note
router.delete('/notes/:noteId', verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { noteId } = req.params;

  try {
    const noteRef = db.collection('studyNotes').doc(noteId);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) {
      return res.status(404).json({ error: 'Study note not found' });
    }

    const noteData = noteDoc.data()!;
    if (noteData.uid !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await noteRef.delete();

    res.json({ message: 'Study note deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete study note:', error);
    res.status(500).json({ error: 'Failed to delete study note.' });
  }
});

export default router;
