import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarMiembro } from "../actions";
import { iniciales, colorPara } from "../avatar";

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export default async function FichaMiembroPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: miembro } = await supabase
    .from("miembros")
    .select("*, ramas(nombre)")
    .eq("id", id)
    .maybeSingle();
  if (!miembro) notFound();

  const { data: ramas } = await supabase
    .from("ramas")
    .select("*")
    .order("nombre");
  const { data: familias } = await supabase
    .from("familias")
    .select("*")
    .order("nombre");
  const { data: saldo } = await supabase
    .from("saldos_miembros")
    .select("*")
    .eq("miembro_id", id)
    .maybeSingle();

  return (
    <div className="max-w-lg">
      <Link href="/admin/miembros" className="text-sm text-blue-600 underline">
        ← Volver
      </Link>

      <div className="flex items-center gap-3 mt-2 mb-6">
        <span
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${colorPara(miembro.rama_id)}`}
        >
          {iniciales(miembro.nombre, miembro.apellido)}
        </span>
        <div>
          <h1 className="text-xl font-bold">
            {miembro.apellido}, {miembro.nombre}
          </h1>
          <p className="text-sm text-gray-500">
            DNI {miembro.dni} · {miembro.ramas?.nombre}
          </p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4 mb-4">
        <p className="text-sm text-gray-500">Saldo actual</p>
        <p className="text-2xl font-bold">
          {formatoMoneda(saldo?.saldo ?? 0)}
        </p>
        {Number(saldo?.total_pagos_pendientes ?? 0) > 0 && (
          <p className="text-sm text-amber-700 mt-1">
            {formatoMoneda(saldo.total_pagos_pendientes)} en pagos pendientes
            de acreditar.
          </p>
        )}
      </div>

      <form
        action={actualizarMiembro}
        className="bg-white rounded shadow p-4 space-y-3"
      >
        <input type="hidden" name="id" value={miembro.id} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            name="nombre"
            defaultValue={miembro.nombre}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido
          </label>
          <input
            name="apellido"
            defaultValue={miembro.apellido}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DNI
          </label>
          <input
            value={miembro.dni}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Solo refleja la contraseña inicial; no se edita acá.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rama
          </label>
          <select
            name="rama_id"
            defaultValue={miembro.rama_id}
            required
            className="w-full border rounded px-3 py-2"
          >
            {(ramas ?? []).map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Familia
          </label>
          <select
            name="familia_id"
            defaultValue={miembro.familia_id ?? ""}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Sin familia</option>
            {(familias ?? []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Orden en la familia (1º, 2º...)
          </label>
          <input
            name="orden_familia"
            type="number"
            min="1"
            defaultValue={miembro.orden_familia ?? ""}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de nacimiento
          </label>
          <input
            name="fecha_nacimiento"
            type="date"
            defaultValue={miembro.fecha_nacimiento ?? ""}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={miembro.activo}
          />
          Activo
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded py-2 font-medium"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
