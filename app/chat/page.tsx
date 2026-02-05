'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Chat from '@/components/Chat';
import CustomCursor from '@/components/CustomCursor';
import { ArrowLeft } from 'lucide-react';
import GravityStarsBackground from '@/components/GravityStarsBackground';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMessage = searchParams.get('message');

  const handleClose = () => {
    router.push('/');
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <GravityStarsBackground />
      </div>
      <CustomCursor />

      {/* Back button */}
      <button
        onClick={handleClose}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:border-indigo-400/40 transition-all text-white/60 hover:text-white"
        aria-label="Go back home"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      {/* Full page Chat with initial message */}
      <Chat
        isOpen={true}
        setIsOpen={handleClose}
        initialMessage={initialMessage}
        fullPage={true}
      />
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-white">Loading...</p></div>}>
      <ChatPageContent />
    </Suspense>
  );
}
