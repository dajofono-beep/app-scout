"use client";

import { useState } from "react";

export default function ExportarPdfForm({ encuestaId }) {
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-sm font-semibold text-sky-600 hover:underline"
      >
        Exportar resultados a PDF
      </button>
    );
  }

  return (
    <form
      action={`/admin/encuestas/${encuestaId}/exportar`}
      method="POST"
      className="border border-slate-100 rounded-xl p-4 space-y-3"
    >
      <p className="text-sm font-semibold text-slate-600">Exportar resultados a PDF</p>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" name="incluir_nomina" defaultChecked />
        Incluir nómina de quiénes respondieron y quiénes faltan
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-sky-600 text-white rounded-full px-4 py-2 text-sm font-bold"
        >
          Descargar PDF
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="text-sm font-semibold text-slate-500"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
