import React from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  FaGraduationCap, 
  FaBriefcase, 
  FaGamepad, 
  FaCode, 
  FaRocket, 
  FaFire, 
  FaCoins, 
  FaCrown 
} from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import MissionsDeck from '../components/MissionsDeck';

export const Dashboard: React.FC = () => {
  const { userProfile } = useAuthStore();

  if (!userProfile) return null;

  const trainingModules = [
    {
      to: '/quiz',
      title: 'AI Quiz Room',
      desc: 'Custom subject MCQ rooms.',
      icon: <FaRocket className="w-5 h-5" />,
      colorClass: 'text-neon-purple bg-neon-purple/10 border-neon-purple/20'
    },
    {
      to: '/coding',
      title: 'Coding Arena',
      desc: 'Algorithmic code editors.',
      icon: <FaCode className="w-5 h-5" />,
      colorClass: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20'
    },
    {
      to: '/battle',
      title: 'PvP Matchmaker',
      desc: 'Challenge peers live.',
      icon: <FaGamepad className="w-5 h-5" />,
      colorClass: 'text-neon-pink bg-neon-pink/10 border-neon-pink/20'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto md:max-w-4xl pb-16">
      {/* Welcome & Readiness Display */}
      <div className="glass-panel-neon-purple p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple font-display text-[9px] font-bold uppercase tracking-wider">
            Protocol Active
          </span>
          <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-wide leading-tight">
            Welcome, <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent">{userProfile.displayName}</span>
          </h1>
          <p className="text-gray-400 text-xs leading-relaxed max-w-sm md:max-w-md">
            Ready to accumulate XP and unlock tier-1 company career badges today?
          </p>
        </div>

        {/* Circular index indicator */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/5 shadow-inner w-full md:w-auto">
          <div className="relative w-12 h-12 flex items-center justify-center rounded-full border border-white/10 bg-black/20">
            <span className="font-display font-black text-xs text-neon-green">{userProfile.placementReadinessScore}%</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 block leading-none">Readiness</span>
            <span className="text-[10px] text-gray-400 mt-1 block">Placement Quotient</span>
          </div>
        </div>
      </div>

      {/* Swipeable Quick Stats Row */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
        <div className="flex-1 min-w-[140px] glass-panel p-4 rounded-xl flex items-center gap-3 snap-start">
          <div className="p-2 rounded-lg bg-neon-orange/10 text-neon-orange">
            <FaFire className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Streak</p>
            <p className="font-display font-bold text-sm text-neon-orange">{userProfile.dailyStreak} Days</p>
          </div>
        </div>

        <Link
          to="/store"
          title="Open Armory Shop"
          className="flex-1 min-w-[140px] glass-panel p-4 rounded-xl flex items-center gap-3 snap-start hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer border border-yellow-500/10"
        >
          <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
            <FaCoins className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Coins</p>
            <p className="font-display font-bold text-sm text-yellow-400">{userProfile.coins}</p>
          </div>
        </Link>

        <div className="flex-1 min-w-[140px] glass-panel p-4 rounded-xl flex items-center gap-3 snap-start">
          <div className="p-2 rounded-lg bg-neon-cyan/10 text-neon-cyan">
            <FaCrown className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Elo</p>
            <p className="font-display font-bold text-sm text-neon-cyan">{userProfile.battleRating}</p>
          </div>
        </div>
      </div>

      {/* Academic Summary Card */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400 border-b border-white/5 pb-2">
          Academic Track
        </h3>
        <div className="flex items-center gap-4">
          <img
            src={userProfile.photoURL}
            alt={userProfile.displayName}
            className="w-12 h-12 rounded-xl object-cover border border-white/10 bg-white/5"
          />
          <div>
            <h4 className="font-display font-bold text-sm text-white">{userProfile.displayName}</h4>
            <p className="text-xs text-gray-400">Cadet Level {userProfile.level} • {userProfile.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <FaGraduationCap className="text-neon-cyan w-4 h-4" />
            <span>{userProfile.college || 'Not set'} ({userProfile.department || 'General'}, Year {userProfile.year})</span>
          </div>
          <div className="flex items-center gap-2">
            <FaBriefcase className="text-neon-pink w-4 h-4" />
            <span>Dream Goal: <strong className="text-white">{userProfile.dreamCompany || 'Tier-1 Company'}</strong></span>
          </div>
        </div>
      </div>

      {/* Missions Deck */}
      <MissionsDeck />

      {/* Training Hub Modules list */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400 px-1">
          Quick Launch Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trainingModules.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className={`p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 flex items-center justify-between group`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg border ${item.colorClass}`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs text-white">{item.title}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
              <span className="text-gray-500 group-hover:text-white transition-all text-xs">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
