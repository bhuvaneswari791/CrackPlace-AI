import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { FaMessage, FaXmark, FaPaperPlane, FaTrash } from 'react-icons/fa6';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const { token } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'assistant', text: 'Hi! I am your AI Placement Mentor. Ask me anything about DSA coding challenges, subject revisions, or HR interview techniques!' }
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    'How do I improve my placement readiness?',
    'Explain binary search algorithm logic',
    'What is the STAR method in HR rounds?'
  ];

  // Load chat history from localStorage on mount
  useEffect(() => {
    const history = localStorage.getItem('mentor_chat_history');
    if (history) {
      try {
        setMessages(JSON.parse(history));
      } catch (err) {
        console.error('Failed to parse chat history:', err);
      }
    }
  }, []);

  // Sync chat history to localStorage capped at 100 messages
  useEffect(() => {
    if (messages.length > 1) {
      const capped = messages.slice(-100);
      localStorage.setItem('mentor_chat_history', JSON.stringify(capped));
    }
  }, [messages]);

  // Clear chat history trigger
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your conversation history?')) {
      localStorage.removeItem('mentor_chat_history');
      setMessages([
        { sender: 'assistant', text: 'Hi! I am your AI Placement Mentor. Ask me anything about DSA coding challenges, subject revisions, or HR interview techniques!' }
      ]);
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend = inputText) => {
    const trimmed = textToSend.trim();
    if (!trimmed || sending) return;

    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text: trimmed }]);
    setSending(true);

    try {
      const res = await fetch('/api/study/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: trimmed })
      });

      if (!res.ok) throw new Error('Chat failed');

      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'assistant', text: data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'assistant', text: 'Failed to connect. The assistant might be offline.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 p-4 rounded-full bg-gradient-to-tr from-neon-purple to-neon-pink text-white shadow-lg shadow-neon-purple/20 hover:scale-105 active:scale-95 transition-all duration-300 animate-pulse border border-white/10"
        aria-label="Ask AI Assistant"
      >
        {isOpen ? <FaXmark className="w-6 h-6" /> : <FaMessage className="w-6 h-6" />}
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-bg-dark/95 border-l border-white/5 shadow-2xl flex flex-col justify-between animate-slide-in backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-purple to-neon-pink flex items-center justify-center font-display font-black text-white text-sm shadow-md shadow-neon-purple/20">
                A
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-white leading-none">AI Mentor</h3>
                <span className="text-[10px] text-neon-green font-bold uppercase tracking-wider">Online</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  onClick={handleClearHistory}
                  title="Clear Chat History"
                  className="p-2 rounded-lg text-gray-400 hover:text-neon-pink hover:bg-neon-pink/5 transition-all cursor-pointer"
                >
                  <FaTrash className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <FaXmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 min-h-0">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-neon-purple/20 text-white rounded-tr-none border border-neon-purple/35'
                      : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="p-3.5 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 max-w-[85%] text-xs text-gray-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-bounce delay-300"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions & Input */}
          <div className="p-4 border-t border-white/5 space-y-3 bg-bg-dark">
            {/* Suggestion Chips */}
            {messages.length === 1 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Quick Suggestions</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s)}
                      className="px-2.5 py-1 rounded-lg border border-white/5 bg-white/[0.02] text-[10px] text-gray-400 hover:text-white hover:border-neon-purple/30 hover:bg-neon-purple/5 transition-all text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask placement mentor..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 font-display text-xs text-white focus:outline-none focus:border-neon-purple/50 focus:bg-neon-purple/5 transition-all duration-300"
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="p-3 rounded-xl bg-neon-purple hover:bg-neon-purple-dark text-white disabled:opacity-40 disabled:hover:bg-neon-purple transition-all duration-300 shadow-md shadow-neon-purple/15"
              >
                <FaPaperPlane className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
