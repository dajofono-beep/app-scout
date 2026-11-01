-- Misma fuga que cerraron las migraciones 032 y 036, ahora en tres tablas
-- que `anon` (cualquiera con la clave pública, que viaja en el navegador)
-- todavía podía leer sin iniciar sesión:
--   * perfiles: teléfono, redes sociales y foto de los miembros. Es lo más
--     delicado (datos de contacto de chicos y adultos). La política de
--     lectura es "using (true)" (migración 011) para el directorio de
--     Social, pero eso nunca debió incluir a quien no tiene sesión.
--   * encuestas: título y descripción de las dirigidas a "Todos".
--   * fechas_importantes: el calendario de fechas.
--
-- Nada público las usa: la pantalla de ingreso solo lee `ramas` y
-- `miembros_publico`. Las leen Mi Cuenta y Administración (siempre con
-- sesión), y el link corto /e/<código> resuelve la encuesta con el
-- cliente admin (service role), que no pasa por esto.
--
-- Cada política se recrea con el mismo contenido que tenía, limitada al
-- rol `authenticated`.

revoke all on perfiles from anon;
revoke all on encuestas from anon;
revoke all on fechas_importantes from anon;

drop policy if exists "perfiles_lectura_grupo" on perfiles;
create policy "perfiles_lectura_grupo" on perfiles
  for select to authenticated using (true);

drop policy if exists "encuestas_lectura_destinatario" on encuestas;
create policy "encuestas_lectura_destinatario" on encuestas
  for select to authenticated using (
    es_administrador() or (
      activo
      and fecha_inicio <= current_date
      and (fecha_cierre is null or fecha_cierre >= current_date)
      and (
        destinatario_tipo = 'todos'
        or (destinatario_tipo = 'rama' and destinatario_id = (select rama_id from miembros where id = id_miembro_actual()))
        or (destinatario_tipo = 'familia' and destinatario_id = (select familia_id from miembros where id = id_miembro_actual()))
        or (destinatario_tipo = 'miembro' and destinatario_id = id_miembro_actual())
      )
    )
  );

drop policy if exists "fechas_importantes_lectura_autenticada" on fechas_importantes;
create policy "fechas_importantes_lectura_autenticada" on fechas_importantes
  for select to authenticated using (true);
