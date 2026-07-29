"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";
import Descargas from "./descargas";
import TituloSeccion from "./titulo-seccion";
import BarraCuenta from "./barra-cuenta";

const ITEMS = [
  { id: "principal", texto: "Principal" },
  { id: "social", texto: "Social" },
  { id: "mensajes", texto: "Mensajes" },
  { id: "descargas", texto: "Descargas" },
  { id: "consultas", texto: "Consultas" },
];

export default function CuentaNav({
  nombreCompleto,
  ramaNombre,
  fotoUrl,
  panelPrincipal,
  panelSocial,
  panelMensajes,
}) {
  const [activa, setActiva] = useState("principal");

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-sky-50">
      <BarraCuenta
        nombreCompleto={nombreCompleto}
        ramaNombre={ramaNombre}
        fotoUrl={fotoUrl}
        activa={activa}
        onSeleccionar={setActiva}
      />
      <nav className="shrink-0 bg-white md:border-r border-sky-100 md:w-56 md:p-4 flex flex-col md:gap-3">
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

        <div className="hidden md:flex md:flex-col gap-2 items-start">
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
          <TituloSeccion
            icono="/Social.png"
            nombre="Social"
            onVolver={() => setActiva("principal")}
          />
          {panelSocial}
        </div>
        <div className={`max-w-2xl mx-auto ${activa === "descargas" ? "" : "hidden"}`}>
          <TituloSeccion
            icono="/Descargas.png"
            nombre="Descargas"
            onVolver={() => setActiva("principal")}
          />
          <Descargas />
        </div>
        <div className={`max-w-2xl mx-auto ${activa === "mensajes" ? "" : "hidden"}`}>
          <TituloSeccion
            icono="/Mensajes.png"
            nombre="Mensajes"
            onVolver={() => setActiva("principal")}
          />
          {panelMensajes}
        </div>
        {["consultas"].includes(activa) && (
          <div className="max-w-2xl mx-auto">
            <TituloSeccion nombre="Consultas" onVolver={() => setActiva("principal")} />
            <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
              <p className="text-slate-500 text-sm">Próximamente.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
