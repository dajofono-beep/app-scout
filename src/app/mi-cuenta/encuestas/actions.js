"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireMiembro() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: miembro } = await supabase
    .from("miembros")
    .select("id, familia_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!miembro) throw new Error("No autenticado");

  return { supabase, miembro };
}

// Devuelve { ok, error } en vez de tirar una excepción — mismo motivo
// que en mi-cuenta/perfil/actions.js: Next.js esconde el mensaje real
// de un `throw` lanzado desde un Server Action en producción.
export async function responderEncuesta(formData) {
  const { supabase, miembro } = await requireMiembro();

  const encuestaId = formData.get("encuesta_id")?.toString();
  const respuesta = formData.get("respuesta")?.toString().trim();

  if (!respuesta) {
    return { ok: false, error: "Elegí o escribí una respuesta." };
  }

  const { data: encuesta } = await supabase
    .from("encuestas")
    .select("*")
    .eq("id", encuestaId)
    .maybeSingle();
  if (!encuesta) {
    return { ok: false, error: "Esta encuesta ya no está disponible." };
  }
  if (encuesta.fecha_cierre && encuesta.fecha_cierre < new Date().toISOString().slice(0, 10)) {
    return { ok: false, error: "Esta encuesta ya cerró." };
  }
  if (
    encuesta.tipo_respuesta === "opcion_unica" &&
    !(encuesta.opciones ?? []).includes(respuesta)
  ) {
    return { ok: false, error: "Elegí una de las opciones." };
  }

  // Si la encuesta pide una respuesta "por familia" pero este miembro no
  // tiene una familia asignada, se lo trata como una familia de uno
  // solo: la respuesta queda igual que si fuera "por chico".
  const porFamilia = encuesta.alcance_respuesta === "familia" && Boolean(miembro.familia_id);

  const fila = {
    encuesta_id: encuestaId,
    respuesta,
    actualizado_at: new Date().toISOString(),
    ...(porFamilia
      ? { familia_id: miembro.familia_id, miembro_id: null }
      : { miembro_id: miembro.id, familia_id: null }),
  };

  const { error } = await supabase
    .from("encuesta_respuestas")
    .upsert(fila, { onConflict: porFamilia ? "encuesta_id,familia_id" : "encuesta_id,miembro_id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/mi-cuenta/encuestas/${encuestaId}`);
  revalidatePath("/mi-cuenta");
  return { ok: true };
}
