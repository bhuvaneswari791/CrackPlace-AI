import { create } from 'zustand';

export interface Question {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  company: string;
  questions: Question[];
  createdAt: string;
}

interface QuizState {
  currentQuiz: Quiz | null;
  currentQuestionIndex: number;
  selectedAnswers: Record<number, number>; // questionIndex -> optionIndex
  timeSpentSeconds: number;
  quizStatus: 'idle' | 'generating' | 'active' | 'finished';
  results: {
    score: number;
    correctAnswers: number;
    timeTakenSeconds: number;
    xpEarned: number;
    coinsEarned: number;
  } | null;

  startQuizGeneration: () => void;
  setQuiz: (quiz: Quiz) => void;
  selectOption: (questionIndex: number, optionIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  tickTimer: () => void;
  finishQuiz: (results: NonNullable<QuizState['results']>) => void;
  resetQuizState: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  currentQuiz: null,
  currentQuestionIndex: 0,
  selectedAnswers: {},
  timeSpentSeconds: 0,
  quizStatus: 'idle',
  results: null,

  startQuizGeneration: () => set({ 
    quizStatus: 'generating', 
    currentQuiz: null, 
    currentQuestionIndex: 0, 
    selectedAnswers: {}, 
    timeSpentSeconds: 0, 
    results: null 
  }),
  setQuiz: (quiz) => set({ currentQuiz: quiz, quizStatus: 'active' }),
  selectOption: (qIndex, oIndex) => set((state) => ({
    selectedAnswers: { ...state.selectedAnswers, [qIndex]: oIndex }
  })),
  nextQuestion: () => set((state) => ({
    currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, (state.currentQuiz?.questions.length || 1) - 1)
  })),
  prevQuestion: () => set((state) => ({
    currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0)
  })),
  tickTimer: () => set((state) => ({
    timeSpentSeconds: state.timeSpentSeconds + 1
  })),
  finishQuiz: (results) => set({ quizStatus: 'finished', results }),
  resetQuizState: () => set({ 
    currentQuiz: null, 
    currentQuestionIndex: 0, 
    selectedAnswers: {}, 
    timeSpentSeconds: 0, 
    quizStatus: 'idle', 
    results: null 
  })
}));
export default useQuizStore;
