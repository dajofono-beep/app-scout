"use client";

import { useEffect, useRef, useState } from "react";

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

function formatoFechaCorta(iso) {
  const [, mes, dia] = iso.split("-").map(Number);
  return `${dia}/${mes}`;
}

// vencimientos: [{ miembroId, nombreCompleto, estado: "vencido"|"proximo", ... }],
// uno por hermano que tenga algo pendiente relacionado a un concepto
// marcado para la alerta (ver mi-cuenta/proximo-vencimiento.js).
// "vencido": monto sin pagar de conceptos ya vencidos (se suma todo).
// "proximo": concepto/fecha del próximo marcado a futuro, sin cubrir.
export default function TarjetaSaldo({
  esFamiliaConVarios,
  saldoTotal,
  totalCargos,
  pagosRealizados,
  pendienteTotal,
  saldosOrdenados,
  nombrePorId,
  vencimientos,
}) {
  const [abierto, setAbierto] = useState(false);

  // Cada vez que la tarjeta vuelve a hacerse visible (al entrar a
  // Principal desde otra sección, o al cargar la página), cada valor
  // hace un ligero movimiento descendente. Se detecta con un
  // IntersectionObserver en vez de un prop, porque esta tarjeta queda
  // montada todo el tiempo (las secciones de Mi Cuenta no se
  // desmontan al cambiar de pestaña). `generacion` cambia en cada
  // aparición y se usa como `key` de los valores para forzar que
  // React los vuelva a montar — así la animación CSS se repite.
  const [generacion, setGeneracion] = useState(0);
  const seccionRef = useRef(null);

  useEffect(() => {
    const elemento = seccionRef.current;
    if (!elemento) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) setGeneracion((g) => g + 1);
      },
      { threshold: 0 }
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <section
      ref={seccionRef}
      className="bg-gradient-to-br from-sky-600 to-sky-400 text-white rounded-3xl shadow-md p-5"
    >
      <p className="text-sm text-white/90">
        {esFamiliaConVarios ? "Saldo total entre hermanos" : "Saldo actual"}
      </p>
      <p key={`total-${generacion}`} className="text-3xl font-bold valor-animado">
        {formatoMoneda(saldoTotal)}
      </p>
      <div className="flex gap-4 mt-3 text-xs text-white/80">
        <span>
          Deuda total{" "}
          <span key={`deuda-${generacion}`} className="font-bold text-white valor-animado">
            {formatoMoneda(totalCargos)}
          </span>
        </span>
        <span>
          Total Pagos{" "}
          <span key={`pagos-${generacion}`} className="font-bold text-white valor-animado">
            {formatoMoneda(pagosRealizados)}
          </span>
        </span>
      </div>
      {pendienteTotal > 0 && (
        <p className="text-xs bg-white/20 rounded-full px-3 py-1 inline-block mt-2">
          <span key={`pendiente-${generacion}`} className="valor-animado">
            {formatoMoneda(pendienteTotal)}
          </span>{" "}
          en pagos pendientes de acreditar
        </p>
      )}

      {esFamiliaConVarios && (
        <div className="mt-3 pt-3 border-t border-white/20 space-y-1">
          {saldosOrdenados.map((s) => (
            <div key={s.miembro_id} className="flex justify-between text-sm">
              <span className="text-white/85">{nombrePorId[s.miembro_id]}</span>
              <span key={`${s.miembro_id}-${generacion}`} className="font-bold valor-animado">
                {formatoMoneda(s.saldo)}
              </span>
            </div>
          ))}
        </div>
      )}

      {abierto && (
        <div className="mt-3 pt-3 border-t border-white/20 space-y-3">
          {vencimientos.length > 0 ? (
            vencimientos.map((v) => (
              <div key={v.miembroId}>
                {v.estado === "vencido" ? (
                  <>
                    <p className="text-xs text-white/80 mb-1">
                      {esFamiliaConVarios ? `${v.nombreCompleto} · ` : ""}
                      Conceptos ya vencidos sin pagar
                    </p>
                    <span className="inline-block rounded-full px-3 py-1 text-xs font-bold bg-amber-200 text-amber-900">
                      {formatoMoneda(v.monto)} sin pagar — no vas a poder participar del
                      próximo evento
                    </span>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-white/80 mb-1">
                      {esFamiliaConVarios ? `${v.nombreCompleto} · ` : ""}
                      {v.concepto} · vence el {formatoFechaCorta(v.fecha)}
                    </p>
                    <span className="inline-block rounded-full px-3 py-1 text-xs font-bold bg-amber-200 text-amber-900">
                      Sin pagar — no vas a poder participar del próximo evento
                    </span>
                  </>
                )}
              </div>
            ))
          ) : (
            <span className="inline-block rounded-full px-3 py-1 text-xs font-bold bg-emerald-200 text-emerald-900">
              Estás al día para participar del próximo evento
            </span>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-1 mt-3 text-xs font-semibold text-white/90"
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
