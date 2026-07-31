import { PdfDocumentData } from '../types';

export const SAMPLE_PDFS: PdfDocumentData[] = [
  {
    title: "IA Neuronal y Procesamiento de Lenguaje Natural.pdf",
    fileName: "IA_Neuronal_PLN.pdf",
    fileSize: "1.4 MB",
    totalPages: 6,
    rawPageTexts: [
      `AGRADECIMIENTOS Y DERECHOS DE AUTOR
Agradecemos a la comunidad de software libre y a los investigadores en inteligencia artificial por hacer posible este libro. Todos los derechos reservados. Segunda edición 2026.

FE DE ERRATAS Y DEDICATORIA
Dedicado a los desarrolladores de sistemas embebidos y accesibilidad.`,

      `TABLA DE CONTENIDO
1. Capítulo 1: Síntesis de Voz Neuronal y Pipelines
2. Capítulo 2: Sanitización y Regex Semántico
3. Apéndice A: Glosario Técnico y Arquitectura
4. Bibliografía y Referencias Consultadas`,

      `CAPÍTULO 1: SÍNTESIS DE VOZ NEURONAL Y PIPELINES DE DATOS
La inteligencia artificial ha revolucionado la transformación de texto a voz mediante redes neuronales profundas. El procesamiento en tiempo real requiere de un pipeline eficiente en memoria RAM sin persistencia en disco.

Los modelos como Tacotron 2 y FastSpeech 2 generan espectrogramas de mel que posteriormente son sintetizados por vocoders neuronales como WaveGlow o HiFi-GAN.

En sistemas embebidos como Android, la captura de intentos (ACTION_VIEW) permite interceptar archivos PDF de forma transparente para el usuario final.`,

      `CAPÍTULO 2: SANITIZACIÓN Y REGEX SEMÁNTICO
Uno de los mayores desafíos al extraer texto de documentos PDF es la presencia de saltos de línea basura introducidos por los lectores de PDF tradicionales.

Por ejemplo, las palabras cortadas por guiones al final del margen deben ser unidas correctamente para evitar pausas artificiales durante la lectura en voz alta.

Además, el chunking semántico delimita las oraciones basándose exclusivamente en puntos, signos de interrogación y exclamación. ¿Cómo podemos garantizar una fluidez perfecta? Dividiendo el texto en un arreglo indexado de oraciones completas.`,

      `APÉNDICE A: GLOSARIO TÉCNICO Y ARQUITECTURA
A continuación se detallan los términos clave empleados en la plataforma:

1.1 TextToSpeech Engine: Motor de síntesis de voz nativo en Android.
1.2 ForegroundService: Servicio de ejecución en segundo plano persistente.
1.3 WindowManager: Administrador de capas de ventana para superposición de widgets.`,

      `BIBLIOGRAFÍA Y REFERENCIAS
1. Vaswani, A. et al. (2017). Attention Is All You Need. Advances in Neural Information Processing Systems.
2. Shen, J. et al. (2018). Natural TTS Synthesis by Conditioning WaveNet on Mel Spectrogram Predictions. IEEE ICASSP.
3. Android Open Source Project (2026). Foreground Services and System Alert Window Guidelines.`
    ],
    sanitizedText: "",
    sentences: []
  },
  {
    title: "Cien Años de Soledad - Fragmento Ilustrativo.pdf",
    fileName: "Cien_Anos_Soledad_Extracto.pdf",
    fileSize: "820 KB",
    totalPages: 2,
    rawPageTexts: [
      `Muchos años después, frente al pelotón de fusilamiento, el
coronel Aureliano Buendía había de recordar aquella tarde re-
mota en que su padre lo llevó a conocer el hielo.

Macondo era entonces una aldea de veinte casas de barro y ca-
ñabrava construidas a la orilla de un río de aguas diáfanas que se
precipitaban por un lecho de piedras pulidas, blancas y gigantes-
cas como huevos prehistóricos.

El mundo era tan reciente que muchas cosas carecían de nom-
bre, y para mencionarlas había que señalarlas con el dedo.`,

      `Todos los años, por el mes de marzo, una familia de gita-
nos desarrapados plantaba su carpa cerca de la aldea, y con un
grande alboroto de pitos y timbales daban a conocer los nue-
vos inventos.

Primero llevaron el imán. Un gitano corpulento, de barba sil-
vestre y manos de gorrión, que se presentó con el nombre de
Melquíades, hizo una audaz demostración pública de lo que él
mismo llamaba la octava maravilla de los sabios alquimistas de
Macedonia.`
    ],
    sanitizedText: "",
    sentences: []
  },
  {
    title: "Manual Técnico Android Jetpack Compose 2026.pdf",
    fileName: "Manual_Jetpack_Compose_2026.pdf",
    fileSize: "2.8 MB",
    totalPages: 2,
    rawPageTexts: [
      `MANUAL DE DESARROLLO EN KOTLIN Y JETPACK COMPOSE
El desarrollo de interfaces modernas en Android se basa en compo-
sables declarativos de alto rendimiento.

La gestión de estado sin base de datos requiere una arquitec-
tura reactiva basada en StateFlow y Coroutines.
Al usar un ForegroundService con superposición de pantalla
(WindowManager), es fundamental optimizar la memoria evitando
fugas de contexto (Context leaks).

¿Cuál es la mejor estrategia para el procesamiento de PDF? Utilizar
un flujo de lectura diferida (Lazy Loading) mediante PdfRenderer.`,

      `SÍNTESIS DE VOZ Y CONTROL DE AUDIO EN SEGUNDO PLANO
La clase TextToSpeech de Android gestiona la cola de reproducción
mediante UtteranceProgressListener.

Al presionar el botón de avance semántico (index + 1), el servicio
interrumpe inmediatamente el audio actual mediante tts.stop() e in-
icia la síntesis del nuevo índice.

Esto garantiza una respuesta instantánea al usuario sin latencia
de almacenamiento.`
    ],
    sanitizedText: "",
    sentences: []
  }
];
