import { PdfDocumentData, SentenceChunk, HeadingItem, HeadingCategory } from '../types';

/**
 * Abreviaciones comunes en español e inglés que no deben cortar oraciones.
 */
const COMMON_ABBREVIATIONS = [
  'pág', 'pag', 'págs', 'pags', 'cap', 'caps', 'vol', 'vols', 'art', 'arts',
  'dr', 'dra', 'dres', 'sr', 'sra', 'sres', 'ing', 'lic', 'prof', 'ed', 'eds',
  'etc', 'ej', 'fig', 'figs', 'no', 'nos', 'vv', 'uu', 'ee', 'col', 'cols',
  'i.e', 'e.g', 'vs', 'dept', 'p.ej', 'op.cit', 'ed.cit', 'tel', 'hab'
];

/**
 * Detecta si una línea de texto corresponde a un Número de Página,
 * Encabezado Repetitivo de Página (Header) o Pie de Página (Footer/Derechos/Copyright/Notas al pie).
 * Sirve para omitirlos completamente en la lectura TTS y evitar que se clasifiquen como secciones.
 */
export function isPageHeaderOrFooter(rawText: string, yCoord?: number, pageHeight?: number): boolean {
  if (!rawText) return true;
  const text = rawText.trim();
  if (text.length === 0) return true;

  // 1. Detección por coordenadas de PDF (si están disponibles)
  // En PDF Coordinate Space, Y = 0 es el borde INFERIOR de la página (Pie de página)
  // Y = pageHeight es el borde SUPERIOR de la página (Encabezado)
  if (yCoord !== undefined && pageHeight !== undefined && pageHeight > 0) {
    const isBottomMargin = yCoord < pageHeight * 0.14; // Borde inferior 14%
    const isTopMargin = yCoord > pageHeight * 0.92;    // Borde superior 8%
    if (isBottomMargin || isTopMargin) {
      // Si está en el margen superior/inferior
      if (text.length < 140 || /^\d+/.test(text) || /^\*/.test(text)) {
        return true;
      }
    }
  }

  // 2. Números de página aislados (ej. "12", "- 12 -", "[12]", "(12)", "Página 12", "Pág. 12", "12 / 45", "Página 12 de 45")
  const standalonePageNumRegex = /^(?:[-–—\[\(\s]*)(?:pág(?:ina)?|pag(?:ina)?|page)?\.?\s*\d+\s*(?:de|\/)?\s*\d*(?:[-–—\]\)\s]*)$/i;
  if (standalonePageNumRegex.test(text)) {
    return true;
  }

  // 3. Patrones de "Página X de Y" o "Pág. X de Y" o solo dígitos
  if (/^(?:pág(?:ina)?|pag(?:ina)?|page)?\.?\s*\d+\s+(?:de|\/)\s+\d+$/i.test(text)) {
    return true;
  }
  if (/^\d{1,4}$/.test(text)) {
    return true;
  }

  // 4. Notas al pie de página (Footnotes):
  // Ejemplos: "1. Texto de la nota...", "1 Texto al pie...", "* Nota del traductor...", "1 Véase pág. 40", "(1) Nota..."
  const footnoteMarkerRegex = /^(?:[\*\†\‡\§\d+]{1,3}[\.\)\s]+|\([\d\*\†]+\)\s*|\d+\s+)(?:véase|cf\.|nota|ver|estos|este|esta|según|fuente|citado|recuperado|disponible|http|www|doi:)/i;
  if (footnoteMarkerRegex.test(text)) {
    return true;
  }

  // Si la línea empieza con un número de nota al pie (ej: "1 Esta investigación fue realizada...") y es una nota corta (<120 caracteres)
  if (/^\d{1,2}\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]/.test(text) && text.length < 130 && (text.includes('pág') || text.includes('edición') || text.includes('nota') || text.includes('http') || text.includes('www') || text.includes('vol') || text.includes('op. cit') || text.includes('ibid'))) {
    return true;
  }

  // 5. Encabezados o pies repetitivos combinados con número de página
  const runningHeaderWithPageRegex = /^.{1,60}\s+[\-–—\|•]\s*(?:pág\.?|página|page)?\s*\d+$/i;
  if (runningHeaderWithPageRegex.test(text)) {
    return true;
  }

  // 6. Avisos legales de pie de página o copyright repetitivos o URLs/DOIs
  const footerCopyrightRegex = /^(?:copyright|©|todos los derechos reservados|all rights reserved|impreso en|editorial\s+[\w\s]+|isbn\b|issn\b|doi:|https?:\/\/|www\.)/i;
  if (footerCopyrightRegex.test(text) && text.length < 120) {
    return true;
  }

  return false;
}

