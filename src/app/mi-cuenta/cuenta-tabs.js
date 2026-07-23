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
          className={`flex-1 text-sm font-medium rounded-lg py-2 ${
            activa === "pago"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 shadow"
          }`}
        >
          Cargar un pago
        </button>
        <button
          type="button"
          onClick={() => setActiva("movimientos")}
          className={`flex-1 text-sm font-medium rounded-lg py-2 ${
            activa === "movimientos"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 shadow"
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
