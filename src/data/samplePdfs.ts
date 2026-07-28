import { PdfDocumentData } from '../types';

export const SAMPLE_PDFS: PdfDocumentData[] = [
  {
    title: "IA Neuronal y Procesamiento de Lenguaje Natural.pdf",
    fileName: "IA_Neuronal_PLN.pdf",
    fileSize: "1.4 MB",
    totalPages: 3,
    rawPageTexts: [
      `CAPÍTULO 1: SÍNTESIS DE VOZ NEURONAL Y PIPELINES DE DATOS
La inteligencia artificial ha revolucionado la transfor-
mación de texto a voz mediante redes neuronales profundas.
El procesamiento en tiempo real requiere de un pipeline efi-
ciente en memoria RAM sin persistencia en disco.

Los modelos como Tacotron 2 y FastSpeech 2 generan espec-
trogramas de mel que posteriormente son sintetizados por vo-
coders neuronales como WaveGlow o HiFi-GAN.

En sistemas embebidos como Android, la captura de inten-
tos (ACTION_VIEW) permite interceptar archivos PDF de forma
transparente para el usuario final.`,

      `CAPÍTULO 2: SANITIZACIÓN Y REGEX SEMÁNTICO
Uno de los mayores desafíos al extraer texto de documentos PDF
es la presencia de saltos de línea basura introducidos por los lec-
tores de PDF tradicionales.

Por ejemplo, las palabras cortadas por guio-
nes al final del margen deben ser unidas correctamente para
evitar pausas artificiales durante la lectura en voz alta.

Además, el chunking semántico delimita las oraciones basán-
dose exclusivamente en puntos, signos de interrogación y excla-
mación. ¿Cómo podemos garantizar una fluidez perfecta? Dividiendo
el texto en un arreglo indexado de oraciones completas.`,

      `CAPÍTULO 3: SERVICIOS EN PRIMER PLANO Y WINDOW MANAGER
El FloatingControlService en Android utiliza el permiso
SYSTEM_ALERT_WINDOW para superponer un widget flotante
sobre cualquier otra aplicación activa.

El usuario puede pausar, reanudar o avanzar oraciones (index + 1)
mientras lee artículos en su navegador o revisa documentos en
WhatsApp. El estado permanece limpio en memoria y finaliza al
destruir el servicio.`
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
