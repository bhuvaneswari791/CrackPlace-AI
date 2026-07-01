import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { 
  FaRocket, 
  FaCode, 
  FaGamepad, 
  FaComments, 
  FaBookOpen, 
  FaArrowRight, 
  FaStar,
  FaChevronDown,
  FaShieldHalved,
  FaUsers
} from 'react-icons/fa6';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useSEO({
    title: 'AI-Powered Campus Placement Preparation Platform',
    description: 'Crack your technical, coding, and HR interview rounds with CrackPlace AI. Real-time gamified workspaces, PvP battle arenas, and customized study notes.',
    keywords: [
      'Placement Preparation',
      'AI Placement Preparation',
      'Coding Interview Practice',
      'Technical Mock Test',
      'HR Interview Practice',
      'TCS Placement Preparation',
      'Google Placement Preparation'
    ],
    canonicalPath: '/',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'CrackPlace AI',
      'url': 'https://bhuvaneswari791.github.io/CrackPlace-AI',
      'description': 'AI-powered campus placement preparation platform with gamified workspaces, PvP coding battles, and HR simulators.',
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'All',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      }
    }
  });

  const stats = [
    { label: 'Practice Questions', val: '30,000+' },
    { label: 'Success Rate', val: '98.4%' },
    { label: 'Mock Battles Done', val: '15,000+' },
    { label: 'Partner Colleges', val: '80+' }
  ];

  const features = [
    {
      title: 'AI Quiz Rooms',
      desc: 'Generate topic-focused MCQs dynamically calibrated by AI for DSA, DBMS, and Operating Systems.',
      icon: <FaRocket className="w-5 h-5 text-neon-purple" />,
      badge: 'Interactive'
    },
    {
      title: 'Coding Arena',
      desc: 'Write, test, and debug programming tasks in a full-fledged in-browser compiler IDE with real-time feedback.',
      icon: <FaCode className="w-5 h-5 text-neon-cyan" />,
      badge: 'Practice'
    },
    {
      title: 'HR STAR Simulator',
      desc: 'Simulate HR behavioral interviews with an AI recruiter grading answers based on STAR logic structure.',
      icon: <FaComments className="w-5 h-5 text-neon-pink" />,
      badge: 'Placement Ready'
    },
    {
      title: 'PvP Battle Arenas',
      desc: 'Challenge fellow placement cadets to real-time coding and quiz battle lobbies to improve ELO ratings.',
      icon: <FaGamepad className="w-5 h-5 text-green-400" />,
      badge: 'Gamified'
    },
    {
      title: 'Study Locker Room',
      desc: 'Generate and lock detailed cheat sheets, review points, and instant practice questions dynamically.',
      icon: <FaBookOpen className="w-5 h-5 text-yellow-400" />,
      badge: 'Revision'
    },
    {
      title: 'Personalized Armory',
      desc: 'Equip customized titles, avatars, animated rings, and theme colors unlocked from our coins store.',
      icon: <FaShieldHalved className="w-5 h-5 text-amber-500" />,
      badge: 'Rewards'
    }
  ];

  const reviews = [
    {
      name: 'Aditya Sen',
      role: 'Placed at Amazon (SDE-1)',
      quote: 'The AI HR interview simulator changed my placement prep. The STAR feedback highlights corrected my structural errors.',
      stars: 5
    },
    {
      name: 'Meera Nair',
      role: 'Placed at TCS Digital',
      quote: 'Dynamic DSA cheat sheet notes saved my revisions. Competing in ELO battles made the training incredibly engaging.',
      stars: 5
    },
    {
      name: 'Rohit Verma',
      role: 'Placed at Zoho Corp',
      quote: 'Solving database queries with instant compiler diagnostics felt like having a senior developer right next to me.',
      stars: 5
    }
  ];

  const faqs = [
    {
      q: 'How does the AI generate placement mock tests?',
      a: 'Our platform uses high-capacity LLMs trained on standard placement structures. You specify the subject, category, target company, and difficulty level, and the model builds customized questions and detailed solution explanations instantly.'
    },
    {
      q: 'Is CrackPlace AI completely free to use?',
      a: 'Yes, we provide student tiers allowing full access to all standard workspaces, study notes compilations, gamified missions, and matchmaking battles. Custom premium themes can be purchased using in-app coins earned during practices.'
    },
    {
      q: 'How does the PvP Battle Arena matchmaking work?',
      a: 'Whenever you start a battle queue, the matchmaking engine connects you with another cadet of similar placement ELO. You both race against the clock to solve synchronized technical MCQs, earning coins and profile upgrades upon victory.'
    }
  ];

  return (
    <div className="min-h-screen bg-bg-dark text-white gradient-bg flex flex-col justify-between overflow-x-hidden">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-bg-dark/65 backdrop-blur-xl border-b border-white/5 h-20 flex items-center px-6 md:px-12 justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-pink shadow-lg shadow-neon-purple/25">
            <span className="font-display font-black text-xl text-white">C</span>
          </div>
          <h1 className="font-display font-bold text-lg leading-tight tracking-wider bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            CRACKPLACE AI
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400 font-medium font-display">
          <Link to="/company" className="hover:text-white transition-colors">Target Companies</Link>
          <Link to="/notes" className="hover:text-white transition-colors">Study Locker</Link>
          <Link to="/blog" className="hover:text-white transition-colors">Career Blog</Link>
          <Link to="/faq" className="hover:text-white transition-colors">FAQs</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-gray-400 hover:text-white text-xs uppercase font-bold tracking-wider font-display transition-colors"
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-display text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-neon-purple/20"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-purple/15 border border-neon-purple/35 text-neon-purple font-display text-[10px] font-bold uppercase tracking-widest">
            🚀 Gamified Placement Suite v1.0
          </span>
          <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-white tracking-wide">
            Conquer Tech Placement Rounds In <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent">Style</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl">
            CrackPlace AI combines real-time compiler sandboxes, customized study lockers, structured STAR HR recruiter simulators, and gamified ELO battles to guarantee tech careers.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Link 
              to="/register"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-display text-xs font-bold uppercase tracking-wider shadow-lg shadow-neon-purple/25 flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
            >
              <span>Initialize Prep Protocol</span>
              <FaArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link 
              to="/login"
              className="px-8 py-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Sign In Cadet</span>
            </Link>
          </div>
        </div>

        {/* Hero Interactive Preview Layout */}
        <div className="relative flex justify-center items-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-neon-purple/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="glass-panel-neon-purple p-8 rounded-3xl w-full max-w-md space-y-6 relative overflow-hidden animate-float">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">cadet_session.sh</span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <p className="text-neon-cyan">$ ./initialize_placement.py</p>
              <p className="text-gray-400">Loading AI placement modules...</p>
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-2">
                <p className="text-neon-purple">✔ AI Compiler Sandbox: READY</p>
                <p className="text-neon-pink">✔ STAR Interview Evaluator: READY</p>
                <p className="text-green-400">✔ PvP Matching Corridor: ACTIVE</p>
              </div>
              <p className="text-yellow-400">$ ready_to_crack_placement = True</p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaUsers className="text-neon-pink w-4 h-4" />
                <span className="text-[11px] text-gray-400 font-medium">10,000+ Active Cadets Prep</span>
              </div>
              <div className="flex text-yellow-400 text-xs">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black/20 border-y border-white/5 w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, idx) => (
            <div key={idx} className="text-center space-y-2">
              <p className="font-display font-black text-3xl md:text-4xl text-white">{s.val}</p>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-neon-cyan/20 text-neon-cyan font-display text-[10px] font-bold uppercase tracking-wider">
            Preparation Matrix
          </span>
          <h3 className="font-display font-black text-3xl md:text-4xl text-white">
            Comprehensive Workspace Modules
          </h3>
          <p className="text-gray-400 text-xs md:text-sm">
            Everything you need to bypass recruitment stress, fully structured under modern gamified systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div 
              key={idx}
              className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    {f.icon}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                    {f.badge}
                  </span>
                </div>
                <h4 className="font-display font-bold text-sm text-white">{f.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-black/10 border-t border-white/5 w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-neon-pink text-xs uppercase font-bold tracking-widest">Testimonials</span>
            <h3 className="font-display font-black text-3xl text-white">Trusted by Placed Cadets</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex text-yellow-400 text-xs">
                  {Array.from({ length: r.stars }).map((_, i) => <FaStar key={i} />)}
                </div>
                <p className="text-xs text-gray-300 italic leading-relaxed">"{r.quote}"</p>
                <div>
                  <h5 className="font-display font-bold text-xs text-white">{r.name}</h5>
                  <p className="text-[10px] text-gray-500 mt-0.5">{r.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 md:px-12 max-w-3xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <span className="text-neon-purple text-xs uppercase font-bold tracking-widest">FAQ</span>
          <h3 className="font-display font-black text-3xl text-white">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="glass-panel rounded-xl border border-white/5 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex justify-between items-center font-display text-sm font-bold text-white hover:bg-white/[0.01]"
              >
                <span>{faq.q}</span>
                <FaChevronDown 
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-white' : ''}`} 
                />
              </button>
              {activeFaq === idx && (
                <div className="p-5 pt-0 text-xs text-gray-400 border-t border-white/5 leading-relaxed bg-black/20">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 bg-gradient-to-tr from-neon-purple/10 to-neon-pink/10 border-t border-white/5 text-center px-6 w-full relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-purple/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <h3 className="font-display font-black text-3xl md:text-4xl text-white tracking-wide">
            Ready to Conquer Your Tech Placements?
          </h3>
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
            Gain immediate access to competitive coding workspaces, STAR behavioral HR simulators, and dynamic study notes.
          </p>
          <div className="pt-2">
            <Link 
              to="/register"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-display text-xs font-bold uppercase tracking-wider shadow-lg shadow-neon-purple/20 hover:scale-[1.03] active:scale-[0.97] transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Launch CrackPlace Hub</span>
              <FaArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/5 py-12 px-6 md:px-12 w-full text-xs text-gray-500">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-purple to-neon-pink text-white font-display font-black text-sm">C</div>
              <span className="font-display font-bold text-white tracking-wide">CrackPlace AI</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              AI-driven preparation platform for technical, coding, and HR rounds.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-display font-bold text-white uppercase text-[10px] tracking-wider">Resources</h5>
            <ul className="space-y-2">
              <li><Link to="/company" className="hover:text-white transition-colors">Target Companies</Link></li>
              <li><Link to="/notes" className="hover:text-white transition-colors">Study Locker</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Career Blog</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-display font-bold text-white uppercase text-[10px] tracking-wider">Company</h5>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-display font-bold text-white uppercase text-[10px] tracking-wider">Legal</h5>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px]">
          <p>© 2026 CrackPlace AI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://github.com/bhuvaneswari791/CrackPlace-AI" className="hover:text-white transition-colors">GitHub Repository</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
