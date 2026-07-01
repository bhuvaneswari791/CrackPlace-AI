import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  FaUserTie, 
  FaPaperPlane, 
  FaRobot, 
  FaAward, 
  FaCoins, 
  FaChevronRight, 
  FaArrowRotateLeft, 
  FaChartLine 
} from 'react-icons/fa6';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

interface InlineEvaluation {
  score: number;
  feedback: string;
  improvedAnswer: string;
}

interface FinalScorecard {
  overallScore: number;
  grammarRating: number;
  completenessRating: number;
  clarityRating: number;
  professionalismRating: number;
  starMethodScore: number;
  overallFeedback: string;
}

export const HRInterview: React.FC = () => {
  const { token, userProfile, updateProfile } = useAuthStore();

  // Setup state
  const [dreamCompany, setDreamCompany] = useState(userProfile?.dreamCompany || 'Google');
  const [targetRole, setTargetRole] = useState('Software Engineer');

  // Session state
  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'finished'>('idle');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  
  // Evaluation state
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [lastEvaluation, setLastEvaluation] = useState<InlineEvaluation | null>(null);
  const [finalScorecard, setFinalScorecard] = useState<FinalScorecard | null>(null);
  
  // API loader statuses
  const [processing, setProcessing] = useState(false);
  const [rewards, setRewards] = useState({ xp: 0, coins: 0 });

  const handleStartInterview = async () => {
    setStatus('loading');
    setChatHistory([]);
    setLastEvaluation(null);
    setFinalScorecard(null);
    setUserAnswer('');
    try {
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ dreamCompany, role: targetRole })
      });

      if (!response.ok) {
        throw new Error('Failed to interface with AI HR system.');
      }

      const data = await response.json();
      setCurrentQuestion(data.question);
      setChatHistory(data.chatHistory);
      setStatus('active');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to start interview.');
      setStatus('idle');
    }
  };

  const handleSendResponse = async () => {
    if (!userAnswer.trim() || processing) return;
    setProcessing(true);
    setLastEvaluation(null);

    // Optimistically update chat history
    const updatedHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: userAnswer }
    ];
    setChatHistory(updatedHistory);
    const candidateAnswer = userAnswer;
    setUserAnswer('');

    try {
      const response = await fetch('/api/interview/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dreamCompany,
          chatHistory: chatHistory,
          userAnswer: candidateAnswer
        })
      });

      if (!response.ok) {
        throw new Error('AI response evaluation failed.');
      }

      const data = await response.json();
      setLastEvaluation(data.evaluation);

      if (data.finished) {
        setFinalScorecard(data.finalScorecard);
        setRewards(data.rewards);
        setStatus('finished');
        
        // Sync user stats
        fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(verified => {
            if (verified.profile) updateProfile(verified.profile);
          });
      } else {
        // Keep question in state to present next after user clicks "Continue"
        setCurrentQuestion(data.nextQuestion);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error communicating with AI HR.');
    } finally {
      setProcessing(false);
    }
  };

  const handleNextQuestion = () => {
    setChatHistory(prev => [...prev, { role: 'assistant', content: currentQuestion }]);
    setLastEvaluation(null);
  };

  // State 1: Setup View
  if (status === 'idle') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-display font-black text-3xl text-white tracking-wide">AI HR Interview Room</h1>
          <p className="text-gray-400 text-sm">Conduct behavior mock interviews and receive structural STAR format critiques.</p>
        </div>

        <div className="max-w-2xl glass-panel p-8 rounded-3xl space-y-6">
          <h3 className="font-display font-bold text-base text-white border-b border-white/5 pb-3">
            Interview Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Target Company</label>
              <input
                type="text"
                value={dreamCompany}
                onChange={(e) => setDreamCompany(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                placeholder="Google, Microsoft, Zoho..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Job Position</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                placeholder="Software Engineer, Product Manager..."
              />
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink font-display font-bold text-sm tracking-widest text-white shadow-lg shadow-neon-purple/20 hover:shadow-neon-purple/40 transition-all duration-300 cursor-pointer"
          >
            ENTER INTERVIEW MODULE
          </button>
        </div>
      </div>
    );
  }

  // State 2: Setup Loading View
  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-fade-in">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-t-neon-pink border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-b-neon-cyan border-t-transparent border-r-transparent border-l-transparent animate-spin-reverse opacity-70"></div>
        </div>
        <h2 className="font-display font-black text-xl text-white tracking-widest uppercase">Initializing Chat</h2>
        <p className="text-xs text-pink-300 animate-pulse text-center max-w-sm">
          Generating customized HR questions based on profile details...
        </p>
      </div>
    );
  }

  // State 3: Active Dialogue Workspace
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 min-h-0 animate-fade-in">
      
      {/* Left panel: Interviewer status */}
      {status === 'active' && (
        <div className="w-full md:w-64 glass-panel p-4 md:p-6 rounded-3xl flex flex-row md:flex-col items-center justify-start md:justify-center text-left md:text-center gap-4 md:space-y-4 shrink-0">
          <div className="w-14 h-14 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-neon-purple to-neon-pink flex items-center justify-center shadow-lg shadow-neon-purple/25 border border-white/10 shrink-0">
            <FaUserTie className="w-6 h-6 md:w-10 md:h-10 text-white" />
          </div>
          <div className="flex-1 md:flex-none">
            <h4 className="font-display font-black text-white text-sm md:text-base">HR Director</h4>
            <p className="text-[10px] md:text-xs text-gray-400">{dreamCompany} Staffing Team</p>
          </div>
          
          <div className="hidden sm:block pt-0 md:pt-4 border-t-0 md:border-t border-white/5 w-auto md:w-full space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-neon-cyan block">Audio Status</span>
            <div className="flex justify-center items-center gap-1.5 h-6">
              <div className="w-1.5 h-3 bg-neon-cyan rounded-full animate-pulse"></div>
              <div className="w-1.5 h-5 bg-neon-purple rounded-full animate-pulse"></div>
              <div className="w-1.5 h-2 bg-neon-pink rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Right panel: Chat log and inputs */}
      {status === 'active' && (
        <div className="flex-1 glass-panel rounded-3xl flex flex-col overflow-hidden min-h-0">
          {/* Messages log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {chatHistory.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center shrink-0">
                      <FaRobot className="w-4 h-4 text-neon-purple" />
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl max-w-lg text-sm leading-relaxed
                    ${isUser 
                      ? 'bg-neon-purple/20 border border-neon-purple/20 text-white rounded-tr-none' 
                      : 'bg-white/[0.02] border border-white/5 text-gray-300 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {/* Inline critique review */}
            {lastEvaluation && (
              <div className="p-6 rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5 text-xs space-y-4 animate-scale-up">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h5 className="font-display font-black text-neon-cyan uppercase tracking-wider">Answer Evaluation</h5>
                  <span className="font-display font-black text-sm text-neon-green">Score: {lastEvaluation.score}%</span>
                </div>
                <p className="text-gray-300 leading-relaxed"><strong className="text-white">Feedback:</strong> {lastEvaluation.feedback}</p>
                <div className="p-3 rounded-lg bg-bg-dark/40 border border-white/5 text-gray-400 font-sans leading-relaxed">
                  <strong className="text-white block mb-1">Better version of this answer:</strong>
                  {lastEvaluation.improvedAnswer}
                </div>
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neon-cyan text-black font-display font-bold text-xs uppercase tracking-wider ml-auto shadow-md shadow-neon-cyan/15 hover:shadow-neon-cyan/35 cursor-pointer"
                >
                  <span>Continue Interview</span>
                  <FaChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {processing && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center shrink-0">
                  <FaRobot className="w-4 h-4 text-neon-purple animate-pulse" />
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-purple-300 animate-pulse">
                  Analyzing grammar structure and behavioral STAR mapping...
                </div>
              </div>
            )}
          </div>

          {/* User Input bar */}
          {!lastEvaluation && (
            <div className="p-4 border-t border-white/5 bg-white/[0.01] flex gap-3 items-center">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Formulate your response (Use STAR method)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendResponse();
                  }
                }}
                disabled={processing}
                className="flex-1 glass-input px-4 py-3 rounded-xl text-sm focus:outline-none resize-none h-14 leading-relaxed"
              />
              <button
                onClick={handleSendResponse}
                disabled={processing || !userAnswer.trim()}
                className="w-12 h-12 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-pink text-white flex items-center justify-center shrink-0 hover:shadow-lg hover:shadow-neon-purple/25 active:scale-95 transition-all duration-300 disabled:opacity-40 cursor-pointer"
              >
                <FaPaperPlane className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* State 4: Scorecard view */}
      {status === 'finished' && finalScorecard && (
        <div className="max-w-3xl mx-auto space-y-8 overflow-y-auto pb-6 pr-1">
          {/* Title */}
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-neon-pink">Interview Concluded</span>
            <h1 className="font-display font-black text-3xl text-white tracking-wide mt-1">HR Performance Scorecard</h1>
          </div>

          {/* Overall Circle and Rewards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Overall Rating</span>
              <div className="font-display font-black text-4xl text-neon-green">
                {finalScorecard.overallScore}%
              </div>
              <span className="text-[10px] text-gray-400">STAR Assessment Standard</span>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">XP Gained</span>
              <div className="font-display font-black text-4xl text-neon-purple flex items-center gap-2">
                <FaAward className="w-8 h-8 text-neon-purple" />
                <span>+{rewards.xp}</span>
              </div>
              <span className="text-[10px] text-gray-400">Placement Level Growth</span>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Coins Gained</span>
              <div className="font-display font-black text-4xl text-yellow-400 flex items-center gap-2">
                <FaCoins className="w-8 h-8 text-yellow-500" />
                <span>+{rewards.coins}</span>
              </div>
              <span className="text-[10px] text-gray-400">Balanced Added</span>
            </div>
          </div>

          {/* Metric Details grid */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white/50 border-b border-white/5 pb-2 mb-3">
              Performance Indicators
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="text-center p-3.5 rounded-xl border border-white/5 bg-white/[0.01]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Grammar</span>
                <p className="font-display font-black text-lg text-neon-cyan mt-1">{finalScorecard.grammarRating}%</p>
              </div>
              <div className="text-center p-3.5 rounded-xl border border-white/5 bg-white/[0.01]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Completeness</span>
                <p className="font-display font-black text-lg text-neon-purple mt-1">{finalScorecard.completenessRating}%</p>
              </div>
              <div className="text-center p-3.5 rounded-xl border border-white/5 bg-white/[0.01]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Clarity</span>
                <p className="font-display font-black text-lg text-neon-pink mt-1">{finalScorecard.clarityRating}%</p>
              </div>
              <div className="text-center p-3.5 rounded-xl border border-white/5 bg-white/[0.01]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Professional</span>
                <p className="font-display font-black text-lg text-neon-green mt-1">{finalScorecard.professionalismRating}%</p>
              </div>
              <div className="text-center p-3.5 rounded-xl border border-white/5 bg-white/[0.01]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">STAR Method</span>
                <p className="font-display font-black text-lg text-yellow-400 mt-1">{finalScorecard.starMethodScore}%</p>
              </div>
            </div>
          </div>

          {/* Qualitative overall feedback text */}
          <div className="glass-panel p-6 rounded-2xl space-y-2">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-neon-cyan flex items-center gap-1.5">
              <FaChartLine className="w-3.5 h-3.5" /> Summary Report
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {finalScorecard.overallFeedback}
            </p>
          </div>

          {/* Actions */}
          <button
            onClick={() => setStatus('idle')}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl border border-white/10 hover:border-white/25 bg-white/[0.02] hover:bg-white/[0.05] transition-all font-display font-bold text-sm uppercase tracking-wider cursor-pointer"
          >
            <FaArrowRotateLeft className="w-4 h-4" />
            <span>Restart New Interview</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default HRInterview;
