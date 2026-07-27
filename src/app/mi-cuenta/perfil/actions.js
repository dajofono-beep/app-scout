"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { subirFotoPerfil } from "@/lib/supabase/perfiles";

async function requireMiembro() {
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
  if (!miembro) throw new Error("No autenticado");

  return { supabase, miembroId: miembro.id };
}

export async function actualizarPerfil(formData) {
  const { supabase, miembroId } = await requireMiembro();

  const telefono = formData.get("telefono")?.toString().trim() || null;
  const red_social_1 = formData.get("red_social_1")?.toString().trim() || null;
  const red_social_2 = formData.get("red_social_2")?.toString().trim() || null;
  const red_social_3 = formData.get("red_social_3")?.toString().trim() || null;
  const foto = formData.get("foto");

  const { error } = await supabase.from("perfiles").upsert({
    miembro_id: miembroId,
    telefono,
    red_social_1,
    red_social_2,
    red_social_3,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  if (foto && typeof foto !== "string" && foto.size > 0) {
    const admin = createAdminClient();
    const url = await subirFotoPerfil(admin, miembroId, foto);
    const { error: updateError } = await admin
      .from("perfiles")
      .update({ foto_url: url })
      .eq("miembro_id", miembroId);
    if (updateError) throw new Error(updateError.message);
  }

  revalidatePath("/mi-cuenta/perfil");
  revalidatePath("/mi-cuenta");
}

export async function actualizarContrasena(formData) {
  const { supabase } = await requireMiembro();

  const password = formData.get("password")?.toString();
  const confirmacion = formData.get("confirmacion")?.toString();

  if (!password || password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }
  if (password !== confirmacion) {
    throw new Error("Las contraseñas no coinciden.");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}
