import { Clock, Zap, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ProcessedFile } from './OCRApp';

interface ProgressPanelProps {
  files: ProcessedFile[];
}

export const ProgressPanel = ({ files }: ProgressPanelProps) => {
  const totalProgress = files.reduce((sum, file) => sum + file.progress, 0) / files.length;
  const currentFile = files.find(f => f.progress > 0 && f.progress < 100);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-glow">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold">Processing Files</h3>
          <p className="text-sm text-muted-foreground">
            {files.length} file(s) in queue
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(totalProgress)}%
          </span>
        </div>
        <Progress value={totalProgress} className="h-3" />
      </div>

      {/* Current File Details */}
      {currentFile && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-3">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{currentFile.name}</p>
              {currentFile.currentPage && currentFile.pageCount && (
                <p className="text-sm text-muted-foreground">
                  Processing page {currentFile.currentPage} of {currentFile.pageCount}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress value={currentFile.progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(currentFile.progress)}% complete</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Processing...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queue Status */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-lg font-semibold text-info">
            {files.filter(f => f.progress > 0).length}
          </div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-warning">
            {files.filter(f => f.progress === 0).length}
          </div>
          <div className="text-xs text-muted-foreground">Waiting</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-secondary">
            {files.filter(f => f.progress === 100).length}
          </div>
          <div className="text-xs text-muted-foreground">Done</div>
        </div>
      </div>
    </div>
  );
};