import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarRama, eliminarRama } from "../actions";
import { iniciales, colorPara } from "../../miembros/avatar";

export default async function FichaRamaPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: rama } = await supabase
    .from("ramas")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!rama) notFound();

  const { data: miembros } = await supabase
    .from("miembros")
    .select("id, nombre, apellido, rama_id")
    .eq("rama_id", id)
    .order("apellido");

  return (
    <div className="max-w-lg">
      <Link href="/admin/ramas" className="text-sm text-sky-600 font-semibold">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{rama.nombre}</h1>

      <form
        action={actualizarRama}
        className="bg-white rounded-2xl shadow-sm p-5 space-y-3"
      >
        <input type="hidden" name="id" value={rama.id} />
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Nombre
          </label>
          <input
            name="nombre"
            defaultValue={rama.nombre}
            required
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Orden (para el listado de la pantalla de ingreso)
          </label>
          <input
            name="orden"
            type="number"
            defaultValue={rama.orden}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-sky-600 text-white rounded-full py-2.5 font-bold"
          >
            Guardar cambios
          </button>
          <button
            formAction={eliminarRama}
            className="flex-1 border border-red-300 text-red-600 rounded-full py-2.5 font-bold"
          >
            Eliminar rama
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow-sm p-5 mt-4">
        <h2 className="font-semibold mb-3">
          Miembros ({(miembros ?? []).length})
        </h2>
        <div className="space-y-2">
          {(miembros ?? []).map((m) => (
            <Link
              key={m.id}
              href={`/admin/miembros/${m.id}`}
              className="flex items-center gap-3 hover:bg-slate-50 rounded-xl p-1"
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${colorPara(m.rama_id)}`}
              >
                {iniciales(m.nombre, m.apellido)}
              </span>
              <span className="text-sm text-slate-900">
                {m.apellido}, {m.nombre}
              </span>
            </Link>
          ))}
          {(miembros ?? []).length === 0 && (
            <p className="text-slate-500 text-sm">
              Todavía no hay miembros en esta rama.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
