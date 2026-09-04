"use client";

import { useState } from "react";
import CobranzaMensualChart from "./cobranza-mensual-chart";

// `mesesCompletos` viene con hasta 10 meses (el máximo del
// desplegable); acá solo se recorta a los últimos 3/6/10 elegidos.
// El tamaño del gráfico (viewBox fijo) no cambia según la cantidad de
// meses, así que la tarjeta nunca cambia de tamaño al filtrar.
export default function CobranzaMensualCard({ mesesCompletos }) {
  const [cantidad, setCantidad] = useState(3);
  const meses = mesesCompletos.slice(-cantidad);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 lg:col-span-3 print:col-span-3 h-full">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <img
            src="/Dashboard/Cobranza mensual.png"
            alt=""
            className="w-7 h-7 object-contain"
          />
          <p className="text-sm font-bold text-sky-700">Cobranza mensual</p>
        </div>
        <select
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-full px-2 py-1"
        >
          <option value={3}>Últimos 3 meses</option>
          <option value={6}>Últimos 6 meses</option>
          <option value={10}>Últimos 10 meses</option>
        </select>
      </div>
      <CobranzaMensualChart meses={meses} />
    </div>
  );
}
