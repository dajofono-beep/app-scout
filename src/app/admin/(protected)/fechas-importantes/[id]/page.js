import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarFechaImportante } from "../actions";
import FechaImportanteForm from "../fecha-importante-form";

export default async function FichaFechaImportantePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: fechaImportante } = await supabase
    .from("fechas_importantes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!fechaImportante) notFound();

  return (
    <div className="max-w-md">
      <Link
        href="/admin/fechas-importantes"
        className="text-sm text-sky-600 font-semibold"
      >
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{fechaImportante.nombre}</h1>

      {fechaImportante.imagen_url && (
        <img
          src={fechaImportante.imagen_url}
          alt={fechaImportante.nombre}
          className="w-full rounded-2xl shadow-sm mb-4"
        />
      )}

      <FechaImportanteForm
        fechaImportante={fechaImportante}
        accion={actualizarFechaImportante}
        textoBoton="Guardar cambios"
      />
    </div>
  );
}
