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

export async function crearProducto(formData) {
  const supabase = await requireSession();
  const nombre = formData.get("nombre")?.toString().trim();
  const descripcion = formData.get("descripcion")?.toString().trim() || null;
  const importe = Number(formData.get("importe"));
  const es_cuotable = formData.get("es_cuotable") === "on";
  const cantidadRaw = formData.get("cantidad_cuotas")?.toString();
  const cantidad_cuotas = cantidadRaw ? Number(cantidadRaw) : null;
  const aplica_descuento_hermanos =
    formData.get("aplica_descuento_hermanos") === "on";
  const fecha_vencimiento = formData.get("fecha_vencimiento")?.toString() || null;

  if (!nombre) throw new Error("El nombre es obligatorio");
  if (!importe || importe <= 0) throw new Error("El importe debe ser mayor a 0");
  if (es_cuotable && (!cantidad_cuotas || cantidad_cuotas <= 0)) {
    throw new Error("Indicá la cantidad de cuotas si el producto es cuotable");
  }

  const { error } = await supabase.from("productos").insert({
    nombre,
    descripcion,
    importe,
    es_cuotable,
    cantidad_cuotas: es_cuotable ? cantidad_cuotas : null,
    aplica_descuento_hermanos,
    fecha_vencimiento,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function actualizarProducto(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");
  const nombre = formData.get("nombre")?.toString().trim();
  const descripcion = formData.get("descripcion")?.toString().trim() || null;
  const importe = Number(formData.get("importe"));
  const activo = formData.get("activo") === "on";
  const es_cuotable = formData.get("es_cuotable") === "on";
  const cantidadRaw = formData.get("cantidad_cuotas")?.toString();
  const cantidad_cuotas = cantidadRaw ? Number(cantidadRaw) : null;
  const aplica_descuento_hermanos =
    formData.get("aplica_descuento_hermanos") === "on";
  const fecha_vencimiento = formData.get("fecha_vencimiento")?.toString() || null;

  if (!nombre) throw new Error("El nombre es obligatorio");
  if (!importe || importe <= 0) throw new Error("El importe debe ser mayor a 0");
  if (es_cuotable && (!cantidad_cuotas || cantidad_cuotas <= 0)) {
    throw new Error("Indicá la cantidad de cuotas si el producto es cuotable");
  }

  const { error } = await supabase
    .from("productos")
    .update({
      nombre,
      descripcion,
      importe,
      activo,
      es_cuotable,
      cantidad_cuotas: es_cuotable ? cantidad_cuotas : null,
      aplica_descuento_hermanos,
      fecha_vencimiento,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${id}`);
}

export async function eliminarProducto(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");

  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}
