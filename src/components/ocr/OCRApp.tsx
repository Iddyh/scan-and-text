import { useState, useCallback } from 'react';
import { FileWithPath } from 'react-dropzone';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { FileDropZone } from './FileDropZone';
import { FileList } from './FileList';
import { ProgressPanel } from './ProgressPanel';
import { ResultsPanel } from './ResultsPanel';
import { SettingsPanel } from './SettingsPanel';
import { processFiles } from '@/lib/ocr/processor';

export interface ProcessedFile {
  id: string;
  file: FileWithPath;
  name: string;
  type: 'image' | 'pdf';
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  pageCount?: number;
  currentPage?: number;
  result?: {
    text: string;
    confidence?: number;
    wordCount: number;
    charCount: number;
  };
  error?: string;
}

export interface OCRSettings {
  language: string;
  ocrFallback: boolean;
  pageBreaks: boolean;
  confidenceThreshold: number;
}

export const OCRApp = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<OCRSettings>({
    language: 'eng',
    ocrFallback: true,
    pageBreaks: true,
    confidenceThreshold: 70,
  });

  const handleFilesAdded = useCallback((newFiles: FileWithPath[]) => {
    const processedFiles: ProcessedFile[] = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'pdf',
      size: file.size,
      status: 'pending',
      progress: 0,
    }));

    setFiles(prev => [...prev, ...processedFiles]);
    toast.success(`Added ${newFiles.length} file(s) for processing`);
  }, []);

  const handleProcess = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast.error('No files to process');
      return;
    }

    setIsProcessing(true);
    
    try {
      await processFiles(
        pendingFiles,
        settings,
        (fileId: string, updates: Partial<ProcessedFile>) => {
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, ...updates } : f
          ));
        }
      );
      
      toast.success('Processing completed!');
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [files, settings]);

  const handleClearCompleted = useCallback(() => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'));
    toast.success('Cleared completed files');
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const completedFiles = files.filter(f => f.status === 'completed');
  const processingFiles = files.filter(f => f.status === 'processing');
  const hasFiles = files.length > 0;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4">
            <span className="text-2xl font-bold text-primary-foreground">OCR</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Smart OCR Extractor
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Extract text from images and PDFs with AI-powered OCR technology. 
            All processing happens securely in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-8 space-y-6">
            {/* File Drop Zone */}
            <Card className="glass border-0 shadow-lg">
              <FileDropZone 
                onFilesAdded={handleFilesAdded}
                disabled={isProcessing}
              />
            </Card>

            {/* File List */}
            {hasFiles && (
              <Card className="glass border-0 shadow-lg">
                <FileList 
                  files={files}
                  onRemoveFile={handleRemoveFile}
                  onProcess={handleProcess}
                  onClearCompleted={handleClearCompleted}
                  isProcessing={isProcessing}
                />
              </Card>
            )}

            {/* Progress Panel */}
            {processingFiles.length > 0 && (
              <Card className="glass border-0 shadow-lg">
                <ProgressPanel files={processingFiles} />
              </Card>
            )}
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Settings */}
            <Card className="glass border-0 shadow-lg">
              <SettingsPanel 
                settings={settings}
                onSettingsChange={setSettings}
                disabled={isProcessing}
              />
            </Card>

            {/* Results */}
            {completedFiles.length > 0 && (
              <Card className="glass border-0 shadow-lg">
                <ResultsPanel files={completedFiles} />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};