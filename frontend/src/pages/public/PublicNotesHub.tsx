import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { FaChevronLeft, FaBookOpen, FaCircleRight } from 'react-icons/fa6';

export interface NotesCategory {
  id: string;
  title: string;
  description: string;
  topicCount: number;
  badgeColor: string;
}

export const NOTES_CATEGORIES: NotesCategory[] = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    description: 'Revisit binary searches, recursion complexities, sorting arrays, and dynamic programming patterns.',
    topicCount: 6,
    badgeColor: 'text-neon-purple bg-neon-purple/10 border-neon-purple/20'
  },
  {
    id: 'dbms',
    title: 'Database Management Systems',
    description: 'Revise SQL queries, normalization dependencies, ACID parameters, and indexing strategies.',
    topicCount: 5,
    badgeColor: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20'
  },
  {
    id: 'os',
    title: 'Operating Systems',
    description: 'Summaries on deadlocks, process scheduling queues, virtual memory, paging, and semaphores.',
    topicCount: 5,
    badgeColor: 'text-neon-pink bg-neon-pink/10 border-neon-pink/20'
  },
  {
    id: 'aptitude',
    title: 'Quantitative Aptitude',
    description: 'Practice speed math, percentages, time-speed-distance, probability, and permutations.',
    topicCount: 5,
    badgeColor: 'text-green-400 bg-green-400/10 border-green-400/20'
  }
];

export const PublicNotesHub: React.FC = () => {
  useSEO({
    title: 'Placement Study Locker - Technical Revision Cheat Sheets',
    description: 'Access revision cheat sheets for campus placements. Study DBMS SQL indexes, DSA binary search algorithms, operating system deadlocks, and quantitative math.',
    canonicalPath: '/notes',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      'name': 'CrackPlace Placement Revision Notes',
      'description': 'Revision sheets and cheat sheets for programming, databases, systems, and mathematics.'
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
          <span className="px-3 py-1 rounded-full bg-neon-cyan/20 text-neon-cyan font-display text-[10px] font-bold uppercase tracking-wider">
            Revision Locker
          </span>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white tracking-wide">
            Technical Study Notes
          </h1>
          <p className="text-gray-400 text-sm">
            Read-only cheat sheet previews for core technical recruitment subjects. Lock full revisions inside the app.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {NOTES_CATEGORIES.map(category => (
            <Link
              key={category.id}
              to={`/notes/${category.id}`}
              className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 hover:bg-white/[0.01] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className={`p-2.5 rounded-lg border ${category.badgeColor}`}>
                    <FaBookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2.5 py-0.5 rounded-full">
                    {category.topicCount} Subjects
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  {category.title} Cheat Sheets
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {category.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <span>Core Interview Subjects</span>
                <span className="text-neon-cyan flex items-center gap-1">
                  <span>Open Locker</span>
                  <FaCircleRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicNotesHub;
