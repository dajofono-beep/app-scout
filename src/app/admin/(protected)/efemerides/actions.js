"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { subirImagenEfemeride } from "@/lib/supabase/efemerides";

async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return supabase;
}

function leerCampos(formData) {
  const nombre = formData.get("nombre")?.toString().trim();
  const mes = Number(formData.get("mes"));
  const dia = Number(formData.get("dia"));
  const mensaje = formData.get("mensaje")?.toString().trim() || null;

  if (!nombre) throw new Error("El nombre es obligatorio");
  if (!mes || mes < 1 || mes > 12) throw new Error("El mes debe ser entre 1 y 12");
  if (!dia || dia < 1 || dia > 31) throw new Error("El día debe ser entre 1 y 31");

  return { nombre, mes, dia, mensaje };
}

export async function crearEfemeride(formData) {
  const supabase = await requireSession();
  const campos = leerCampos(formData);
  const imagen = formData.get("imagen");

  const { data: efemeride, error } = await supabase
    .from("efemerides")
    .insert(campos)
    .select()
    .single();
  if (error) throw new Error(error.message);

  if (imagen && typeof imagen !== "string" && imagen.size > 0) {
    const admin = createAdminClient();
    const url = await subirImagenEfemeride(admin, efemeride.id, imagen);
    const { error: updateError } = await admin
      .from("efemerides")
      .update({ imagen_url: url })
      .eq("id", efemeride.id);
    if (updateError) throw new Error(updateError.message);
  }

  revalidatePath("/admin/efemerides");
  redirect("/admin/efemerides");
}

export async function actualizarEfemeride(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");
  const campos = leerCampos(formData);
  const activo = formData.get("activo") === "on";
  const imagen = formData.get("imagen");

  const { error } = await supabase
    .from("efemerides")
    .update({ ...campos, activo })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (imagen && typeof imagen !== "string" && imagen.size > 0) {
    const admin = createAdminClient();
    const url = await subirImagenEfemeride(admin, id, imagen);
    const { error: updateError } = await admin
      .from("efemerides")
      .update({ imagen_url: url })
      .eq("id", id);
    if (updateError) throw new Error(updateError.message);
  }

  revalidatePath("/admin/efemerides");
  revalidatePath(`/admin/efemerides/${id}`);
}

export async function eliminarEfemeride(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");

  const { error } = await supabase.from("efemerides").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/efemerides");
  redirect("/admin/efemerides");
}
