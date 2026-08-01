"use client";

export default function ExportarForm({ ramas }) {
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

      <button
        type="submit"
        className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold"
      >
        Exportar
      </button>
    </form>
  );
}
