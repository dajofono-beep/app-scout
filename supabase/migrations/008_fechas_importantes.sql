-- Renombra "efemerides" a "fechas_importantes" y reemplaza el modelo de
-- fecha recurrente (mes/día, sin año) por un rango de fechas concretas
-- (fecha_inicio/fecha_fin), para poder cargar tanto fechas cívicas como
-- eventos del grupo con fecha real (campamentos, salidas, etc), que
-- pueden durar más de un día.

alter table efemerides rename to fechas_importantes;

alter policy "efemerides_lectura_autenticada" on fechas_importantes
  rename to "fechas_importantes_lectura_autenticada";
alter policy "efemerides_admin_insertar" on fechas_importantes
  rename to "fechas_importantes_admin_insertar";
alter policy "efemerides_admin_actualizar" on fechas_importantes
  rename to "fechas_importantes_admin_actualizar";
alter policy "efemerides_admin_eliminar" on fechas_importantes
  rename to "fechas_importantes_admin_eliminar";

alter table fechas_importantes add column if not exists fecha_inicio date;
alter table fechas_importantes add column if not exists fecha_fin date;

-- Migra lo ya cargado (mes/día sin año) a fechas concretas de este año,
-- como punto de partida editable desde la ficha.
update fechas_importantes
set fecha_inicio = make_date(extract(year from current_date)::int, mes, dia),
    fecha_fin = make_date(extract(year from current_date)::int, mes, dia)
where fecha_inicio is null;

alter table fechas_importantes alter column fecha_inicio set not null;
alter table fechas_importantes alter column fecha_fin set not null;
alter table fechas_importantes
  add constraint fechas_importantes_rango_valido check (fecha_fin >= fecha_inicio);

alter table fechas_importantes drop column mes;
alter table fechas_importantes drop column dia;
