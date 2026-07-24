"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-6 space-y-4"
      >
        <img
          src="/logo-azimut.png"
          alt="Azimut - Grupo Scout Libertador San Martín"
          className="w-full max-w-[240px] mx-auto"
        />
        <h1 className="text-base font-semibold text-center text-slate-500">
          Ingreso administrador
        </h1>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>

        {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
