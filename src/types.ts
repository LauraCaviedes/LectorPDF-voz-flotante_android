export interface SentenceChunk {
  index: number;
  text: string;
  pageNumber: number;
  characterLength: number;
}

export type HeadingCategory = 'content' | 'frontmatter' | 'chapter' | 'section' | 'appendix' | 'bibliography';

export interface HeadingItem {
  id: string;
  title: string;
  sentenceIndex: number;
  level: 1 | 2; // 1 = Chapter / Title, 2 = Subtitle / Section
  pageNumber: number;
  isFrontMatter?: boolean; // True for Copyright, Acknowledgments, Table of Contents, Editorial
  category: HeadingCategory;
}

export interface PdfDocumentData {
  title: string;
  totalPages: number;
  rawPageTexts: string[];
  sanitizedText: string;
  sentences: SentenceChunk[];
  headings?: HeadingItem[];
  fileName?: string;
  fileSize?: string;
}

export type PipelineStep = 'EXTRACT' | 'TRANSFORM' | 'CHUNK' | 'CONSUME';

export interface FloatingWidgetState {
  isVisible: boolean;
  isServiceRunning: boolean;
  isPlaying: boolean;
  currentSentenceIndex: number;
  readingSpeed: number; // 0.5 to 2.0
  pitch: number; // 0.7 to 1.3 for softer warm timbre
  smoothVoiceMode: boolean; // Enables prosody smoothing & warm acoustic curve
  interSentencePause: number; // Delay between sentences in ms (e.g. 300ms)
  selectedVoice: string; // e.g. "es-MX-JorgeNeural"
  voiceURI?: string; // Target browser voice URI
  hasOverlayPermission: boolean;
  position: { x: number; y: number };
}

export interface CodeFile {
  id: string;
  name: string;
  path: string;
  language: 'kotlin' | 'xml' | 'gradle';
  description: string;
  content: string;
}
