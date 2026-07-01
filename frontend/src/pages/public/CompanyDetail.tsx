import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { COMPANY_LIST } from './CompanyHub';
import { FaChevronLeft, FaBuilding, FaCircleCheck } from 'react-icons/fa6';

export const CompanyDetail: React.FC = () => {
  const { companyName } = useParams<{ companyName: string }>();
  
  const company = COMPANY_LIST.find(c => c.id === companyName);

  if (!company) {
    return <Navigate to="/company" replace />;
  }

  // Pre-compiled company recruitment details
  const getRecruitmentDetails = (id: string) => {
    switch (id) {
      case 'google':
        return (
          <>
            <h2>Google Recruitment Rounds</h2>
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                <h4 className="font-bold text-white text-xs">Round 1: Online Coding Assessment (OA)</h4>
                <p className="text-[11px] text-gray-400">Two algorithmic challenges on data streams, arrays, or dynamic programming. Time limit: 90 minutes.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                <h4 className="font-bold text-white text-xs">Round 2 & 3: Technical Phone Screen / Video Coding</h4>
                <p className="text-[11px] text-gray-400">Write real-time solutions on shared sandboxes. Evaluated on code optimization, edge cases, and runtime complexities.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                <h4 className="font-bold text-white text-xs">Round 4: Googleyness & Leadership (Behavioral)</h4>
                <p className="text-[11px] text-gray-400">Hypothetical scenarios testing project leadership, communication safety, team collaboration, and alignment with corporate values.</p>
              </div>
            </div>
          </>
        );
      case 'amazon':
        return (
          <>
            <h2>Amazon Recruitment Rounds</h2>
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                <h4 className="font-bold text-white text-xs">Round 1: Online Assessment (Coding + Work Style)</h4>
                <p className="text-[11px] text-gray-400">Debugging coding tasks, standard DSA questions, and a survey mapping candidates to Amazon Leadership Principles.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                <h4 className="font-bold text-white text-xs">Round 2 & 3: SDE Technical Interviews</h4>
                <p className="text-[11px] text-gray-400">Detailed questions on linked lists, stack traversals, hashing algorithms, and basic Object Oriented Design patterns.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                <h4 className="font-bold text-white text-xs">Round 4: Bar Raiser Interview</h4>
                <p className="text-[11px] text-gray-400">High-intensity interview focused heavily on Amazon's 16 Leadership Principles. Grading metrics depend on STAR-structured answers.</p>
              </div>
            </div>
          </>
        );
      default:
        return (
          <>
            <h2>Standard Tier-1 Recruitment Rounds</h2>
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                <h4 className="font-bold text-white text-xs">Round 1: Aptitude & MCQ Assessment</h4>
                <p className="text-[11px] text-gray-400">Tests numerical ability, logical patterns, English vocabulary, and basic programming pseudocodes.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                <h4 className="font-bold text-white text-xs">Round 2: Technical Interview</h4>
                <p className="text-[11px] text-gray-400">Questions testing programming languages (C/C++/Java/Python), SQL queries, normalization, and basic projects.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                <h4 className="font-bold text-white text-xs">Round 3: HR Round</h4>
                <p className="text-[11px] text-gray-400">General behavioral interview evaluating communication readiness, career goals, shift flexibilities, and college background.</p>
              </div>
            </div>
          </>
        );
    }
  };

  useSEO({
    title: `${company.name} Placement Preparation & Interview Guide`,
    description: `Learn how to crack the ${company.name} recruitment rounds. Study standard quantitative questions, dynamic programming topics, and interview questions.`,
    keywords: [
      `${company.name} Placement`,
      `${company.name} Interview Questions`,
      'Company Placement Questions',
      'Campus Placement Preparation'
    ],
    canonicalPath: `/company/${company.id}`
  });

  return (
    <div className="min-h-screen bg-bg-dark text-white gradient-bg flex flex-col justify-between py-12 px-6 md:px-12">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <Link 
          to="/company" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
        >
          <FaChevronLeft className="w-3 h-3" />
          <span>Back to Company Portal</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl border ${company.badgeColor} shrink-0`}>
              <FaBuilding className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-wide">
                {company.name} Prep Guide
              </h1>
              <p className="text-xs text-gray-400 mt-1">Recruitment rounds, interview formats, and prep tips.</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400">
            Difficulty: {company.difficulty}
          </span>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-xs text-gray-300 font-sans space-y-6 max-w-none">
          {getRecruitmentDetails(company.id)}
        </div>

        {/* Action Link */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FaCircleCheck className="text-neon-cyan w-4 h-4" />
            <span className="text-xs text-gray-400 font-medium">Ready to start mock tests for this company?</span>
          </div>
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-display text-[11px] font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Launch Prep Simulator
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