/**
 * Prepara y sanitiza el texto específicamente para la Síntesis de Voz (TTS)
 * haciéndola sonar significativamente más natural, humana y fluida.
 */
export function prepareTextForSpeech(text: string): string {
  if (!text) return '';

  let speech = text;

  // 1. Eliminar referencias bibliográficas entre corchetes o paréntesis aislados (ej: [1], [1, 2], [1-5])
  speech = speech.replace(/\[\d+(?:\s*,\s*\d+|\s*[-–—]\s*\d+)*\]/g, '');

  // 2. Reemplazar guiones largos o dobles por comas suave para evitar pausas robóticas o pronunciación de "guion"
  speech = speech.replace(/\s*[—–-]{2,}\s*/g, ', ');
  speech = speech.replace(/\s+[\—–]\s+/g, ', ');

  // 3. Eliminar viñetas y símbolos especiales de inicio de lista
  speech = speech.replace(/^[\s•▪►\*\-–—]+\s*/, '');
  speech = speech.replace(/[\s•▪►\*]+/g, ' ');

  // 4. Expandir abreviaturas comunes en español para una pronunciación fluida
  const expansions: [RegExp, string][] = [
    [/\bpág\.\s*/gi, 'página '],
    [/\bpágs\.\s*/gi, 'páginas '],
    [/\bcap\.\s*/gi, 'capítulo '],
    [/\bcaps\.\s*/gi, 'capítulos '],
    [/\bdr\.\s*/gi, 'doctor '],
    [/\bdra\.\s*/gi, 'doctora '],
    [/\bing\.\s*/gi, 'ingeniero '],
    [/\blic\.\s*/gi, 'licenciado '],
    [/\bprof\.\s*/gi, 'profesor '],
    [/\be.g\.\s*/gi, 'por ejemplo, '],
    [/\bi.e\.\s*/gi, 'es decir, '],
    [/\bej\.\s*/gi, 'por ejemplo, '],
    [/\bp.ej\.\s*/gi, 'por ejemplo, '],
    [/\betc\.\b/gi, 'etcétera'],
    [/\bvol\.\s*/gi, 'volumen '],
    [/\bart\.\s*/gi, 'artículo '],
    [/\bvs\.\s*/gi, 'versus '],
  ];

  expansions.forEach(([regex, replacement]) => {
    speech = speech.replace(regex, replacement);
  });

  // 5. Normalizar espacios múltiples
  speech = speech.replace(/\s+/g, ' ').trim();

  return speech;
}

/**
 * Clasifica el texto de una línea o bloque para detectar si es Título de Contenido, Agradecimientos,
 * Capítulo, Apéndice, Bibliografía o Sección.
 */
