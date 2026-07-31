import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, GripHorizontal, Volume2, BookOpen, FastForward, Heart, Bookmark } from 'lucide-react';
import { FloatingWidgetState } from '../../types';
import { AppLogo } from '../AppLogo';

interface FloatingWidgetOverlayProps {
  state: FloatingWidgetState;
  totalSentences: number;
  totalPages?: number;
  currentPageNumber?: number;
  currentSentenceText?: string;
  currentHeadingTitle?: string;
  hasFrontMatter?: boolean;
  onPlayPause: () => void;
  onNextSentence: () => void;
  onPrevSentence: () => void;
  onNextSection?: () => void;
  onPrevSection?: () => void;
  onSkipFrontMatter?: () => void;
  onJumpToPage?: (pageNumber: number) => void;
  onStopService: () => void;
  onPositionChange: (pos: { x: number; y: number }) => void;
}

export const FloatingWidgetOverlay: React.FC<FloatingWidgetOverlayProps> = ({
  state,
  totalSentences,
  totalPages = 1,
  currentPageNumber = 1,
  currentSentenceText,
  currentHeadingTitle,
  hasFrontMatter,
  onPlayPause,
  onNextSentence,
  onPrevSentence,
  onNextSection,
  onPrevSection,
  onSkipFrontMatter,
  onJumpToPage,
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
      
      const newX = Math.max(10, Math.min(window.innerWidth - 340, initialWidgetPos.current.x + dx));
      const newY = Math.max(70, Math.min(window.innerHeight - 120, initialWidgetPos.current.y + dy));

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
      className="fixed z-50 select-none animate-in fade-in duration-200 flex flex-col items-start gap-1.5"
    >
      {/* Horizontal Pill Container matching Blue & Soft Feminine Touch palette */}
      <div 
        className={`flex items-center gap-1.5 p-2 rounded-full shadow-2xl backdrop-blur-md border border-blue-200 transition-shadow ${
          isDragging ? 'shadow-blue-500/30 ring-2 ring-pink-400/80 cursor-grabbing' : 'shadow-slate-900/30'
        }`}
        style={{
          backgroundColor: 'rgba(238, 242, 255, 0.96)', // Soft Lavender / Sky Blue #EEF2FF
        }}
      >
        {/* Drag Handle & Logo */}
        <div
          onMouseDown={handleMouseDown}
          className="cursor-grab hover:bg-blue-100 p-1.5 rounded-full transition-colors flex items-center justify-center gap-1"
          title="Arrastrar widget flotante (SYSTEM_ALERT_WINDOW)"
        >
          <GripHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <AppLogo size={22} />
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-700 shadow-xs border border-blue-100">
          <Volume2 className={`w-3 h-3 ${state.isPlaying ? 'text-pink-500 animate-pulse' : 'text-slate-400'}`} />
          <span>{currentNum}/{totalSentences}</span>
        </div>

        {/* Page Selector Chip */}
        {onJumpToPage && totalPages > 0 && (
          <div className="flex items-center gap-1 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200 text-[10px] font-bold text-blue-900">
            <Bookmark className="w-3 h-3 text-pink-500" />
            <span>Pág</span>
            <select
              value={currentPageNumber}
              onChange={(e) => onJumpToPage(parseInt(e.target.value, 10))}
              className="bg-white text-blue-900 text-[10px] font-bold rounded px-1 py-0.5 focus:outline-none"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <span className="text-blue-600">/{totalPages}</span>
          </div>
        )}

        <div className="h-4 w-px bg-blue-200 my-auto" />

        {/* Prev Section Button */}
        {onPrevSection && (
          <button
            onClick={onPrevSection}
            className="p-1.5 rounded-full hover:bg-white active:scale-95 text-slate-700 transition-all flex items-center gap-0.5"
            title="Sección / Capítulo anterior"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
            <span className="text-[10px] font-bold text-blue-800 hidden sm:inline">⏮️</span>
          </button>
        )}

        {/* Prev Sentence Button */}
        <button
          onClick={onPrevSentence}
          disabled={state.currentSentenceIndex <= 0}
          className="p-1.5 rounded-full hover:bg-white active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent text-slate-700 transition-all"
          title="Oración anterior"
        >
          <SkipBack className="w-4 h-4 fill-blue-900" />
        </button>

        {/* Play/Pause Main FAB Button - Royal Blue with Soft Glow */}
        <button
          onClick={onPlayPause}
          className="p-2.5 rounded-full text-white shadow-md active:scale-95 transition-transform flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 ring-2 ring-pink-300"
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
          className="p-1.5 rounded-full hover:bg-white active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent text-slate-700 transition-all"
          title="Siguiente oración"
        >
          <SkipForward className="w-4 h-4 fill-blue-900" />
        </button>

        {/* Next Section Button */}
        {onNextSection && (
          <button
            onClick={onNextSection}
            className="p-1.5 rounded-full hover:bg-white active:scale-95 text-slate-700 transition-all flex items-center gap-0.5"
            title="Siguiente Sección / Capítulo"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
            <span className="text-[10px] font-bold text-blue-800 hidden sm:inline">⏭️</span>
          </button>
        )}

        <div className="h-4 w-px bg-blue-200 my-auto" />

        {/* Stop / Close Button */}
        <button
          onClick={onStopService}
          className="p-1.5 rounded-full hover:bg-pink-100 text-slate-600 hover:text-pink-700 transition-colors"
          title="Cerrar widget"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Skip Front Matter Banner if detected */}
      {hasFrontMatter && onSkipFrontMatter && (
        <button
          onClick={onSkipFrontMatter}
          className="bg-blue-900/90 text-blue-100 hover:bg-blue-800 text-[11px] font-medium px-3 py-1 rounded-full shadow-lg border border-blue-700 backdrop-blur-md flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <FastForward className="w-3.5 h-3.5 text-pink-300" />
          <span>⚡ Ir a Capítulo 1</span>
        </button>
      )}

      {/* Floating Active Sentence Speech Bubble (Mini Tooltip) */}
      {state.isPlaying && (
        <div className="max-w-xs bg-slate-900/95 text-white text-xs p-2.5 rounded-2xl shadow-lg border border-blue-800 backdrop-blur-md animate-in fade-in slide-in-from-top-1">
          {currentHeadingTitle && (
            <div className="flex items-center gap-1 mb-1.5 text-[10px] font-bold text-pink-300 bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-800 truncate">
              <BookOpen className="w-3 h-3 text-pink-400 shrink-0" />
              <span className="truncate">{currentHeadingTitle}</span>
            </div>
          )}
          <p className="line-clamp-2 leading-relaxed text-blue-50 font-medium italic">
            "{currentSentenceText}"
          </p>
        </div>
      )}
    </div>
  );
};
