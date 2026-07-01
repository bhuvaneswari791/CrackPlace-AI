import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { FaChevronLeft, FaChevronDown } from 'react-icons/fa6';

export const FAQPage: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does the AI determine the difficulty of quizzes?',
      a: 'Quizzes are calibrated using parameter structures matched to standard recruiting tests (TCS, Google, Amazon, etc.). The AI adjusts question complexites dynamically based on your ELO rating and subject selections.'
    },
    {
      q: 'Can colleges track their students progress?',
      a: 'Yes. CrackPlace AI features institutional administrative panels where campus coordinators can view cumulative readiness quotients, ELO deltas, solved coding challenges, and mock HR metrics.'
    },
    {
      q: 'What is placement ELO?',
      a: 'ELO is a dynamic rating score (starting at 1000) that indicates placement readiness. Winning 1v1 PvP Battles or completing coding reviews boosts ELO, representing a cadet higher up in global placement ranks.'
    },
    {
      q: 'Can I practice coding compiler tests on my phone?',
      a: 'Yes! All compiler sandboxes, code reviewers, and gamified MCQs are fully optimized for mobile viewports using touch targets and responsive code layouts.'
    }
  ];

  // Dynamic FAQPage schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(item => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.a
      }
    }))
  };

  useSEO({
    title: 'Frequently Asked Questions - FAQ',
    description: 'Find answers to questions regarding placement ELO matching, dynamic compiler configurations, administrative dashboards, and AI recruiter STAR metrics.',
    canonicalPath: '/faq',
    structuredData: faqSchema
  });

  return (
    <div className="min-h-screen bg-bg-dark text-white gradient-bg flex flex-col justify-between py-12 px-6 md:px-12">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
        >
          <FaChevronLeft className="w-3 h-3" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-4">
          <span className="px-3 py-1 rounded-full bg-neon-purple/20 text-neon-purple font-display text-[10px] font-bold uppercase tracking-wider">
            Knowledge Node
          </span>
          <h1 className="font-display font-black text-3xl text-white tracking-wide">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-sm">
            Quick answers about the CrackPlace training algorithms, ELO calculations, and college integrations.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div 
              key={idx}
              className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
                className="w-full p-5 text-left flex justify-between items-center font-display text-sm font-bold text-white hover:bg-white/[0.01]"
              >
                <span>{item.q}</span>
                <FaChevronDown 
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-300 ${activeIdx === idx ? 'rotate-180 text-white' : ''}`} 
                />
              </button>
              {activeIdx === idx && (
                <div className="p-5 pt-0 text-xs text-gray-400 border-t border-white/5 leading-relaxed bg-black/20">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
