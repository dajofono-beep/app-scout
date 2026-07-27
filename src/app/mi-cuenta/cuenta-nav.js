"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";

const ITEMS = [
  { id: "principal", texto: "Principal" },
  { id: "social", texto: "Social" },
];

export default function CuentaNav({
  nombreCompleto,
  ramaNombre,
  fotoUrl,
  panelPrincipal,
  panelSocial,
}) {
  const [activa, setActiva] = useState("principal");

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-sky-50">
      <nav className="md:w-56 shrink-0 bg-white border-b md:border-b-0 md:border-r border-sky-100 p-4 flex md:flex-col gap-3">
        <div className="flex items-center gap-3 md:mb-2">
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

        <div className="flex flex-wrap md:flex-col gap-2 md:gap-1 flex-1">
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

        <div className="flex items-center gap-3">
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
