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

export async function guardarGruposPadres(formData) {
  const supabase = await requireSession();

  const { data: ramas, error: ramasError } = await supabase
    .from("ramas")
    .select("id")
    .neq("nombre", "Adultos");
  if (ramasError) throw new Error(ramasError.message);

  const filas = [];
  for (const r of ramas ?? []) {
    const link = formData.get(`link_${r.id}`)?.toString().trim() || null;
    if (link && !/^https?:\/\//i.test(link)) {
      throw new Error("Los links tienen que empezar con http:// o https://");
    }
    filas.push({ rama_id: r.id, link, updated_at: new Date().toISOString() });
  }

  if (filas.length > 0) {
    const { error: linksError } = await supabase.from("grupos_whatsapp").upsert(filas);
    if (linksError) throw new Error(linksError.message);
  }

  const visible = formData.get("visible") === "on";
  const { error: configError } = await supabase
    .from("configuracion")
    .update({ grupos_padres_visible: visible })
    .eq("id", 1);
  if (configError) throw new Error(configError.message);

  revalidatePath("/admin/grupos-padres");
  revalidatePath("/mi-cuenta");
}
