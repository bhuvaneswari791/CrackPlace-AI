import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  FaStar, 
  FaTrash, 
  FaMagnifyingGlass, 
  FaPrint, 
  FaCopy, 
  FaArrowRight, 
  FaRegClock, 
  FaChevronLeft, 
  FaCheck,
  FaXmark,
  FaArrowLeft
} from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';

interface MCQQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

interface StudyNote {
  noteId: string;
  uid: string;
  category: string;
  topic: string;
  subtopic: string;
  title: string;
  content: string;
  questions: MCQQuestion[];
  isFavorite: boolean;
  createdTime: string;
}

const PRE_CURATED_TOPICS: { [key: string]: string[] } = {
  'DSA': [
    'Binary Search',
    'Dynamic Programming',
    'Graphs (BFS & DFS)',
    'Sorting Algorithms',
    'Linked Lists',
    'Binary Trees'
  ],
  'DBMS': [
    'SQL Joins',
    'Database Normalization',
    'Indexes & B-Trees',
    'ACID Transactions',
    'NoSQL databases'
  ],
  'Operating Systems': [
    'Deadlocks',
    'Process Scheduling',
    'Virtual Memory & Paging',
    'Multithreading & Semaphores',
    'File Systems'
  ],
  'Aptitude': [
    'Permutations & Combinations',
    'Time, Speed & Distance',
    'Probability',
    'Percentages & Simple Interest',
    'Work & Time'
  ],
  'Custom': []
};

