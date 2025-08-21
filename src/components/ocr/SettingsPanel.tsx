import { Settings, Languages, FileCheck, Hash, ToggleLeft, ToggleRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { OCRSettings } from './OCRApp';

interface SettingsPanelProps {
  settings: OCRSettings;
  onSettingsChange: (settings: OCRSettings) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'ita', name: 'Italian' },
  { code: 'por', name: 'Portuguese' },
  { code: 'rus', name: 'Russian' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'chi_tra', name: 'Chinese (Traditional)' },
  { code: 'ara', name: 'Arabic' },
  { code: 'kor', name: 'Korean' },
];

export const SettingsPanel = ({ 
  settings, 
  onSettingsChange, 
  disabled 
}: SettingsPanelProps) => {
  const updateSetting = <K extends keyof OCRSettings>(
    key: K, 
    value: OCRSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const ToggleButton = ({ 
    enabled, 
    onClick, 
    children 
  }: { 
    enabled: boolean; 
    onClick: () => void; 
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="h-auto p-2 justify-start gap-2 hover:bg-muted/50"
    >
      {enabled ? (
        <ToggleRight className="w-4 h-4 text-primary" />
      ) : (
        <ToggleLeft className="w-4 h-4 text-muted-foreground" />
      )}
      <span className={enabled ? "text-foreground" : "text-muted-foreground"}>
        {children}
      </span>
    </Button>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold">Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure OCR processing
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-muted-foreground" />
            <Label className="font-medium">OCR Language</Label>
          </div>
          <Select
            value={settings.language}
            onValueChange={(value) => updateSetting('language', value)}
            disabled={disabled}
          >
            <SelectTrigger className="bg-background/50 border-input-border">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose the primary language for text recognition
          </p>
        </div>

        {/* Confidence Threshold */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <Label className="font-medium">Confidence Threshold</Label>
            <span className="text-sm text-muted-foreground ml-auto">
              {settings.confidenceThreshold}%
            </span>
          </div>
          <Slider
            value={[settings.confidenceThreshold]}
            onValueChange={([value]) => updateSetting('confidenceThreshold', value)}
            min={0}
            max={100}
            step={5}
            disabled={disabled}
            className="py-3"
          />
          <p className="text-xs text-muted-foreground">
            Minimum confidence level for OCR fallback on PDF pages
          </p>
        </div>

        {/* Toggle Options */}
        <div className="space-y-2">
          <Label className="font-medium">Processing Options</Label>
          
          <div className="space-y-1 rounded-lg border border-border/50 p-3 bg-muted/20">
            <ToggleButton
              enabled={settings.ocrFallback}
              onClick={() => updateSetting('ocrFallback', !settings.ocrFallback)}
            >
              OCR Fallback for PDFs
            </ToggleButton>
            <p className="text-xs text-muted-foreground ml-6">
              Use OCR when PDF text extraction yields poor results
            </p>
          </div>

          <div className="space-y-1 rounded-lg border border-border/50 p-3 bg-muted/20">
            <ToggleButton
              enabled={settings.pageBreaks}
              onClick={() => updateSetting('pageBreaks', !settings.pageBreaks)}
            >
              Keep Page Separators
            </ToggleButton>
            <p className="text-xs text-muted-foreground ml-6">
              Add page breaks between extracted text pages
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-4 border-t border-border">
          <Label className="font-medium mb-3 block">Quick Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSettingsChange({
                language: 'eng',
                ocrFallback: true,
                pageBreaks: true,
                confidenceThreshold: 70,
              })}
              disabled={disabled}
              className="text-xs"
            >
              <FileCheck className="w-3 h-3 mr-1" />
              Standard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSettingsChange({
                language: 'eng',
                ocrFallback: false,
                pageBreaks: false,
                confidenceThreshold: 90,
              })}
              disabled={disabled}
              className="text-xs"
            >
              <Languages className="w-3 h-3 mr-1" />
              Fast
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};