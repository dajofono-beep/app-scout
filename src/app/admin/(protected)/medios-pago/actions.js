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

export async function guardarMediosPago(formData) {
  const supabase = await requireSession();

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
