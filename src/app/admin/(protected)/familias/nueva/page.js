import Link from "next/link";
import { crearFamilia } from "../actions";

export default function NuevaFamiliaPage() {
  return (
    <div className="max-w-md">
      <Link href="/admin/familias" className="text-sm text-blue-600 underline">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Nueva familia</h1>

      <form action={crearFamilia} className="bg-white rounded shadow p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            name="nombre"
            required
            placeholder="Ej. Familia Pérez"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded py-2 font-medium"
        >
          Crear familia
        </button>
      </form>
    </div>
  );
}
