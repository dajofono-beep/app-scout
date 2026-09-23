"use client";

import { useEffect, useRef, useState } from "react";

const DURACION_MS = 900;
const facilitarSalida = (t) => 1 - Math.pow(1 - t, 3);

// Misma barra y misma animación que BarraProgreso3D (mi-cuenta), pero
// en versión clara para el fondo blanco de la tarjeta de saldo del
// administrador, en vez de la versión celeste oscura de la familia.
export default function BarraProgreso3DAdmin({ totalCargos, pagosRealizados }) {
  const porcentajeFinal =
    totalCargos > 0 ? Math.min(100, (pagosRealizados / totalCargos) * 100) : 0;
  const [progreso, setProgreso] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
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
  }, []);

  const anchoPct = porcentajeFinal * progreso;

  return (
    <div className="pb-3 border-b border-slate-100">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
        <span>Progreso de pago</span>
        <span className="font-bold text-slate-800">{Math.round(anchoPct)}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(porcentajeFinal)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(porcentajeFinal)}% pagado`}
        className="relative h-3.5 rounded-full bg-slate-100 shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] overflow-hidden"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${anchoPct}%`,
            background: "linear-gradient(to bottom, #bae6fd 0%, #0ea5e9 55%, #0369a1 100%)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-1/2 rounded-t-full"
            style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.55), transparent)" }}
          />
        </div>
      </div>
    </div>
  );
}
