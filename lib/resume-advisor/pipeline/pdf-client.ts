export interface ClientPdfExtraction {
  text: string;
  lines: string[];
  pageCount: number;
}

export async function extractTextFromPdf(file: File): Promise<ClientPdfExtraction> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const version = (pdfjs as any).version || '4.0.0';
  (pdfjs as any).GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = (pdfjs as any).getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: true,
    isEvalSupported: false,
  });

  const pdf = await loadingTask.promise;

  const pageTexts: string[] = [];
  const lines: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const items = (content.items || []) as Array<{ str?: string }>;

    const pageText = items
      .map((item) => item.str || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageText) {
      pageTexts.push(pageText);
    }

    for (const item of items) {
      const line = (item.str || '').trim();
      if (line) {
        lines.push(line);
      }
    }
  }

  return {
    text: pageTexts.join('\n'),
    lines,
    pageCount: pdf.numPages,
  };
}
