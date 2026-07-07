import { createClient } from "@/lib/supabase/server";
import { crearMiembro, actualizarMiembro } from "./actions";

export default async function MiembrosPage({ searchParams }) {
  const params = await searchParams;
  const filtroNombre = params?.nombre ?? "";
  const filtroRama = params?.rama_id ?? "";
  const filtroFamilia = params?.familia_id ?? "";
  const filtroActivo = params?.activo ?? "";

  const supabase = await createClient();

  const { data: ramas } = await supabase
    .from("ramas")
    .select("*")
    .order("nombre");

  const { data: familias } = await supabase
    .from("familias")
    .select("*")
    .order("nombre");

  let query = supabase
    .from("miembros")
    .select("*, ramas(nombre), familias(nombre)")
    .order("apellido");

  if (filtroNombre) {
    query = query.or(
      `nombre.ilike.%${filtroNombre}%,apellido.ilike.%${filtroNombre}%`
    );
  }
  if (filtroRama) query = query.eq("rama_id", filtroRama);
  if (filtroFamilia) query = query.eq("familia_id", filtroFamilia);
  if (filtroActivo === "activos") query = query.eq("activo", true);
  if (filtroActivo === "inactivos") query = query.eq("activo", false);

  const { data: miembros } = await query;

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Miembros</h1>

      {(ramas ?? []).length === 0 ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 mb-6">
          Primero tenés que crear al menos una rama en la sección{" "}
          <strong>Ramas</strong>.
        </p>
      ) : (
        <form
          action={crearMiembro}
          className="bg-white rounded shadow p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3"
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
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Fecha de nacimiento
            </label>
            <input
              name="fecha_nacimiento"
              type="date"
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <button
            type="submit"
            className="sm:col-span-3 bg-blue-600 text-white rounded py-2 font-medium"
          >
            Crear miembro
          </button>
        </form>
      )}

      <form
        method="GET"
        className="bg-white rounded shadow p-3 mb-4 flex flex-wrap items-end gap-2"
      >
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Nombre / Apellido
          </label>
          <input
            name="nombre"
            defaultValue={filtroNombre}
            placeholder="Buscar..."
            className="border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Rama</label>
          <select
            name="rama_id"
            defaultValue={filtroRama}
            className="border rounded px-2 py-1"
          >
            <option value="">Todas</option>
            {(ramas ?? []).map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Familia</label>
          <select
            name="familia_id"
            defaultValue={filtroFamilia}
            className="border rounded px-2 py-1"
          >
            <option value="">Todas</option>
            {(familias ?? []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Estado</label>
          <select
            name="activo"
            defaultValue={filtroActivo}
            className="border rounded px-2 py-1"
          >
            <option value="">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          Filtrar
        </button>
        <a
          href="/admin/miembros"
          className="text-sm text-gray-600 underline mb-2"
        >
          Limpiar
        </a>
      </form>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="p-2 font-medium">Nombre</th>
              <th className="p-2 font-medium">Apellido</th>
              <th className="p-2 font-medium">DNI</th>
              <th className="p-2 font-medium">Rama</th>
              <th className="p-2 font-medium">Familia</th>
              <th className="p-2 font-medium">Orden</th>
              <th className="p-2 font-medium">Fecha nac.</th>
              <th className="p-2 font-medium">Activo</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {(miembros ?? []).map((m) => {
              const formId = `miembro-${m.id}`;
              return (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="p-2">
                    <form id={formId} action={actualizarMiembro} />
                    <input type="hidden" name="id" value={m.id} form={formId} />
                    <input
                      name="nombre"
                      defaultValue={m.nombre}
                      form={formId}
                      className="border rounded px-2 py-1 w-24"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      name="apellido"
                      defaultValue={m.apellido}
                      form={formId}
                      className="border rounded px-2 py-1 w-24"
                    />
                  </td>
                  <td className="p-2 text-gray-500">{m.dni}</td>
                  <td className="p-2">
                    <select
                      name="rama_id"
                      defaultValue={m.rama_id}
                      form={formId}
                      className="border rounded px-2 py-1"
                    >
                      {(ramas ?? []).map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      name="familia_id"
                      defaultValue={m.familia_id ?? ""}
                      form={formId}
                      className="border rounded px-2 py-1"
                    >
                      <option value="">Sin familia</option>
                      {(familias ?? []).map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      name="orden_familia"
                      type="number"
                      min="1"
                      defaultValue={m.orden_familia ?? ""}
                      form={formId}
                      className="border rounded px-2 py-1 w-16"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      name="fecha_nacimiento"
                      type="date"
                      defaultValue={m.fecha_nacimiento ?? ""}
                      form={formId}
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      name="activo"
                      defaultChecked={m.activo}
                      form={formId}
                    />
                  </td>
                  <td className="p-2">
                    <button
                      type="submit"
                      form={formId}
                      className="text-sm text-blue-600 underline"
                    >
                      Guardar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(miembros ?? []).length === 0 && (
          <p className="text-gray-500 text-sm p-4">
            No hay miembros para este filtro.
          </p>
        )}
      </div>
    </div>
  );
}
