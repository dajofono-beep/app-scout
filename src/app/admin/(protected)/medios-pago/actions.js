"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function guardarMediosPago(formData) {
  const { supabase } = await requireAdmin();

  const { data: medios, error: mediosError } = await supabase
    .from("medios_pago")
    .select("id");
  if (mediosError) throw new Error(mediosError.message);

  for (const m of medios ?? []) {
    const habilitado = formData.get(`habilitado_${m.id}`) === "on";
    const { error } = await supabase
      .from("medios_pago")
      .update({ habilitado })
      .eq("id", m.id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/medios-pago");
  revalidatePath("/mi-cuenta");
}

export async function guardarNotificacionesPagosConfig(formData) {
  const { supabase } = await requireAdmin();

  const email = formData.get("email")?.toString().trim() || null;
  const app_password = formData.get("app_password")?.toString().trim() || null;
  const activo = formData.get("activo") === "on";

  if (activo && (!email || !app_password)) {
    throw new Error(
      "Para activar el envío, cargá primero el email y la contraseña de aplicación"
    );
  }

  const { error } = await supabase
    .from("notificaciones_pagos_config")
    .update({
      email,
      app_password,
      activo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/medios-pago");
}
