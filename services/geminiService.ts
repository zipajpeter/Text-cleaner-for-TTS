import { GoogleGenAI, Type } from "@google/genai";
import { ProcessingOptions, SplitStrategy, Chapter } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export async function cleanAndStructureText(
  file: File,
  options: ProcessingOptions,
  splitStrategy: SplitStrategy
): Promise<{ chapters: Chapter[] }> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const filePart = await fileToGenerativePart(file);

  const cleaningInstructions = `
    - ${options.removeHeadersFooters ? "Identify and remove any repeating headers and footers." : "Keep headers and footers."}
    - ${options.removePageNumbers ? "Remove all page numbering." : "Keep page numbering."}
    - ${options.normalizeWhitespace ? "Normalize all whitespace. This means removing extra spaces, tabs, and line breaks to create a smooth, continuous text flow. Paragraphs should be separated by a single newline." : "Preserve original whitespace as much as possible."}
    - ${options.linearizeTables ? "Convert any tables into a linear, readable paragraph format. For example, a row with 'Name: John, Age: 30' should become 'Name: John, Age: 30.'." : "Attempt to preserve table structure or represent it clearly."}
    - Remove superfluous artifacts like standalone URLs or footnote markers from the main body text.
    - Remove all parentheses ().
    - Remove all quotation marks ("").
    - Remove all hyphens (-). If a hyphen breaks a word at the end of a line, the word should be rejoined.
    - Convert all numerical digits into their full-text word equivalents in the document's language. For example, '1,645' should become 'one thousand six hundred forty-five' and 'Chapter 10' should become 'Chapter ten'.
    - Correct any obvious OCR errors if the source is an image-based document.
  `;

  const splittingInstruction = splitStrategy === 'auto'
    ? "Analyze the document's structure (e.g., chapters, sections with clear headings) and split the cleaned text into logical chapters. Provide a concise, descriptive title for each chapter."
    : "Process the entire document as a single, unified text block. The title for this single chapter should be 'Full Document'.";
    
  let rangeInstruction = '';
  if (options.startPage || options.endPage) {
      if (options.startPage && options.endPage) {
          rangeInstruction = `IMPORTANT: Focus your processing ONLY on the content from page ${options.startPage} to page ${options.endPage} of the provided document. Ignore all content outside this page range.`;
      } else if (options.startPage) {
          rangeInstruction = `IMPORTANT: Focus your processing ONLY on the content from page ${options.startPage} to the end of the provided document. Ignore all content before this page.`;
      } else if (options.endPage) {
          rangeInstruction = `IMPORTANT: Focus your processing ONLY on the content from the beginning of the document up to page ${options.endPage}. Ignore all content after this page.`;
      }
  }

  const prompt = `
    You are an expert text processing engine designed to prepare document content for Text-to-Speech (TTS) applications. Your goal is to create clean, structured, and easily narratable text.

    I have provided a file. Please perform the following tasks:
    
    ${rangeInstruction}

    1.  **Analyze and Clean the Text:** Apply the following cleaning rules to the specified page range:
        ${cleaningInstructions}

    2.  **Structure the Output:** Based on this instruction: ${splittingInstruction}

    Your final output MUST be a valid JSON object matching the provided schema. Do not include any text or markdown formatting outside of the JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [
          { text: prompt },
          filePart
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "A concise title for the chapter or section."
                  },
                  content: {
                    type: Type.STRING,
                    description: "The full, cleaned text content of the chapter."
                  },
                },
                required: ["title", "content"],
              },
            },
          },
          required: ["chapters"],
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as { chapters: Chapter[] };
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to process the document with the AI model. The model might be overloaded or the document format could be incompatible.");
  }
}