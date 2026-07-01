import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { FaChevronLeft, FaCalendar, FaUser } from 'react-icons/fa6';

export interface BlogPostItem {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  category: string;
  keywords: string[];
}

export const BLOG_POSTS: BlogPostItem[] = [
  {
    slug: 'top-100-java-questions',
    title: 'Top 100 Java Interview Questions & Answers',
    excerpt: 'Master OOP principles, garbage collection, memory model, multithreading, and collections framework for technical interviews.',
    date: 'June 28, 2026',
    author: 'Prof. Alok Gupta',
    readTime: '15 min read',
    category: 'Java / OOPs',
    keywords: ['Java Interview Questions', 'OOPs Interview Questions', 'Multithreading Java']
  },
  {
    slug: 'dbms-interview-guide',
    title: 'Comprehensive DBMS Interview & Query Guide',
    excerpt: 'Detailed walktroughs on SQL joins, query tuning, normalization schemas (1NF-BCNF), and ACID transaction anomalies.',
    date: 'June 25, 2026',
    author: 'Samantha D.',
    readTime: '12 min read',
    category: 'Databases',
    keywords: ['DBMS Notes', 'SQL Joins', 'Database Normalization']
  },
  {
    slug: 'how-to-crack-tcs-placement',
    title: 'TCS NQT Placement Preparation Roadmap',
    excerpt: 'Learn the exact quantitative, logic pattern, and coding compilers strategies required to clear TCS NQT assessments.',
    date: 'June 20, 2026',
    author: 'Vikas Sharma',
    readTime: '10 min read',
    category: 'Company Prep',
    keywords: ['TCS Placement', 'TCS NQT Prep', 'Campus Placement Preparation']
  },
  {
    slug: 'google-interview-experience',
    title: 'Google SDE-1 Interview Experience & Tips',
    excerpt: 'An inside look at Google SDE coding rounds, graph recursion complexities, and how to verbalize algorithmic thoughts.',
    date: 'June 18, 2026',
    author: 'Aditya Sen',
    readTime: '14 min read',
    category: 'Google / DSA',
    keywords: ['Google Placement', 'Coding Interview', 'Graphs BFS DFS']
  },
  {
    slug: 'react-interview-questions',
    title: 'React 19 & TypeScript Interview Questions',
    excerpt: 'Understand fiber reconciliations, hooks closure states, strict type safety configurations, and optimistic state updates.',
    date: 'June 15, 2026',
    author: 'Lokesh Kumar',
    readTime: '8 min read',
    category: 'Frontend',
    keywords: ['React Interview Questions', 'TypeScript Interview', 'Frontend Interview']
  },
  {
    slug: 'ai-placement-preparation-tips',
    title: 'How to Leverage AI for Campus Placements',
    excerpt: 'Top tips on practicing with AI-calibrated MCQs, simulated behavioral recruiters, and automatic compiler reviews.',
    date: 'June 10, 2026',
    author: 'AI Mentor System',
    readTime: '7 min read',
    category: 'AI Prep',
    keywords: ['AI Placement Preparation', 'Placement Mock Test', 'Freshers Placement Preparation']
  }
];

export const BlogHub: React.FC = () => {
  useSEO({
    title: 'Placement Preparation Career Blog & Guides',
    description: 'Read high-traffic placement prep articles covering DSA, OOP, DBMS normalizations, TCS roadmaps, React hooks, and campus recruitment guides.',
    canonicalPath: '/blog',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      'name': 'CrackPlace AI Career Blog',
      'description': 'Guides and roadmaps for campus placements and coding interviews.',
      'publisher': {
        '@type': 'Organization',
        'name': 'CrackPlace AI'
      }
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
          <span className="px-3 py-1 rounded-full bg-neon-pink/20 text-neon-pink font-display text-[10px] font-bold uppercase tracking-wider">
            Resources Portal
          </span>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white tracking-wide">
            Career & Technical Interview Blog
          </h1>
          <p className="text-gray-400 text-sm">
            Roadmaps, coding guides, and student interview experiences to help you secure placement badges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {BLOG_POSTS.map(post => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 hover:bg-white/[0.01] transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  <span>{post.category}</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="font-display font-bold text-base text-white hover:text-neon-pink transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <FaUser className="w-3 h-3 text-neon-purple" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaCalendar className="w-3 h-3" />
                  <span>{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogHub;