export function classifyHeadingText(rawText: string, fontSize?: number, avgFontSize?: number): {
  isHeading: boolean;
  category: HeadingCategory;
  level: 1 | 2;
  isFrontMatter: boolean;
  cleanTitle: string;
} | null {
  const text = rawText.trim();
  if (text.length < 2) return null;

  // Si es un número de página o pie/encabezado repetitivo, NUNCA clasificar como sección o encabezado
  if (isPageHeaderOrFooter(text)) {
    return null;
  }

  // Evaluación de tamaño de fuente
  const isLargeFont = fontSize && avgFontSize && fontSize >= avgFontSize * 1.25;
  const isVeryLargeFont = fontSize && avgFontSize && fontSize >= avgFontSize * 1.45;

  // Limpiar número de página al final de líneas tipo índice (ej: "Capítulo 1 ........ 15")
  const cleanedDotLeaderText = text.replace(/[\.\s\-\_]{3,}\s*\d+$/, '').trim();

  // 1. CONTENT (Tabla de Contenidos / Índices / Summary)
  const contentRegex = /^(?:TABLA\s+DE\s+CONTENIDO[S]?|CONTENIDO[S]?|ÍNDICE(?:\s+GENERAL|\s+ANALÍTICO|\s+DE\s+CONTENIDOS)?|INDICE|TABLA\s+DE\s+MATERIAS|SUMARIO|TABLE\s+OF\s+CONTENTS|CONTENTS|INDEX)(?:\s*[:\-–—].*)?$/i;
  if (contentRegex.test(cleanedDotLeaderText) || (text.length <= 40 && /(?:TABLA\s+DE\s+CONTENIDO|CONTENIDO|ÍNDICE|INDICE|SUMARIO)/i.test(cleanedDotLeaderText))) {
    return {
      isHeading: true,
      category: 'content',
      level: 1,
      isFrontMatter: true,
      cleanTitle: cleanedDotLeaderText.length > 70 ? cleanedDotLeaderText.substring(0, 70) + '...' : cleanedDotLeaderText
    };
  }

  // 2. FRONTMATTER (Agradecimientos, Derechos de Autor, Copyright, Prefacio, Prólogo, Edición)
  const frontMatterRegex = /^(?:AGRADECIMIENTOS|DERECHOS\s+DE\s+AUTOR|COPYRIGHT|PREFACIO|PRÓLOGO|EDICIÓN|EDITORIAL|FE\s+DE\s+ERRATAS|DEDICATORIA|PRESENTACIÓN|CRÉDITOS)(?:\s*[:\-–—].*)?$/i;
  if (frontMatterRegex.test(cleanedDotLeaderText) || (text.length <= 50 && /(?:AGRADECIMIENTOS|DERECHOS\s+DE\s+AUTOR|COPYRIGHT|PREFACIO|PRÓLOGO|EDITORIAL|FE\s+DE\s+ERRATAS)/i.test(cleanedDotLeaderText))) {
    return {
      isHeading: true,
      category: 'frontmatter',
      level: 1,
      isFrontMatter: true,
      cleanTitle: cleanedDotLeaderText.length > 70 ? cleanedDotLeaderText.substring(0, 70) + '...' : cleanedDotLeaderText
    };
  }

  // 3. CHAPTER (Capítulos, Módulos, Unidades, Partes, Lecciones)
  const chapterRegex = /^(?:CAPÍTULO|CAPITULO|CHAPTER|PARTE|UNIDAD|MÓDULO|MODULO|LECCIÓN|LECCION)\s+([0-9IVXLCDM]+|PRIMERO|SEGUNDO|TERCERO|CUARTO|QUINTO|SEXTO|SÉPTIMO|OCTAVO|NOVENO|DÉCIMO|[\wÁÉÍÓÚÑ]+)(?:\s*[:\-–—\.]\s*|\s+)?(.*)/i;
  if (chapterRegex.test(cleanedDotLeaderText)) {
    return {
      isHeading: true,
      category: 'chapter',
      level: 1,
      isFrontMatter: false,
      cleanTitle: cleanedDotLeaderText.length > 75 ? cleanedDotLeaderText.substring(0, 75) + '...' : cleanedDotLeaderText
    };
  }

  // 4. APPENDIX (Apéndices, Anexos, Adjuntos)
  const appendixRegex = /^(?:APÉNDICE|APENDICE|APPENDIX|ANEXO|ANEXOS|APÉNDICES|APENDICES|ADJUNTO)\s*([A-Z0-9IVXLCDM]*)(?:\s*[:\-–—\.]\s*|\s+)?(.*)/i;
  if (appendixRegex.test(cleanedDotLeaderText)) {
    return {
      isHeading: true,
      category: 'appendix',
      level: 1,
      isFrontMatter: false,
      cleanTitle: cleanedDotLeaderText.length > 75 ? cleanedDotLeaderText.substring(0, 75) + '...' : cleanedDotLeaderText
    };
  }

  // 5. BIBLIOGRAPHY (Bibliografía, Referencias, Fuentes)
  const biblioRegex = /^(?:BIBLIOGRAFÍA|BIBLIOGRAFIA|REFERENCIAS(?:\s+BIBLIOGRÁFICAS|\s+BIBLIOGRAFICAS)?|FUENTES(?:\s+CONSULTADAS|\s+DE\s+INFORMACIÓN)?|WORKS\s+CITED|BIBLIOGRAPHY|REFERENCES)(?:\s*[:\-–—].*)?$/i;
  if (biblioRegex.test(cleanedDotLeaderText) || (text.length <= 50 && /(?:BIBLIOGRAFÍA|BIBLIOGRAFIA|REFERENCIAS\s+BIBLIOGRÁFICAS|REFERENCIAS\s+BIBLIOGRAFICAS|WORKS\s+CITED)/i.test(cleanedDotLeaderText))) {
    return {
      isHeading: true,
      category: 'bibliography',
      level: 1,
      isFrontMatter: false,
      cleanTitle: cleanedDotLeaderText.length > 75 ? cleanedDotLeaderText.substring(0, 75) + '...' : cleanedDotLeaderText
    };
  }

  // 6. SECTION (Numbered sections, Subcapítulos ej. 1.1, Introducción, Conclusiones)
  const numberedSectionRegex = /^(?:\d+\.|\d+\.\d+|\d+\.\d+\.\d+|[IVXLCDM]+\.)\s+([A-ZÁÉÍÓÚÑ].*)/;
  if (numberedSectionRegex.test(cleanedDotLeaderText)) {
    const isSub = /^\d+\.\d+/.test(cleanedDotLeaderText);
    return {
      isHeading: true,
      category: 'section',
      level: isSub ? 2 : 1,
      isFrontMatter: false,
      cleanTitle: cleanedDotLeaderText.length > 75 ? cleanedDotLeaderText.substring(0, 75) + '...' : cleanedDotLeaderText
    };
  }

  const mainSectionTitleRegex = /^(?:INTRODUCCIÓN|INTRODUCCION|RESUMEN|ABSTRACT|CONCLUSIÓN|CONCLUSIONES|METODOLOGÍA|METODOLOGIA|DISCUSIÓN|GLOSARIO)(?:\s*[:\-–—].*)?$/i;
  if (mainSectionTitleRegex.test(cleanedDotLeaderText)) {
    return {
      isHeading: true,
      category: 'section',
      level: 1,
      isFrontMatter: false,
      cleanTitle: cleanedDotLeaderText.length > 75 ? cleanedDotLeaderText.substring(0, 75) + '...' : cleanedDotLeaderText
    };
  }

  // 7. DETECCIÓN POR TAMAÑO DE LETRA DE PDF (Font Size Detection)
  if (isLargeFont) {
    return {
      isHeading: true,
      category: isVeryLargeFont ? 'chapter' : 'section',
      level: isVeryLargeFont ? 1 : 2,
      isFrontMatter: false,
      cleanTitle: cleanedDotLeaderText
    };
  }

  // 8. Líneas cortas en mayúsculas sin punto final (Típico título impreso)
  const shortTitleRegex = /^[A-ZÁÉÍÓÚÑ0-9\s\-:–—]{4,60}$/;
  if (shortTitleRegex.test(text) && !text.endsWith('.')) {
    return {
      isHeading: true,
      category: 'section',
      level: 1,
      isFrontMatter: false,
      cleanTitle: text
    };
  }

  return null;
}

