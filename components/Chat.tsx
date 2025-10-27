'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'llm';
  timestamp: Date;
}

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // TODO: Integrate with LLM here
    // Example integration point:
    // const response = await fetch('/api/chat', {
    //   method: 'POST',
    //   body: JSON.stringify({ message: inputValue, history: messages }),
    // });
    // const data = await response.json();

    // Simulate LLM response (replace this with actual LLM integration)
    setTimeout(() => {
      const llmMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm a placeholder response. Replace this with your LLM integration!",
        sender: 'llm',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, llmMessage]);
    }, 500);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out ${
          isOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'
        }`}
        aria-label="Open chat"
      >
        <div className="relative group">
          {/* Glassy button with backdrop blur and teal tint */}
          <div className="relative w-16 h-16 rounded-full bg-teal-500/20 backdrop-blur-md border border-teal-400/30 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-110 transition-all duration-300 flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-teal-400" strokeWidth={2} />

            {/* Glowing effect on hover */}
            <div className="absolute inset-0 rounded-full bg-teal-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </button>

      {/* Chat Box */}
      <div
        ref={chatBoxRef}
        className={`fixed bottom-6 right-6 z-50 transition-all duration-700 ease-in-out ${
          isOpen
            ? 'opacity-100 w-96 h-[32rem]'
            : 'opacity-0 w-16 h-16 pointer-events-none'
        }`}
        style={{
          transformOrigin: 'bottom right',
        }}
      >
        <div className="w-full h-full flex flex-col bg-black/80 backdrop-blur-xl border border-teal-400/30 rounded-2xl shadow-2xl shadow-teal-500/20 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-teal-400/20 bg-black/40">
            <div className="flex items-center gap-3">
              {/* Placeholder profile image - 10% smaller */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                PK
              </div>
              <h3 className="text-base font-semibold text-white">Pranay Kakkar</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-teal-500/20 hover:bg-teal-500/30 transition-colors flex items-center justify-center group"
              aria-label="Close chat"
            >
              <X className="w-5 h-5 text-teal-400 group-hover:text-teal-300" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center px-6">
                <p className="text-gray-400 text-center text-sm">
                  Start a conversation!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[65%] px-5 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-teal-500 text-white rounded-br-md'
                        : 'bg-gray-900 text-white border border-gray-800 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {message.text}
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
            className="px-5 py-5 border-t border-teal-400/20 bg-black/40"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-5 py-3 text-sm bg-gray-900/50 border border-teal-400/20 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/50 transition-all"
              />
              <button
                type="submit"
                className="w-11 h-11 rounded-full bg-teal-500 hover:bg-teal-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
