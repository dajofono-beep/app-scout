"use client";

import { useEffect, useRef, useState } from "react";
import BarraProgreso3D from "./barra-progreso-3d";

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
  // Cuántas veces se abrió el panel — cambia solo al abrir, y se usa
  // como `key` del contenido para forzar que se vuelva a montar (y así
  // BarraProgreso3D repita su animación) cada vez que se abre.
  const [aperturas, setAperturas] = useState(0);

  function alternarInfo() {
    if (!abierto) setAperturas((a) => a + 1);
    setAbierto((v) => !v);
  }

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
      style={{
        backgroundImage:
          "linear-gradient(rgba(2, 132, 199, 0.3), rgba(2, 132, 199, 0.3)), url('/TarjetaSaldo.png')",
        backgroundSize: "cover",
        backgroundPosition: "right center",
      }}
      className="text-white rounded-3xl shadow-md p-5"
    >
      <p className="text-base text-white/90">
        {esFamiliaConVarios ? "Saldo total entre hermanos" : "Saldo actual"}
      </p>
      <p key={`total-${generacion}`} className="text-3xl font-bold valor-animado">
        {formatoMoneda(saldoTotal)}
      </p>
      <div className="flex gap-4 mt-3 text-sm text-white/80">
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
        <p className="text-sm bg-white/20 rounded-full px-3 py-1 inline-block mt-2">
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

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          abierto ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div key={aperturas} className="pt-3 border-t border-white/20 space-y-3">
            <BarraProgreso3D totalCargos={totalCargos} pagosRealizados={pagosRealizados} />
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
                      <p className="text-xs text-white/80">
                        Próximo evento: {esFamiliaConVarios ? `${v.nombreCompleto} · ` : ""}
                        {v.concepto}
                      </p>
                      <p className="text-xs text-white/80 mb-1">
                        Vencimiento: {formatoFechaCorta(v.fecha)}
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
        </div>
      </div>
      <button
        type="button"
        onClick={alternarInfo}
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
