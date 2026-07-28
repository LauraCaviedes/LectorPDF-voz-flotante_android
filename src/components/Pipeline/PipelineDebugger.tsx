import React, { useState } from 'react';
import { Layers, FileText, Sparkles, Check, ArrowRight, Copy, Terminal, ListOrdered } from 'lucide-react';
import { PdfDocumentData } from '../../types';

interface PipelineDebuggerProps {
  currentPdf: PdfDocumentData;
  activeSentenceIndex: number;
}

export const PipelineDebugger: React.FC<PipelineDebuggerProps> = ({
  currentPdf,
  activeSentenceIndex,
}) => {
  const [activeStage, setActiveStage] = useState<'EXTRACT' | 'TRANSFORM' | 'CHUNK'>('TRANSFORM');
  const [copied, setCopied] = useState(false);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
              Pipeline de Procesamiento de Datos
            </span>
            <h2 className="text-xl font-bold text-white mt-2">
              Extract • Transform (Regex) • Chunking Semántico
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Visualizador en tiempo real de la transformación del PDF cargado: <strong className="text-teal-300">{currentPdf.title}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveStage('EXTRACT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeStage === 'EXTRACT' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Extract (Bruto)
            </button>
            <button
              onClick={() => setActiveStage('TRANSFORM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeStage === 'TRANSFORM' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Transform (Regex)
            </button>
            <button
              onClick={() => setActiveStage('CHUNK')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeStage === 'CHUNK' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Chunking Semántico
            </button>
          </div>
        </div>
      </div>

      {/* Stage Visualizers */}
      {activeStage === 'EXTRACT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">
                Fase 1: Extracción Bruta de Páginas (Extract)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {currentPdf.rawPageTexts.length} páginas cargadas en diferido
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Muestra el texto bruto directo extraído por página sin procesar. Note los saltos de línea basura y palabras cortadas por guiones al final del margen:
          </p>

          <div className="space-y-4">
            {currentPdf.rawPageTexts.map((pageText, idx) => (
              <div key={idx} className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-amber-200/90 whitespace-pre-wrap leading-relaxed">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 border-b border-slate-800 pb-1">
                  <span>PÁGINA {idx + 1} DE {currentPdf.rawPageTexts.length}</span>
                  <span>{pageText.length} caracteres</span>
                </div>
                {pageText}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeStage === 'TRANSFORM' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold text-base text-white">
                Fase 2: Sanitización y Limpieza Regex (Transform)
              </h3>
            </div>
            <button
              onClick={() => handleCopyText(currentPdf.sanitizedText)}
              className="flex items-center gap-1.5 text-xs text-teal-400 bg-teal-950 border border-teal-800 px-3 py-1 rounded-lg hover:bg-teal-900 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto Sanitizado'}</span>
            </button>
          </div>

          {/* Regex Rules Explanation Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <h4 className="font-bold text-teal-300 mb-1 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-teal-400" />
                Regla 1: Guiones Cortados al Final de Línea
              </h4>
              <code className="text-[11px] font-mono text-slate-400 block bg-slate-900 p-2 rounded-lg my-2 border border-slate-800">
                r"([a-zA-ZáéíóúñÁÉÍÓÚÑ]+)-\s*[\r\n]+\s*([a-zA-ZáéíóúñÁÉÍÓÚÑ]+)" → "$1$2"
              </code>
              <p className="text-slate-300">
                Detecta palabras como <span className="text-red-400 underline">transfor- \n mación</span> y las une en <span className="text-emerald-400 font-semibold">transformación</span> para evitar pausas indeseadas en el sintetizador neuronal.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <h4 className="font-bold text-teal-300 mb-1 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-teal-400" />
                Regla 2: Saltos de Línea Basura
              </h4>
              <code className="text-[11px] font-mono text-slate-400 block bg-slate-900 p-2 rounded-lg my-2 border border-slate-800">
                r"(?&lt;![.!?;]);\s*[\r\n]+\s*(?![.!?;])" → " "
              </code>
              <p className="text-slate-300">
                Elimina retornos de carro a mitad de oración, uniendo el texto de forma natural respetando solo saltos reales de fin de párrafo.
              </p>
            </div>
          </div>

          {/* Output Comparison */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed max-h-96 overflow-y-auto">
            <div className="text-[11px] text-teal-400 font-bold mb-2 pb-1 border-b border-slate-800 uppercase tracking-wider">
              Resultado Completo Sanitizado (Texto continuo sin guiones ni rupturas)
            </div>
            {currentPdf.sanitizedText}
          </div>
        </div>
      )}

      {activeStage === 'CHUNK' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-base text-white">
                Fase 3: Chunking Semántico (Consume)
              </h3>
            </div>
            <span className="text-xs font-mono text-teal-300 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
              {currentPdf.sentences.length} oraciones indexadas [0..{currentPdf.sentences.length - 1}]
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Arreglo delimitado estrictamente por oraciones completas (puntos, signos de interrogación y exclamación). Esta es la estructura consumida directamente por el servicio <code>FloatingControlService</code>:
          </p>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {currentPdf.sentences.map((chunk) => {
              const isActive = activeSentenceIndex === chunk.index;
              return (
                <div
                  key={chunk.index}
                  className={`p-3.5 rounded-xl border transition-all text-xs font-sans ${
                    isActive
                      ? 'bg-teal-950 border-teal-500 text-white ring-1 ring-teal-500/50 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[11px] font-mono text-slate-400">
                    <span className="font-bold text-teal-400">
                      Index [{chunk.index}]
                    </span>
                    <span>Página {chunk.pageNumber} • {chunk.characterLength} caracteres</span>
                  </div>
                  <p className="text-slate-100 text-sm leading-relaxed">
                    "{chunk.text}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
