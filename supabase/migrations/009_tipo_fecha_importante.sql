-- Clasifica cada fecha importante como "efeméride" (fecha cívica/
-- tradicional) o "fecha_scout" (evento propio del grupo: campamentos,
-- salidas, etc). Por defecto las existentes quedan como "efemeride".
alter table fechas_importantes add column if not exists tipo text not null default 'efemeride';

alter table fechas_importantes
  add constraint fechas_importantes_tipo_valido check (tipo in ('efemeride', 'fecha_scout'));
