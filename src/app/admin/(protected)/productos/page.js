import { createClient } from "@/lib/supabase/server";
import {
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "./actions";

export default async function ProductosPage() {
  const supabase = await createClient();
  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Productos</h1>

      <form
        action={crearProducto}
        className="bg-white rounded shadow p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <input
          name="nombre"
          required
          placeholder="Nombre (ej. Cuota mensual)"
          className="border rounded px-3 py-2"
        />
        <input
          name="importe"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="Importe"
          className="border rounded px-3 py-2"
        />
        <input
          name="descripcion"
          placeholder="Descripción (opcional)"
          className="border rounded px-3 py-2 sm:col-span-2"
        />
        <button
          type="submit"
          className="sm:col-span-2 bg-blue-600 text-white rounded py-2 font-medium"
        >
          Crear producto
        </button>
      </form>

      <div className="space-y-2">
        {(productos ?? []).map((p) => (
          <form
            key={p.id}
            action={actualizarProducto}
            className="bg-white rounded shadow p-3 flex flex-wrap items-center gap-2"
          >
            <input type="hidden" name="id" value={p.id} />
            <input
              name="nombre"
              defaultValue={p.nombre}
              className="border rounded px-2 py-1 w-40"
            />
            <input
              name="importe"
              type="number"
              step="0.01"
              min="0"
              defaultValue={p.importe}
              className="border rounded px-2 py-1 w-28"
            />
            <input
              name="descripcion"
              defaultValue={p.descripcion ?? ""}
              className="border rounded px-2 py-1 flex-1 min-w-[10rem]"
            />
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="activo" defaultChecked={p.activo} />
              Activo
            </label>
            <button type="submit" className="text-sm text-blue-600 underline">
              Guardar
            </button>
            <button
              formAction={eliminarProducto}
              className="text-sm text-red-600 underline"
            >
              Eliminar
            </button>
          </form>
        ))}
        {(productos ?? []).length === 0 && (
          <p className="text-gray-500 text-sm">
            Todavía no hay productos cargados.
          </p>
        )}
      </div>
    </div>
  );
}
