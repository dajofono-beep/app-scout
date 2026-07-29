"use client";

import { useState } from "react";
import { crearCargoPorFamilia, crearCargoPorRama, crearCargoIndividual } from "./actions";
import { etiquetaProducto } from "./utils";

const hoy = () => new Date().toISOString().slice(0, 10);

export default function AsignarCargoForm({ familias, ramas, miembros, productos }) {
  const [tipo, setTipo] = useState(familias.length > 0 ? "familia" : "rama");
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
      if (tipo === "familia") {
        setResultado(await crearCargoPorFamilia(formData));
      } else if (tipo === "rama") {
        setResultado(await crearCargoPorRama(formData));
      } else {
        await crearCargoIndividual(formData);
        setResultado({ creados: 1, salteados: [] });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="font-bold mb-3">Asignar cargo</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5"
        >
          {familias.length > 0 && <option value="familia">Familia</option>}
          <option value="rama">Rama</option>
          <option value="miembro">Participante</option>
        </select>

        {tipo === "familia" && (
          <select
            name="familia_id"
            required
            defaultValue=""
            className="border border-slate-200 rounded-xl px-4 py-2.5"
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
        )}
        {tipo === "rama" && (
          <select
            name="rama_id"
            required
            defaultValue=""
            className="border border-slate-200 rounded-xl px-4 py-2.5"
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
        )}
        {tipo === "miembro" && (
          <select
            name="miembro_id"
            required
            defaultValue=""
            className="border border-slate-200 rounded-xl px-4 py-2.5"
          >
            <option value="" disabled>
              Participante...
            </option>
            {miembros.map((m) => (
              <option key={m.id} value={m.id}>
                {m.apellido}, {m.nombre}
              </option>
            ))}
          </select>
        )}

        <select
          name="producto_id"
          required
          defaultValue=""
          className="border border-slate-200 rounded-xl px-4 py-2.5"
        >
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
          {loading ? "Asignando..." : "Asignar cargo"}
        </button>
      </form>

      <p className="text-xs text-slate-500 mt-2">
        Si el producto tiene activado &quot;descuento por hermanos&quot; y
        elegís Familia, el importe de cada integrante se calcula según su
        orden dentro de la familia (ver sección Descuentos). Si es cuotable,
        la fecha elegida es la de la primera cuota; las siguientes se generan
        una por mes.
      </p>

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
