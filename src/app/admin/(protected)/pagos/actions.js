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

export async function actualizarPago(formData) {
  const supabase = await requireSession();

  const id = formData.get("id");
  const importe = Number(formData.get("importe"));
  const fecha_pago = formData.get("fecha_pago")?.toString();
  const medio_pago = formData.get("medio_pago")?.toString().trim() || null;
  const nota_admin = formData.get("nota_admin")?.toString().trim() || null;

  if (!importe || importe <= 0) throw new Error("El importe debe ser mayor a 0");
  if (!fecha_pago) throw new Error("La fecha es obligatoria");

  const { error } = await supabase
    .from("pagos")
    .update({ importe, fecha_pago, medio_pago, nota_admin })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/pagos");
  revalidatePath("/admin");
}

export async function cancelarPago(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");

  const { error } = await supabase
    .from("pagos")
    .update({ estado: "cancelado" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/pagos");
  revalidatePath("/admin");
}

export async function reactivarPago(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");

  const { error } = await supabase
    .from("pagos")
    .update({ estado: "activo" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/pagos");
  revalidatePath("/admin");
}

export async function reasignarPago(formData) {
  const supabase = await requireSession();
  const id = formData.get("id");
  const nuevo_miembro_id = formData.get("nuevo_miembro_id")?.toString();

  if (!nuevo_miembro_id) throw new Error("Elegí a quién reasignar el pago");

  const { error } = await supabase
    .from("pagos")
    .update({ miembro_id: nuevo_miembro_id })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/pagos");
  revalidatePath("/admin");
}
