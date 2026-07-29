"use client";

import { useState } from "react";
import {
  cancelarCargosPorFamilia,
  cancelarCargosPorRama,
  cancelarCargosPorMiembro,
} from "./actions";
import { etiquetaProducto } from "./utils";

export default function CancelarCargosForm({ familias, ramas, miembros, productos }) {
  const [tipo, setTipo] = useState(familias.length > 0 ? "familia" : "rama");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResultado(null);

    const formData = new FormData(e.currentTarget);

    const productoId = formData.get("producto_id")?.toString();
    const productoTexto =
      productoId === "todos"
        ? "todos los productos"
        : (productos.find((p) => p.id === productoId)?.nombre ?? "el producto elegido");

    let destinatarioTexto = "el destinatario elegido";
    if (tipo === "familia") {
      const id = formData.get("familia_id")?.toString();
      const f = familias.find((familia) => familia.id === id);
      destinatarioTexto = `los hermanos ${f?.nombre ?? ""}`;
    } else if (tipo === "rama") {
      const id = formData.get("rama_id")?.toString();
      const r = ramas.find((rama) => rama.id === id);
      destinatarioTexto = `la rama ${r?.nombre ?? ""}`;
    } else {
      const id = formData.get("miembro_id")?.toString();
      const m = miembros.find((miembro) => miembro.id === id);
      destinatarioTexto = m ? `${m.apellido}, ${m.nombre}` : destinatarioTexto;
    }

    const confirmado = window.confirm(
      `¿Confirmás cancelar ${productoTexto} para ${destinatarioTexto}? Esta acción se puede revertir después, cargo por cargo.`
    );
    if (!confirmado) return;

    setLoading(true);
    try {
      if (tipo === "familia") {
        setResultado(await cancelarCargosPorFamilia(formData));
      } else if (tipo === "rama") {
        setResultado(await cancelarCargosPorRama(formData));
      } else {
        setResultado(await cancelarCargosPorMiembro(formData));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="font-bold mb-3">Cancelación de Cargos</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5"
        >
          {familias.length > 0 && <option value="familia">Hermanos</option>}
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
              Hermanos...
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
          <option value="todos">Todos</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {etiquetaProducto(p)}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-3 border border-red-300 text-red-600 rounded-full py-2.5 font-bold disabled:opacity-50"
        >
          {loading ? "Cancelando..." : "Cancelar cargos"}
        </button>
      </form>

      <p className="text-xs text-slate-500 mt-2">
        Cancela todos los cargos activos de ese producto para los elegidos
        (incluidas todas las cuotas pendientes si es cuotable). Se pueden
        reactivar de a uno desde la ficha de cada cargo.
      </p>

      {error && <p className="text-sm text-red-500 font-semibold mt-2">{error}</p>}
      {resultado && (
        <p className="text-sm mt-3 text-emerald-700">
          {resultado.cancelados} cargo(s) cancelado(s) en {resultado.miembrosAfectados}{" "}
          participante(s).
        </p>
      )}
    </section>
  );
}
