import React, { useState } from 'react';
import { ANDROID_CODE_FILES } from '../../data/androidCode';
import { CodeFile } from '../../types';
import { Code, Copy, Check, Download, Search, FileCode, FileSpreadsheet, ShieldAlert } from 'lucide-react';

interface CodeViewerProps {
  onDownloadZip: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ onDownloadZip }) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(ANDROID_CODE_FILES[0].id);
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentFile = ANDROID_CODE_FILES.find(f => f.id === selectedFileId) || ANDROID_CODE_FILES[0];

  const handleCopyCode = (file: CodeFile) => {
    navigator.clipboard.writeText(file.content);
    setCopiedFileId(file.id);
    setTimeout(() => setCopiedFileId(null), 2000);
  };

  const filteredLines = currentFile.content.split('\n').filter(line => 
    searchQuery === '' || line.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
            Código Fuente Completo Kotlin & Jetpack Compose
          </span>
          <h2 className="text-xl font-bold text-white mt-2">
            Entregables Solicitados para Android
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Arquitectura Stateless, Pipeline de Datos, Servicio Flotante e Interfaz Jetpack Compose sin persistencia DB.
          </p>
        </div>

        <button
          onClick={onDownloadZip}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Descargar Proyecto .zip Completo</span>
        </button>
      </div>

      {/* File Tabs & Main Viewer Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: File Selector Tabs */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-100 shadow-xl space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Archivos del Proyecto
          </h3>

          <div className="space-y-1.5">
            {ANDROID_CODE_FILES.map((file) => {
              const isSelected = file.id === selectedFileId;
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-teal-950/80 border-teal-500 text-white shadow-sm ring-1 ring-teal-500/30'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs font-mono text-teal-300 truncate">
                      {file.name}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {file.language}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {file.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Editor View */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          
          {/* Editor Action Bar */}
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-teal-400" />
              <span className="font-mono text-xs font-bold text-slate-200">
                {currentFile.path}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Filter / Search Bar */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar en código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-teal-500 w-full sm:w-40"
                />
              </div>

              {/* Copy Code Button */}
              <button
                onClick={() => handleCopyCode(currentFile)}
                className="flex items-center gap-1.5 text-xs text-teal-300 bg-teal-950 border border-teal-800 px-3 py-1.5 rounded-lg hover:bg-teal-900 transition-colors shrink-0 font-medium"
              >
                {copiedFileId === currentFile.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-teal-400" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Viewer Body with Line Numbers */}
          <div className="p-4 bg-[#0d1117] font-mono text-xs overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin text-slate-200">
            <pre className="leading-relaxed">
              <code>
                {currentFile.content.split('\n').map((line, idx) => {
                  const lineNumber = idx + 1;
                  const matchesSearch = searchQuery !== '' && line.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  return (
                    <div
                      key={idx}
                      className={`table-row ${matchesSearch ? 'bg-teal-950/80 text-teal-200' : 'hover:bg-slate-800/40'}`}
                    >
                      <span className="table-cell pr-4 text-right select-none text-slate-600 text-[11px] w-10 border-r border-slate-800/80 mr-3">
                        {lineNumber}
                      </span>
                      <span className="table-cell pl-3 whitespace-pre">
                        {line}
                      </span>
                    </div>
                  );
                })}
              </code>
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