export const StudyNotes: React.FC = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState<boolean>(true);
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);
  
  // Tab within active note study panel
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'selftest'>('content');

  // Generation forms
  const [category, setCategory] = useState<string>('DSA');
  const [selectedTopic, setSelectedTopic] = useState<string>('Binary Search');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [subtopic, setSubtopic] = useState<string>('');
  const [depth, setDepth] = useState<'cheat_sheet' | 'detailed'>('cheat_sheet');
  const [generating, setGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);

  // Filters/Searches
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTabFilter, setSelectedTabFilter] = useState<string>('all');
  const [favoriteOnly, setFavoriteOnly] = useState<boolean>(false);

  // Self test simulator states
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([null, null, null]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [testConcluded, setTestConcluded] = useState<boolean>(false);
  
  // Operation alerts
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch saved notes from backend
  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/study/notes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to retrieve study notes.');
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not load your study locker.');
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  // Adjust pre-curated topics when category changes
  useEffect(() => {
    const curated = PRE_CURATED_TOPICS[category] || [];
    if (curated.length > 0) {
      setSelectedTopic(curated[0]);
    } else {
      setSelectedTopic('Custom');
    }
  }, [category]);

  const handleGenerateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    const topic = selectedTopic === 'Custom' ? customTopic : selectedTopic;
    if (!topic.trim()) {
      setErrorMessage('Topic description is required.');
      return;
    }

    setGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setGenerationProgress(15);

    const progressTimer = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 5;
      });
    }, 1500);

    try {
      const res = await fetch('/api/study/notes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category, topic, subtopic, depth })
      });
      clearInterval(progressTimer);
      setGenerationProgress(100);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to compile study notes.');

      setNotes(prev => [data.note, ...prev]);
      setSelectedNote(data.note);
      setActiveSubTab('content');
      setSuccessMessage(`Study note "${data.note.title}" generated successfully!`);
      
      // Reset form fields
      setCustomTopic('');
      setSubtopic('');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Notes generation failed.');
    } finally {
      clearInterval(progressTimer);
      setGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    
    // Optimistic Update
    setNotes(prev => prev.map(note => {
      if (note.noteId === noteId) {
        return { ...note, isFavorite: !note.isFavorite };
      }
      return note;
    }));

    if (selectedNote && selectedNote.noteId === noteId) {
      setSelectedNote(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }

    try {
      const res = await fetch(`/api/study/notes/${noteId}/favorite`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      // Rollback on fail
      setNotes(prev => prev.map(note => {
        if (note.noteId === noteId) {
          return { ...note, isFavorite: !note.isFavorite };
        }
        return note;
      }));
      if (selectedNote && selectedNote.noteId === noteId) {
        setSelectedNote(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
      }
      setErrorMessage('Could not update favorite state.');
    }
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this study sheet?')) return;

    const previousNotes = [...notes];
    setNotes(prev => prev.filter(n => n.noteId !== noteId));
    if (selectedNote && selectedNote.noteId === noteId) {
      setSelectedNote(null);
    }

    try {
      const res = await fetch(`/api/study/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      setSuccessMessage('Study note deleted.');
    } catch (err) {
      setNotes(previousNotes);
      setErrorMessage('Delete failed.');
    }
  };

  const handleCopyClipboard = () => {
    if (!selectedNote) return;
    navigator.clipboard.writeText(selectedNote.content);
    setSuccessMessage('Markdown copied to clipboard.');
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Self-Test interactive logic
  const startSelfTest = () => {
    setUserAnswers([null, null, null]);
    setCurrentQuestionIndex(0);
    setTestConcluded(false);
    setActiveSubTab('selftest');
  };

  const submitAnswer = (optionIdx: number) => {
    const answers = [...userAnswers];
    answers[currentQuestionIndex] = optionIdx;
    setUserAnswers(answers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < 2) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setTestConcluded(true);
    }
  };

  const getTestScore = () => {
    if (!selectedNote) return 0;
    let correct = 0;
    userAnswers.forEach((ans, idx) => {
      if (ans === selectedNote.questions[idx]?.correctOptionIndex) {
        correct++;
      }
    });
    return correct;
  };

  // Pre-curated category colors
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'DSA': return { color: 'text-neon-purple', bg: 'bg-neon-purple/10 border-neon-purple/20' };
      case 'DBMS': return { color: 'text-neon-cyan', bg: 'bg-neon-cyan/10 border-neon-cyan/20' };
      case 'Operating Systems': return { color: 'text-neon-pink', bg: 'bg-neon-pink/10 border-neon-pink/20' };
      case 'Aptitude': return { color: 'text-neon-orange', bg: 'bg-neon-orange/10 border-neon-orange/20' };
      default: return { color: 'text-gray-400', bg: 'bg-white/5 border-white/10' };
    }
  };

  // Custom markdown simple parser
  const renderMarkdown = (md: string) => {
    if (!md) return null;
    const lines = md.split('\n');
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeLanguage = '';

    const renderedElements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          renderedElements.push(
            <pre key={`code-${i}`} className="bg-black/75 p-4 rounded-xl border border-neon-purple/20 font-mono text-xs text-neon-cyan overflow-x-auto my-4 shadow relative">
              <span className="absolute top-2 right-3 text-[8px] font-black uppercase text-gray-600 tracking-wider">{codeLanguage || 'code'}</span>
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          codeLanguage = '';
        } else {
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3);
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      if (line.startsWith('# ')) {
        renderedElements.push(<h1 key={i} className="font-display font-black text-lg text-white mt-6 mb-3 border-b border-white/5 pb-2 uppercase tracking-wide">{parseInline(line.slice(2))}</h1>);
        continue;
      }
      if (line.startsWith('## ')) {
        renderedElements.push(<h2 key={i} className="font-display font-bold text-base text-neon-purple mt-5 mb-2.5 uppercase tracking-wide">{parseInline(line.slice(3))}</h2>);
        continue;
      }
      if (line.startsWith('### ')) {
        renderedElements.push(<h3 key={i} className="font-display font-bold text-xs text-neon-cyan mt-4 mb-2 uppercase tracking-wide">{parseInline(line.slice(4))}</h3>);
        continue;
      }

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        renderedElements.push(
          <ul key={i} className="list-disc pl-6 my-2 text-xs md:text-sm text-gray-300 leading-relaxed">
            <li>{parseInline(line.trim().slice(2))}</li>
          </ul>
        );
        continue;
      }

      if (line.trim() === '---') {
        renderedElements.push(<hr key={i} className="border-white/5 my-6" />);
        continue;
      }

      if (line.trim() !== '') {
        renderedElements.push(<p key={i} className="text-xs md:text-sm text-gray-300 leading-relaxed my-3 font-normal">{parseInline(line)}</p>);
      }
    }

    return renderedElements;
  };

  const parseInline = (text: string): React.ReactNode[] => {
    const parts = text.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-white font-extrabold">{part}</strong>;
      }
      const subParts = part.split('`');
      return subParts.map((subPart, subIndex) => {
        if (subIndex % 2 === 1) {
          return <code key={subIndex} className="bg-white/10 px-1.5 py-0.5 rounded text-neon-cyan font-mono text-xs">{subPart}</code>;
        }
        return subPart;
      });
    });
  };

  // Filtered lists of notes
  const filteredNotes = useMemo(() => {
    let list = [...notes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(n => n.title.toLowerCase().includes(q) || n.topic.toLowerCase().includes(q));
    }
    if (selectedTabFilter !== 'all') {
      list = list.filter(n => n.category === selectedTabFilter);
    }
    if (favoriteOnly) {
      list = list.filter(n => n.isFavorite);
    }
    return list;
  }, [notes, searchQuery, selectedTabFilter, favoriteOnly]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 px-4 animate-fade-in print:bg-white print:text-black print:pb-0">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4 rounded-2xl print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-gray-400 hover:text-white cursor-pointer"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">Placement Knowledge Bank</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">Generate custom AI topic notes, run self-test MCQs, and store interview study guides.</p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl border border-neon-green/20 bg-neon-green/5 text-xs text-neon-green font-bold print:hidden">
          🎉 {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl border border-neon-pink/20 bg-neon-pink/5 text-xs text-neon-pink font-bold print:hidden">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (4/12 width): AI generation console */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4 relative overflow-hidden">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400">Summon AI Mentor</h3>
            
            <form onSubmit={handleGenerateNotes} className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-bg-dark border border-white/5 text-xs text-gray-300 focus:outline-none focus:border-neon-purple/50 transition-all cursor-pointer"
                >
                  <option value="DSA">Data Structures & Algorithms</option>
                  <option value="DBMS">Database Management System</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Aptitude">Quantitative Aptitude</option>
                  <option value="Custom">Custom Topic</option>
                </select>
              </div>

              {/* Topic selector / Custom input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Topic</label>
                {category !== 'Custom' ? (
                  <select
                    value={selectedTopic}
                    onChange={e => setSelectedTopic(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-bg-dark border border-white/5 text-xs text-gray-300 focus:outline-none focus:border-neon-purple/50 transition-all cursor-pointer"
                  >
                    {(PRE_CURATED_TOPICS[category] || []).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    <option value="Custom">Type Custom Topic...</option>
                  </select>
                ) : null}

                {(category === 'Custom' || selectedTopic === 'Custom') && (
                  <input
                    type="text"
                    placeholder="Enter topic name (e.g. Memory Leak)..."
                    value={customTopic}
                    onChange={e => setCustomTopic(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-bg-dark border border-white/5 text-xs text-white focus:outline-none focus:border-neon-purple/50 transition-all"
                    required
                  />
                )}
              </div>

              {/* Subtopic description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Subtopic Focus (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. B+ Tree indexing, Thread safety..."
                  value={subtopic}
                  onChange={e => setSubtopic(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-bg-dark border border-white/5 text-xs text-white focus:outline-none focus:border-neon-purple/50 transition-all"
                />
              </div>

              {/* Depth Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Guide Depth</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDepth('cheat_sheet')}
                    className={`py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      depth === 'cheat_sheet'
                        ? 'border-neon-cyan/35 bg-neon-cyan/10 text-neon-cyan'
                        : 'border-white/5 bg-white/[0.02] text-gray-400 hover:text-white'
                    }`}
                  >
                    Cheat Sheet
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepth('detailed')}
                    className={`py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      depth === 'detailed'
                        ? 'border-neon-purple/35 bg-neon-purple/10 text-neon-purple'
                        : 'border-white/5 bg-white/[0.02] text-gray-400 hover:text-white'
                    }`}
                  >
                    Detailed Guide
                  </button>
                </div>
              </div>

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-pink text-white font-display font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {generating ? 'Compiling Notes...' : 'Generate Notes'}
                <FaArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (8/12 width): Saved Notes Locker or Active Note Panel */}
        <div className="lg:col-span-8 space-y-6 print:col-span-12">
          
          <AnimatePresence mode="wait">
            
            {/* Case A: A study note is actively open for reading */}
            {selectedNote ? (
              <motion.div
                key="open-note"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6 print:border-none print:bg-white print:p-0"
              >
                
                {/* Note Details Header */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4 print:hidden">
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedNote(null)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-all cursor-pointer mb-2"
                    >
                      <FaChevronLeft className="w-3 h-3" />
                      <span>Back to Study Locker</span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getCategoryTheme(selectedNote.category).bg} ${getCategoryTheme(selectedNote.category).color}`}>
                        {selectedNote.category}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold font-mono">
                        {new Date(selectedNote.createdTime).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="font-display font-black text-xl text-white tracking-wide uppercase mt-1">{selectedNote.title}</h2>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleToggleFavorite(e, selectedNote.noteId)}
                      className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 text-gray-400 hover:text-yellow-400 transition-all cursor-pointer"
                    >
                      <FaStar className={`w-4 h-4 ${selectedNote.isFavorite ? 'text-yellow-400' : 'text-gray-500'}`} />
                    </button>
                    <button
                      onClick={handleCopyClipboard}
                      title="Copy Markdown"
                      className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
                    >
                      <FaCopy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handlePrint}
                      title="Print Study Sheet"
                      className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
                    >
                      <FaPrint className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub tabs: Study markdown vs Self test MCQs */}
                <div className="flex border-b border-white/5 print:hidden">
                  <button
                    onClick={() => setActiveSubTab('content')}
                    className={`px-4 py-2.5 font-display font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                      activeSubTab === 'content'
                        ? 'border-neon-purple text-white'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    📝 Note Content
                  </button>
                  <button
                    onClick={startSelfTest}
                    className={`px-4 py-2.5 font-display font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                      activeSubTab === 'selftest'
                        ? 'border-neon-purple text-white'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    🧠 AI Self-Test
                  </button>
                </div>

                {/* Sub Tab contents */}
                {activeSubTab === 'content' ? (
                  <div className="prose max-w-none text-left print:text-black">
                    {renderMarkdown(selectedNote.content)}
                  </div>
                ) : (
                  <div className="space-y-6 text-left">
                    {!testConcluded ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs text-gray-500 font-bold border-b border-white/5 pb-2">
                          <span className="uppercase tracking-wider">Self-Test Questionnaire</span>
                          <span>Question {currentQuestionIndex + 1} of 3</span>
                        </div>

                        {/* Question Text */}
                        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                          <p className="font-display font-bold text-sm text-white">
                            {selectedNote.questions[currentQuestionIndex]?.questionText}
                          </p>
                        </div>

                        {/* Answer Choices Grid */}
                        <div className="grid grid-cols-1 gap-2.5">
                          {selectedNote.questions[currentQuestionIndex]?.options.map((option, idx) => {
                            const selected = userAnswers[currentQuestionIndex] === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => submitAnswer(idx)}
                                className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                                  selected 
                                    ? 'border-neon-purple bg-neon-purple/5 text-white shadow-lg shadow-neon-purple/5'
                                    : 'border-white/5 bg-white/[0.01] text-gray-300 hover:border-white/10 hover:bg-white/[0.02]'
                                }`}
                              >
                                <span>{option}</span>
                                {selected && <span className="w-2 h-2 rounded-full bg-neon-purple"></span>}
                              </button>
                            );
                          })}
                        </div>

                        {/* Control buttons */}
                        <div className="flex justify-between items-center pt-2">
                          <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="px-4 py-2.5 rounded-xl border border-white/5 text-xs text-gray-400 disabled:opacity-50 cursor-pointer"
                          >
                            Previous
                          </button>
                          <button
                            onClick={nextQuestion}
                            disabled={userAnswers[currentQuestionIndex] === null}
                            className="px-5 py-2.5 rounded-xl bg-neon-purple text-white text-xs font-display font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{currentQuestionIndex === 2 ? 'Conclude Test' : 'Next'}</span>
                            <FaArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Test Scorecard Review panel
                      <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center text-center space-y-3">
                          <span className="text-4xl">🎓</span>
                          <h4 className="font-display font-black text-lg text-white uppercase tracking-wider">Self-Test Complete</h4>
                          <p className="text-2xl font-black font-display text-neon-cyan">{getTestScore()} / 3 Correct</p>
                          <p className="text-[10px] text-gray-500">
                            {getTestScore() === 3 ? 'Excellent! Master status achieved.' : 'Review explanations below to solidify concepts.'}
                          </p>
                          <button
                            onClick={startSelfTest}
                            className="px-4 py-2 rounded-xl border border-neon-purple/35 bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 text-xs font-bold transition-all cursor-pointer mt-2"
                          >
                            Retake Self-Test
                          </button>
                        </div>

                        <div className="space-y-4">
                          <h5 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400">Question-by-Question Review</h5>
                          
                          {selectedNote.questions.map((q, idx) => {
                            const correct = q.correctOptionIndex === userAnswers[idx];
                            return (
                              <div key={idx} className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-gray-400">Question {idx + 1}</span>
                                  {correct ? (
                                    <span className="flex items-center gap-1 text-neon-green font-bold"><FaCheck className="w-3 h-3"/> Correct</span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-neon-pink font-bold"><FaXmark className="w-3 h-3"/> Incorrect</span>
                                  )}
                                </div>
                                <p className="font-bold text-white">{q.questionText}</p>
                                <div className="space-y-1 font-medium mt-1">
                                  <p className="text-gray-400">Your selection: <span className={correct ? 'text-neon-green' : 'text-neon-pink'}>{q.options[userAnswers[idx] || 0]}</span></p>
                                  {!correct && <p className="text-neon-green">Correct choice: {q.options[q.correctOptionIndex]}</p>}
                                </div>
                                <div className="p-2.5 rounded-lg bg-black/25 text-[10px] leading-relaxed text-purple-300 font-bold border border-white/5">
                                  💡 Explanation: {q.explanation}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              // Case B: Grid Library inventory list
              <motion.div
                key="locker-library"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Search query + filter tabs row */}
                <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/5">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
                    {[
                      { id: 'all', label: '🗂 All Notes' },
                      { id: 'DSA', label: '🧩 DSA' },
                      { id: 'DBMS', label: '💾 DBMS' },
                      { id: 'Operating Systems', label: '⚙️ OS' },
                      { id: 'Aptitude', label: '📈 Aptitude' },
                      { id: 'Custom', label: '✏️ Custom' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTabFilter(tab.id)}
                        className={`px-4 py-2 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                          selectedTabFilter === tab.id
                            ? 'bg-white/10 text-white border border-white/10 shadow'
                            : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 relative">
                      <FaMagnifyingGlass className="absolute left-3 top-3.5 text-gray-500 w-3.5 h-3.5" />
                      <input
                        type="text"
                        placeholder="Search notes library..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white focus:outline-none focus:border-neon-purple/50 focus:bg-neon-purple/5 transition-all duration-300"
                      />
                    </div>

                    <button
                      onClick={() => setFavoriteOnly(!favoriteOnly)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                        favoriteOnly
                          ? 'border-yellow-500/35 bg-yellow-500/10 text-yellow-400'
                          : 'border-white/5 bg-white/[0.02] text-gray-400 hover:text-white'
                      }`}
                    >
                      <FaStar className={`w-3.5 h-3.5 ${favoriteOnly ? 'text-yellow-500' : 'text-gray-500'}`} />
                      <span>Favorites Only</span>
                    </button>
                  </div>
                </div>

                {/* Saved Sheets inventory grid list */}
                {loadingNotes ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-neon-purple/20 border-t-neon-purple rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-gray-500">Accessing study locker...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredNotes.map(note => {
                      const theme = getCategoryTheme(note.category);
                      return (
                        <motion.div
                          key={note.noteId}
                          whileHover={{ y: -3 }}
                          onClick={() => {
                            setSelectedNote(note);
                            setActiveSubTab('content');
                          }}
                          className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/15 cursor-pointer flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden group"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${theme.bg} ${theme.color}`}>
                                {note.category}
                              </span>
                              
                              <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleToggleFavorite(e, note.noteId)}
                                  className="p-1 text-gray-500 hover:text-yellow-400 transition-colors cursor-pointer"
                                >
                                  <FaStar className={`w-3.5 h-3.5 ${note.isFavorite ? 'text-yellow-400' : 'text-gray-600'}`} />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteNote(e, note.noteId)}
                                  className="p-1 text-gray-500 hover:text-neon-pink transition-colors cursor-pointer"
                                >
                                  <FaTrash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-display font-black text-sm text-white group-hover:text-neon-cyan transition-colors leading-snug line-clamp-2">
                                {note.title}
                              </h4>
                              <p className="text-[10px] text-gray-500 font-bold mt-1 font-mono">{note.topic} • {note.subtopic}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-white/5 text-[9px] text-gray-500 font-bold">
                            <span className="flex items-center gap-1">
                              <FaRegClock className="w-3 h-3" />
                              <span>{new Date(note.createdTime).toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center gap-1 text-neon-purple group-hover:translate-x-1 transition-transform">
                              <span>Study sheet</span>
                              <FaArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}

                    {filteredNotes.length === 0 && (
                      <div className="col-span-full py-20 text-center space-y-3 bg-white/[0.01] border border-white/5 rounded-2xl">
                        <p className="text-sm text-gray-400 font-medium">Locker is empty.</p>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">Use the generator console on the left to request customized AI study guides and practice quizzes.</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global AI Generating Overlay Loader */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md"
          >
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-t-neon-cyan border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-b-neon-purple border-t-transparent border-r-transparent border-l-transparent animate-spin-reverse opacity-70"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">📚</div>
            </div>
            
            <h3 className="font-display font-black text-xl text-white tracking-wider uppercase mb-1">AI Mentor Compiling Notes</h3>
            <p className="text-xs text-neon-cyan font-bold font-mono tracking-widest uppercase mb-6 animate-pulse">
              Synthesizing theory, code, and practice MCQs...
            </p>
            
            {/* Custom progress bar */}
            <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              ></motion.div>
            </div>
            <span className="text-[10px] text-gray-500 font-bold mt-2 font-mono">{generationProgress}% Completed</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyNotes;
