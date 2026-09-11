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

export async function guardarNotificacionesPagosConfig(formData) {
  const supabase = await requireSession();

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

  revalidatePath("/admin/notificaciones-pagos");
}
