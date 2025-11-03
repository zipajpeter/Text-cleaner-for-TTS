
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, FileIcon } from './Icons';

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ file, onFileChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
    }
  }, [onFileChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    if (inputRef.current) {
        inputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col">
    {file ? (
        <div className="h-full flex flex-col justify-center items-center text-center p-4 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600">
            <FileIcon />
            <p className="font-semibold text-white mt-2 break-all">{file.name}</p>
            <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
            <button 
                onClick={handleRemoveFile}
                className="mt-4 text-sm bg-red-500/20 hover:bg-red-500/40 text-red-300 px-3 py-1 rounded-md transition-colors"
            >
                Remove File
            </button>
        </div>
    ) : (
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`h-full flex flex-col justify-center items-center text-center p-6 bg-gray-900/50 rounded-lg border-2 border-dashed transition-colors duration-300 cursor-pointer
          ${isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-cyan-500 hover:bg-cyan-500/10'}`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.docx,.txt,.rtf,.md,.html"
        />
        <div className="flex flex-col items-center pointer-events-none">
            <UploadIcon isDragging={isDragging} />
            <p className="mt-4 text-lg font-semibold text-gray-300">
              Drag & drop a file here
            </p>
            <p className="text-gray-500">or click to select a file</p>
            <p className="text-xs text-gray-600 mt-2">
              Supported: PDF, DOCX, TXT, RTF, MD, HTML
            </p>
        </div>
      </div>
    )}
    </div>
  );
};

export default FileUpload;
