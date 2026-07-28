import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarCargo, cancelarCargo, reactivarCargo } from "../actions";
import { iniciales, colorPara } from "../../miembros/avatar";

export default async function FichaCargoPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cargo } = await supabase
    .from("cargos")
    .select("*, miembros(id, nombre, apellido, rama_id, ramas(nombre))")
    .eq("id", id)
    .maybeSingle();
  if (!cargo) notFound();

  return (
    <div className="max-w-lg">
      <Link href="/admin/cargos" className="text-sm text-sky-600 font-semibold">
        ← Volver
      </Link>

      <div className="flex items-center gap-3 mt-2 mb-6">
        <span
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${colorPara(cargo.miembros?.rama_id)}`}
        >
          {iniciales(cargo.miembros?.nombre, cargo.miembros?.apellido)}
        </span>
        <div>
          <h1 className="text-xl font-bold">
            {cargo.miembros?.apellido}, {cargo.miembros?.nombre}
          </h1>
          <p className="text-sm text-slate-500">{cargo.miembros?.ramas?.nombre}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ml-auto ${
            cargo.estado === "cancelado"
              ? "bg-slate-200 text-slate-600"
              : "bg-green-100 text-green-800"
          }`}
        >
          {cargo.estado === "cancelado" ? "Cancelado" : "Activo"}
        </span>
      </div>

      {cargo.porcentaje_aplicado != null && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          Se aplicó un {cargo.porcentaje_aplicado}% (descuento por hermanos)
          sobre el importe del producto.
        </p>
      )}

      <form
        action={actualizarCargo}
        className="bg-white rounded-2xl shadow-sm p-5 space-y-3"
      >
        <input type="hidden" name="id" value={cargo.id} />
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Concepto
          </label>
          <input
            name="concepto"
            defaultValue={cargo.concepto}
            required
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
            defaultValue={cargo.importe}
            required
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Fecha
          </label>
          <input
            name="fecha"
            type="date"
            defaultValue={cargo.fecha}
            required
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
            defaultValue={cargo.fecha_vencimiento ?? ""}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-sky-600 text-white rounded-full py-2.5 font-bold"
          >
            Guardar cambios
          </button>
          {cargo.estado === "activo" ? (
            <button
              formAction={cancelarCargo}
              className="flex-1 border border-red-300 text-red-600 rounded-full py-2.5 font-bold"
            >
              Cancelar cargo
            </button>
          ) : (
            <button
              formAction={reactivarCargo}
              className="flex-1 border border-green-300 text-green-700 rounded-full py-2.5 font-bold"
            >
              Reactivar cargo
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
