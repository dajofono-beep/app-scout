"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

const TIPOS_VALIDOS = ["todos", "rama", "familia", "miembro"];

function leerCampos(formData) {
  const titulo = formData.get("titulo")?.toString().trim();
  const cuerpo = formData.get("cuerpo")?.toString().trim();
  const destinatario_tipo = formData.get("destinatario_tipo")?.toString();
  const destinatario_id = formData.get("destinatario_id")?.toString() || null;
  const fecha_inicio = formData.get("fecha_inicio")?.toString();
  const fecha_fin = formData.get("fecha_fin")?.toString() || null;

  if (!titulo) throw new Error("El título es obligatorio");
  if (!cuerpo) throw new Error("El mensaje es obligatorio");
  if (!TIPOS_VALIDOS.includes(destinatario_tipo)) {
    throw new Error("Elegí un destinatario válido");
  }
  if (destinatario_tipo !== "todos" && !destinatario_id) {
    throw new Error("Elegí a quién va dirigido el mensaje");
  }
  if (!fecha_inicio) throw new Error("La fecha de inicio es obligatoria");
  if (fecha_fin && fecha_fin < fecha_inicio) {
    throw new Error("La fecha de fin no puede ser anterior a la de inicio");
  }

  return {
    titulo,
    cuerpo,
    destinatario_tipo,
    destinatario_id: destinatario_tipo === "todos" ? null : destinatario_id,
    fecha_inicio,
    fecha_fin,
  };
}

export async function crearMensaje(formData) {
  const { supabase, user } = await requireSession();
  const campos = leerCampos(formData);

  const { error } = await supabase
    .from("mensajes")
    .insert({ ...campos, creado_por: user.id });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/mensajes");
  redirect("/admin/mensajes");
}

export async function actualizarMensaje(formData) {
  const { supabase } = await requireSession();
  const id = formData.get("id");
  const campos = leerCampos(formData);
  const activo = formData.get("activo") === "on";

  const { error } = await supabase
    .from("mensajes")
    .update({ ...campos, activo })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/mensajes");
  revalidatePath(`/admin/mensajes/${id}`);
}

export async function eliminarMensaje(formData) {
  const { supabase } = await requireSession();
  const id = formData.get("id");

  const { error } = await supabase.from("mensajes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/mensajes");
  redirect("/admin/mensajes");
}
