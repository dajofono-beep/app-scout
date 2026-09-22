"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function crearFamilia(formData) {
  const { supabase } = await requireAdmin();
  const nombre = formData.get("nombre")?.toString().trim();
  if (!nombre) throw new Error("El nombre es obligatorio");

  const { error } = await supabase.from("familias").insert({ nombre });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/familias");
  revalidatePath("/admin/miembros");
  redirect("/admin/familias");
}

export async function actualizarFamilia(formData) {
  const { supabase } = await requireAdmin();
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
  const { supabase } = await requireAdmin();
  const id = formData.get("id");

  const { error } = await supabase.from("familias").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/familias");
  revalidatePath("/admin/miembros");
  redirect("/admin/familias");
}
