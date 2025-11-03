import React from 'react';
import { ProcessingOptions, SplitStrategy } from '../types';

interface ProcessingOptionsPanelProps {
  options: ProcessingOptions;
  setOptions: React.Dispatch<React.SetStateAction<ProcessingOptions>>;
  splitStrategy: SplitStrategy;
  setSplitStrategy: React.Dispatch<React.SetStateAction<SplitStrategy>>;
}

const CheckboxOption: React.FC<{
  id: keyof ProcessingOptions;
  label: string;
  checked: boolean;
  onChange: (id: keyof ProcessingOptions, checked: boolean) => void;
}> = ({ id, label, checked, onChange }) => (
  <label htmlFor={id} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700/80 transition-colors">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(id, e.target.checked)}
      className="h-5 w-5 rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-600 focus:ring-2"
    />
    <span className="text-gray-300">{label}</span>
  </label>
);

const ProcessingOptionsPanel: React.FC<ProcessingOptionsPanelProps> = ({
  options,
  setOptions,
  splitStrategy,
  setSplitStrategy,
}) => {
  const handleOptionChange = (option: keyof ProcessingOptions, value: boolean) => {
    setOptions((prev) => ({ ...prev, [option]: value }));
  };
  
  const handlePageNumberChange = (field: 'startPage' | 'endPage', value: string) => {
    const num = value === '' ? undefined : parseInt(value, 10);
    setOptions((prev) => ({
      ...prev,
      [field]: isNaN(num) ? undefined : num,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Cleaning Options</h3>
        <div className="space-y-2">
          <CheckboxOption id="removeHeadersFooters" label="Remove Headers & Footers" checked={options.removeHeadersFooters} onChange={handleOptionChange} />
          <CheckboxOption id="removePageNumbers" label="Remove Page Numbers" checked={options.removePageNumbers} onChange={handleOptionChange} />
          <CheckboxOption id="normalizeWhitespace" label="Normalize Whitespace" checked={options.normalizeWhitespace} onChange={handleOptionChange} />
          <CheckboxOption id="linearizeTables" label="Linearize Tables for Speech" checked={options.linearizeTables} onChange={handleOptionChange} />
        </div>
      </div>
       <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Chapter Splitting</h3>
        <div className="flex space-x-2 rounded-lg bg-gray-700/50 p-1">
          <button
            onClick={() => setSplitStrategy('auto')}
            className={`w-full text-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              splitStrategy === 'auto' ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Auto-Detect Chapters
          </button>
          <button
            onClick={() => setSplitStrategy('none')}
            className={`w-full text-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              splitStrategy === 'none' ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Single Document
          </button>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Document Range (Optional)</h3>
        <p className="text-xs text-gray-500 mb-3">For very large documents, process in chunks to avoid errors.</p>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label htmlFor="startPage" className="block text-sm font-medium text-gray-400 mb-1">Start Page</label>
            <input 
              type="number"
              id="startPage"
              value={options.startPage || ''}
              onChange={(e) => handlePageNumberChange('startPage', e.target.value)}
              min="1"
              placeholder="e.g., 1"
              className="w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
           <div className="flex-1">
            <label htmlFor="endPage" className="block text-sm font-medium text-gray-400 mb-1">End Page</label>
            <input 
              type="number"
              id="endPage"
              value={options.endPage || ''}
              onChange={(e) => handlePageNumberChange('endPage', e.target.value)}
              min={options.startPage || 1}
              placeholder="e.g., 100"
              className="w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingOptionsPanel;