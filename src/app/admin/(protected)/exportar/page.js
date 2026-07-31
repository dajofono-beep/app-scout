import { createClient } from "@/lib/supabase/server";
import ExportarForm from "./exportar-form";

export default async function ExportarPage() {
  const supabase = await createClient();

  const { data: ramas } = await supabase.from("ramas").select("*").order("orden");
  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .order("nombre");

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Exportar</h1>
      <p className="text-sm text-slate-500 mb-6">
        Genera un Excel con los cargos y los pagos de los participantes
        elegidos, cada cuota o mes en su propia columna.
      </p>

      <ExportarForm ramas={ramas ?? []} productos={productos ?? []} />
    </div>
  );
}
