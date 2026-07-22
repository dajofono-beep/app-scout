import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarFamilia, eliminarFamilia } from "../actions";
import { iniciales, colorPara } from "../../miembros/avatar";

export default async function FichaFamiliaPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: familia } = await supabase
    .from("familias")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!familia) notFound();

  const { data: miembros } = await supabase
    .from("miembros")
    .select("id, nombre, apellido, rama_id, orden_familia")
    .eq("familia_id", id)
    .order("orden_familia", { ascending: true, nullsFirst: false })
    .order("apellido");

  return (
    <div className="max-w-lg">
      <Link href="/admin/familias" className="text-sm text-blue-600 underline">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{familia.nombre}</h1>

      <form
        action={actualizarFamilia}
        className="bg-white rounded shadow p-4 space-y-3"
      >
        <input type="hidden" name="id" value={familia.id} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            name="nombre"
            defaultValue={familia.nombre}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white rounded py-2 font-medium"
          >
            Guardar cambios
          </button>
          <button
            formAction={eliminarFamilia}
            className="flex-1 border border-red-300 text-red-600 rounded py-2 font-medium"
          >
            Eliminar familia
          </button>
        </div>
      </form>

      <div className="bg-white rounded shadow p-4 mt-4">
        <h2 className="font-semibold mb-3">
          Miembros ({(miembros ?? []).length})
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          El orden (1º, 2º, 3º hijo) se asigna desde la ficha de cada
          miembro y define el descuento por hermanos.
        </p>
        <div className="space-y-2">
          {(miembros ?? []).map((m) => (
            <Link
              key={m.id}
              href={`/admin/miembros/${m.id}`}
              className="flex items-center gap-3 hover:bg-gray-50 rounded p-1"
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${colorPara(m.rama_id)}`}
              >
                {iniciales(m.nombre, m.apellido)}
              </span>
              <span className="text-sm text-gray-900">
                {m.orden_familia ? `${m.orden_familia}º · ` : ""}
                {m.apellido}, {m.nombre}
              </span>
            </Link>
          ))}
          {(miembros ?? []).length === 0 && (
            <p className="text-gray-500 text-sm">
              Sin miembros asignados todavía.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
