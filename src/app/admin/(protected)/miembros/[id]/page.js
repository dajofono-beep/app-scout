import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { urlFirmadaComprobante } from "@/lib/supabase/comprobantes";
import { actualizarMiembro } from "../actions";
import { iniciales, colorParaRama } from "../avatar";
import RestaurarContrasenaBoton from "../restaurar-contrasena-boton";
import FichaMiembroTabs from "./ficha-miembro-tabs";
import AsignarCargoIndividualForm from "./asignar-cargo-individual-form";
import { cancelarCargo, reactivarCargo } from "../../cargos/actions";
import CamposRamaHermanos from "../campos-rama-hermanos";
import TarjetaSaldoAdmin from "./tarjeta-saldo-admin";
import { calcularVencimientos } from "@/app/mi-cuenta/proximo-vencimiento";

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
  const { data: pagosMiembro } = await supabase
    .from("estado_pagos")
    .select("*")
    .eq("miembro_id", id)
    .order("fecha_pago", { ascending: false });

  const adminClient = createAdminClient();
  const pagosConComprobante = await Promise.all(
    (pagosMiembro ?? []).map(async (p) => ({
      ...p,
      comprobante_href: p.comprobante_url
        ? await urlFirmadaComprobante(adminClient, p.comprobante_url)
        : null,
    }))
  );
  const totalPagos = (pagosMiembro ?? [])
    .filter((p) => p.estado_efectivo !== "cancelado")
    .reduce((acc, p) => acc + Number(p.importe), 0);
  // Catálogo completo (no solo los activos, que es lo que necesita el
  // desplegable de "asignar cargo") — para la alerta de vencimiento hace
  // falta la fecha/alerta de cualquier concepto, esté activo o no.
  const { data: productosVencimiento } = await supabase
    .from("productos")
    .select("id, fecha_vencimiento, alerta_vencimiento");

  const cargosActivos = (cargosMiembro ?? []).filter((c) => c.estado === "activo");
  const totalCargos = cargosActivos.reduce((acc, c) => acc + Number(c.importe), 0);
  const pendienteTotal = Number(saldo?.total_pagos_pendientes ?? 0);
  const pagosRealizados =
    Number(saldo?.total_pagos_acreditados ?? 0) + pendienteTotal;
  const pagosAcreditados = (pagosMiembro ?? []).filter(
    (p) => p.estado_efectivo === "acreditado"
  );

  const vencimientos = calcularVencimientos({
    familiares: [{ id: miembro.id }],
    cargos: cargosMiembro ?? [],
    pagosAcreditados,
    productos: productosVencimiento ?? [],
    nombrePorId: { [miembro.id]: `${miembro.apellido}, ${miembro.nombre}` },
    hoyIso: new Date().toISOString().slice(0, 10),
  });

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
        {(cargosMiembro ?? []).length > 0 && (
          <div className="flex justify-between items-center p-3 border-t bg-slate-50">
            <span className="text-sm font-bold text-slate-600">Total cargos activos</span>
            <span className="font-bold text-slate-800">{formatoMoneda(totalCargos)}</span>
          </div>
        )}
      </section>
    </div>
  );

  const panelPagos = (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b">
            <th className="p-3 font-bold">Fecha</th>
            <th className="p-3 font-bold">Importe</th>
            <th className="p-3 font-bold">Medio</th>
            <th className="p-3 font-bold">Estado</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {pagosConComprobante.map((p) => (
            <tr key={p.id} className="border-b last:border-0">
              <td className="p-3 text-slate-600">{p.fecha_pago}</td>
              <td className="p-3 font-semibold">{formatoMoneda(p.importe)}</td>
              <td className="p-3 text-slate-600">{p.medio_pago ?? "Sin especificar"}</td>
              <td className="p-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    p.estado_efectivo === "cancelado"
                      ? "bg-slate-200 text-slate-600"
                      : p.estado_efectivo === "pendiente"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {p.estado_efectivo === "cancelado"
                    ? "Cancelado"
                    : p.estado_efectivo === "pendiente"
                      ? "Pendiente"
                      : "Acreditado"}
                </span>
              </td>
              <td className="p-3 text-right">
                {p.comprobante_href && (
                  <a
                    href={p.comprobante_href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:underline text-xs font-semibold"
                  >
                    Ver comprobante
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pagosConComprobante.length === 0 && (
        <p className="text-slate-500 text-sm p-4">Todavía no registró pagos.</p>
      )}
      {pagosConComprobante.length > 0 && (
        <div className="flex justify-between items-center p-3 border-t bg-slate-50">
          <span className="text-sm font-bold text-slate-600">Total pagado</span>
          <span className="font-bold text-slate-800">{formatoMoneda(totalPagos)}</span>
        </div>
      )}
    </section>
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

      <div className="mb-4">
        <TarjetaSaldoAdmin
          saldoTotal={Number(saldo?.saldo ?? 0)}
          totalCargos={totalCargos}
          pagosRealizados={pagosRealizados}
          pendienteTotal={pendienteTotal}
          vencimiento={vencimientos[0] ?? null}
        />
      </div>

      <FichaMiembroTabs
        panelDatos={panelDatos}
        panelCargos={panelCargos}
        panelPagos={panelPagos}
      />
    </div>
  );
}
