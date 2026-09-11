"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Grupo de links colapsable para el menú del admin (usado para
// "Comunicación" y "Administración"). Arranca abierto si la página
// actual pertenece al grupo.
export default function NavGroup({ titulo, items }) {
  const pathname = usePathname();
  const activo = items.some((item) => pathname.startsWith(item.href));
  const [abierto, setAbierto] = useState(activo);

  return (
    <div className="w-full md:mt-2 md:pt-2 md:border-t md:border-sky-100">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center justify-between w-full text-xs font-bold text-slate-900 [filter:drop-shadow(0_1px_2px_rgba(255,255,255,0.9))] uppercase tracking-wide mb-1 transition hover:[filter:drop-shadow(0_0_6px_rgba(14,165,233,0.9))]"
      >
        <span>{titulo}</span>
        <span
          className={`inline-block transition-transform ${abierto ? "rotate-90" : ""}`}
        >
          ›
        </span>
      </button>
      {abierto && (
        <div className="flex flex-col gap-1 md:pl-2">
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
