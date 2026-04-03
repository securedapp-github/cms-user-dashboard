import React, { useRef, useState } from 'react';
import { UploadCloud, X, File as FileIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileUploadProps {
  label?: string;
  onFileSelect?: (file: File | null) => void;
  accept?: string;
  error?: string;
}

export function FileUpload({ label, onFileSelect, accept, error }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#0f172a] mb-0.5">{label}</label>
      )}

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center w-full rounded-[12px]",
          "border-2 border-dashed cursor-pointer transition-all duration-200",
          "min-h-[110px]",
          selectedFile
            ? "border-emerald-400 bg-emerald-50/60 hover:bg-emerald-50"
            : isDragging
              ? "border-[#4f46e5] bg-[#eef2ff] scale-[1.01]"
              : "border-[#e2e8f0] bg-[#f9fafb] hover:border-[#4f46e5] hover:bg-[#f8fafc]",
          error && !selectedFile && "border-[#ef4444] bg-red-50",
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-2 p-5 text-center">
            <CheckCircle2 size={28} className="text-emerald-500" />
            <div className="flex items-center gap-2">
              <FileIcon size={16} className="text-emerald-600 shrink-0" />
              <span className="text-sm font-semibold text-emerald-700 truncate max-w-[220px]">
                {selectedFile.name}
              </span>
            </div>
            <span className="text-xs text-[#64748b] bg-white px-2.5 py-0.5 rounded-full border border-[#e2e8f0]">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
            <button
              onClick={clearFile}
              className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-sm text-[#94a3b8] hover:text-[#ef4444] hover:bg-red-50 transition-all"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 pointer-events-none px-4 text-center">
            <div className={cn(
              "w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors",
              isDragging ? "bg-[#eef2ff] text-[#4f46e5]" : "bg-[#f1f5f9] text-[#94a3b8]"
            )}>
              <UploadCloud size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0f172a]">
                <span className="text-[#4f46e5]">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-[#94a3b8] mt-0.5">PDF, PNG, JPG up to 5MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <span className="text-xs text-[#ef4444] font-medium">{error}</span>
      )}
    </div>
  );
}
