"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IconoMenu from "./icono-menu";

// Grupo de links colapsable para el menú del admin (usado para
// "Comunicación" y "Administración"). Arranca abierto si la página
// actual pertenece al grupo. Cuando el menú entero está colapsado
// (`colapsado`), se muestra solo el ícono — los links del grupo no
// tienen ícono propio, así que no hay forma de mostrarlos en modo
// icono-only. Hay que expandir el menú para acceder a ellos.
export default function NavGroup({ titulo, icono, items, colapsado }) {
  const pathname = usePathname();
  const activo = items.some((item) => pathname.startsWith(item.href));
  const [abierto, setAbierto] = useState(activo);

  if (colapsado) {
    return (
      <div className="w-full mt-2 pt-2 border-t border-white/40 flex justify-center" title={titulo}>
        <IconoMenu src={icono} alt={titulo} />
      </div>
    );
  }

  return (
    <div className="w-full mt-2 pt-2 border-t border-white/40">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center justify-between w-full gap-2 text-xs font-bold text-slate-900 [filter:drop-shadow(0_1px_2px_rgba(255,255,255,0.9))] uppercase tracking-wide mb-1 transition hover:[filter:drop-shadow(0_0_6px_rgba(14,165,233,0.9))]"
      >
        <span className="flex items-center gap-2 min-w-0">
          <IconoMenu src={icono} />
          <span className="truncate">{titulo}</span>
        </span>
        <span
          className={`inline-block transition-transform shrink-0 ${abierto ? "rotate-90" : ""}`}
        >
          ›
        </span>
      </button>
      {abierto && (
        <div className="flex flex-col gap-1 pl-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="text-sm font-semibold text-slate-900 [filter:drop-shadow(0_1px_2px_rgba(255,255,255,0.9))] rounded-lg px-2 py-1 -mx-2 transition hover:[filter:drop-shadow(0_0_6px_rgba(14,165,233,0.9))]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
