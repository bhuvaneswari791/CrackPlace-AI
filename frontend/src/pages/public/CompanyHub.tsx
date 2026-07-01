import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { FaChevronLeft, FaBuilding, FaAnglesRight } from 'react-icons/fa6';

export interface CompanyPrepItem {
  id: string;
  name: string;
  roundsCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  badgeColor: string;
}

export const COMPANY_LIST: CompanyPrepItem[] = [
  {
    id: 'google',
    name: 'Google',
    roundsCount: 5,
    difficulty: 'Hard',
    description: 'Algorithmic dynamic programming, complex tree traversals, and Googleyness & Leadership rounds.',
    badgeColor: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    roundsCount: 4,
    difficulty: 'Hard',
    description: 'System design fundamentals, key Leadership Principles behavioral questions, and core DSA rounds.',
    badgeColor: 'text-neon-pink bg-neon-pink/10 border-neon-pink/20'
  },
  {
    id: 'tcs',
    name: 'TCS',
    roundsCount: 3,
    difficulty: 'Easy',
    description: 'Quantitative aptitude models, logical reasoning, core OOP fundamentals, and standard HR questions.',
    badgeColor: 'text-green-400 bg-green-400/10 border-green-400/20'
  },
  {
    id: 'infosys',
    name: 'Infosys',
    roundsCount: 3,
    difficulty: 'Medium',
    description: 'Technical pseudo-codes, analytical puzzle solving, and structured grammar verbal assessments.',
    badgeColor: 'text-neon-purple bg-neon-purple/10 border-neon-purple/20'
  },
  {
    id: 'zoho',
    name: 'Zoho',
    roundsCount: 4,
    difficulty: 'Medium',
    description: 'Advanced C programming debugs, database normalization query runs, and app prototype creation.',
    badgeColor: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    roundsCount: 5,
    difficulty: 'Hard',
    description: 'Array modifications, linked list reversals, system architecture layouts, and behavioral rounds.',
    badgeColor: 'text-neon-orange bg-neon-orange/10 border-neon-orange/20'
  }
];

export const CompanyHub: React.FC = () => {
  useSEO({
    title: 'Company Placement Recruitment Preparation Hub',
    description: 'Access detailed campus recruitment prep guides for Google, Amazon, TCS, Zoho, Infosys, and Microsoft. Verify interview formats and sample questions.',
    canonicalPath: '/company',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      'name': 'CrackPlace AI Company Hub',
      'description': 'Recruitment guides and training metrics for top-tier companies.'
    }
  });

  return (
    <div className="min-h-screen bg-bg-dark text-white gradient-bg flex flex-col justify-between py-12 px-6 md:px-12">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
        >
          <FaChevronLeft className="w-3 h-3" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-4">
          <span className="px-3 py-1 rounded-full bg-neon-purple/20 text-neon-purple font-display text-[10px] font-bold uppercase tracking-wider">
            Preparation Matrix
          </span>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white tracking-wide">
            Company Placement Guides
          </h1>
          <p className="text-gray-400 text-sm">
            Select a target company to explore recruitment workflows, round counts, and sample question frameworks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {COMPANY_LIST.map(comp => (
            <Link
              key={comp.id}
              to={`/company/${comp.id}`}
              className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 hover:bg-white/[0.01] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className={`p-2.5 rounded-lg border ${comp.badgeColor}`}>
                    <FaBuilding className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 bg-white/5 px-2.5 py-0.5 rounded-full">
                    {comp.difficulty}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  {comp.name} Preparation Outline
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {comp.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <span>{comp.roundsCount} Interview Rounds</span>
                <span className="text-neon-cyan flex items-center gap-1">
                  <span>Enter Corridor</span>
                  <FaAnglesRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyHub;
