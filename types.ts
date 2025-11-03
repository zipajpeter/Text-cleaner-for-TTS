export interface Chapter {
  title: string;
  content: string;
}

export interface ProcessingOptions {
  removeHeadersFooters: boolean;
  removePageNumbers: boolean;
  normalizeWhitespace: boolean;
  linearizeTables: boolean;
  startPage?: number;
  endPage?: number;
}

export type SplitStrategy = 'auto' | 'none';