import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { FaChevronLeft } from 'react-icons/fa6';

export const Privacy: React.FC = () => {
  useSEO({
    title: 'Privacy Policy - Placement Readiness Compliance',
    description: 'Read the privacy policy details for CrackPlace AI, explaining user data encryption, local storage assistant histories, and Firebase access boundaries.',
    canonicalPath: '/privacy'
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
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Last Modified: July 1, 2026</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6 text-xs text-gray-400 leading-relaxed font-sans">
          <div className="space-y-2">
            <h3 className="font-display font-bold text-sm text-white">1. Data Storage Boundaries</h3>
            <p>
              We process secure authorization tokens via Google Firebase Authentication. Dynamic data configurations, including quiz ratings, matching battle configurations, and personalization items, are saved directly in Google Cloud Firestore.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-sm text-white">2. Local Storage AI Histories</h3>
            <p>
              Chat records with the AI Mentor and custom text prompts are cached in your local web browser storage (`localStorage`) to avoid permanent database storage. Unlocking shop cosmetics or claiming daily coins rewards requires database write operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
