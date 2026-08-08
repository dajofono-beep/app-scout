"use client";

import { useState } from "react";
import Link from "next/link";
import { guardarMediosPago } from "./actions";

export default function MediosPagoForm({ medios }) {
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
      await guardarMediosPago(formData);
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
        {medios.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl px-4 py-3"
          >
            <label className="flex items-center gap-3 flex-1">
              <input
                type="checkbox"
                name={`habilitado_${m.id}`}
                defaultChecked={m.habilitado}
              />
              <span className="font-semibold text-slate-700">{m.nombre}</span>
            </label>
            {m.id === "mercado_pago" && (
              <Link
                href="/admin/medios-pago/mercado-pago"
                className="text-xs text-sky-600 font-semibold hover:underline shrink-0"
              >
                Configurar →
              </Link>
            )}
          </div>
        ))}
        {medios.length === 0 && (
          <p className="text-sm text-slate-500">
            Todavía no hay medios de pago cargados.
          </p>
        )}
      </div>

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
