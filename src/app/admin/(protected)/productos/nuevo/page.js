import Link from "next/link";
import { crearProducto } from "../actions";

export default function NuevoProductoPage() {
  return (
    <div className="max-w-lg">
      <Link href="/admin/productos" className="text-sm text-sky-600 font-semibold">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Nuevo producto</h1>

      <form
        action={crearProducto}
        className="bg-white rounded-2xl shadow-sm p-5 space-y-3"
      >
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Nombre
          </label>
          <input
            name="nombre"
            required
            placeholder="Ej. Cuota mensual"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Importe
          </label>
          <input
            name="importe"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Descripción (opcional)
          </label>
          <input
            name="descripcion"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Fecha de vencimiento (opcional)
          </label>
          <input
            name="fecha_vencimiento"
            type="date"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
          <p className="text-xs text-slate-400 mt-1">
            Ej. la fecha del campamento. Se copia a cada cargo que se genere con
            este producto, para ordenarlos y recordarles a las familias.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="es_cuotable" />
          Es cuotable
        </label>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Cantidad de cuotas
          </label>
          <input
            name="cantidad_cuotas"
            type="number"
            min="1"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="aplica_descuento_hermanos" />
          Aplica descuento por hermanos
        </label>
        <button
          type="submit"
          className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold"
        >
          Crear producto
        </button>
      </form>
    </div>
  );
}
