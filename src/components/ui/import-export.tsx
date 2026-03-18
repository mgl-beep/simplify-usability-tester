import { useState, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle2, AlertCircle, X, File, Loader2 } from 'lucide-react';
import { Button } from './button';
import { ProgressIndicator, CircularProgress } from './progress-indicator';

// Import Component
interface ImportOptions {
  fileTypes: string[];
  maxSize?: number; // MB
  multiple?: boolean;
  description?: string;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (files: File[]) => Promise<void>;
  options: ImportOptions;
  title?: string;
}

export function ImportModal({ 
  isOpen, 
  onClose, 
  onImport, 
  options,
  title = 'Import Files'
}: ImportModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const maxSizeMB = options.maxSize || 10;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    validateAndAddFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      validateAndAddFiles(files);
    }
  };

  const validateAndAddFiles = (files: File[]) => {
    setError(null);

    // Validate file types
    const invalidFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return !options.fileTypes.includes(extension);
    });

    if (invalidFiles.length > 0) {
      setError(`Invalid file type. Accepted: ${options.fileTypes.join(', ')}`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxSizeBytes);
    if (oversizedFiles.length > 0) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    if (options.multiple) {
      setSelectedFiles(prev => [...prev, ...files]);
    } else {
      setSelectedFiles([files[0]]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress (in real app, track actual upload progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await onImport(selectedFiles);

      clearInterval(progressInterval);
      setProgress(100);

      // Close after brief success state
      setTimeout(() => {
        onClose();
        resetState();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const resetState = () => {
    setSelectedFiles([]);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[16px] w-full max-w-[600px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e5e7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0071e3] to-[#00d084] flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[#1d1d1f]">{title}</h2>
              {options.description && (
                <p className="text-[13px] text-[#636366]">{options.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="w-8 h-8 rounded-full hover:bg-[#e5e5e7] flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[#636366]" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[12px] p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#0071e3] bg-[#0071e3]/5'
                : 'border-[#d2d2d7] hover:border-[#636366] hover:bg-[#f5f5f7]'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-[#0071e3]' : 'text-[#636366]'}`} strokeWidth={1.5} />
            <p className="text-[15px] font-medium text-[#1d1d1f] mb-1">
              {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-[13px] text-[#636366]">
              {options.fileTypes.join(', ')} • Max {maxSizeMB}MB
              {options.multiple && ' • Multiple files allowed'}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={options.fileTypes.join(',')}
            multiple={options.multiple}
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-[13px] font-medium text-[#636366]">
                Selected Files ({selectedFiles.length})
              </p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-[#EEECE8] rounded-lg"
                  >
                    <File className="w-5 h-5 text-[#0071e3] flex-shrink-0" strokeWidth={2} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[#1d1d1f] truncate">
                        {file.name}
                      </p>
                      <p className="text-[12px] text-[#636366]">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {!isUploading && (
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="w-6 h-6 rounded-full hover:bg-[#e5e5e7] flex items-center justify-center transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-[#636366]" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#636366]">Uploading...</span>
                <span className="text-[#0071e3] font-semibold">{progress}%</span>
              </div>
              <div className="h-2 bg-[#e5e5e7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0071e3] to-[#00d084] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" strokeWidth={2} />
              <p className="text-[13px] text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e5e5e7] flex items-center gap-3">
          <Button
            onClick={onClose}
            disabled={isUploading}
            className="flex-1 h-[44px] rounded-full border border-[#d2d2d7] bg-white text-[#1d1d1f]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedFiles.length === 0 || isUploading}
            className="flex-1 h-[44px] rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2} />
                Importing...
              </>
            ) : (
              <>Import {selectedFiles.length > 0 && `(${selectedFiles.length})`}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Export Component
export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf';

interface ExportOptions {
  formats: ExportFormat[];
  includeOptions?: Array<{
    id: string;
    label: string;
    description?: string;
    default: boolean;
  }>;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, options: Record<string, boolean>) => Promise<void>;
  options: ExportOptions;
  title?: string;
  itemCount?: number;
}

export function ExportModal({
  isOpen,
  onClose,
  onExport,
  options,
  title = 'Export Data',
  itemCount
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(options.formats[0]);
  const [includeOptions, setIncludeOptions] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    options.includeOptions?.forEach(opt => {
      initial[opt.id] = opt.default;
    });
    return initial;
  });
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const formatConfig = {
    csv: { icon: FileText, label: 'CSV', description: 'Comma-separated values' },
    json: { icon: FileText, label: 'JSON', description: 'JavaScript Object Notation' },
    xlsx: { icon: FileText, label: 'Excel', description: 'Microsoft Excel format' },
    pdf: { icon: FileText, label: 'PDF', description: 'Portable Document Format' }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await onExport(selectedFormat, includeOptions);

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        onClose();
        setProgress(0);
      }, 1000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[16px] w-full max-w-[500px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e5e7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d084] to-[#0071e3] flex items-center justify-center">
              <Download className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[#1d1d1f]">{title}</h2>
              {itemCount !== undefined && (
                <p className="text-[13px] text-[#636366]">
                  Exporting {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="w-8 h-8 rounded-full hover:bg-[#e5e5e7] flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[#636366]" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-[13px] font-semibold text-[#636366] uppercase tracking-wide mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {options.formats.map(format => {
                const config = formatConfig[format];
                return (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`p-4 rounded-[12px] border-2 text-left transition-all ${
                      selectedFormat === format
                        ? 'border-[#0071e3] bg-[#0071e3]/5'
                        : 'border-[#d2d2d7] hover:border-[#636366]'
                    }`}
                  >
                    <config.icon className={`w-6 h-6 mb-2 ${
                      selectedFormat === format ? 'text-[#0071e3]' : 'text-[#636366]'
                    }`} strokeWidth={2} />
                    <p className="text-[14px] font-semibold text-[#1d1d1f] mb-0.5">
                      {config.label}
                    </p>
                    <p className="text-[12px] text-[#636366]">
                      {config.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Include Options */}
          {options.includeOptions && options.includeOptions.length > 0 && (
            <div>
              <label className="block text-[13px] font-semibold text-[#636366] uppercase tracking-wide mb-3">
                Include
              </label>
              <div className="space-y-2">
                {options.includeOptions.map(option => (
                  <label
                    key={option.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#f5f5f7] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={includeOptions[option.id]}
                      onChange={(e) => setIncludeOptions(prev => ({
                        ...prev,
                        [option.id]: e.target.checked
                      }))}
                      className="w-5 h-5 mt-0.5 rounded border-[#d2d2d7] text-[#0071e3] focus:ring-2 focus:ring-[#0071e3]"
                    />
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-[#1d1d1f]">
                        {option.label}
                      </p>
                      {option.description && (
                        <p className="text-[12px] text-[#636366]">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#636366]">Exporting...</span>
                <span className="text-[#0071e3] font-semibold">{progress}%</span>
              </div>
              <div className="h-2 bg-[#e5e5e7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00d084] to-[#0071e3] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e5e5e7] flex items-center gap-3">
          <Button
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 h-[44px] rounded-full border border-[#d2d2d7] bg-white text-[#1d1d1f]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 h-[44px] rounded-full bg-[#00d084] hover:bg-[#00ba75] text-white disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2} />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" strokeWidth={2} />
                Export
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
