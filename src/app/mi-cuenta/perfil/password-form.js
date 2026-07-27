"use client";

import { useState } from "react";
import { actualizarContrasena } from "./actions";

export default function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("password", password);
    formData.set("confirmacion", confirmacion);

    try {
      await actualizarContrasena(formData);
      setOk(true);
      setPassword("");
      setConfirmacion("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Nueva contraseña
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Repetir contraseña
        </label>
        <input
          type="password"
          required
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>

      {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
      {ok && (
        <p className="text-sm text-emerald-600 font-semibold">
          Contraseña actualizada correctamente.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
