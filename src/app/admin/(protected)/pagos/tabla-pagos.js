"use client";

import { useState } from "react";
import Link from "next/link";
import { confirmarPago, confirmarPagos } from "./actions";
import FiltrosPagos from "./filtros";
import { iniciales, colorPara } from "../miembros/avatar";

const ETIQUETA_ESTADO = {
  pendiente: { texto: "Pendiente", clase: "bg-amber-100 text-amber-800" },
  acreditado: { texto: "Acreditado", clase: "bg-green-100 text-green-800" },
  cancelado: { texto: "Cancelado", clase: "bg-slate-200 text-slate-600" },
};

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export default function TablaPagos({ pagos, valores }) {
  const [seleccionados, setSeleccionados] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pendientes = pagos.filter((p) => p.estado_efectivo === "pendiente");
  const todosMarcados =
    pendientes.length > 0 && pendientes.every((p) => seleccionados.has(p.id));

  function alternar(id) {
    setSeleccionados((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  }

  function alternarTodos() {
    setSeleccionados(
      todosMarcados ? new Set() : new Set(pendientes.map((p) => p.id))
    );
  }

  async function confirmarSeleccionados() {
    setError(null);
    setLoading(true);
    const formData = new FormData();
    for (const id of seleccionados) formData.append("id", id);
    try {
      await confirmarPagos(formData);
      setSeleccionados(new Set());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {seleccionados.size > 0 && (
        <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 mb-3">
          <p className="text-sm font-semibold text-sky-800">
            {seleccionados.size} pago{seleccionados.size === 1 ? "" : "s"} seleccionado
            {seleccionados.size === 1 ? "" : "s"}
          </p>
          <button
            type="button"
            onClick={confirmarSeleccionados}
            disabled={loading}
            className="bg-sky-600 text-white rounded-full px-4 py-1.5 text-sm font-bold disabled:opacity-50"
          >
            {loading ? "Confirmando..." : "Confirmar seleccionados"}
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-500 font-semibold mb-2">{error}</p>}

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="p-3 w-8">
                {pendientes.length > 0 && (
                  <input
                    type="checkbox"
                    checked={todosMarcados}
                    onChange={alternarTodos}
                    aria-label="Seleccionar todos los pendientes"
                  />
                )}
              </th>
              <th className="p-3 font-bold">Miembro</th>
              <th className="p-3 font-bold">Importe</th>
              <th className="p-3 font-bold">Fecha</th>
              <th className="p-3 font-bold">Medio</th>
              <th className="p-3 font-bold">Estado</th>
              <th className="p-3"></th>
            </tr>
            <FiltrosPagos valores={valores} />
          </thead>
          <tbody>
            {pagos.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-3">
                  {p.estado_efectivo === "pendiente" && (
                    <input
                      type="checkbox"
                      checked={seleccionados.has(p.id)}
                      onChange={() => alternar(p.id)}
                      aria-label={`Seleccionar pago de ${p.miembros?.apellido}, ${p.miembros?.nombre}`}
                    />
                  )}
                </td>
                <td className="p-3">
                  <Link href={`/admin/pagos/${p.id}`} className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${colorPara(p.miembros?.rama_id)}`}
                    >
                      {iniciales(p.miembros?.nombre, p.miembros?.apellido)}
                    </span>
                    <span className="font-medium text-slate-900">
                      {p.miembros?.apellido}, {p.miembros?.nombre}
                    </span>
                  </Link>
                </td>
                <td className="p-3 font-semibold">{formatoMoneda(p.importe)}</td>
                <td className="p-3 text-slate-600">{p.fecha_pago}</td>
                <td className="p-3 text-slate-600">{p.medio_pago || "—"}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${ETIQUETA_ESTADO[p.estado_efectivo].clase}`}
                  >
                    {ETIQUETA_ESTADO[p.estado_efectivo].texto}
                  </span>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  {p.estado_efectivo === "pendiente" && (
                    <form action={confirmarPago} className="inline">
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="text-green-700 hover:underline text-sm mr-3"
                      >
                        Confirmar
                      </button>
                    </form>
                  )}
                  <Link
                    href={`/admin/pagos/${p.id}`}
                    className="text-sky-600 hover:underline text-sm"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pagos.length === 0 && (
          <p className="text-slate-500 text-sm p-4">
            No hay pagos para este filtro.
          </p>
        )}
      </div>
    </div>
  );
}
