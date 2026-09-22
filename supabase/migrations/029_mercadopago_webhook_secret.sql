-- Clave secreta del webhook (distinta del access token) que Mercado Pago
-- genera en Tus integraciones → Webhooks → Configurar notificaciones.
-- Se usa para validar la firma `x-signature` de cada aviso y así evitar
-- que cualquiera en internet pueda gatillar el webhook con un paymentId
-- inventado.
alter table mercadopago_config
  add column if not exists webhook_secret_prueba text,
  add column if not exists webhook_secret_produccion text;
