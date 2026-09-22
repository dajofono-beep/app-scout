"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { subirImagenFechaImportante } from "@/lib/supabase/fechas-importantes";

const TIPOS_VALIDOS = ["efemeride", "fecha_scout"];

function leerCampos(formData) {
  const nombre = formData.get("nombre")?.toString().trim();
  const tipo = formData.get("tipo")?.toString();
  const fecha_inicio = formData.get("fecha_inicio")?.toString();
  const fecha_fin = formData.get("fecha_fin")?.toString();
  const mensaje = formData.get("mensaje")?.toString().trim() || null;

  if (!nombre) throw new Error("El nombre es obligatorio");
  if (!TIPOS_VALIDOS.includes(tipo)) throw new Error("Elegí un tipo de fecha válido");
  if (!fecha_inicio || !fecha_fin) {
    throw new Error("La fecha de inicio y de finalización son obligatorias");
  }
  if (fecha_fin < fecha_inicio) {
    throw new Error("La fecha de finalización no puede ser anterior a la de inicio");
  }

  return { nombre, tipo, fecha_inicio, fecha_fin, mensaje };
}

// crearFechaImportante/actualizarFechaImportante devuelven { ok, error }
// en vez de tirar una excepción: Next.js esconde el mensaje real de un
// `throw` lanzado desde un Server Action en producción, así que un
// valor de retorno normal es la única forma de que motivos como "la
// fecha de finalización no puede ser anterior a la de inicio" lleguen
// tal cual al formulario.
export async function crearFechaImportante(formData) {
  try {
    const { supabase } = await requireAdmin();
    const campos = leerCampos(formData);
    const imagen = formData.get("imagen");

    const { data: fechaImportante, error } = await supabase
      .from("fechas_importantes")
      .insert(campos)
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (imagen && typeof imagen !== "string" && imagen.size > 0) {
      const admin = createAdminClient();
      const url = await subirImagenFechaImportante(admin, fechaImportante.id, imagen);
      const { error: updateError } = await admin
        .from("fechas_importantes")
        .update({ imagen_url: url })
        .eq("id", fechaImportante.id);
      if (updateError) throw new Error(updateError.message);
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }

  revalidatePath("/admin/fechas-importantes");
  redirect("/admin/fechas-importantes");
}

export async function actualizarFechaImportante(formData) {
  const id = formData.get("id");
  try {
    const { supabase } = await requireAdmin();
    const campos = leerCampos(formData);
    const activo = formData.get("activo") === "on";
    const imagen = formData.get("imagen");

    const { error } = await supabase
      .from("fechas_importantes")
      .update({ ...campos, activo })
      .eq("id", id);
    if (error) throw new Error(error.message);

    if (imagen && typeof imagen !== "string" && imagen.size > 0) {
      const admin = createAdminClient();
      const url = await subirImagenFechaImportante(admin, id, imagen);
      const { error: updateError } = await admin
        .from("fechas_importantes")
        .update({ imagen_url: url })
        .eq("id", id);
      if (updateError) throw new Error(updateError.message);
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }

  revalidatePath("/admin/fechas-importantes");
  revalidatePath(`/admin/fechas-importantes/${id}`);
  return { ok: true };
}

export async function eliminarFechaImportante(formData) {
  const { supabase } = await requireAdmin();
  const id = formData.get("id");

  const { error } = await supabase.from("fechas_importantes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/fechas-importantes");
  redirect("/admin/fechas-importantes");
}
