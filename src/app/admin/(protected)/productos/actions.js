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

export async function crearProducto(formData) {
  const supabase = await requireSession();
  const nombre = formData.get("nombre")?.toString().trim();
  const descripcion = formData.get("descripcion")?.toString().trim() || null;
  const importe = Number(formData.get("importe"));

  if (!nombre) throw new Error("El nombre es obligatorio");
  if (!importe || importe <= 0) throw new Error("El importe debe ser mayor a 0");

  const { error } = await supabase
    .from("productos")
    .insert({ nombre, descripcion, importe });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/productos");
}

export async function actualizarProducto(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");
  const nombre = formData.get("nombre")?.toString().trim();
  const descripcion = formData.get("descripcion")?.toString().trim() || null;
  const importe = Number(formData.get("importe"));
  const activo = formData.get("activo") === "on";

  if (!nombre) throw new Error("El nombre es obligatorio");
  if (!importe || importe <= 0) throw new Error("El importe debe ser mayor a 0");

  const { error } = await supabase
    .from("productos")
    .update({ nombre, descripcion, importe, activo })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/productos");
}

export async function eliminarProducto(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");

  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/productos");
}
