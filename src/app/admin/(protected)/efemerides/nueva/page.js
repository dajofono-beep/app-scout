import Link from "next/link";
import { crearEfemeride } from "../actions";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function NuevaEfemeridePage() {
  return (
    <div className="max-w-md">
      <Link href="/admin/efemerides" className="text-sm text-sky-600 font-semibold">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Nueva efeméride</h1>

      <form
        action={crearEfemeride}
        className="bg-white rounded-2xl shadow-sm p-5 space-y-3"
      >
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Nombre
          </label>
          <input
            name="nombre"
            required
            placeholder="Día de la Independencia"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Mes
            </label>
            <select
              name="mes"
              required
              defaultValue=""
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            >
              <option value="" disabled>
                Elegir mes...
              </option>
              {MESES.map((mes, i) => (
                <option key={mes} value={i + 1}>
                  {mes}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Día
            </label>
            <input
              name="dia"
              type="number"
              min="1"
              max="31"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Mensaje (opcional)
          </label>
          <textarea
            name="mensaje"
            rows={3}
            placeholder="Texto que se muestra ese día en la sección Social"
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
          Crear efeméride
        </button>
      </form>
    </div>
  );
}
