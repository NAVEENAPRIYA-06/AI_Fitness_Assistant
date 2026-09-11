import React, { useState, useRef, useEffect } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import {
  Sparkles,
  Send,
  User,
  Bot,
  ShieldCheck,
  RotateCcw,
  Lightbulb
} from 'lucide-react';

export const AiCoachView: React.FC = () => {
  const {
    chatMessages,
    sendCoachMessage,
    isSendingChat,
    context,
    evolvingState,
    recommendation,
    behaviorSummary
  } = useHealthPilot();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSendingChat]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSendingChat) return;
    const text = input;
    setInput('');
    await sendCoachMessage(text);
  };

  const samplePrompts = [
    'Why was a lighter recovery session recommended today instead of my scheduled intervals?',
    'How does my 86% home completion rate influence the decision engine?',
    'What should I eat to accelerate recovery given my 5.8 hours of sleep?',
    'If my energy improves by 3pm, can I safely do a 30-minute session?'
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Grounded Context Header Bar */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 shadow-xs shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">HealthPilot AI Decision Coach</h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">
                  Grounded on Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Grounded in your current recovery score ({context?.recoveryScore}%), sleep ({context?.sleepHours.toFixed(1)}h), and behavioral patterns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-500 font-mono">
              Model: <strong className="text-slate-300">gemini-3.8-flash</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-[#0F0F11] border border-slate-800 rounded-xl p-4 overflow-y-auto space-y-4 shadow-xs">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-emerald-500 text-[#0A0A0B]'
                    : 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-xs'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-slate-800/90 border border-slate-700 text-white rounded-tr-xs'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[10px] pt-1 ${
                    isUser ? 'text-slate-400 text-right' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isSendingChat && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Analyzing physiological context & reasoning...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sample Prompt Suggestions */}
      <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-[11px] text-slate-500 font-semibold shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>Ask:</span>
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInput(p);
            }}
            className="text-[11px] whitespace-nowrap bg-slate-800/80 border border-slate-700 hover:border-emerald-500/40 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full transition-colors shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="shrink-0 bg-[#0F0F11] border border-slate-800 rounded-xl p-2 shadow-xs flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask HealthPilot Coach about decisions, recovery readiness, or What-If simulations..."
          disabled={isSendingChat}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSendingChat}
          className="p-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0B] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
