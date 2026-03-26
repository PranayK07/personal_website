'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

/**
 * Validates that a URL uses a safe protocol.
 * Prevents javascript: URIs and other potentially harmful schemes.
 *
 * @param url - The URL string to validate
 * @returns true if the URL is safe to use in a link
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.href);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Renders markdown-style links within text.
 * Validates URLs to prevent XSS attacks via javascript: URIs.
 *
 * @param text - The text content that may contain markdown links
 * @returns React nodes with properly rendered links
 */
function renderMarkdownLinks(text: string): ReactNode {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${keyIndex++}`}>{text.substring(lastIndex, match.index)}</span>
      );
    }

    const linkText = match[1];
    const url = match[2];

    // Only render as link if URL is valid and safe
    if (isValidUrl(url)) {
      parts.push(
        <a
          key={`link-${keyIndex++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--primary)] underline decoration-[var(--ghost-border)] underline-offset-2 transition-[text-decoration-color] duration-150 [transition-timing-function:var(--ease-snap)] hover:decoration-[var(--primary)]"
        >
          {linkText}
        </a>
      );
    } else {
      // Render as plain text if URL is invalid
      parts.push(
        <span key={`text-${keyIndex++}`}>{match[0]}</span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`text-${keyIndex++}`}>{text.substring(lastIndex)}</span>);
  }

  return parts.length > 0 ? <>{parts}</> : <>{text}</>;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'llm';
  timestamp: Date;
  isAnimating?: boolean;
}

