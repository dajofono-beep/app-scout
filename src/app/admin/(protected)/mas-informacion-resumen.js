"use client";

import { useState } from "react";
import Link from "next/link";

export default function MasInformacionResumen({ familiasEnRiesgo, pagosPendientesCount }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="mb-4">
      {abierto && (
        <div className="space-y-4 mb-3">
          <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-bold text-sky-700 mb-1">
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

          <Link
            href="/admin/pagos?estado=pendiente"
            className="bg-white rounded-2xl shadow-sm p-5 flex flex-col"
          >
            <p className="text-sm font-bold text-sky-700 min-h-[2.5rem]">
              Pagos pendientes de revisión
            </p>
            <p className="text-2xl font-bold text-slate-800">{pagosPendientesCount}</p>
            <p className="text-xs text-sky-600 font-semibold mt-1">Ver en Pagos →</p>
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="print:hidden flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-sky-600"
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
