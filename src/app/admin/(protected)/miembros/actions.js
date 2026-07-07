"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verificarAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: admin } = await supabase
    .from("administradores")
    .select("auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!admin) throw new Error("No autorizado");

  return supabase;
}

export async function crearMiembro(formData) {
  await verificarAdmin();

  const nombre = formData.get("nombre")?.toString().trim();
  const apellido = formData.get("apellido")?.toString().trim();
  const dni = formData.get("dni")?.toString().trim();
  const rama_id = formData.get("rama_id")?.toString();
  const familia_id = formData.get("familia_id")?.toString() || null;
  const ordenRaw = formData.get("orden_familia")?.toString();
  const orden_familia = ordenRaw ? Number(ordenRaw) : null;
  const fecha_nacimiento = formData.get("fecha_nacimiento")?.toString() || null;

  if (!nombre || !apellido || !dni || !rama_id) {
    throw new Error("Todos los campos son obligatorios");
  }
  if (dni.length < 6) {
    throw new Error(
      "El DNI debe tener al menos 6 caracteres (se usa como contraseña inicial)"
    );
  }

  const admin = createAdminClient();

  const { data: miembro, error: insertError } = await admin
    .from("miembros")
    .insert({
      nombre,
      apellido,
      dni,
      rama_id,
      familia_id,
      orden_familia,
      fecha_nacimiento,
    })
    .select()
    .single();
  if (insertError) throw new Error(insertError.message);

  const email = `m${miembro.id}@grupo.local`;
  const { data: userData, error: userError } =
    await admin.auth.admin.createUser({
      email,
      password: dni,
      email_confirm: true,
    });

  if (userError) {
    await admin.from("miembros").delete().eq("id", miembro.id);
    throw new Error(
      "No se pudo crear el usuario de acceso: " + userError.message
    );
  }

  const { error: updateError } = await admin
    .from("miembros")
    .update({ auth_user_id: userData.user.id })
    .eq("id", miembro.id);
  if (updateError) throw new Error(updateError.message);

  revalidatePath("/admin/miembros");
}

export async function actualizarMiembro(formData) {
  const supabase = await verificarAdmin();

  const id = formData.get("id");
  const nombre = formData.get("nombre")?.toString().trim();
  const apellido = formData.get("apellido")?.toString().trim();
  const rama_id = formData.get("rama_id")?.toString();
  const activo = formData.get("activo") === "on";
  const familia_id = formData.get("familia_id")?.toString() || null;
  const ordenRaw = formData.get("orden_familia")?.toString();
  const orden_familia = ordenRaw ? Number(ordenRaw) : null;
  const fecha_nacimiento = formData.get("fecha_nacimiento")?.toString() || null;

  if (!nombre || !apellido || !rama_id) {
    throw new Error("Nombre, apellido y rama son obligatorios");
  }

  const { error } = await supabase
    .from("miembros")
    .update({
      nombre,
      apellido,
      rama_id,
      activo,
      familia_id,
      orden_familia,
      fecha_nacimiento,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/miembros");
}
