"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { CONTEXTO_DOCUMENTOS } from "@/lib/consultas/contexto";

const INSTRUCCION_SISTEMA = `Sos el asistente virtual del Grupo Scout Libertador San Martín.
Respondé las preguntas de las familias del grupo usando ÚNICAMENTE la
información de los documentos que te paso a continuación (el Proyecto
Educativo de Scouts de Argentina y las reuniones de padres 2025 y
2026). Si la respuesta no está en esos documentos, decilo con
claridad en vez de inventar algo. Respondé siempre en español, de
forma breve y clara.

${CONTEXTO_DOCUMENTOS}`;

// historial: [{ rol: "usuario" | "asistente", texto }], con la pregunta
// nueva como último elemento. Devuelve { ok, texto } o { ok: false, error }
// en vez de tirar una excepción: Next.js borra el mensaje de cualquier
// error lanzado con `throw` desde un Server Action en producción (por
// seguridad), así que un valor de retorno normal es la única forma de
// que el mensaje llegue tal cual al chat.
export async function preguntarConsulta(historial) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "El asistente todavía no está configurado. Avisale al administrador del grupo.",
    };
  }
  if (!Array.isArray(historial) || historial.length === 0) {
    return { ok: false, error: "Falta la pregunta" };
  }

  const ultimo = historial[historial.length - 1];
  const previos = historial.slice(0, -1);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Google retira modelos viejos con el tiempo (gemini-2.5-flash ya no
    // está disponible para cuentas nuevas) — si esto vuelve a fallar con
    // un 404, hay que revisar el modelo vigente en ai.google.dev/gemini-api/docs/latest-model.
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: INSTRUCCION_SISTEMA,
    });
    const chat = model.startChat({
      history: previos.map((m) => ({
        role: m.rol === "asistente" ? "model" : "user",
        parts: [{ text: m.texto }],
      })),
    });
    const resultado = await chat.sendMessage(ultimo.texto);
    return { ok: true, texto: resultado.response.text() };
  } catch (err) {
    console.error("preguntarConsulta:", err);
    return {
      ok: false,
      error: "No se pudo conectar con el asistente. Intentá de nuevo en un momento.",
    };
  }
}
