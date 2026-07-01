import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { FaCrown, FaTrophy, FaMagnifyingGlass } from 'react-icons/fa6';

interface LeaderboardUser {
  uid: string;
  displayName: string;
  photoURL: string;
  level: number;
  battleRating: number;
  xp: number;
}

export const Leaderboards: React.FC = () => {
  const { token, userProfile } = useAuthStore();
  const [ranks, setRanks] = useState<LeaderboardUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setRanks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const filteredRanks = ranks.filter(r => 
    r.displayName.toLowerCase().includes(search.toLowerCase())
  );

  // Divide into podium and list
  const topThree = filteredRanks.slice(0, 3);
  const remaining = filteredRanks.slice(3);

  // Get podium positioning styles
  const getPodiumOrder = (idx: number) => {
    // 0 -> 1st place (center), 1 -> 2nd place (left), 2 -> 3rd place (right)
    if (idx === 0) return 'order-2 h-44 z-10 border-yellow-500 bg-yellow-500/5 shadow-yellow-500/5';
    if (idx === 1) return 'order-1 h-36 border-slate-300 bg-slate-300/5 shadow-slate-300/5';
    return 'order-3 h-32 border-amber-600 bg-amber-600/5 shadow-amber-600/5';
  };

  const getPodiumBadge = (idx: number) => {
    if (idx === 0) return <div className="absolute -top-6 left-1/2 -translate-x-1/2 p-2.5 rounded-full bg-yellow-500 text-bg-dark border border-yellow-400 shadow-lg shadow-yellow-500/20 animate-bounce"><FaCrown className="w-5 h-5" /></div>;
    if (idx === 1) return <div className="absolute -top-5 left-1/2 -translate-x-1/2 p-2 rounded-full bg-slate-300 text-bg-dark border border-slate-200 shadow-md shadow-slate-300/10"><FaTrophy className="w-4 h-4" /></div>;
    return <div className="absolute -top-5 left-1/2 -translate-x-1/2 p-1.5 rounded-full bg-amber-600 text-bg-dark border border-amber-500 shadow-md shadow-amber-600/10"><FaTrophy className="w-3.5 h-3.5" /></div>;
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto md:max-w-4xl pb-20 animate-fade-in px-4">
      {/* Title */}
      <div>
        <span className="px-3 py-1 rounded-full bg-neon-purple/20 text-neon-purple font-display text-[10px] font-bold uppercase tracking-wider">
          Global Standings
        </span>
        <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-wide mt-2">
          Leaderboard
        </h1>
        <p className="text-gray-400 text-xs md:text-sm mt-1">
          Compete against cadets globally and raise your placement Elo rating.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-neon-purple border-t-transparent animate-spin"></div>
          <p className="text-xs text-gray-500">Loading standings...</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium (Hidden if searching) */}
          {search === '' && topThree.length > 0 && (
            <div className="flex justify-center items-end gap-3 pt-8 pb-4">
              {topThree.map((user, idx) => {
                // Arrange order: 2nd, 1st, 3rd
                const gridOrder = idx === 0 ? 'order-2' : idx === 1 ? 'order-1' : 'order-3';
                const rankText = idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd';
                const scoreColor = idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : 'text-amber-500';

                return (
                  <div
                    key={user.uid}
                    className={`flex-1 relative flex flex-col items-center justify-end rounded-2xl border border-white/5 p-4 text-center shadow-lg backdrop-blur-xl ${getPodiumOrder(idx)} ${gridOrder}`}
                  >
                    {getPodiumBadge(idx)}

                    <div className="space-y-2">
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 bg-white/5"
                      />
                      <div>
                        <h4 className="font-display font-bold text-xs text-white truncate max-w-[80px] md:max-w-[120px] mx-auto">
                          {user.displayName}
                        </h4>
                        <p className="text-[10px] text-gray-500">LV.{user.level} • {rankText}</p>
                      </div>
                      <div className={`font-display font-black text-xs ${scoreColor}`}>
                        {user.battleRating} ELO
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-gray-500">
              <FaMagnifyingGlass className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search cadet rankings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl font-display text-sm text-white focus:outline-none focus:border-neon-purple/50 focus:bg-neon-purple/5 transition-all duration-300"
            />
          </div>

          {/* Active User Rank Highlight */}
          {userProfile && !search && (
            <div className="p-4 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 text-white flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <div className="font-display font-black text-base text-neon-cyan">
                  #{ranks.findIndex(r => r.uid === userProfile.uid) + 1 || '-'}
                </div>
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName}
                  className="w-10 h-10 rounded-lg object-cover border border-white/10 bg-white/5"
                />
                <div>
                  <h4 className="font-display font-bold text-sm text-white">{userProfile.displayName} (You)</h4>
                  <p className="text-[10px] text-neon-cyan/80">Level {userProfile.level} Cadet</p>
                </div>
              </div>
              <div className="font-display font-black text-base text-neon-cyan">
                {userProfile.battleRating} ELO
              </div>
            </div>
          )}

          {/* Rankings List */}
          <div className="space-y-2">
            {(search ? filteredRanks : remaining).map((user, idx) => {
              const actualRank = search ? ranks.indexOf(user) + 1 : idx + 4;
              return (
                <div
                  key={user.uid}
                  className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 font-display font-black text-sm text-gray-500 text-center">
                      #{actualRank}
                    </span>
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-9 h-9 rounded-lg object-cover border border-white/10 bg-white/5"
                    />
                    <div>
                      <h4 className="font-display font-semibold text-xs text-white truncate max-w-[120px] sm:max-w-[200px]">
                        {user.displayName}
                      </h4>
                      <p className="text-[10px] text-gray-500">Level {user.level} • {user.xp} XP</p>
                    </div>
                  </div>
                  <div className="font-display font-bold text-xs text-gray-300">
                    {user.battleRating} ELO
                  </div>
                </div>
              );
            })}

            {filteredRanks.length === 0 && (
              <div className="text-center py-10 text-xs text-gray-500">
                No matching cadets found.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboards;
