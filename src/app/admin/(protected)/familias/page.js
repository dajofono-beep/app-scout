import { createClient } from "@/lib/supabase/server";
import { crearFamilia, actualizarFamilia, eliminarFamilia } from "./actions";

export default async function FamiliasPage() {
  const supabase = await createClient();
  const { data: familias } = await supabase
    .from("familias")
    .select("*, miembros(id, nombre, apellido, orden_familia)")
    .order("nombre");

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Familias</h1>
      <p className="text-sm text-gray-500 mb-6">
        Agrupá miembros en una familia para que, al ingresar como cualquiera
        de ellos, puedan verse y pagar entre sí. El orden (1º, 2º, 3º hijo)
        se asigna desde <strong>Miembros</strong> y define el descuento por
        hermanos.
      </p>

      <form
        action={crearFamilia}
        className="bg-white rounded shadow p-4 flex gap-2 mb-6"
      >
        <input
          name="nombre"
          required
          placeholder="Nombre de la familia (ej. Familia Pérez)"
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
        {(familias ?? []).map((familia) => (
          <li key={familia.id} className="bg-white rounded shadow p-3">
            <div className="flex items-center gap-2 mb-2">
              <form action={actualizarFamilia} className="flex-1 flex gap-2">
                <input type="hidden" name="id" value={familia.id} />
                <input
                  name="nombre"
                  defaultValue={familia.nombre}
                  className="flex-1 border rounded px-2 py-1"
                />
                <button
                  type="submit"
                  className="text-sm text-blue-600 underline"
                >
                  Guardar
                </button>
              </form>
              <form action={eliminarFamilia}>
                <input type="hidden" name="id" value={familia.id} />
                <button
                  type="submit"
                  className="text-sm text-red-600 underline"
                >
                  Eliminar
                </button>
              </form>
            </div>
            <p className="text-xs text-gray-500">
              {(familia.miembros ?? []).length === 0
                ? "Sin miembros asignados todavía."
                : familia.miembros
                    .sort((a, b) => (a.orden_familia ?? 99) - (b.orden_familia ?? 99))
                    .map(
                      (m) =>
                        `${m.orden_familia ? `${m.orden_familia}º ` : ""}${m.apellido}, ${m.nombre}`
                    )
                    .join(" · ")}
            </p>
          </li>
        ))}
        {(familias ?? []).length === 0 && (
          <p className="text-gray-500 text-sm">
            Todavía no hay familias cargadas.
          </p>
        )}
      </ul>
    </div>
  );
}
