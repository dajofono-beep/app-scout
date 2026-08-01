"use client";

import { useState } from "react";

// La rama "Adultos" no participa del esquema de hermanos/orden (pensado
// para los chicos), así que esos dos campos se deshabilitan y se limpian
// apenas se elige esa rama.
export default function CamposRamaHermanos({
  ramas,
  familias,
  ramaIdInicial = "",
  familiaIdInicial = "",
  ordenFamiliaInicial = "",
}) {
  const [ramaId, setRamaId] = useState(ramaIdInicial);
  const [familiaId, setFamiliaId] = useState(familiaIdInicial);
  const [ordenFamilia, setOrdenFamilia] = useState(ordenFamiliaInicial);

  const ramaSeleccionada = ramas.find((r) => r.id === ramaId);
  const esAdultos = ramaSeleccionada?.nombre === "Adultos";

  function alCambiarRama(e) {
    const nuevoId = e.target.value;
    setRamaId(nuevoId);
    const nuevaRama = ramas.find((r) => r.id === nuevoId);
    if (nuevaRama?.nombre === "Adultos") {
      setFamiliaId("");
      setOrdenFamilia("");
    }
  }

  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Rama
        </label>
        <select
          name="rama_id"
          required
          value={ramaId}
          onChange={alCambiarRama}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        >
          <option value="" disabled>
            Elegir rama...
          </option>
          {ramas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Hermanos (opcional)
        </label>
        <select
          name="familia_id"
          value={familiaId}
          onChange={(e) => setFamiliaId(e.target.value)}
          disabled={esAdultos}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 disabled:bg-slate-50 disabled:text-slate-300"
        >
          <option value="">Sin hermanos</option>
          {familias.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nombre}
            </option>
          ))}
        </select>
        {esAdultos && (
          <p className="text-xs text-slate-400 mt-1">
            No aplica para la rama Adultos.
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Orden entre hermanos (1º, 2º...)
        </label>
        <input
          name="orden_familia"
          type="number"
          min="1"
          value={ordenFamilia}
          onChange={(e) => setOrdenFamilia(e.target.value)}
          disabled={esAdultos}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 disabled:bg-slate-50 disabled:text-slate-300"
        />
      </div>
    </>
  );
}