async function parseErrorResponse(res: Response): Promise<string> {
  const ct = res.headers.get('content-type') ?? '';
  try {
    if (ct.includes('application/json')) {
      const j = (await res.json()) as { error?: string; details?: string };
      return j.details || j.error || `Request failed (${res.status})`;
    }
    const text = await res.text();
    return text.trim() || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

interface ChatProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  initialMessage?: string | null;
  fullPage?: boolean;
}

export default function Chat({
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen,
  initialMessage,
  fullPage = false,
}: ChatProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const msg = initialMessage?.trim();
    if (!msg || !isOpen) return;
    setInputValue(msg);
    const t = window.setTimeout(() => {
      chatBoxRef.current?.querySelector('form')?.requestSubmit();
    }, 400);
    return () => window.clearTimeout(t);
  }, [initialMessage, isOpen]);

  useEffect(() => {
    if (isOpen && !fullPage) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else if (!fullPage) {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }

    return () => {
      if (!fullPage) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
      }
    };
  }, [isOpen, fullPage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    const userContent = inputValue.trim();
    if (!userContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userContent,
      sender: 'user',
      timestamp: new Date(),
      isAnimating: true,
    };

    const llmMessageId = `${Date.now()}-assistant`;

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      try {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === userMessage.id ? { ...msg, isAnimating: false } : msg))
        );
      } catch {
        /* ignore */
      }
    }, 300);

    try {
      const apiMessages = [
        ...messages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
        { role: 'user' as const, content: userContent },
      ];

      const res = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const errText = await parseErrorResponse(res);
        throw new Error(errText);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('No response body from server.');
      }

      const decoder = new TextDecoder();
      let llmReply = '';

      const llmMessage: Message = {
        id: llmMessageId,
        text: '',
        sender: 'llm',
        timestamp: new Date(),
        isAnimating: false,
      };
      setMessages((prev) => [...prev, llmMessage]);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          llmReply += chunk;

          setMessages((prev) =>
            prev.map((msg) => (msg.id === llmMessageId ? { ...msg, text: llmReply } : msg))
          );
        }
      } catch (streamErr) {
        if (streamErr instanceof DOMException && streamErr.name === 'AbortError') {
          return;
        }
        throw streamErr;
      }
    } catch (err) {
      console.error('LLM Error:', err);
      const detail = err instanceof Error ? err.message : 'Something went wrong.';
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        text: `Sorry — ${detail}`,
        sender: 'llm',
        timestamp: new Date(),
      };
      setMessages((prev) => {
        const withoutEmptyAssistant = prev.filter((m) => m.id !== llmMessageId);
        return [...withoutEmptyAssistant, errorMsg];
      });
    }
  };

  return (
    <>
      {!fullPage && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-4 right-4 z-50 duration-150 [transition-timing-function:var(--ease-snap)] md:bottom-6 md:right-6 ${
            isOpen ? 'pointer-events-none scale-0 opacity-0' : 'opacity-100'
          }`}
          aria-label="Open chat"
          aria-expanded={isOpen}
        >
          <span className="flex h-12 w-12 items-center justify-center border border-[var(--ghost-border)] bg-[var(--surface-container-low)] text-[var(--on-surface)] backdrop-blur-[20px] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1 hover:bg-[var(--surface-container-high)] hover:shadow-lg hover:border-[var(--outline-variant)] md:h-14 md:w-14">
            <MessageCircle className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.25} />
          </span>
        </button>
      )}

      <div
        ref={chatBoxRef}
        className={`fixed z-50 duration-150 [transition-timing-function:var(--ease-snap)] ${
          fullPage
            ? 'inset-0 h-[100dvh] w-full scale-100 opacity-100'
            : isOpen
              ? 'inset-0 h-[100dvh] w-full scale-100 opacity-100 md:inset-auto md:bottom-6 md:right-6 md:h-[32rem] md:w-96'
              : 'pointer-events-none bottom-4 right-4 h-12 w-12 scale-95 opacity-0 md:bottom-6 md:right-6 md:h-16 md:w-16'
        }`}
        style={{
          transformOrigin: fullPage ? 'center' : 'bottom right',
        }}
      >
        <div
          className={`flex h-full w-full flex-col border border-[var(--ghost-border)] bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] backdrop-blur-[20px] ${
            fullPage ? '' : ''
          }`}
        >
          <div className="flex items-center justify-between border-b border-[var(--ghost-border)] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center border border-[var(--ghost-border)] font-mono-label text-[0.6rem] font-semibold text-[var(--on-surface)]">
                PK
              </div>
              <h3 className="text-sm font-medium text-[var(--on-surface)]">Pranay Kakkar</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center border border-transparent text-[var(--secondary)] transition-colors duration-150 [transition-timing-function:var(--ease-snap)] hover:border-[var(--ghost-border)] hover:text-[var(--on-surface)]"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" strokeWidth={1.25} />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-6 md:px-6">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center px-4">
                <p className="max-w-xs text-center font-body text-sm leading-relaxed text-[var(--secondary)]">
                  Start a conversation with the assistant.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ${
                    message.isAnimating ? 'animate-messageSlideIn' : ''
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] ${
                      message.sender === 'user'
                        ? 'border border-[var(--ghost-border)] bg-[var(--surface-container-low)] text-[var(--on-surface)]'
                        : 'border border-[var(--ghost-border)] bg-[var(--surface-container-high)] text-[color-mix(in_srgb,var(--on-surface)_92%,var(--secondary))]'
                    }`}
                    style={{ padding: '12px 16px' }}
                  >
                    <p className="whitespace-pre-wrap break-words font-body text-sm leading-relaxed">
                      {renderMarkdownLinks(message.text)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendMessage(e).catch((submitErr) => {
                console.error('Chat send failed:', submitErr);
              });
            }}
            className="flex-shrink-0 border-t border-[var(--ghost-border)] px-4 py-4 md:px-6"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me about my experiences…"
                className="min-h-[44px] flex-1 border-0 border-b border-transparent bg-[var(--surface-container-lowest)] px-4 font-body text-sm text-[var(--on-surface)] placeholder:text-[var(--secondary)] transition-[border-color,background-color] duration-150 [transition-timing-function:var(--ease-snap)] focus:border-[var(--primary)] focus:bg-[var(--surface-container-high)] focus:outline-none"
              />
              <button
                type="submit"
                className="ds-btn-primary flex h-11 min-w-[2.75rem] flex-shrink-0 items-center justify-center !p-0 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!inputValue.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
