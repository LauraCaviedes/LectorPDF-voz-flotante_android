import React from 'react';
import { ShieldCheck, Cpu, Layers, Activity, Smartphone, CheckCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl">
        <span className="text-xs font-bold text-teal-400 uppercase tracking-wider bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
          Documentación de Arquitectura Android
        </span>
        <h2 className="text-xl font-bold text-white mt-2">
          Diseño Stateless y Pipeline de Datos para "Lector PDF Flotante Neuronal"
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Especificación detallada de la arquitectura en memoria RAM, interceptación por IntentFilter, superposición por WindowManager y síntesis de voz neuronal.
        </p>
      </div>

      {/* Visual Pipeline Flowchart Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          Flujo de Datos y Pipeline de Ejecución (End-to-End)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          
          {/* Step 1 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                1. INTERCEPT
              </span>
              <Smartphone className="w-4 h-4 text-slate-500" />
            </div>
            <h4 className="font-bold text-sm text-slate-200">IntentFilter (PDF)</h4>
            <p className="text-xs text-slate-400 mt-1">
              <code>ACTION_VIEW</code> / <code>application/pdf</code> captura la apertura de archivos desde WhatsApp, Drive o explorador.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                2. TRANSFORM
              </span>
              <RefreshCw className="w-4 h-4 text-slate-500" />
            </div>
            <h4 className="font-bold text-sm text-slate-200">PdfDataPipeline</h4>
            <p className="text-xs text-slate-400 mt-1">
              Extract (PdfRenderer) → Sanitización Regex (une guiones) → Chunking Semántico (oraciones completas).
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                3. SERVICE
              </span>
              <Activity className="w-4 h-4 text-slate-500" />
            </div>
            <h4 className="font-bold text-sm text-slate-200">FloatingService</h4>
            <p className="text-xs text-slate-400 mt-1">
              ForegroundService mantiene el estado en RAM sin base de datos.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                4. CONSUME
              </span>
              <Zap className="w-4 h-4 text-slate-500" />
            </div>
            <h4 className="font-bold text-sm text-slate-200">TTS & Widget Overlay</h4>
            <p className="text-xs text-slate-400 mt-1">
              WindowManager superpone la pastilla flotante. Motor TTS emite <code>es-MX-JorgeNeural</code>.
            </p>
          </div>

        </div>
      </div>

      {/* Architectural Principles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Principle 1: Stateless & RAM Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base text-white">
              1. Gestión Stateless (Sin Room / SQLite)
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Para maximizar el rendimiento y garantizar la privacidad del usuario, la aplicación no almacena copias de los PDFs ni del texto procesado en disco.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
            <li>Toda la manipulación de estado ocurre estrictamente en la memoria RAM dentro del <code>FloatingControlService</code>.</li>
            <li>Al detener el servicio mediante el botón de cierre o el Interruptor Maestro, la memoria se libera automáticamente.</li>
            <li>Evita cuellos de botella de I/O en disco durante la lectura rápida de oraciones.</li>
          </ul>
        </div>

        {/* Principle 2: System Overlay & WindowManager */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-base text-white">
              2. WindowManager & SYSTEM_ALERT_WINDOW
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            El widget flotante se inyecta directamente sobre el gestor de ventanas del sistema Android.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
            <li>Utiliza <code>WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY</code> (Android 8.0+).</li>
            <li>Flag <code>FLAG_NOT_FOCUSABLE</code> permite interactuar con la app que está detrás mientras el widget se mantiene visible.</li>
            <li>Gestiona el arrastre touch con <code>MotionEvent.ACTION_MOVE</code> actualizando las coordenadas X/Y en tiempo real.</li>
          </ul>
        </div>

      </div>

    </div>
  );
};
