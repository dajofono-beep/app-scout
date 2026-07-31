"use client";

import { useState } from "react";
import { crearCargoIndividual } from "../../cargos/actions";
import { etiquetaProducto } from "../../cargos/utils";

const hoy = () => new Date().toISOString().slice(0, 10);

export default function AsignarCargoIndividualForm({ miembroId, productos }) {
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setError(null);
    setOk(false);
    setLoading(true);

    const formData = new FormData(formEl);
    try {
      await crearCargoIndividual(formData);
      setOk(true);
      formEl.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="font-bold mb-3">Asignar concepto</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input type="hidden" name="miembro_id" value={miembroId} />
        <select
          name="producto_id"
          required
          defaultValue=""
          className="border border-slate-200 rounded-xl px-4 py-2.5 sm:col-span-2"
        >
          <option value="" disabled>
            Concepto...
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
          className="sm:col-span-3 bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
        >
          {loading ? "Asignando..." : "Asignar"}
        </button>
      </form>

      {error && <p className="text-sm text-red-500 font-semibold mt-2">{error}</p>}
      {ok && <p className="text-sm text-emerald-700 mt-2">Concepto asignado.</p>}
    </section>
  );
}
