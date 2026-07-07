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

export async function actualizarPorcentaje(formData) {
  const supabase = await requireSession();
  const posicion = Number(formData.get("posicion"));
  const porcentaje = Number(formData.get("porcentaje"));

  if (!posicion || posicion < 1) throw new Error("Posición inválida");
  if (porcentaje < 0 || porcentaje > 100) {
    throw new Error("El porcentaje debe estar entre 0 y 100");
  }

  const { error } = await supabase
    .from("escala_descuentos_familia")
    .update({ porcentaje })
    .eq("posicion", posicion);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/descuentos");
}

export async function agregarPosicion(formData) {
  const supabase = await requireSession();
  const posicion = Number(formData.get("posicion"));
  const porcentaje = Number(formData.get("porcentaje"));

  if (!posicion || posicion < 1) throw new Error("Posición inválida");
  if (porcentaje < 0 || porcentaje > 100) {
    throw new Error("El porcentaje debe estar entre 0 y 100");
  }

  const { error } = await supabase
    .from("escala_descuentos_familia")
    .insert({ posicion, porcentaje });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/descuentos");
}

export async function eliminarPosicion(formData) {
  const supabase = await requireSession();
  const posicion = Number(formData.get("posicion"));

  const { error } = await supabase
    .from("escala_descuentos_familia")
    .delete()
    .eq("posicion", posicion);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/descuentos");
}
