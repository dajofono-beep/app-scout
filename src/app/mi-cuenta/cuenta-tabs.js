"use client";

import { useState } from "react";

export default function CuentaTabs({ panelPago, panelMovimientos }) {
  const [activa, setActiva] = useState("pago");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiva("pago")}
          className={`flex-1 text-sm font-bold rounded-full py-2.5 transition-colors ${
            activa === "pago"
              ? "bg-sky-600 text-white"
              : "bg-white text-slate-500 shadow-sm"
          }`}
        >
          Cargar un pago
        </button>
        <button
          type="button"
          onClick={() => setActiva("movimientos")}
          className={`flex-1 text-sm font-bold rounded-full py-2.5 transition-colors ${
            activa === "movimientos"
              ? "bg-sky-600 text-white"
              : "bg-white text-slate-500 shadow-sm"
          }`}
        >
          Movimientos
        </button>
      </div>

      <div className={activa === "pago" ? "" : "hidden"}>{panelPago}</div>
      <div className={activa === "movimientos" ? "" : "hidden"}>
        {panelMovimientos}
      </div>
    </div>
  );
}
