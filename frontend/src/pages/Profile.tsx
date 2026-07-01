import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { getRingClass, getBackgroundClass, getFrameClass } from '../config/cosmetics';

const getAvatarUrl = (visual: string) => {
  if (!visual) return 'https://api.dicebear.com/7.x/adventurer/svg?seed=programmer';
  if (visual.startsWith('http')) return visual;
  if (visual === 'ai_robot' || visual === 'martian' || visual === 'robot_cat' || visual === 'cyber_dog') {
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${visual}`;
  }
  if (visual === 'pixel_hero' || visual === '8bit_knight') {
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${visual}`;
  }
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${visual}`;
};
import { 
  FaCrown, 
  FaFire, 
  FaCoins, 
  FaTrophy, 
  FaGraduationCap, 
  FaBriefcase, 
  FaRightFromBracket,
  FaAward
} from 'react-icons/fa6';

export const Profile: React.FC = () => {
  const { userProfile, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'achievements' | 'history'>('achievements');
  const [history, setHistory] = React.useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState(false);

  React.useEffect(() => {
    if (activeTab === 'history' && token) {
      setLoadingHistory(true);
      fetch('/api/auth/battle/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setHistory(data.history || []);
          setLoadingHistory(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingHistory(false);
        });
    }
  }, [activeTab, token]);

  if (!userProfile) return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const getXpRequiredForLevel = (lvl: number): number => {
    if (lvl <= 1) return 100;
    let total = 100;
    for (let i = 2; i <= lvl; i++) {
      total += 50 + 100 * (i - 1);
    }
    return total;
  };

  const calculateLevelDetails = (xp: number) => {
    let lvl = 1;
    while (true) {
      const requiredForNext = getXpRequiredForLevel(lvl);
      if (xp < requiredForNext) {
        break;
      }
      lvl++;
    }
    const currentLvlBaseXp = lvl === 1 ? 0 : getXpRequiredForLevel(lvl - 1);
    const nextLvlRequiredXp = getXpRequiredForLevel(lvl);
    const progress = xp - currentLvlBaseXp;
    const required = nextLvlRequiredXp - currentLvlBaseXp;
    return { level: lvl, progress, required, percentage: Math.min((progress / required) * 100, 100) };
  };

  const lvlDetails = calculateLevelDetails(userProfile.xp || 0);

  // Sync achievements with backend list
  const ACHIEVEMENTS = [
    { id: 'first_quiz', title: 'First Step', desc: 'Complete your first subject placement quiz.', icon: '📝' },
    { id: 'solve_100', title: 'Centurion Scholar', desc: 'Solve 100 questions total across quizzes.', icon: '💯' },
    { id: 'solve_500', title: 'Elite Cadet', desc: 'Solve 500 questions total across training decks.', icon: '🎓' },
    { id: 'streak_7', title: 'Consistent Routine', desc: 'Maintain a prep daily active streak of 7 days.', icon: '🔥' },
    { id: 'streak_30', title: 'Unstoppable Habit', desc: 'Maintain a prep daily active streak of 30 days.', icon: '⚡' },
    { id: 'coding_master', title: 'Algorithmic Master', desc: 'Successfully pass compiler checks on 5 coding challenges.', icon: '💻' },
    { id: 'hr_expert', title: 'Dialogue Pro', desc: 'Complete 3 full HR director mock interviews.', icon: '💼' },
    { id: 'battle_champion', title: 'Arena Gladiator', desc: 'Secure 5 wins inside the live PvP Matchmaker.', icon: '⚔️' },
    { id: 'placement_ready', title: 'Industry Ready', desc: 'Reach a Placement Readiness quotient of 80% or higher.', icon: '🚀' }
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto md:max-w-4xl pb-24 px-4 animate-fade-in">
      {/* Profile Header Card */}
      <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col items-center text-center space-y-4 transition-all duration-500 ${getBackgroundClass(userProfile.equippedBackground || '')} ${getFrameClass(userProfile.equippedFrame || '')}`}>
        {/* Background gradient orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Ring and Avatar */}
        <div className="relative z-10">
          <div className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-bg-dark transition-all duration-300 ${getRingClass(userProfile.equippedRing || '')}`}>
            <img
              src={getAvatarUrl(userProfile.equippedAvatar || userProfile.photoURL)}
              alt={userProfile.displayName}
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-1 z-10">
          <h2 className="font-display font-black text-xl text-white">{userProfile.displayName}</h2>
          {userProfile.equippedTitle && (
            <span className="inline-block px-2.5 py-0.5 rounded bg-white/10 border border-white/10 text-[9px] text-neon-cyan font-bold uppercase tracking-widest shadow mb-1">
              {userProfile.equippedTitle}
            </span>
          )}
          <p className="text-xs text-neon-cyan font-bold uppercase tracking-wider">
            Level {lvlDetails.level} • {userProfile.role}
          </p>
        </div>

        {/* Customize Locker Button */}
        <button
          onClick={() => navigate('/personalization')}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-display font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer z-10"
        >
          🎨 Customize Profile
        </button>

        {/* XP Level Progress Bar */}
        <div className="w-full max-w-xs space-y-1.5 z-10">
          <div className="flex justify-between text-[10px] font-bold text-gray-400">
            <span>Progress to Next Level</span>
            <span>{lvlDetails.progress} / {lvlDetails.required} XP</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden border border-white/5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-pink shadow-glow"
              style={{ width: `${lvlDetails.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-neon-orange/10 text-neon-orange">
            <FaFire className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Streak</p>
            <p className="font-display font-black text-sm text-neon-orange">{userProfile.dailyStreak} Days</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-neon-cyan/10 text-neon-cyan">
            <FaCrown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Elo Rating</p>
            <p className="font-display font-black text-sm text-neon-cyan">{userProfile.battleRating} ELO</p>
          </div>
        </div>

        <Link to="/store" className="glass-panel p-4 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors">
          <div className="p-2.5 rounded-lg bg-yellow-500/10 text-yellow-400">
            <FaCoins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Coins Balance</p>
            <p className="font-display font-black text-sm text-yellow-400">{userProfile.coins} Coins</p>
          </div>
        </Link>

        <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-neon-green/10 text-neon-green">
            <FaTrophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Readiness</p>
            <p className="font-display font-black text-sm text-neon-green">{userProfile.placementReadinessScore}%</p>
          </div>
        </div>
      </div>

      {/* College Info Cards */}
      <div className="glass-panel p-5 rounded-2xl space-y-3.5">
        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400 border-b border-white/5 pb-2">
          Academic Credentials
        </h3>
        <div className="space-y-3 text-xs text-gray-300">
          <div className="flex items-center gap-3">
            <FaGraduationCap className="text-neon-cyan w-5 h-5" />
            <div>
              <p className="font-semibold text-white">{userProfile.college || 'Not Specified'}</p>
              <p className="text-[10px] text-gray-500">{userProfile.department || 'General'}, Year {userProfile.year}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FaBriefcase className="text-neon-pink w-5 h-5" />
            <div>
              <p className="font-semibold text-white">Target Dream Company</p>
              <p className="text-[10px] text-neon-pink uppercase font-bold tracking-wider">{userProfile.dreamCompany || 'Any Tier-1'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex bg-white/[0.02] border border-white/5 p-1 rounded-xl w-full">
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-3 text-center rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${activeTab === 'achievements' ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/20' : 'text-gray-400 hover:text-white'}`}
        >
          Unlocked Achievements
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-center rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${activeTab === 'history' ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/20' : 'text-gray-400 hover:text-white'}`}
        >
          Battle History
        </button>
      </div>

      {/* Conditionally render content */}
      {activeTab === 'achievements' ? (
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400 border-b border-white/5 pb-2 flex items-center gap-2">
            <FaAward className="w-4 h-4 text-neon-purple" />
            <span>Unlocked Achievements</span>
          </h3>
          
          <div className="grid grid-cols-1 gap-2.5">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = userProfile.unlockedAchievements?.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border flex items-center gap-4 transition-all duration-300 ${
                    isUnlocked
                      ? 'border-neon-purple/20 bg-neon-purple/5 text-white'
                      : 'border-white/5 bg-white/[0.01] opacity-40'
                  }`}
                >
                  <div className="text-2xl p-2.5 rounded-lg bg-white/5">
                    {ach.icon}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-white">
                      {ach.title} {!isUnlocked && '🔒'}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{ach.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400 border-b border-white/5 pb-2 flex items-center gap-2">
            <FaTrophy className="w-4 h-4 text-neon-purple" />
            <span>Completed PvP Contests</span>
          </h3>

          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 rounded-full border-2 border-t-neon-purple border-r-transparent border-b-transparent border-l-transparent animate-spin mx-auto"></div>
              <p className="text-xs text-gray-400 mt-2 font-display uppercase tracking-widest animate-pulse">Loading Combat Records...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <span className="text-2xl">⚔️</span>
              <p className="text-xs text-gray-400">No battle records found. Accept coordinates under Battle Arena.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {history.map((item) => {
                const myUid = userProfile.uid;
                const oppUid = Object.keys(item.players || {}).find(uid => uid !== myUid);
                const me = item.players?.[myUid];
                const opp = oppUid ? item.players?.[oppUid] : null;

                const isDraw = item.isDraw;
                const isWinner = item.winnerId === myUid;

                let outcomeText = 'DRAW';
                let outcomeColor = 'text-gray-400 border-gray-500/20 bg-gray-500/5';
                if (!isDraw) {
                  outcomeText = isWinner ? 'VICTORY' : 'DEFEAT';
                  outcomeColor = isWinner 
                    ? 'text-neon-green border-neon-green/20 bg-neon-green/5' 
                    : 'text-neon-pink border-neon-pink/20 bg-neon-pink/5';
                }

                const myEloChange = me?.eloChange !== undefined ? me.eloChange : 0;

                return (
                  <div key={item.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={opp?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${oppUid || 'anon'}`}
                        alt={opp?.displayName || 'Opponent'}
                        className="w-10 h-10 rounded-xl bg-purple-950/20 border border-white/5 object-cover"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider">{item.category} Battle</span>
                        <h4 className="font-display font-bold text-xs text-white">vs {opp?.displayName || 'Anonymous Cadet'}</h4>
                        <p className="text-[9px] text-gray-500 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block">Score</span>
                        <span className="font-display font-black text-xs text-white">{me?.score || 0} - {opp?.score || 0}</span>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block">Elo Rating</span>
                        <span className={`font-display font-black text-xs ${myEloChange >= 0 ? 'text-neon-cyan' : 'text-neon-pink'}`}>
                          {myEloChange >= 0 ? `+${myEloChange}` : myEloChange}
                        </span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase border tracking-wider ${outcomeColor}`}>
                        {outcomeText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sign Out Button */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl border border-neon-pink/20 hover:border-neon-pink/40 hover:bg-neon-pink/10 text-neon-pink transition-all duration-300 font-display text-xs font-semibold uppercase tracking-wider"
      >
        <FaRightFromBracket className="w-4 h-4" />
        <span>Sign Out Protocols</span>
      </button>
    </div>
  );
};

export default Profile;
