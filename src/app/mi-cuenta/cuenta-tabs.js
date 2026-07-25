"use client";

import { useState } from "react";

const BOTONES = [
  { id: "pago", texto: "Cargar un pago" },
  { id: "movimientos", texto: "Movimientos" },
];

export default function CuentaTabs({ panelPago, panelMovimientos }) {
  const [activa, setActiva] = useState("pago");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {BOTONES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setActiva(b.id)}
            className={`flex-1 text-sm font-bold rounded-full py-2.5 transition-colors ${
              activa === b.id
                ? "bg-sky-600 text-white"
                : "bg-white text-slate-500 shadow-sm"
            }`}
          >
            {b.texto}
          </button>
        ))}
      </div>

      <div className={activa === "pago" ? "" : "hidden"}>{panelPago}</div>
      <div className={activa === "movimientos" ? "" : "hidden"}>
        {panelMovimientos}
      </div>
    </div>
  );
}
