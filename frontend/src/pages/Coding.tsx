import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  FaTerminal, 
  FaPlay, 
  FaRobot, 
  FaCircleCheck, 
  FaCircleXmark, 
  FaTriangleExclamation,
  FaArrowRotateLeft,
  FaAward
} from 'react-icons/fa6';

const CATEGORIES = ['Arrays', 'Strings', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Graphs', 'Dynamic Programming', 'SQL'];
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

interface CodingProblem {
  problemId: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
  sampleCases: TestCase[];
  starterCode: {
    python: string;
    java: string;
    javascript: string;
    cpp: string;
  };
}

interface TestResult {
  passed: boolean;
  output: string;
  error: string | null;
  testCaseResults?: {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }[];
  rewards?: {
    xp: number;
    coins: number;
  };
}

interface AIReview {
  timeComplexity: string;
  spaceComplexity: string;
  qualityScore: number;
  readabilityComments: string;
  optimizationComments: string;
  optimalSolutionExplanation: string;
  editorialCode: string;
}

export const Coding: React.FC = () => {
  const { token, updateProfile } = useAuthStore();
  
  // Setup parameters
  const [selectedCategory, setSelectedCategory] = useState('Arrays');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [language, setLanguage] = useState<'python' | 'java' | 'javascript' | 'cpp'>('python');

  // Work states
  const [status, setStatus] = useState<'idle' | 'generating' | 'active'>('idle');
  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Run/Review Results states
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<TestResult | null>(null);
  
  const [reviewing, setReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<AIReview | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Sync starter code when language changes or problem loads
  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode[language] || '');
      setRunResult(null);
    }
  }, [language, problem]);

  const handleLaunchChallenge = async () => {
    setStatus('generating');
    setErrorMessage(null);
    setProblem(null);
    setRunResult(null);
    setReviewResult(null);
    try {
      const response = await fetch('/api/coding/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: selectedCategory,
          difficulty: selectedDifficulty
        })
      });

      if (!response.ok) {
        throw new Error('AI failed to compile problem parameters.');
      }

      const problemData = await response.json();
      setProblem(problemData);
      setStatus('active');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to start coding challenge. Try again.');
      setStatus('idle');
    }
  };

  const handleRunCode = async () => {
    if (!problem) return;
    setRunning(true);
    setRunResult(null);
    try {
      const response = await fetch('/api/coding/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: problem.problemId,
          code,
          language
        })
      });

      if (!response.ok) {
        throw new Error('Code execution simulation failed.');
      }

      const result = await response.json();
      setRunResult(result);

      // If user successfully solved the problem, trigger local stats update
      if (result.passed) {
        fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.profile) updateProfile(data.profile);
          });
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Execution error occurred.');
    } finally {
      setRunning(false);
    }
  };

  const handleTriggerReview = async () => {
    if (!problem) return;
    setReviewing(true);
    setReviewResult(null);
    setShowReviewModal(true);
    try {
      const response = await fetch('/api/coding/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: problem.problemId,
          code,
          language
        })
      });

      if (!response.ok) {
        throw new Error('AI Code Review failed.');
      }

      const review = await response.json();
      setReviewResult(review);
    } catch (err: any) {
      console.error(err);
      setReviewResult(null);
      setShowReviewModal(false);
      alert(err.message || 'Review failed.');
    } finally {
      setReviewing(false);
    }
  };

  // State 1: Idle Setup
  if (status === 'idle') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-display font-black text-3xl text-white tracking-wide">AI Coding Arena</h1>
          <p className="text-gray-400 text-sm">Challenge yourself with custom algorithmic coding problems evaluated by Kimi K2.6.</p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-sm">
            {errorMessage}
          </div>
        )}

        <div className="max-w-2xl glass-panel p-8 rounded-3xl space-y-6">
          <h3 className="font-display font-bold text-base text-white border-b border-white/5 pb-3">
            Arena Setup
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Topic</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm appearance-none bg-bg-dark"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-bg-dark">{cat}</option>
                ))}
              </select>
            </div>

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
          </div>

          <button
            onClick={handleLaunchChallenge}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan font-display font-bold text-sm tracking-widest text-white shadow-lg shadow-neon-purple/20 hover:shadow-neon-purple/40 transition-all duration-300 cursor-pointer"
          >
            LAUNCH ARENA CHALLENGE
          </button>
        </div>
      </div>
    );
  }

  // State 2: Generating Loading View
  if (status === 'generating') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-fade-in">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-t-neon-cyan border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-b-neon-purple border-t-transparent border-r-transparent border-l-transparent animate-spin-reverse opacity-70"></div>
        </div>
        <h2 className="font-display font-black text-xl text-white tracking-widest uppercase">Generating Challenge</h2>
        <p className="text-xs text-cyan-300 animate-pulse text-center max-w-sm">
          Interfacing with AI workspace modules... Formulating custom constraints and test suites...
        </p>
      </div>
    );
  }

  // State 3: Active Workspace
  return (
    <div className="h-auto lg:h-[calc(100vh-140px)] flex flex-col gap-6 animate-fade-in pb-16 lg:pb-0">
      {/* Workspace Header */}
      <div className="flex justify-between items-center px-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neon-cyan">{problem?.category} • {problem?.difficulty}</span>
          <h1 className="font-display font-black text-xl text-white tracking-wide mt-0.5">{problem?.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="glass-input px-4 py-2.5 rounded-xl text-xs appearance-none bg-bg-dark font-display font-bold cursor-pointer border-neon-purple/30"
          >
            <option value="python" className="bg-bg-dark">Python 3</option>
            <option value="javascript" className="bg-bg-dark">JavaScript (ES6)</option>
            <option value="java" className="bg-bg-dark">Java 17</option>
            <option value="cpp" className="bg-bg-dark">C++ (GCC)</option>
          </select>
          <button
            onClick={() => setStatus('idle')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            <FaArrowRotateLeft className="w-3.5 h-3.5" />
            <span>Abandon</span>
          </button>
        </div>
      </div>

      {/* Pane Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Left Panel: Problem Details */}
        <div className="glass-panel p-6 rounded-3xl overflow-y-auto space-y-6 flex flex-col min-h-0">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-neon-purple border-b border-white/5 pb-2">
              Problem Description
            </h3>
            <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
              {problem?.description}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white/50">Constraints</h3>
            <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1.5">
              {problem?.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
              <strong className="text-white block font-display">Input Format:</strong>
              <span className="text-gray-400">{problem?.inputFormat}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
              <strong className="text-white block font-display">Output Format:</strong>
              <span className="text-gray-400">{problem?.outputFormat}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white/50">Sample Test Cases</h3>
            <div className="space-y-3">
              {problem?.sampleCases.map((tc, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong className="text-neon-cyan block font-mono mb-1">Input:</strong>
                      <pre className="bg-bg-dark/40 p-2.5 rounded-lg font-mono text-gray-300 overflow-x-auto">{tc.input}</pre>
                    </div>
                    <div>
                      <strong className="text-neon-purple block font-mono mb-1">Output:</strong>
                      <pre className="bg-bg-dark/40 p-2.5 rounded-lg font-mono text-gray-300 overflow-x-auto">{tc.output}</pre>
                    </div>
                  </div>
                  {tc.explanation && (
                    <p className="text-gray-500 italic text-[11px] pt-1">
                      <strong>Explanation:</strong> {tc.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Editor & Console */}
        <div className="flex flex-col gap-4 min-h-0 mt-6 lg:mt-0">
          {/* Editor Container */}
          <div className="flex-1 glass-panel rounded-3xl flex flex-col overflow-hidden min-h-[350px] lg:min-h-0 relative">
            <div className="px-6 py-3 border-b border-white/5 bg-white/[0.01] flex justify-between items-center text-xs text-gray-400 font-mono">
              <span>editor.workspace.{language}</span>
              <span className="text-neon-cyan uppercase font-bold tracking-widest">Active Coding session</span>
            </div>
            
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 p-6 font-mono text-sm text-gray-300 bg-transparent resize-none focus:outline-none leading-relaxed select-text"
            />

            {/* Actions Bar */}
            <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01] flex justify-end gap-3">
              <button
                onClick={handleTriggerReview}
                disabled={running || reviewing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-neon-purple/5 hover:border-neon-purple/20 transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer text-neon-purple disabled:opacity-50"
              >
                <FaRobot className="w-3.5 h-3.5" />
                <span>AI Review</span>
              </button>

              <button
                onClick={handleRunCode}
                disabled={running || reviewing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-lg shadow-neon-cyan/15 hover:shadow-neon-cyan/35 active:scale-98 transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                <FaPlay className="w-3.5 h-3.5" />
                <span>{running ? 'Executing...' : 'Run Code'}</span>
              </button>
            </div>
          </div>

          {/* Console Output Panel */}
          <div className="h-48 glass-panel p-4 rounded-3xl flex flex-col min-h-0 overflow-hidden">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-neon-cyan border-b border-white/5 pb-2 mb-2 flex items-center gap-2">
              <FaTerminal className="w-3.5 h-3.5" />
              <span>Compilation Console</span>
            </h4>
            
            <div className="flex-1 overflow-y-auto font-mono text-xs pr-1">
              {!runResult && !running && (
                <p className="text-gray-600 italic">No execution logs. Click "Run Code" above.</p>
              )}
              {running && (
                <p className="text-neon-cyan animate-pulse">Running compilation checks against all test suites...</p>
              )}
              {runResult && (
                <div className="space-y-3">
                  {/* General Result Header */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {runResult.passed ? (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green font-bold text-[10px] uppercase border border-neon-green/20">
                          <FaCircleCheck className="w-3 h-3" /> PASSED ALL CASES
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neon-pink/10 text-neon-pink font-bold text-[10px] uppercase border border-neon-pink/20">
                          <FaTriangleExclamation className="w-3 h-3" /> TEST SUITE FAILED
                        </span>
                      )}
                    </div>
                    {runResult.passed && runResult.rewards && (
                      <div className="flex items-center gap-2 text-yellow-400 font-bold text-[11px]">
                        <FaAward className="w-3.5 h-3.5 text-neon-purple" />
                        <span>+{runResult.rewards.xp} XP</span>
                        <span>•</span>
                        <span>+{runResult.rewards.coins} Coins</span>
                      </div>
                    )}
                  </div>

                  {/* Standard output/error text */}
                  {runResult.error && (
                    <div className="p-2.5 rounded-lg bg-neon-pink/5 border border-neon-pink/20 text-neon-pink font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                      {runResult.error}
                    </div>
                  )}

                  {runResult.output && (
                    <pre className="bg-bg-dark/50 p-2.5 rounded-lg text-gray-400 max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed font-mono">
                      {runResult.output}
                    </pre>
                  )}

                  {/* TestCaseResults grid */}
                  {runResult.testCaseResults && (
                    <div className="space-y-1.5 pt-2">
                      <p className="text-[10px] uppercase font-bold text-gray-500">Test Cases Details:</p>
                      {runResult.testCaseResults.map((tcr, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 rounded-lg border border-white/5 bg-white/[0.01]">
                          <span className="text-gray-400 truncate max-w-xs font-mono">Case #{idx+1} (Input: {tcr.input})</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-500 font-mono">Expected: {tcr.expected} | Actual: {tcr.actual}</span>
                            {tcr.passed ? (
                              <FaCircleCheck className="w-3.5 h-3.5 text-neon-green" />
                            ) : (
                              <FaCircleXmark className="w-3.5 h-3.5 text-neon-pink" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Code Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/80 backdrop-blur-md px-4 py-8">
          <div className="w-full max-w-3xl glass-panel p-8 rounded-3xl max-h-[85vh] overflow-y-auto relative animate-scale-up space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
                <FaRobot className="text-neon-purple w-5 h-5" />
                <span>AI Engineering Code Review</span>
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-white font-semibold text-sm cursor-pointer"
              >
                Close
              </button>
            </div>

            {reviewing && (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 rounded-full border-2 border-t-neon-purple border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                <p className="text-xs text-purple-300 animate-pulse uppercase tracking-wider">AI reviewing complex structures...</p>
              </div>
            )}

            {reviewResult && (
              <div className="space-y-6 text-sm">
                {/* Score and Complexity Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Quality Score</span>
                    <span className="font-display font-black text-3xl text-neon-green">{reviewResult.qualityScore}%</span>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Time Complexity</span>
                    <span className="font-mono font-bold text-lg text-neon-cyan">{reviewResult.timeComplexity}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Space Complexity</span>
                    <span className="font-mono font-bold text-lg text-neon-pink">{reviewResult.spaceComplexity}</span>
                  </div>
                </div>

                {/* Details Comments */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <h5 className="font-display font-bold text-xs uppercase tracking-wider text-neon-purple mb-1">Readability & Naming</h5>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{reviewResult.readabilityComments}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <h5 className="font-display font-bold text-xs uppercase tracking-wider text-neon-cyan mb-1">Efficiency & Optimization</h5>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{reviewResult.optimizationComments}</p>
                  </div>
                </div>

                {/* Optimal solution explanation and optimal code */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <h5 className="font-display font-bold text-xs uppercase tracking-wider text-white/50 mb-1.5">Optimal Solution Breakdown</h5>
                    <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{reviewResult.optimalSolutionExplanation}</p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-display font-bold text-xs uppercase tracking-wider text-neon-green px-1">Editorial Solution Code</h5>
                    <pre className="bg-bg-dark/80 p-5 rounded-2xl font-mono text-xs text-gray-300 overflow-x-auto border border-white/5 leading-relaxed">
                      {reviewResult.editorialCode}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Coding;
