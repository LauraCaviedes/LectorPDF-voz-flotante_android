import { PdfDocumentData, SentenceChunk } from '../types';

/**
 * Módulo de Transformación & Sanitización Regex (Matching PdfDataPipeline.kt)
 */
export function sanitizePdfText(rawText: string): string {
  if (!rawText) return '';

  let cleaned = rawText;

  // 1. Unir palabras cortadas por guiones al final de línea (ej. "transfor-\nmación" -> "transformación")
  cleaned = cleaned.replace(/([a-zA-ZáéíóúñÁÉÍÓÚÑ]+)-\s*[\r\n]+\s*([a-zA-ZáéíóúñÁÉÍÓÚÑ]+)/g, '$1$2');

  // 2. Reemplazar saltos de línea individuales dentro de oraciones por un espacio
  // (mantiene saltos dobles para separar párrafos)
  cleaned = cleaned.replace(/(?<![.!?;\n])\s*[\r\n]+\s*(?![.!?;\n])/g, ' ');

  // 3. Normalizar múltiples espacios en blanco
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

  // 4. Limpiar caracteres de control o invisibles raros
  cleaned = cleaned.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return cleaned.trim();
}

/**
 * Chunking Semántico: Divide el texto sanitizado en oraciones completas indexadas
 * Delimitado estrictamente por puntos, signos de interrogación y exclamación (. ? !)
 */
export function chunkIntoSentences(sanitizedText: string, defaultPageNumber = 1): SentenceChunk[] {
  if (!sanitizedText || sanitizedText.trim().length === 0) return [];

  // Split por fin de oración manteniendo el delimitador
  // Expresión regular que coincide con terminaciones de oración (. ! ?)
  const rawSentences = sanitizedText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const chunks: SentenceChunk[] = [];
  let currentIndex = 0;

  for (const sentence of rawSentences) {
    // Si una oración resulta demasiado larga sin puntuación, asegurarse de no romper oraciones
    chunks.push({
      index: currentIndex,
      text: sentence,
      pageNumber: defaultPageNumber,
      characterLength: sentence.length
    });
    currentIndex++;
  }

  return chunks;
}

/**
 * Extrae texto de páginas utilizando pdfjs-dist para archivos PDF reales subidos por el usuario
 */
export async function extractTextFromPdfFile(file: File): Promise<PdfDocumentData> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker src
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const rawPageTexts: string[] = [];
    const allChunks: SentenceChunk[] = [];
    let globalSentenceIndex = 0;
    let fullSanitizedAcc = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');

      rawPageTexts.push(pageText);

      const sanitizedPage = sanitizePdfText(pageText);
      fullSanitizedAcc += (fullSanitizedAcc ? ' ' : '') + sanitizedPage;

      const pageSentences = chunkIntoSentences(sanitizedPage, pageNum);
      for (const sentence of pageSentences) {
        allChunks.push({
          ...sentence,
          index: globalSentenceIndex,
          pageNumber: pageNum
        });
        globalSentenceIndex++;
      }
    }

    return {
      title: file.name,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      totalPages: pdf.numPages,
      rawPageTexts,
      sanitizedText: fullSanitizedAcc,
      sentences: allChunks
    };
  } catch (error) {
    console.warn('Fallback to text reading for uploaded file:', error);
    // Si falla el PDF binary parse (por ejemplo, si suben un archivo de texto plano), leer como texto
    const textContent = await file.text();
    const sanitized = sanitizePdfText(textContent);
    const sentences = chunkIntoSentences(sanitized, 1);

    return {
      title: file.name,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      totalPages: 1,
      rawPageTexts: [textContent],
      sanitizedText: sanitized,
      sentences
    };
  }
}
