import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrophy, 
  FaCircleCheck,
  FaCircleXmark,
  FaAward,
  FaCoins,
  FaUserGroup,
  FaCrown,
  FaArrowLeft,
  FaRegClock,
  FaLock,
  FaUnlock,
  FaBookOpen,
  FaListUl,
  FaPlay,
  FaWhatsapp,
  FaCopy,
  FaEllipsis,
  FaChartBar
} from 'react-icons/fa6';
import { COSMETICS_CATALOG, getRingClass, getBackgroundClass, getFrameClass } from '../config/cosmetics';

const CATEGORIES = ['Aptitude', 'DSA', 'DBMS', 'Operating Systems'];

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

interface Opponent {
  userId: string;
  displayName: string;
  level: number;
  rating: number;
  photoURL?: string;
  equippedRing?: string | null;
  equippedFrame?: string | null;
  equippedBackground?: string | null;
  equippedTitle?: string | null;
}


export const Battle: React.FC = () => {
  const { token, userProfile, updateProfile } = useAuthStore();
  const navigate = useNavigate();

  // Setup Lounge states
  const [selectedCategory, setSelectedCategory] = useState('DSA');
  const [loungeTab, setLoungeTab] = useState<'quick' | 'friend'>('quick');
  const [status, setStatus] = useState<'lounge' | 'searching' | 'lobby' | 'battle' | 'concluded'>('lounge');
  const [searchStatusMsg, setSearchStatusMsg] = useState('Searching for opponents...');

  const [searchParams, setSearchParams] = useSearchParams();
  const roomQuery = searchParams.get('room');

  // Lobby States
  const [lobbyRoom, setLobbyRoom] = useState<any | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lobbyTimeLeft, setLobbyTimeLeft] = useState('30:00');

  useEffect(() => {
    if (status === 'lobby' && lobbyRoom?.expirationTime) {
      const interval = setInterval(() => {
        const exp = new Date(lobbyRoom.expirationTime).getTime();
        const now = Date.now();
        const diff = exp - now;
        if (diff <= 0) {
          clearInterval(interval);
          setLobbyTimeLeft('00:00');
          setStatus('lounge');
          setSearchParams({});
        } else {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setLobbyTimeLeft(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, lobbyRoom, setSearchParams]);
  
  // Custom battle settings form states
  const [customBattleType, setCustomBattleType] = useState('Aptitude');
  const [questionsCount, setQuestionsCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [timeLimit, setTimeLimit] = useState(30);
  const [categoryName, setCategoryName] = useState('All');
  const [companyName, setCompanyName] = useState('All');
  const [isPrivate, setIsPrivate] = useState(true);

  // Combat details
  const [battleId, setBattleId] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Real-time tracking
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState({ progressIndex: 0, score: 0, finished: false });
  const [battleResult, setBattleResult] = useState<{ winnerId: string } | null>(null);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(30);
  const [battleAlert, setBattleAlert] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [lobbyLoading, setLobbyLoading] = useState(false);
  const [lobbyLoadingMessage, setLobbyLoadingMessage] = useState('Preparing battle...');
  const [lobbyLoadingProgress, setLobbyLoadingProgress] = useState(0);
  const [lobbyLoadingSlow, setLobbyLoadingSlow] = useState(false);

  // WebSocket instances
  const matchmakingSocket = useRef<Socket | null>(null);
  const battleSocket = useRef<Socket | null>(null);

  const getSocketUrl = () => {
    return window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
  };

  // 1. Join matchmaking queue
  const handleStartSearch = () => {
    setStatus('searching');
    setSearchStatusMsg('Connecting to matchmaking corridor...');
    
    // Connect to matchmaking namespace
    matchmakingSocket.current = io(`${getSocketUrl()}/matchmaking`, {
      transports: ['websocket']
    });

    matchmakingSocket.current.on('connect', () => {
      setSearchStatusMsg('Searching for active placement candidates...');
      matchmakingSocket.current?.emit('join_lobby', {
        userId: userProfile?.uid,
        battleType: selectedCategory,
        rating: userProfile?.battleRating || 1200,
        profile: {
          displayName: userProfile?.displayName || 'Anonymous Cadet',
          level: userProfile?.level || 1,
          avatar: userProfile?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userProfile?.uid}`,
          equippedRing: userProfile?.equippedRing || '',
          equippedFrame: userProfile?.equippedFrame || '',
          equippedBackground: userProfile?.equippedBackground || '',
          equippedTitle: userProfile?.equippedTitle || ''
        }
      });
    });

    matchmakingSocket.current.on('match_status', (data: { message: string }) => {
      setSearchStatusMsg(data.message);
    });

    matchmakingSocket.current.on('match_found', (data: { battleId: string; opponent: Opponent; quiz: QuizQuestion[] }) => {
      setBattleId(data.battleId);
      setOpponent(data.opponent);
      setQuestions(data.quiz);
      setStatus('battle');
      
      // Clean matchmaking socket
      matchmakingSocket.current?.disconnect();
      matchmakingSocket.current = null;
    });

    matchmakingSocket.current.on('match_error', (data: { message: string }) => {
      alert(data.message);
      handleCancelSearch();
    });
  };

  const handleCancelSearch = () => {
    if (matchmakingSocket.current) {
      matchmakingSocket.current.emit('leave_lobby', { userId: userProfile?.uid });
      matchmakingSocket.current.disconnect();
      matchmakingSocket.current = null;
    }
    setStatus('lounge');
    setSearchParams({});
  };

  const handleLeaveLobby = () => {
    if (battleSocket.current) {
      battleSocket.current.disconnect();
      battleSocket.current = null;
    }
    setStatus('lounge');
    setSearchParams({});
  };

  const handleToggleReady = () => {
    if (battleSocket.current && battleId) {
      battleSocket.current.emit('toggle_ready', {
        battleId,
        userId: userProfile?.uid
      });
    }
  };

  const handleStartBattle = () => {
    if (battleSocket.current && battleId) {
      battleSocket.current.emit('start_battle_request', {
        battleId,
        userId: userProfile?.uid
      });
    }
  };

  const handleCreateCustomRoom = async () => {
    try {
      const res = await fetch('/api/auth/battle-room/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          battleType: customBattleType,
          questionsCount,
          difficulty,
          timeLimit,
          category: categoryName,
          company: companyName,
          isPrivate
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create room');
      setSearchParams({ room: data.room.roomId });
    } catch (err: any) {
      alert(err.message || 'Lobby creation failed.');
    }
  };

  const handleShareInvite = () => {
    if (!lobbyRoom) return;
    const inviteLink = `${window.location.origin}${window.location.hostname === 'localhost' ? '' : '/CrackPlace-AI'}/invite/${lobbyRoom.roomId}`;
    const text = `🔥 I challenge you to a 1v1 battle on CrackPlace AI!\n\nCategory: ${lobbyRoom.battleType}\nDifficulty: ${lobbyRoom.settings.difficulty}\nQuestions: ${lobbyRoom.settings.questionsCount}\n\nCan you beat me?\n\nJoin here:\n${inviteLink}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'CrackPlace AI Battle Challenge',
        text,
        url: inviteLink
      }).catch(err => console.log('Share error:', err));
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  // Synchronize room URL search query
  useEffect(() => {
    if (roomQuery) {
      setBattleId(roomQuery);
      setStatus('lobby');
    }
  }, [roomQuery]);

  // 2. Battle socket connection & message receivers
  useEffect(() => {
    if ((status === 'battle' || status === 'lobby') && battleId) {
      setCurrentIndex(0);
      setPlayerScore(0);
      setOpponentProgress({ progressIndex: 0, score: 0, finished: false });

      battleSocket.current = io(`${getSocketUrl()}/battle`, {
        transports: ['websocket']
      });

      battleSocket.current.on('connect', () => {
        battleSocket.current?.emit('join_room', {
          battleId,
          userId: userProfile?.uid
        });
      });

      battleSocket.current.on('room_error', (data: { message: string }) => {
        alert(data.message);
        setStatus('lounge');
        setSearchParams({});
      });

      battleSocket.current.on('lobby_updated', (roomData: any) => {
        setLobbyRoom(roomData);
        // Find opponent details dynamically
        const opponentUid = Object.keys(roomData.players).find(uid => uid !== userProfile?.uid);
        if (opponentUid) {
          const opp = roomData.players[opponentUid];
          setOpponent({
            userId: opp.uid,
            displayName: opp.displayName,
            level: opp.level,
            rating: opp.battleRating,
            photoURL: opp.photoURL,
            equippedRing: opp.equippedRing,
            equippedFrame: opp.equippedFrame,
            equippedBackground: opp.equippedBackground,
            equippedTitle: opp.equippedTitle
          });
        } else {
          setOpponent(null);
        }
      });

      battleSocket.current.on('battle_preparing', () => {
        setLobbyLoading(true);
        setLobbyLoadingProgress(10);
      });

      battleSocket.current.on('battle_starting', (data: { quiz: QuizQuestion[] }) => {
        setLobbyLoading(false);
        setLobbyLoadingProgress(100);
        setQuestions(data.quiz);
        let count = 3;
        setCountdown(count);
        
        const interval = setInterval(() => {
          count -= 1;
          if (count <= 0) {
            clearInterval(interval);
            setCountdown(null);
            setStatus('battle');
          } else {
            setCountdown(count);
          }
        }, 1000);
      });

      battleSocket.current.on('player_joined', (data: { userId: string }) => {
        console.log(`Opponent player joined room: ${data.userId}`);
      });

      battleSocket.current.on('step_update', (data: { uid: string; score: number; progressIndex: number; finished: boolean }) => {
        setOpponentProgress({
          progressIndex: data.progressIndex,
          score: data.score,
          finished: data.finished
        });

        // Show floating battle status indicator
        if (data.finished) {
          setBattleAlert({ text: '🏁 Opponent Finished', type: 'info' });
        } else {
          setBattleAlert({ text: '🔥 Opponent Answered', type: 'info' });
        }

        setTimeout(() => {
          setBattleAlert(prev => {
            if (prev?.text.includes('Opponent')) return null;
            return prev;
          });
        }, 2000);
      });



      battleSocket.current.on('battle_concluded', (data: { winnerId: string }) => {
        setBattleResult(data);
        setStatus('concluded');
        
        // Disconnect combat socket
        battleSocket.current?.disconnect();
        battleSocket.current = null;

        // Sync local profile updates to display new Elo/Coins instantly on scorecard
        setTimeout(() => {
          fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(verified => {
              if (verified.profile) updateProfile(verified.profile);
            });
        }, 1500);
      });
    }

    return () => {
      if (battleSocket.current) {
        battleSocket.current.disconnect();
        battleSocket.current = null;
      }
    };
  }, [status, battleId, userProfile?.uid, token, updateProfile, setSearchParams]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (matchmakingSocket.current) matchmakingSocket.current.disconnect();
      if (battleSocket.current) battleSocket.current.disconnect();
    };
  }, []);

  // Lobby Starting Loading messages / progress simulation
  useEffect(() => {
    let interval: any;
    let timeout: any;
    let messageIndex = 0;
    const messages = [
      "⚔️ Preparing Battle...",
      "Generating AI Questions...",
      "Balancing difficulty...",
      "Loading battle room...",
      "Waiting for opponent...",
      "Almost Ready...",
      "Starting Battle..."
    ];

    if (lobbyLoading) {
      setLobbyLoadingSlow(false);
      setLobbyLoadingProgress(10);
      messageIndex = 0;
      setLobbyLoadingMessage(messages[0]);

      // Cycle messages and simulate progress increments
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLobbyLoadingMessage(messages[messageIndex]);
        setLobbyLoadingProgress(prev => {
          if (prev >= 90) return 90;
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 1200);

      // Flag slow load if longer than 5 seconds
      timeout = setTimeout(() => {
        setLobbyLoadingSlow(true);
      }, 5000);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [lobbyLoading]);

  // Dynamic full-screen battle class trigger
  useEffect(() => {
    if (status === 'battle') {
      document.documentElement.classList.add('in-battle-gameplay');
    } else {
      document.documentElement.classList.remove('in-battle-gameplay');
    }
    return () => {
      document.documentElement.classList.remove('in-battle-gameplay');
    };
  }, [status]);

  // Question Local Timer Effect
  useEffect(() => {
    if (status === 'battle' && questions.length > 0 && currentIndex < questions.length && selectedOption === null) {
      const limit = lobbyRoom?.settings?.timeLimit || 30;
      setQuestionTimeLeft(limit);

      const timer = setInterval(() => {
        setQuestionTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAnswerSubmit(-1); // Time out submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, currentIndex, selectedOption, questions.length, lobbyRoom]);

  // 3. Question submit handler
  const handleAnswerSubmit = (optionIdx: number) => {
    if (selectedOption !== null || !battleId) return;
    setSelectedOption(optionIdx);

    const isCorrect = optionIdx === questions[currentIndex].correctOptionIndex;
    const nextScore = isCorrect ? playerScore + 20 : playerScore;
    setPlayerScore(nextScore);

    const isFinalQuestion = currentIndex >= questions.length - 1;

    // Send update over socket to synchronize progress/bars instantly
    battleSocket.current?.emit('submit_step', {
      battleId,
      questionIndex: currentIndex + 1,
      isCorrect: optionIdx === -1 ? false : isCorrect,
      score: nextScore,
      userId: userProfile?.uid,
      isFinal: isFinalQuestion
    });

    // Set floating alert status indicator
    if (optionIdx === -1) {
      setBattleAlert({ text: '⏳ Time Out!', type: 'error' });
    } else if (isCorrect) {
      setBattleAlert({ text: '⚡ Correct!', type: 'success' });
    } else {
      setBattleAlert({ text: '❌ Wrong!', type: 'error' });
    }

    setTimeout(() => {
      setBattleAlert(prev => {
        if (prev?.text.includes('Correct') || prev?.text.includes('Wrong') || prev?.text.includes('Time Out')) {
          return null;
        }
        return prev;
      });
    }, 2000);

    // Tick to next question after exactly 1 second (1000ms)
    setTimeout(() => {
      if (isFinalQuestion) {
        // Wait for opponent or auto conclude
      } else {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
      }
    }, 1000);
  };



  // State 1: Setup Lounge
  if (status === 'lounge') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display font-black text-3xl text-white tracking-wide">Battle Arena</h1>
            <p className="text-gray-400 text-sm">Compete in 1v1 speed MCQ battles. Win to progress up the Elo ranks.</p>
          </div>
          {/* Tab Selector */}
          <div className="flex bg-white/[0.02] border border-white/5 p-1 rounded-xl">
            <button
              onClick={() => setLoungeTab('quick')}
              className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${loungeTab === 'quick' ? 'bg-neon-purple text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Quick Match
            </button>
            <button
              onClick={() => setLoungeTab('friend')}
              className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${loungeTab === 'friend' ? 'bg-neon-purple text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Challenge Friend
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Lounge Selection */}
          <div className="md:col-span-2 glass-panel p-8 rounded-3xl space-y-6">
            {loungeTab === 'quick' ? (
              <>
                <h3 className="font-display font-bold text-base text-white border-b border-white/5 pb-3">
                  PvP Matchmaking Configurations
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Battle Subject</label>
                  <div className="grid grid-cols-2 gap-4">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 font-display font-bold text-sm
                          ${selectedCategory === cat
                            ? 'border-neon-purple bg-neon-purple/15 text-white shadow-lg shadow-neon-purple/10'
                            : 'border-white/5 bg-white/[0.01] text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10'
                          }`}
                      >
                        <span>{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartSearch}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink font-display font-bold text-sm tracking-widest text-white shadow-lg shadow-neon-purple/20 hover:shadow-neon-purple/40 transition-all duration-300 cursor-pointer"
                >
                  SEARCH COMPETITOR
                </button>
              </>
            ) : (
              <>
                <h3 className="font-display font-bold text-base text-white border-b border-white/5 pb-3">
                  Custom Battle Room Settings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Battle Type */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Battle Type</label>
                    <select
                      value={customBattleType}
                      onChange={e => setCustomBattleType(e.target.value)}
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                    >
                      <option value="Aptitude" className="bg-bg-dark text-white">Aptitude Battle</option>
                      <option value="DSA" className="bg-bg-dark text-white">Coding Battle</option>
                      <option value="DBMS" className="bg-bg-dark text-white">Mixed Battle</option>
                      <option value="Operating Systems" className="bg-bg-dark text-white">Company Mock Battle</option>
                      <option value="HR" className="bg-bg-dark text-white">HR Battle</option>
                      <option value="Rapid Fire" className="bg-bg-dark text-white">Rapid Fire</option>
                    </select>
                  </div>

                  {/* Question count */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Number of Questions</label>
                    <select
                      value={questionsCount}
                      onChange={e => setQuestionsCount(Number(e.target.value))}
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                    >
                      <option value="5" className="bg-bg-dark text-white">5 Questions</option>
                      <option value="10" className="bg-bg-dark text-white">10 Questions</option>
                      <option value="15" className="bg-bg-dark text-white">15 Questions</option>
                      <option value="20" className="bg-bg-dark text-white">20 Questions</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value)}
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                    >
                      <option value="Easy" className="bg-bg-dark text-white">Easy</option>
                      <option value="Medium" className="bg-bg-dark text-white">Medium</option>
                      <option value="Hard" className="bg-bg-dark text-white">Hard</option>
                    </select>
                  </div>

                  {/* Time limit */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Time Limit per Q</label>
                    <select
                      value={timeLimit}
                      onChange={e => setTimeLimit(Number(e.target.value))}
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                    >
                      <option value="15" className="bg-bg-dark text-white">15 Seconds</option>
                      <option value="30" className="bg-bg-dark text-white">30 Seconds</option>
                      <option value="45" className="bg-bg-dark text-white">45 Seconds</option>
                      <option value="60" className="bg-bg-dark text-white">60 Seconds</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Category Tag (e.g. Arrays)</label>
                    <input
                      type="text"
                      value={categoryName}
                      onChange={e => setCategoryName(e.target.value)}
                      placeholder="All"
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Target Company (e.g. Google)</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="All"
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={e => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded accent-neon-purple"
                  />
                  <label htmlFor="isPrivate" className="text-xs text-gray-300 font-medium select-none cursor-pointer">
                    Private Room (only players with invitation link can join)
                  </label>
                </div>

                <button
                  onClick={handleCreateCustomRoom}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink font-display font-bold text-sm tracking-widest text-white shadow-lg shadow-neon-purple/20 hover:shadow-neon-purple/40 transition-all duration-300 cursor-pointer"
                >
                  CREATE INVITE LOBBY
                </button>
              </>
            )}
          </div>

          {/* User Ratings Summary */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-neon-purple flex items-center justify-center shadow-lg border border-white/10">
              <FaTrophy className="w-9 h-9 text-white" />
            </div>
            <div>
              <h4 className="font-display font-black text-white text-lg">{userProfile?.displayName}</h4>
              <p className="text-xs text-gray-400">Cadet Level {userProfile?.level}</p>
            </div>
            <div className="w-full border-t border-white/5 pt-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Arena Rating</span>
              <p className="font-display font-black text-2xl text-neon-cyan">{userProfile?.battleRating || 1200} ELO</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 1.5: Lobby Waiting Room
  if (status === 'lobby' && lobbyRoom) {
    const playersMap = lobbyRoom.players || {};
    const host = playersMap[lobbyRoom.hostUid];
    
    const guestUid = Object.keys(playersMap).find(uid => uid !== lobbyRoom.hostUid);
    const guest = guestUid ? playersMap[guestUid] : null;

    const isHost = userProfile?.uid === lobbyRoom.hostUid;
    const myPlayerObj = playersMap[userProfile?.uid || ''];
    const isMeReady = myPlayerObj?.ready || false;
    const isOpponentReady = guest?.ready || false;

    const inviteLink = `${window.location.origin}${window.location.hostname === 'localhost' ? '' : '/CrackPlace-AI'}/invite/${lobbyRoom.roomId}`;

    const handleLocalCopy = () => {
      navigator.clipboard.writeText(inviteLink);
      alert('Invite link copied to clipboard!');
    };

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in pb-24 text-white">
        {/* Custom Header Toolbar */}
        <div className="flex justify-between items-center bg-bg-dark/40 backdrop-blur-md py-4 border-b border-white/5 sticky top-0 z-10 px-1">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLeaveLobby}
              className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-gray-400 hover:text-white cursor-pointer"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display font-black text-xl tracking-wide">Battle Arena</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Coins Balance */}
            <div 
              title="Open Armory Shop"
              onClick={() => navigate('/store')}
              className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 px-3 py-1 rounded-full text-xs font-bold text-yellow-400 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <FaCoins className="w-3.5 h-3.5 text-yellow-500 animate-bounce" style={{ animationDuration: '3s' }} />
              <span>{userProfile?.coins || 0}</span>
            </div>

            {/* Elo Rating */}
            <div className="flex items-center gap-1.5 bg-neon-cyan/5 border border-neon-cyan/20 px-3 py-1 rounded-full text-xs font-bold text-neon-cyan">
              <FaCrown className="w-3.5 h-3.5" />
              <span>{userProfile?.battleRating || 1200}</span>
            </div>
          </div>
        </div>

        {/* Full-screen Preparing Battle Loader overlay */}
        {lobbyLoading && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-dark/95 backdrop-blur-md animate-fade-in p-6 text-white text-center">
            <div className="w-full max-w-sm space-y-6">
              <div className="relative w-20 h-20 mx-auto animate-pulse">
                <div className="absolute inset-0 rounded-full border-4 border-t-neon-purple border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-b-neon-pink border-t-transparent border-r-transparent border-l-transparent animate-spin-reverse opacity-70"></div>
                <div className="absolute inset-4 rounded-full border-4 border-r-neon-cyan border-t-transparent border-b-transparent border-l-transparent animate-spin opacity-50"></div>
              </div>

              <div className="space-y-2">
                <h2 className="font-display font-black text-lg uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-white to-neon-cyan drop-shadow-[0_0_10px_rgba(168,85,247,0.3)] animate-pulse">
                  {lobbyLoadingMessage}
                </h2>
                <p className="text-xs text-gray-500 font-medium font-display uppercase tracking-widest">Please wait...</p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                  <span>DEPLOYING MATRIX</span>
                  <span>{lobbyLoadingProgress}%</span>
                </div>
                <div className="w-full h-3 bg-white/5 border border-white/10 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan transition-all duration-300 shadow-[0_0_10px_rgba(236,72,153,0.3)]" 
                    style={{ width: `${lobbyLoadingProgress}%` }}
                  ></div>
                </div>
              </div>

              {lobbyLoadingSlow && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-neon-pink font-semibold animate-pulse uppercase tracking-wider mt-2"
                >
                  This is taking a little longer than usual...
                </motion.p>
              )}
            </div>
          </div>
        )}

        {countdown !== null && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in">
            <span className="text-[10px] font-bold tracking-widest text-neon-cyan uppercase mb-2">Preparing Quiz Arena</span>
            <div className="font-display font-black text-8xl text-neon-purple animate-ping">
              {countdown}
            </div>
            <p className="text-xs text-gray-400 mt-6 animate-pulse">Entering combat state...</p>
          </div>
        )}

        {/* VS Card */}
        <div className="glass-panel p-6 rounded-3xl space-y-6 relative overflow-hidden border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center relative z-10 px-2">
            {/* Host Card (Left) */}
            <div className={`flex flex-col items-center text-center space-y-2.5 w-1/3 p-3.5 rounded-2xl transition-all duration-300 ${getBackgroundClass(host?.equippedBackground || '')} ${getFrameClass(host?.equippedFrame || '')} overflow-hidden`}>
              <span className="text-[9px] font-black tracking-wider text-neon-purple uppercase">{lobbyRoom.hostUid === userProfile?.uid ? 'YOU (Host)' : 'HOST'}</span>
              <div className="relative">
                <div className={`w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-bg-dark transition-all duration-300 ${getRingClass(host?.equippedRing || '')}`}>
                  <img
                    src={host?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${lobbyRoom.hostUid}`}
                    alt={host?.displayName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-neon-green border-2 border-bg-dark rounded-full"></span>
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-white truncate max-w-[100px]">{host?.displayName}</h3>
                {(() => {
                  const titleItem = COSMETICS_CATALOG.find(i => i.id === host?.equippedTitle);
                  const displayTitle = titleItem ? titleItem.visual : '';
                  return displayTitle ? (
                    <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[7px] text-neon-cyan font-bold uppercase tracking-widest shadow mt-1">
                      {displayTitle}
                    </span>
                  ) : null;
                })()}
                <div className="flex items-center justify-center gap-1 text-[10px] text-purple-300 font-bold mt-1.5">
                  <FaTrophy className="w-2.5 h-2.5" />
                  <span>{host?.battleRating || 1200}</span>
                </div>
              </div>
            </div>

            {/* Glowing VS divider */}
            <div className="flex flex-col items-center text-center w-1/3">
              <span className="font-display font-black text-4xl text-transparent bg-clip-text bg-gradient-to-tr from-neon-purple via-white to-neon-cyan animate-pulse drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                VS
              </span>
              <div className="mt-3">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest block leading-none">Room ID</span>
                <button 
                  onClick={handleLocalCopy}
                  className="flex items-center justify-center gap-1.5 font-display font-bold text-xs text-gray-400 hover:text-white transition-all mt-1 bg-white/[0.02] border border-white/5 py-1 px-2.5 rounded-lg cursor-pointer"
                >
                  <span>{lobbyRoom.roomId}</span>
                  <FaCopy className="w-3 h-3 text-neon-cyan" />
                </button>
              </div>
            </div>

            {/* Guest Card (Right) */}
            <div className={`flex flex-col items-center text-center space-y-2.5 w-1/3 p-3.5 rounded-2xl transition-all duration-300 ${guest ? getBackgroundClass(guest.equippedBackground || '') : ''} ${guest ? getFrameClass(guest.equippedFrame || '') : ''} overflow-hidden`}>
              <span className="text-[9px] font-black tracking-wider text-neon-cyan uppercase">{lobbyRoom.hostUid === userProfile?.uid ? 'OPPONENT' : 'YOU (Guest)'}</span>
              {guest ? (
                <>
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-bg-dark transition-all duration-300 ${getRingClass(guest.equippedRing || '')}`}>
                      <img
                        src={guest.photoURL}
                        alt={guest.displayName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-neon-green border-2 border-bg-dark rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-white truncate max-w-[100px]">{guest.displayName}</h3>
                    {(() => {
                      const titleItem = COSMETICS_CATALOG.find(i => i.id === guest.equippedTitle);
                      const displayTitle = titleItem ? titleItem.visual : '';
                      return displayTitle ? (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[7px] text-neon-cyan font-bold uppercase tracking-widest shadow mt-1">
                          {displayTitle}
                        </span>
                      ) : null;
                    })()}
                    <div className="flex items-center justify-center gap-1 text-[10px] text-neon-cyan font-bold mt-1.5">
                      <FaTrophy className="w-2.5 h-2.5" />
                      <span>{guest.battleRating}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="w-18 h-18 rounded-full border-2 border-dashed border-white/20 bg-white/[0.01] flex items-center justify-center ring-4 ring-white/5 animate-pulse">
                      <span className="text-xl font-bold text-gray-500">?</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-gray-500 italic">Waiting...</h3>
                    <div className="text-[10px] text-gray-600 font-bold mt-0.5">—</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Lobby wait status banner */}
          <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
            <div className="flex items-center gap-2.5 text-xs text-gray-400">
              <FaRegClock className="w-4 h-4 text-neon-purple animate-spin-slow" />
              <div>
                <p className="font-bold text-gray-300">Waiting for opponent...</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Share the link and invite your friend!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-neon-pink/15 text-neon-pink border border-neon-pink/20 px-2.5 py-1.5 rounded-full text-xs font-mono font-bold">
              <FaRegClock className="w-3.5 h-3.5" />
              <span>{lobbyTimeLeft}</span>
            </div>
          </div>
        </div>

        {/* Invite Your Friend Block */}
        <div className="glass-panel p-6 rounded-3xl space-y-5 border border-white/5">
          <div>
            <h2 className="font-display font-black text-lg text-white">Invite Your Friend</h2>
            <p className="text-xs text-gray-400">Share the link via WhatsApp or any app</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <button
              onClick={handleShareInvite}
              className="sm:col-span-2 py-3 rounded-xl bg-neon-green hover:bg-neon-green/90 text-bg-dark font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>Invite via WhatsApp</span>
            </button>

            <button
              onClick={handleLocalCopy}
              className="py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 text-gray-300 font-display font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <FaCopy className="w-3.5 h-3.5" />
              <span className="text-[10px]">Copy Link</span>
            </button>

            <button
              onClick={handleShareInvite}
              className="py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 text-gray-300 font-display font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <FaEllipsis className="w-3.5 h-3.5" />
              <span className="text-[10px]">More</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block">Invite Link</label>
            <div className="flex gap-2 bg-white/[0.02] border border-white/5 p-2 rounded-xl">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 bg-transparent border-none text-xs text-neon-cyan px-2 focus:outline-none font-mono"
              />
              <button 
                onClick={handleLocalCopy}
                className="p-1 text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <FaCopy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Battle Setup block */}
        <div className="glass-panel p-6 rounded-3xl space-y-5 border border-white/5">
          <h2 className="font-display font-black text-lg text-white">Battle Setup</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-neon-purple/15 text-neon-purple flex items-center justify-center shrink-0">
                <FaBookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-gray-500 font-bold uppercase block leading-none">Category</span>
                <span className="font-display font-bold text-xs text-white truncate block mt-1">{lobbyRoom.battleType}</span>
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
                <FaChartBar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-gray-500 font-bold uppercase block leading-none">Difficulty</span>
                <span className="font-display font-bold text-xs text-white truncate block mt-1">{lobbyRoom.settings?.difficulty || 'Medium'}</span>
              </div>
            </div>

            {/* Questions count */}
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-neon-green/10 text-neon-green flex items-center justify-center shrink-0">
                <FaListUl className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-gray-500 font-bold uppercase block leading-none">Questions</span>
                <span className="font-display font-bold text-xs text-white truncate block mt-1">{lobbyRoom.settings?.questionsCount || 5}</span>
              </div>
            </div>

            {/* Time Per Q */}
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 text-neon-cyan flex items-center justify-center shrink-0">
                <FaRegClock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-gray-500 font-bold uppercase block leading-none">Time Per Q</span>
                <span className="font-display font-bold text-xs text-white truncate block mt-1">{lobbyRoom.settings?.timeLimit || 30} sec</span>
              </div>
            </div>

            {/* Battle Type */}
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-neon-pink/10 text-neon-pink flex items-center justify-center shrink-0">
                <FaUserGroup className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-gray-500 font-bold uppercase block leading-none">Battle Type</span>
                <span className="font-display font-bold text-xs text-white truncate block mt-1">1v1</span>
              </div>
            </div>

            {/* Privacy */}
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
                {lobbyRoom.settings?.isPrivate ? <FaLock className="w-5 h-5" /> : <FaUnlock className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-gray-500 font-bold uppercase block leading-none">Privacy</span>
                <span className="font-display font-bold text-xs text-white truncate block mt-1">{lobbyRoom.settings?.isPrivate ? 'Private' : 'Public'}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-neon-purple/10 text-neon-purple">
                <FaLock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">Only invited players can join this battle</p>
                <p className="text-[10px] text-gray-500 mt-0.5">No spectators allowed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action button deck */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={handleLeaveLobby}
            disabled={lobbyLoading}
            className="py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/5 text-gray-300 font-display font-bold text-sm tracking-wider uppercase transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-center"
          >
            Cancel Battle
          </button>

          {isHost ? (
            <button
              onClick={handleStartBattle}
              disabled={!guest || !isMeReady || !isOpponentReady || lobbyLoading}
              className={`col-span-2 py-4 rounded-xl font-display font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all border border-transparent
                ${(!guest || !isMeReady || !isOpponentReady || lobbyLoading)
                  ? 'bg-purple-950/20 text-purple-700/60 cursor-not-allowed border-purple-950/10'
                  : 'bg-gradient-to-r from-neon-purple to-neon-pink text-white shadow-lg shadow-neon-purple/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                }`}
            >
              <span>{(!guest) ? 'Waiting for opponent' : (!isMeReady || !isOpponentReady ? 'Waiting for players ready' : lobbyLoading ? 'Preparing Battle...' : 'Start Battle')}</span>
              <FaPlay className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleToggleReady}
              disabled={lobbyLoading}
              className={`col-span-2 py-4 rounded-xl font-display font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all border disabled:opacity-50 disabled:cursor-not-allowed
                ${isMeReady
                  ? 'bg-neon-green/10 text-neon-green border-neon-green/30 hover:bg-neon-green/20'
                  : 'bg-neon-purple text-white border-transparent hover:bg-neon-purple/95'
                } cursor-pointer`}
            >
              <span>{isMeReady ? 'Cancel Ready' : 'I am Ready'}</span>
              <FaPlay className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // State 2: Searching Spinner
  if (status === 'searching') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-fade-in">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-t-neon-purple border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-b-neon-pink border-t-transparent border-r-transparent border-l-transparent animate-spin-reverse opacity-70"></div>
          <div className="absolute inset-4 rounded-full border-4 border-r-neon-cyan border-t-transparent border-b-transparent border-l-transparent animate-spin opacity-50"></div>
        </div>
        <h2 className="font-display font-black text-xl text-white tracking-widest uppercase">Matchmaking corridor</h2>
        <p className="text-xs text-purple-300 animate-pulse text-center max-w-sm">
          {searchStatusMsg}
        </p>

        <button
          onClick={handleCancelSearch}
          className="px-6 py-2.5 rounded-xl border border-neon-pink/20 bg-neon-pink/5 hover:bg-neon-pink/15 text-neon-pink transition-all font-display font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          Cancel Queue
        </button>
      </div>
    );
  }

  // State 3: Conclusion Screen
  if (status === 'concluded' && battleResult) {
    const isMeWinner = battleResult.winnerId === userProfile?.uid;
    const isDraw = battleResult.winnerId === 'draw';

    let splashTitle = 'BATTLE DRAW';
    let splashClass = 'text-gray-400';

    const myDeltas = (battleResult as any).playerDeltas?.[userProfile?.uid || ''];
    const eloVal = myDeltas?.elo;
    const xpVal = myDeltas?.xp;
    const coinsVal = myDeltas?.coins;

    let eloChange = eloVal !== undefined ? (eloVal >= 0 ? `+${eloVal}` : `${eloVal}`) : '+0';
    let coinsChange = coinsVal !== undefined ? `+${coinsVal}` : '+0';
    let xpChange = xpVal !== undefined ? `+${xpVal}` : '+0';

    if (!isDraw) {
      if (isMeWinner) {
        splashTitle = 'VICTORY!';
        splashClass = 'text-neon-green drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]';
      } else {
        splashTitle = 'DEFEAT';
        splashClass = 'text-neon-pink drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]';
      }
    }

    return (
      <div className="max-w-xl mx-auto text-center space-y-8 animate-fade-in py-12">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Arena Contest Over</span>
          <h1 className={`font-display font-black text-5xl tracking-widest ${splashClass} mt-2`}>
            {splashTitle}
          </h1>
        </div>

        {/* Comparison results */}
        <div className="glass-panel p-6 rounded-3xl flex justify-between items-center px-12">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">My Score</span>
            <p className="font-display font-black text-3xl text-white mt-1">{playerScore}</p>
          </div>
          <div className="text-xl font-bold text-gray-600 font-display">VS</div>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{opponent?.displayName}</span>
            <p className="font-display font-black text-3xl text-gray-400 mt-1">{opponentProgress.score}</p>
          </div>
        </div>

        {/* Reward details */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1">ELO RATING</span>
            <div className="flex items-center gap-1.5 font-display font-black text-xl text-neon-cyan">
              <FaTrophy className="w-5 h-5" />
              <span>{eloChange}</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1">XP EARNED</span>
            <div className="flex items-center gap-1.5 font-display font-black text-xl text-neon-purple">
              <FaAward className="w-5 h-5" />
              <span>{xpChange}</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1">COINS EARNED</span>
            <div className="flex items-center gap-1.5 font-display font-black text-xl text-yellow-400">
              <FaCoins className="w-5 h-5" />
              <span>{coinsChange}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setStatus('lounge');
            setBattleId(null);
            setOpponent(null);
            setQuestions([]);
          }}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink font-display font-bold text-sm tracking-widest text-white shadow-lg shadow-neon-purple/20 hover:shadow-neon-purple/40 transition-all duration-300 cursor-pointer uppercase"
        >
          Return to Lounge
        </button>
      </div>
    );
  }

  // State 4: Active PvP Contest Screen
  const meAvatar = userProfile?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userProfile?.uid}`;
  const meName = userProfile?.displayName || 'You';

  const oppAvatar = opponent?.userId 
    ? (opponent.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${opponent.userId}`)
    : `https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder`;
  const oppName = opponent?.displayName || 'Opponent';

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const shakeVariants = {
    shake: {
      x: [0, -8, 8, -8, 8, 0],
      transition: { duration: 0.35 }
    }
  };

  const PREFIXES = ['A', 'B', 'C', 'D'];

  if (questions.length === 0 || currentIndex >= questions.length) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg-dark text-center px-6 pb-safe pt-safe">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-t-neon-cyan border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-b-neon-purple border-t-transparent border-r-transparent border-l-transparent animate-spin-reverse opacity-70"></div>
        </div>
        <p className="text-neon-cyan animate-pulse font-display font-bold uppercase tracking-wider text-sm">
          Waiting for competitor to finish...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col justify-between p-4 bg-bg-dark relative overflow-hidden select-none pb-safe pt-safe">
      {/* Floating Status Alerts */}
      <AnimatePresence>
        {battleAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`fixed top-[40%] left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-display font-black text-sm tracking-widest uppercase flex items-center gap-2 shadow-2xl border
              ${battleAlert.type === 'success' 
                ? 'bg-neon-green border-neon-green/45 text-bg-dark shadow-neon-green/30' 
                : battleAlert.type === 'error'
                  ? 'bg-neon-pink border-neon-pink/45 text-white shadow-neon-pink/30'
                  : 'bg-neon-cyan border-neon-cyan/45 text-bg-dark shadow-neon-cyan/30'
              }`}
          >
            {battleAlert.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top row controls */}
      <div className="flex justify-between items-center px-1">
        <button
          onClick={handleLeaveLobby}
          className="flex items-center gap-2 text-xs font-display font-bold text-gray-400 hover:text-white uppercase tracking-wider bg-white/[0.02] border border-white/5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          <FaArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Battle</span>
        </button>
        
        <div className="font-display font-black text-xs md:text-sm text-gray-300 uppercase tracking-widest">
          Problem {currentIndex + 1} / {questions.length}
        </div>
        
        <div className={`font-mono font-black text-xs md:text-sm px-3 py-2 rounded-full border flex items-center gap-1.5 transition-all duration-300
          ${questionTimeLeft <= 5 
            ? 'text-neon-pink border-neon-pink/30 bg-neon-pink/10 animate-pulse' 
            : 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10'
          }`}
        >
          <FaRegClock className="w-3.5 h-3.5" />
          <span>{formatTimer(questionTimeLeft)}</span>
        </div>
      </div>

      {/* Player Cards (Max height 80px) */}
      <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-2 rounded-2xl max-h-[85px] gap-2">
        {/* YOU Card */}
        <div className={`flex items-center gap-2.5 w-[45%] p-2 rounded-xl transition-all duration-300 ${getBackgroundClass(userProfile?.equippedBackground || '')} ${getFrameClass(userProfile?.equippedFrame || '')} overflow-hidden`}>
          <div className="relative shrink-0">
            <div className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center bg-bg-dark transition-all duration-300 ${getRingClass(userProfile?.equippedRing || '')}`}>
              <img
                src={meAvatar}
                className="w-9 h-9 rounded-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-neon-green border border-bg-dark rounded-full"></span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] text-gray-500 uppercase tracking-widest block font-bold leading-none">YOU</p>
            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              <p className="font-display font-bold text-[11px] text-white truncate">{meName}</p>
              {(() => {
                const titleItem = COSMETICS_CATALOG.find(i => i.id === userProfile?.equippedTitle);
                const displayTitle = titleItem ? titleItem.visual : '';
                return displayTitle ? (
                  <span className="text-[7px] text-neon-cyan font-bold uppercase tracking-wider scale-90 origin-left truncate max-w-[50px] shrink-0">{displayTitle}</span>
                ) : null;
              })()}
            </div>
            <p className="font-mono font-black text-xs text-neon-purple mt-0.5 leading-none">{playerScore} pts</p>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1.5">
              <div 
                className="h-full bg-neon-purple transition-all duration-300" 
                style={{ width: `${(currentIndex / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* VS middle label */}
        <div className="text-xs font-black font-display text-gray-600 w-[10%] text-center shrink-0">VS</div>

        {/* OPPONENT Card */}
        <div className={`flex items-center gap-2.5 w-[45%] p-2 rounded-xl transition-all duration-300 ${opponent ? getBackgroundClass(opponent.equippedBackground || '') : ''} ${opponent ? getFrameClass(opponent.equippedFrame || '') : ''} justify-end text-right overflow-hidden`}>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] text-gray-500 uppercase tracking-widest block font-bold leading-none">OPPONENT</p>
            <div className="flex items-center gap-1.5 justify-end mt-0.5 min-w-0">
              {(() => {
                const titleItem = COSMETICS_CATALOG.find(i => i.id === opponent?.equippedTitle);
                const displayTitle = titleItem ? titleItem.visual : '';
                return displayTitle ? (
                  <span className="text-[7px] text-neon-cyan font-bold uppercase tracking-wider scale-90 origin-right truncate max-w-[50px] shrink-0">{displayTitle}</span>
                ) : null;
              })()}
              <p className="font-display font-bold text-[11px] text-white truncate">{oppName}</p>
            </div>
            <p className="font-mono font-black text-xs text-neon-cyan mt-0.5 leading-none">{opponentProgress.score} pts</p>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1.5 flex justify-end">
              <div 
                className="h-full bg-neon-cyan transition-all duration-300" 
                style={{ width: `${(opponentProgress.progressIndex / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="relative shrink-0">
            <div className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center bg-bg-dark transition-all duration-300 ${getRingClass(opponent?.equippedRing || '')}`}>
              <img
                src={oppAvatar}
                className="w-9 h-9 rounded-full object-cover"
              />
            </div>
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border border-bg-dark rounded-full ${opponentProgress.finished ? 'bg-neon-green' : 'bg-gray-500'}`}></span>
          </div>
        </div>
      </div>

      {/* Question Card (~25% of height) */}
      <div className="h-[25vh] min-h-[140px] flex flex-col justify-center px-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="glass-panel p-6 rounded-3xl flex items-center justify-center text-center h-full border border-white/5 shadow-inner overflow-y-auto"
          >
            <p className="font-display font-black text-base md:text-lg text-white leading-relaxed select-text">
              {questions[currentIndex].questionText}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Answer Options list */}
      <div className="flex-1 flex flex-col justify-end space-y-3.5 pb-2">
        {questions[currentIndex].options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === questions[currentIndex].correctOptionIndex;
          
          let btnStyle = 'border-white/5 bg-white/[0.01] text-gray-200 hover:border-white/20 hover:bg-white/[0.03]';
          let shouldShake = false;

          if (selectedOption !== null) {
            if (isSelected) {
              if (isCorrect) {
                btnStyle = 'border-neon-green bg-neon-green/15 text-neon-green shadow-[0_0_20px_rgba(34,197,94,0.3)] font-bold';
              } else {
                btnStyle = 'border-neon-pink bg-neon-pink/15 text-neon-pink shadow-[0_0_20px_rgba(244,63,94,0.3)] font-bold';
                shouldShake = true;
              }
            } else if (isCorrect) {
              btnStyle = 'border-neon-green bg-neon-green/10 text-neon-green font-semibold';
            } else {
              btnStyle = 'border-white/5 bg-white/[0.005] text-gray-600 opacity-40';
            }
          }

          return (
            <motion.button
              key={idx}
              onClick={() => handleAnswerSubmit(idx)}
              disabled={selectedOption !== null}
              whileTap={selectedOption === null ? { scale: 0.96 } : undefined}
              variants={shakeVariants}
              animate={shouldShake ? 'shake' : undefined}
              className={`w-full min-h-[70px] p-4 rounded-2xl border text-left font-sans text-sm md:text-base transition-all duration-300 flex items-center justify-between cursor-pointer disabled:cursor-default shadow-md ${btnStyle}`}
            >
              <div className="flex items-center gap-3.5 pr-2">
                <span className={`w-8 h-8 rounded-full border flex items-center justify-center font-display font-black text-xs shrink-0
                  ${selectedOption !== null && isSelected
                    ? isCorrect 
                      ? 'bg-neon-green/20 border-neon-green text-neon-green'
                      : 'bg-neon-pink/20 border-neon-pink text-neon-pink'
                    : selectedOption !== null && isCorrect
                      ? 'bg-neon-green/20 border-neon-green text-neon-green'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  {PREFIXES[idx]}
                </span>
                <span className="leading-snug select-none">{opt}</span>
              </div>

              {selectedOption !== null && isSelected && (
                <div className="shrink-0">
                  {isCorrect ? (
                    <FaCircleCheck className="w-5 h-5 text-neon-green animate-scale-up" />
                  ) : (
                    <FaCircleXmark className="w-5 h-5 text-neon-pink animate-scale-up" />
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default Battle;
