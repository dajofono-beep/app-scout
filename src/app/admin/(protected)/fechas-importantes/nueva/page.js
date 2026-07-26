import Link from "next/link";
import { crearFechaImportante } from "../actions";

const hoy = () => new Date().toISOString().slice(0, 10);

export default function NuevaFechaImportantePage() {
  return (
    <div className="max-w-md">
      <Link
        href="/admin/fechas-importantes"
        className="text-sm text-sky-600 font-semibold"
      >
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Nueva fecha importante</h1>

      <form
        action={crearFechaImportante}
        className="bg-white rounded-2xl shadow-sm p-5 space-y-3"
      >
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Nombre
          </label>
          <input
            name="nombre"
            required
            placeholder="Campamento de invierno"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Tipo de fecha
          </label>
          <select
            name="tipo"
            required
            defaultValue="efemeride"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          >
            <option value="efemeride">Efeméride</option>
            <option value="fecha_scout">Fecha scout</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Fecha de inicio
            </label>
            <input
              name="fecha_inicio"
              type="date"
              required
              defaultValue={hoy()}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Fecha de fin
            </label>
            <input
              name="fecha_fin"
              type="date"
              required
              defaultValue={hoy()}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400 -mt-1">
          Para un evento de un solo día, dejá la misma fecha en ambos campos.
        </p>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Mensaje (opcional)
          </label>
          <textarea
            name="mensaje"
            rows={3}
            placeholder="Texto que se muestra esos días en la sección Social"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Imagen / placa alusiva (opcional)
          </label>
          <input type="file" name="imagen" accept="image/*" className="text-sm w-full" />
        </div>
        <button
          type="submit"
          className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold"
        >
          Crear fecha importante
        </button>
      </form>
    </div>
  );
}
