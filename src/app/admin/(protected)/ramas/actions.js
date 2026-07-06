"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return supabase;
}

export async function crearRama(formData) {
  const supabase = await requireSession();
  const nombre = formData.get("nombre")?.toString().trim();
  if (!nombre) throw new Error("El nombre es obligatorio");

  const { error } = await supabase.from("ramas").insert({ nombre });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/ramas");
}

export async function actualizarRama(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");
  const nombre = formData.get("nombre")?.toString().trim();
  if (!nombre) throw new Error("El nombre es obligatorio");

  const { error } = await supabase
    .from("ramas")
    .update({ nombre })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/ramas");
}

export async function eliminarRama(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");

  const { error } = await supabase.from("ramas").delete().eq("id", id);
  if (error) {
    throw new Error(
      "No se pudo eliminar (probablemente tenga miembros asignados): " +
        error.message
    );
  }

  revalidatePath("/admin/ramas");
}
