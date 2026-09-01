"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearAdministrador } from "./actions";
import CampoPassword from "@/components/campo-password";

export default function NuevoAdministradorForm({ miembros }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (formData.get("password") !== formData.get("confirmar_password")) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const resultado = await crearAdministrador(formData);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      router.push("/admin/administradores");
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
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">Nombre</label>
        <select
          name="nombre"
          required
          defaultValue=""
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        >
          <option value="" disabled>
            Elegí un miembro del grupo...
          </option>
          {(miembros ?? []).map((m) => (
            <option key={m.id} value={`${m.apellido}, ${m.nombre}`}>
              {m.apellido}, {m.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="off"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">Contraseña</label>
        <CampoPassword
          name="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Al menos 6 caracteres"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Repetir contraseña
        </label>
        <CampoPassword
          name="confirmar_password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
      >
        {loading ? "Un momento..." : "Crear administrador"}
      </button>
    </form>
  );
}
