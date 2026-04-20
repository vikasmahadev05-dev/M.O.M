import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, Sparkles } from 'lucide-react';

const ChatInterface = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello Vikas! I've been watching your progress. You still have 12 tasks pending. Shouldn't you focus on the 'Design System' first? Don't make me remind you again! 😉" 
    }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    // Mock response from "Virtual Mother"
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I hear you, but let's stick to the schedule. A tidy dashboard is a tidy mind! Now, go finish those icons." 
      }]);
    }, 1000);
  };



  return (
    <div className="w-80 h-96 bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-3xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
      {/* Header */}
      <div className="bg-[var(--accent)] p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={18} />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest">M.O.M Assistant</h4>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold opacity-80 uppercase tracking-tighter">Virtual Mother Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-slate-50/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
              m.role === 'user' 
                ? 'bg-[var(--accent)] text-white' 
                : 'bg-white border border-slate-100 text-[var(--text-main)] shadow-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
        <input 
          type="text" 
          placeholder="Ask your M.O.M..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-[var(--accent)] transition-all outline-none"
        />
        <button 
          onClick={handleSend}
          className="p-2 bg-[var(--accent)] text-white rounded-xl shadow-md hover:scale-110 active:scale-95 transition-all"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
