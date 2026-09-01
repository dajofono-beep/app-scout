"use client";

import { useState } from "react";

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

function formatoFechaCorta(iso) {
  const [, mes, dia] = iso.split("-").map(Number);
  return `${dia}/${mes}`;
}

// Misma información y misma lógica que la tarjeta de saldo de Mi
// Cuenta (tarjeta-saldo.js), pero en blanco (para distinguirse a
// simple vista de lo que ve la familia) y con el texto en tercera
// persona, ya que acá lo lee el administrador sobre otra persona.
export default function TarjetaSaldoAdmin({
  saldoTotal,
  totalCargos,
  pagosRealizados,
  pendienteTotal,
  vencimiento,
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <section className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-sm font-bold text-slate-400">Saldo actual</p>
      <p className="text-2xl font-bold text-slate-800">{formatoMoneda(saldoTotal)}</p>
      <div className="flex gap-4 mt-3 text-xs text-slate-500">
        <span>
          Deuda total <span className="font-bold text-slate-800">{formatoMoneda(totalCargos)}</span>
        </span>
        <span>
          Total Pagos <span className="font-bold text-slate-800">{formatoMoneda(pagosRealizados)}</span>
        </span>
      </div>
      {pendienteTotal > 0 && (
        <p className="text-xs bg-amber-50 text-amber-700 rounded-full px-3 py-1 inline-block mt-2">
          {formatoMoneda(pendienteTotal)} en pagos pendientes de acreditar
        </p>
      )}

      {abierto && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          {vencimiento ? (
            vencimiento.estado === "vencido" ? (
              <>
                <p className="text-xs text-slate-500 mb-1">
                  Conceptos ya vencidos sin pagar
                </p>
                <span className="inline-block rounded-full px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800">
                  {formatoMoneda(vencimiento.monto)} sin pagar — este miembro no podría
                  participar del siguiente evento
                </span>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-500 mb-1">
                  {vencimiento.concepto} · vence el {formatoFechaCorta(vencimiento.fecha)}
                </p>
                <span className="inline-block rounded-full px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800">
                  Sin pagar — este miembro no podría participar del siguiente evento
                </span>
              </>
            )
          ) : (
            <span className="inline-block rounded-full px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800">
              Este miembro puede participar del próximo evento
            </span>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-1 mt-3 text-xs font-semibold text-sky-600"
      >
        {abierto ? "Ocultar" : "Más información"}
        <span
          className={`inline-block transition-transform text-[10px] ${abierto ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
    </section>
  );
}
