import { createClient } from "@/lib/supabase/server";
import { crearRama, actualizarRama, eliminarRama } from "./actions";

export default async function RamasPage() {
  const supabase = await createClient();
  const { data: ramas } = await supabase
    .from("ramas")
    .select("*")
    .order("orden")
    .order("nombre");

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Ramas</h1>

      <form
        action={crearRama}
        className="bg-white rounded shadow p-4 flex gap-2 mb-6"
      >
        <input
          name="nombre"
          required
          placeholder="Nombre de la rama"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 font-medium"
        >
          Agregar
        </button>
      </form>

      <ul className="space-y-2">
        {(ramas ?? []).map((rama) => (
          <li
            key={rama.id}
            className="bg-white rounded shadow p-3 flex items-center gap-2"
          >
            <form action={actualizarRama} className="flex-1 flex gap-2">
              <input type="hidden" name="id" value={rama.id} />
              <input
                name="nombre"
                defaultValue={rama.nombre}
                className="flex-1 border rounded px-2 py-1"
              />
              <button type="submit" className="text-sm text-blue-600 underline">
                Guardar
              </button>
            </form>
            <form action={eliminarRama}>
              <input type="hidden" name="id" value={rama.id} />
              <button type="submit" className="text-sm text-red-600 underline">
                Eliminar
              </button>
            </form>
          </li>
        ))}
        {(ramas ?? []).length === 0 && (
          <p className="text-gray-500 text-sm">Todavía no hay ramas cargadas.</p>
        )}
      </ul>
    </div>
  );
}
