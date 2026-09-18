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
    recommendation
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
    'Why was my workout changed today?',
    'I have low energy today.',
    'Help me prep for tomorrow.',
    'How is my weekly progress?'
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] transition-colors duration-200">
      {/* Header */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 shadow-xs shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--text-primary)]">HealthPilot Coach</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                Online
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Your adaptive fitness companion • Informed by your sleep ({context?.sleepHours || 7.0}h) & recovery score ({evolvingState?.recoveryReadiness || 72}%)
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 sm:p-6 overflow-y-auto space-y-4 shadow-xs">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-3xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Hi there! How can I help you today?
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-md">
              Ask about your plan, recovery trade-offs, or what to do if your schedule suddenly shifts.
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-[var(--primary)] text-white shadow-xs'
                      : 'bg-[var(--surface-soft)] text-[var(--primary)] border border-[var(--border)]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-3xl px-5 py-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[var(--primary)] text-white font-medium rounded-tr-xs shadow-xs'
                      : 'bg-[var(--surface-soft)] text-[var(--text-primary)] border border-[var(--border)] rounded-tl-xs space-y-2'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}

        {isSendingChat && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)] border border-[var(--border)] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-3xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-muted)] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInput(p);
            }}
            className="px-3.5 py-1.5 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={handleSend}
        className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-2.5 flex items-center gap-2 shadow-xs shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask HealthPilot Coach anything..."
          className="flex-1 px-4 py-2 text-xs sm:text-sm bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSendingChat}
          className="px-4 py-2.5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
