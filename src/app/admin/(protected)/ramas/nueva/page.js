import Link from "next/link";
import { crearRama } from "../actions";

export default function NuevaRamaPage() {
  return (
    <div className="max-w-md">
      <Link href="/admin/ramas" className="text-sm text-sky-600 font-semibold">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Nueva rama</h1>

      <form action={crearRama} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Nombre
          </label>
          <input
            name="nombre"
            required
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Orden (para el listado de la pantalla de ingreso)
          </label>
          <input
            name="orden"
            type="number"
            defaultValue={0}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold"
        >
          Crear rama
        </button>
      </form>
    </div>
  );
}
