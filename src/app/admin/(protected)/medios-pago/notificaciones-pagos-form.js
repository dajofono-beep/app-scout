"use client";

import { useState } from "react";
import { guardarNotificacionesPagosConfig } from "./actions";
import CampoPassword from "@/components/campo-password";

export default function NotificacionesPagosForm({ config }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guardado, setGuardado] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setGuardado(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await guardarNotificacionesPagosConfig(formData);
      setGuardado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="off"
      className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
    >
      <div>
        <h2 className="font-bold">Notificaciones Pagos</h2>
        <p className="text-sm text-slate-500 mt-1">
          Cuando una familia registra un pago, se manda un mail de aviso a los
          administradores que tengan activado &quot;Recibir notificaciones de
          pagos&quot; en su ficha (sección Administradores).
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Cuenta de Gmail que envía los avisos
        </label>
        <input
          name="email"
          type="email"
          defaultValue={config.email ?? ""}
          autoComplete="off"
          placeholder="Ej. grupo@gmail.com"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Contraseña de aplicación
        </label>
        <CampoPassword
          name="app_password"
          defaultValue={config.app_password ?? ""}
          autoComplete="new-password"
          placeholder="xxxx xxxx xxxx xxxx"
        />
        <p className="text-xs text-slate-400 mt-1">
          No es la contraseña normal de la cuenta de Gmail. Se genera desde esa
          cuenta de Google en Seguridad → Verificación en dos pasos →
          Contraseñas de aplicaciones (hace falta tener activada la
          verificación en dos pasos).
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="activo" defaultChecked={config.activo ?? false} />
        Enviar los avisos por mail
      </label>
      <p className="text-xs text-slate-400 -mt-2">
        Si lo desactivás, los pagos se siguen registrando igual — solo se
        deja de mandar el aviso por mail.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar"}
      </button>

      {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
      {guardado && (
        <p className="text-sm text-emerald-700 font-semibold">Guardado.</p>
      )}
    </form>
  );
}
