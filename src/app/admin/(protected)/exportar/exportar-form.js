"use client";

import { useState } from "react";

export default function ExportarForm({ ramas, productos }) {
  const [seleccionados, setSeleccionados] = useState(() => new Set());

  function alternar(id) {
    setSeleccionados((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  }

  return (
    <form
      action="/admin/exportar/descargar"
      method="POST"
      className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
    >
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Rama
        </label>
        <select
          name="rama_id"
          defaultValue="todas"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        >
          <option value="todas">Todas</option>
          {ramas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-semibold text-slate-600">
            Conceptos
          </label>
          <div className="flex gap-3 text-xs font-semibold text-sky-600">
            <button
              type="button"
              onClick={() => setSeleccionados(new Set(productos.map((p) => p.id)))}
            >
              Marcar todos
            </button>
            <button type="button" onClick={() => setSeleccionados(new Set())}>
              Desmarcar todos
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Si no tildás ninguno, se exportan todos los conceptos.
        </p>
        <div className="border border-slate-200 rounded-xl divide-y max-h-64 overflow-y-auto">
          {productos.map((p) => (
            <label
              key={p.id}
              className="flex items-center gap-2 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                name="producto_id"
                value={p.id}
                checked={seleccionados.has(p.id)}
                onChange={() => alternar(p.id)}
              />
              {p.nombre}
              {!p.activo && (
                <span className="text-xs text-slate-400">(inactivo)</span>
              )}
            </label>
          ))}
          {productos.length === 0 && (
            <p className="text-sm text-slate-500 p-3">Todavía no hay conceptos.</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold"
      >
        Exportar
      </button>
    </form>
  );
}
