import { createClient } from "@/lib/supabase/server";
import NotificacionesPagosForm from "./notificaciones-pagos-form";

export default async function NotificacionesPagosPage() {
  const supabase = await createClient();

  const { data: config } = await supabase
    .from("notificaciones_pagos_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Notificaciones Pagos</h1>
      <p className="text-sm text-slate-500 mb-6">
        Cuando una familia registra un pago (efectivo, transferencia o
        Mercado Pago), se manda un mail de aviso a los administradores que
        tengan activado &quot;Recibir notificaciones de pagos&quot; en su
        ficha (sección Administradores). Si el día de mañana cambia la
        cuenta de correo que envía estos avisos, se actualiza acá, sin
        tocar nada del código.
      </p>

      <NotificacionesPagosForm config={config ?? {}} />
    </div>
  );
}
