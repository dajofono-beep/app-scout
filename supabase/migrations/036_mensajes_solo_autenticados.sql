-- La lectura de mensajes no tiene por qué estar abierta a quien no inició
-- sesión. Se comprobó que `anon` (cualquiera con la clave pública) podía
-- leer título y texto de los mensajes dirigidos a "Todos": en esta base
-- Supabase todavía otorga permisos automáticos a `anon` en las tablas
-- nuevas, y la política de lectura para "todos" no exige estar logueado.
-- Mismo tipo de fuga que corrigió la migración 032 en pagos y saldos.
--
-- Nada público usa esta tabla: la leen Mi Cuenta (familias logueadas) y
-- Administración. Los administradores siguen entrando por
-- "mensajes_admin_todo", y las familias por esta política, que se
-- recrea igual pero limitada al rol `authenticated`.

revoke all on mensajes from anon;

drop policy if exists "mensajes_lectura_destinatario" on mensajes;
create policy "mensajes_lectura_destinatario" on mensajes
  for select to authenticated using (
    es_administrador() or (
      activo
      and fecha_inicio <= current_date
      and (fecha_fin is null or fecha_fin >= current_date)
      and (
        destinatario_tipo = 'todos'
        or (destinatario_tipo = 'rama' and destinatario_id = (select rama_id from miembros where id = id_miembro_actual()))
        or (destinatario_tipo = 'familia' and destinatario_id = (select familia_id from miembros where id = id_miembro_actual()))
        or (destinatario_tipo = 'miembro' and destinatario_id = id_miembro_actual())
      )
    )
  );
