"use client";

import { useState } from "react";
import { guardarGruposPadres } from "./actions";

export default function GruposPadresForm({ ramas, visibleInicial }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guardado, setGuardado] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setGuardado(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await guardarGruposPadres(formData);
      setGuardado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
    >
      <div className="space-y-3">
        {ramas.map((r) => (
          <div key={r.id}>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              {r.nombre}
            </label>
            <input
              name={`link_${r.id}`}
              type="url"
              defaultValue={r.link}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            />
          </div>
        ))}
        {ramas.length === 0 && (
          <p className="text-sm text-slate-500">
            No hay ramas cargadas todavía (aparte de Adultos).
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 border-t border-slate-100 pt-4">
        <input type="checkbox" name="visible" defaultChecked={visibleInicial} />
        Mostrar esta información en Mensajes (Mi Cuenta)
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar"}
      </button>

      {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
      {guardado && (
        <p className="text-sm text-emerald-700 font-semibold">Guardado.</p>
      )}
    </form>
  );
}
