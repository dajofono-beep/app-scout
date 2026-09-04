"use client";

import { useState } from "react";

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const ETIQUETA_ESTADO = {
  pendiente: { texto: "Pendiente", clase: "bg-amber-50 text-amber-700" },
  acreditado: { texto: "Acreditado", clase: "bg-emerald-50 text-emerald-700" },
  cancelado: { texto: "Cancelado", clase: "bg-slate-100 text-slate-500" },
};

function formatoFechaActividad(iso) {
  const fecha = new Date(iso);
  const hora = fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  const hoyStr = new Date().toDateString();
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  if (fecha.toDateString() === hoyStr) return `Hoy ${hora}`;
  if (fecha.toDateString() === ayer.toDateString()) return `Ayer ${hora}`;
  return fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

// `movimientos` ya viene ordenado del más reciente al más viejo, con
// hasta 10 elementos (el máximo que ofrece el desplegable).
export default function ActividadReciente({ movimientos }) {
  const [cantidad, setCantidad] = useState(3);
  const visibles = movimientos.slice(0, cantidad);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <img
            src="/Dashboard/Actividad reciente.png"
            alt=""
            className="w-7 h-7 object-contain"
          />
          <p className="text-sm font-bold text-sky-700">Actividad reciente</p>
        </div>
        <select
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-full px-2 py-1"
        >
          <option value={3}>Últimos 3</option>
          <option value={5}>Últimos 5</option>
          <option value={10}>Últimos 10</option>
        </select>
      </div>
      <div className="space-y-3">
        {visibles.map((p) => (
          <div key={p.id} className="flex items-center gap-3 text-sm">
            <span className="text-xs text-slate-400 w-16 shrink-0">
              {formatoFechaActividad(p.created_at)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800 truncate">
                {p.miembros?.apellido}, {p.miembros?.nombre}
              </p>
              <p className="text-xs text-slate-400">Pago registrado</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-slate-800">{formatoMoneda(p.importe)}</p>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ETIQUETA_ESTADO[p.estado_efectivo].clase}`}
              >
                {ETIQUETA_ESTADO[p.estado_efectivo].texto}
              </span>
            </div>
          </div>
        ))}
        {visibles.length === 0 && (
          <p className="text-sm text-slate-400">Todavía no hay pagos.</p>
        )}
      </div>
    </div>
  );
}
