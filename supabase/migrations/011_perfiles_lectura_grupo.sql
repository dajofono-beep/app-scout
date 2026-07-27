-- El buscador de miembros en "Social" necesita poder leer el perfil
-- (foto/teléfono/redes) de cualquier miembro del grupo, no solo el
-- propio. Se reemplaza la política de lectura por una abierta a
-- cualquiera (misma lógica que ya usamos para ramas/fechas
-- importantes); la escritura sigue restringida a la propia fila.
drop policy if exists "perfiles_ven_lo_propio" on perfiles;

create policy "perfiles_lectura_grupo" on perfiles
  for select using (true);
