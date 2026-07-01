import React, { useState, useEffect } from 'react';
import { useQuizStore } from '../store/quizStore';
import { useAuthStore } from '../store/authStore';
import { 
  FaBrain, 
  FaCode, 
  FaDatabase, 
  FaTerminal, 
  FaClock, 
  FaCircleCheck, 
  FaCircleXmark, 
  FaCoins, 
  FaAward,
  FaChevronRight,
  FaChevronLeft
} from 'react-icons/fa6';

const CATEGORIES = [
  { id: 'Aptitude', label: 'General Aptitude', icon: <FaBrain /> },
  { id: 'DSA', label: 'Data Structures & Alg', icon: <FaCode /> },
  { id: 'DBMS', label: 'Database Systems', icon: <FaDatabase /> },
  { id: 'Operating Systems', label: 'Operating Systems', icon: <FaTerminal /> },
  { id: 'Java', label: 'Java Programming', icon: <FaCode /> },
  { id: 'Python', label: 'Python Programming', icon: <FaCode /> }
];

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const COUNTS = [5, 10, 15, 20];
const COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Zoho', 'TCS', 'Infosys'];

export const Quiz: React.FC = () => {
  const { token, updateProfile } = useAuthStore();
  const {
    currentQuiz,
    currentQuestionIndex,
    selectedAnswers,
    timeSpentSeconds,
    quizStatus,
    results,
    startQuizGeneration,
    setQuiz,
    selectOption,
    nextQuestion,
    prevQuestion,
    tickTimer,
    finishQuiz,
    resetQuizState
  } = useQuizStore();

  // Setup state
  const [selectedCategory, setSelectedCategory] = useState('Aptitude');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [selectedCount, setSelectedCount] = useState(5);
  const [selectedCompany, setSelectedCompany] = useState('');
  
  // Local UI status
  const [history, setHistory] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load Quiz History on setup
  useEffect(() => {
    if (quizStatus === 'idle' && token) {
      fetch('/api/quiz/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setHistory(data);
        })
        .catch(err => console.error('Failed to fetch quiz history:', err));
    }
  }, [quizStatus, token]);

  // Quiz active timer
  useEffect(() => {
    let timer: any;
    if (quizStatus === 'active') {
      timer = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStatus, tickTimer]);

  // Start Generation call
  const handleLaunchQuiz = async () => {
    startQuizGeneration();
    setErrorMessage(null);
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: selectedCategory,
          difficulty: selectedDifficulty,
          count: selectedCount,
          company: selectedCompany || undefined
        })
      });

      if (!response.ok) {
        throw new Error('AI Generation failed. The provider might be busy.');
      }

      const quizData = await response.json();
      setQuiz(quizData);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate quiz. Try again.');
      resetQuizState();
    }
  };

  // Submit Active Quiz call
  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;
    
    // Calculate correct answer count
    let correctCount = 0;
    currentQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    try {
      const response = await fetch(`/api/quiz/${currentQuiz.id}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          correctAnswers: correctCount,
          timeTakenSeconds: timeSpentSeconds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record quiz results.');
      }

      const resultData = await response.json();
      finishQuiz(resultData.results);
      
      // Update global profile fields locally to sync stats instantly
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            // Update authStore profile metrics
            updateProfile(data.profile);
          }
        });
    } catch (err) {
      console.error(err);
      alert('Failed to submit results. Recording offline score.');
      // Local fallback
      const score = Math.round((correctCount / currentQuiz.questions.length) * 100);
      finishQuiz({
        score,
        correctAnswers: correctCount,
        timeTakenSeconds: timeSpentSeconds,
        xpEarned: correctCount * 10,
        coinsEarned: correctCount * 5
      });
    }
  };

  // Render Time helper
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // State 1: Setup View
  if (quizStatus === 'idle') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-display font-black text-3xl text-white tracking-wide">AI Quiz Room</h1>
            <p className="text-gray-400 text-sm">Design custom AI quizzes powered by Qwen3 32B model.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-sm">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Setup Config Panel */}
          <div className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6">
            <h3 className="font-display font-bold text-base text-white border-b border-white/5 pb-3">
              Quiz Parameters
            </h3>

            {/* Category Select */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 font-display font-bold text-sm
                      ${selectedCategory === cat.id
                        ? 'border-neon-purple bg-neon-purple/10 text-white shadow-lg shadow-neon-purple/10'
                        : 'border-white/5 bg-white/[0.01] text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10'
                      }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Difficulty */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm appearance-none bg-bg-dark"
                >
                  {DIFFICULTIES.map(diff => (
                    <option key={diff} value={diff} className="bg-bg-dark capitalize">{diff}</option>
                  ))}
                </select>
              </div>

              {/* Count */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Question Count</label>
                <select
                  value={selectedCount}
                  onChange={(e) => setSelectedCount(Number(e.target.value))}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm appearance-none bg-bg-dark"
                >
                  {COUNTS.map(count => (
                    <option key={count} value={count} className="bg-bg-dark">{count} Questions</option>
                  ))}
                </select>
              </div>

              {/* Target Company */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Dream Company (Optional)</label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm appearance-none bg-bg-dark"
                >
                  <option value="" className="bg-bg-dark">None (General)</option>
                  {COMPANIES.map(company => (
                    <option key={company} value={company} className="bg-bg-dark">{company}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleLaunchQuiz}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink font-display font-bold text-sm tracking-widest text-white shadow-lg shadow-neon-purple/25 hover:shadow-neon-purple/45 transition-all duration-300 cursor-pointer"
            >
              LAUNCH AI GENERATOR
            </button>
          </div>

          {/* History Sidebar */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-display font-bold text-base text-white border-b border-white/5 pb-3">
              Quiz History
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-4">No quizzes completed yet.</p>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {history.map((h, i) => (
                  <div key={h.id || i} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-display font-bold text-xs text-white">{h.category}</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-neon-cyan">{h.difficulty}</span>
                    </div>
                    <div className="flex justify-between items-end pt-1">
                      <span className="text-[10px] text-gray-500">{new Date(h.createdAt).toLocaleDateString()}</span>
                      {h.results ? (
                        <span className="font-display font-black text-xs text-neon-green">{h.results.score}% Score</span>
                      ) : (
                        <span className="text-[10px] text-neon-pink uppercase font-bold">Unfinished</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // State 2: Loader View
  if (quizStatus === 'generating') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-fade-in">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-t-neon-purple border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-b-neon-pink border-t-transparent border-r-transparent border-l-transparent animate-spin-reverse opacity-70"></div>
        </div>
        <h2 className="font-display font-black text-xl text-white tracking-widest uppercase">Compiling MCQs</h2>
        <p className="text-xs text-purple-300 animate-pulse text-center max-w-sm">
          Connecting to OpenRouter... Fetching optimized placement questions via Qwen3-32B...
        </p>
      </div>
    );
  }

  // State 3: Active Quiz Workspace
  if (quizStatus === 'active' && currentQuiz) {
    const questions = currentQuiz.questions;
    const currentQuestion = questions[currentQuestionIndex];
    const progressPercent = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-24 md:pb-0">
        {/* Quiz Info Header */}
        <div className="flex justify-between items-center px-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neon-cyan">{currentQuiz.category} • {currentQuiz.difficulty}</span>
            <h2 className="font-display font-black text-lg text-white">Question {currentQuestionIndex + 1} of {questions.length}</h2>
          </div>
          {/* Active Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neon-pink/20 bg-neon-pink/5 text-neon-pink font-mono font-bold text-sm shadow-md shadow-neon-pink/5">
            <FaClock className="w-4 h-4" />
            <span>{formatTime(timeSpentSeconds)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-neon-purple to-neon-pink" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Question Panel */}
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <p className="font-display font-bold text-base md:text-lg text-white leading-relaxed">
            {currentQuestion.questionText}
          </p>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => selectOption(currentQuestionIndex, idx)}
                  className={`w-full p-4 rounded-xl border text-left font-sans text-sm cursor-pointer transition-all duration-300 flex justify-between items-center
                    ${isSelected
                      ? 'border-neon-purple bg-neon-purple/15 text-white shadow-inner shadow-neon-purple/10'
                      : 'border-white/5 bg-white/[0.01] text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/10'
                    }`}
                >
                  <span>{opt}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px]
                    ${isSelected 
                      ? 'border-neon-purple bg-neon-purple text-white' 
                      : 'border-white/20'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-16 left-0 right-0 z-20 flex justify-between items-center px-6 py-4 border-t border-white/5 bg-bg-dark/95 backdrop-blur-xl md:static md:p-0 md:bg-transparent md:border-0 md:px-2 md:mt-6">
          <button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-all text-sm font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FaChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={nextQuestion}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-all text-sm font-semibold cursor-pointer"
            >
              <span>Next</span>
              <FaChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-green to-neon-cyan text-white shadow-lg shadow-neon-green/20 hover:shadow-neon-green/45 active:scale-98 transition-all font-display font-bold text-sm tracking-wider cursor-pointer"
            >
              SUBMIT ANSWERS
            </button>
          )}
        </div>
      </div>
    );
  }

  // State 4: Scoreboard Results
  if (quizStatus === 'finished' && results && currentQuiz) {
    const isPassing = results.score >= 50;

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* Title */}
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-neon-cyan">Quiz Terminated</span>
          <h1 className="font-display font-black text-3xl text-white tracking-wide mt-1">Placement Scorecard</h1>
        </div>

        {/* Dynamic Rewards & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Placement Score</span>
            <div className={`font-display font-black text-4xl ${isPassing ? 'text-neon-green' : 'text-neon-pink'}`}>
              {results.score}%
            </div>
            <span className="text-[10px] text-gray-400">{results.correctAnswers} / {currentQuiz.questions.length} Correct</span>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">XP Earned</span>
            <div className="font-display font-black text-4xl text-neon-purple flex items-center gap-2">
              <FaAward className="w-8 h-8 text-neon-purple" />
              <span>+{results.xpEarned}</span>
            </div>
            <span className="text-[10px] text-gray-400">Cadet Level Progressed</span>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Coins Gained</span>
            <div className="font-display font-black text-4xl text-yellow-400 flex items-center gap-2">
              <FaCoins className="w-8 h-8 text-yellow-500" />
              <span>+{results.coinsEarned}</span>
            </div>
            <span className="text-[10px] text-gray-400">Added to Store Balance</span>
          </div>
        </div>

        {/* Detailed Answers Review */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-base text-white border-b border-white/5 pb-3 px-2">
            Question Review & Solutions
          </h3>

          <div className="space-y-4">
            {currentQuiz.questions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correctOptionIndex;

              return (
                <div key={idx} className="glass-panel p-6 rounded-2xl border-l-4 space-y-4 border-l-gray-700">
                  <div className="flex justify-between items-start gap-4">
                    <p className="font-display font-bold text-sm md:text-base text-white leading-relaxed">
                      {idx + 1}. {q.questionText}
                    </p>
                    <div className="shrink-0 pt-0.5">
                      {isCorrect ? (
                        <FaCircleCheck className="w-5 h-5 text-neon-green" />
                      ) : (
                        <FaCircleXmark className="w-5 h-5 text-neon-pink" />
                      )}
                    </div>
                  </div>

                  {/* Answers Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className={`p-3 rounded-lg border flex items-center justify-between
                      ${isCorrect 
                        ? 'border-neon-green/30 bg-neon-green/5 text-neon-green' 
                        : 'border-neon-pink/30 bg-neon-pink/5 text-neon-pink'
                      }`}
                    >
                      <span>Your Answer: {userAns !== undefined ? q.options[userAns] : 'Not Answered'}</span>
                    </div>

                    {!isCorrect && (
                      <div className="p-3 rounded-lg border border-neon-green/30 bg-neon-green/5 text-neon-green flex items-center">
                        <span>Correct Answer: {q.options[q.correctOptionIndex]}</span>
                      </div>
                    )}
                  </div>

                  {/* Explanation Toggle */}
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 text-xs text-gray-400">
                    <strong className="text-white block mb-1">Explanation:</strong>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={resetQuizState}
            className="flex-1 py-3.5 rounded-xl border border-white/10 hover:border-white/25 bg-white/[0.02] hover:bg-white/[0.05] transition-all font-display font-bold text-sm uppercase tracking-wider cursor-pointer text-center"
          >
            Retake Another Quiz
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Quiz;
