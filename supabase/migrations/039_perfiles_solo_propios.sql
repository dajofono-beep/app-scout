-- Segunda parte (ver 038): la tabla `perfiles` pasa a ser legible solo por
-- su dueño y por los administradores. Antes la leía cualquier usuario con
-- sesión (política "perfiles_lectura_grupo", migración 011), lo que
-- permitía ver el teléfono de quien había elegido ocultarlo. El
-- directorio de Social ya no depende de esta tabla: lee `perfiles_directorio`.
--
-- Ejecutar recién cuando el código que lee la vista esté publicado.

drop policy if exists "perfiles_lectura_grupo" on perfiles;
drop policy if exists "perfiles_ven_lo_propio" on perfiles;
create policy "perfiles_ven_lo_propio" on perfiles
  for select to authenticated using (miembro_id = id_miembro_actual() or es_administrador());
