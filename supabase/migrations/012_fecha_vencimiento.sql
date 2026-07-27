-- Fecha de vencimiento por producto (ej. la fecha del campamento), que
-- se copia a cada cargo generado a partir de ese producto -- igual que
-- ya hacemos con el nombre/importe -- para poder recordarle a las
-- familias y ordenar los cargos por cercanía al vencimiento.
alter table productos add column if not exists fecha_vencimiento date;
alter table cargos add column if not exists fecha_vencimiento date;
