import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { FaGraduationCap, FaCircleCheck, FaChevronLeft } from 'react-icons/fa6';

export const About: React.FC = () => {
  useSEO({
    title: 'About Us - Our Mission & Vision',
    description: 'Learn about CrackPlace AI, our AI-powered learning paradigms, ELO placement matchups, and how we are redefining campus recruitment.',
    canonicalPath: '/about',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      'name': 'About CrackPlace AI',
      'description': 'Mission and details of the CrackPlace AI placement preparation platform.'
    }
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
          <span className="px-3 py-1 rounded-full bg-neon-purple/20 text-neon-purple font-display text-[10px] font-bold uppercase tracking-wider">
            Our Mission
          </span>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white tracking-wide">
            About CrackPlace AI
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            CrackPlace AI is an elite technical training corridor designed to prepare college students for rigorous corporate recruitment assessments. By combining state-of-the-art AI mentors, structured coding compilers, behavioral analysis models, and gamified PvP corridors, we make preparation engaging, measurable, and highly successful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="p-2.5 rounded-lg bg-neon-purple/10 text-neon-purple w-fit">
              <FaGraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-sm text-white">Interactive Training</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              We replace boring lectures with active retrieval practices. Students solve dynamic quizzes and write compile-tested solutions, logging data metrics on every attempt.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="p-2.5 rounded-lg bg-neon-cyan/10 text-neon-cyan w-fit">
              <FaCircleCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-sm text-white">Recruitment Grading</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Our AI interview system evaluates candidates based on professional vocabularies, STAR logical framing, and exact grammatical syntax, helping correct conversational gaps instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
