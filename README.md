# Lector PDF Flotante Neuronal 🎧📱

**Lector PDF Flotante Neuronal** es una solución móvil Android desarrollada en **Kotlin y Jetpack Compose** con arquitectura **Stateless (100% en memoria RAM)**. Intercepta la apertura de documentos PDF desde cualquier otra aplicación (WhatsApp, Chrome, Drive, Gmail) mediante un `IntentFilter` y realiza la lectura en voz alta utilizando una voz neuronal natural y pausada (configurada por defecto con `es-MX-JorgeNeural` / motores neuronales de alta calidad).

Todo el control de reproducción se maneja a través de un **widget flotante superpuesto (`SYSTEM_ALERT_WINDOW`)** que permite pausar, reanudar y navegar oración por oración sin salir de la app que estés usando.

---

## 🎯 ¿Qué hace la aplicación?

1. **Interceptación Transparente de PDFs (`ACTION_VIEW`):** Al tocar un PDF en cualquier app del teléfono, el usuario puede seleccionar "Lector PDF Flotante" para iniciar la lectura instantánea.
2. **Pipeline de Procesamiento sin Persistencia:**
   - **Extract:** Carga páginas de forma diferida (*Lazy Loading*) con `PdfRenderer` sin saturar la memoria RAM.
   - **Transform (Sanitización Regex):** Une palabras cortadas por guiones al final del margen (ej. `transfor-\nmación` → `transformación`) y remueve saltos de línea basura dentro de oraciones.
   - **Chunking Semántico:** Divide el texto en un arreglo indexado basado estrictamente en **oraciones completas** delimitadas por puntos y signos de interrogación (`.`, `?`, `!`).
   - **Consume:** Un `ForegroundService` envía las oraciones secuencialmente al motor TTS con control de velocidad (0.5x - 2.0x), modulación cálida de tono (pitch 0.95x) y pausas de respiración entre oraciones.
3. **Widget Flotante Arrastrable:** Una pastilla minimalista que se superpone en la pantalla del teléfono con botones de *Play/Pause*, *Anterior (index - 1)*, *Siguiente (index + 1)* y *Cerrar/Destruir Servicio*.
4. **Interruptor Maestro (Ahorro de Batería):** Un toggle principal en la app para iniciar o destruir completamente el servicio en primer plano y liberar la memoria RAM.

---

## 🏗️ Estructura del Proyecto

```
lector-pdf-flotante-neuronal/
├── Android (Código Nativo Kotlin)
│   ├── app/src/main/AndroidManifest.xml              # Permisos SYSTEM_ALERT_WINDOW, FOREGROUND_SERVICE e IntentFilters
│   ├── app/src/main/java/com/neuronal/pdfreader/
│   │   ├── MainActivity.kt                            # UI Principal en Jetpack Compose con Interruptor Maestro y Sliders
│   │   ├── FloatingControlService.kt                  # ForegroundService + Inyección del Widget Flotante en WindowManager
│   │   └── PdfDataPipeline.kt                         # Pipeline Extract -> Transform (Regex) -> Chunking Semántico
│   └── app/build.gradle.kts                           # Configuración de dependencias Jetpack Compose y Coroutines
│
├── Web Simulator & Web Server (React 19 + Express + Vite)
│   ├── server.ts                                      # Servidor Express full-stack + Vite middleware + API Gemini opt.
│   ├── src/
│   │   ├── App.tsx                                    # Estado global, Web Speech Synthesis & Exportador ZIP
│   │   ├── types.ts                                   # Definición de interfaces TypeScript
│   │   ├── utils/pdfPipeline.ts                       # Pipeline JS equivalente para pruebas web
│   │   ├── components/
│   │   │   ├── Header.tsx                             # Barra superior con selector de pestañas
│   │   │   ├── Simulator/
│   │   │   │   ├── DeviceSimulator.tsx                # Marco de smartphone Android con controles Compose
│   │   │   │   └── FloatingWidgetOverlay.tsx          # Widget flotante interactivo arrastrable
│   │   │   ├── Pipeline/
│   │   │   │   └── PipelineDebugger.tsx               # Inspección de oraciones y reglas Regex
│   │   │   ├── CodeViewer/
│   │   │   │   └── CodeViewer.tsx                     # Visualizador de código fuente Kotlin
│   │   │   └── Architecture/
│   │   │       └── ArchitectureView.tsx               # Diagrama de arquitectura Stateless
│   │   └── data/
│   │       ├── androidCode.ts                         # Archivos entregables en Kotlin/XML/Gradle
│   │       └── samplePdfs.ts                          # Documentos PDF de demostración
└── README.md                                          # Documentación técnica
```


## 🎙️ El Sistema de Voces y Suavizado Neuronal

Para garantizar que la lectura sea **cálida, suave y fluida** sin sonar robótica:

1. **Selección de Voz Neuronal:** Prioriza automáticamente voces etiquetadas como `es-MX-JorgeNeural`, `Natural`, `Neural`, `Dalia` o `Google Español`.
2. **Modulación Acústica:** Ajusta el tono (*pitch*) a **0.95x** para obtener un timbre más humano y profundo, reduciendo la estridencia metálica de sintetizadores estándar.
3. **Cadencia Prosódica:** Modifica la velocidad predeterminada a **0.95x** y preprocesa el texto insertando micropauses de respiración en comas y conjunciones.
4. **Pausas entre Oraciones:** Incorpora un retardo configurable de **300ms a 500ms** entre oraciones para emular el ritmo de lectura humana.