/**
 * Módulo de Transformación & Sanitización Regex
 */
export function sanitizePdfText(rawText: string): string {
  if (!rawText) return '';

  let cleaned = rawText;

  // 1. Unir palabras cortadas por guiones al final de línea (ej. "transfor-\nmación" -> "transformación")
  cleaned = cleaned.replace(/([a-zA-ZáéíóúñÁÉÍÓÚÑ]+)-\s*[\r\n]+\s*([a-zA-ZáéíóúñÁÉÍÓÚÑ]+)/g, '$1$2');

  // 2. Normalizar múltiples espacios dentro de la misma línea
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

  // 3. Limpiar caracteres de control
  cleaned = cleaned.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return cleaned.trim();
}

/**
 * Divide un búfer de texto en oraciones reales comprobando que terminen con un punto, signo de interrogación o exclamación (. ? !)
 * y protegiendo abreviaturas y números decimales para que NO corten la oración por la mitad.
 */
export function splitBufferIntoTrueSentences(textBuffer: string): string[] {
  if (!textBuffer || textBuffer.trim().length === 0) return [];

  let protectedText = textBuffer;

  // Proteger abreviaturas conocidas (ej: "pág.", "dr.", "cap.", "vs.")
  COMMON_ABBREVIATIONS.forEach(abbr => {
    const abbrRegex = new RegExp(`\\b(${abbr})\\.` , 'gi');
    protectedText = protectedText.replace(abbrRegex, '$1___DOT___');
  });

  // Proteger números decimales (ej: "1.5", "2.0")
  protectedText = protectedText.replace(/\b(\d+)\.(\d+)\b/g, '$1___DOT___$2');

  // Dividir strictly en (. ! ?) que estén seguidos de un espacio o final del texto
  const rawSegments = protectedText.split(/(?<=[.!?])(?:\s+|$)/);

  const sentences: string[] = [];
  for (let segment of rawSegments) {
    // Restaurar los puntos protegidos
    segment = segment.replace(/___DOT___/g, '.').trim();
    
    // Filtrar si el segmento resultante resultó ser únicamente un número de página o pie de página
    if (segment.length > 0 && !isPageHeaderOrFooter(segment)) {
      sentences.push(segment);
    }
  }

  return sentences;
}

