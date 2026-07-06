import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";
import { crearPago } from "./actions";

const hoy = () => new Date().toISOString().slice(0, 10);

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const ETIQUETA_ESTADO = {
  pendiente: { texto: "Pendiente", clase: "bg-amber-100 text-amber-800" },
  acreditado: { texto: "Acreditado", clase: "bg-green-100 text-green-800" },
  cancelado: { texto: "Cancelado", clase: "bg-gray-200 text-gray-600" },
};

export default async function MiCuentaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: miembro } = await supabase
    .from("miembros")
    .select("*, ramas(nombre)")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!miembro) redirect("/");

  const { data: saldo } = await supabase
    .from("saldos_miembros")
    .select("*")
    .eq("miembro_id", miembro.id)
    .maybeSingle();

  const { data: cargos } = await supabase
    .from("cargos")
    .select("*")
    .eq("miembro_id", miembro.id)
    .order("fecha", { ascending: false });

  const { data: pagos } = await supabase
    .from("estado_pagos")
    .select("*")
    .eq("miembro_id", miembro.id)
    .order("fecha_pago", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <div>
          <p className="font-medium">
            {miembro.apellido}, {miembro.nombre}
          </p>
          <p className="text-sm text-gray-500">{miembro.ramas?.nombre}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cambiar-clave" className="text-sm text-blue-600 underline">
            Cambiar contraseña
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <section className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Saldo actual</p>
          <p className="text-3xl font-bold">
            {formatoMoneda(saldo?.saldo ?? 0)}
          </p>
          {Number(saldo?.total_pagos_pendientes ?? 0) > 0 && (
            <p className="text-sm text-amber-700 mt-1">
              Tenés {formatoMoneda(saldo.total_pagos_pendientes)} en pagos
              pendientes de acreditar.
            </p>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Cargar un pago</h2>
          <form action={crearPago} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              name="importe"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="Importe"
              className="border rounded px-3 py-2"
            />
            <input
              name="fecha_pago"
              type="date"
              required
              defaultValue={hoy()}
              max={hoy()}
              className="border rounded px-3 py-2"
            />
            <input
              name="medio_pago"
              placeholder="Medio de pago (opcional)"
              className="border rounded px-3 py-2"
            />
            <button
              type="submit"
              className="sm:col-span-3 bg-blue-600 text-white rounded py-2 font-medium"
            >
              Registrar pago
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            El pago queda como &quot;Pendiente&quot; por 4 días, tiempo en el
            que el administrador puede revisarlo. Luego se acredita solo.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-3">Pagos</h2>
          <div className="space-y-2">
            {(pagos ?? []).map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-lg shadow p-3 flex items-center justify-between gap-2 text-sm"
              >
                <span>{p.fecha_pago}</span>
                <span className="text-gray-500">{p.medio_pago || "—"}</span>
                <span className="font-semibold">{formatoMoneda(p.importe)}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${ETIQUETA_ESTADO[p.estado_efectivo].clase}`}
                >
                  {ETIQUETA_ESTADO[p.estado_efectivo].texto}
                </span>
              </div>
            ))}
            {(pagos ?? []).length === 0 && (
              <p className="text-gray-500 text-sm">Todavía no cargaste pagos.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-3">Cargos</h2>
          <div className="space-y-2">
            {(cargos ?? []).map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-lg shadow p-3 flex items-center justify-between gap-2 text-sm"
              >
                <span>{c.fecha}</span>
                <span className="text-gray-600">{c.concepto}</span>
                <span className="font-semibold">{formatoMoneda(c.importe)}</span>
              </div>
            ))}
            {(cargos ?? []).length === 0 && (
              <p className="text-gray-500 text-sm">Todavía no tenés cargos.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
