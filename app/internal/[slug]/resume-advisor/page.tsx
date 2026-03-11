import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ResumeAdvisorApp from '@/components/resume-advisor/ResumeAdvisorApp';
import { getAdvisorRouteSlug, isAdvisorAuthenticatedFromCookieStore } from '@/lib/resume-advisor/auth';

export const metadata: Metadata = {
  title: 'Resume Advisor (Internal)',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

interface ResumeAdvisorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ResumeAdvisorPage({ params }: ResumeAdvisorPageProps) {
  const resolvedParams = await params;
  const expectedSlug = getAdvisorRouteSlug();

  if (!expectedSlug || resolvedParams.slug !== expectedSlug) {
    notFound();
  }

  const initialAuthenticated = await isAdvisorAuthenticatedFromCookieStore();

  return <ResumeAdvisorApp initialAuthenticated={initialAuthenticated} />;
}
