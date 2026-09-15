"use client";

import { useEffect, useRef, useState } from "react";

const MESES_LARGO = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const DURACION_MS = 900;
const facilitarSalida = (t) => 1 - Math.pow(1 - t, 3);

function formatoFecha(iso) {
  const [, mes, dia] = iso.split("-").map(Number);
  return `${dia} de ${MESES_LARGO[mes - 1]}`;
}

// Fecha única si todos los pagos de un grupo caen el mismo día, o un
// rango "del X al Y" si hay varias fechas distintas.
function formatoRangoFechas(pagosDelGrupo) {
  if (pagosDelGrupo.length === 0) return "";
  const fechas = pagosDelGrupo.map((p) => p.fecha).sort();
  const primera = fechas[0];
  const ultima = fechas[fechas.length - 1];
  return primera === ultima
    ? formatoFecha(primera)
    : `${formatoFecha(primera)} al ${formatoFecha(ultima)}`;
}

// conceptos: [{ label, importe, fechaOrden }], ya ordenados por fecha
// de vencimiento ascendente (el próximo a vencer primero).
// pagosLinea: [{ id, estado, importe, fecha }] (acreditados y pendientes).
export default function LineaTiempoPagos({
  conceptos,
  colorPorConcepto,
  totalCargos,
  pagosLinea,
  pagosRealizados,
  hoyIso,
  activo = true,
}) {
  const pasoInicial = conceptos.filter((c) => c.fechaOrden <= hoyIso).length;
  const [paso, setPaso] = useState(pasoInicial);

  // Barrido de crecimiento de las barras cada vez que `activo` pasa a
  // true (por ejemplo, al volver a esta solapa) — no afecta el resto
  // de los datos (guía, montos, slider), que siguen siendo los reales.
  const [progreso, setProgreso] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!activo || totalCargos <= 0) {
      setProgreso(activo ? 0 : 1);
      return;
    }

    setProgreso(0);
    const inicio = performance.now();

    function animar(ahora) {
      const t = Math.min(1, (ahora - inicio) / DURACION_MS);
      setProgreso(facilitarSalida(t));
      if (t < 1) frameRef.current = requestAnimationFrame(animar);
    }
    frameRef.current = requestAnimationFrame(animar);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo, totalCargos]);

  if (totalCargos <= 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <p className="text-gray-500 text-sm">Todavía no hay cargos para mostrar.</p>
      </div>
    );
  }

  let acumulado = 0;
  const segmentos = conceptos.map((c) => {
    const inicio = (acumulado / totalCargos) * 100;
    acumulado += c.importe;
    const fin = (acumulado / totalCargos) * 100;
    return { ...c, inicio, fin };
  });

  const guiaPct = paso === 0 ? 0 : segmentos[paso - 1].fin;
  const deudaALaFecha = segmentos.slice(0, paso).reduce((acc, s) => acc + s.importe, 0);
  const pagoPendienteALaFecha = Math.max(deudaALaFecha - pagosRealizados, 0);

  const pagosAcreditados = pagosLinea.filter((p) => p.estado === "acreditado");
  const pagosPendientes = pagosLinea.filter((p) => p.estado === "pendiente");
  const pagadoTotal = pagosAcreditados.reduce((acc, p) => acc + p.importe, 0);
  const pendienteTotal = pagosPendientes.reduce((acc, p) => acc + p.importe, 0);

  // El ancho de esta barra es proporcional al total de cargos (misma
  // escala que la barra de arriba), no a sí misma: si se pagó la mitad
  // de lo adeudado, esta barra ocupa la mitad del ancho de la de arriba.
  const segmentosPagos = [
    {
      label: "Pagado",
      importe: pagadoTotal,
      color: "#10b981",
      fechas: formatoRangoFechas(pagosAcreditados),
    },
    {
      label: "Pendiente de acreditar",
      importe: pendienteTotal,
      color: "#f59e0b",
      fechas: formatoRangoFechas(pagosPendientes),
    },
  ];
  let acumuladoPago = 0;
  const segmentosPagosPos = segmentosPagos.map((s) => {
    const inicio = (acumuladoPago / totalCargos) * 100;
    acumuladoPago += s.importe;
    const fin = (acumuladoPago / totalCargos) * 100;
    return { ...s, inicio, fin };
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-slate-800">Cargos y pagos</p>
        {paso !== pasoInicial && (
          <button
            type="button"
            onClick={() => setPaso(pasoInicial)}
            className="text-xs font-semibold text-sky-600"
          >
            Volver a hoy
          </button>
        )}
      </div>

      <div className="relative">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>Inicio de año</span>
          <span>Fin de año</span>
        </div>
        <div className="h-0.5 bg-slate-200 rounded-full" />

        <div className="relative h-7 bg-white rounded-full overflow-hidden flex mt-4">
          {segmentos.map((s) => (
            <div
              key={s.label}
              title={`Vence el ${formatoFecha(s.fechaOrden)}\n${s.label} · ${formatoMoneda(s.importe)}`}
              style={{
                width: `${(s.fin - s.inicio) * progreso}%`,
                background: colorPorConcepto[s.label] ?? "#94a3b8",
              }}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
          {conceptos.map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: colorPorConcepto[c.label] ?? "#94a3b8" }}
              />
              {c.label}
            </span>
          ))}
        </div>

        <div className="flex justify-between text-sm mt-3 mb-4">
          <div>
            <p className="text-slate-400 text-xs">Deuda total</p>
            <p className="font-bold text-slate-800">{formatoMoneda(totalCargos)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs">
              Deuda a la fecha
              {paso !== pasoInicial && paso > 0 && ` (${formatoFecha(segmentos[paso - 1].fechaOrden)})`}
            </p>
            <p className="font-bold text-red-500">{formatoMoneda(deudaALaFecha)}</p>
          </div>
        </div>

        <div className="relative h-7 bg-slate-100 rounded-full overflow-hidden flex">
          {segmentosPagosPos.map(
            (s) =>
              s.fin - s.inicio > 0 && (
                <div
                  key={s.label}
                  title={`${s.fechas}\n${s.label} · ${formatoMoneda(s.importe)}`}
                  style={{ width: `${(s.fin - s.inicio) * progreso}%`, background: s.color }}
                />
              )
          )}
        </div>

        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: "#10b981" }} />
            Pagado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: "#f59e0b" }} />
            Pendiente
          </span>
        </div>

        <div
          className="absolute top-0 bottom-0 w-0.5 bg-sky-600 pointer-events-none z-10"
          style={{ left: `${guiaPct}%` }}
        />
      </div>

      <div className="flex justify-between text-sm mt-4">
        <div>
          <p className="text-slate-400 text-xs">Pagos realizados</p>
          <p className="font-bold text-emerald-600">{formatoMoneda(pagosRealizados)}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-xs">Saldo pendiente a la fecha</p>
          <p className="font-bold text-amber-600">{formatoMoneda(pagoPendienteALaFecha)}</p>
        </div>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={conceptos.length}
          step={1}
          value={paso}
          onChange={(e) => setPaso(Number(e.target.value))}
          className="w-full accent-sky-600"
        />
        <p className="text-center text-sm text-slate-500 mt-1">
          {paso === 0
            ? "Antes del primer vencimiento"
            : `Hasta "${segmentos[paso - 1].label}" (vence el ${formatoFecha(segmentos[paso - 1].fechaOrden)})`}
        </p>
      </div>
    </div>
  );
}
