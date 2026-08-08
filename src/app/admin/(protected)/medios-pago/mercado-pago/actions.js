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

export async function guardarMercadoPagoConfig(formData) {
  const supabase = await requireSession();

  const titular = formData.get("titular")?.toString().trim() || null;
  const ambiente = formData.get("ambiente")?.toString();
  const access_token_prueba = formData.get("access_token_prueba")?.toString().trim() || null;
  const public_key_prueba = formData.get("public_key_prueba")?.toString().trim() || null;
  const access_token_produccion =
    formData.get("access_token_produccion")?.toString().trim() || null;
  const public_key_produccion =
    formData.get("public_key_produccion")?.toString().trim() || null;
  const recargoRaw = formData.get("recargo_porcentaje")?.toString();
  const recargo_porcentaje = recargoRaw ? Number(recargoRaw) : 0;

  if (ambiente !== "prueba" && ambiente !== "produccion") {
    throw new Error("Ambiente inválido");
  }
  if (ambiente === "prueba" && !access_token_prueba) {
    throw new Error(
      "Para dejar activo el ambiente de prueba, cargá primero el access token de prueba"
    );
  }
  if (ambiente === "produccion" && !access_token_produccion) {
    throw new Error(
      "Para dejar activo el ambiente de producción, cargá primero el access token de producción"
    );
  }
  if (recargo_porcentaje < 0 || recargo_porcentaje > 100) {
    throw new Error("El recargo tiene que estar entre 0 y 100");
  }

  const { error } = await supabase
    .from("mercadopago_config")
    .update({
      titular,
      ambiente,
      access_token_prueba,
      public_key_prueba,
      access_token_produccion,
      public_key_produccion,
      recargo_porcentaje,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/medios-pago/mercado-pago");
}
