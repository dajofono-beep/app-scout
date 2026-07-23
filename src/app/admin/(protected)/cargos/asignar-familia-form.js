"use client";

import { useState } from "react";
import { crearCargoPorFamilia } from "./actions";
import { etiquetaProducto } from "./utils";

const hoy = () => new Date().toISOString().slice(0, 10);

export default function AsignarCargoFamiliaForm({ familias, productos }) {
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
      const r = await crearCargoPorFamilia(formData);
      setResultado(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded shadow p-4">
      <h2 className="font-semibold mb-3">Asignar a toda una familia</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <select
          name="familia_id"
          required
          defaultValue=""
          className="border rounded px-3 py-2 sm:col-span-2"
        >
          <option value="" disabled>
            Familia...
          </option>
          {familias.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nombre}
            </option>
          ))}
        </select>
        <select name="producto_id" required defaultValue="" className="border rounded px-3 py-2">
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
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-4 bg-blue-600 text-white rounded py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Asignando..." : "Asignar a toda la familia"}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-2">
        Si el producto tiene activado &quot;descuento por hermanos&quot;, el
        importe de cada integrante se calcula según su orden dentro de la
        familia (ver sección Descuentos). Si es cuotable, la fecha elegida es
        la de la primera cuota; las siguientes se generan una por mes.
      </p>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
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
