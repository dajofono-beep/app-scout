import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NuevoAdministradorForm from "../nuevo-administrador-form";

export default async function NuevoAdministradorPage() {
  const supabase = await createClient();
  const { data: miembros } = await supabase
    .from("miembros")
    .select("id, nombre, apellido")
    .eq("activo", true)
    .order("apellido");

  return (
    <div className="max-w-lg">
      <Link href="/admin/administradores" className="text-sm text-sky-600 font-semibold">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Nuevo administrador</h1>

      <NuevoAdministradorForm miembros={miembros ?? []} />
    </div>
  );
}
