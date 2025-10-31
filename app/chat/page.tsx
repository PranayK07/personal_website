'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Chat from '@/components/Chat';
import DotGrid from '@/components/DotGrid';
import CustomCursor from '@/components/CustomCursor';
import { ArrowLeft } from 'lucide-react';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setInitialMessage(message);
    }
  }, [searchParams]);

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full -z-10" style={{ opacity: 0.7 }}>
        <DotGrid
          dotSize={2}
          gap={40}
          baseColor="#4a4a5a"
          activeColor="#6366f1"
          proximity={120}
          shockRadius={200}
          shockStrength={4}
          resistance={800}
          returnDuration={1.2}
        />
      </div>
      <CustomCursor />
      
      {/* Back to Home Button */}
      <button
        onClick={() => router.push('/')}
        className="fixed top-4 left-4 md:top-6 md:left-6 z-[60] flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 backdrop-blur-xl border border-indigo-400/40 hover:border-indigo-400/60 hover:scale-105 transition-all duration-300 text-indigo-400 hover:text-indigo-300"
        aria-label="Back to home"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Home</span>
      </button>

      {/* Full page chat */}
      <Chat isOpen={true} setIsOpen={() => {}} initialMessage={initialMessage} fullPage={true} />
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
