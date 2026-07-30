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
// nueva como último elemento.
export async function preguntarConsulta(historial) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "El asistente todavía no está configurado. Avisale al administrador del grupo."
    );
  }
  if (!Array.isArray(historial) || historial.length === 0) {
    throw new Error("Falta la pregunta");
  }

  const ultimo = historial[historial.length - 1];
  const previos = historial.slice(0, -1);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: INSTRUCCION_SISTEMA,
  });

  try {
    const chat = model.startChat({
      history: previos.map((m) => ({
        role: m.rol === "asistente" ? "model" : "user",
        parts: [{ text: m.texto }],
      })),
    });
    const resultado = await chat.sendMessage(ultimo.texto);
    return resultado.response.text();
  } catch (err) {
    throw new Error("No se pudo conectar con el asistente. Intentá de nuevo en un momento.");
  }
}
