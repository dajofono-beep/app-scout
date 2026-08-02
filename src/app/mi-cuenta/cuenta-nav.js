"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";
import Descargas from "./descargas";
import Consultas from "./consultas";
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
  const [avisoSalir, setAvisoSalir] = useState(false);

  // Sincroniza el historial del navegador con la pestaña activa para que
  // el botón/gesto "Atrás" del celular navegue dentro de la app en vez de
  // cerrarla: entrar a una sección apila una entrada de historial; volver
  // a Principal la saca. Si ya estamos en Principal, "Atrás" muestra un
  // aviso y recién sale de la app si se presiona una segunda vez.
  const enSeccionRef = useRef(false);
  const ignorarProximoPopRef = useRef(false);
  const avisoSalirRef = useRef(false);
  const avisoTimeoutRef = useRef(null);

  useEffect(() => {
    avisoSalirRef.current = avisoSalir;
  }, [avisoSalir]);

  // Entrada de historial "base": sin esto, si el usuario nunca entra a una
  // sección, el primer Atrás en Principal no tiene nada nuestro que
  // interceptar y el navegador sale derecho de la app antes de que
  // nuestro código llegue a reaccionar.
  useEffect(() => {
    if (window.__azimutCerrandoApp) return;
    window.history.pushState({ azimutBase: true }, "");
  }, []);

  useEffect(() => {
    if (ignorarProximoPopRef.current) {
      ignorarProximoPopRef.current = false;
      enSeccionRef.current = activa !== "principal";
      return;
    }
    if (activa !== "principal" && !enSeccionRef.current) {
      window.history.pushState({ azimutSeccion: true }, "");
      enSeccionRef.current = true;
    } else if (activa !== "principal" && enSeccionRef.current) {
      window.history.replaceState({ azimutSeccion: true }, "");
    } else if (activa === "principal" && enSeccionRef.current) {
      enSeccionRef.current = false;
      ignorarProximoPopRef.current = true;
      window.history.back();
    }
  }, [activa]);

  useEffect(() => {
    function alPresionarAtras() {
      if (window.__azimutCerrandoApp) {
        // La app se está cerrando desde otra pantalla (p. ej. el login):
        // no interceptar, dejar que la salida siga su curso.
        return;
      }
      if (ignorarProximoPopRef.current) {
        ignorarProximoPopRef.current = false;
        return;
      }
      if (enSeccionRef.current) {
        ignorarProximoPopRef.current = true;
        enSeccionRef.current = false;
        setActiva("principal");
        return;
      }
      if (avisoSalirRef.current) {
        // Segunda vez en Principal: dejamos que la salida siga su curso.
        return;
      }
      window.history.pushState({ azimutSalir: true }, "");
      setAvisoSalir(true);
      if (avisoTimeoutRef.current) clearTimeout(avisoTimeoutRef.current);
      avisoTimeoutRef.current = setTimeout(() => setAvisoSalir(false), 2000);
    }
    window.addEventListener("popstate", alPresionarAtras);
    return () => window.removeEventListener("popstate", alPresionarAtras);
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-sky-50">
      {activa === "principal" && (
        <BarraCuenta
          nombreCompleto={nombreCompleto}
          ramaNombre={ramaNombre}
          fotoUrl={fotoUrl}
          activa={activa}
          onSeleccionar={setActiva}
        />
      )}
      {avisoSalir && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg md:hidden">
          Presioná Atrás de nuevo para salir
        </div>
      )}
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
        <div className={`max-w-2xl mx-auto ${activa === "consultas" ? "" : "hidden"}`}>
          <TituloSeccion
            icono="/Consultas/IconoSanMa.png"
            nombre="Consultas"
            onVolver={() => setActiva("principal")}
          />
          <Consultas />
        </div>
      </main>
    </div>
  );
}
