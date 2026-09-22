import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { notificarPagoAAdmins } from "@/lib/email/notificar-pago";
import { verificarFirmaMercadoPago } from "@/lib/mercadopago/firma";

// Mercado Pago avisa acá cuando cambia el estado de un pago. Nunca hay
// que confiar en los datos que manda el aviso en sí (podrían falsificarse):
// siempre se vuelve a pedir el pago real a la API de Mercado Pago con el
// id recibido, y recién ahí se decide si se acredita.
//
// El registro en `pagos` no existe hasta este momento: se crea acá
// mismo, ya acreditado, solo cuando Mercado Pago confirma la
// aprobación. Así, si la familia cancela o el pago es rechazado, nunca
// queda un registro "Pendiente" fantasma — simplemente no se crea
// nada. Los datos de a quién y cuánto viajan en `metadata` de la
// preferencia (ver crearPagoMercadoPago en mi-cuenta/actions.js).
export async function POST(request) {
  const url = new URL(request.url);
  const dataIdDeUrl = url.searchParams.get("data.id") || url.searchParams.get("id");
  let paymentId = dataIdDeUrl;

  if (!paymentId) {
    try {
      const body = await request.json();
      paymentId = body?.data?.id || body?.id;
    } catch {
      // sin cuerpo JSON válido, no hay nada más para leer
    }
  }

  if (!paymentId) return new Response("ok", { status: 200 });

  const admin = createAdminClient();
  const { data: config } = await admin
    .from("mercadopago_config")
    .select(
      "ambiente, access_token_prueba, access_token_produccion, webhook_secret_prueba, webhook_secret_produccion"
    )
    .eq("id", 1)
    .maybeSingle();

  const accessToken =
    config?.ambiente === "produccion"
      ? config?.access_token_produccion
      : config?.access_token_prueba;
  if (!accessToken) return new Response("ok", { status: 200 });

  // Antes de gastar una llamada a la API de Mercado Pago (y de tocar la
  // base), se valida que el aviso realmente venga de Mercado Pago. Sin
  // esto, cualquiera en internet puede pegarle a este endpoint con un
  // paymentId inventado y hacer que la app consuma su cuota de MP.
  const webhookSecret =
    config?.ambiente === "produccion"
      ? config?.webhook_secret_produccion
      : config?.webhook_secret_prueba;

  if (webhookSecret) {
    const firmaOk = verificarFirmaMercadoPago({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId: dataIdDeUrl,
      secret: webhookSecret,
    });
    if (!firmaOk) {
      console.warn("webhook mercadopago: firma inválida, aviso rechazado");
      return new Response("firma inválida", { status: 401 });
    }
  } else {
    // Todavía no se cargó la clave secreta del webhook en
    // /admin/medios-pago/mercado-pago — se procesa igual para no cortar
    // pagos en producción, pero queda sin esta protección hasta que se
    // configure.
    console.warn(
      "webhook mercadopago: falta configurar la clave secreta del webhook, aviso procesado sin verificar firma"
    );
  }

  const respuesta = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!respuesta.ok) return new Response("ok", { status: 200 });

  const pago = await respuesta.json();
  if (pago.status !== "approved") return new Response("ok", { status: 200 });

  let datosPago;
  try {
    datosPago = JSON.parse(pago.metadata?.datos_pago ?? "");
  } catch {
    datosPago = null;
  }
  if (!datosPago?.partes?.length) return new Response("ok", { status: 200 });

  // Idempotencia: si Mercado Pago reenvía el mismo aviso más de una
  // vez, no duplicar el pago ya creado.
  const { data: yaCreado } = await admin
    .from("pagos")
    .select("id")
    .eq("mp_payment_id", String(pago.id))
    .limit(1);
  if (yaCreado && yaCreado.length > 0) return new Response("ok", { status: 200 });

  const fecha_pago = (pago.date_approved ?? pago.date_created ?? new Date().toISOString()).slice(
    0,
    10
  );

  const { error } = await admin.from("pagos").insert(
    datosPago.partes.map((p) => ({
      miembro_id: p.miembro_id,
      importe: p.importe,
      fecha_pago,
      medio_pago: "Mercado Pago",
      origen: "mercadopago",
      estado: "activo",
      confirmado_at: new Date().toISOString(),
      mp_payment_id: String(pago.id),
      creado_por: datosPago.creado_por,
    }))
  );
  if (error) {
    // 23505 = violación de la restricción única (mp_payment_id,
    // miembro_id) — significa que otro aviso duplicado de Mercado
    // Pago para este mismo pago ya lo insertó primero. No es un
    // error real, es la protección contra la condición de carrera
    // haciendo su trabajo.
    if (error.code !== "23505") {
      console.error("webhook mercadopago:", error.message);
    }
    return new Response("ok", { status: 200 });
  }

  await notificarPagoAAdmins({
    partes: datosPago.partes,
    medioPago: "Mercado Pago",
    origen: "mercadopago",
  });

  revalidatePath("/mi-cuenta");
  revalidatePath("/admin");
  revalidatePath("/admin/pagos");

  return new Response("ok", { status: 200 });
}

// Mercado Pago a veces valida la URL del webhook con un GET simple.
export async function GET() {
  return new Response("ok", { status: 200 });
}
