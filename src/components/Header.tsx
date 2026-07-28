import React from 'react';
import { Play, Code, Cpu, Smartphone, Layers, ShieldCheck, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: 'simulator' | 'pipeline' | 'code' | 'architecture';
  setActiveTab: (tab: 'simulator' | 'pipeline' | 'code' | 'architecture') => void;
  isServiceActive: boolean;
  onDownloadZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isServiceActive,
  onDownloadZip,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Personal Brand / App Branding Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/90 flex items-center justify-center text-white shadow-sm ring-1 ring-teal-400/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white">
                  Lector PDF Flotante Neuronal
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                  Android Jetpack Compose
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Pipeline Extract-Transform-Consume • Motor Voz <code className="text-teal-300 font-mono text-[11px]">es-MX-JorgeNeural</code>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Simulador App</span>
              {isServiceActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pipeline Regex & Chunks</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Código Fuente Kotlin</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Arquitectura</span>
            </button>
          </nav>

          {/* Action Button: Download Full Android Project ZIP */}
          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadZip}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition-colors shadow-sm"
              title="Descargar código fuente en archivo .zip"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Exportar Proyecto .zip</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800 gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md ${
              activeTab === 'simulator' ? 'bg-teal-600 text-white' : 'text-slate-400'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Simulador</span>
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md ${
              activeTab === 'pipeline' ? 'bg-teal-600 text-white' : 'text-slate-400'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Pipeline</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md ${
              activeTab === 'code' ? 'bg-teal-600 text-white' : 'text-slate-400'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>Código</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md ${
              activeTab === 'architecture' ? 'bg-teal-600 text-white' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Docs</span>
          </button>
        </div>

      </div>
    </header>
  );
};
