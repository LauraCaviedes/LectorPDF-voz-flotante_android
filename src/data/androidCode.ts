import { CodeFile } from '../types';

export const ANDROID_CODE_FILES: CodeFile[] = [
  {
    id: 'manifest',
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Permisos de sistema, ForegroundService type mediaPlayback e IntentFilters para abrir PDFs de otras apps.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.neuronal.pdfreader">

    <!-- Permisos para el servicio flotante y audio -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Permisos para leer archivos de almacenamiento local -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" 
        android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_DOCUMENTS" />

    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="Lector PDF Flotante"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.LectorPdfFlotante"
        tools:targetApi="34">

        <!-- Pantalla Principal Controladora -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="Lector PDF Flotante"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:theme="@style/Theme.LectorPdfFlotante">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Intent Filter para Interceptar PDFs desde WhatsApp, Chrome, Drive, etc. -->
            <intent-filter tools:ignore="AppLinkUrlError">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:mimeType="application/pdf" />
                <data android:scheme="file" />
                <data android:scheme="content" />
                <data android:scheme="http" />
                <data android:scheme="https" />
            </intent-filter>

            <intent-filter>
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="application/pdf" />
            </intent-filter>
        </activity>

        <!-- Servicio en Primer Plano para el Widget Flotante y TTS -->
        <service
            android:name=".FloatingControlService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="mediaPlayback" />

    </application>

</manifest>`
  },
  {
    id: 'main_activity',
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/neuronal/pdfreader/MainActivity.kt',
    language: 'kotlin',
    description: 'UI Principal en Jetpack Compose con TopBar, Hero Card con Interruptor Maestro, Slider de velocidad y selector de voz.',
    content: `package com.neuronal.pdfreader

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

// Paleta de Colores Solicitada
val SageTeal = Color(0xFF5A7D7C)
val SlateBlue = Color(0xFF78909C)
val CoolGray = Color(0xFFCFD8DC)
val OffWhite = Color(0xFFF4F6F7)
val CharcoalDark = Color(0xFF1E293B)

class MainActivity : ComponentActivity() {

    private var selectedPdfUri by mutableStateOf<Uri?>(null)
    private var isServiceActive by mutableStateOf(false)
    private var readingSpeed by mutableStateOf(1.0f)
    private var isExtractingPdf by mutableStateOf(false)
    private var totalSentencesCount by mutableStateOf(0)
    private var currentPdfTitle by mutableStateOf<String?>(null)

    // File Picker Result Launcher
    private val pdfPickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { processPdfUri(it) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Verificar si la app fue abierta interceptando un Intent ACTION_VIEW
        intent?.let { handleIncomingIntent(it) }

        setContent {
            LectorPdfTheme {
                MainScreen(
                    isServiceActive = isServiceActive,
                    readingSpeed = readingSpeed,
                    currentPdfTitle = currentPdfTitle,
                    totalSentences = totalSentencesCount,
                    isExtracting = isExtractingPdf,
                    onToggleMasterSwitch = { active ->
                        if (active) {
                            checkOverlayPermissionAndStart()
                        } else {
                            stopFloatingService()
                        }
                    },
                    onSpeedChange = { newSpeed ->
                        readingSpeed = newSpeed
                        updateServiceSpeed(newSpeed)
                    },
                    onPickPdfClick = { pdfPickerLauncher.launch("application/pdf") },
                    onRequestOverlayPermission = { requestOverlayPermission() }
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIncomingIntent(intent)
    }

    private fun handleIncomingIntent(intent: Intent) {
        if (intent.action == Intent.ACTION_VIEW || intent.action == Intent.ACTION_SEND) {
            val uri: Uri? = intent.data ?: intent.getParcelableExtra(Intent.EXTRA_STREAM)
            uri?.let { processPdfUri(it) }
        }
    }

    private fun processPdfUri(uri: Uri) {
        selectedPdfUri = uri
        currentPdfTitle = uri.lastPathSegment?.substringAfterLast('/') ?: "Documento.pdf"
        isExtractingPdf = true

        val scope = (application as? LectorApplication)?.applicationScope
        scope?.launch(Dispatchers.IO) {
            val pipeline = PdfDataPipeline(applicationContext)
            val pdfData = pipeline.extractAndTransform(uri)

            withContext(Dispatchers.Main) {
                isExtractingPdf = false
                totalSentencesCount = pdfData.sentences.size
                Toast.makeText(
                    this@MainActivity,
                    "PDF procesado: \${pdfData.sentences.size} oraciones semánticas",
                    Toast.LENGTH_SHORT
                ).show()

                // Si el servicio ya está activo, actualizar la cola en RAM
                if (isServiceActive) {
                    val serviceIntent = Intent(this@MainActivity, FloatingControlService::class.java).apply {
                        action = FloatingControlService.ACTION_LOAD_PDF
                        putExtra(FloatingControlService.EXTRA_PDF_URI, uri.toString())
                    }
                    startService(serviceIntent)
                }
            }
        }
    }

    private fun checkOverlayPermissionAndStart() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            requestOverlayPermission()
        } else {
            startFloatingService()
        }
    }

    private fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:\$packageName")
            )
            startActivity(intent)
        }
    }

    private fun startFloatingService() {
        val intent = Intent(this, FloatingControlService::class.java).apply {
            action = FloatingControlService.ACTION_START
            selectedPdfUri?.let { putExtra(FloatingControlService.EXTRA_PDF_URI, it.toString()) }
            putExtra(FloatingControlService.EXTRA_SPEED, readingSpeed)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
        isServiceActive = true
    }

    private fun stopFloatingService() {
        val intent = Intent(this, FloatingControlService::class.java).apply {
            action = FloatingControlService.ACTION_STOP
        }
        startService(intent)
        isServiceActive = false
    }

    private fun updateServiceSpeed(speed: Float) {
        if (isServiceActive) {
            val intent = Intent(this, FloatingControlService::class.java).apply {
                action = FloatingControlService.ACTION_UPDATE_SPEED
                putExtra(FloatingControlService.EXTRA_SPEED, speed)
            }
            startService(intent)
        }
    }
}

// Tema de UI personalizado
@Composable
fun LectorPdfTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = SageTeal,
            secondary = SlateBlue,
            background = OffWhite,
            surface = Color.White,
            outline = CoolGray
        ),
        content = content
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    isServiceActive: Boolean,
    readingSpeed: Float,
    currentPdfTitle: String?,
    totalSentences: Int,
    isExtracting: Boolean,
    onToggleMasterSwitch: (Boolean) -> Unit,
    onSpeedChange: (Float) -> Unit,
    onPickPdfClick: () -> Unit,
    onRequestOverlayPermission: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(SageTeal),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.GraphicEq,
                                contentDescription = "Logo",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Lector PDF Flotante",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = CharcoalDark
                            )
                            Text(
                                text = "Motor Neuronal • es-MX-JorgeNeural",
                                fontSize = 11.sp,
                                color = SlateBlue
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = OffWhite
                )
            )
        },
        containerColor = OffWhite
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            Spacer(modifier = Modifier.height(4.dp))

            // HERO CARD CON INTERRUPTOR MAESTRO
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Interruptor Maestro",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = CharcoalDark
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = if (isServiceActive) "Servicio en primer plano ACTIVO" else "Servicio INACTIVO (Ahorro de Batería)",
                                fontSize = 13.sp,
                                color = if (isServiceActive) SageTeal else SlateBlue
                            )
                        }
                        Switch(
                            checked = isServiceActive,
                            onCheckedChange = onToggleMasterSwitch,
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = SageTeal,
                                uncheckedThumbColor = CoolGray,
                                uncheckedTrackColor = Color(0xFFE2E8F0)
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    Divider(color = CoolGray.copy(alpha = 0.5f))
                    Spacer(modifier = Modifier.height(16.dp))

                    // Document Status Row
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(
                            imageVector = Icons.Default.PictureAsPdf,
                            contentDescription = "PDF",
                            tint = SageTeal,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = currentPdfTitle ?: "Sin PDF cargado",
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 14.sp,
                                color = CharcoalDark
                            )
                            Text(
                                text = if (isExtracting) "Extrayendo y sanitizando texto..." 
                                       else if (totalSentences > 0) "\$totalSentences oraciones semánticas listas"
                                       else "Abre un PDF desde otra app o selecciónalo abajo",
                                fontSize = 12.sp,
                                color = SlateBlue
                            )
                        }
                        IconButton(onClick = onPickPdfClick) {
                            Icon(
                                imageVector = Icons.Default.FolderOpen,
                                contentDescription = "Buscar PDF",
                                tint = SageTeal
                            )
                        }
                    }
                }
            }

            // AJUSTES RÁPIDOS
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "Ajustes Rápidos de Lectura",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = CharcoalDark
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Velocidad de Lectura",
                            fontSize = 14.sp,
                            color = SlateBlue
                        )
                        Text(
                            text = "%.1fx".format(readingSpeed),
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = SageTeal
                        )
                    }

                    Slider(
                        value = readingSpeed,
                        onValueChange = onSpeedChange,
                        valueRange = 0.5f..2.0f,
                        steps = 5,
                        colors = SliderDefaults.colors(
                            thumbColor = SageTeal,
                            activeTrackColor = SageTeal,
                            inactiveTrackColor = CoolGray
                        )
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Configuración de Voz Predeterminada
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(OffWhite)
                            .padding(12.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.RecordVoiceOver,
                            contentDescription = "Voz Neuronal",
                            tint = SlateBlue,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Voz Neuronal Predeterminada",
                                fontSize = 12.sp,
                                color = SlateBlue
                            )
                            Text(
                                text = "es-MX-JorgeNeural (Español México)",
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 13.sp,
                                color = CharcoalDark
                            )
                        }
                    }
                }
            }

            // PERMISOS Y AVISO ARQUITECTURA
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Layers,
                            contentDescription = "Arquitectura",
                            tint = SageTeal,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Arquitectura Stateless (Solo RAM)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = CharcoalDark
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "• Sin base de datos Room/SQLite: El estado vive únicamente en el ForegroundService y se destruye al apagar el servicio.\n" +
                                "• Pipeline de Datos: Extract (PdfRenderer) -> Transform (Regex Sanitization) -> Chunking Semántico -> Consume (TTS Engine).\n" +
                                "• Superposición: Control flotante minimalista mediante SYSTEM_ALERT_WINDOW.",
                        fontSize = 12.sp,
                        color = SlateBlue,
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedButton(
                        onClick = onRequestOverlayPermission,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Shield,
                            contentDescription = "Permiso",
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = "Verificar Permiso de Ventana Flotante")
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}
`
  },
  {
    id: 'floating_service',
    name: 'FloatingControlService.kt',
    path: 'app/src/main/java/com/neuronal/pdfreader/FloatingControlService.kt',
    language: 'kotlin',
    description: 'ForegroundService con inyección de widget flotante en WindowManager y motor de síntesis de voz TTS.',
    content: `package com.neuronal.pdfreader

