import { createClient } from "@/lib/supabase/server";
import { crearMiembro, actualizarMiembro } from "./actions";

export default async function MiembrosPage() {
  const supabase = await createClient();

  const { data: ramas } = await supabase
    .from("ramas")
    .select("*")
    .order("nombre");

  const { data: familias } = await supabase
    .from("familias")
    .select("*")
    .order("nombre");

  const { data: miembros } = await supabase
    .from("miembros")
    .select("*, ramas(nombre)")
    .order("apellido");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Miembros</h1>

      {(ramas ?? []).length === 0 ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 mb-6">
          Primero tenés que crear al menos una rama en la sección{" "}
          <strong>Ramas</strong>.
        </p>
      ) : (
        <form
          action={crearMiembro}
          className="bg-white rounded shadow p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <input
            name="nombre"
            placeholder="Nombre"
            required
            className="border rounded px-3 py-2"
          />
          <input
            name="apellido"
            placeholder="Apellido"
            required
            className="border rounded px-3 py-2"
          />
          <input
            name="dni"
            placeholder="DNI (será la contraseña inicial)"
            required
            className="border rounded px-3 py-2"
          />
          <select
            name="rama_id"
            required
            defaultValue=""
            className="border rounded px-3 py-2"
          >
            <option value="" disabled>
              Rama...
            </option>
            {ramas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
          <select
            name="familia_id"
            defaultValue=""
            className="border rounded px-3 py-2"
          >
            <option value="">Sin familia</option>
            {(familias ?? []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
          <input
            name="orden_familia"
            type="number"
            min="1"
            placeholder="Orden en la familia (1º, 2º...)"
            className="border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="sm:col-span-2 bg-blue-600 text-white rounded py-2 font-medium"
          >
            Crear miembro
          </button>
        </form>
      )}

      <div className="space-y-2">
        {(miembros ?? []).map((m) => (
          <form
            key={m.id}
            action={actualizarMiembro}
            className="bg-white rounded shadow p-3 flex flex-wrap items-center gap-2"
          >
            <input type="hidden" name="id" value={m.id} />
            <input
              name="nombre"
              defaultValue={m.nombre}
              className="border rounded px-2 py-1 w-28"
            />
            <input
              name="apellido"
              defaultValue={m.apellido}
              className="border rounded px-2 py-1 w-28"
            />
            <select
              name="rama_id"
              defaultValue={m.rama_id}
              className="border rounded px-2 py-1"
            >
              {(ramas ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
            <select
              name="familia_id"
              defaultValue={m.familia_id ?? ""}
              className="border rounded px-2 py-1"
            >
              <option value="">Sin familia</option>
              {(familias ?? []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre}
                </option>
              ))}
            </select>
            <input
              name="orden_familia"
              type="number"
              min="1"
              defaultValue={m.orden_familia ?? ""}
              placeholder="Orden"
              className="border rounded px-2 py-1 w-20"
            />
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="activo" defaultChecked={m.activo} />
              Activo
            </label>
            <button type="submit" className="text-sm text-blue-600 underline">
              Guardar
            </button>
          </form>
        ))}
        {(miembros ?? []).length === 0 && (
          <p className="text-gray-500 text-sm">
            Todavía no hay miembros cargados.
          </p>
        )}
      </div>
    </div>
  );
}
