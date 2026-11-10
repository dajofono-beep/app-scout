"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarMiembro } from "../actions";
import CamposRamaHermanos from "../campos-rama-hermanos";
import RestaurarContrasenaBoton from "../restaurar-contrasena-boton";

export default function MiembroDatosForm({ miembro, ramas, familias }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guardado, setGuardado] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setGuardado(null);
    setLoading(true);

    try {
      const resultado = await actualizarMiembro(new FormData(e.currentTarget));
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setGuardado({ activo: resultado.activo });
      // `revalidatePath` solo invalida el caché: sin esto la cabecera
      // (etiqueta Inactivo, nombre) se queda con los datos viejos hasta
      // recargar a mano.
      router.refresh();
    } catch {
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      // El aviso de "guardado" deja de valer apenas se vuelve a editar algo.
      onChange={() => setGuardado(null)}
      className="bg-white rounded-2xl shadow-sm p-5 space-y-3"
    >
      <input type="hidden" name="id" value={miembro.id} />

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Nombre
        </label>
        <input
          name="nombre"
          defaultValue={miembro.nombre}
          required
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Apellido
        </label>
        <input
          name="apellido"
          defaultValue={miembro.apellido}
          required
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          DNI
        </label>
        <input
          value={miembro.dni}
          disabled
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-slate-400"
        />
        <p className="text-xs text-slate-500 mt-1">
          Solo refleja la contraseña inicial; no se edita acá.
        </p>
      </div>
      <CamposRamaHermanos
        ramas={ramas}
        familias={familias}
        ramaIdInicial={miembro.rama_id}
        familiaIdInicial={miembro.familia_id ?? ""}
        ordenFamiliaInicial={miembro.orden_familia ?? ""}
      />
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Fecha de nacimiento
        </label>
        <input
          name="fecha_nacimiento"
          type="date"
          defaultValue={miembro.fecha_nacimiento ?? ""}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="activo" defaultChecked={miembro.activo} />
          Activo
        </label>
        <RestaurarContrasenaBoton miembroId={miembro.id} />
      </div>

      {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
      {guardado && (
        <div
          role="status"
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            guardado.activo
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-amber-50 text-amber-900 border border-amber-200"
          }`}
        >
          <p>
            {guardado.activo
              ? "Cambios guardados. El miembro está Activo."
              : "Cambios guardados. El miembro quedó Inactivo."}
          </p>
          {!guardado.activo && (
            <p className="font-normal mt-0.5">
              Ya no aparece en el listado de Miembros salvo que filtres por
              &quot;Inactivos&quot; o &quot;Todos&quot;.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
