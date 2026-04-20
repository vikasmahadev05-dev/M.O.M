import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCw, Sun, Cloud, Moon, Sparkles } from 'lucide-react';
import axios from 'axios';

// Determine greeting based on time of day
const getTimedGreeting = () => {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 12) return { text: "Good Morning ☀️", color: "text-emerald-100" };
  if (hours >= 12 && hours < 17) return { text: "Stay Focused 💪", color: "text-amber-100" };
  return { text: "Wind Down 🌙", color: "text-orange-100" };
};

const QuoteCard = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState(getTimedGreeting());

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/quote`);
      const newQuote = response.data;
      setQuote(newQuote);
      
      // Store in localStorage as requested
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      localStorage.setItem('quote_text', newQuote.text);
      localStorage.setItem('quote_author', newQuote.author);
      localStorage.setItem('quote_date', today);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      // Fallback if both API and local cache are missing
      setQuote({
        text: "The best way to predict the future is to create it.",
        author: "Peter Drucker"
      });
    } finally {
      setTimeout(() => setLoading(false), 500); // Smooth transition
    }
  };

  useEffect(() => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Check localStorage for saved date
    const storedDate = localStorage.getItem('quote_date');
    const storedText = localStorage.getItem('quote_text');
    const storedAuthor = localStorage.getItem('quote_author');

    if (storedDate === today && storedText) {
      // IF stored date == today: Load quote from localStorage
      setQuote({
        text: storedText,
        author: storedAuthor || 'Unknown'
      });
      setLoading(false);
    } else {
      // ELSE: Fetch new quote from API
      fetchQuote();
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full overflow-hidden rounded-[2.5rem] shadow-xl group border border-white/40"
    >
      {/* Light Pastel Green & White Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white/80 to-emerald-50 backdrop-blur-xl"></div>
      
      {/* Subtle Decorative Orbs */}
      <div className="absolute -left-10 -top-10 w-40 h-40 bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-100/20 rounded-full blur-3xl"></div>

      <div className="relative p-8 md:p-10 flex flex-col items-center text-center space-y-6">
        {/* Updated Heading */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-green-100 ${(greeting?.color || '').replace('emerald-100', 'green-600').replace('amber-100', 'green-700').replace('orange-100', 'green-800')} text-xs font-black uppercase tracking-[0.2em]`}>
          <span>Today's Motivation 💡</span>
        </div>

        {/* Quote Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-8"
            >
              <RefreshCw className="text-green-600 animate-spin opacity-50" size={32} />
            </motion.div>
          ) : (
            <motion.div 
              key="quote"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-4"
            >
              <div className="relative">
                <Quote className="absolute -left-6 -top-4 text-green-200" size={48} />
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed tracking-tight px-4 max-w-2xl">
                  "{quote?.text}"
                </h2>
              </div>
              <p className="text-green-700/60 font-medium italic text-sm md:text-base">
                — {quote?.author}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default QuoteCard;
