import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { crearMensaje } from "../actions";
import MensajeForm from "../mensaje-form";

export default async function NuevoMensajePage() {
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
    <div className="max-w-md">
      <Link href="/admin/mensajes" className="text-sm text-sky-600 font-semibold">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Nuevo mensaje</h1>

      <MensajeForm
        ramas={ramas ?? []}
        familias={familias ?? []}
        miembros={miembros ?? []}
        accion={crearMensaje}
        textoBoton="Crear mensaje"
      />
    </div>
  );
}
