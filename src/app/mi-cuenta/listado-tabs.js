"use client";

import { useState } from "react";

export default function ListadoTabs({ panelTodos, panelCargos, panelPagos }) {
  const [vista, setVista] = useState("todos");

  return (
    <div>
      <div className="mb-3">
        <label className="block text-xs font-semibold text-slate-500 mb-1">
          Tipo de movimiento
        </label>
        <select
          value={vista}
          onChange={(e) => setVista(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-sm font-semibold text-slate-700"
        >
          <option value="todos">Todos</option>
          <option value="cargos">Cargos</option>
          <option value="pagos">Pagos</option>
        </select>
      </div>

      <div className={vista === "todos" ? "" : "hidden"}>{panelTodos}</div>
      <div className={vista === "cargos" ? "" : "hidden"}>{panelCargos}</div>
      <div className={vista === "pagos" ? "" : "hidden"}>{panelPagos}</div>
    </div>
  );
}
