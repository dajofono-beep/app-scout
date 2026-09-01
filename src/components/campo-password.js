"use client";

import { useState } from "react";

function IconoOjo({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconoOjoTachado({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a20.3 20.3 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

// Input de contraseña reutilizable con un ícono de ojo para mostrar u
// ocultar los caracteres. Mismo estilo visual que los campos de
// contraseña del resto de la app (border-slate-200, rounded-xl,
// px-4 py-2.5) — no acepta className porque hoy es idéntico en todos
// los usos.
export default function CampoPassword({ onBlur, ...props }) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={mostrar ? "text" : "password"}
        onBlur={(e) => {
          // Por seguridad, al perder el foco siempre se vuelve a ocultar
          // la contraseña, tocaste o no el ícono.
          setMostrar(false);
          onBlur?.(e);
        }}
        className="w-full border border-slate-200 rounded-xl pl-4 pr-11 py-2.5"
      />
      <button
        type="button"
        onClick={() => setMostrar((v) => !v)}
        onMouseDown={(e) => e.preventDefault()}
        tabIndex={-1}
        aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {mostrar ? (
          <IconoOjoTachado className="w-5 h-5" />
        ) : (
          <IconoOjo className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
