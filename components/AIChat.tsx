'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function AIChat() {
  const [promptValue, setPromptValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submitPrompt = () => {
    if (promptValue.trim()) {
      window.location.href = `/chat?message=${encodeURIComponent(promptValue.trim())}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPrompt();
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
      <header className="mb-12 max-w-3xl">
        <p className="ds-section-meta">02 // Assistant</p>
        <h2 className="ds-section-title mt-4">Query my work</h2>
        <p className="mt-6 max-w-[55ch] font-body text-[0.9375rem] leading-[1.6] text-[var(--secondary)]">
          Short on time? Ask a focused question—answers draw from the same context as this site.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="w-full max-w-none">
        <label htmlFor="home-chat-input" className="sr-only">
          Message to send to the assistant
        </label>
        <div className="group border border-[var(--ghost-border)] bg-[var(--surface-container-low)] p-4 transition-colors duration-150 [transition-timing-function:var(--ease-snap)] focus-within:bg-[var(--surface-container-high)]">
          <textarea
            id="home-chat-input"
            ref={textareaRef}
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitPrompt();
              }
            }}
            placeholder="Ask me anything about my experience…"
            rows={3}
            className="w-full resize-none border-0 border-b border-transparent bg-transparent pb-1 font-body text-[0.9375rem] leading-relaxed text-[var(--on-surface)] placeholder:text-[var(--secondary)] transition-[border-color] duration-150 [transition-timing-function:var(--ease-snap)] focus:border-[var(--primary)] focus:outline-none"
          />
          <div className="mt-4 flex justify-end border-t border-[var(--ghost-border)] pt-4">
            <button
              type="submit"
              disabled={!promptValue.trim()}
              className="ds-btn-primary inline-flex h-10 items-center gap-2 !px-4 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </div>
      </form>

      <div className="mt-12">
        <p className="font-mono-label text-[0.6rem] uppercase tracking-[0.22em] text-[var(--secondary)]">
          Suggested prompts
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {exampleQuestions.map((question) => (
            <li key={question}>
              <button
                type="button"
                onClick={() => handleExampleClick(question)}
                className="w-full border border-[var(--ghost-border)] bg-[var(--surface-container-lowest)] px-4 py-3 text-left font-body text-[0.875rem] leading-snug text-[color-mix(in_srgb,var(--on-surface)_90%,var(--secondary))] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1 hover:border-[var(--outline-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] hover:shadow-md"
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
