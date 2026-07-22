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

export async function crearFamilia(formData) {
  const supabase = await requireSession();
  const nombre = formData.get("nombre")?.toString().trim();
  if (!nombre) throw new Error("El nombre es obligatorio");

  const { error } = await supabase.from("familias").insert({ nombre });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/familias");
  revalidatePath("/admin/miembros");
  redirect("/admin/familias");
}

export async function actualizarFamilia(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");
  const nombre = formData.get("nombre")?.toString().trim();
  if (!nombre) throw new Error("El nombre es obligatorio");

  const { error } = await supabase
    .from("familias")
    .update({ nombre })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/familias");
  revalidatePath(`/admin/familias/${id}`);
}

export async function eliminarFamilia(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");

  const { error } = await supabase.from("familias").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/familias");
  revalidatePath("/admin/miembros");
  redirect("/admin/familias");
}
