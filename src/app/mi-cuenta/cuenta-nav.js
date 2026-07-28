"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";

const ITEMS = [
  { id: "principal", texto: "Principal" },
  { id: "social", texto: "Social" },
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

export default function CuentaNav({
  nombreCompleto,
  ramaNombre,
  fotoUrl,
  panelPrincipal,
  panelSocial,
}) {
  const [activa, setActiva] = useState("principal");
  const [menuAbierto, setMenuAbierto] = useState(false);

  function irA(id) {
    setActiva(id);
    setMenuAbierto(false);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-sky-50">
      <nav className="shrink-0 bg-white border-b md:border-b-0 md:border-r border-sky-100 md:w-56 md:p-4 flex flex-col md:gap-3">
        {/* Barra superior en mobile: menú a la izquierda, nombre/rama a la derecha */}
        <div className="flex md:hidden items-center justify-between p-4">
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
          <div className="md:hidden border-t border-sky-100 p-4 space-y-3">
            <div className="flex flex-col gap-2">
              {ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => irA(item.id)}
                  className={`text-left text-sm font-semibold ${
                    activa === item.id
                      ? "text-sky-600"
                      : "text-slate-600 hover:text-sky-600"
                  }`}
                >
                  {item.texto}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-sky-100">
              <Link
                href="/mi-cuenta/perfil"
                onClick={() => setMenuAbierto(false)}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                Perfil
              </Link>
              <LogoutButton />
            </div>
          </div>
        )}

        {/* Barra lateral en desktop: sin cambios */}
        <div className="hidden md:flex items-center gap-3 md:mb-2">
          <img
            src={fotoUrl || "/icono-azimut.png"}
            alt={fotoUrl ? nombreCompleto : "Azimut"}
            className="w-10 h-10 rounded-xl shrink-0 object-cover"
          />
          <div>
            <p className="font-bold text-slate-800">{nombreCompleto}</p>
            <p className="text-sm text-slate-400">{ramaNombre}</p>
          </div>
        </div>

        <div className="hidden md:flex md:flex-col gap-1 flex-1">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiva(item.id)}
              className={`text-left text-sm font-semibold ${
                activa === item.id
                  ? "text-sky-600"
                  : "text-slate-600 hover:text-sky-600"
              }`}
            >
              {item.texto}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/mi-cuenta/perfil"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            Perfil
          </Link>
          <LogoutButton />
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8">
        <div className={`max-w-2xl mx-auto ${activa === "principal" ? "" : "hidden"}`}>
          {panelPrincipal}
        </div>
        <div className={`max-w-2xl mx-auto ${activa === "social" ? "" : "hidden"}`}>
          {panelSocial}
        </div>
      </main>
    </div>
  );
}
