import { useState } from 'react';
import { FileText, Download, Copy, Search, Eye, Hash, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ProcessedFile } from './OCRApp';

interface ResultsPanelProps {
  files: ProcessedFile[];
}

export const ResultsPanel = ({ files }: ResultsPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const downloadText = (fileName: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Text file downloaded successfully');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Text copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy text');
    }
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) return text;
    
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-warning/30 text-foreground">$1</mark>');
  };

  const getTotalStats = () => {
    return files.reduce(
      (totals, file) => {
        if (file.result) {
          totals.words += file.result.wordCount;
          totals.chars += file.result.charCount;
          totals.confidence += file.result.confidence || 0;
        }
        return totals;
      },
      { words: 0, chars: 0, confidence: 0 }
    );
  };

  const stats = getTotalStats();
  const avgConfidence = files.length > 0 ? stats.confidence / files.length : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-semibold">Extracted Text</h3>
          <p className="text-sm text-muted-foreground">
            {files.length} file(s) processed
          </p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/20 border border-border/50">
        <div className="text-center">
          <div className="text-lg font-semibold text-secondary">{stats.words.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Type className="w-3 h-3" />
            Words
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-primary">{stats.chars.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Hash className="w-3 h-3" />
            Characters
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-accent">{Math.round(avgConfidence)}%</div>
          <div className="text-xs text-muted-foreground">Avg. Confidence</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search in extracted text..."
          className="pl-10 bg-background/50 border-input-border"
        />
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="rounded-xl border border-border/50 bg-gradient-card backdrop-blur-sm overflow-hidden"
          >
            <Collapsible
              open={expandedFile === file.id}
              onOpenChange={(open) => setExpandedFile(open ? file.id : null)}
            >
              <CollapsibleTrigger className="w-full p-4 text-left hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      {file.result && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{file.result.wordCount} words</span>
                          <span>•</span>
                          <span>{file.result.charCount} chars</span>
                          {file.result.confidence && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(file.result.confidence)}% confidence
                              </Badge>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => file.result && copyToClipboard(file.result.text)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => file.result && downloadText(file.name, file.result.text)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border-t border-border/50">
                <ScrollArea className="h-64 p-4">
                  {file.result && (
                    <div
                      className="text-sm leading-relaxed font-mono whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: highlightSearchTerm(file.result.text, searchTerm)
                      }}
                    />
                  )}
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      {files.length > 1 && (
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => {
              const allText = files
                .filter(f => f.result)
                .map(f => `=== ${f.name} ===\n${f.result!.text}`)
                .join('\n\n');
              copyToClipboard(allText);
            }}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy All
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const allText = files
                .filter(f => f.result)
                .map(f => `=== ${f.name} ===\n${f.result!.text}`)
                .join('\n\n');
              downloadText('combined-text', allText);
            }}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>
      )}
    </div>
  );
};