/**
 * Chunking Semántico: Agrupa las líneas de cuerpo, descarta pies/encabezados de página y números de página,
 * y divide únicamente cuando una oración termina en punto (.)
 */
export function chunkIntoSentences(sanitizedText: string, defaultPageNumber = 1): SentenceChunk[] {
  if (!sanitizedText || sanitizedText.trim().length === 0) return [];

  const rawLines = sanitizedText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const chunks: SentenceChunk[] = [];
  let currentIndex = 0;

  let bodyBuffer = '';

  const flushBodyBuffer = () => {
    if (bodyBuffer.trim().length > 0) {
      const sentences = splitBufferIntoTrueSentences(bodyBuffer);
      for (const sentence of sentences) {
        chunks.push({
          index: currentIndex,
          text: sentence,
          pageNumber: defaultPageNumber,
          characterLength: sentence.length
        });
        currentIndex++;
      }
      bodyBuffer = '';
    }
  };

  for (const line of rawLines) {
    // 1. Omitir inmediatamente si es pie de página, número de página o encabezado repetitivo
    if (isPageHeaderOrFooter(line)) {
      continue;
    }

    const heading = classifyHeadingText(line);

    if (heading) {
      // Si venía acumulando texto de párrafo anterior, vaciarlo
      flushBodyBuffer();

      // Guardar la línea de encabezado como una oración/sección independiente
      chunks.push({
        index: currentIndex,
        text: line,
        pageNumber: defaultPageNumber,
        characterLength: line.length
      });
      currentIndex++;
    } else {
      // Es texto de cuerpo
      if (bodyBuffer.length > 0) {
        bodyBuffer += ' ' + line;
      } else {
        bodyBuffer = line;
      }

      // Si la línea termina en un signo de puntuación de oraciones (. ? ! :), es seguro vaciar el búfer
      if (/[.!?:]\s*$/.test(line)) {
        flushBodyBuffer();
      }
    }
  }

  // Vaciar cualquier remanente final
  flushBodyBuffer();

  return chunks;
}

/**
 * Identifica títulos, subtítulos, capítulos, contenidos, apéndices y bibliografía en las oraciones extraídas
 */
export function extractHeadingsFromSentences(sentences: SentenceChunk[]): HeadingItem[] {
  if (!sentences || sentences.length === 0) return [];

  const headings: HeadingItem[] = [];

  sentences.forEach((chunk) => {
    const text = chunk.text.trim();
    const classified = classifyHeadingText(text);

    if (classified) {
      headings.push({
        id: `heading-${chunk.index}`,
        title: classified.cleanTitle,
        sentenceIndex: chunk.index,
        level: classified.level,
        pageNumber: chunk.pageNumber,
        isFrontMatter: classified.isFrontMatter,
        category: classified.category
      });
    }
  });

  return headings;
}

/**
 * Encuentra el índice de la siguiente sección/capítulo
 */
export function findNextHeadingSentenceIndex(currentIndex: number, headings: HeadingItem[]): number | null {
  if (!headings || headings.length === 0) return null;
  const nextHeading = headings.find(h => h.sentenceIndex > currentIndex);
  return nextHeading ? nextHeading.sentenceIndex : null;
}

/**
 * Encuentra el índice de la sección/capítulo anterior
 */
export function findPrevHeadingSentenceIndex(currentIndex: number, headings: HeadingItem[]): number | null {
  if (!headings || headings.length === 0) return null;
  const prevHeadings = headings.filter(h => h.sentenceIndex < currentIndex);
  if (prevHeadings.length === 0) return 0;
  return prevHeadings[prevHeadings.length - 1].sentenceIndex;
}

/**
 * Encuentra el índice del primer capítulo principal saltando agradecimientos, índice, etc.
 */
export function findFirstMainContentSentenceIndex(headings: HeadingItem[]): number {
  if (!headings || headings.length === 0) return 0;
  const mainHeading = headings.find(h => !h.isFrontMatter);
  return mainHeading ? mainHeading.sentenceIndex : 0;
}

