import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FaCircleExclamation } from 'react-icons/fa6';

interface RoomDetails {
  roomId: string;
  hostName: string;
  hostAvatar: string;
  battleType: string;
  settings: {
    questionsCount: number;
    difficulty: string;
    timeLimit: number;
    category: string;
    company: string;
  };
  status: string;
  expirationTime: string;
}

export const Invite: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { token, authUser, loading: authLoading } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomDetails | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      if (roomId) {
        sessionStorage.setItem('pending_invite', roomId);
      }
      navigate('/login');
      return;
    }

    const fetchRoomInfo = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch(`/api/auth/battle-room/info/${roomId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch invite details');
        }

        setRoom(data.room);
        navigate(`/battle?room=${data.room.roomId}`, { replace: true });
      } catch (err: any) {
        setErrorMsg(err.message || 'Invitation is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomInfo();
    }
  }, [roomId, authUser, authLoading, token, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center space-y-4 text-white">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-neon-purple border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-b-neon-pink border-t-transparent border-r-transparent border-l-transparent animate-spin-reverse opacity-70"></div>
        </div>
        <div className="text-center space-y-1">
          <p className="font-display text-sm tracking-widest text-purple-300 font-bold uppercase animate-pulse">
            {authLoading ? 'Checking account...' : 'Decrypting Combat Coordinates...'}
          </p>
          {authLoading && (
            <>
              <p className="font-display text-xs tracking-wider text-gray-400">
                Loading your session...
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Please wait...
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-panel-neon-pink p-8 rounded-3xl text-center space-y-6 animate-scale-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-pink/15 text-neon-pink">
            <FaCircleExclamation className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-black text-xl text-white">Lobby Inaccessible</h2>
            <p className="text-xs text-gray-400 leading-relaxed">{errorMsg}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-display font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      {room && (
        <div className="w-full max-w-md glass-panel-neon-purple p-8 rounded-3xl text-center space-y-8 relative overflow-hidden animate-scale-up">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={room.hostAvatar}
                alt={room.hostName}
                className="w-20 h-20 rounded-2xl border border-neon-purple/40 bg-purple-950/20 object-cover mx-auto"
              />
              <span className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-1.5 rounded-lg text-[10px] font-black leading-none">
                VS
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neon-cyan block mb-1">
                COMBAT CHALLENGE
              </span>
              <h2 className="font-display font-black text-xl text-white">
                {room.hostName} invites you to battle!
              </h2>
            </div>
          </div>

          {/* Battle details configuration cards */}
          <div className="glass-panel p-5 rounded-2xl space-y-4 text-left">
            <h4 className="font-display font-bold text-xs text-white border-b border-white/5 pb-2">
              Lobby Configuration Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Category</span>
                <span className="font-display font-bold text-white mt-0.5 block">{room.battleType}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Difficulty</span>
                <span className="font-display font-bold text-white mt-0.5 block">{room.settings.difficulty}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Questions</span>
                <span className="font-display font-bold text-white mt-0.5 block">{room.settings.questionsCount} Items</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Time Limit</span>
                <span className="font-display font-bold text-white mt-0.5 block">{room.settings.timeLimit}s / Q</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/battle?room=${room.roomId}`)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-display font-bold text-xs tracking-wider uppercase shadow-lg shadow-neon-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              ACCEPT CHALLENGE & PLAY
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-display font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
            >
              Decline Invite
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invite;
