'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Chat from '@/components/Chat';
import { ArrowLeft } from 'lucide-react';
import MonolithBackdrop from '@/components/MonolithBackdrop';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMessage = searchParams.get('message');

  const handleClose = () => {
    router.push('/');
  };

  return (
    <>
      <MonolithBackdrop />

      <button
        onClick={handleClose}
        className="fixed left-4 top-4 z-50 flex items-center gap-2 border border-[var(--ghost-border)] bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] px-4 py-2 font-mono-label text-[0.65rem] uppercase tracking-[0.12em] text-[var(--secondary)] backdrop-blur-[20px] transition-colors duration-150 [transition-timing-function:var(--ease-snap)] hover:border-[color-mix(in_srgb,var(--outline)_50%,transparent)] hover:text-[var(--on-surface)] sm:left-6 sm:top-6"
        aria-label="Go back home"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.25} />
        Back
      </button>

      <Chat isOpen={true} setIsOpen={handleClose} initialMessage={initialMessage} fullPage={true} />
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
          <p className="font-mono-label text-sm text-[var(--secondary)]">Loading…</p>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
