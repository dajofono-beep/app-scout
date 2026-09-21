import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { crearEncuesta } from "../actions";
import EncuestaForm from "../encuesta-form";

export default async function NuevaEncuestaPage() {
  const supabase = await createClient();

  const { data: ramas } = await supabase.from("ramas").select("id, nombre").order("nombre");
  const { data: familias } = await supabase
    .from("familias")
    .select("id, nombre")
    .order("nombre");
  const { data: miembros } = await supabase
    .from("miembros")
    .select("id, nombre, apellido")
    .eq("activo", true)
    .order("apellido");

  return (
    <div className="max-w-3xl">
      <Link href="/admin/encuestas" className="text-sm text-sky-600 font-semibold">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Nueva encuesta</h1>

      <EncuestaForm
        ramas={ramas ?? []}
        familias={familias ?? []}
        miembros={miembros ?? []}
        accion={crearEncuesta}
        textoBoton="Crear encuesta"
      />
    </div>
  );
}
