"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IconoMenu from "./icono-menu";

// Grupo de links colapsable para el menú del admin (usado para
// "Comunicación" y "Administración"). Arranca abierto si la página
// actual pertenece al grupo. Cuando el menú entero está colapsado
// (`colapsado`), los links del grupo no tienen ícono propio para
// mostrarse en la barra angosta — en su lugar, tocar el ícono del
// grupo abre un menú flotante al lado con las opciones.
export default function NavGroup({ titulo, icono, items, colapsado }) {
  const pathname = usePathname();
  const activo = items.some((item) => pathname.startsWith(item.href));
  const [abierto, setAbierto] = useState(activo);
  const [flyoutAbierto, setFlyoutAbierto] = useState(false);
  const [posicionFlyout, setPosicionFlyout] = useState(null);
  const botonRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!colapsado) setFlyoutAbierto(false);
  }, [colapsado]);

  useEffect(() => {
    if (!flyoutAbierto) return;
    function alClickearFuera(e) {
      if (botonRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setFlyoutAbierto(false);
    }
    document.addEventListener("mousedown", alClickearFuera);
    return () => document.removeEventListener("mousedown", alClickearFuera);
  }, [flyoutAbierto]);

  if (colapsado) {
    return (
      <div className="w-full mt-2 pt-2 border-t border-white/40 flex justify-center">
        <button
          ref={botonRef}
          type="button"
          title={titulo}
          aria-label={titulo}
          onClick={() => {
            if (!flyoutAbierto && botonRef.current) {
              const rect = botonRef.current.getBoundingClientRect();
              setPosicionFlyout({ top: rect.top, left: rect.right + 8 });
            }
            setFlyoutAbierto((v) => !v);
          }}
        >
          <IconoMenu src={icono} alt={titulo} />
        </button>
        {flyoutAbierto && posicionFlyout && (
          <div
            ref={panelRef}
            style={{ position: "fixed", top: posicionFlyout.top, left: posicionFlyout.left }}
            className="z-50 bg-white rounded-xl shadow-lg border border-slate-100 p-2 min-w-[190px] flex flex-col gap-1"
          >
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide px-2 pt-1 pb-1">
              {titulo}
            </p>
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={() => setFlyoutAbierto(false)}
                className="text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg px-2 py-1.5"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
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
