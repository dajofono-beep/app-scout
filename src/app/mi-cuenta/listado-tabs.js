"use client";

import { useState } from "react";

const BOTONES = [
  { id: "todos", texto: "Todos" },
  { id: "cargos", texto: "Cargos" },
  { id: "pagos", texto: "Pagos" },
];

export default function ListadoTabs({ panelTodos, panelCargos, panelPagos }) {
  const [vista, setVista] = useState("todos");

  return (
    <div>
      <div className="flex gap-1.5 mb-3">
        {BOTONES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setVista(b.id)}
            className={`flex-1 text-xs font-bold rounded-xl py-1.5 px-1 border transition-colors ${
              vista === b.id
                ? "bg-sky-50 border-sky-600 text-sky-700"
                : "bg-white border-slate-200 text-slate-500"
            }`}
          >
            {b.texto}
          </button>
        ))}
      </div>

      <div className={vista === "todos" ? "" : "hidden"}>{panelTodos}</div>
      <div className={vista === "cargos" ? "" : "hidden"}>{panelCargos}</div>
      <div className={vista === "pagos" ? "" : "hidden"}>{panelPagos}</div>
    </div>
  );
}
