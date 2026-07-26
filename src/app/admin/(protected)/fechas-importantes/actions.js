"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { subirImagenFechaImportante } from "@/lib/supabase/fechas-importantes";

async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return supabase;
}

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

export async function crearFechaImportante(formData) {
  const supabase = await requireSession();
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

  revalidatePath("/admin/fechas-importantes");
  redirect("/admin/fechas-importantes");
}

export async function actualizarFechaImportante(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");
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

  revalidatePath("/admin/fechas-importantes");
  revalidatePath(`/admin/fechas-importantes/${id}`);
}

export async function eliminarFechaImportante(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");

  const { error } = await supabase.from("fechas_importantes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/fechas-importantes");
  redirect("/admin/fechas-importantes");
}
