"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Quicksand } from "next/font/google";
import { createClient } from "@/lib/supabase/client";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default function CambiarClavePage() {
  const router = useRouter();
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
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setOk(true);
    setPassword("");
    setConfirmacion("");
  }

  return (
    <div
      className={`${quicksand.variable} min-h-screen flex items-center justify-center bg-sky-50 px-4`}
      style={{ fontFamily: "var(--font-quicksand)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-6 space-y-4"
      >
        <h1 className="text-xl font-bold text-center text-slate-800">
          Cambiar contraseña
        </h1>

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
          {loading ? "Guardando..." : "Guardar"}
        </button>

        <Link
          href="/mi-cuenta"
          className="block text-center text-sm text-sky-600 font-semibold"
        >
          Volver a mi cuenta
        </Link>
      </form>
    </div>
  );
}
