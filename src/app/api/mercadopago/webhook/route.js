import { createAdminClient } from "@/lib/supabase/admin";

// Mercado Pago avisa acá cuando cambia el estado de un pago. Nunca hay
// que confiar en los datos que manda el aviso en sí (podrían falsificarse):
// siempre se vuelve a pedir el pago real a la API de Mercado Pago con el
// id recibido, y recién ahí se decide si se acredita.
export async function POST(request) {
  const url = new URL(request.url);
  let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");

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
    .select("ambiente, access_token_prueba, access_token_produccion")
    .eq("id", 1)
    .maybeSingle();

  const accessToken =
    config?.ambiente === "produccion"
      ? config?.access_token_produccion
      : config?.access_token_prueba;
  if (!accessToken) return new Response("ok", { status: 200 });

  const respuesta = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!respuesta.ok) return new Response("ok", { status: 200 });

  const pago = await respuesta.json();
  if (pago.status !== "approved") return new Response("ok", { status: 200 });

  const idsPagos = (pago.external_reference ?? "").split(",").filter(Boolean);
  if (idsPagos.length === 0) return new Response("ok", { status: 200 });

  // El filtro por confirmado_at nulo evita reprocesar si Mercado Pago
  // reenvía el mismo aviso más de una vez.
  await admin
    .from("pagos")
    .update({
      confirmado_at: new Date().toISOString(),
      mp_payment_id: String(pago.id),
    })
    .in("id", idsPagos)
    .is("confirmado_at", null);

  return new Response("ok", { status: 200 });
}

// Mercado Pago a veces valida la URL del webhook con un GET simple.
export async function GET() {
  return new Response("ok", { status: 200 });
}
