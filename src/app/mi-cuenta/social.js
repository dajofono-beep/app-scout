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

// cumpleanosTodos: [{ id, nombre, mes, dia }] (mes 1-12, todo el grupo)
// efemeridesTodas: [{ id, nombre, mes, dia, mensaje, imagen_url }] (activas)
// anio/mes (0-indexado)/diaHoy: fecha real de "hoy", provista por el servidor
export default function Social({ cumpleanosTodos, efemeridesTodas, anio, mes, diaHoy }) {
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

  const cumpleanosHoy = cumpleanosTodos.filter(
    (c) => c.mes === mes + 1 && c.dia === diaHoy
  );
  const efemeridesHoy = efemeridesTodas.filter(
    (e) => e.mes === mes + 1 && e.dia === diaHoy
  );

  const cumpleanosDelMes = cumpleanosTodos.filter((c) => c.mes === mesVisto + 1);
  const efemeridesDelMes = efemeridesTodas.filter((e) => e.mes === mesVisto + 1);

  const esMesActual = anioVisto === anio && mesVisto === mes;

  const primerDiaSemana = (new Date(anioVisto, mesVisto, 1).getDay() + 6) % 7;
  const totalDias = new Date(anioVisto, mesVisto + 1, 0).getDate();

  const porDiaCumple = new Map();
  for (const c of cumpleanosDelMes) {
    if (!porDiaCumple.has(c.dia)) porDiaCumple.set(c.dia, []);
    porDiaCumple.get(c.dia).push(c);
  }
  const porDiaEfeme = new Map();
  for (const e of efemeridesDelMes) {
    if (!porDiaEfeme.has(e.dia)) porDiaEfeme.set(e.dia, []);
    porDiaEfeme.get(e.dia).push(e);
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

      {efemeridesHoy.map((e) => (
        <div key={e.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {e.imagen_url && (
            <img src={e.imagen_url} alt={e.nombre} className="w-full" />
          )}
          <div className="p-5">
            <p className="font-bold text-slate-800">{e.nombre}</p>
            {e.mensaje && <p className="text-sm text-slate-600 mt-1">{e.mensaje}</p>}
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
            const tieneCumple = porDiaCumple.has(d);
            const tieneEfeme = porDiaEfeme.has(d);
            const nombres = [
              ...(porDiaCumple.get(d) ?? []).map((c) => c.nombre),
              ...(porDiaEfeme.get(d) ?? []).map((e) => e.nombre),
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
                {(tieneCumple || tieneEfeme) && (
                  <span className="flex gap-0.5">
                    {tieneCumple && (
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    )}
                    {tieneEfeme && (
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
            <span className="w-2 h-2 rounded-full bg-sky-400" /> Efeméride
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
            Efemérides en {MESES[mesVisto]}
          </p>
          <div className="space-y-1.5">
            {[...efemeridesDelMes]
              .sort((a, b) => a.dia - b.dia)
              .map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{e.nombre}</span>
                  <span className="text-slate-400">
                    {e.dia} de {MESES[mesVisto]}
                  </span>
                </div>
              ))}
            {efemeridesDelMes.length === 0 && (
              <p className="text-sm text-slate-400">No hay efemérides este mes.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
