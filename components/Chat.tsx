'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

// Helper function to convert markdown links to clickable HTML
function renderMarkdownLinks(text: string): ReactNode {
  // Match markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${keyIndex++}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }

    // Add the link
    const linkText = match[1];
    const url = match[2];
    parts.push(
      <a
        key={`link-${keyIndex++}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-300 hover:text-indigo-200 underline transition-colors"
      >
        {linkText}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${keyIndex++}`}>
        {text.substring(lastIndex)}
      </span>
    );
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

interface ChatProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  initialMessage?: string | null;
  fullPage?: boolean;
}

export default function Chat({ isOpen: externalIsOpen, setIsOpen: externalSetIsOpen, initialMessage, fullPage = false }: ChatProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [hasProcessedInitial, setHasProcessedInitial] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial message
  useEffect(() => {
    if (initialMessage && !hasProcessedInitial && isOpen) {
      setInputValue(initialMessage);
      setHasProcessedInitial(true);
      // Auto-send the initial message after a brief delay
      setTimeout(() => {
        const form = chatBoxRef.current?.querySelector('form');
        if (form) {
          form.requestSubmit();
        }
      }, 500);
    }
  }, [initialMessage, hasProcessedInitial, isOpen]);

  // Lock body scroll when chat is open on mobile
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
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      isAnimating: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Remove animation flag after animation completes
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, isAnimating: false } : msg
        )
      );
    }, 300);

    try {
      // Convert messages to API format and include the new user message
      const apiMessages = [
        ...messages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
        { role: 'user', content: inputValue },
      ];

      const res = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });
      
      // Handle streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let llmReply = "";

      const llmMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "",
        sender: "llm",
        timestamp: new Date(),
        isAnimating: false,
      };
      setMessages((prev) => [...prev, llmMessage]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        llmReply += chunk;

        // Update live as tokens stream in
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === llmMessage.id ? { ...msg, text: llmReply } : msg
          )
        );
      }
    } catch (err) {
      console.error("LLM Error:", err);
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        text: "Sorry, something went wrong while fetching my response.",
        sender: "llm",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <>
      {/* Chat Button - hide in full page mode */}
      {!fullPage && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 transition-all duration-500 ease-out ${
            isOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'
          }`}
          aria-label="Open chat"
        >
          <div className="relative group">
            {/* Glassy button with strong backdrop blur and indigo tint */}
            <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full bg-indigo-500/10 backdrop-blur-xl border border-indigo-400/40 hover:border-indigo-400/60 hover:scale-110 transition-all duration-300 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 md:w-7 md:h-7 text-indigo-400" strokeWidth={2} />
            </div>
          </div>
        </button>
      )}

      {/* Chat Box */}
      <div
        ref={chatBoxRef}
        className={`fixed z-50 transition-all duration-500 ease-in-out ${
          fullPage
            ? 'opacity-100 scale-100 inset-0 w-full h-[100dvh]'
            : isOpen
            ? 'opacity-100 scale-100 inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-96 md:h-[32rem] w-full h-[100dvh]'
            : 'opacity-0 scale-0 bottom-4 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-16 md:h-16 pointer-events-none'
        }`}
        style={{
          transformOrigin: fullPage ? 'center' : 'bottom right',
        }}
      >
        <div className={`w-full h-full flex flex-col bg-black/80 backdrop-blur-xl border border-indigo-400/20 shadow-2xl shadow-indigo-500/20 ${fullPage ? 'rounded-none' : 'rounded-none md:rounded-2xl'}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-indigo-400/10 bg-black/40">
            <div className="flex items-center gap-3">
              {/* Placeholder profile image - 10% smaller */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                PK
              </div>
              <h3 className="text-base font-semibold text-white">Pranay Kakkar</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 transition-colors flex items-center justify-center group"
              aria-label="Close chat"
            >
              <X className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
            </button>
          </div>

          {/* Messages Area - increased padding all around */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8 overscroll-contain">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center px-6">
                <p className="text-gray-400 text-center text-sm leading-relaxed">
                  Start a conversation with PranayAI!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  } ${message.isAnimating ? 'animate-messageSlideIn' : ''}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[65%] shadow-md ${
                      message.sender === 'user'
                        ? 'bg-indigo-500 text-white rounded-[24px] rounded-br-md'
                        : 'bg-gray-900/90 text-white rounded-[24px] rounded-bl-md'
                    }`}
                    style={{
                      padding: '12px 16px',
                    }}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words" style={{ lineHeight: '1.6' }}>
                      {renderMarkdownLinks(message.text)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="flex-shrink-0 px-4 md:px-6 py-4 md:py-6 border-t border-indigo-400/10 bg-black/40"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <div className="flex gap-2 md:gap-3 items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me about my experiences..."
                className="flex-1 px-4 md:px-6 py-3 md:py-4 text-sm bg-gray-900/50 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              <button
                type="submit"
                className="w-11 h-11 rounded-full bg-indigo-500 hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0 shadow-lg shadow-indigo-500/30"
                disabled={!inputValue.trim()}
                aria-label="Send message"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
