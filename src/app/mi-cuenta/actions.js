"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function crearPago(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: miembro } = await supabase
    .from("miembros")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!miembro) throw new Error("No autorizado");

  const importe = Number(formData.get("importe"));
  const fecha_pago = formData.get("fecha_pago")?.toString();
  const medio_pago = formData.get("medio_pago")?.toString().trim() || null;

  if (!importe || importe <= 0) throw new Error("El importe debe ser mayor a 0");
  if (!fecha_pago) throw new Error("La fecha es obligatoria");

  const { error } = await supabase.from("pagos").insert({
    miembro_id: miembro.id,
    importe,
    fecha_pago,
    medio_pago,
    estado: "activo",
    creado_por: user.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/mi-cuenta");
}
