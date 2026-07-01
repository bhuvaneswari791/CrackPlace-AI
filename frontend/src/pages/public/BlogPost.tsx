import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { BLOG_POSTS } from './BlogHub';
import { FaChevronLeft, FaCalendar, FaUser, FaClock, FaBookOpen } from 'react-icons/fa6';

export const BlogPost: React.FC = () => {
  const { postSlug } = useParams<{ postSlug: string }>();
  
  const post = BLOG_POSTS.find(p => p.slug === postSlug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Pre-compiled educational contents for each post slug to ensure crawlable SEO
  const getPostContent = (slug: string) => {
    switch (slug) {
      case 'top-100-java-questions':
        return (
          <>
            <h2>1. OOP Principles in Java</h2>
            <p>Object-Oriented Programming (OOP) forms the core of Java. The four pillars are:</p>
            <ul>
              <li><strong>Inheritance:</strong> Reusing code by extending classes.</li>
              <li><strong>Polymorphism:</strong> Overloading (compile-time) and Overriding (run-time).</li>
              <li><strong>Encapsulation:</strong> Wrapping data inside variables using private access modifiers and providing getters/setters.</li>
              <li><strong>Abstraction:</strong> Hiding execution details using interfaces and abstract classes.</li>
            </ul>

            <h2>2. Java Garbage Collection</h2>
            <p>Garbage Collection (GC) is Java's automatic memory management. It identifies objects that are no longer referenced in the heap memory and deallocates them. Common GC algorithms include G1 (Garbage-First) and ZGC.</p>
            
            <h2>3. Multi-Threading and Thread Safe Collections</h2>
            <p>Multithreading is concurrent execution of multiple threads. To prevent race conditions, Java uses synchronization, volatile keywords, and thread-safe wrappers like <code>ConcurrentHashMap</code> and <code>CopyOnWriteArrayList</code>.</p>
          </>
        );
      case 'dbms-interview-guide':
        return (
          <>
            <h2>1. SQL Join Types</h2>
            <p>SQL Joins combine records from tables. The primary types are:</p>
            <ul>
              <li><strong>INNER JOIN:</strong> Matching keys in both tables.</li>
              <li><strong>LEFT JOIN:</strong> All records from left table, and matching records from right.</li>
              <li><strong>RIGHT JOIN:</strong> All records from right table, and matching records from left.</li>
              <li><strong>FULL JOIN:</strong> All rows when there is a match in either table.</li>
            </ul>

            <h2>2. ACID Transaction Properties</h2>
            <p>ACID guarantees database reliability:</p>
            <ul>
              <li><strong>Atomicity:</strong> Transactions succeed or fail completely.</li>
              <li><strong>Consistency:</strong> Database constraints are preserved.</li>
              <li><strong>Isolation:</strong> Transactions run independently.</li>
              <li><strong>Durability:</strong> Updates survive server crashes.</li>
            </ul>
          </>
        );
      case 'how-to-crack-tcs-placement':
        return (
          <>
            <h2>1. TCS NQT Quantitative Section</h2>
            <p>The Quantitative section tests arithmetic, work-time speed formulas, and percentages. Practice speed tricks to solve formulas in under 60 seconds.</p>
            <h2>2. Coding and Compilers</h2>
            <p>TCS assessments test programming tasks in C, C++, Java, or Python. Master standard algorithms like search, array rotation, and string sorting.</p>
          </>
        );
      case 'google-interview-experience':
        return (
          <>
            <h2>1. SDE Algorithm Rounds</h2>
            <p>Google interviews focus heavily on Data Structures and Algorithms (DSA). Expect complex graph recursion, dynamic programming structures, and space-time optimization questions.</p>
            <h2>2. Technical Verbalization</h2>
            <p>Speak while coding. The recruiter grades you on how you logically organize thoughts and correct syntax errors during active testing.</p>
          </>
        );
      case 'react-interview-questions':
        return (
          <>
            <h2>1. React Fiber Reconciliation</h2>
            <p>Reconciliation is React's diffing engine. Fiber represents a virtual stack frame that enables splitting render work into incremental chunks to maintain high responsiveness.</p>
            <h2>2. Custom Hooks Closures</h2>
            <p>Hooks capture values based on state renders. Use dependency arrays in <code>useEffect</code> and <code>useCallback</code> to avoid stale closure scopes.</p>
          </>
        );
      case 'ai-placement-preparation-tips':
        return (
          <>
            <h2>1. Leverage AI Quiz Calibrators</h2>
            <p>Practice MCQs that dynamically adjust difficulties according to ELO performance rating indices.</p>
            <h2>2. STAR Behavioral Simulations</h2>
            <p>Simulate HR rounds using AI interview bots. Structure your accomplishments using the Situation, Task, Action, and Result (STAR) framework.</p>
          </>
        );
      default:
        return <p>Learn placement preparation strategies with CrackPlace AI.</p>;
    }
  };

  // Dynamic JSON-LD Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': post.title,
    'description': post.excerpt,
    'datePublished': new Date(post.date).toISOString().split('T')[0],
    'author': {
      '@type': 'Person',
      'name': post.author
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'CrackPlace AI'
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://bhuvaneswari791.github.io/CrackPlace-AI/blog/${post.slug}`
    }
  };

  useSEO({
    title: `${post.title} - Prep Guide`,
    description: post.excerpt,
    keywords: post.keywords,
    canonicalPath: `/blog/${post.slug}`,
    ogType: 'article',
    structuredData: articleSchema
  });

  return (
    <div className="min-h-screen bg-bg-dark text-white gradient-bg flex flex-col justify-between py-12 px-6 md:px-12">
      <article className="max-w-3xl mx-auto w-full space-y-8">
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
        >
          <FaChevronLeft className="w-3 h-3" />
          <span>Back to Blog Portal</span>
        </Link>

        {/* Post Header */}
        <div className="space-y-4 border-b border-white/5 pb-6">
          <span className="px-3 py-1 rounded-full bg-neon-pink/20 text-neon-pink font-display text-[10px] font-bold uppercase tracking-wider">
            {post.category}
          </span>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white tracking-wide leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <FaUser className="w-3.5 h-3.5 text-neon-purple" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaCalendar className="w-3.5 h-3.5" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaClock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="prose prose-invert prose-xs leading-relaxed text-gray-300 font-sans space-y-6 max-w-none">
          {getPostContent(post.slug)}
        </div>

        {/* Navigation / Next CTA */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FaBookOpen className="text-neon-cyan w-4 h-4" />
            <span className="text-xs text-gray-400 font-medium">Ready to test understanding?</span>
          </div>
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-display text-[11px] font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Solve Dynamic MCQs
          </Link>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
