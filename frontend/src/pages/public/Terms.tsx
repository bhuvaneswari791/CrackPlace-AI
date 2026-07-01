import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { FaChevronLeft } from 'react-icons/fa6';

export const Terms: React.FC = () => {
  useSEO({
    title: 'Terms of Service - Cadet Conduct Protocols',
    description: 'Review the terms of service detailing acceptable ELO matchmaking conduct, coding workspace usages, and college prep operations on CrackPlace AI.',
    canonicalPath: '/terms'
  });

  return (
    <div className="min-h-screen bg-bg-dark text-white gradient-bg flex flex-col justify-between py-12 px-6 md:px-12">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
        >
          <FaChevronLeft className="w-3 h-3" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-4">
          <h1 className="font-display font-black text-3xl text-white tracking-wide">
            Terms of Service
          </h1>
          <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Last Modified: July 1, 2026</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6 text-xs text-gray-400 leading-relaxed font-sans">
          <div className="space-y-2">
            <h3 className="font-display font-bold text-sm text-white">1. Acceptable Prep Conduct</h3>
            <p>
              Cadets must prep honestly. Cheating during real-time PvP Battle Arenas (e.g. running scripts or scrapers to auto-solve MCQs) will trigger automatic ELO point penalties and potential account locks by system admins.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-sm text-white">2. Administrative Authority</h3>
            <p>
              We reserve the right to review mock logs, reset ELO deltas, delete expired invite battleRooms, and adjust customization coin items inside the store for balance compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
