"use client";

import { useState } from "react";
import { preguntarConsulta } from "./consultas-actions";

export default function Consultas() {
  const [historial, setHistorial] = useState([]);
  const [pregunta, setPregunta] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function enviar(e) {
    e.preventDefault();
    const texto = pregunta.trim();
    if (!texto || loading) return;

    setError(null);
    const nuevoHistorial = [...historial, { rol: "usuario", texto }];
    setHistorial(nuevoHistorial);
    setPregunta("");
    setLoading(true);

    try {
      const resultado = await preguntarConsulta(nuevoHistorial);
      if (!resultado.ok) {
        setError(resultado.error);
      } else {
        setHistorial((h) => [...h, { rol: "asistente", texto: resultado.texto }]);
      }
    } catch (err) {
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm p-5">
      <p className="font-bold text-slate-800 mb-1">Consultas</p>
      <p className="text-xs text-slate-400 mb-3">
        Puede cometer errores — confirmá lo importante con la comisión.
      </p>

      <div className="space-y-3 max-h-[24rem] overflow-y-auto mb-3">
        {historial.length === 0 && (
          <p className="text-slate-500 text-sm">
            Preguntá lo que quieras sobre el grupo (fechas, campamentos, plan
            económico...).
          </p>
        )}
        {historial.map((m, i) => (
          <div key={i} className={`flex ${m.rol === "usuario" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.rol === "usuario"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {m.texto}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm bg-slate-100 text-slate-400">
              Pensando...
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500 font-semibold mb-2">{error}</p>}

      <form onSubmit={enviar} className="flex gap-2">
        <input
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder="Escribí tu pregunta..."
          disabled={loading}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={loading || !pregunta.trim()}
          className="bg-sky-600 text-white rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}
