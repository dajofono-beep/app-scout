import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarFechaImportante, eliminarFechaImportante } from "../actions";

export default async function FichaFechaImportantePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: fechaImportante } = await supabase
    .from("fechas_importantes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!fechaImportante) notFound();

  return (
    <div className="max-w-md">
      <Link
        href="/admin/fechas-importantes"
        className="text-sm text-sky-600 font-semibold"
      >
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{fechaImportante.nombre}</h1>

      {fechaImportante.imagen_url && (
        <img
          src={fechaImportante.imagen_url}
          alt={fechaImportante.nombre}
          className="w-full rounded-2xl shadow-sm mb-4"
        />
      )}

      <form
        action={actualizarFechaImportante}
        className="bg-white rounded-2xl shadow-sm p-5 space-y-3"
      >
        <input type="hidden" name="id" value={fechaImportante.id} />
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Nombre
          </label>
          <input
            name="nombre"
            defaultValue={fechaImportante.nombre}
            required
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Tipo de fecha
          </label>
          <select
            name="tipo"
            required
            defaultValue={fechaImportante.tipo}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          >
            <option value="efemeride">Efeméride</option>
            <option value="fecha_scout">Fecha scout</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Fecha de inicio
            </label>
            <input
              name="fecha_inicio"
              type="date"
              defaultValue={fechaImportante.fecha_inicio}
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Fecha de fin
            </label>
            <input
              name="fecha_fin"
              type="date"
              defaultValue={fechaImportante.fecha_fin}
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
            defaultValue={fechaImportante.mensaje ?? ""}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            {fechaImportante.imagen_url
              ? "Reemplazar imagen / placa"
              : "Imagen / placa alusiva (opcional)"}
          </label>
          <input type="file" name="imagen" accept="image/*" className="text-sm w-full" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={fechaImportante.activo}
          />
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
            formAction={eliminarFechaImportante}
            className="flex-1 border border-red-300 text-red-600 rounded-full py-2.5 font-bold"
          >
            Eliminar
          </button>
        </div>
      </form>
    </div>
  );
}
