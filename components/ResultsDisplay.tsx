
import React, { useState } from 'react';
import { Chapter } from '../types';
import { DownloadIcon, CopyIcon, NewFileIcon, ZipIcon } from './Icons';

interface ResultsDisplayProps {
  chapters: Chapter[];
  onDownloadAll: () => void;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ chapters, onDownloadAll, onReset }) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  const activeChapter = chapters[activeChapterIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeChapter.content).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleDownloadChapter = () => {
    const blob = new Blob([activeChapter.content], { type: 'text/plain;charset=utf-8' });
    const fileName = `${String(activeChapterIndex + 1).padStart(2, '0')}_${activeChapter.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-6 h-[60vh] min-h-[500px]">
      {/* Left Panel: Chapters */}
      <div className="flex-shrink-0 md:w-1/3 lg:w-1/4 bg-gray-900/50 rounded-lg p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-cyan-300">Chapters</h3>
        <ul className="space-y-1">
          {chapters.map((chapter, index) => (
            <li key={index}>
              <button
                onClick={() => setActiveChapterIndex(index)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                  index === activeChapterIndex
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-700/80'
                }`}
              >
                {chapter.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Panel: Content and Actions */}
      <div className="flex-grow flex flex-col bg-gray-900/50 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white truncate">{activeChapter.title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-md hover:bg-gray-700 transition-colors"
              title="Copy to clipboard"
            >
              {copySuccess ? 
                <span className="text-green-400 text-xs">Copied!</span> : 
                <CopyIcon />
              }
            </button>
            <button
              onClick={handleDownloadChapter}
              className="p-2 rounded-md hover:bg-gray-700 transition-colors"
              title="Download this chapter"
            >
              <DownloadIcon />
            </button>
          </div>
        </div>
        <div className="flex-grow p-4 overflow-y-auto bg-gray-800/40">
          <pre className="whitespace-pre-wrap text-gray-300 font-sans text-base leading-relaxed">
            {activeChapter.content}
          </pre>
        </div>
        <div className="p-4 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
                onClick={onReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
               <NewFileIcon />
                Process Another File
            </button>
            <button
                onClick={onDownloadAll}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 rounded-lg transition-all"
            >
                <ZipIcon/>
                Download All as .zip
            </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
