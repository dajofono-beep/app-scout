"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";

const ITEMS = [
  { id: "principal", texto: "Principal" },
  { id: "social", texto: "Social" },
  { id: "mensajes", texto: "Mensajes" },
  { id: "descargas", texto: "Descargas" },
  { id: "consultas", texto: "Consultas" },
];

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

// Barra superior mobile (menú + nombre/rama), compartida entre CuentaNav
// (donde "onSeleccionar" cambia de pestaña sin navegar) y páginas aparte
// como Perfil (sin "onSeleccionar", los ítems navegan a /mi-cuenta).
export default function BarraCuenta({
  nombreCompleto,
  ramaNombre,
  fotoUrl,
  activa,
  onSeleccionar,
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  function elegir(id) {
    onSeleccionar?.(id);
    setMenuAbierto(false);
  }

  return (
    <div className="md:hidden bg-white border-b border-sky-100">
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
          <div className="text-right">
            <p className="font-bold text-slate-800 leading-tight">{nombreCompleto}</p>
            <p className="text-sm text-slate-400 leading-tight">{ramaNombre}</p>
          </div>
          <img
            src={fotoUrl || "/icono-azimut.png"}
            alt={fotoUrl ? nombreCompleto : "Azimut"}
            className="w-10 h-10 rounded-xl shrink-0 object-cover"
          />
        </div>
      </div>

      {menuAbierto && (
        <div className="border-t border-sky-100 p-4">
          <div className="flex flex-col gap-3">
            {ITEMS.map((item) =>
              onSeleccionar ? (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => elegir(item.id)}
                  className={`text-left text-base font-semibold ${
                    activa === item.id
                      ? "text-sky-600"
                      : "text-slate-600 hover:text-sky-600"
                  }`}
                >
                  {item.texto}
                </button>
              ) : (
                <Link
                  key={item.id}
                  href="/mi-cuenta"
                  onClick={() => setMenuAbierto(false)}
                  className="text-base font-semibold text-slate-600 hover:text-sky-600"
                >
                  {item.texto}
                </Link>
              )
            )}
            <Link
              href="/mi-cuenta/perfil"
              onClick={() => setMenuAbierto(false)}
              className="text-base font-semibold text-slate-600 hover:text-sky-600"
            >
              Perfil
            </Link>
            <LogoutButton className="text-left text-base font-semibold text-slate-600 hover:text-sky-600" />
          </div>
        </div>
      )}
    </div>
  );
}
