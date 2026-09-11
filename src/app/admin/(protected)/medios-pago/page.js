import { createClient } from "@/lib/supabase/server";
import MediosPagoForm from "./medios-pago-form";
import NotificacionesPagosForm from "./notificaciones-pagos-form";

export default async function MediosPagoPage() {
  const supabase = await createClient();

  const { data: medios } = await supabase
    .from("medios_pago")
    .select("*")
    .order("orden");
  const { data: notificacionesConfig } = await supabase
    .from("notificaciones_pagos_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-2">Medios de Pago</h1>
        <p className="text-sm text-slate-500 mb-6">
          Elegí qué medios de pago pueden usar las familias al cargar un pago
          desde Mi Cuenta.
        </p>

        <MediosPagoForm medios={medios ?? []} />
      </div>

      <NotificacionesPagosForm config={notificacionesConfig ?? {}} />
    </div>
  );
}
