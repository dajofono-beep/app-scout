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

// Devuelve { ok: true } o { ok: false, error } en vez de tirar una
// excepción: Next.js borra el mensaje de cualquier error lanzado con
// `throw` desde un server action en producción, así que un valor de
// retorno normal es la única forma de que el mensaje (p. ej. "El
// comprobante debe ser una imagen...") llegue tal cual al formulario.
export async function crearPago(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const miembro_id = formData.get("miembro_id")?.toString();
  const importe = Number(formData.get("importe"));
  const fecha_pago = formData.get("fecha_pago")?.toString();
  const medio_pago = formData.get("medio_pago")?.toString().trim() || null;
  const comprobante = formData.get("comprobante");
  const hayComprobante =
    comprobante && typeof comprobante !== "string" && comprobante.size > 0;

  if (!miembro_id) return { ok: false, error: "Elegí para quién es el pago" };
  if (!importe || importe <= 0) {
    return { ok: false, error: "El importe debe ser mayor a 0" };
  }
  if (!fecha_pago) return { ok: false, error: "La fecha es obligatoria" };
  if (!hayComprobante) return { ok: false, error: "Adjuntá el comprobante de pago" };

  if (miembro_id === "reparto_igual") {
    // RLS ("miembros_lectura_grupo"/propia familia) ya limita esta consulta
    // a los miembros de la misma familia que el usuario logueado.
    const { data: familiares, error: familiaresError } = await supabase
      .from("miembros")
      .select("id")
      .order("apellido");
    if (familiaresError) return { ok: false, error: familiaresError.message };
    if (!familiares || familiares.length === 0) {
      return { ok: false, error: "No se encontraron hermanos" };
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
    if (error) return { ok: false, error: error.message };

    try {
      await subirComprobanteAPagos(pagos, comprobante);
    } catch (err) {
      // Sin comprobante el pago queda incompleto (es obligatorio) — se
      // borra en vez de dejarlo registrado a medias. La familia solo
      // tiene permiso de INSERT sobre pagos (RLS), no de DELETE, así que
      // hace falta el cliente admin para poder deshacerlo.
      await createAdminClient()
        .from("pagos")
        .delete()
        .in("id", pagos.map((p) => p.id));
      return { ok: false, error: err.message };
    }

    revalidatePath("/mi-cuenta");
    return { ok: true };
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
  if (error) return { ok: false, error: error.message };

  try {
    await subirComprobanteAPagos([pago], comprobante);
  } catch (err) {
    await createAdminClient().from("pagos").delete().eq("id", pago.id);
    return { ok: false, error: err.message };
  }

  revalidatePath("/mi-cuenta");
  return { ok: true };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://azimut-kappa.vercel.app";

// A diferencia de crearPago, devuelve { ok, url } o { ok: false, error }
// en vez de tirar una excepción: Next.js borra el mensaje de cualquier
// error lanzado con `throw` desde un server action en producción, así
// que un valor de retorno normal es la única forma de que el mensaje
// (p. ej. "Mercado Pago no está configurado") llegue tal cual al chat.
export async function crearPagoMercadoPago(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const miembro_id = formData.get("miembro_id")?.toString();
  const importe = Number(formData.get("importe"));
  if (!miembro_id) return { ok: false, error: "Elegí para quién es el pago" };
  if (!importe || importe <= 0) {
    return { ok: false, error: "El importe debe ser mayor a 0" };
  }

  const admin = createAdminClient();
  const { data: config } = await admin
    .from("mercadopago_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const accessToken =
    config?.ambiente === "produccion"
      ? config?.access_token_produccion
      : config?.access_token_prueba;
  if (!accessToken) {
    return {
      ok: false,
      error: "Mercado Pago todavía no está configurado. Avisale al administrador del grupo.",
    };
  }

  // No se crea ninguna fila en `pagos` todavía: el pago solo pasa a
  // existir cuando Mercado Pago confirma que se aprobó (ver el webhook
  // en api/mercadopago/webhook/route.js). Así, si la familia cancela,
  // cierra la app, o el pago es rechazado, no queda ningún registro
  // "Pendiente" fantasma para limpiar. Los datos necesarios para crear
  // el pago en ese momento (a quién, cuánto) viajan en `metadata` de la
  // preferencia, no en la base.
  let partes;
  if (miembro_id === "reparto_igual") {
    const { data: familiares, error: familiaresError } = await supabase
      .from("miembros")
      .select("id")
      .order("apellido");
    if (familiaresError) return { ok: false, error: familiaresError.message };
    if (!familiares || familiares.length === 0) {
      return { ok: false, error: "No se encontraron hermanos" };
    }

    const montos = dividirEnPartesIguales(importe, familiares.length);
    partes = familiares.map((f, i) => ({ miembro_id: f.id, importe: montos[i] }));
  } else {
    partes = [{ miembro_id, importe }];
  }

  const datosPago = JSON.stringify({ creado_por: user.id, partes });

  let respuesta;
  try {
    respuesta = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: "Cuota - Grupo Scout Libertador San Martín",
            quantity: 1,
            unit_price: importe,
            currency_id: "ARS",
          },
        ],
        metadata: { datos_pago: datosPago },
        back_urls: {
          success: `${SITE_URL}/mi-cuenta`,
          pending: `${SITE_URL}/mi-cuenta`,
          failure: `${SITE_URL}/mi-cuenta`,
        },
        auto_return: "approved",
        notification_url: `${SITE_URL}/api/mercadopago/webhook`,
      }),
    });
  } catch (err) {
    console.error("crearPagoMercadoPago:", err);
    respuesta = null;
  }

  if (!respuesta || !respuesta.ok) {
    if (respuesta) console.error("crearPagoMercadoPago:", await respuesta.text());
    return {
      ok: false,
      error: "No se pudo conectar con Mercado Pago. Intentá de nuevo en un momento.",
    };
  }

  const datosPreferencia = await respuesta.json();

  const url =
    config.ambiente === "produccion"
      ? datosPreferencia.init_point
      : datosPreferencia.sandbox_init_point;

  return { ok: true, url };
}
