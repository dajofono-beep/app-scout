import { createClient } from "@/lib/supabase/server";
import {
  actualizarPorcentaje,
  agregarPosicion,
  eliminarPosicion,
} from "./actions";

export default async function DescuentosPage() {
  const supabase = await createClient();
  const { data: escala } = await supabase
    .from("escala_descuentos_familia")
    .select("*")
    .order("posicion");

  const siguientePosicion = ((escala ?? []).at(-1)?.posicion ?? 0) + 1;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Descuento por hermanos</h1>
      <p className="text-sm text-gray-500 mb-6">
        Define qué porcentaje del importe paga cada hijo según su posición
        dentro de la familia (1º, 2º, 3º...). Se asigna la posición de cada
        miembro desde <strong>Miembros</strong>. Si un miembro tiene una
        posición mayor a las cargadas acá, se usa el porcentaje de la última
        fila. Solo aplica a productos con &quot;Aplica descuento por
        hermanos&quot; activado.
      </p>

      <div className="space-y-2 mb-6">
        {(escala ?? []).map((e) => (
          <form
            key={e.posicion}
            action={actualizarPorcentaje}
            className="bg-white rounded shadow p-3 flex items-center gap-2"
          >
            <input type="hidden" name="posicion" value={e.posicion} />
            <span className="w-16 font-medium">{e.posicion}º hijo</span>
            <input
              name="porcentaje"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={e.porcentaje}
              className="border rounded px-2 py-1 w-24"
            />
            <span className="text-sm text-gray-500">%</span>
            <button type="submit" className="text-sm text-blue-600 underline">
              Guardar
            </button>
            <button
              formAction={eliminarPosicion}
              className="text-sm text-red-600 underline"
            >
              Eliminar
            </button>
          </form>
        ))}
        {(escala ?? []).length === 0 && (
          <p className="text-gray-500 text-sm">
            Todavía no hay ninguna posición cargada.
          </p>
        )}
      </div>

      <form
        action={agregarPosicion}
        className="bg-white rounded shadow p-4 flex items-end gap-2"
      >
        <div>
          <label className="block text-xs text-gray-500 mb-1">Posición</label>
          <input
            name="posicion"
            type="number"
            min="1"
            required
            defaultValue={siguientePosicion}
            className="border rounded px-2 py-1 w-20"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Porcentaje
          </label>
          <input
            name="porcentaje"
            type="number"
            step="0.01"
            min="0"
            max="100"
            required
            className="border rounded px-2 py-1 w-24"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 font-medium"
        >
          Agregar
        </button>
      </form>
    </div>
  );
}
