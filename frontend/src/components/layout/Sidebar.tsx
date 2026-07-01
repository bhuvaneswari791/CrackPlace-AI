import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  FaHouse, 
  FaCircleQuestion, 
  FaCode, 
  FaComments, 
  FaGamepad, 
  FaBookOpen, 
  FaUserShield,
  FaRightFromBracket,
  FaStore,
  FaTrophy
} from 'react-icons/fa6';

export const Sidebar: React.FC = () => {
  const { userProfile, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <FaHouse className="w-5 h-5" /> },
    { to: '/quiz', label: 'AI Quiz', icon: <FaCircleQuestion className="w-5 h-5" /> },
    { to: '/coding', label: 'Coding Workspace', icon: <FaCode className="w-5 h-5" /> },
    { to: '/hr-interview', label: 'HR Practice', icon: <FaComments className="w-5 h-5" /> },
    { to: '/battle', label: 'Battle Arena', icon: <FaGamepad className="w-5 h-5" /> },
    { to: '/leaderboard', label: 'Rankings', icon: <FaTrophy className="w-5 h-5" /> },
    { to: '/store', label: 'Armory Shop', icon: <FaStore className="w-5 h-5" /> },
    { to: '/study-notes', label: 'Study Notes', icon: <FaBookOpen className="w-5 h-5" /> },
  ];

  const isAdmin = userProfile?.role === 'admin';

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex flex-col w-64 border-r border-white/5 bg-bg-dark/80 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-white/5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-pink shadow-lg shadow-neon-purple/25">
          <span className="font-display font-black text-xl text-white">C</span>
        </div>
        <div>
          <h1 className="font-display font-bold text-base leading-tight tracking-wider bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            CRACKPLACE AI
          </h1>
          <span className="text-[10px] uppercase font-bold tracking-widest text-neon-cyan">
            V1.0.0
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-3">
          Core Training
        </span>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 font-display text-sm font-medium group
              ${isActive 
                ? 'bg-neon-purple/15 text-white border-l-4 border-neon-purple shadow-inner' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
              }
            `}
          >
            <span className="transition-transform duration-300 group-hover:scale-110">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="pt-6 mt-6 border-t border-white/5">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-3">
              Administration
            </span>
            <NavLink
              to="/admin"
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 font-display text-sm font-medium group
                ${isActive 
                  ? 'bg-neon-cyan/15 text-white border-l-4 border-neon-cyan' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                }
              `}
            >
              <FaUserShield className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span>Admin Panel</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* User Footer Profile */}
      {userProfile && (() => {
        let frameClass = 'border border-neon-purple/30';
        if (userProfile.unlockedFrames?.includes('frame_ai_master')) {
          frameClass = 'border-2 border-neon-cyan shadow-lg shadow-neon-cyan/40 animate-pulse';
        } else if (userProfile.unlockedFrames?.includes('frame_antigravity')) {
          frameClass = 'border-2 border-neon-purple shadow-lg shadow-neon-purple/40 animate-pulse';
        } else if (userProfile.unlockedFrames?.includes('frame_silicon')) {
          frameClass = 'border-2 border-yellow-500 shadow-md shadow-yellow-500/20';
        } else if (userProfile.unlockedFrames?.includes('frame_mystery_elite')) {
          frameClass = 'border-2 border-neon-green shadow-lg shadow-neon-green/30';
        }

        return (
          <div className="p-4 border-t border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName}
                className={`w-10 h-10 rounded-xl bg-purple-950/20 object-cover ${frameClass}`}
              />
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm text-white truncate">
                {userProfile.displayName}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neon-purple truncate">
                Level {userProfile.level} • {userProfile.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-lg border border-white/5 hover:border-neon-pink/30 hover:bg-neon-pink/10 hover:text-neon-pink transition-all duration-300 text-gray-400 font-display text-xs font-semibold uppercase tracking-wider"
          >
            <FaRightFromBracket className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      );
    })()}
    </aside>
  );
};

export default Sidebar;
