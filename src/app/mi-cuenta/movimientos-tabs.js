"use client";

import { useState } from "react";

const BOTONES = [
  { id: "listado", texto: "Listado" },
  { id: "cobertura", texto: "Pagos vs. Cargos" },
  { id: "detalle", texto: "Detalle de cargos" },
];

export default function MovimientosTabs({ panelListado, panelCobertura, panelDetalle }) {
  const [vista, setVista] = useState("listado");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {BOTONES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setVista(b.id)}
            className={`flex-1 text-xs sm:text-sm font-medium rounded-lg py-2 px-1 ${
              vista === b.id ? "bg-blue-600 text-white" : "bg-white text-gray-600 shadow"
            }`}
          >
            {b.texto}
          </button>
        ))}
      </div>

      <div className={vista === "listado" ? "" : "hidden"}>{panelListado}</div>
      <div className={vista === "cobertura" ? "" : "hidden"}>
        <div className="bg-white rounded-lg shadow p-4">{panelCobertura}</div>
      </div>
      <div className={vista === "detalle" ? "" : "hidden"}>
        <div className="bg-white rounded-lg shadow p-4">{panelDetalle}</div>
      </div>
    </div>
  );
}
