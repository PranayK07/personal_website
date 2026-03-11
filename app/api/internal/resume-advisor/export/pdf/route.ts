import { NextRequest } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { internalErrorResponse, requireAdvisorAuth } from '@/lib/resume-advisor/api';
import { exportSchema } from '@/lib/resume-advisor/schemas';
import { renderResumePreviewHtml } from '@/lib/resume-advisor/pipeline/generate-preview';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getExecutablePath(): Promise<string> {
  if (process.env.CHROMIUM_EXECUTABLE_PATH) {
    return process.env.CHROMIUM_EXECUTABLE_PATH;
  }

  return chromium.executablePath();
}

export async function POST(req: NextRequest) {
  const authError = requireAdvisorAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { tailoredResume } = exportSchema.parse(body);

    const html = renderResumePreviewHtml(tailoredResume);

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1275, height: 1650 },
      executablePath: await getExecutablePath(),
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'Letter',
        printBackground: true,
        preferCSSPageSize: true,
      });
      const pdfBytes = Uint8Array.from(pdf);
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

      return new Response(pdfBlob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="tailored-resume.pdf"',
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    return internalErrorResponse(error);
  }
}
