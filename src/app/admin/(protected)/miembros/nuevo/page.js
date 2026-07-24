import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { crearMiembro } from "../actions";

export default async function NuevoMiembroPage() {
  const supabase = await createClient();

  const { data: ramas } = await supabase
    .from("ramas")
    .select("*")
    .order("nombre");
  const { data: familias } = await supabase
    .from("familias")
    .select("*")
    .order("nombre");

  return (
    <div className="max-w-lg">
      <Link href="/admin/miembros" className="text-sm text-sky-600 font-semibold">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Nuevo miembro</h1>

      {(ramas ?? []).length === 0 ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
          Primero tenés que crear al menos una rama en la sección{" "}
          <Link href="/admin/ramas" className="underline">
            Ramas
          </Link>
          .
        </p>
      ) : (
        <form action={crearMiembro} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Nombre
            </label>
            <input
              name="nombre"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Apellido
            </label>
            <input
              name="apellido"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              DNI
            </label>
            <input
              name="dni"
              required
              placeholder="Será la contraseña inicial"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Rama
            </label>
            <select
              name="rama_id"
              required
              defaultValue=""
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            >
              <option value="" disabled>
                Elegir rama...
              </option>
              {ramas.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Familia (opcional)
            </label>
            <select
              name="familia_id"
              defaultValue=""
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            >
              <option value="">Sin familia</option>
              {(familias ?? []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Orden en la familia (1º, 2º...)
            </label>
            <input
              name="orden_familia"
              type="number"
              min="1"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Fecha de nacimiento
            </label>
            <input
              name="fecha_nacimiento"
              type="date"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold"
          >
            Crear miembro
          </button>
        </form>
      )}
    </div>
  );
}
