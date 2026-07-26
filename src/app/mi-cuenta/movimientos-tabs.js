"use client";

import { useState } from "react";

const BOTONES = [
  { id: "listado", texto: "Listado" },
  { id: "cobertura", texto: "Pagos/Cargos" },
  { id: "detalle", texto: "Detalle de cargos" },
];

export default function MovimientosTabs({ panelListado, panelCobertura, panelDetalle }) {
  const [vista, setVista] = useState("listado");

  return (
    <div>
      <div className="flex gap-1.5 mb-4">
        {BOTONES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setVista(b.id)}
            className={`flex-1 text-xs sm:text-sm font-bold rounded-2xl py-2 px-1 border transition-colors ${
              vista === b.id
                ? "bg-sky-50 border-sky-600 text-sky-700"
                : "bg-white border-slate-200 text-slate-500"
            }`}
          >
            {b.texto}
          </button>
        ))}
      </div>

      <div className={vista === "listado" ? "" : "hidden"}>{panelListado}</div>
      <div className={vista === "cobertura" ? "" : "hidden"}>{panelCobertura}</div>
      <div className={vista === "detalle" ? "" : "hidden"}>
        <div className="bg-white rounded-2xl shadow-sm p-5">{panelDetalle}</div>
      </div>
    </div>
  );
}
