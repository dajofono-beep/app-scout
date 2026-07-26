"use client";

import { useState } from "react";

const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];
const MESES = [
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

const pad = (n) => String(n).padStart(2, "0");
const fechaStr = (anio, mes1indexado, dia) => `${anio}-${pad(mes1indexado)}-${pad(dia)}`;

function formatoRango(fechaInicio, fechaFin) {
  const [aI, mI, dI] = fechaInicio.split("-").map(Number);
  const [aF, mF, dF] = fechaFin.split("-").map(Number);
  if (fechaInicio === fechaFin) return `${dI} de ${MESES[mI - 1]}`;
  if (mI === mF && aI === aF) return `${dI} al ${dF} de ${MESES[mI - 1]}`;
  return `${dI} de ${MESES[mI - 1]} al ${dF} de ${MESES[mF - 1]}`;
}

// cumpleanosTodos: [{ id, nombre, mes, dia }] (mes 1-12, recurrente, todo el grupo)
// fechasImportantesTodas: [{ id, nombre, fecha_inicio, fecha_fin, mensaje, imagen_url }] (activas)
// anio/mes (0-indexado)/diaHoy: fecha real de "hoy", provista por el servidor
export default function Social({
  cumpleanosTodos,
  fechasImportantesTodas,
  anio,
  mes,
  diaHoy,
}) {
  const [anioVisto, setAnioVisto] = useState(anio);
  const [mesVisto, setMesVisto] = useState(mes);

  function mesAnterior() {
    if (mesVisto === 0) {
      setMesVisto(11);
      setAnioVisto((a) => a - 1);
    } else {
      setMesVisto((m) => m - 1);
    }
  }

  function mesSiguiente() {
    if (mesVisto === 11) {
      setMesVisto(0);
      setAnioVisto((a) => a + 1);
    } else {
      setMesVisto((m) => m + 1);
    }
  }

  const hoyStr = fechaStr(anio, mes + 1, diaHoy);
  const cumpleanosHoy = cumpleanosTodos.filter(
    (c) => c.mes === mes + 1 && c.dia === diaHoy
  );
  const fechasImportantesHoy = fechasImportantesTodas.filter(
    (f) => f.fecha_inicio <= hoyStr && hoyStr <= f.fecha_fin
  );

  const cumpleanosDelMes = cumpleanosTodos.filter((c) => c.mes === mesVisto + 1);

  const esMesActual = anioVisto === anio && mesVisto === mes;

  const primerDiaSemana = (new Date(anioVisto, mesVisto, 1).getDay() + 6) % 7;
  const totalDias = new Date(anioVisto, mesVisto + 1, 0).getDate();
  const inicioMesStr = fechaStr(anioVisto, mesVisto + 1, 1);
  const finMesStr = fechaStr(anioVisto, mesVisto + 1, totalDias);

  const fechasImportantesDelMes = fechasImportantesTodas.filter(
    (f) => f.fecha_fin >= inicioMesStr && f.fecha_inicio <= finMesStr
  );

  const porDiaCumple = new Map();
  for (const c of cumpleanosDelMes) {
    if (!porDiaCumple.has(c.dia)) porDiaCumple.set(c.dia, []);
    porDiaCumple.get(c.dia).push(c);
  }

  const celdas = [];
  for (let i = 0; i < primerDiaSemana; i++) celdas.push(null);
  for (let d = 1; d <= totalDias; d++) celdas.push(d);

  return (
    <div className="space-y-4">
      {cumpleanosHoy.map((c) => (
        <div
          key={c.id}
          className="bg-gradient-to-br from-amber-400 to-pink-400 text-white rounded-2xl shadow-md p-5 text-center"
        >
          <p className="text-2xl">🎉🎂🎉</p>
          <p className="font-bold text-lg mt-1">¡Feliz cumpleaños, {c.nombre}!</p>
          <p className="text-sm text-white/90 mt-1">
            Todo el grupo te desea un día espectacular.
          </p>
        </div>
      ))}

      {fechasImportantesHoy.map((f) => (
        <div key={f.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {f.imagen_url && (
            <img src={f.imagen_url} alt={f.nombre} className="w-full" />
          )}
          <div className="p-5">
            <p className="font-bold text-slate-800">{f.nombre}</p>
            {f.mensaje && <p className="text-sm text-slate-600 mt-1">{f.mensaje}</p>}
          </div>
        </div>
      ))}

      <section className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={mesAnterior}
            aria-label="Mes anterior"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold"
          >
            ‹
          </button>
          <p className="font-bold text-slate-800 capitalize">
            {MESES[mesVisto]} {anioVisto}
          </p>
          <button
            type="button"
            onClick={mesSiguiente}
            aria-label="Mes siguiente"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold"
          >
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] max-w-[280px] mx-auto">
          {DIAS_SEMANA.map((d, i) => (
            <div key={`${d}-${i}`} className="text-slate-400 font-bold py-0.5">
              {d}
            </div>
          ))}
          {celdas.map((d, i) => {
            if (d === null) return <div key={`vacio-${i}`} />;
            const esHoy = esMesActual && d === diaHoy;
            const diaStr = fechaStr(anioVisto, mesVisto + 1, d);
            const cumplesDelDia = porDiaCumple.get(d) ?? [];
            const fechasDelDia = fechasImportantesDelMes.filter(
              (f) => f.fecha_inicio <= diaStr && diaStr <= f.fecha_fin
            );
            const nombres = [
              ...cumplesDelDia.map((c) => c.nombre),
              ...fechasDelDia.map((f) => f.nombre),
            ].join(", ");
            return (
              <div
                key={d}
                title={nombres || undefined}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-sm font-semibold ${
                  esHoy ? "bg-sky-600 text-white font-bold" : "text-slate-700"
                }`}
              >
                <span>{d}</span>
                {(cumplesDelDia.length > 0 || fechasDelDia.length > 0) && (
                  <span className="flex gap-0.5">
                    {cumplesDelDia.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    )}
                    {fechasDelDia.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400" /> Cumpleaños
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" /> Fecha importante
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-bold text-slate-800 mb-3 capitalize">
            Cumpleaños en {MESES[mesVisto]}
          </p>
          <div className="space-y-1.5">
            {[...cumpleanosDelMes]
              .sort((a, b) => a.dia - b.dia)
              .map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{c.nombre}</span>
                  <span className="text-slate-400">
                    {c.dia} de {MESES[mesVisto]}
                  </span>
                </div>
              ))}
            {cumpleanosDelMes.length === 0 && (
              <p className="text-sm text-slate-400">No hay cumpleaños este mes.</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-bold text-slate-800 mb-3 capitalize">
            Fechas importantes en {MESES[mesVisto]}
          </p>
          <div className="space-y-1.5">
            {[...fechasImportantesDelMes]
              .sort((a, b) => (a.fecha_inicio < b.fecha_inicio ? -1 : 1))
              .map((f) => (
                <div key={f.id} className="flex items-center justify-between text-sm gap-2">
                  <span className="text-slate-700">{f.nombre}</span>
                  <span className="text-slate-400 text-right shrink-0">
                    {formatoRango(f.fecha_inicio, f.fecha_fin)}
                  </span>
                </div>
              ))}
            {fechasImportantesDelMes.length === 0 && (
              <p className="text-sm text-slate-400">No hay fechas importantes este mes.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
