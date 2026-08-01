import { createClient } from "@/lib/supabase/server";
import ExportarForm from "./exportar-form";

export default async function ExportarPage() {
  const supabase = await createClient();

  const { data: ramas } = await supabase.from("ramas").select("*").order("orden");

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Exportar</h1>
      <p className="text-sm text-slate-500 mb-6">
        Genera un Excel con la deuda, lo pagado y el saldo de cada
        participante, una hoja por rama.
      </p>

      <ExportarForm ramas={ramas ?? []} />
    </div>
  );
}
