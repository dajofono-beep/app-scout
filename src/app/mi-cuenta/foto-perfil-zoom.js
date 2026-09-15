"use client";

import { useRef, useState } from "react";

// Avatar clickeable: al tocarlo, la foto viaja desde su posición
// original hasta el centro de la pantalla y crece para verse completa
// (con un fondo oscuro detrás); tocando cualquier parte de la pantalla
// vuelve a achicarse y a su lugar original. Si no hay foto propia
// (se muestra el logo de Azimut de relleno), el click no hace nada.
export default function FotoPerfilZoom({ fotoUrl, nombreCompleto, className }) {
  const imgRef = useRef(null);
  const [estado, setEstado] = useState(null);

  function abrir() {
    const el = imgRef.current;
    if (!el || !fotoUrl) return;

    const origen = el.getBoundingClientRect();
    const lado = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.6, 360);
    const destino = {
      top: window.innerHeight / 2 - lado / 2,
      left: window.innerWidth / 2 - lado / 2,
      width: lado,
      height: lado,
    };

    setEstado({
      origen: { top: origen.top, left: origen.left, width: origen.width, height: origen.height },
      destino,
      expandido: false,
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEstado((e) => e && { ...e, expandido: true }));
    });
  }

  function cerrar() {
    setEstado((e) => (e ? { ...e, expandido: false } : e));
    setTimeout(() => setEstado(null), 300);
  }

  return (
    <>
      <img
        ref={imgRef}
        src={fotoUrl || "/icono-azimut.png"}
        alt={fotoUrl ? nombreCompleto : "Azimut"}
        onClick={abrir}
        className={`${className ?? ""} ${fotoUrl ? "cursor-pointer" : ""}`}
      />

      {estado && (
        <div
          onClick={cerrar}
          className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-300"
          style={{ opacity: estado.expandido ? 1 : 0 }}
        >
          <img
            src={fotoUrl}
            alt={nombreCompleto}
            onClick={(e) => e.stopPropagation()}
            className="fixed rounded-2xl object-cover shadow-2xl transition-all duration-300 ease-in-out"
            style={estado.expandido ? estado.destino : estado.origen}
          />
        </div>
      )}
    </>
  );
}
