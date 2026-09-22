"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarFechaImportante } from "./actions";

const hoy = () => new Date().toISOString().slice(0, 10);

export default function FechaImportanteForm({ fechaImportante, accion, textoBoton }) {
  const router = useRouter();
  const [fechaInicio, setFechaInicio] = useState(fechaImportante?.fecha_inicio ?? hoy());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    // El botón "Eliminar" tiene su propio formAction — que siga su
    // camino nativo en vez de pasar por acá.
    if (e.nativeEvent.submitter?.hasAttribute("formaction")) return;

    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const resultado = await accion(new FormData(e.currentTarget));
      if (resultado && !resultado.ok) {
        setError(resultado.error);
      } else if (resultado?.ok) {
        // Solo pasa acá al editar (crear termina en un redirect() del
        // propio server action) — sin esto, la pantalla se queda con
        // los datos viejos hasta recargar a mano.
        router.refresh();
      }
    } catch {
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm p-5 space-y-3"
    >
      {fechaImportante && <input type="hidden" name="id" value={fechaImportante.id} />}

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Nombre
        </label>
        <input
          name="nombre"
          required
          defaultValue={fechaImportante?.nombre}
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
          defaultValue={fechaImportante?.tipo ?? "efemeride"}
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
            defaultValue={fechaImportante?.fecha_inicio ?? hoy()}
            onChange={(e) => setFechaInicio(e.target.value)}
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
            min={fechaInicio}
            defaultValue={fechaImportante?.fecha_fin ?? hoy()}
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
          defaultValue={fechaImportante?.mensaje ?? ""}
          placeholder="Texto que se muestra esos días en la sección Social"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          {fechaImportante?.imagen_url
            ? "Reemplazar imagen / placa"
            : "Imagen / placa alusiva (opcional)"}
        </label>
        <input type="file" name="imagen" accept="image/*" className="text-sm w-full" />
      </div>

      {fechaImportante && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={fechaImportante.activo}
          />
          Activa
        </label>
      )}

      {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
        >
          {loading ? "Guardando..." : textoBoton}
        </button>
        {fechaImportante && (
          <button
            formAction={eliminarFechaImportante}
            className="flex-1 border border-red-300 text-red-600 rounded-full py-2.5 font-bold"
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
}
