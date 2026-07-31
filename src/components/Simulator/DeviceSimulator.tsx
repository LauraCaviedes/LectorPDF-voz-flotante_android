import React, { useRef } from 'react';
import { 
  FileText, Upload, Sliders, Volume2, ShieldCheck, Play, Pause, 
  RotateCcw, Sparkles, Smartphone, Share2, Layers, CheckCircle2, 
  AlertCircle, ArrowRight, Activity, Mic, Waves, BookOpen, FastForward,
  Bookmark, ChevronLeft, ChevronRight, Heart, Filter
} from 'lucide-react';
import { PdfDocumentData, FloatingWidgetState } from '../../types';
import { AppLogo } from '../AppLogo';

interface DeviceSimulatorProps {
  currentPdf: PdfDocumentData;
  widgetState: FloatingWidgetState;
  samplePdfs: PdfDocumentData[];
  availableVoices?: SpeechSynthesisVoice[];
  onSelectSamplePdf: (pdf: PdfDocumentData) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleMasterSwitch: (enabled: boolean) => void;
  onSpeedChange: (speed: number) => void;
  onPitchChange?: (pitch: number) => void;
  onToggleSmoothVoiceMode?: (enabled: boolean) => void;
  onPauseChange?: (ms: number) => void;
  onVoiceChange?: (voiceURI: string) => void;
  onPlayPause: () => void;
  onJumpToSentence: (index: number) => void;
  onJumpToPage?: (pageNumber: number) => void;
  onNextSection?: () => void;
  onPrevSection?: () => void;
  onSkipFrontMatter?: () => void;
  onSimulateIntent: () => void;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  currentPdf,
  widgetState,
  samplePdfs,
  availableVoices = [],
  onSelectSamplePdf,
  onFileUpload,
  onToggleMasterSwitch,
  onSpeedChange,
  onPitchChange,
  onToggleSmoothVoiceMode,
  onPauseChange,
  onVoiceChange,
  onPlayPause,
  onJumpToSentence,
  onJumpToPage,
  onNextSection,
  onPrevSection,
  onSkipFrontMatter,
  onSimulateIntent,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const headings = currentPdf.headings || [];
  const hasFrontMatter = headings.some(h => h.isFrontMatter);

  // Find currently active sentence chunk and page
  const currentSentence = currentPdf.sentences[widgetState.currentSentenceIndex];
  const currentPageNumber = currentSentence ? currentSentence.pageNumber : 1;

  const filteredHeadings = headings.filter(h => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'chapter') return h.category === 'chapter';
    if (categoryFilter === 'content') return h.category === 'content';
    if (categoryFilter === 'appendix') return h.category === 'appendix';
    if (categoryFilter === 'bibliography') return h.category === 'bibliography';
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto p-4 sm:p-6">
      
      {/* Left Column: Device Frame Simulation */}
      <div className="lg:col-span-7 flex flex-col items-center">
        
        <div className="text-center mb-4">
          <span className="text-xs font-semibold tracking-wider text-blue-300 uppercase bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800/80 flex items-center justify-center gap-1.5 w-fit mx-auto">
            <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
            <span>Vista Previa Jetpack Compose • Azul & Toque Femenino</span>
          </span>
          <p className="text-xs text-slate-400 mt-1.5">
            Prueba la app Android en tiempo real con reproductor de audio sintético y selector de página
          </p>
        </div>

        {/* Smartphone Shell Frame */}
        <div className="w-full max-w-[390px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-2 ring-blue-500/20 relative overflow-hidden">
          
          {/* Dynamic Island / Speaker Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-800" />
          </div>

          {/* Device Screen Content Area - Soft Sky Blue & Rose Theme */}
          <div className="w-full min-h-[680px] max-h-[730px] overflow-y-auto rounded-[34px] bg-[#F0F5FF] text-slate-800 font-sans relative flex flex-col pt-8 pb-6 select-none scrollbar-thin">
            
