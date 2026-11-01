"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  archivosNuevos,
  validarAdjuntos,
  subirAdjuntos,
  borrarArchivos,
} from "@/lib/supabase/mensaje-adjuntos";

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

// crearMensaje/actualizarMensaje devuelven { ok, error } en vez de tirar
// una excepción: Next.js esconde el mensaje real de un `throw` lanzado
// desde un Server Action en producción (queda el mensaje genérico "An
// error occurred in the Server Components render..."), así que un
// valor de retorno normal es la única forma de que motivos como "la
// fecha de fin no puede ser anterior a la de inicio" lleguen tal cual
// al formulario.
export async function crearMensaje(formData) {
  try {
    const { supabase, user } = await requireAdmin();
    const campos = leerCampos(formData);
    const nuevos = archivosNuevos(formData);
    // Se valida antes de insertar para no dejar un mensaje a medio crear
    // por un adjunto inválido.
    await validarAdjuntos(nuevos);

    const { data: mensaje, error } = await supabase
      .from("mensajes")
      .insert({ ...campos, creado_por: user.id })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    if (nuevos.length > 0) {
      const admin = createAdminClient();
      try {
        const filas = await subirAdjuntos(admin, mensaje.id, nuevos);
        const { error: errorAdjuntos } = await supabase.from("mensaje_adjuntos").insert(filas);
        if (errorAdjuntos) {
          await borrarArchivos(admin, filas.map((f) => f.ruta));
          throw new Error(errorAdjuntos.message);
        }
      } catch (err) {
        // Sin los adjuntos el mensaje quedaría incompleto: se deshace.
        await supabase.from("mensajes").delete().eq("id", mensaje.id);
        throw err;
      }
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }

  revalidatePath("/admin/mensajes");
  redirect("/admin/mensajes");
}

export async function actualizarMensaje(formData) {
  const id = formData.get("id");
  try {
    const { supabase } = await requireAdmin();
    const campos = leerCampos(formData);
    const activo = formData.get("activo") === "on";
    const nuevos = archivosNuevos(formData);
    const idsAQuitar = new Set(formData.getAll("quitar_adjuntos").map(String));

    const { data: existentes } = await supabase
      .from("mensaje_adjuntos")
      .select("id, ruta, tamano")
      .eq("mensaje_id", id);
    const aQuitar = (existentes ?? []).filter((a) => idsAQuitar.has(a.id));
    const conservados = (existentes ?? []).filter((a) => !idsAQuitar.has(a.id));
    await validarAdjuntos(nuevos, conservados);

    // Orden pensado para que un fallo no deje nada a medias: primero se
    // suben los archivos nuevos, recién después se toca el mensaje y, al
    // final, se borra lo que se quitó.
    const admin = createAdminClient();
    const subidos = nuevos.length > 0 ? await subirAdjuntos(admin, id, nuevos) : [];

    const { error } = await supabase
      .from("mensajes")
      .update({ ...campos, activo })
      .eq("id", id);
    if (error) {
      await borrarArchivos(admin, subidos.map((s) => s.ruta));
      throw new Error(error.message);
    }

    if (subidos.length > 0) {
      const { error: errorAdjuntos } = await supabase.from("mensaje_adjuntos").insert(subidos);
      if (errorAdjuntos) {
        await borrarArchivos(admin, subidos.map((s) => s.ruta));
        throw new Error(errorAdjuntos.message);
      }
    }

    if (aQuitar.length > 0) {
      await supabase
        .from("mensaje_adjuntos")
        .delete()
        .in("id", aQuitar.map((a) => a.id));
      await borrarArchivos(admin, aQuitar.map((a) => a.ruta));
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }

  revalidatePath("/admin/mensajes");
  revalidatePath(`/admin/mensajes/${id}`);
  return { ok: true };
}

export async function eliminarMensaje(formData) {
  const { supabase } = await requireAdmin();
  const id = formData.get("id");

  const { data: adjuntos } = await supabase
    .from("mensaje_adjuntos")
    .select("ruta")
    .eq("mensaje_id", id);

  const { error } = await supabase.from("mensajes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  // Las filas de mensaje_adjuntos se borran solas (cascade), pero los
  // archivos del bucket no.
  await borrarArchivos(
    createAdminClient(),
    (adjuntos ?? []).map((a) => a.ruta)
  );

  revalidatePath("/admin/mensajes");
  redirect("/admin/mensajes");
}
