import { createWorker, Worker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { ProcessedFile, OCRSettings } from '@/components/ocr/OCRApp';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

interface ProcessingUpdate {
  (fileId: string, updates: Partial<ProcessedFile>): void;
}

export const processFiles = async (
  files: ProcessedFile[],
  settings: OCRSettings,
  onUpdate: ProcessingUpdate
): Promise<void> => {
  const worker: Worker = await createWorker(settings.language);

  try {
    for (const file of files) {
      try {
        onUpdate(file.id, { status: 'processing', progress: 0 });

        let result: { text: string; confidence?: number };

        if (file.type === 'image') {
          result = await processImage(file.file, worker, (progress) => {
            onUpdate(file.id, { progress: progress * 100 });
          });
        } else {
          result = await processPDF(
            file.file,
            settings,
            worker,
            (progress, currentPage, pageCount) => {
              onUpdate(file.id, { 
                progress: progress * 100,
                currentPage,
                pageCount: pageCount || undefined
              });
            }
          );
        }

        // Calculate stats
        const wordCount = result.text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const charCount = result.text.length;

        onUpdate(file.id, {
          status: 'completed',
          progress: 100,
          result: {
            text: result.text,
            confidence: result.confidence,
            wordCount,
            charCount,
          },
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        onUpdate(file.id, {
          status: 'error',
          progress: 0,
          error: error instanceof Error ? error.message : 'Processing failed',
        });
      }
    }
  } finally {
    await worker.terminate();
  }
};

const processImage = async (
  file: File,
  worker: Worker,
  onProgress: (progress: number) => void
): Promise<{ text: string; confidence?: number }> => {
  const { data } = await worker.recognize(file);

  return {
    text: data.text,
    confidence: data.confidence,
  };
};

const processPDF = async (
  file: File,
  settings: OCRSettings,
  worker: Worker,
  onProgress: (progress: number, currentPage?: number, pageCount?: number) => void
): Promise<{ text: string; confidence?: number }> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  
  onProgress(0, 0, numPages);

  const results: Array<{ text: string; confidence?: number }> = [];
  let totalConfidence = 0;
  let confidenceCount = 0;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    onProgress((pageNum - 1) / numPages, pageNum, numPages);

    const page = await pdf.getPage(pageNum);
    let pageText = '';
    let pageConfidence: number | undefined;

    try {
      // Try to extract text directly first
      const textContent = await page.getTextContent();
      const directText = textContent.items
        .filter((item: any) => 'str' in item)
        .map((item: any) => item.str)
        .join(' ')
        .trim();

      // Check if we have meaningful text
      const hasGoodText = directText.length > 10 && 
        /[a-zA-Z]{3,}/.test(directText) && 
        (directText.match(/\w/g) || []).length > 20;

      if (hasGoodText && (!settings.ocrFallback || directText.length > settings.confidenceThreshold)) {
        pageText = directText;
      } else if (settings.ocrFallback) {
        // Fallback to OCR
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Could not get canvas context');
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        // Convert canvas to blob for OCR
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png');
        });

        const ocrResult = await worker.recognize(blob);
        pageText = ocrResult.data.text;
        pageConfidence = ocrResult.data.confidence;

        if (pageConfidence !== undefined) {
          totalConfidence += pageConfidence;
          confidenceCount++;
        }
      } else {
        pageText = directText;
      }
    } catch (error) {
      console.error(`Error processing page ${pageNum}:`, error);
      pageText = `[Error processing page ${pageNum}]`;
    }

    if (pageText.trim()) {
      const pageResult = settings.pageBreaks 
        ? `\n--- Page ${pageNum} ---\n${pageText}`
        : pageText;
      
      results.push({
        text: pageResult,
        confidence: pageConfidence,
      });
    }

    onProgress(pageNum / numPages, pageNum, numPages);
  }

  const combinedText = results.map(r => r.text).join('\n').trim();
  const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : undefined;

  return {
    text: combinedText || '[No text could be extracted]',
    confidence: averageConfidence,
  };
};