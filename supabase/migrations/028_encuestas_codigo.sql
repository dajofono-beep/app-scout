-- Código corto para compartir una encuesta con un link más manejable
-- (/e/<codigo> en vez del uuid completo). No reemplaza ninguna
-- verificación de seguridad: solo traduce el código a la encuesta real,
-- que sigue protegida por el login y el RLS de siempre.

alter table encuestas add column if not exists codigo text unique;

-- Completa un código a las encuestas que ya existían antes de este
-- cambio (las nuevas lo generan desde la aplicación).
update encuestas set codigo = substr(md5(random()::text || id::text), 1, 6)
where codigo is null;
