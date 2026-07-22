import Link from "next/link";
import { crearProducto } from "../actions";

export default function NuevoProductoPage() {
  return (
    <div className="max-w-lg">
      <Link href="/admin/productos" className="text-sm text-blue-600 underline">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Nuevo producto</h1>

      <form
        action={crearProducto}
        className="bg-white rounded shadow p-4 space-y-3"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            name="nombre"
            required
            placeholder="Ej. Cuota mensual"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Importe
          </label>
          <input
            name="importe"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción (opcional)
          </label>
          <input
            name="descripcion"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="es_cuotable" />
          Es cuotable
        </label>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad de cuotas
          </label>
          <input
            name="cantidad_cuotas"
            type="number"
            min="1"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="aplica_descuento_hermanos" />
          Aplica descuento por hermanos
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded py-2 font-medium"
        >
          Crear producto
        </button>
      </form>
    </div>
  );
}
