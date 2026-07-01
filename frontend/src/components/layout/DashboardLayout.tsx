import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet, NavLink } from 'react-router-dom';
import AIAssistant from '../AIAssistant';
import { FaHouse, FaCode, FaGamepad, FaTrophy, FaUser, FaXmark } from 'react-icons/fa6';
import { useAuthStore } from '../../store/authStore';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const DashboardLayout: React.FC = () => {
  const { userProfile, logout } = useAuthStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loginReward, setLoginReward] = useState<{ day: number; xp: number; coins: number; mysteryBox: boolean } | null>(null);

  useEffect(() => {
    const handleReward = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setLoginReward(detail);
    };
    window.addEventListener('login-reward-claimed', handleReward);
    return () => window.removeEventListener('login-reward-claimed', handleReward);
  }, []);
  const [activeToast, setActiveToast] = useState<{ id: string; type: string; title: string; message: string } | null>(null);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userProfile.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const notifData = change.doc.data();
          const notifId = change.doc.id;
          
          setActiveToast({
            id: notifId,
            type: notifData.type,
            title: notifData.title,
            message: notifData.message
          });

          // Mark as read immediately
          try {
            await updateDoc(doc(db, 'notifications', notifId), { read: true });
          } catch (err) {
            console.error('Failed to mark notification as read:', err);
          }
        }
      });
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);
  const bottomNavItems = [
    { to: '/dashboard', label: 'Home', icon: <FaHouse className="w-4 h-4" /> },
    { to: '/practice', label: 'Practice', icon: <FaCode className="w-4 h-4" /> },
    { to: '/battle', label: 'Battle', icon: <FaGamepad className="w-4 h-4" /> },
    { to: '/leaderboard', label: 'Rankings', icon: <FaTrophy className="w-4 h-4" /> },
    { to: '/profile', label: 'Profile', icon: <FaUser className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-bg-dark text-white gradient-bg">
      {/* Desktop Left Sidebar */}
      <div className="hidden md:block hide-in-battle">
        <Sidebar />
      </div>

      {/* Mobile Slide Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-bg-dark/60 backdrop-blur-sm">
          <div className="w-64 bg-bg-dark border-r border-white/5 p-6 space-y-6 flex flex-col justify-between animate-slide-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-lg text-white">More Options</span>
                <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-white">
                  <FaXmark className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2">
                <NavLink
                  to="/study-notes"
                  onClick={() => setIsDrawerOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-display text-sm font-medium
                    ${isActive ? 'bg-neon-purple/15 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <span>Study Notes</span>
                </NavLink>
                <NavLink
                  to="/store"
                  onClick={() => setIsDrawerOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-display text-sm font-medium
                    ${isActive ? 'bg-neon-purple/15 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <span>Armory Shop</span>
                </NavLink>
                {userProfile?.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    onClick={() => setIsDrawerOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-display text-sm font-medium
                      ${isActive ? 'bg-neon-cyan/15 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    `}
                  >
                    <span>Admin Panel</span>
                  </NavLink>
                )}
              </nav>
            </div>

            {userProfile && (
              <button
                onClick={logout}
                className="w-full py-3 rounded-xl border border-neon-pink/20 text-neon-pink font-display text-xs font-bold uppercase tracking-wider hover:bg-neon-pink/5"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="pl-0 md:pl-64 min-h-screen flex flex-col pb-20 md:pb-0 main-content-area">
        <div className="hide-in-battle">
          <Navbar onMenuClick={() => setIsDrawerOpen(true)} />
        </div>
        
        <main className="flex-1 pt-24 px-4 md:px-8 pb-8 overflow-y-auto w-full max-w-7xl mx-auto main-wrapper">
          <Outlet />
        </main>
      </div>

      {/* Sticky Bottom Navigation Bar (Mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 h-16 bg-bg-dark/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around md:hidden px-2 pb-safe hide-in-battle">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full py-1 text-center font-display text-[9px] font-bold tracking-wider transition-all duration-300
              ${isActive ? 'text-neon-purple scale-105' : 'text-gray-500 hover:text-white'}
            `}
          >
            <span className="mb-0.5">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Global Floating AI assistant */}
      <div className="hide-in-battle">
        <AIAssistant />
      </div>

      {/* Daily Login Reward Modal Dialog */}
      {loginReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel-neon-purple p-8 rounded-3xl max-w-sm w-full text-center space-y-6 animate-scale-up relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-neon-purple to-neon-pink shadow-lg shadow-neon-purple/20 animate-bounce">
              <span className="font-display text-2xl">🎁</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-black text-xl text-white">Daily Login Reward!</h2>
              <p className="text-xs text-neon-cyan font-bold uppercase tracking-wider">Day {loginReward.day} / 7 claimed</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">XP Granted</span>
                <span className="font-display font-black text-sm text-neon-purple">+{loginReward.xp} XP</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Coins Awarded</span>
                <span className="font-display font-black text-sm text-yellow-400">+{loginReward.coins}</span>
              </div>
            </div>

            {loginReward.mysteryBox && (
              <div className="p-3 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 text-[11px] text-neon-cyan font-bold animate-pulse">
                🎉 Week Complete: 1 Mystery Box Unlocked!
              </div>
            )}

            <button
              onClick={() => setLoginReward(null)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-display font-bold text-xs tracking-wider uppercase shadow-lg shadow-neon-purple/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Collect Rewards
            </button>
          </div>
        </div>
      )}
      {/* Real-time Toast Notifications */}
      {activeToast && (
        <div className="fixed top-24 right-4 z-50 max-w-sm w-full bg-bg-dark/95 backdrop-blur-xl border border-neon-cyan/25 p-4 rounded-2xl flex items-start gap-3.5 shadow-2xl shadow-neon-cyan/10 animate-slide-in-right">
          <div className="p-2 rounded-xl bg-neon-cyan/15 text-neon-cyan shrink-0">
            {activeToast.type === 'level_up' ? '🎉' : '🏆'}
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-display font-bold text-xs text-white">
              {activeToast.title}
            </h4>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              {activeToast.message}
            </p>
          </div>
          <button 
            onClick={() => setActiveToast(null)}
            className="text-gray-500 hover:text-white text-xs font-bold font-display cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
