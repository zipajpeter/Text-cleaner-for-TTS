import React, { useState, useCallback } from 'react';
import { Chapter, ProcessingOptions, SplitStrategy } from './types';
import { cleanAndStructureText } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ProcessingOptionsPanel from './components/ProcessingOptionsPanel';
import ResultsDisplay from './components/ResultsDisplay';
import Loader from './components/Loader';
import { CleanIcon, LogoIcon } from './components/Icons';

// To use JSZip and FileSaver which are loaded via CDN
declare const JSZip: any;
declare const saveAs: any;

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    removeHeadersFooters: true,
    removePageNumbers: true,
    normalizeWhitespace: true,
    linearizeTables: true,
    startPage: undefined,
    endPage: undefined,
  });
  const [splitStrategy, setSplitStrategy] = useState<SplitStrategy>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cleanedChapters, setCleanedChapters] = useState<Chapter[] | null>(null);

  const handleFileChange = useCallback((selectedFile: File | null) => {
    setFile(selectedFile);
    setCleanedChapters(null);
    setError(null);
  }, []);

  const handleProcessClick = useCallback(async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCleanedChapters(null);

    try {
      const result = await cleanAndStructureText(file, processingOptions, splitStrategy);
      if (result && result.chapters && result.chapters.length > 0) {
        setCleanedChapters(result.chapters);
      } else {
        setError('The AI could not process the document or returned an empty result. Please try again or with a different document.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during processing.');
    } finally {
      setIsLoading(false);
    }
  }, [file, processingOptions, splitStrategy]);

  const handleDownloadAllAsZip = useCallback(() => {
    if (!cleanedChapters) return;

    const zip = new JSZip();
    cleanedChapters.forEach((chapter, index) => {
      const fileName = `${String(index + 1).padStart(2, '0')}_${chapter.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      zip.file(fileName, chapter.content);
    });

    zip.generateAsync({ type: 'blob' }).then(function (content: any) {
      saveAs(content, 'cleaned_text_chapters.zip');
    });
  }, [cleanedChapters]);

  const handleReset = () => {
    setFile(null);
    setCleanedChapters(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-2">
                <LogoIcon/>
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    Text Cleaner for TTS
                </h1>
            </div>
          <p className="text-lg text-gray-400">
            Upload a document, and let AI clean and structure it for perfect Text-to-Speech narration.
          </p>
        </header>

        <main className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 ring-1 ring-white/10">
          {isLoading ? (
            <Loader />
          ) : error ? (
            <div className="text-center">
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <button
                onClick={handleReset}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : cleanedChapters ? (
            <ResultsDisplay 
              chapters={cleanedChapters} 
              onDownloadAll={handleDownloadAllAsZip}
              onReset={handleReset}
            />
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-grow lg:w-1/2">
                <h2 className="text-2xl font-semibold mb-4 text-cyan-300">1. Upload Document</h2>
                <FileUpload file={file} onFileChange={handleFileChange} />
              </div>
              <div className="flex-grow lg:w-1/2">
                <h2 className="text-2xl font-semibold mb-4 text-cyan-300">2. Configure &amp; Clean</h2>
                <ProcessingOptionsPanel
                  options={processingOptions}
                  setOptions={setProcessingOptions}
                  splitStrategy={splitStrategy}
                  setSplitStrategy={setSplitStrategy}
                />
                <button
                  onClick={handleProcessClick}
                  disabled={!file}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                  <CleanIcon />
                  Clean Text
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
       <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by Google Gemini. Designed for optimal TTS preparation.</p>
        </footer>
    </div>
  );
}