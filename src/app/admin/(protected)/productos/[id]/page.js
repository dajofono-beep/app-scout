import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarProducto, eliminarProducto } from "../actions";

export default async function FichaProductoPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: producto } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!producto) notFound();

  return (
    <div className="max-w-lg">
      <Link href="/admin/productos" className="text-sm text-blue-600 underline">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{producto.nombre}</h1>

      <form
        action={actualizarProducto}
        className="bg-white rounded shadow p-4 space-y-3"
      >
        <input type="hidden" name="id" value={producto.id} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            name="nombre"
            defaultValue={producto.nombre}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Importe
          </label>
          <input
            name="importe"
            type="number"
            step="0.01"
            min="0"
            defaultValue={producto.importe}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <input
            name="descripcion"
            defaultValue={producto.descripcion ?? ""}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="es_cuotable"
            defaultChecked={producto.es_cuotable}
          />
          Es cuotable
        </label>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad de cuotas
          </label>
          <input
            name="cantidad_cuotas"
            type="number"
            min="1"
            defaultValue={producto.cantidad_cuotas ?? ""}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="aplica_descuento_hermanos"
            defaultChecked={producto.aplica_descuento_hermanos}
          />
          Aplica descuento por hermanos
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={producto.activo}
          />
          Activo
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white rounded py-2 font-medium"
          >
            Guardar cambios
          </button>
          <button
            formAction={eliminarProducto}
            className="flex-1 border border-red-300 text-red-600 rounded py-2 font-medium"
          >
            Eliminar
          </button>
        </div>
      </form>
    </div>
  );
}
