"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";
import NavGroup from "./nav-group";
import { NAV_ITEMS, ITEMS_COMUNICACION, ITEMS_ADMINISTRACION } from "./nav-items";

function IconoMenu({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

// Barra superior mobile del panel de administrador, mismo patrón que
// BarraCuenta (menú hamburguesa) para que se vea igual que Mi Cuenta en
// vez del listado horizontal con wrap que se usaba antes.
export default function BarraAdmin({ nombreAdmin }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="md:hidden print:hidden bg-white border-b border-sky-100">
      <div className="flex items-center justify-between p-4">
        <button
          type="button"
          onClick={() => setMenuAbierto((v) => !v)}
          aria-label="Abrir menú"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-sky-50"
        >
          <IconoMenu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <p className="font-bold text-slate-800">Hola, {nombreAdmin}</p>
          <img
            src="/icono-azimut.png"
            alt="Azimut"
            className="w-10 h-10 rounded-xl shrink-0 object-cover"
          />
        </div>
      </div>

      {menuAbierto && (
        <div
          className="border-t border-sky-100 p-4"
          onClick={(e) => {
            if (e.target.closest("a")) setMenuAbierto(false);
          }}
        >
          <div className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="text-base font-semibold text-slate-600 hover:text-sky-600"
              >
                {item.label}
              </Link>
            ))}
            <NavGroup titulo="Comunicación" items={ITEMS_COMUNICACION} />
            <NavGroup titulo="Administración" items={ITEMS_ADMINISTRACION} />
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
