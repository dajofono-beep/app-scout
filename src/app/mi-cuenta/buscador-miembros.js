"use client";

import { useMemo, useState } from "react";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export default function BuscadorMiembros({ directorio, ramas }) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [ramaFiltro, setRamaFiltro] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);

  const resultados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return directorio
      .filter((m) => !ramaFiltro || m.ramaId === ramaFiltro)
      .filter((m) => !texto || m.nombre.toLowerCase().includes(texto))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [directorio, busqueda, ramaFiltro]);

  function cerrarTodo() {
    setAbierto(false);
    setSeleccionado(null);
    setBusqueda("");
    setRamaFiltro("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Buscar miembros"
        className="shrink-0"
      >
        <img src="/Lupa.png" alt="Buscar" className="w-5 h-5 object-contain" />
      </button>

      {abierto && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={cerrarTodo}
        >
          <div
            className="bg-white rounded-2xl shadow-md w-full max-w-sm max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {!seleccionado ? (
              <>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <p className="font-bold text-slate-800">Buscar miembros</p>
                  <button
                    type="button"
                    onClick={cerrarTodo}
                    aria-label="Cerrar"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 space-y-2 border-b border-slate-100">
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                  />
                  <select
                    value={ramaFiltro}
                    onChange={(e) => setRamaFiltro(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                  >
                    <option value="">Todas las ramas</option>
                    {ramas.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="overflow-y-auto flex-1">
                  {resultados.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSeleccionado(m)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left border-b border-slate-50"
                    >
                      <img
                        src={m.fotoUrl || "/icono-azimut.png"}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-800 truncate">
                          {m.nombre}
                        </span>
                        <span className="block text-xs text-slate-400">{m.ramaNombre}</span>
                      </span>
                    </button>
                  ))}
                  {resultados.length === 0 && (
                    <p className="text-sm text-slate-400 text-center p-6">
                      No se encontraron miembros.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="p-5">
                <button
                  type="button"
                  onClick={() => setSeleccionado(null)}
                  className="text-sm font-semibold text-sky-600 mb-3"
                >
                  ← Volver a la búsqueda
                </button>
                <div className="text-center">
                  <img
                    src={seleccionado.fotoUrl || "/icono-azimut.png"}
                    alt={seleccionado.nombre}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
                  />
                  <p className="font-bold text-lg text-slate-800">{seleccionado.nombre}</p>
                  <p className="text-sm text-slate-400 mb-3">{seleccionado.ramaNombre}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cumpleaños</span>
                    <span className="text-slate-700 font-semibold">
                      {seleccionado.cumpleDia
                        ? `${seleccionado.cumpleDia} de ${MESES[seleccionado.cumpleMes - 1]}`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Teléfono</span>
                    <span className="text-slate-700 font-semibold">
                      {seleccionado.telefono || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Red social 1</span>
                    <span className="text-slate-700 font-semibold">
                      {seleccionado.redSocial1 || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Red social 2</span>
                    <span className="text-slate-700 font-semibold">
                      {seleccionado.redSocial2 || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Red social 3</span>
                    <span className="text-slate-700 font-semibold">
                      {seleccionado.redSocial3 || "—"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
