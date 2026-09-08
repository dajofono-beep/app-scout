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
        className="flex items-center justify-between w-full text-xs font-bold text-slate-400 uppercase tracking-wide mb-1"
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
              className="text-sm font-semibold text-slate-600 hover:text-sky-600"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
