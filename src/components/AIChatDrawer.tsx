import React, { useState } from 'react';
import { Send, Sparkles, MessageSquare, Play, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { ChatMessage, NoteDocument } from '../types';
import { api } from '../services/api';

interface AIChatDrawerProps {
  notes: NoteDocument;
  onSeek: (seconds: number) => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ notes, onSeek }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your NoteFlow AI study assistant for "${notes.title}". Ask me any questions about the concepts, formulas, derivations, or problem-solving steps discussed in this video. All my responses are grounded in the verified source transcript.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sourceOnly, setSourceOnly] = useState(true);

  const suggestedQuestions = [
    'What is the core concept?',
    'List all key formulas with explanations.',
    'Explain the worked example step-by-step.',
    'What common mistakes should I avoid on exams?',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(notes.videoId, query, sourceOnly);
      setMessages((prev) => [...prev, res.message]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Unable to connect with AI assistant. Please ensure your query is based on the lecture content.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--cf-border)] glass shadow-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="border-b border-[var(--cf-border)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--cf-accent)]/10 text-[var(--cf-accent-dark)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--cf-text-primary)] uppercase tracking-wider">
                Ask About This Video
              </h3>
              <p className="text-[10px] text-[var(--cf-text-muted)]">Grounded in source transcript & notes</p>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[var(--cf-text-secondary)] font-medium">
            <input
              type="checkbox"
              checked={sourceOnly}
              onChange={(e) => setSourceOnly(e.target.checked)}
              className="rounded border-[var(--cf-border)] text-[var(--cf-accent)] focus:ring-0"
            />
            <span>Source Only</span>
          </label>
        </div>

        {/* Suggested Pills */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="whitespace-nowrap rounded-xl border border-[var(--cf-border)] bg-[var(--cf-surface)] px-2.5 py-1 text-[var(--cf-text-secondary)] hover:border-[var(--cf-accent)] hover:bg-[var(--cf-accent)]/5 hover:text-[var(--cf-accent-dark)] transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[var(--cf-accent)] text-white rounded-br-none shadow-sm shadow-[var(--cf-accent)]/20'
                    : 'bg-[var(--cf-surface)] text-[var(--cf-text-primary)] border border-[var(--cf-border)] rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[var(--cf-border)] flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-[var(--cf-text-muted)] font-semibold">Citations:</span>
                    {msg.citations.map((c, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => onSeek(c.timestampSeconds)}
                        className="inline-flex items-center gap-1 rounded bg-[var(--cf-accent)]/10 px-1.5 py-0.5 text-[10px] font-mono text-[var(--cf-accent-dark)] hover:underline"
                      >
                        <Play className="h-2.5 w-2.5 fill-current" />
                        <span>[{c.timestamp}]</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[var(--cf-text-muted)]">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-[var(--cf-accent)]" />
            <span>Analyzing verified transcript...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="border-t border-[var(--cf-border)] p-3 bg-[var(--cf-surface)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about this lecture..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-[var(--cf-border)] bg-white px-3 py-2 text-xs text-[var(--cf-text-primary)] placeholder-[var(--cf-text-muted)] focus:border-[var(--cf-accent)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--cf-accent)] text-white hover:bg-[var(--cf-accent-dark)] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
