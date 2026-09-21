"use client";

import { useState } from "react";

// participantes: [{ clave, nombre, ramaNombre, respuesta }], ya ordenados
// por rama y después por nombre. "respuesta" es opcional (la lista de
// quienes faltan no tiene una que mostrar).
export default function ParticipantesToggle({
  participantes,
  etiqueta = "Ver participantes de la encuesta",
  etiquetaOculta = "Ocultar participantes",
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="text-sm font-semibold text-sky-600 hover:underline"
      >
        {abierto ? etiquetaOculta : etiqueta} ({participantes.length})
      </button>

      {abierto && (
        <ul className="mt-2 space-y-1">
          {participantes.map((p) => (
            <li key={p.clave} className="text-sm text-slate-700 flex justify-between gap-2">
              <span>
                {p.nombre}
                <span className="text-slate-400"> · {p.ramaNombre ?? "—"}</span>
              </span>
              <span className="text-slate-400 shrink-0">{p.respuesta}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
