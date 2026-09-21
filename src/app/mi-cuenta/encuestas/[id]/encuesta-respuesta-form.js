"use client";

import { useState } from "react";
import { responderEncuesta } from "../actions";

export default function EncuestaRespuestaForm({
  encuestaId,
  tipoRespuesta,
  opciones,
  respuestaActual,
  cerrada,
}) {
  const [respuesta, setRespuesta] = useState(respuestaActual);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setExito(false);
    setLoading(true);

    const formData = new FormData();
    formData.set("encuesta_id", encuestaId);
    formData.set("respuesta", respuesta);

    try {
      const resultado = await responderEncuesta(formData);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setExito(true);
    } catch {
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (cerrada) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-500">
        Esta encuesta ya cerró{respuestaActual ? ` — tu respuesta fue "${respuestaActual}"` : ""}.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {tipoRespuesta === "opcion_unica" ? (
        <div className="space-y-2">
          {opciones.map((opcion) => (
            <label
              key={opcion}
              className={`flex items-center gap-2.5 border rounded-xl px-4 py-2.5 cursor-pointer ${
                respuesta === opcion
                  ? "border-sky-400 bg-sky-50"
                  : "border-slate-200"
              }`}
            >
              <input
                type="radio"
                name="respuesta"
                value={opcion}
                checked={respuesta === opcion}
                onChange={(e) => setRespuesta(e.target.value)}
                className="accent-sky-600"
              />
              <span className="text-sm text-slate-700">{opcion}</span>
            </label>
          ))}
        </div>
      ) : (
        <textarea
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          rows={4}
          placeholder="Tu respuesta..."
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      )}

      {exito && (
        <p className="text-sm text-emerald-700 font-semibold">¡Gracias por tu respuesta!</p>
      )}
      {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

      <button
        type="submit"
        disabled={loading || !respuesta}
        className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
      >
        {loading ? "Enviando..." : respuestaActual ? "Actualizar respuesta" : "Responder"}
      </button>
    </form>
  );
}
