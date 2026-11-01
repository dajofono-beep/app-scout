-- Las tablas nuevas de mensajes (adjuntos y lecturas) no tienen por qué
-- ser visibles sin sesión. Se comprobó que `anon` podía leer
-- mensaje_adjuntos (nombre, ruta y tamaño) de los mensajes dirigidos a
-- "todos": en esta base Supabase todavía otorga permisos automáticos a
-- `anon` en las tablas nuevas, y la política de lectura solo dependía de
-- poder ver el mensaje (que para "todos" no exige sesión). El archivo en
-- sí nunca estuvo expuesto (bucket privado + URL firmada con sesión), pero
-- los metadatos sí.

revoke all on mensaje_adjuntos from anon;
revoke all on mensaje_lecturas from anon;

drop policy if exists "mensaje_adjuntos_lectura_destinatario" on mensaje_adjuntos;
create policy "mensaje_adjuntos_lectura_destinatario" on mensaje_adjuntos
  for select to authenticated using (
    exists (select 1 from mensajes m where m.id = mensaje_id)
  );
