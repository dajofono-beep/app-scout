"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function crearPago(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const miembro_id = formData.get("miembro_id")?.toString();
  const importe = Number(formData.get("importe"));
  const fecha_pago = formData.get("fecha_pago")?.toString();
  const medio_pago = formData.get("medio_pago")?.toString().trim() || null;

  if (!miembro_id) throw new Error("Elegí para quién es el pago");
  if (!importe || importe <= 0) throw new Error("El importe debe ser mayor a 0");
  if (!fecha_pago) throw new Error("La fecha es obligatoria");

  // La política de RLS ("pagos_insertan_su_familia") valida que miembro_id
  // pertenezca a la misma familia que el usuario logueado.
  const { error } = await supabase.from("pagos").insert({
    miembro_id,
    importe,
    fecha_pago,
    medio_pago,
    estado: "activo",
    creado_por: user.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/mi-cuenta");
}
