-- Desde el 30/10/2026 Supabase deja de dar permisos automáticos de la
-- Data API (anon / authenticated / service_role) a las tablas y vistas
-- nuevas del esquema public. Las que ya existen en producción conservan
-- los suyos, pero si la base se recrea desde las migraciones (proyecto
-- nuevo, rama de preview o "supabase db reset") quedarían inaccesibles.
-- Esta migración deja los permisos explícitos. Solo agrega (no quita
-- nada), así que en producción no cambia el comportamiento actual.
--
-- El GRANT solo habilita llegar a la tabla: qué filas ve cada usuario lo
-- sigue decidiendo el RLS de cada tabla.
--
-- Tablas o vistas nuevas: agregar sus grants en la misma migración que
-- las crea, siguiendo este mismo criterio.

-- ---------------------------------------------------------
-- Tablas: acceso completo para usuarios logueados y el servidor
-- ---------------------------------------------------------
grant select, insert, update, delete on
  ramas,
  administradores,
  miembros,
  productos,
  cargos,
  pagos,
  familias,
  escala_descuentos_familia,
  fechas_importantes,
  perfiles,
  mensajes,
  intentos_login,
  grupos_whatsapp,
  configuracion,
  medios_pago,
  mercadopago_config,
  notificaciones_pagos_config,
  intentos_login_admin,
  encuestas,
  encuesta_respuestas
to authenticated, service_role;

-- ---------------------------------------------------------
-- Vistas: solo lectura
-- ---------------------------------------------------------
grant select on estado_pagos, saldos_miembros, miembros_social
to authenticated, service_role;

-- ---------------------------------------------------------
-- Acceso sin login (anon): solo lo que usa la pantalla de ingreso
-- (selector rama -> nombre). Ninguna otra tabla se lee sin sesión.
-- ---------------------------------------------------------
grant select on ramas, miembros_publico to anon;
grant select on miembros_publico to authenticated, service_role;
