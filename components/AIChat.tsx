'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { LiquidMetal, PulsingBorder } from '@paper-design/shaders-react';

export default function AIChat() {
  const [isFocused, setIsFocused] = useState(false);
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
    "What projects have you worked on?",
    "Tell me about your technical skills.",
    "What's your experience with Machine Learning?",
    "What are some of your biggest accomplishments?"
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [promptValue]);

  return (
    <div className="w-full h-[calc(100dvh-0px)] flex flex-col items-center justify-center px-4 bg-transparent">
      <div className="w-full max-w-4xl flex flex-col items-center gap-20">
        {/* Animated Orb Header */}
        <motion.div
          className="flex items-center gap-4"
          animate={{
            y: isFocused ? 80 : 0,
            opacity: isFocused ? 0 : 1,
            filter: isFocused ? 'blur(4px)' : 'blur(0px)',
          }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            duration: 0.5,
          }}
          style={{ zIndex: 5 }}
        >
          {/* Animated Orb */}
          <div className="relative w-20 h-20 flex-shrink-0">
            {/* Blurred layer */}
            <div className="absolute inset-0" style={{ filter: 'blur(14px)' }}>
              <LiquidMetal
                repetition={4}
                softness={0.5}
                shiftRed={0.3}
                shiftBlue={0.3}
                distortion={0.1}
                contour={1}
                shape="circle"
                scale={0.58}
                rotation={50}
                speed={5}
              />
            </div>
            {/* Sharp layer */}
            <div className="absolute inset-0">
              <LiquidMetal
                repetition={4}
                softness={0.5}
                shiftRed={0.3}
                shiftBlue={0.3}
                distortion={0.1}
                contour={1}
                shape="circle"
                scale={0.58}
                rotation={50}
                speed={5}
              />
            </div>
            {/* Glass morphism overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center">
              {/* Random dots */}
              <div className="relative w-full h-full">
                <div className="absolute w-0.5 h-0.5 bg-white rounded-full" style={{ top: '20%', left: '30%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white rounded-full" style={{ top: '60%', left: '70%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white rounded-full" style={{ top: '40%', left: '50%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white rounded-full" style={{ top: '70%', left: '25%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white rounded-full" style={{ top: '25%', left: '65%' }} />
              </div>
            </div>
          </div>

          {/* Greeting Text with translucent violet background */}
          <div className="relative rounded-lg px-4 py-2 bg-violet-600/10 backdrop-blur-sm border border-violet-500/20">
            <p className="text-white/70 text-sm font-light max-w-md">
              Don't have time to read? Chat to my assistant instead and find out exactly what you need!
            </p>
          </div>
        </motion.div>

        {/* Main Input Card */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl relative" style={{ zIndex: 10 }}>
          <div className="relative overflow-visible">
            {/* Animated Glow Layer - Always visible, matches website background */}
            <div className="absolute -inset-[2px] z-0 flex items-center justify-center pointer-events-none">
              <PulsingBorder
                style={{ height: '146.5%', minWidth: '143%' }}
                colorBack="#0A0A0F"
                roundness={0.18}
                thickness={0}
                softness={0}
                intensity={isFocused ? 0.3 : 0}
                bloom={2}
                spots={2}
                spotSize={0.25}
                pulse={0}
                smoke={0.35}
                smokeSize={0.4}
                scale={0.7}
                rotation={0}
                offsetX={0}
                offsetY={0}
                speed={1}
                colors={[
                  'hsl(248, 95%, 60%)',
                  'hsl(264, 95%, 75%)',
                  'hsl(240, 100%, 50%)',
                  'hsl(280, 90%, 65%)',
                  'hsl(248, 100%, 35%)',
                ]}
              />
            </div>

            {/* Input Card - No border, only shader glow */}
            <div
              className="relative rounded-2xl p-4 z-10"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask me anything about my experience..."
                className="w-full min-h-[80px] bg-transparent text-white text-base placeholder:text-[rgba(113,113,122,0.60)] focus:outline-none focus:ring-0 border-none resize-none mb-6"
                rows={1}
              />

              {/* Bottom Controls Row */}
        <div className="flex items-center justify-end">
                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!promptValue.trim()}
          className="w-10 h-10 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] disabled:bg-indigo-500/30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 flex items-center justify-center text-white"
                  aria-label="Send message"
                >
          <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Example Questions */}
        <motion.div
          className="w-full max-w-2xl mt-8"
          animate={{
            opacity: isFocused ? 0 : 1,
            y: isFocused ? 20 : 0,
            filter: isFocused ? 'blur(4px)' : 'blur(0px)',
          }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            duration: 0.5,
          }}
          style={{ zIndex: 5 }}
        >
          <p className="text-white/50 text-xs font-medium mb-4 text-center uppercase tracking-wider">
            Quick Questions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(question)}
                className="group relative rounded-xl text-left transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  padding: '24px 24px',
                  minHeight: '80px',
                }}
              >
                {/* Hover gradient effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  }}
                />

                {/* Question text */}
                <span className="relative text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300 leading-relaxed break-words">
                  {question}
                </span>

                {/* Arrow icon */}
                <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg
                    className="w-4 h-4 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
