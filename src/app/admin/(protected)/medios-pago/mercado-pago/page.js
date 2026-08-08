import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MercadoPagoConfigForm from "./mercado-pago-config-form";

export default async function MercadoPagoConfigPage() {
  const supabase = await createClient();

  const { data: config } = await supabase
    .from("mercadopago_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  return (
    <div className="max-w-lg">
      <Link
        href="/admin/medios-pago"
        className="text-sm text-sky-600 font-semibold"
      >
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-2">Configurar Mercado Pago</h1>
      <p className="text-sm text-slate-500 mb-6">
        Estos datos son solo para administradores — nunca se muestran a las
        familias. Si el titular de la cuenta cambia, se actualiza acá, sin
        tocar nada del código.
      </p>

      <MercadoPagoConfigForm config={config ?? {}} />
    </div>
  );
}
