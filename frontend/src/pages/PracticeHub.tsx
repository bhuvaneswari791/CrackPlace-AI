import React from 'react';
import { Link } from 'react-router-dom';
import { FaCode, FaRocket, FaComments } from 'react-icons/fa6';

export const PracticeHub: React.FC = () => {
  const modules = [
    {
      to: '/quiz',
      title: 'AI Quiz Room',
      desc: 'Create personalized technical multiple-choice questions powered by Qwen3 32B model. Track correctness timers.',
      icon: <FaRocket className="w-6 h-6 text-neon-purple" />,
      themeClass: 'glass-panel-neon-purple hover:bg-neon-purple/5 hover:border-neon-purple/30',
      badge: 'MCQ Practice'
    },
    {
      to: '/coding',
      title: 'Coding Arena',
      desc: 'Solve algorithmic challenges directly on your screen. Test, compile, and execute with static AI feedback review dashboards.',
      icon: <FaCode className="w-6 h-6 text-neon-cyan" />,
      themeClass: 'glass-panel-neon-cyan hover:bg-neon-cyan/5 hover:border-neon-cyan/30',
      badge: 'Compiler IDE'
    },
    {
      to: '/hr-interview',
      title: 'HR Practice Simulator',
      desc: 'Practice placement HR rounds using standard STAR grading parameters. Verify vocabulary grammar compliance and professional tone.',
      icon: <FaComments className="w-6 h-6 text-neon-pink" />,
      themeClass: 'glass-panel-neon-pink hover:bg-neon-pink/5 hover:border-neon-pink/30',
      badge: 'STAR Dialog'
    }
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto md:max-w-4xl pb-16 animate-fade-in">
      <div>
        <span className="px-3 py-1 rounded-full bg-neon-cyan/20 text-neon-cyan font-display text-[10px] font-bold uppercase tracking-wider">
          Practice Deck
        </span>
        <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-wide mt-2">
          Training Modules
        </h1>
        <p className="text-gray-400 text-xs md:text-sm mt-1">
          Select a practice workspace to level up your placement readiness index.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((m, idx) => (
          <Link
            key={idx}
            to={m.to}
            className={`p-6 rounded-2xl border border-white/5 bg-bg-dark/40 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 min-h-[220px] ${m.themeClass}`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  {m.icon}
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  {m.badge}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-base text-white">{m.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{m.desc}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white">
              <span>Start Protocol</span>
              <span className="text-neon-cyan">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PracticeHub;
