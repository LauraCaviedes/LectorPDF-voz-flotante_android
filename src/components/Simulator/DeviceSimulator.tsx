import React, { useRef } from 'react';
import { 
  FileText, Upload, Sliders, Volume2, ShieldCheck, Play, Pause, 
  RotateCcw, Sparkles, Smartphone, Share2, Layers, CheckCircle2, 
  AlertCircle, ArrowRight, Activity, Mic, Waves
} from 'lucide-react';
import { PdfDocumentData, FloatingWidgetState } from '../../types';

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
  onSimulateIntent,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto p-4 sm:p-6">
      
      {/* Left Column: Device Frame Simulation */}
      <div className="lg:col-span-7 flex flex-col items-center">
        
        <div className="text-center mb-4">
          <span className="text-xs font-semibold tracking-wider text-teal-400 uppercase bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800">
            Vista Previa de Interfaz Jetpack Compose
          </span>
          <p className="text-xs text-slate-400 mt-1">
            Prueba la app Android en tiempo real con reproductor de audio sintético
          </p>
        </div>

        {/* Smartphone Shell Frame */}
        <div className="w-full max-w-[390px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 relative overflow-hidden">
          
          {/* Dynamic Island / Speaker Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-800" />
          </div>

          {/* Device Screen Content Area */}
          <div className="w-full min-h-[680px] max-h-[720px] overflow-y-auto rounded-[34px] bg-[#F4F6F7] text-slate-800 font-sans relative flex flex-col pt-8 pb-6 select-none scrollbar-thin">
            
            {/* Android System Status Bar */}
            <div className="px-6 py-1 flex items-center justify-between text-[11px] font-semibold text-slate-600 bg-[#F4F6F7] sticky top-0 z-20">
              <span>{currentTime}</span>
              <div className="flex items-center gap-1.5">
                {widgetState.isServiceRunning && (
                  <span className="flex items-center gap-1 text-[10px] text-teal-700 font-bold bg-teal-100 px-1.5 py-0.5 rounded-md">
                    <Activity className="w-2.5 h-2.5 text-teal-600 animate-pulse" />
                    <span>Foreground</span>
                  </span>
                )}
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Android App TopBar */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-slate-200/80 bg-[#F4F6F7]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#5A7D7C] flex items-center justify-center text-white shadow-sm">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-[#1E293B] leading-tight">
                    Lector PDF Flotante
                  </h2>
                  <p className="text-[10px] text-[#78909C]">
                    Motor Neuronal • es-MX-JorgeNeural
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  widgetState.isServiceRunning
                    ? 'bg-teal-100 text-teal-800 border border-teal-300'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {widgetState.isServiceRunning ? 'SERVICIO ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            </div>

            {/* App Body Content */}
            <div className="p-4 space-y-4 flex-1">
              
              {/* HERO CARD CON INTERRUPTOR MAESTRO */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#1E293B]">
                      Interruptor Maestro
                    </h3>
                    <p className="text-[11px] text-[#78909C] mt-0.5">
                      {widgetState.isServiceRunning
                        ? 'Servicio flotante en primer plano activo'
                        : 'Servicio inactivo (Ahorro de Batería)'}
                    </p>
                  </div>

                  {/* Jetpack Compose Style Switch Toggle */}
                  <button
                    onClick={() => onToggleMasterSwitch(!widgetState.isServiceRunning)}
                    className={`w-12 h-6 rounded-full transition-colors p-0.5 relative flex items-center ${
                      widgetState.isServiceRunning ? 'bg-[#5A7D7C]' : 'bg-[#CFD8DC]'
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
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5 text-[#5A7D7C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-[#1E293B] truncate">
                      {currentPdf.title}
                    </h4>
                    <p className="text-[11px] text-[#78909C] mt-0.5">
                      {currentPdf.sentences.length > 0
                        ? `${currentPdf.sentences.length} oraciones semánticas • ${currentPdf.totalPages} pág(s)`
                        : 'Sin oraciones extraídas'}
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#5A7D7C] text-xs font-medium"
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

              {/* QUICK SETTINGS CARD */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-teal-600" />
                    Ajustes de Voz Neuronal
                  </h3>
                  <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">
                    Suave & Natural
                  </span>
                </div>

                {/* Voice Selection Dropdown */}
                <div>
                  <label className="text-[11px] font-medium text-[#78909C] flex items-center justify-between mb-1">
                    <span>Motor de Voz Detectado</span>
                    <span className="text-[10px] text-teal-600 font-semibold">
                      {availableVoices.length > 0 ? `${availableVoices.length} voces` : 'es-MX-JorgeNeural'}
                    </span>
                  </label>
                  <select
                    value={widgetState.voiceURI || ''}
                    onChange={(e) => onVoiceChange && onVoiceChange(e.target.value)}
                    className="w-full bg-[#F4F6F7] border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                <div className="flex items-center justify-between bg-teal-50/70 border border-teal-100 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Sintetizador Suave & Pausado</p>
                      <p className="text-[10px] text-slate-500">Cadencia fluida con pausas de puntuación</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleSmoothVoiceMode && onToggleSmoothVoiceMode(!widgetState.smoothVoiceMode)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                      widgetState.smoothVoiceMode ? 'bg-teal-600' : 'bg-slate-300'
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
                      <span className="text-[#78909C]">Velocidad</span>
                      <span className="font-bold text-[#5A7D7C]">
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
                      className="w-full accent-[#5A7D7C] bg-slate-200 rounded-lg h-1.5 cursor-pointer"
                    />
                  </div>

                  {/* Pitch / Warmth */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#78909C]">Tono Cálido</span>
                      <span className="font-bold text-[#5A7D7C]">
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
                      className="w-full accent-[#5A7D7C] bg-slate-200 rounded-lg h-1.5 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Inter-sentence Breath Pauses */}
                <div>
                  <span className="text-[11px] font-medium text-[#78909C] block mb-1">
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
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
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
              <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-teal-400 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" />
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
                  className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simular Interceptación de PDF</span>
                </button>
              </div>

              {/* ACTIVE SENTENCE LIST PREVIEW */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-xs text-[#1E293B]">
                    Línea de Oraciones ({currentPdf.sentences.length})
                  </h3>
                  {widgetState.isServiceRunning && (
                    <span className="text-[10px] text-[#5A7D7C] font-semibold">
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
                            ? 'bg-teal-50 border-teal-300 text-teal-900 font-medium shadow-sm'
                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-mono text-[#78909C]">
                            [{chunk.index}] Pág. {chunk.pageNumber}
                          </span>
                          {isActive && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700">
                              <Volume2 className="w-3 h-3 text-teal-600 animate-pulse" />
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
              <FileText className="w-4 h-4 text-teal-400" />
              Documentos PDF de Prueba
            </h3>
            <span className="text-[10px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded-full border border-teal-800">
              3 Muestras Lista
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
                      ? 'bg-teal-950/70 border-teal-500 text-white shadow-sm ring-1 ring-teal-500/30'
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
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
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
              className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Cargar PDF</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Card */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-slate-100 shadow-xl space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            Capacidades Técnicas Resaltadas
          </h3>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span><strong>Sin Persistencia DB:</strong> Cero uso de Room/SQLite. Toda la manipulación de estado ocurre estrictamente en memoria RAM.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span><strong>Fase Extract:</strong> Carga diferida (Lazy Loading) por páginas evitando saturación de memoria en PDFs extensos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span><strong>Fase Transform:</strong> Limpieza Regex de guiones cortados y unión fluida de párrafos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span><strong>Chunking Semántico:</strong> División estricta en oraciones completas delimitadas por signos de puntuación.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span><strong>Superposición Flotante:</strong> Permiso <code>SYSTEM_ALERT_WINDOW</code> con arrastre touch y controles instantáneos.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};
