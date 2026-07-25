import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarEfemeride, eliminarEfemeride } from "../actions";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default async function FichaEfemeridePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: efemeride } = await supabase
    .from("efemerides")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!efemeride) notFound();

  return (
    <div className="max-w-md">
      <Link href="/admin/efemerides" className="text-sm text-sky-600 font-semibold">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{efemeride.nombre}</h1>

      {efemeride.imagen_url && (
        <img
          src={efemeride.imagen_url}
          alt={efemeride.nombre}
          className="w-full rounded-2xl shadow-sm mb-4"
        />
      )}

      <form
        action={actualizarEfemeride}
        className="bg-white rounded-2xl shadow-sm p-5 space-y-3"
      >
        <input type="hidden" name="id" value={efemeride.id} />
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Nombre
          </label>
          <input
            name="nombre"
            defaultValue={efemeride.nombre}
            required
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Mes
            </label>
            <select
              name="mes"
              required
              defaultValue={efemeride.mes}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            >
              {MESES.map((mes, i) => (
                <option key={mes} value={i + 1}>
                  {mes}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Día
            </label>
            <input
              name="dia"
              type="number"
              min="1"
              max="31"
              defaultValue={efemeride.dia}
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Mensaje (opcional)
          </label>
          <textarea
            name="mensaje"
            rows={3}
            defaultValue={efemeride.mensaje ?? ""}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            {efemeride.imagen_url ? "Reemplazar imagen / placa" : "Imagen / placa alusiva (opcional)"}
          </label>
          <input type="file" name="imagen" accept="image/*" className="text-sm w-full" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="activo" defaultChecked={efemeride.activo} />
          Activa
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-sky-600 text-white rounded-full py-2.5 font-bold"
          >
            Guardar cambios
          </button>
          <button
            formAction={eliminarEfemeride}
            className="flex-1 border border-red-300 text-red-600 rounded-full py-2.5 font-bold"
          >
            Eliminar
          </button>
        </div>
      </form>
    </div>
  );
}
