import { FileImage, FileText, X, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProcessedFile } from './OCRApp';
import { cn } from '@/lib/utils';

interface FileListProps {
  files: ProcessedFile[];
  onRemoveFile: (fileId: string) => void;
  onProcess: () => void;
  onClearCompleted: () => void;
  isProcessing: boolean;
}

export const FileList = ({ 
  files, 
  onRemoveFile, 
  onProcess, 
  onClearCompleted,
  isProcessing 
}: FileListProps) => {
  const pendingFiles = files.filter(f => f.status === 'pending');
  const completedFiles = files.filter(f => f.status === 'completed');
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'pending': return 'bg-muted text-muted-foreground';
      case 'processing': return 'bg-info text-info-foreground';
      case 'completed': return 'bg-secondary text-secondary-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Files Queue</h3>
          <p className="text-sm text-muted-foreground">
            {files.length} file(s) • {pendingFiles.length} pending • {completedFiles.length} completed
          </p>
        </div>
        
        <div className="flex gap-2">
          {pendingFiles.length > 0 && (
            <Button 
              onClick={onProcess}
              disabled={isProcessing}
              className="gradient-primary shadow-glow"
            >
              <Play className="w-4 h-4 mr-2" />
              Process All
            </Button>
          )}
          
          {completedFiles.length > 0 && (
            <Button
              variant="outline"
              onClick={onClearCompleted}
              disabled={isProcessing}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Completed
            </Button>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              "group relative overflow-hidden rounded-xl border transition-all duration-300",
              "bg-gradient-card backdrop-blur-sm border-border/50",
              file.status === 'processing' && "shadow-glow",
              file.status === 'completed' && "border-secondary/30",
              file.status === 'error' && "border-destructive/30"
            )}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    file.type === 'image' ? "bg-accent/10" : "bg-primary/10"
                  )}>
                    {file.type === 'image' ? (
                      <FileImage className="w-5 h-5 text-accent" />
                    ) : (
                      <FileText className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{formatFileSize(file.size)}</span>
                        {file.pageCount && (
                          <>
                            <span>•</span>
                            <span>{file.pageCount} pages</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge className={getStatusColor(file.status)}>
                      {file.status === 'processing' && file.currentPage && file.pageCount
                        ? `Page ${file.currentPage}/${file.pageCount}`
                        : file.status
                      }
                    </Badge>

                    {/* Remove Button */}
                    {file.status !== 'processing' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveFile(file.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {file.status === 'processing' && (
                    <div className="mt-3">
                      <Progress 
                        value={file.progress} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(file.progress)}% complete
                      </p>
                    </div>
                  )}

                  {/* Results Summary */}
                  {file.status === 'completed' && file.result && (
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{file.result.wordCount} words</span>
                      <span>•</span>
                      <span>{file.result.charCount} characters</span>
                      {file.result.confidence && (
                        <>
                          <span>•</span>
                          <span>{Math.round(file.result.confidence)}% confidence</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {file.status === 'error' && file.error && (
                    <div className="mt-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">{file.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};