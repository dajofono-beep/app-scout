"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Quicksand } from "next/font/google";
import { createClient } from "@/lib/supabase/client";
import { ingresarFamilia } from "./login-actions";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

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

  // En el celular, el botón/gesto Atrás desde esta pantalla cierra la
  // app en vez de volver a páginas viejas de una sesión anterior (p.
  // ej. si se llegó acá después de cerrar sesión desde Mi Cuenta). En
  // PC se deja el comportamiento normal del navegador.
  useEffect(() => {
    let vaciando = false;

    function vaciarHistorial() {
      vaciando = true;
      let restantes = window.history.length + 2;
      function paso() {
        if (restantes <= 0) {
          vaciando = false;
          return;
        }
        restantes--;
        window.history.back();
        setTimeout(paso, 30);
      }
      paso();
    }

    function alPresionarAtras() {
      // Ignora los "atrás" que dispara el propio vaciado en cadena.
      if (vaciando) return;
      if (window.innerWidth >= 768) return;
      // Si venimos de Mi Cuenta, el historial de atrás todavía tiene
      // entradas de /mi-cuenta: al vaciar, Next.js puede remontar esa
      // pantalla un instante (y su propio manejador de Atrás pediría una
      // segunda pulsación). Esta bandera le avisa que no intercepte.
      window.__azimutCerrandoApp = true;
      setTimeout(() => {
        window.__azimutCerrandoApp = false;
      }, 3000);
      window.close();
      // Un solo salto grande (history.go) no es confiable en el
      // navegador del celular cuando el historial es profundo (p. ej.
      // después de haber navegado bastante por Mi Cuenta); se vacía de
      // a un paso genuino por vez, como si se presionara Atrás varias
      // veces seguidas.
      vaciarHistorial();
    }

    window.addEventListener("popstate", alPresionarAtras);
    return () => window.removeEventListener("popstate", alPresionarAtras);
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

    const resultado = await ingresarFamilia(miembroId, dni);

    setLoading(false);

    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }

    router.push("/mi-cuenta");
    router.refresh();
  }

  return (
    <div
      className={`${quicksand.variable} min-h-screen flex items-start justify-center bg-sky-50 px-4 pt-12 pb-10`}
      style={{ fontFamily: "var(--font-quicksand)" }}
    >
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-sm px-6 pt-4 pb-6">
          <img
            src="/logo-azimut.png"
            alt="Azimut - Grupo Scout Libertador San Martín"
            className="w-full max-w-[340px] mx-auto mb-1"
          />
          <h1 className="text-base font-semibold text-center text-slate-500 mb-6">
            Ingreso Participantes Grupo
          </h1>

          {cargando ? (
            <p className="text-sm text-slate-400 text-center">Cargando...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                  Rama
                </label>
                <select
                  required
                  value={ramaId}
                  onChange={handleRamaChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
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
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                  Nombre
                </label>
                <select
                  required
                  disabled={!ramaId}
                  value={miembroId}
                  onChange={(e) => setMiembroId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 disabled:bg-slate-50 disabled:text-slate-300"
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
                  <p className="text-xs text-slate-400 mt-1">
                    No hay miembros cargados en esta rama.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  disabled={!miembroId}
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 disabled:bg-slate-50"
                />
              </div>

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <button
                type="submit"
                disabled={loading || !miembroId}
                className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
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
