import { useCallback } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { Upload, FileImage, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
  onFilesAdded: (files: FileWithPath[]) => void;
  disabled?: boolean;
}

export const FileDropZone = ({ onFilesAdded, disabled }: FileDropZoneProps) => {
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    if (acceptedFiles.length > 0) {
      onFilesAdded(acceptedFiles);
    }
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    disabled,
  });

  return (
    <div className="p-6">
      <div
        {...getRootProps()}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer",
          "min-h-[300px] flex flex-col items-center justify-center text-center p-8",
          isDragActive && !isDragReject && "border-primary bg-primary/5 scale-[1.02]",
          isDragReject && "border-destructive bg-destructive/5",
          !isDragActive && "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />
        
        <div className="relative z-10 space-y-6">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary shadow-glow">
            {isDragActive ? (
              <Plus className="w-8 h-8 text-primary-foreground animate-pulse" />
            ) : (
              <Upload className="w-8 h-8 text-primary-foreground" />
            )}
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">
              {isDragActive
                ? 'Drop your files here'
                : 'Drag & drop files or click to browse'
              }
            </h3>
            <p className="text-muted-foreground">
              Supports images (JPG, PNG) and PDF files
            </p>
          </div>

          {/* File type indicators */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileImage className="w-5 h-5 text-primary" />
              <span>Images</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-5 h-5 text-primary" />
              <span>PDFs</span>
            </div>
          </div>

          {/* Browse button */}
          {!isDragActive && (
            <Button
              variant="outline"
              size="lg"
              className="bg-background/80 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-bounce"
              disabled={disabled}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
          )}
        </div>

        {/* Error state */}
        {isDragReject && (
          <div className="absolute inset-x-0 bottom-4 mx-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">
              Please drop only JPG, PNG, or PDF files
            </p>
          </div>
        )}
      </div>
    </div>
  );
};