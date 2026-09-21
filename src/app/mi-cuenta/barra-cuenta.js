"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";
import FotoPerfilZoom from "./foto-perfil-zoom";

const ITEMS = [
  { id: "principal", texto: "Principal", icono: "/Barra Lateral Familias/Principal.png" },
  { id: "social", texto: "Social", icono: "/Barra Lateral Familias/Social.png" },
  { id: "mensajes", texto: "Mensajes", icono: "/Barra Lateral Familias/Mensajes.png" },
  { id: "encuestas", texto: "Encuestas", icono: "/Barra Lateral Familias/Encuestas.png" },
  { id: "descargas", texto: "Descargas", icono: "/Barra Lateral Familias/Descargas.png" },
  { id: "consultas", texto: "Consultas", icono: "/Barra Lateral Familias/Consultas III.png" },
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
//
// El menú es un cajón que se desliza desde la izquierda por encima de
// todo el contenido (no empuja la pantalla hacia abajo como un panel
// desplegable normal), con un fondo oscuro detrás que lo cierra al
// tocar cualquier parte de la pantalla.
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

  function renderItem(item) {
    return onSeleccionar ? (
      <button
        key={item.id}
        type="button"
        onClick={() => elegir(item.id)}
        className={`flex items-center gap-2.5 text-left text-base font-semibold ${
          activa === item.id ? "text-sky-600" : "text-slate-600 hover:text-sky-600"
        }`}
      >
        <img src={item.icono} alt="" className="w-[22px] h-[22px] shrink-0" />
        {item.texto}
      </button>
    ) : (
      <Link
        key={item.id}
        href="/mi-cuenta"
        onClick={() => setMenuAbierto(false)}
        className="flex items-center gap-2.5 text-base font-semibold text-slate-600 hover:text-sky-600"
      >
        <img src={item.icono} alt="" className="w-[22px] h-[22px] shrink-0" />
        {item.texto}
      </Link>
    );
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
          <FotoPerfilZoom
            fotoUrl={fotoUrl}
            nombreCompleto={nombreCompleto}
            className="w-10 h-10 rounded-xl shrink-0 object-cover"
          />
        </div>
      </div>

      <div
        aria-hidden={!menuAbierto}
        onClick={() => setMenuAbierto(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          menuAbierto ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        style={{
          backgroundImage:
            "linear-gradient(rgba(2, 132, 199, 0.2), rgba(2, 132, 199, 0.2)), url('/fondo-sidebar_Micuenta.png')",
          backgroundSize: "cover",
          backgroundPosition: "right bottom",
          backgroundRepeat: "no-repeat",
        }}
        className={`fixed inset-y-0 left-0 z-50 w-60 max-w-[65vw] shadow-xl transition-transform duration-300 ease-in-out ${
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-3 p-4">
          {ITEMS.map(renderItem)}
          <Link
            href="/mi-cuenta/perfil"
            onClick={() => setMenuAbierto(false)}
            className="flex items-center gap-2.5 text-base font-semibold text-slate-600 hover:text-sky-600"
          >
            <img
              src="/Barra Lateral Familias/Perfil.png"
              alt=""
              className="w-[22px] h-[22px] shrink-0"
            />
            Perfil
          </Link>
          <LogoutButton
            className="flex items-center gap-2.5 text-left text-base font-semibold text-slate-600 hover:text-sky-600"
            icono="/Barra Lateral Familias/Salir.png"
            iconoClassName="w-[22px] h-[22px]"
          />
        </div>
      </div>
    </div>
  );
}
