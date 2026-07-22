import Link from "next/link";
import { crearRama } from "../actions";

export default function NuevaRamaPage() {
  return (
    <div className="max-w-md">
      <Link href="/admin/ramas" className="text-sm text-blue-600 underline">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Nueva rama</h1>

      <form action={crearRama} className="bg-white rounded shadow p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            name="nombre"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Orden (para el listado de la pantalla de ingreso)
          </label>
          <input
            name="orden"
            type="number"
            defaultValue={0}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded py-2 font-medium"
        >
          Crear rama
        </button>
      </form>
    </div>
  );
}
