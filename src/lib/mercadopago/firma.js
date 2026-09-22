import crypto from "node:crypto";

// Valida el header `x-signature` que Mercado Pago manda en cada webhook,
// siguiendo su esquema HMAC-SHA256: https://www.mercadopago.com.ar/developers/es/docs/split-payments/additional-content/your-integrations/notifications/webhooks
// El manifest se arma con el mismo formato que usa MP para firmar, y la
// comparación es a tiempo constante para no filtrar la firma esperada
// por temporización.
export function verificarFirmaMercadoPago({ xSignature, xRequestId, dataId, secret }) {
  if (!xSignature || !secret) return false;

  const partes = Object.fromEntries(
    xSignature.split(",").map((par) => {
      const [clave, valor] = par.split("=");
      return [clave?.trim(), valor?.trim()];
    })
  );
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${(dataId ?? "").toLowerCase()};request-id:${xRequestId ?? ""};ts:${ts};`;
  const firmaEsperada = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  const bufEsperada = Buffer.from(firmaEsperada, "utf8");
  const bufRecibida = Buffer.from(v1, "utf8");
  if (bufEsperada.length !== bufRecibida.length) return false;
  return crypto.timingSafeEqual(bufEsperada, bufRecibida);
}