## 🔬 Métodos y Algoritmos del Pipeline

### 1. Extract (Lectura Diferida / Lazy Loading)
- **Método:** `extractRawTextFromPdfUri(uri)`
- Carga las páginas bajo demanda utilizando `PdfRenderer` o `PdfBox-Android` sobre hilos secundarios (`Dispatchers.IO`), manteniendo un bajo consumo de memoria.

### 2. Transform (Sanitización Regex)
- **Método:** `sanitizeText(rawText)`
- **Unión de Guiones:** `r"([a-zA-ZáéíóúñÁÉÍÓÚÑ]+)-\s*[\r\n]+\s*([a-zA-ZáéíóúñÁÉÍÓÚÑ]+)" → "$1$2"`
- **Rupturas de Línea:** Reemplaza saltos de línea basura a mitad de oración por espacios simples `r"(?<![.!?;\n])\s*[\r\n]+\s*(?![.!?;\n])"`.

### 3. Chunking Semántico
- **Método:** `chunkIntoSentences(sanitizedText)`
- Divide el texto exclusivamente mediante límites de oraciones completas: `r"(?<=[.!?])\s+"`.

### 4. Consume (Servicio Flotante)
- **Método:** `playCurrentSentence()` & `advanceToNextSentence()`
- Un `ForegroundService` que gestiona `current_sentence_index`. Al avanzar o retroceder, invoca `tts.stop()` e inicia inmediatamente el nuevo índice sin latencia.


## 🎨 Sistema de Diseño UI/UX (Jetpack Compose)

La interfaz se rige por un sistema de diseño limpio, neutro e impecable:

- **Sage Teal (`#5A7D7C`):** Acentos principales, botones de acción (*FAB*), toggles activos y sliders.
- **Slate Blue (`#78909C`):** Íconos secundarios, etiquetas y texto explicativo.
- **Cool Gray (`#CFD8DC`):** Bordes, divisores y fondo con 92% de opacidad para el widget flotante.
- **Off White (`#F4F6F7`):** Fondo general de la aplicación.
- **Charcoal Dark (`#1E293B`):** Títulos y tipografía principal (Roboto).

---

## 💻 Cómo ejecutar el simulador desde el ordenador (PC)

### Requisitos previos:
- Node.js (versión 18 o superior)
- npm o bun

### Pasos de ejecución local:

1. **Clonar o descargar el repositorio:**
   ```bash
   git clone https://github.com/LauraCaviedes/LectorPDF-voz-flotante_android.git
   cd LectorPDF-voz-flotante_android
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   El servidor se iniciará en `http://localhost:3000`.

4. **Probar el simulador en el navegador:**
   - Abre `http://localhost:3000` en Chrome o Edge.
   - Podrás interactuar con el **simulador de smartphone Android**, arrastrar el **widget flotante superpuesto**, probar los diferentes PDFs de muestra, ajustar los deslizadores de velocidad y tono, y escuchar la lectura mediante la API de síntesis de voz del navegador.
   - También puedes subir tus propios archivos PDF para verificar la sanitización Regex en tiempo real.

---

## 📱 Cómo compilar y ejecutar en Android Studio

Para probar la aplicación directamente en un dispositivo Android físico o emulador:

### Opción A: Exportar el Proyecto desde la Web
1. En la interfaz web, haz clic en el botón **"Exportar Proyecto .zip"** ubicado en la esquina superior derecha.
2. Extrae el archivo `.zip` descargado en tu ordenador.

### Opción B: Crear un Proyecto Nuevo en Android Studio
1. Abre **Android Studio** (versión Iguana, Jellyfish o posterior).
2. Crea un nuevo proyecto seleccionando **Empty Activity (Jetpack Compose)**.
3. Asigna el package name: `com.neuronal.pdfreader`.
4. Copia los archivos del entregable en sus respectivas rutas:
   - `AndroidManifest.xml` → `app/src/main/AndroidManifest.xml`
   - `MainActivity.kt` → `app/src/main/java/com/neuronal/pdfreader/MainActivity.kt`
   - `FloatingControlService.kt` → `app/src/main/java/com/neuronal/pdfreader/FloatingControlService.kt`
   - `PdfDataPipeline.kt` → `app/src/main/java/com/neuronal/pdfreader/PdfDataPipeline.kt`
   - `build.gradle.kts` → `app/build.gradle.kts`
5. Sincroniza Gradle (*Sync Project with Gradle Files*).

### Ejecución en el Dispositivo:
1. Conecta tu dispositivo Android mediante depuración USB o inicia un emulador Android (Android 8.0+ / API 26+).
2. Haz clic en **Run 'app'** (`Shift + F10`).
3. **Otorgar Permiso de Superposición:** Al activar el *Interruptor Maestro* por primera vez, la app te solicitará conceder el permiso **"Aparecer encima / Mostrar sobre otras apps"** (`SYSTEM_ALERT_WINDOW`).
4. **Probar con un PDF real:** Abre cualquier PDF desde WhatsApp o tu explorador de archivos, selecciona "Abrir con Lector PDF Flotante", ¡y el widget flotante comenzará a leer en voz alta de inmediato!

---

## 📜 Licencia
Apache License 2.0. Desarrollado con estándares de desarrollo Android Senior.
