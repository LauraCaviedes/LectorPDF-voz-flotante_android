import React from 'react';
import { Code, Smartphone, Layers, ShieldCheck, Download } from 'lucide-react';
import { AppLogo } from './AppLogo';

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
          
          {/* App Branding Logo with Green Ring + Magenta Heart */}
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-2xl bg-white/10 border border-white/20 shadow-sm flex items-center justify-center">
              <AppLogo size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  <span>Lector PDF Flotante</span>
                  <span className="text-pink-400 text-xs">♥</span>
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  Android Jetpack Compose
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Pipeline Extract-Transform-Consume • Motor Voz <code className="text-sky-300 font-mono text-[11px]">es-MX-JorgeNeural</code>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-pink-300" />
              <span>Simulador App</span>
              {isServiceActive && (
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-blue-600 text-white shadow-sm'
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
                  ? 'bg-blue-600 text-white shadow-sm'
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
                  ? 'bg-blue-600 text-white shadow-sm'
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
              className="flex items-center gap-2 bg-blue-900/80 hover:bg-blue-800 text-blue-100 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-700 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-pink-300" />
              <span className="hidden sm:inline">Exportar Proyecto Android (.ZIP)</span>
              <span className="sm:hidden">ZIP</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800 px-2 py-2 text-xs">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-1 px-3 py-1 rounded-md ${
            activeTab === 'simulator' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-pink-300" />
          <span>Simulador</span>
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-1 px-3 py-1 rounded-md ${
            activeTab === 'pipeline' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Pipeline</span>
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1 px-3 py-1 rounded-md ${
            activeTab === 'code' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Código</span>
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-1 px-3 py-1 rounded-md ${
            activeTab === 'architecture' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Arq</span>
        </button>
      </div>
    </header>
  );
};