/**
 * Encuentra el índice de la primera oración de una página específica
 */
export function findFirstSentenceIndexForPage(targetPage: number, sentences: SentenceChunk[]): number {
  if (!sentences || sentences.length === 0) return 0;
  const match = sentences.find(s => s.pageNumber >= targetPage);
  return match ? match.index : 0;
}

/**
 * Extrae texto de páginas utilizando pdfjs-dist con análisis de tamaño de fuente y filtrado de pie de página
 */
export async function extractTextFromPdfFile(file: File): Promise<PdfDocumentData> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    const version = pdfjsLib.version || '4.0.379';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const rawPageTexts: string[] = [];
    const allChunks: SentenceChunk[] = [];
    let globalSentenceIndex = 0;
    let fullSanitizedAcc = '';

    // Recolectar tamaños de fuente para calcular el promedio del cuerpo
    const fontSizes: number[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      for (const item of (textContent.items as any[])) {
        if (item.str && item.str.trim().length > 0) {
          const fontHeight = item.transform ? Math.abs(item.transform[0] || item.transform[3] || 10) : 10;
          if (fontHeight > 4 && fontHeight < 100) {
            fontSizes.push(fontHeight);
          }
        }
      }
    }

    // Calcular tamaño de letra promedio del cuerpo
    const avgFontSize = fontSizes.length > 0 
      ? fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length 
      : 10;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const textContent = await page.getTextContent();
      
      let pageText = '';
      let lastY: number | null = null;
      let bodyTextBuffer = '';

      const flushBuffer = () => {
        if (bodyTextBuffer.trim().length > 0) {
          const sentences = splitBufferIntoTrueSentences(bodyTextBuffer);
          for (const sText of sentences) {
            allChunks.push({
              index: globalSentenceIndex,
              text: sText,
              pageNumber: pageNum,
              characterLength: sText.length
            });
            globalSentenceIndex++;
          }
          bodyTextBuffer = '';
        }
      };

      for (const item of (textContent.items as any[])) {
        const str = (item.str || '').trim();
        if (!str) continue;

        const currentY = item.transform?.[5];
        const fontHeight = item.transform ? Math.abs(item.transform[0] || item.transform[3] || 10) : 10;
        
        // Comprobar si es número de página o pie/encabezado posicional
        if (isPageHeaderOrFooter(str, currentY, viewport.height)) {
          continue; // Omitir completamente
        }

        const isLineBreak = item.hasEOL || (lastY !== null && currentY !== undefined && Math.abs(currentY - lastY) > 6);

        if (isLineBreak) {
          pageText += '\n' + str;
        } else {
          pageText += (pageText.endsWith(' ') || pageText === '' ? '' : ' ') + str;
        }

        if (currentY !== undefined) {
          lastY = currentY;
        }

        // Evaluar si esta línea o ítem de texto es un Encabezado/Capítulo por Regex o Tamaño de Letra
        const headingCheck = classifyHeadingText(str, fontHeight, avgFontSize);

        if (headingCheck) {
          flushBuffer();
          allChunks.push({
            index: globalSentenceIndex,
            text: str,
            pageNumber: pageNum,
            characterLength: str.length
          });
          globalSentenceIndex++;
        } else {
          if (bodyTextBuffer.length > 0) {
            bodyTextBuffer += ' ' + str;
          } else {
            bodyTextBuffer = str;
          }

          if (/[.!?:]\s*$/.test(str)) {
            flushBuffer();
          }
        }
      }

      flushBuffer();

      rawPageTexts.push(pageText);
      const sanitizedPage = sanitizePdfText(pageText);
      fullSanitizedAcc += (fullSanitizedAcc ? '\n' : '') + sanitizedPage;
    }

    const headings = extractHeadingsFromSentences(allChunks);

    return {
      title: file.name,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      totalPages: pdf.numPages,
      rawPageTexts,
      sanitizedText: fullSanitizedAcc,
      sentences: allChunks,
      headings
    };
  } catch (error) {
    console.warn('Fallback to text reading for uploaded file:', error);
    const textContent = await file.text();
    const sanitized = sanitizePdfText(textContent);
    const sentences = chunkIntoSentences(sanitized, 1);
    const headings = extractHeadingsFromSentences(sentences);

    return {
      title: file.name,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      totalPages: 1,
      rawPageTexts: [textContent],
      sanitizedText: sanitized,
      sentences,
      headings
    };
  }
}
