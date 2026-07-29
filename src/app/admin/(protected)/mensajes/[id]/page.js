import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarMensaje } from "../actions";
import MensajeForm from "../mensaje-form";

export default async function FichaMensajePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: mensaje } = await supabase
    .from("mensajes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!mensaje) notFound();

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
      <h1 className="text-2xl font-bold mt-2 mb-6">{mensaje.titulo}</h1>

      <MensajeForm
        mensaje={mensaje}
        ramas={ramas ?? []}
        familias={familias ?? []}
        miembros={miembros ?? []}
        accion={actualizarMensaje}
        textoBoton="Guardar cambios"
      />
    </div>
  );
}
