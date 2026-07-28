import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { Header } from './components/Header';
import { DeviceSimulator } from './components/Simulator/DeviceSimulator';
import { FloatingWidgetOverlay } from './components/Simulator/FloatingWidgetOverlay';
import { PipelineDebugger } from './components/Pipeline/PipelineDebugger';
import { CodeViewer } from './components/CodeViewer/CodeViewer';
import { ArchitectureView } from './components/Architecture/ArchitectureView';
import { SAMPLE_PDFS } from './data/samplePdfs';
import { ANDROID_CODE_FILES } from './data/androidCode';
import { PdfDocumentData, FloatingWidgetState } from './types';
import { sanitizePdfText, chunkIntoSentences, extractTextFromPdfFile } from './utils/pdfPipeline';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'pipeline' | 'code' | 'architecture'>('simulator');
  
  // Initialize sample PDF #1 with Regex & Chunk pipeline processed
  const initialPdf = React.useMemo(() => {
    const p1 = SAMPLE_PDFS[0];
    const fullRaw = p1.rawPageTexts.join('\n\n');
    const sanitized = sanitizePdfText(fullRaw);
    const sentences = chunkIntoSentences(sanitized, 1);
    return {
      ...p1,
      sanitizedText: sanitized,
      sentences,
    };
  }, []);

  const [currentPdf, setCurrentPdf] = useState<PdfDocumentData>(initialPdf);
  const [samplePdfsList, setSamplePdfsList] = useState<PdfDocumentData[]>(() => {
    return SAMPLE_PDFS.map(p => {
      const raw = p.rawPageTexts.join('\n\n');
      const sanitized = sanitizePdfText(raw);
      const sentences = chunkIntoSentences(sanitized, 1);
      return { ...p, sanitizedText: sanitized, sentences };
    });
  });

  // Floating Control Service State
  const [widgetState, setWidgetState] = useState<FloatingWidgetState>({
    isVisible: true,
    isServiceRunning: true,
    isPlaying: false,
    currentSentenceIndex: 0,
    readingSpeed: 0.95,
    pitch: 0.95, // Warm, softer timbre
    smoothVoiceMode: true, // Enables soft prosody and punctuation breathing
    interSentencePause: 300, // 300ms natural pause between sentences
    selectedVoice: 'es-MX-JorgeNeural',
    voiceURI: '',
    hasOverlayPermission: true,
    position: { x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 360) : 100, y: 140 },
  });

  // System Voices Detection and Quality Ranking
  const [availableSpanishVoices, setAvailableSpanishVoices] = useState<SpeechSynthesisVoice[]>([]);
  const isSpeakingRef = useRef(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to score voices for maximum naturalness
  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    let score = 0;
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();

    if (!lang.startsWith('es')) return -1; // Spanish required

    if (lang.includes('es-mx')) score += 100;
    else if (lang.includes('es-es')) score += 60;
    else if (lang.includes('es-us')) score += 50;
    else score += 30;

    if (name.includes('natural')) score += 200;
    if (name.includes('neural')) score += 200;
    if (name.includes('online')) score += 90;
    if (name.includes('jorge')) score += 150;
    if (name.includes('dalia')) score += 120;
    if (name.includes('google')) score += 80;
    if (name.includes('premium') || name.includes('enhanced')) score += 100;

    return score;
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const spanish = allVoices
        .filter(v => v.lang.toLowerCase().startsWith('es'))
        .sort((a, b) => scoreVoice(b) - scoreVoice(a));

      setAvailableSpanishVoices(spanish);

      if (spanish.length > 0 && !widgetState.voiceURI) {
        setWidgetState(prev => ({
          ...prev,
          voiceURI: spanish[0].voiceURI,
          selectedVoice: spanish[0].name
        }));
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const stopAudioImmediate = () => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;
  };

  // Preprocesses text for smoother, softer reading cadence
  const formatSoftText = (text: string, isSmooth: boolean): string => {
    if (!isSmooth) return text;
    // Add micro breathing pauses at punctuation marks and conjunctions
    return text
      .replace(/([,;:]|\bque\b|\bpor lo tanto\b|\bademás\b)/gi, '$1, ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Sync TTS playback with active sentence index
  const speakSentence = (
    sentenceIndex: number,
    speed = widgetState.readingSpeed,
    pitch = widgetState.pitch,
    voiceURI = widgetState.voiceURI,
    smooth = widgetState.smoothVoiceMode
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    stopAudioImmediate();

    if (!currentPdf.sentences || currentPdf.sentences.length === 0) return;
    if (sentenceIndex < 0 || sentenceIndex >= currentPdf.sentences.length) {
      setWidgetState(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    const chunk = currentPdf.sentences[sentenceIndex];
    if (!chunk || !chunk.text) return;

    const formattedText = formatSoftText(chunk.text, smooth);
    const utterance = new SpeechSynthesisUtterance(formattedText);
    utterance.rate = speed;
    utterance.pitch = pitch; // Soft, warmer tone tuning
    utterance.lang = 'es-MX';

    // Find requested or best voice
    const voices = window.speechSynthesis.getVoices();
    let selectedV = voices.find(v => v.voiceURI === voiceURI);
    if (!selectedV && availableSpanishVoices.length > 0) {
      selectedV = availableSpanishVoices[0];
    }
    if (!selectedV) {
      selectedV = voices.find(v => v.lang.includes('es'));
    }

    if (selectedV) {
      utterance.voice = selectedV;
    }

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setWidgetState(prev => ({ ...prev, isPlaying: true, currentSentenceIndex: sentenceIndex }));
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      // Natural inter-sentence breathing pause before auto-advancing
      if (sentenceIndex + 1 < currentPdf.sentences.length) {
        if (widgetState.interSentencePause > 0) {
          pauseTimeoutRef.current = setTimeout(() => {
            speakSentence(sentenceIndex + 1, speed, pitch, voiceURI, smooth);
          }, widgetState.interSentencePause);
        } else {
          speakSentence(sentenceIndex + 1, speed, pitch, voiceURI, smooth);
        }
      } else {
        setWidgetState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setWidgetState(prev => ({ ...prev, isPlaying: false }));
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPause = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (widgetState.isPlaying) {
      stopAudioImmediate();
      setWidgetState(prev => ({ ...prev, isPlaying: false }));
    } else {
      speakSentence(widgetState.currentSentenceIndex);
    }
  };

  const handleNextSentence = () => {
    if (widgetState.currentSentenceIndex + 1 < currentPdf.sentences.length) {
      const newIdx = widgetState.currentSentenceIndex + 1;
      speakSentence(newIdx);
    }
  };

  const handlePrevSentence = () => {
    if (widgetState.currentSentenceIndex > 0) {
      const newIdx = widgetState.currentSentenceIndex - 1;
      speakSentence(newIdx);
    }
  };

  const handleJumpToSentence = (index: number) => {
    speakSentence(index);
  };

  const handleToggleMasterSwitch = (enabled: boolean) => {
    stopAudioImmediate();
    setWidgetState(prev => ({
      ...prev,
      isServiceRunning: enabled,
      isVisible: enabled,
      isPlaying: false,
      currentSentenceIndex: 0,
    }));
  };

  const handleSpeedChange = (speed: number) => {
    setWidgetState(prev => ({ ...prev, readingSpeed: speed }));
    if (widgetState.isPlaying) {
      speakSentence(widgetState.currentSentenceIndex, speed);
    }
  };

  const handlePitchChange = (pitch: number) => {
    setWidgetState(prev => ({ ...prev, pitch }));
    if (widgetState.isPlaying) {
      speakSentence(widgetState.currentSentenceIndex, widgetState.readingSpeed, pitch);
    }
  };

  const handleToggleSmoothVoiceMode = (enabled: boolean) => {
    setWidgetState(prev => ({ ...prev, smoothVoiceMode: enabled }));
    if (widgetState.isPlaying) {
      speakSentence(widgetState.currentSentenceIndex, widgetState.readingSpeed, widgetState.pitch, widgetState.voiceURI, enabled);
    }
  };

  const handlePauseChange = (ms: number) => {
    setWidgetState(prev => ({ ...prev, interSentencePause: ms }));
  };

  const handleVoiceChange = (voiceURI: string) => {
    const v = availableSpanishVoices.find(x => x.voiceURI === voiceURI);
    const voiceName = v ? v.name : 'Voz Personalizada';
    setWidgetState(prev => ({ ...prev, voiceURI, selectedVoice: voiceName }));
    if (widgetState.isPlaying) {
      speakSentence(widgetState.currentSentenceIndex, widgetState.readingSpeed, widgetState.pitch, voiceURI);
    }
  };

  const handleSelectSamplePdf = (pdf: PdfDocumentData) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentPdf(pdf);
    setWidgetState(prev => ({
      ...prev,
      currentSentenceIndex: 0,
      isPlaying: false
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const processed = await extractTextFromPdfFile(file);
    setCurrentPdf(processed);
    setWidgetState(prev => ({
      ...prev,
      currentSentenceIndex: 0,
      isPlaying: false
    }));
  };

  const handleSimulateIntent = () => {
    // Pick another sample or reset index to simulate intercepting ACTION_VIEW intent
    const nextIdx = (samplePdfsList.findIndex(p => p.title === currentPdf.title) + 1) % samplePdfsList.length;
    const newPdf = samplePdfsList[nextIdx];
    handleSelectSamplePdf(newPdf);
    if (widgetState.isServiceRunning) {
      setTimeout(() => {
        speakSentence(0, widgetState.readingSpeed);
      }, 300);
    }
  };

  // Download complete Android Kotlin ZIP
  const handleDownloadZip = async () => {
    const zip = new JSZip();

    // Add code files with directory structure
    ANDROID_CODE_FILES.forEach(file => {
      zip.file(file.path, file.content);
    });

    // Add README.md
    zip.file("README.md", `# Lector PDF Flotante Neuronal - Android App

## Descripción
Aplicación Android para la interceptación y lectura en voz alta de archivos PDF mediante un widget flotante superpuesto (\`SYSTEM_ALERT_WINDOW\`).

## Características
- **Sin Persistencia DB:** Estado 100% en memoria RAM.
- **Pipeline de Datos:**
  - **Extract:** Carga diferida con \`PdfRenderer\` / \`PdfBox-Android\`.
  - **Transform:** Sanitización Regex para unir palabras cortadas por guiones y eliminar saltos de línea basura.
  - **Chunking Semántico:** División estricta en oraciones completas delimitadas por puntos y signos de interrogación.
- **Consume:** \`ForegroundService\` con canal de notificación e inyección de widget flotante arrastrable mediante \`WindowManager\`.
- **Motor TTS Neuronal:** Configurado para \`es-MX-JorgeNeural\` con control de velocidad (0.5x - 2.0x).

## Entregables
1. \`AndroidManifest.xml\`
2. \`MainActivity.kt\`
3. \`FloatingControlService.kt\`
4. \`PdfDataPipeline.kt\`
5. \`build.gradle.kts\`
`);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lector-pdf-flotante-neuronal-android.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeSentenceText = currentPdf.sentences[widgetState.currentSentenceIndex]?.text;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-600 selection:text-white">
      
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isServiceActive={widgetState.isServiceRunning}
        onDownloadZip={handleDownloadZip}
      />

      {/* Floating Widget Overlay rendered on top of everything */}
      <FloatingWidgetOverlay
        state={widgetState}
        totalSentences={currentPdf.sentences.length}
        currentSentenceText={activeSentenceText}
        onPlayPause={handlePlayPause}
        onNextSentence={handleNextSentence}
        onPrevSentence={handlePrevSentence}
        onStopService={() => handleToggleMasterSwitch(false)}
        onPositionChange={(pos) => setWidgetState(prev => ({ ...prev, position: pos }))}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'simulator' && (
          <DeviceSimulator
            currentPdf={currentPdf}
            widgetState={widgetState}
            samplePdfs={samplePdfsList}
            availableVoices={availableSpanishVoices}
            onSelectSamplePdf={handleSelectSamplePdf}
            onFileUpload={handleFileUpload}
            onToggleMasterSwitch={handleToggleMasterSwitch}
            onSpeedChange={handleSpeedChange}
            onPitchChange={handlePitchChange}
            onToggleSmoothVoiceMode={handleToggleSmoothVoiceMode}
            onPauseChange={handlePauseChange}
            onVoiceChange={handleVoiceChange}
            onPlayPause={handlePlayPause}
            onJumpToSentence={handleJumpToSentence}
            onSimulateIntent={handleSimulateIntent}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineDebugger
            currentPdf={currentPdf}
            activeSentenceIndex={widgetState.currentSentenceIndex}
          />
        )}

        {activeTab === 'code' && (
          <CodeViewer onDownloadZip={handleDownloadZip} />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}
      </main>

      {/* Bottom Sticky Status Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-400 py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span>Servicio Flotante: <strong className="text-slate-200">{widgetState.isServiceRunning ? 'En Ejecución' : 'Detenido'}</strong></span>
          <span className="text-slate-600">•</span>
          <span>Documento Activo: <strong className="text-slate-200">{currentPdf.title}</strong></span>
        </div>

        <div>
          <span>Lector PDF Flotante Neuronal • Jetpack Compose & Kotlin Senior Architecture</span>
        </div>
      </footer>

    </div>
  );
}
