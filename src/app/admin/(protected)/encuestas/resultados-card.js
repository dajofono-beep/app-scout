"use client";

import { useState } from "react";

// Tarjeta colapsable: arranca cerrada y solo arma los gráficos y
// listados (children) cuando se despliega, para no cargar toda esa
// cuenta cada vez que se entra a la ficha de la encuesta.
export default function ResultadosCard({ children }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <h2 className="font-bold text-slate-800">Resultados</h2>
        <span
          className={`text-xs text-slate-400 transition-transform ${abierto ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {abierto && <div className="mt-4 space-y-5">{children}</div>}
    </div>
  );
}
