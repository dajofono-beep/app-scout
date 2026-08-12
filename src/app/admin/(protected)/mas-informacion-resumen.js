"use client";

import { useState } from "react";
import Link from "next/link";

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export default function MasInformacionResumen({
  familiasEnRiesgo,
  pagosPendientesCount,
  acreditadoPorMedioOrdenado,
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="mb-4">
      {abierto && (
        <div className="space-y-4 mb-3">
          <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-bold text-slate-400 mb-1">
                Riesgo de no poder participar del próximo evento
              </p>
              <p className="text-2xl font-bold text-amber-600">
                {familiasEnRiesgo} {familiasEnRiesgo === 1 ? "familia" : "familias"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                con conceptos marcados sin pagar cerca de su vencimiento
              </p>
            </div>
            {familiasEnRiesgo > 0 && (
              <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full shrink-0">
                Requiere atención
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/pagos?estado=pendiente"
              className="bg-white rounded-2xl shadow-sm p-5 flex flex-col"
            >
              <p className="text-sm font-bold text-slate-400 min-h-[2.5rem]">
                Pagos pendientes de revisión
              </p>
              <p className="text-2xl font-bold text-slate-800">{pagosPendientesCount}</p>
              <p className="text-xs text-sky-600 font-semibold mt-1">Ver en Pagos →</p>
            </Link>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-sm font-bold text-slate-400 min-h-[2.5rem]">
                Cobrado por medio de pago
              </p>
              <div className="space-y-1 mt-1">
                {acreditadoPorMedioOrdenado.map(([medio, monto]) => (
                  <div key={medio} className="flex justify-between text-sm">
                    <span className="text-slate-600">{medio}</span>
                    <span className="font-bold text-slate-800">{formatoMoneda(monto)}</span>
                  </div>
                ))}
                {acreditadoPorMedioOrdenado.length === 0 && (
                  <p className="text-sm text-slate-400">Sin datos.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-sky-600"
      >
        {abierto ? "Ocultar" : "Más información"}
        <span
          className={`inline-block transition-transform text-[10px] ${abierto ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
    </div>
  );
}
