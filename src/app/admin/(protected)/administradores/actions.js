"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// A diferencia del resto de las acciones del panel (que dejan que la
// política de RLS "for all using (es_administrador())" bloquee a
// cualquiera que no sea admin), acá hace falta este chequeo explícito:
// crear/editar/borrar un administrador usa el cliente con clave de
// servicio (para poder tocar auth.users), que bypassea RLS por
// completo. Sin este chequeo, cualquiera que invocara la acción
// directamente podría crearse a sí mismo como administrador.
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: soyAdmin } = await supabase
    .from("administradores")
    .select("auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!soyAdmin) throw new Error("No tenés permisos de administrador");

  return user;
}

// Devuelve { ok: true } o { ok: false, error } en vez de tirar una
// excepción: Next.js borra el mensaje de cualquier error lanzado con
// `throw` desde un Server Action en producción, así que un valor de
// retorno normal es la única forma de que el motivo real (p. ej.
// "ese email ya tiene una cuenta") llegue tal cual al formulario.
export async function crearAdministrador(formData) {
  await requireAdmin();

  const nombre = formData.get("nombre")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const recibe_notificaciones_pagos = formData.get("recibe_notificaciones_pagos") === "on";

  if (!nombre) return { ok: false, error: "Elegí un miembro de la lista" };
  if (!email) return { ok: false, error: "El email es obligatorio" };
  if (!password || password.length < 6) {
    return { ok: false, error: "La contraseña tiene que tener al menos 6 caracteres" };
  }

  const admin = createAdminClient();

  const { data: nuevoUsuario, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authError) {
    const error = authError.message.includes("already been registered")
      ? "Ya existe una cuenta con ese email. Si esa persona ya es administradora, buscala en el listado en vez de crearla de nuevo."
      : authError.message;
    return { ok: false, error };
  }

  const { error } = await admin
    .from("administradores")
    .insert({
      auth_user_id: nuevoUsuario.user.id,
      nombre,
      recibe_notificaciones_pagos,
    });
  if (error) {
    // Si falla el alta en `administradores`, deshacer el usuario recién
    // creado para no dejar una cuenta huérfana sin ningún acceso.
    await admin.auth.admin.deleteUser(nuevoUsuario.user.id);
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/administradores");
  return { ok: true };
}

export async function actualizarAdministrador(formData) {
  await requireAdmin();

  const auth_user_id = formData.get("auth_user_id")?.toString();
  const nombre = formData.get("nombre")?.toString().trim();
  const nuevaPassword = formData.get("nueva_password")?.toString().trim();
  const recibe_notificaciones_pagos = formData.get("recibe_notificaciones_pagos") === "on";

  if (!auth_user_id) return { ok: false, error: "Falta el administrador" };
  if (!nombre) return { ok: false, error: "Elegí un miembro de la lista" };
  if (nuevaPassword && nuevaPassword.length < 6) {
    return { ok: false, error: "La contraseña nueva tiene que tener al menos 6 caracteres" };
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("administradores")
    .update({ nombre, recibe_notificaciones_pagos })
    .eq("auth_user_id", auth_user_id);
  if (error) return { ok: false, error: error.message };

  if (nuevaPassword) {
    const { error: passError } = await admin.auth.admin.updateUserById(auth_user_id, {
      password: nuevaPassword,
    });
    if (passError) return { ok: false, error: passError.message };
  }

  revalidatePath("/admin/administradores");
  revalidatePath(`/admin/administradores/${auth_user_id}`);
  return { ok: true };
}

export async function eliminarAdministrador(formData) {
  const user = await requireAdmin();

  const auth_user_id = formData.get("auth_user_id")?.toString();
  if (!auth_user_id) throw new Error("Falta el administrador");
  if (auth_user_id === user.id) {
    throw new Error("No podés quitarte a vos mismo como administrador");
  }

  const admin = createAdminClient();

  const { count } = await admin
    .from("administradores")
    .select("auth_user_id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) {
    throw new Error("No podés quitar al último administrador");
  }

  // Se borra solo la fila de `administradores` (revoca el acceso al
  // panel), no la cuenta de auth.users — así queda reversible: si
  // hace falta, se lo puede volver a agregar sin recrearle la cuenta.
  const { error } = await admin
    .from("administradores")
    .delete()
    .eq("auth_user_id", auth_user_id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/administradores");
  redirect("/admin/administradores");
}
