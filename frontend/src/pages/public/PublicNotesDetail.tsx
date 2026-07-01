import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { NOTES_CATEGORIES } from './PublicNotesHub';
import { FaChevronLeft, FaBookOpen, FaDownload } from 'react-icons/fa6';

export const PublicNotesDetail: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  
  const notesObj = NOTES_CATEGORIES.find(n => n.id === category);

  if (!notesObj) {
    return <Navigate to="/notes" replace />;
  }

  // Pre-compiled technical content for SEO indexation
  const getNotesContent = (id: string) => {
    switch (id) {
      case 'dsa':
        return (
          <>
            <h2>1. Binary Search</h2>
            <p>Binary Search is a search algorithm that finds the position of a target value within a sorted array. It compares the target value to the middle element of the array.</p>
            <pre><code>{`function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`}</code></pre>
            <p><strong>Complexity:</strong> Time: O(log N) | Space: O(1)</p>

            <h2>2. Dynamic Programming (DP)</h2>
            <p>DP solves complex problems by breaking them down into simpler subproblems. It is applicable to problems exhibiting overlapping subproblems and optimal substructure. Techniques include memoization (top-down) and tabulation (bottom-down).</p>
          </>
        );
      case 'dbms':
        return (
          <>
            <h2>1. Database Normalization (1NF - BCNF)</h2>
            <p>Normalization structures database tables to reduce data redundancy and improve data integrity.</p>
            <ul>
              <li><strong>1NF (First Normal Form):</strong> Atomic values per cell, unique column names.</li>
              <li><strong>2NF (Second Normal Form):</strong> Enforces 1NF and removes partial functional dependencies (all non-key columns depend on the primary key).</li>
              <li><strong>3NF (Third Normal Form):</strong> Enforces 2NF and removes transitive functional dependencies.</li>
              <li><strong>BCNF (Boyce-Codd Normal Form):</strong> Enforces 3NF and requires that for every functional dependency X → Y, X must be a super key.</li>
            </ul>
          </>
        );
      case 'os':
        return (
          <>
            <h2>1. Deadlocks</h2>
            <p>A deadlock occurs when a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process.</p>
            <p><strong>Four Coffman Conditions:</strong></p>
            <ol>
              <li><strong>Mutual Exclusion:</strong> At least one resource must be non-shareable.</li>
              <li><strong>Hold and Wait:</strong> Process holding resources can request new ones.</li>
              <li><strong>No Preemption:</strong> Resources cannot be forcibly taken.</li>
              <li><strong>Circular Wait:</strong> Process waits for resource held by the next process in a chain.</li>
            </ol>
          </>
        );
      default:
        return (
          <>
            <h2>Quantitative Aptitude Revision</h2>
            <p>Master speed math formulas to save time during placement rounds:</p>
            <ul>
              <li><strong>Time & Work:</strong> If A does work in X days and B in Y days, together they do it in (X*Y)/(X+Y) days.</li>
              <li><strong>Permutations & Combinations:</strong> P(n,r) = n! / (n-r)! | C(n,r) = n! / (r! * (n-r)!)</li>
            </ul>
          </>
        );
    }
  };

  useSEO({
    title: `${notesObj.title} Placement Cheat Sheet`,
    description: `Read technical placement notes for ${notesObj.title}. Master key SQL joins, sorting complexities, and Operating System deadlocks.`,
    keywords: [
      `${notesObj.id.toUpperCase()} Notes`,
      'Technical Interview Questions',
      'Placement Mock Test'
    ],
    canonicalPath: `/notes/${notesObj.id}`
  });

  return (
    <div className="min-h-screen bg-bg-dark text-white gradient-bg flex flex-col justify-between py-12 px-6 md:px-12">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <Link 
          to="/notes" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
        >
          <FaChevronLeft className="w-3 h-3" />
          <span>Back to Notes Hub</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl border ${notesObj.badgeColor} shrink-0`}>
              <FaBookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-wide">
                {notesObj.title} Cheat Sheet
              </h1>
              <p className="text-xs text-gray-400 mt-1">Core review points and code/anomalies cheats.</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-xs text-gray-300 font-sans space-y-6 max-w-none">
          {getNotesContent(notesObj.id)}
        </div>

        {/* Action Link */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FaDownload className="text-neon-cyan w-4 h-4" />
            <span className="text-xs text-gray-400 font-medium">Want to self-test on these topics using AI?</span>
          </div>
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-display text-[11px] font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Start Self-Test Quiz
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicNotesDetail;