            {/* Android System Status Bar */}
            <div className="px-6 py-1 flex items-center justify-between text-[11px] font-semibold text-slate-600 bg-[#F0F5FF] sticky top-0 z-20">
              <span>{currentTime}</span>
              <div className="flex items-center gap-1.5">
                {widgetState.isServiceRunning && (
                  <span className="flex items-center gap-1 text-[10px] text-blue-800 font-bold bg-blue-100 px-1.5 py-0.5 rounded-md border border-blue-200">
                    <Activity className="w-2.5 h-2.5 text-blue-600 animate-pulse" />
                    <span>Foreground</span>
                  </span>
                )}
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Android App TopBar */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-blue-100 bg-white/90 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 p-0.5 flex items-center justify-center shadow-xs">
                  <AppLogo size={32} />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-900 leading-tight flex items-center gap-1">
                    <span>Lector PDF Flotante</span>
                    <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                  </h2>
                  <p className="text-[10px] text-blue-600 font-medium">
                    Motor Neuronal • es-MX-JorgeNeural
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  widgetState.isServiceRunning
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {widgetState.isServiceRunning ? 'SERVICIO ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            </div>

            {/* App Body Content */}
            <div className="p-4 space-y-4 flex-1">
              
              {/* HERO CARD CON INTERRUPTOR MAESTRO */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Interruptor Maestro
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {widgetState.isServiceRunning
                        ? 'Servicio flotante en primer plano activo'
                        : 'Servicio inactivo (Ahorro de Batería)'}
                    </p>
                  </div>

                  {/* Jetpack Compose Style Switch Toggle */}
                  <button
                    onClick={() => onToggleMasterSwitch(!widgetState.isServiceRunning)}
                    className={`w-12 h-6 rounded-full transition-colors p-0.5 relative flex items-center ${
                      widgetState.isServiceRunning ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      widgetState.isServiceRunning ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="my-3 border-t border-slate-100" />

                {/* PDF Document Status Row */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-slate-900 truncate">
                      {currentPdf.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {currentPdf.sentences.length > 0
                        ? `${currentPdf.sentences.length} oraciones • ${currentPdf.totalPages} pág(s)`
                        : 'Sin oraciones extraídas'}
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200 transition-colors"
                    title="Cargar otro PDF"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,text/plain"
                    onChange={onFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* SELECTOR DE PÁGINA (ESCOGER DESDE QUÉ PÁGINA EMPEZAR) */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-3.5 shadow-md border border-blue-400">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-pink-300" />
                    <span>Selector de Página de Inicio</span>
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-bold">
                    Pág. {currentPageNumber} de {currentPdf.totalPages}
                  </span>
                </div>

                <p className="text-[11px] text-blue-100 mb-2.5 leading-tight">
                  Escoge desde qué página deseas comenzar la lectura en voz alta:
                </p>

                <div className="flex items-center gap-2">
                  {/* Prev Page Button */}
                  <button
                    onClick={() => onJumpToPage && onJumpToPage(Math.max(1, currentPageNumber - 1))}
                    disabled={currentPageNumber <= 1}
                    className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-40 text-white font-bold text-xs transition-colors"
                    title="Página Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Select Dropdown */}
                  <select
                    value={currentPageNumber}
                    onChange={(e) => onJumpToPage && onJumpToPage(parseInt(e.target.value, 10))}
                    className="flex-1 bg-white text-slate-900 border border-blue-200 rounded-xl px-3 py-1.5 text-xs font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    {Array.from({ length: currentPdf.totalPages }, (_, i) => i + 1).map((pNum) => (
                      <option key={pNum} value={pNum}>
                        📖 Empezar en Página {pNum} {pNum === currentPageNumber ? '(Actual)' : ''}
                      </option>
                    ))}
                  </select>

                  {/* Next Page Button */}
                  <button
                    onClick={() => onJumpToPage && onJumpToPage(Math.min(currentPdf.totalPages, currentPageNumber + 1))}
                    disabled={currentPageNumber >= currentPdf.totalPages}
                    className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-40 text-white font-bold text-xs transition-colors"
                    title="Página Siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* BADGE DE OMISIÓN DE ENCABEZADOS Y PIES DE PÁGINA */}
              <div className="bg-pink-50/90 border border-pink-200 rounded-2xl p-3 flex items-center justify-between text-xs text-pink-900">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center shrink-0 border border-pink-300">
                    <Filter className="w-3.5 h-3.5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-bold text-[11px] leading-tight text-pink-900">
                      Filtro de Pie de Página & Encabezados
                    </p>
                    <p className="text-[10px] text-pink-700 mt-0.5">
                      ✓ Se omiten automáticamente números de página, notas al pie y avisos
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-pink-200 text-pink-900 font-bold px-2 py-0.5 rounded-full border border-pink-300 shrink-0">
                  ACTIVO
                </span>
              </div>

              {/* QUICK SETTINGS CARD */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    Ajustes de Voz Neuronal
                  </h3>
                  <span className="text-[10px] bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-full font-semibold">
                    Suave & Femenino
                  </span>
                </div>

                {/* Voice Selection Dropdown */}
                <div>
                  <label className="text-[11px] font-medium text-slate-500 flex items-center justify-between mb-1">
                    <span>Motor de Voz Detectado</span>
                    <span className="text-[10px] text-blue-600 font-semibold">
                      {availableVoices.length > 0 ? `${availableVoices.length} voces` : 'es-MX-JorgeNeural'}
                    </span>
                  </label>
                  <select
                    value={widgetState.voiceURI || ''}
                    onChange={(e) => onVoiceChange && onVoiceChange(e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {availableVoices.length > 0 ? (
                      availableVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))
                    ) : (
                      <option value="">es-MX-JorgeNeural (Español México)</option>
                    )}
                  </select>
                </div>

                {/* Smooth Mode Toggle */}
                <div className="flex items-center justify-between bg-blue-50/70 border border-blue-100 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Sintetizador Suave & Pausado</p>
                      <p className="text-[10px] text-slate-500">Cadencia fluida con pausas de puntuación</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleSmoothVoiceMode && onToggleSmoothVoiceMode(!widgetState.smoothVoiceMode)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                      widgetState.smoothVoiceMode ? 'bg-pink-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition duration-200 ease-in-out translate-y-0.5 ${
                        widgetState.smoothVoiceMode ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Speed and Pitch Sliders */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Speed */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Velocidad</span>
                      <span className="font-bold text-blue-600">
                        {widgetState.readingSpeed.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.05"
                      value={widgetState.readingSpeed}
                      onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                      className="w-full accent-blue-600 bg-slate-200 rounded-lg h-1.5 cursor-pointer"
                    />
                  </div>

                  {/* Pitch / Warmth */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Tono Cálido</span>
                      <span className="font-bold text-pink-600">
                        {widgetState.pitch.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.75"
                      max="1.25"
                      step="0.05"
                      value={widgetState.pitch}
                      onChange={(e) => onPitchChange && onPitchChange(parseFloat(e.target.value))}
                      className="w-full accent-pink-500 bg-slate-200 rounded-lg h-1.5 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Inter-sentence Breath Pauses */}
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">
                    Pausas de Respiración entre Oraciones
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Sin pausa', value: 0 },
                      { label: 'Natural (300ms)', value: 300 },
                      { label: 'Pausado (500ms)', value: 500 },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => onPauseChange && onPauseChange(opt.value)}
                        className={`py-1 text-[10px] font-semibold rounded-lg border transition-all ${
                          widgetState.interSentencePause === opt.value
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* INTERACTION TESTER / INTENT FILTER INTERCEPTOR */}
              <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-sm border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-pink-400" />
                    IntentFilter Interceptor
                  </span>
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                    ACTION_VIEW
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mb-2.5 leading-tight">
                  Simula abrir un archivo PDF desde WhatsApp o el Administrador de Archivos para iniciar la lectura instantánea.
                </p>
                <button
                  onClick={onSimulateIntent}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                  <span>Simular Interceptación de PDF</span>
                </button>
              </div>

              {/* HEADINGS & SECTIONS DETECTED INDEX */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    Estructura e Índice ({headings.length})
                  </h3>
                  <div className="flex items-center gap-1">
                    {onPrevSection && (
                      <button
                        onClick={onPrevSection}
                        className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md border border-slate-300 transition-colors"
                        title="Sección Anterior"
                      >
                        ⏮️ Ant
                      </button>
                    )}
                    {onNextSection && (
                      <button
                        onClick={onNextSection}
                        className="px-2 py-0.5 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold rounded-md border border-blue-300 transition-colors"
                        title="Siguiente Sección"
                      >
                        Sig ⏭️
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filters Pills */}
                {headings.length > 0 && (
                  <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 text-[10px] border-b border-slate-100">
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'content', label: '📑 Contenido' },
                      { id: 'chapter', label: '📖 Capítulos' },
                      { id: 'appendix', label: '📎 Apéndices' },
                      { id: 'bibliography', label: '📚 Bibliografía' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setCategoryFilter(f.id)}
                        className={`px-2 py-0.5 rounded-full whitespace-nowrap font-medium transition-all ${
                          categoryFilter === f.id
                            ? 'bg-blue-600 text-white shadow-2xs font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}

                {hasFrontMatter && onSkipFrontMatter && (
                  <button
                    onClick={onSkipFrontMatter}
                    className="w-full mb-2.5 py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-colors shadow-2xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <FastForward className="w-3.5 h-3.5 text-amber-700" />
                      <span>Saltar Portada / Agradecimientos / Índice</span>
                    </span>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-mono">⚡ Ir a Cap 1</span>
                  </button>
                )}

                {filteredHeadings.length > 0 ? (
                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {filteredHeadings.map((h) => {
                      const isActive = widgetState.currentSentenceIndex >= h.sentenceIndex && 
                        (!headings.find(nextH => nextH.sentenceIndex > h.sentenceIndex) || 
                         widgetState.currentSentenceIndex < (headings.find(nextH => nextH.sentenceIndex > h.sentenceIndex)?.sentenceIndex || Infinity));

                      const getBadgeStyle = (category?: string, isFrontMatter?: boolean) => {
                        switch (category) {
                          case 'content':
                            return { label: '📑 CONTENIDO', style: 'bg-amber-100 text-amber-900 border-amber-300' };
                          case 'frontmatter':
                            return { label: 'ℹ️ EDITORIAL', style: 'bg-slate-100 text-slate-700 border-slate-300' };
                          case 'chapter':
                            return { label: '📖 CAPÍTULO', style: 'bg-blue-100 text-blue-900 border-blue-300' };
                          case 'appendix':
                            return { label: '📎 APÉNDICE', style: 'bg-purple-100 text-purple-900 border-purple-300' };
                          case 'bibliography':
                            return { label: '📚 BIBLIOGRAFÍA', style: 'bg-rose-100 text-rose-900 border-rose-300' };
                          default:
                            return isFrontMatter 
                              ? { label: 'ℹ️ EDITORIAL', style: 'bg-slate-100 text-slate-700 border-slate-300' }
                              : { label: '📌 SECCIÓN', style: 'bg-sky-100 text-sky-900 border-sky-300' };
                        }
                      };

                      const badge = getBadgeStyle(h.category, h.isFrontMatter);

                      return (
                        <div
                          key={h.id}
                          onClick={() => onJumpToSentence(h.sentenceIndex)}
                          className={`p-2 rounded-xl text-xs cursor-pointer transition-all border flex items-center justify-between ${
                            isActive
                              ? 'bg-blue-50 border-blue-400 text-blue-950 font-semibold shadow-2xs ring-1 ring-blue-400/50'
                              : h.isFrontMatter
                              ? 'bg-slate-50 border-slate-200 text-slate-600 italic hover:bg-slate-100'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold shrink-0 ${badge.style}`}>
                              {badge.label}
                            </span>
                            <span className="truncate leading-tight font-medium">{h.title}</span>
                          </div>

                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            Pág. {h.pageNumber} (Oración #{h.sentenceIndex + 1})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200 text-center">
                    {categoryFilter === 'all'
                      ? 'No se detectaron encabezados explícitos en este fragmento. Se continuará en lectura continua por oraciones.'
                      : 'No se encontraron elementos con el filtro seleccionado.'}
                  </p>
                )}
              </div>

              {/* ACTIVE SENTENCE LIST PREVIEW */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-xs text-slate-800">
                    Línea de Oraciones ({currentPdf.sentences.length})
                  </h3>
                  {widgetState.isServiceRunning && (
                    <span className="text-[10px] text-blue-600 font-semibold">
                      Oración actual: #{widgetState.currentSentenceIndex + 1}
                    </span>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {currentPdf.sentences.map((chunk) => {
                    const isActive = widgetState.isServiceRunning && widgetState.currentSentenceIndex === chunk.index;
                    return (
                      <div
                        key={chunk.index}
                        onClick={() => onJumpToSentence(chunk.index)}
                        className={`p-2 rounded-xl text-xs cursor-pointer transition-all border ${
                          isActive
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-medium shadow-sm'
                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-mono text-slate-500">
                            [{chunk.index}] Pág. {chunk.pageNumber}
                          </span>
                          {isActive && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700">
                              <Volume2 className="w-3 h-3 text-pink-500 animate-pulse" />
                              Reproduciendo
                            </span>
                          )}
                        </div>
                        <p className="line-clamp-2 leading-relaxed">
                          {chunk.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Android Navigation Bar */}
            <div className="h-5 flex items-center justify-center pt-2">
              <div className="w-28 h-1 bg-slate-400/60 rounded-full" />
            </div>

          </div>
        </div>
      </div>

      {/* Right Column: Controls & Document Samples Selector */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Quick Document Picker */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-slate-100 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Documentos PDF de Prueba
            </h3>
            <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full border border-blue-800">
              3 Muestras
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Selecciona un documento con saltos de línea basura y guiones cortados para ver la sanitización Regex en acción:
          </p>

          <div className="space-y-2.5">
            {samplePdfs.map((pdf, idx) => {
              const isSelected = currentPdf.title === pdf.title;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectSamplePdf(pdf)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-950/80 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/40'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-semibold text-xs truncate text-slate-200">
                      {pdf.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {pdf.fileSize} • {pdf.totalPages} páginas • {pdf.sentences.length} oraciones
                    </p>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>O sube tu propio archivo PDF:</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Cargar PDF</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Card */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-slate-100 shadow-xl space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-pink-400" />
            Capacidades Técnicas Resaltadas
          </h3>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 shrink-0" />
              <span><strong>Filtrado Total de Pies de Página:</strong> Exclusión estricta de números de página, avisos de copyright y notas al pie para evitar lecturas indeseadas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              <span><strong>Selector de Página de Inicio:</strong> Permite elegir cualquier página ($1..N$) para saltar y reproducir inmediatamente desde su inicio.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 shrink-0" />
              <span><strong>Sin Persistencia DB:</strong> Cero uso de Room/SQLite. Toda la manipulación de estado ocurre estrictamente en memoria RAM.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              <span><strong>Fase Transform & Regex:</strong> Limpieza de guiones cortados y unión fluida de oraciones semánticas.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};
