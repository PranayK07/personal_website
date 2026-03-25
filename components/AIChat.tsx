'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function AIChat() {
  const [promptValue, setPromptValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptValue.trim()) {
      window.location.href = `/chat?message=${encodeURIComponent(promptValue.trim())}`;
    }
  };

  const handleExampleClick = (question: string) => {
    window.location.href = `/chat?message=${encodeURIComponent(question)}`;
  };

  const exampleQuestions = [
    'What projects have you worked on?',
    'Tell me about your technical skills.',
    "What's your experience with Machine Learning?",
    'What are some of your biggest accomplishments?',
  ];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [promptValue]);

  return (
    <div className="w-full">
      <header className="mb-10 max-w-2xl">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[var(--muted)]">Assistant</p>
        <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.35rem)] font-medium tracking-tight">Ask about my work</h2>
        <p className="mt-4 max-w-[55ch] text-[0.9375rem] leading-relaxed text-[var(--muted)]">
          Short on time? Ask a focused question—my assistant answers from the same context as this site.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <label htmlFor="home-chat-input" className="sr-only">
          Message to send to the assistant
        </label>
        <div className="border border-[var(--line)] bg-[color-mix(in_oklch,var(--bg-elevated)_70%,transparent)] p-4">
          <textarea
            id="home-chat-input"
            ref={textareaRef}
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask me anything about my experience…"
            rows={3}
            className="w-full resize-none bg-transparent text-[0.9375rem] leading-relaxed text-[var(--fg)] placeholder:text-[var(--muted)] focus:outline-none"
          />
          <div className="mt-4 flex justify-end border-t border-[var(--line)] pt-4">
            <button
              type="submit"
              disabled={!promptValue.trim()}
              className="inline-flex h-10 w-10 items-center justify-center border border-[var(--line)] text-[var(--fg)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      <div className="mt-10">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">Suggested prompts</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {exampleQuestions.map((question) => (
            <li key={question}>
              <button
                type="button"
                onClick={() => handleExampleClick(question)}
                className="w-full border border-[var(--line)] bg-transparent px-4 py-3 text-left text-[0.875rem] leading-snug text-[color-mix(in_oklch,var(--fg)_88%,var(--muted))] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]"
              >
                {question}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
