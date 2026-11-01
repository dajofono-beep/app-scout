"use client";

import { useState } from "react";
import { marcarMensajeLeido } from "./mensajes-actions";

export default function BotonMensajeLeido({ mensajeId, leidoInicial }) {
  const [leido, setLeido] = useState(leidoInicial);
  const [enCurso, setEnCurso] = useState(false);
  const [error, setError] = useState(null);

  async function alternar() {
    const nuevo = !leido;
    setLeido(nuevo);
    setError(null);
    setEnCurso(true);
    try {
      const resultado = await marcarMensajeLeido(mensajeId, nuevo);
      if (!resultado.ok) {
        setLeido(!nuevo);
        setError(resultado.error);
      }
    } catch {
      setLeido(!nuevo);
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setEnCurso(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={alternar}
        disabled={enCurso}
        aria-pressed={leido}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition disabled:opacity-60 ${
          leido
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-white border-slate-200 text-slate-600"
        }`}
      >
        <span
          aria-hidden="true"
          className={`grid place-items-center w-4 h-4 rounded-full text-[10px] leading-none ${
            leido ? "bg-emerald-600 text-white" : "border border-slate-300 text-transparent"
          }`}
        >
          ✓
        </span>
        {leido ? "Leído" : "Marcar como leído"}
      </button>
      {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
    </div>
  );
}
