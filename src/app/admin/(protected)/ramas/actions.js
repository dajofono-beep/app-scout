"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  const ordenRaw = formData.get("orden")?.toString();
  const orden = ordenRaw ? Number(ordenRaw) : 0;
  if (!nombre) throw new Error("El nombre es obligatorio");

  const { error } = await supabase.from("ramas").insert({ nombre, orden });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/ramas");
  redirect("/admin/ramas");
}

export async function actualizarRama(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");
  const nombre = formData.get("nombre")?.toString().trim();
  const ordenRaw = formData.get("orden")?.toString();
  const orden = ordenRaw ? Number(ordenRaw) : 0;
  if (!nombre) throw new Error("El nombre es obligatorio");

  const { error } = await supabase
    .from("ramas")
    .update({ nombre, orden })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/ramas");
  revalidatePath(`/admin/ramas/${id}`);
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
  redirect("/admin/ramas");
}
