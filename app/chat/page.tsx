'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Chat from '@/components/Chat';
import { ArrowLeft } from 'lucide-react';
import StarfieldBackdrop from '@/components/StarfieldBackdrop';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMessage = searchParams.get('message');

  const handleClose = () => {
    router.push('/');
  };

  return (
    <>
      <StarfieldBackdrop />

      <button
        onClick={handleClose}
        className="fixed left-4 top-4 z-50 flex items-center gap-2 border border-[var(--line)] bg-[color-mix(in_oklch,var(--bg)_88%,transparent)] px-4 py-2 text-sm text-[var(--muted)] backdrop-blur-md transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)] sm:left-6 sm:top-6"
        aria-label="Go back home"
      >
        <ArrowLeft className="h-4 w-4" />
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
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-[var(--muted)]">Loading…</p>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
