import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { FaChevronLeft, FaEnvelope, FaMapPin, FaPaperPlane } from 'react-icons/fa6';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  
  useSEO({
    title: 'Contact Us - Get in Touch',
    description: 'Have questions about partnership opportunities, group institutional pricing, or features? Reach out to the CrackPlace AI support team.',
    canonicalPath: '/contact',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      'name': 'Contact CrackPlace AI',
      'mainEntity': {
        '@type': 'EducationalOrganization',
        'name': 'CrackPlace AI',
        'email': 'support@crackplace.ai',
        'url': 'https://bhuvaneswari791.github.io/CrackPlace-AI'
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
            Communication Node
          </span>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white tracking-wide">
            Contact Support & Partnerships
          </h1>
          <p className="text-gray-400 text-sm">
            Interested in deploying CrackPlace AI at your university campus or reporting feature diagnostics? Drop us a transmission.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            {submitted ? (
              <div className="text-center p-6 space-y-2">
                <p className="text-neon-cyan text-sm font-bold">Transmission Succeeded!</p>
                <p className="text-xs text-gray-400">Our support coordinators will respond to your registered cadet mail within 24 standard cycles.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cadet Name</label>
                  <input required type="text" className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-white outline-none focus:border-neon-purple transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Email Address</label>
                  <input required type="email" className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-white outline-none focus:border-neon-purple transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Message</label>
                  <textarea required rows={4} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-white outline-none focus:border-neon-purple transition-colors" />
                </div>
                <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-display text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                  <FaPaperPlane className="w-3 h-3" />
                  <span>Transmit Query</span>
                </button>
              </form>
            )}
          </div>

          {/* Direct Details */}
          <div className="space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-neon-purple/10 text-neon-purple shrink-0">
                <FaEnvelope className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Corporate Mailbox</p>
                <p className="text-xs text-white">support@crackplace.ai</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-neon-cyan/10 text-neon-cyan shrink-0">
                <FaMapPin className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Command Operations Headquarters</p>
                <p className="text-xs text-white leading-relaxed">
                  Tech Corridor Sector 4,<br />
                  Bangalore, Karnataka, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