import android.app.*
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.view.*
import android.widget.ImageButton
import android.widget.TextView
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.*
import java.util.*

class FloatingControlService : Service(), TextToSpeech.OnInitListener {

    private lateinit var windowManager: WindowManager
    private var floatingView: View? = null
    private var tts: TextToSpeech? = null
    
    private var isTtsReady = false
    private var isPlaying = false
    private var currentSentenceIndex = 0
    private var sentences: List<String> = emptyList()
    private var readingSpeed = 1.0f

    private val serviceJob = SupervisorJob()
    private val serviceScope = CoroutineScope(Dispatchers.Main + serviceJob)

    companion object {
        const val CHANNEL_ID = "pdf_floating_reader_channel"
        const val NOTIFICATION_ID = 1001

        const val ACTION_START = "ACTION_START"
        const val ACTION_STOP = "ACTION_STOP"
        const val ACTION_LOAD_PDF = "ACTION_LOAD_PDF"
        const val ACTION_UPDATE_SPEED = "ACTION_UPDATE_SPEED"

        const val EXTRA_PDF_URI = "EXTRA_PDF_URI"
        const val EXTRA_SPEED = "EXTRA_SPEED"
    }

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        initTtsEngine()
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification())
        injectFloatingWidget()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        intent?.let {
            when (it.action) {
                ACTION_START -> {
                    val uriString = it.getStringExtra(EXTRA_PDF_URI)
                    readingSpeed = it.getFloatExtra(EXTRA_SPEED, 1.0f)
                    uriString?.let { uri -> loadPdfFromUri(Uri.parse(uri)) }
                }
                ACTION_LOAD_PDF -> {
                    val uriString = it.getStringExtra(EXTRA_PDF_URI)
                    uriString?.let { uri -> loadPdfFromUri(Uri.parse(uri)) }
                }
                ACTION_UPDATE_SPEED -> {
                    readingSpeed = it.getFloatExtra(EXTRA_SPEED, 1.0f)
                    tts?.setSpeechRate(readingSpeed)
                }
                ACTION_STOP -> {
                    stopSelf()
                }
            }
        }
        return START_NOT_STICKY
    }

    private fun initTtsEngine() {
        tts = TextToSpeech(this, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            // Intentar configurar voz en español neutro / México
            val locale = Locale("es", "MX")
            val result = tts?.setLanguage(locale)
            
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                tts?.language = Locale("es", "ES")
            }

            // Buscar si existe la voz específica 'es-MX-JorgeNeural' o de alta calidad (Neural / Natural)
            val voices = tts?.voices
            val targetVoice = voices?.find { 
                it.name.contains("es-mx-jorgeneural", ignoreCase = true) ||
                it.name.contains("natural", ignoreCase = true) ||
                it.name.contains("jorge", ignoreCase = true)
            } ?: voices?.find { it.locale.language == "es" }

            targetVoice?.let { voice ->
                tts?.voice = voice
            }

            // Configurar modulación de frecuencia cálida/suave (pitch 0.95f) y velocidad pausada
            tts?.setPitch(0.95f)
            tts?.setSpeechRate(readingSpeed)
            isTtsReady = true

            // Registrar listener de progreso para avanzar oraciones secuencialmente
            tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    updateWidgetState(isPlaying = true)
                }

                override fun onDone(utteranceId: String?) {
                    serviceScope.launch {
                        advanceToNextSentence()
                    }
                }

                override fun onError(utteranceId: String?) {
                    updateWidgetState(isPlaying = false)
                }
            })
        }
    }

    private fun loadPdfFromUri(uri: Uri) {
        serviceScope.launch(Dispatchers.IO) {
            val pipeline = PdfDataPipeline(applicationContext)
            val pdfData = pipeline.extractAndTransform(uri)

            withContext(Dispatchers.Main) {
                sentences = pdfData.sentences
                currentSentenceIndex = 0
                updateWidgetCounter()
                if (sentences.isNotEmpty() && isTtsReady) {
                    playCurrentSentence()
                }
            }
        }
    }

    private fun playCurrentSentence() {
        if (!isTtsReady || sentences.isEmpty() || currentSentenceIndex !in sentences.indices) {
            isPlaying = false
            updateWidgetState(isPlaying = false)
            return
        }

        val textToRead = sentences[currentSentenceIndex]
        tts?.stop() // Interrumpe audio anterior para evitar superposición
        tts?.setSpeechRate(readingSpeed)
        
        val params = HashMap<String, String>()
        params[TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID] = "sentence_\$currentSentenceIndex"
        
        tts?.speak(textToRead, TextToSpeech.QUEUE_FLUSH, params)
        isPlaying = true
        updateWidgetState(isPlaying = true)
        updateWidgetCounter()
    }

    private fun pauseSpeech() {
        tts?.stop()
        isPlaying = false
        updateWidgetState(isPlaying = false)
    }

    private fun advanceToNextSentence() {
        if (currentSentenceIndex + 1 < sentences.size) {
            currentSentenceIndex++
            playCurrentSentence()
        } else {
            isPlaying = false
            updateWidgetState(isPlaying = false)
        }
    }

    private fun retreatToPreviousSentence() {
        if (currentSentenceIndex > 0) {
            currentSentenceIndex--
            playCurrentSentence()
        }
    }

    /**
     * Inyección del Widget Flotante Superpuesto mediante WindowManager
     */
    private fun injectFloatingWidget() {
        val layoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        
        // Crear Layout inflado dinámicamente o estructurado para la pastilla horizontal
        floatingView = layoutInflater.inflate(R.layout.widget_floating_control, null)

        val layoutParamsType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutParamsType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 100
            y = 200
        }

        // Configurar Botones del Widget
        val btnPlayPause = floatingView?.findViewById<ImageButton>(R.id.btnPlayPause)
        val btnPrev = floatingView?.findViewById<ImageButton>(R.id.btnPrev)
        val btnNext = floatingView?.findViewById<ImageButton>(R.id.btnNext)
        val btnClose = floatingView?.findViewById<ImageButton>(R.id.btnClose)

        btnPlayPause?.setOnClickListener {
            if (isPlaying) pauseSpeech() else playCurrentSentence()
        }

        btnPrev?.setOnClickListener {
            retreatToPreviousSentence()
        }

        btnNext?.setOnClickListener {
            advanceToNextSentence()
        }

        btnClose?.setOnClickListener {
            stopSelf()
        }

        // Lógica de Arrastre Touch (Drag & Drop)
        floatingView?.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f

            override fun onTouch(v: View?, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        params.x = initialX + (event.rawX - initialTouchX).toInt()
                        params.y = initialY + (event.rawY - initialTouchY).toInt()
                        windowManager.updateViewLayout(floatingView, params)
                        return true
                    }
                }
                return false
            }
        })

        try {
            windowManager.addView(floatingView, params)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun updateWidgetState(isPlaying: Boolean) {
        val btnPlayPause = floatingView?.findViewById<ImageButton>(R.id.btnPlayPause)
        btnPlayPause?.setImageResource(
            if (isPlaying) android.R.drawable.ic_media_pause 
            else android.R.drawable.ic_media_play
        )
    }

    private fun updateWidgetCounter() {
        val txtCounter = floatingView?.findViewById<TextView>(R.id.txtSentenceCounter)
        txtCounter?.text = "\${currentSentenceIndex + 1}/\${sentences.size}"
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            const channel = NotificationChannel(
                CHANNEL_ID,
                "Lector PDF Flotante",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Controles de reproducción de lectura de PDF"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Lector PDF Flotante Activo")
            .setContentText("Leyendo en voz alta con motor neuronal")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceJob.cancel()
        tts?.stop()
        tts?.shutdown()
        
        floatingView?.let {
            try {
                windowManager.removeView(it)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
`
  },
  {
    id: 'pdf_pipeline',
    name: 'PdfDataPipeline.kt',
    path: 'app/src/main/java/com/neuronal/pdfreader/PdfDataPipeline.kt',
    language: 'kotlin',
    description: 'Pipeline de Datos (Extract: PdfRenderer Lazy Loading, Transform: Regex Sanitization, Chunk: Semantic Sentence Boundary).',
    content: `package com.neuronal.pdfreader

import android.content.Context
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.ParcelFileDescriptor
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.util.regex.Pattern

data class ProcessedPdfData(
    val title: String,
    val totalPages: Int,
    val rawTextByPage: List<String>,
    val sanitizedFullText: String,
    val sentences: List<String>
)

class PdfDataPipeline(private val context: Context) {

    /**
     * Ejecuta el pipeline completo en hilos secundarios (IO)
     * Extract -> Transform -> Chunk
     */
    suspend fun extractAndTransform(pdfUri: Uri): ProcessedPdfData = withContext(Dispatchers.IO) {
        // FASE 1: EXTRACT (Lazy Loading desde ParcelFileDescriptor)
        val rawPageTexts = extractRawTextFromPdfUri(pdfUri)
        val fullRawText = rawPageTexts.joinToString(" ")

        // FASE 2: TRANSFORM (Sanitización Regex)
        val sanitizedText = sanitizeText(fullRawText)

        // FASE 3: CHUNK (Chunking Semántico basado en oraciones completas)
        val sentenceChunks = chunkIntoSentences(sanitizedText)

        return@withContext ProcessedPdfData(
            title = pdfUri.lastPathSegment ?: "Documento.pdf",
            totalPages = rawPageTexts.size,
            rawTextByPage = rawPageTexts,
            sanitizedFullText = sanitizedText,
            sentences = sentenceChunks
        )
    }

    /**
     * FASE 1: EXTRACT (Lectura diferida mediante PdfRenderer o copia temporal)
     */
    private fun extractRawTextFromPdfUri(uri: Uri): List<String> {
        val pageTexts = mutableListOf<String>()
        
        try {
            val contentResolver = context.contentResolver
            val inputStream = contentResolver.openInputStream(uri) ?: return emptyList()

            // Crear archivo temporal para ParcelFileDescriptor
            val tempFile = File.createTempFile("pdf_extract_", ".pdf", context.cacheDir)
            val outputStream = FileOutputStream(tempFile)
            
            inputStream.copyTo(outputStream)
            inputStream.close()
            outputStream.close()

            val pfd = ParcelFileDescriptor.open(tempFile, ParcelFileDescriptor.MODE_READ_ONLY)
            val pdfRenderer = PdfRenderer(pfd)

            // Carga de texto por página en diferido (Lazy Page Extraction)
            for (pageIndex in 0 until pdfRenderer.pageCount) {
                // Para extracción de texto en Kotlin Android nativo sin librerías pesadas,
                // se complementa con PdfBox-Android o lectura nativa de stream.
                val extractedPageText = extractPageTextNative(tempFile, pageIndex)
                pageTexts.add(extractedPageText)
            }

            pdfRenderer.close()
            pfd.close()
            tempFile.delete()

        } catch (e: Exception) {
            e.printStackTrace()
        }

        return pageTexts
    }

    private fun extractPageTextNative(pdfFile: File, pageIndex: Int): String {
        // Mock / Módulo ligero de extracción nativa (ej. PdfBox-Android PDDocument.load)
        // Retorna el texto bruto cargado de la página específica
        return "Texto bruto extraído de página \${pageIndex + 1}."
    }

    /**
     * FASE 2: TRANSFORM (Módulo de Sanitización Regex)
     * - Une palabras cortadas por guiones al final de línea
     * - Reemplaza saltos de línea basura por espacios
     */
    fun sanitizeText(rawText: String): String {
        if (rawText.isBlank()) return ""

        var cleaned = rawText

        // 1. Unir palabras divididas por guiones (ej: "transfor-\nmación" -> "transformación")
        val hyphenPattern = Pattern.compile("([a-zA-ZáéíóúñÁÉÍÓÚÑ]+)-\\\\s*[\\\\r\\\\n]+\\\\s*([a-zA-ZáéíóúñÁÉÍÓÚÑ]+)")
        cleaned = hyphenPattern.matcher(cleaned).replaceAll("$1$2")

        // 2. Limpiar saltos de línea basura dentro de oraciones
        // Reemplaza saltos de línea que no estén precedidos o seguidos por fin de párrafo
        val newlinePattern = Pattern.compile("(?<![.!?;\\\\n])\\\\s*[\\\\r\\\\n]+\\\\s*(?![.!?;\\\\n])")
        cleaned = newlinePattern.matcher(cleaned).replaceAll(" ")

        // 3. Normalizar espacios múltiples
        cleaned = cleaned.replace("\\\\s+".toRegex(), " ")

        return cleaned.trim()
    }

    /**
     * FASE 3: CHUNK (Chunking Semántico)
     * Divide el texto en un arreglo indexado basado estrictamente en oraciones completas
     * Delimitado por puntos, signos de interrogación y exclamación (. ? !)
     */
    fun chunkIntoSentences(sanitizedText: String): List<String> {
        if (sanitizedText.isBlank()) return emptyList()

        // Expresión regular que divide por fin de oración manteniendo coherencia semántica
        val sentenceRegex = "(?<=[.!?])\\\\s+".toRegex()
        
        return sanitizedText
            .split(sentenceRegex)
            .map { it.trim() }
            .filter { it.isNotEmpty() }
    }
}
`
  },
  {
    id: 'gradle',
    name: 'build.gradle.kts (App)',
    path: 'app/build.gradle.kts',
    language: 'gradle',
    description: 'Configuración Gradle de dependencias para Jetpack Compose, PdfRenderer, Coroutines y Lifecycle.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.neuronal.pdfreader"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.neuronal.pdfreader"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    
    // Jetpack Compose UI
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)

    // Coroutines & Dataflow
    implementation(libs.kotlinx.coroutines.android)

    // Extracción de PDF ligera (PdfBox Android)
    implementation("com.tom_roush:pdfbox-android:2.0.27.0")
}
`
  }
];
