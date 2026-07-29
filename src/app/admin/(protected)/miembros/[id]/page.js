import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarMiembro } from "../actions";
import { iniciales, colorParaRama } from "../avatar";

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
      <Link href="/admin/miembros" className="text-sm text-sky-600 font-semibold">
        ← Volver
      </Link>

      <div className="flex items-center gap-3 mt-2 mb-6">
        <span
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${colorParaRama(miembro.ramas?.nombre)}`}
        >
          {iniciales(miembro.nombre, miembro.apellido)}
        </span>
        <div>
          <h1 className="text-xl font-bold">
            {miembro.apellido}, {miembro.nombre}
          </h1>
          <p className="text-sm text-slate-500">
            DNI {miembro.dni} · {miembro.ramas?.nombre}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <p className="text-sm font-bold text-slate-500">Saldo actual</p>
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
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Rama
          </label>
          <select
            name="rama_id"
            defaultValue={miembro.rama_id}
            required
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          >
            {(ramas ?? []).map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Hermanos
          </label>
          <select
            name="familia_id"
            defaultValue={miembro.familia_id ?? ""}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          >
            <option value="">Sin hermanos</option>
            {(familias ?? []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Orden entre hermanos (1º, 2º...)
          </label>
          <input
            name="orden_familia"
            type="number"
            min="1"
            defaultValue={miembro.orden_familia ?? ""}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
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
          className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
