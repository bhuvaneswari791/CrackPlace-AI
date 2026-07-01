import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { FaAward, FaCoins, FaCircleCheck } from 'react-icons/fa6';

interface Mission {
  id: string;
  title: string;
  actionKey: string;
  target: number;
  current: number;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  claimed: boolean;
}

export const MissionsDeck: React.FC = () => {
  const { userProfile, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  if (!userProfile || !userProfile.missionsState) return null;

  const missionsState = userProfile.missionsState;
  const list: Mission[] = activeTab === 'daily'
    ? missionsState.dailyMissions || []
    : activeTab === 'weekly'
    ? missionsState.weeklyMissions || []
    : missionsState.monthlyMissions || [];

  const handleClaimReward = async (missionId: string) => {
    setClaimingId(missionId);
    try {
      const res = await fetch('/api/auth/missions/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ missionId })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to claim reward');
      }
      const data = await res.json();
      
      // Update state inside authStore manually to reflect reward increment instantly
      useAuthStore.setState({ userProfile: data.profile });
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Claim failed');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl space-y-4">
      {/* Header & Tabs */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400">
          Placement Missions
        </h3>
        
        {/* Tab Controls */}
        <div className="flex gap-1 bg-white/[0.02] border border-white/5 p-1 rounded-xl">
          {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-neon-purple/20 text-neon-purple shadow-sm'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Mission Cards list */}
      <div className="space-y-3">
        {list.map((m: Mission) => {
          const progressPercent = Math.min((m.current / m.target) * 100, 100);
          return (
            <div
              key={m.id}
              className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between gap-3 ${
                m.claimed
                  ? 'border-white/5 bg-white/[0.01] opacity-50'
                  : m.completed
                  ? 'border-neon-green/20 bg-neon-green/5'
                  : 'border-white/5 bg-white/[0.01]'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h4 className="font-display font-semibold text-xs text-white">
                    {m.title}
                  </h4>
                  <p className="text-[10px] text-gray-500">
                    Progress: {m.current} / {m.target}
                  </p>
                </div>

                {/* Claim Trigger / Status */}
                {m.claimed ? (
                  <span className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    <FaCircleCheck className="w-3.5 h-3.5 text-gray-600" />
                    <span>Claimed</span>
                  </span>
                ) : m.completed ? (
                  <button
                    onClick={() => handleClaimReward(m.id)}
                    disabled={claimingId !== null}
                    className="px-3 py-1.5 rounded-lg bg-neon-green hover:bg-neon-green/80 text-black font-display font-bold text-[9px] uppercase tracking-wider shadow-md shadow-neon-green/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {claimingId === m.id ? 'Claiming...' : 'Claim Reward'}
                  </button>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Active
                  </span>
                )}
              </div>

              {/* Progress Bar & Rewards Info */}
              <div className="flex items-center justify-between gap-6 pt-1">
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.completed ? 'bg-neon-green' : 'bg-neon-purple'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {/* Reward tokens */}
                <div className="flex items-center gap-2.5 shrink-0 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-neon-purple">
                    <FaAward className="w-3.5 h-3.5" />
                    <span>+{m.xpReward} XP</span>
                  </span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <FaCoins className="w-3.5 h-3.5" />
                    <span>+{m.coinReward}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {list.length === 0 && (
          <p className="text-center text-xs text-gray-500 italic py-6">
            Missions clearing out. Check back later.
          </p>
        )}
      </div>
    </div>
  );
};

export default MissionsDeck;
