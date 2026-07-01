import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { FaFire, FaCoins, FaCrown, FaBars } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { userProfile } = useAuthStore();

  if (!userProfile) return null;

  // Level XP calculations (e.g., Level up requires Level * 500 XP)
  const nextLevelXp = userProfile.level * 500;
  const xpPercentage = Math.min((userProfile.xp / nextLevelXp) * 100, 100);

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-10 flex items-center justify-between px-4 md:px-8 h-20 border-b border-white/5 bg-bg-dark/40 backdrop-blur-xl">
      {/* Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-gray-400 hover:text-white md:hidden transition-all duration-300"
          aria-label="Toggle Menu"
        >
          <FaBars className="w-4.5 h-4.5" />
        </button>
        <div>
          <h2 className="font-display font-bold text-sm md:text-lg text-white">Training Ground</h2>
          <p className="text-[10px] md:text-xs text-gray-400 truncate max-w-[120px] sm:max-w-none">
            Maximize your placement readiness.
          </p>
        </div>
      </div>

      {/* Gamification Stats */}
      <div className="flex items-center gap-2 md:gap-6">
        {/* Streak counter (hidden on very small mobile) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neon-orange/20 bg-neon-orange/5 text-neon-orange shadow-lg shadow-neon-orange/5 animate-pulse">
          <FaFire className="w-3.5 h-3.5" />
          <span className="font-display font-bold text-[10px] md:text-xs">
            {userProfile.dailyStreak}d
          </span>
        </div>

        {/* Coins count */}
        <Link
          to="/store"
          title="Open Armory Shop"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neon-orange/30 bg-yellow-500/5 text-yellow-400 shadow-md shadow-yellow-500/5 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <FaCoins className="w-3.5 h-3.5 text-yellow-500" />
          <span className="font-display font-bold text-[10px] md:text-xs">{userProfile.coins}</span>
        </Link>

        {/* Battle Rating */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan">
          <FaCrown className="w-3.5 h-3.5" />
          <span className="font-display font-bold text-[10px] md:text-xs">{userProfile.battleRating}</span>
        </div>

        {/* XP Bar (Hidden on mobile) */}
        <div className="hidden md:flex flex-col w-36">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mb-1">
            <span>LV. {userProfile.level}</span>
            <span>{userProfile.xp} / {nextLevelXp} XP</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden border border-white/5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-pink shadow-glow" 
              style={{ width: `${xpPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Readiness Badge */}
        <div className="flex items-center gap-1.5 pl-2 md:pl-4 border-l border-white/10">
          <div className="text-right">
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none">Readiness</p>
            <p className="font-display font-black text-xs md:text-sm text-neon-green">{userProfile.placementReadinessScore}%</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
