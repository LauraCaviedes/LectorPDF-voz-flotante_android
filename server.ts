import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Lector PDF Flotante Neuronal API" });
  });

  // Optional endpoint to enhance text or generate neural voice script via Gemini
  app.post("/api/gemini/summarize-or-clean", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({ 
          fallback: true, 
          message: "GEMINI_API_KEY no configurado en servidor; utilizando pipeline Regex local." 
        });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Eres un asistente de síntesis de voz neuronal. Limpia el siguiente texto extraído de un PDF, corrigiendo palabras cortadas por guiones, eliminando encabezados y números de página irrelevantes, y asegúrate de que las oraciones estén perfectamente formadas para ser leídas en voz alta en español (es-MX):\n\n${text.slice(0, 3000)}`,
      });

      res.json({ cleanedText: response.text });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error.message || "Error procesando con Gemini" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Lector PDF Flotante] Servidor ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

startServer();
