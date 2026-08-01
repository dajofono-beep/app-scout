import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarMiembro } from "../actions";
import { iniciales, colorParaRama } from "../avatar";
import RestaurarContrasenaBoton from "../restaurar-contrasena-boton";
import FichaMiembroTabs from "./ficha-miembro-tabs";
import AsignarCargoIndividualForm from "./asignar-cargo-individual-form";
import { cancelarCargo, reactivarCargo } from "../../cargos/actions";
import CamposRamaHermanos from "../campos-rama-hermanos";

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
  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");
  const { data: cargosMiembro } = await supabase
    .from("cargos")
    .select("*")
    .eq("miembro_id", id)
    .order("fecha", { ascending: false });

  const panelDatos = (
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
      <CamposRamaHermanos
        ramas={ramas ?? []}
        familias={familias ?? []}
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
          <input
            type="checkbox"
            name="activo"
            defaultChecked={miembro.activo}
          />
          Activo
        </label>
        <RestaurarContrasenaBoton miembroId={miembro.id} />
      </div>

      <button
        type="submit"
        className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold"
      >
        Guardar cambios
      </button>
    </form>
  );

  const panelCargos = (
    <div className="space-y-4">
      <AsignarCargoIndividualForm
        miembroId={miembro.id}
        productos={productos ?? []}
      />

      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="p-3 font-bold">Concepto</th>
              <th className="p-3 font-bold">Importe</th>
              <th className="p-3 font-bold">Fecha</th>
              <th className="p-3 font-bold">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(cargosMiembro ?? []).map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-3 text-slate-600">
                  {c.concepto}
                  {c.porcentaje_aplicado != null && (
                    <span className="block text-xs text-amber-700">
                      {c.porcentaje_aplicado}% aplicado
                    </span>
                  )}
                </td>
                <td className="p-3 font-semibold">{formatoMoneda(c.importe)}</td>
                <td className="p-3 text-slate-600">{c.fecha}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      c.estado === "cancelado"
                        ? "bg-slate-200 text-slate-600"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {c.estado === "cancelado" ? "Cancelado" : "Activo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {c.estado === "activo" ? (
                    <form action={cancelarCargo}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="text-red-600 hover:underline text-xs font-semibold">
                        Eliminar
                      </button>
                    </form>
                  ) : (
                    <form action={reactivarCargo}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="text-green-700 hover:underline text-xs font-semibold">
                        Reactivar
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(cargosMiembro ?? []).length === 0 && (
          <p className="text-slate-500 text-sm p-4">
            Todavía no tiene cargos asignados.
          </p>
        )}
      </section>
    </div>
  );

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

      <FichaMiembroTabs panelDatos={panelDatos} panelCargos={panelCargos} />
    </div>
  );
}
