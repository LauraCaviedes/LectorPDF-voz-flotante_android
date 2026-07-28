import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, GripHorizontal, Volume2 } from 'lucide-react';
import { FloatingWidgetState } from '../../types';

interface FloatingWidgetOverlayProps {
  state: FloatingWidgetState;
  totalSentences: number;
  currentSentenceText?: string;
  onPlayPause: () => void;
  onNextSentence: () => void;
  onPrevSentence: () => void;
  onStopService: () => void;
  onPositionChange: (pos: { x: number; y: number }) => void;
}

export const FloatingWidgetOverlay: React.FC<FloatingWidgetOverlayProps> = ({
  state,
  totalSentences,
  currentSentenceText,
  onPlayPause,
  onNextSentence,
  onPrevSentence,
  onStopService,
  onPositionChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialWidgetPos = useRef({ x: state.position.x, y: state.position.y });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialWidgetPos.current = { ...state.position };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      
      const newX = Math.max(10, Math.min(window.innerWidth - 320, initialWidgetPos.current.x + dx));
      const newY = Math.max(70, Math.min(window.innerHeight - 100, initialWidgetPos.current.y + dy));

      onPositionChange({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onPositionChange]);

  if (!state.isVisible || !state.isServiceRunning) {
    return null;
  }

  const currentNum = totalSentences > 0 ? state.currentSentenceIndex + 1 : 0;

  return (
    <div
      style={{
        left: `${state.position.x}px`,
        top: `${state.position.y}px`,
      }}
      className="fixed z-50 select-none animate-in fade-in duration-200"
    >
      {/* Horizontal Pill Container matching Cool Gray & Sage Teal palette */}
      <div 
        className={`flex items-center gap-1.5 p-2 rounded-full shadow-2xl backdrop-blur-md border border-slate-300/80 transition-shadow ${
          isDragging ? 'shadow-teal-500/20 ring-2 ring-teal-500/50 cursor-grabbing' : 'shadow-slate-900/30'
        }`}
        style={{
          backgroundColor: 'rgba(207, 216, 220, 0.92)', // Cool Gray #CFD8DC with 92% opacity
        }}
      >
        {/* Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="cursor-grab hover:bg-slate-300/50 p-1.5 rounded-full text-slate-600 transition-colors flex items-center justify-center"
          title="Arrastrar widget flotante (SYSTEM_ALERT_WINDOW)"
        >
          <GripHorizontal className="w-4 h-4 text-slate-600" />
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-700 shadow-inner border border-slate-200">
          <Volume2 className={`w-3 h-3 ${state.isPlaying ? 'text-teal-600 animate-pulse' : 'text-slate-400'}`} />
          <span>{currentNum}/{totalSentences}</span>
        </div>

        <div className="h-4 w-px bg-slate-300/80 my-auto" />

        {/* Prev Sentence Button */}
        <button
          onClick={onPrevSentence}
          disabled={state.currentSentenceIndex <= 0}
          className="p-1.5 rounded-full hover:bg-white/60 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent text-slate-700 transition-all"
          title="Oración anterior (index - 1)"
        >
          <SkipBack className="w-4 h-4 fill-slate-700" />
        </button>

        {/* Play/Pause Main FAB Button */}
        <button
          onClick={onPlayPause}
          className="p-2.5 rounded-full text-white shadow-md active:scale-95 transition-transform flex items-center justify-center"
          style={{ backgroundColor: '#5A7D7C' }} // Sage Teal #5A7D7C
          title={state.isPlaying ? 'Pausar lectura' : 'Reanudar lectura neuronal'}
        >
          {state.isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white ml-0.5" />
          )}
        </button>

        {/* Next Sentence Button */}
        <button
          onClick={onNextSentence}
          disabled={state.currentSentenceIndex >= totalSentences - 1}
          className="p-1.5 rounded-full hover:bg-white/60 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent text-slate-700 transition-all"
          title="Siguiente oración (index + 1)"
        >
          <SkipForward className="w-4 h-4 fill-slate-700" />
        </button>

        <div className="h-4 w-px bg-slate-300/80 my-auto" />

        {/* Stop / Close Button */}
        <button
          onClick={onStopService}
          className="p-1.5 rounded-full hover:bg-red-200/80 text-slate-600 hover:text-red-700 transition-colors"
          title="Cerrar widget y destruir servicio en primer plano"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Active Sentence Speech Bubble (Mini Tooltip) */}
      {state.isPlaying && currentSentenceText && (
        <div className="mt-2 max-w-xs bg-slate-900/90 text-white text-xs p-2.5 rounded-xl shadow-lg border border-slate-700 backdrop-blur-md animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-1.5 mb-1 text-[10px] text-teal-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            <span>Sintetizando Oración [{state.currentSentenceIndex + 1}]:</span>
          </div>
          <p className="line-clamp-2 text-slate-200 leading-snug font-sans">
            "{currentSentenceText}"
          </p>
        </div>
      )}
    </div>
  );
};
