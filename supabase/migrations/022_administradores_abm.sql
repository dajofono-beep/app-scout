-- Hasta ahora cada administrador solo podía ver su propia fila en
-- `administradores` (administradores_ven_su_fila). Para el ABM que
-- permite cargar/editar/quitar administradores desde la app, cualquier
-- administrador necesita poder ver y gestionar a los demás — mismo
-- patrón que ya usan el resto de las tablas admin-only (mercadopago_config,
-- medios_pago, mensajes, etc).
drop policy if exists "administradores_ven_su_fila" on administradores;

create policy "administradores_admin_todo" on administradores
  for all using (es_administrador()) with check (es_administrador());
