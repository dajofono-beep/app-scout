"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

export async function crearCargoIndividual(formData) {
  const { supabase, user } = await requireSession();

  const miembro_id = formData.get("miembro_id")?.toString();
  const producto_id = formData.get("producto_id")?.toString();
  const fecha = formData.get("fecha")?.toString();

  if (!miembro_id || !producto_id || !fecha) {
    throw new Error("Miembro, producto y fecha son obligatorios");
  }

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select("nombre, importe")
    .eq("id", producto_id)
    .single();
  if (productoError) throw new Error(productoError.message);

  const { error } = await supabase.from("cargos").insert({
    miembro_id,
    producto_id,
    concepto: producto.nombre,
    importe: producto.importe,
    fecha,
    creado_por: user.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/cargos");
  revalidatePath("/admin");
}

export async function crearCargoPorRama(formData) {
  const { supabase, user } = await requireSession();

  const rama_id = formData.get("rama_id")?.toString();
  const producto_id = formData.get("producto_id")?.toString();
  const fecha = formData.get("fecha")?.toString();

  if (!rama_id || !producto_id || !fecha) {
    throw new Error("Rama, producto y fecha son obligatorios");
  }

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select("nombre, importe")
    .eq("id", producto_id)
    .single();
  if (productoError) throw new Error(productoError.message);

  const { data: miembros, error: miembrosError } = await supabase
    .from("miembros")
    .select("id")
    .eq("rama_id", rama_id)
    .eq("activo", true);
  if (miembrosError) throw new Error(miembrosError.message);

  if (!miembros || miembros.length === 0) {
    throw new Error("Esa rama no tiene miembros activos");
  }

  const filas = miembros.map((m) => ({
    miembro_id: m.id,
    producto_id,
    concepto: producto.nombre,
    importe: producto.importe,
    fecha,
    creado_por: user.id,
  }));

  const { error } = await supabase.from("cargos").insert(filas);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/cargos");
  revalidatePath("/admin");
}

export async function crearCargoManual(formData) {
  const { supabase, user } = await requireSession();

  const miembro_id = formData.get("miembro_id")?.toString();
  const concepto = formData.get("concepto")?.toString().trim();
  const importe = Number(formData.get("importe"));
  const fecha = formData.get("fecha")?.toString();

  if (!miembro_id || !concepto || !fecha) {
    throw new Error("Miembro, concepto y fecha son obligatorios");
  }
  if (!importe || importe <= 0) {
    throw new Error("El importe debe ser mayor a 0");
  }

  const { error } = await supabase.from("cargos").insert({
    miembro_id,
    concepto,
    importe,
    fecha,
    creado_por: user.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/cargos");
  revalidatePath("/admin");
}
