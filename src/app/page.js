"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FamilyLoginPage() {
  const router = useRouter();
  const [ramas, setRamas] = useState([]);
  const [ramaId, setRamaId] = useState("");
  const [miembros, setMiembros] = useState([]);
  const [miembroId, setMiembroId] = useState("");
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

  async function handleRamaChange(e) {
    const nuevaRamaId = e.target.value;
    setRamaId(nuevaRamaId);
    setMiembroId("");
    setMiembros([]);
    setError(null);

    if (!nuevaRamaId) return;

    const supabase = createClient();
    const { data } = await supabase
      .from("miembros_publico")
      .select("*")
      .eq("rama_id", nuevaRamaId)
      .order("apellido");
    setMiembros(data ?? []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const email = `m${miembroId}@grupo.local`;
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
          {cargando ? (
            <p className="text-sm text-gray-500 text-center">Cargando...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rama
                </label>
                <select
                  required
                  value={ramaId}
                  onChange={handleRamaChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="" disabled>
                    Elegí tu rama...
                  </option>
                  {ramas.map((rama) => (
                    <option key={rama.id} value={rama.id}>
                      {rama.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <select
                  required
                  disabled={!ramaId}
                  value={miembroId}
                  onChange={(e) => setMiembroId(e.target.value)}
                  className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="" disabled>
                    {ramaId ? "Elegí tu nombre..." : "Elegí primero tu rama"}
                  </option>
                  {miembros.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.apellido}, {m.nombre}
                    </option>
                  ))}
                </select>
                {ramaId && miembros.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    No hay miembros cargados en esta rama.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  disabled={!miembroId}
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading || !miembroId}
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
