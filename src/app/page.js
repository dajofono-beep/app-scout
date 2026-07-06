"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FamilyLoginPage() {
  const router = useRouter();
  const [ramas, setRamas] = useState([]);
  const [ramaSeleccionada, setRamaSeleccionada] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [dni, setDni] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("ramas")
      .select("*")
      .order("orden")
      .order("nombre")
      .then(({ data }) => {
        setRamas(data ?? []);
        setCargando(false);
      });
  }, []);

  async function seleccionarRama(rama) {
    setError(null);
    setRamaSeleccionada(rama);
    const supabase = createClient();
    const { data } = await supabase
      .from("miembros_publico")
      .select("*")
      .eq("rama_id", rama.id)
      .order("apellido");
    setMiembros(data ?? []);
  }

  function volverARamas() {
    setRamaSeleccionada(null);
    setMiembros([]);
    setMiembroSeleccionado(null);
    setDni("");
    setError(null);
  }

  function volverAMiembros() {
    setMiembroSeleccionado(null);
    setDni("");
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const email = `m${miembroSeleccionado.id}@grupo.local`;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: dni,
    });

    setLoading(false);

    if (error) {
      setError("DNI incorrecto.");
      return;
    }

    router.push("/mi-cuenta");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-center mb-6">
          Cuentas corrientes del grupo
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          {cargando && (
            <p className="text-sm text-gray-500 text-center">Cargando...</p>
          )}

          {!cargando && !ramaSeleccionada && (
            <>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Elegí tu rama
              </p>
              <div className="space-y-2">
                {ramas.map((rama) => (
                  <button
                    key={rama.id}
                    onClick={() => seleccionarRama(rama)}
                    className="w-full text-left border rounded px-3 py-2 hover:bg-gray-50"
                  >
                    {rama.nombre}
                  </button>
                ))}
                {ramas.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Todavía no hay ramas cargadas.
                  </p>
                )}
              </div>
            </>
          )}

          {ramaSeleccionada && !miembroSeleccionado && (
            <>
              <button
                onClick={volverARamas}
                className="text-sm text-blue-600 underline mb-3"
              >
                ← Volver
              </button>
              <p className="text-sm font-medium text-gray-700 mb-3">
                {ramaSeleccionada.nombre}: elegí tu nombre
              </p>
              <div className="space-y-2">
                {miembros.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMiembroSeleccionado(m)}
                    className="w-full text-left border rounded px-3 py-2 hover:bg-gray-50"
                  >
                    {m.apellido}, {m.nombre}
                  </button>
                ))}
                {miembros.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No hay miembros cargados en esta rama.
                  </p>
                )}
              </div>
            </>
          )}

          {miembroSeleccionado && (
            <form onSubmit={handleSubmit}>
              <button
                type="button"
                onClick={volverAMiembros}
                className="text-sm text-blue-600 underline mb-3"
              >
                ← Volver
              </button>
              <p className="text-sm font-medium text-gray-700 mb-3">
                {miembroSeleccionado.apellido}, {miembroSeleccionado.nombre}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI
              </label>
              <input
                type="password"
                inputMode="numeric"
                required
                autoFocus
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-3"
              />

              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded py-2 font-medium disabled:opacity-50"
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
