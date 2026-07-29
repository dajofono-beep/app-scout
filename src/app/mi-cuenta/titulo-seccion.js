"use client";

import Link from "next/link";

// Tarjeta de título compartida por las secciones secundarias de "Mi
// cuenta": botón para volver a Principal a la izquierda, ícono + nombre
// de la sección a la derecha. "onVolver" se usa para las pestañas
// internas de CuentaNav (cambia de estado, sin navegar); "hrefVolver"
// se usa cuando la sección vive en su propia ruta (ej. Perfil).
export default function TituloSeccion({ icono, nombre, onVolver, hrefVolver }) {
  const claseBoton =
    "w-12 h-12 flex items-center justify-center rounded-lg text-slate-600 hover:bg-sky-50 shrink-0";

  const boton = hrefVolver ? (
    <Link href={hrefVolver} aria-label="Volver a Principal" className={claseBoton}>
      <img src="/Atras.png" alt="" className="w-9 h-9 object-contain" />
    </Link>
  ) : (
    <button
      type="button"
      onClick={onVolver}
      aria-label="Volver a Principal"
      className={claseBoton}
    >
      <img src="/Atras.png" alt="" className="w-9 h-9 object-contain" />
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 flex items-center justify-between mb-4">
      {boton}
      <div className="flex items-center gap-2">
        {icono && <img src={icono} alt="" className="w-8 h-8 object-contain shrink-0" />}
        <p className="font-bold text-slate-800">{nombre}</p>
      </div>
    </div>
  );
}
