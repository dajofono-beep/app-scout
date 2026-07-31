"use client";

import { useState } from "react";

const BOTONES = [
  { id: "datos", texto: "Datos Generales" },
  { id: "cargos", texto: "Cargos" },
];

export default function FichaMiembroTabs({ panelDatos, panelCargos }) {
  const [vista, setVista] = useState("datos");

  return (
    <div>
      <div className="flex gap-1.5 mb-4">
        {BOTONES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setVista(b.id)}
            className={`flex-1 text-sm font-bold rounded-2xl py-2 px-1 border transition-colors ${
              vista === b.id
                ? "bg-sky-50 border-sky-600 text-sky-700"
                : "bg-white border-slate-200 text-slate-500"
            }`}
          >
            {b.texto}
          </button>
        ))}
      </div>

      <div className={vista === "datos" ? "" : "hidden"}>{panelDatos}</div>
      <div className={vista === "cargos" ? "" : "hidden"}>{panelCargos}</div>
    </div>
  );
}
