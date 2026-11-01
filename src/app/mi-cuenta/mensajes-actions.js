"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Devuelve { ok, error } en vez de tirar una excepción — Next.js esconde
// el mensaje real de un `throw` lanzado desde un Server Action en
// producción.
export async function marcarMensajeLeido(mensajeId, leido) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión venció. Volvé a ingresar." };

  const { data: miembro } = await supabase
    .from("miembros")
    .select("id, familia_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!miembro) return { ok: false, error: "Tu sesión venció. Volvé a ingresar." };

  // Un miembro sin familia asignada se trata como una familia de uno solo.
  const porFamilia = Boolean(miembro.familia_id);
  const columna = porFamilia ? "familia_id" : "miembro_id";
  const valor = porFamilia ? miembro.familia_id : miembro.id;

  if (leido) {
    const { error } = await supabase.from("mensaje_lecturas").upsert(
      {
        mensaje_id: mensajeId,
        [columna]: valor,
        leido_at: new Date().toISOString(),
      },
      { onConflict: `mensaje_id,${columna}` }
    );
    if (error) return { ok: false, error: "No se pudo marcar el mensaje. Intentá de nuevo." };
  } else {
    const { error } = await supabase
      .from("mensaje_lecturas")
      .delete()
      .eq("mensaje_id", mensajeId)
      .eq(columna, valor);
    if (error) return { ok: false, error: "No se pudo desmarcar el mensaje. Intentá de nuevo." };
  }

  revalidatePath("/mi-cuenta");
  return { ok: true };
}
