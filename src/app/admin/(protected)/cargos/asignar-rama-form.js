"use client";

import { useState } from "react";
import { crearCargoPorRama } from "./actions";
import { etiquetaProducto } from "./utils";

const hoy = () => new Date().toISOString().slice(0, 10);

export default function AsignarCargoRamaForm({ ramas, productos }) {
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResultado(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const r = await crearCargoPorRama(formData);
      setResultado(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="font-bold mb-3">Asignar a toda una rama</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <select
          name="rama_id"
          required
          defaultValue=""
          className="border border-slate-200 rounded-xl px-4 py-2.5 sm:col-span-2"
        >
          <option value="" disabled>
            Rama...
          </option>
          {ramas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
        <select name="producto_id" required defaultValue="" className="border border-slate-200 rounded-xl px-4 py-2.5">
          <option value="" disabled>
            Producto...
          </option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {etiquetaProducto(p)}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="fecha"
          required
          defaultValue={hoy()}
          className="border border-slate-200 rounded-xl px-4 py-2.5"
        />
        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-4 bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
        >
          {loading ? "Asignando..." : "Asignar a toda la rama"}
        </button>
      </form>

      {error && <p className="text-sm text-red-500 font-semibold mt-2">{error}</p>}
      {resultado && (
        <div className="text-sm mt-3 space-y-1">
          <p className="text-green-700">{resultado.creados} cargo(s) asignado(s).</p>
          {resultado.salteados.length > 0 && (
            <p className="text-amber-700">
              Ya tenían este producto (se salteó): {resultado.salteados.join(", ")}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
