"use client";

import { useEffect, useRef, useState } from "react";

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const DURACION_MS = 900;
const facilitarSalida = (t) => 1 - Math.pow(1 - t, 3);

// Barra de progreso con efecto "3D" (brillo arriba, sombra abajo) que
// se anima creciendo desde 0 cada vez que se monta — como esto vive
// adentro del bloque "Más información" (que se desmonta al cerrarse),
// alcanza con animar al montar: cada apertura es un montaje nuevo.
export default function BarraProgreso3D({ totalCargos, pagosRealizados }) {
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
    <div className="pb-3 border-b border-white/20">
      <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
        <span>Progreso de pago</span>
        <span className="font-bold text-white">{Math.round(anchoPct)}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(porcentajeFinal)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(porcentajeFinal)}% pagado de ${formatoMoneda(totalCargos)}`}
        className="relative h-3.5 rounded-full bg-black/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)] overflow-hidden"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${anchoPct}%`,
            background: "linear-gradient(to bottom, #bae6fd 0%, #0ea5e9 55%, #0369a1 100%)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
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
