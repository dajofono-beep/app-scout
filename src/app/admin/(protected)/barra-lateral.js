"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";
import NavGroup from "./nav-group";
import IconoMenu from "./icono-menu";
import {
  NAV_ITEMS,
  ITEMS_COMUNICACION,
  ITEMS_ADMINISTRACION,
  ICONO_COMUNICACION,
  ICONO_ADMINISTRACION,
} from "./nav-items";

const CLASE_LINK =
  "flex items-center gap-2 text-sm font-semibold text-slate-900 [filter:drop-shadow(0_1px_2px_rgba(255,255,255,0.9))] rounded-lg px-2 py-1.5 -mx-2 transition hover:[filter:drop-shadow(0_0_6px_rgba(14,165,233,0.9))]";

// Barra lateral única para escritorio y celular (antes eran dos
// componentes distintos: un <nav> fijo en escritorio y una barra
// superior con menú hamburguesa en celular). Ahora es siempre la
// misma barra angosta con íconos, que se puede expandir/colapsar
// tocando el ícono de usuario — y arranca colapsada en pantallas de
// celular para no robarle tanto espacio a la pantalla principal.
export default function BarraLateral({ nombreAdmin }) {
  const [colapsado, setColapsado] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setColapsado(true);
    }
  }, []);

  return (
    <nav
      className={`print:hidden shrink-0 sticky top-0 h-screen flex flex-col relative overflow-hidden border-r border-sky-100 transition-[width] duration-200 ${
        colapsado ? "w-16" : "w-56"
      }`}
      style={{
        backgroundImage:
          "linear-gradient(rgba(2, 132, 199, 0.2), rgba(2, 132, 199, 0.2)), url('/fondo-sidebar_Micuenta.png')",
        backgroundSize: "cover",
        backgroundPosition: "top left",
      }}
    >
      <div className="p-3 shrink-0">
        <button
          type="button"
          onClick={() => setColapsado((v) => !v)}
          aria-label={colapsado ? "Expandir menú" : "Minimizar menú"}
          title={colapsado ? "Expandir menú" : "Minimizar menú"}
          className={`flex items-center gap-2 w-full ${colapsado ? "justify-center" : "justify-start"}`}
        >
          <img
            src="/icono-azimut.png"
            alt="Azimut"
            className="w-9 h-9 rounded-lg shrink-0"
          />
          {!colapsado && (
            <p className="text-sm text-slate-900 [filter:drop-shadow(0_1px_2px_rgba(255,255,255,0.9))] truncate min-w-0">
              Hola, {nombreAdmin}
            </p>
          )}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            title={colapsado ? item.label : undefined}
            className={`${CLASE_LINK} ${colapsado ? "justify-center px-0" : ""}`}
          >
            <IconoMenu src={item.icono} />
            {!colapsado && <span className="truncate">{item.label}</span>}
          </Link>
        ))}

        <NavGroup
          titulo="Comunicación"
          icono={ICONO_COMUNICACION}
          items={ITEMS_COMUNICACION}
          colapsado={colapsado}
        />
        <NavGroup
          titulo="Administración"
          icono={ICONO_ADMINISTRACION}
          items={ITEMS_ADMINISTRACION}
          colapsado={colapsado}
        />
      </div>

      <div className="p-3 shrink-0 flex justify-center">
        <LogoutButton colapsado={colapsado} />
      </div>
    </nav>
  );
}
