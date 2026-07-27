"use client";

import { useState } from "react";
import { actualizarPerfil } from "./actions";

export default function PerfilForm({
  fotoUrl,
  telefono,
  redSocial1,
  redSocial2,
  redSocial3,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setExito(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await actualizarPerfil(formData);
      setExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {fotoUrl && (
        <img
          src={fotoUrl}
          alt="Foto de perfil"
          className="w-20 h-20 rounded-full object-cover mx-auto"
        />
      )}
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Foto de perfil
        </label>
        <input type="file" name="foto" accept="image/*" className="text-sm w-full" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Teléfono
        </label>
        <input
          name="telefono"
          type="tel"
          defaultValue={telefono ?? ""}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Red social 1
        </label>
        <input
          name="red_social_1"
          defaultValue={redSocial1 ?? ""}
          placeholder="Instagram, @usuario..."
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Red social 2
        </label>
        <input
          name="red_social_2"
          defaultValue={redSocial2 ?? ""}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Red social 3
        </label>
        <input
          name="red_social_3"
          defaultValue={redSocial3 ?? ""}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>

      {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
      {exito && (
        <p className="text-sm text-emerald-600 font-semibold">
          Perfil actualizado correctamente.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
