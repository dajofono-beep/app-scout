import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { urlFirmadaComprobante } from "@/lib/supabase/comprobantes";
import { MEDIOS_PAGO } from "@/lib/medios-pago";
import {
  actualizarPago,
  cancelarPago,
  reactivarPago,
  confirmarPago,
  reasignarPago,
} from "../actions";
import { iniciales, colorPara } from "../../miembros/avatar";

const ETIQUETA_ESTADO = {
  pendiente: { texto: "Pendiente", clase: "bg-amber-100 text-amber-800" },
  acreditado: { texto: "Acreditado", clase: "bg-green-100 text-green-800" },
  cancelado: { texto: "Cancelado", clase: "bg-gray-200 text-gray-600" },
};

export default async function FichaPagoPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pago } = await supabase
    .from("estado_pagos")
    .select("*, miembros(id, nombre, apellido, rama_id, ramas(nombre))")
    .eq("id", id)
    .maybeSingle();
  if (!pago) notFound();

  const { data: miembros } = await supabase
    .from("miembros")
    .select("id, nombre, apellido")
    .order("apellido");

  const comprobanteHref = pago.comprobante_url
    ? await urlFirmadaComprobante(createAdminClient(), pago.comprobante_url)
    : null;

  return (
    <div className="max-w-lg">
      <Link href="/admin/pagos" className="text-sm text-blue-600 underline">
        ← Volver
      </Link>

      <div className="flex items-center gap-3 mt-2 mb-6">
        <span
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${colorPara(pago.miembros?.rama_id)}`}
        >
          {iniciales(pago.miembros?.nombre, pago.miembros?.apellido)}
        </span>
        <div>
          <h1 className="text-xl font-bold">
            {pago.miembros?.apellido}, {pago.miembros?.nombre}
          </h1>
          <p className="text-sm text-gray-500">{pago.miembros?.ramas?.nombre}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ml-auto ${ETIQUETA_ESTADO[pago.estado_efectivo].clase}`}
        >
          {ETIQUETA_ESTADO[pago.estado_efectivo].texto}
        </span>
      </div>

      {pago.confirmado_at && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3 mb-4">
          Confirmado manualmente por el admin (no esperó los 4 días).
        </p>
      )}

      {comprobanteHref && (
        <a
          href={comprobanteHref}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-blue-600 underline mb-4"
        >
          Ver comprobante subido por la familia
        </a>
      )}

      <form
        action={actualizarPago}
        className="bg-white rounded shadow p-4 space-y-3"
      >
        <input type="hidden" name="id" value={pago.id} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Importe
          </label>
          <input
            name="importe"
            type="number"
            step="0.01"
            min="0"
            defaultValue={pago.importe}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de pago
          </label>
          <input
            name="fecha_pago"
            type="date"
            defaultValue={pago.fecha_pago}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medio de pago
          </label>
          <select
            name="medio_pago"
            defaultValue={pago.medio_pago ?? ""}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Sin especificar</option>
            {MEDIOS_PAGO.map((medio) => (
              <option key={medio} value={medio}>
                {medio}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nota interna
          </label>
          <input
            name="nota_admin"
            defaultValue={pago.nota_admin ?? ""}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white rounded py-2 font-medium"
          >
            Guardar cambios
          </button>
          {pago.estado_efectivo === "pendiente" && (
            <button
              formAction={confirmarPago}
              className="flex-1 border border-green-300 text-green-700 rounded py-2 font-medium"
            >
              Confirmar ahora
            </button>
          )}
          {pago.estado === "activo" ? (
            <button
              formAction={cancelarPago}
              className="flex-1 border border-red-300 text-red-600 rounded py-2 font-medium"
            >
              Cancelar pago
            </button>
          ) : (
            <button
              formAction={reactivarPago}
              className="flex-1 border border-green-300 text-green-700 rounded py-2 font-medium"
            >
              Reactivar pago
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded shadow p-4 mt-4">
        <h2 className="font-semibold mb-3">Reasignar a otro miembro</h2>
        <form action={reasignarPago} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={pago.id} />
          <select
            name="nuevo_miembro_id"
            defaultValue={pago.miembro_id}
            className="border rounded px-3 py-2 text-sm flex-1 min-w-[10rem]"
          >
            {(miembros ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.apellido}, {m.nombre}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
          >
            Reasignar
          </button>
        </form>
      </div>
    </div>
  );
}
