"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarAdministrador } from "./actions";
import CampoPassword from "@/components/campo-password";

export default function EditarAdministradorForm({ administrador, miembros }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const yaEsOpcion = (miembros ?? []).some(
    (m) => `${m.apellido}, ${m.nombre}` === administrador.nombre
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const nuevaPassword = formData.get("nueva_password")?.toString();
    const confirmar = formData.get("confirmar_password")?.toString();
    if (nuevaPassword && nuevaPassword !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const resultado = await actualizarAdministrador(formData);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      router.refresh();
    } catch {
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="off"
      className="bg-white rounded-2xl shadow-sm p-5 space-y-3"
    >
      <input type="hidden" name="auth_user_id" value={administrador.auth_user_id} />
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">Nombre</label>
        <select
          name="nombre"
          required
          defaultValue={administrador.nombre}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        >
          {!yaEsOpcion && <option value={administrador.nombre}>{administrador.nombre}</option>}
          {(miembros ?? []).map((m) => (
            <option key={m.id} value={`${m.apellido}, ${m.nombre}`}>
              {m.apellido}, {m.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Nueva contraseña
        </label>
        <CampoPassword
          name="nueva_password"
          minLength={6}
          autoComplete="new-password"
          placeholder="Dejar en blanco para no cambiarla"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Repetir nueva contraseña
        </label>
        <CampoPassword name="confirmar_password" minLength={6} autoComplete="new-password" />
      </div>

      {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
      >
        {loading ? "Un momento..." : "Guardar cambios"}
      </button>
    </form>
  );
}
