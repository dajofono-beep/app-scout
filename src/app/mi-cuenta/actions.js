"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { subirComprobante } from "@/lib/supabase/comprobantes";

// Reparte un importe en N partes de 2 decimales; la última parte absorbe
// el resto del redondeo para que la suma dé exacto al importe original.
function dividirEnPartesIguales(importeTotal, cantidadPartes) {
  const base = Math.floor((importeTotal / cantidadPartes) * 100) / 100;
  const partes = Array(cantidadPartes).fill(base);
  const resto = Math.round((importeTotal - base * cantidadPartes) * 100) / 100;
  partes[partes.length - 1] = Math.round((partes[partes.length - 1] + resto) * 100) / 100;
  return partes;
}

async function subirComprobanteAPagos(pagos, comprobante) {
  const admin = createAdminClient();
  const ruta = await subirComprobante(admin, pagos[0].id, comprobante);

  const { error } = await admin
    .from("pagos")
    .update({ comprobante_url: ruta })
    .in(
      "id",
      pagos.map((p) => p.id)
    );
  if (error) throw new Error(error.message);
}

export async function crearPago(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const miembro_id = formData.get("miembro_id")?.toString();
  const importe = Number(formData.get("importe"));
  const fecha_pago = formData.get("fecha_pago")?.toString();
  const medio_pago = formData.get("medio_pago")?.toString().trim() || null;
  const comprobante = formData.get("comprobante");
  const hayComprobante =
    comprobante && typeof comprobante !== "string" && comprobante.size > 0;

  if (!miembro_id) throw new Error("Elegí para quién es el pago");
  if (!importe || importe <= 0) throw new Error("El importe debe ser mayor a 0");
  if (!fecha_pago) throw new Error("La fecha es obligatoria");

  if (miembro_id === "reparto_igual") {
    // RLS ("miembros_lectura_grupo"/propia familia) ya limita esta consulta
    // a los miembros de la misma familia que el usuario logueado.
    const { data: familiares, error: familiaresError } = await supabase
      .from("miembros")
      .select("id")
      .order("apellido");
    if (familiaresError) throw new Error(familiaresError.message);
    if (!familiares || familiares.length === 0) {
      throw new Error("No se encontraron hermanos");
    }

    const montos = dividirEnPartesIguales(importe, familiares.length);

    const { data: pagos, error } = await supabase
      .from("pagos")
      .insert(
        familiares.map((f, i) => ({
          miembro_id: f.id,
          importe: montos[i],
          fecha_pago,
          medio_pago,
          estado: "activo",
          creado_por: user.id,
        }))
      )
      .select();
    if (error) throw new Error(error.message);

    if (hayComprobante) await subirComprobanteAPagos(pagos, comprobante);

    revalidatePath("/mi-cuenta");
    return;
  }

  // La política de RLS ("pagos_insertan_su_familia") valida que miembro_id
  // pertenezca a la misma familia que el usuario logueado.
  const { data: pago, error } = await supabase
    .from("pagos")
    .insert({
      miembro_id,
      importe,
      fecha_pago,
      medio_pago,
      estado: "activo",
      creado_por: user.id,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  if (hayComprobante) await subirComprobanteAPagos([pago], comprobante);

  revalidatePath("/mi-cuenta");
}
