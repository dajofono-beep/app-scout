-- Evita pagos de Mercado Pago duplicados. Antes de esto, el webhook
-- solo chequeaba "¿ya existe este mp_payment_id?" antes de insertar,
-- pero eso es una condición de carrera: si Mercado Pago reenvía el
-- mismo aviso dos veces casi al mismo tiempo (algo que hace seguido),
-- ambos pedidos pueden pasar el chequeo antes de que ninguno haya
-- insertado todavía, y los dos terminan creando su fila.
--
-- La restricción es sobre (mp_payment_id, miembro_id) y no solo
-- mp_payment_id, porque un pago repartido entre varios hermanos
-- (reparto_igual) genera legítimamente varias filas con el mismo
-- mp_payment_id -- una por cada hermano. Lo que nunca debe repetirse
-- es la combinación de un pago puntual de Mercado Pago con un mismo
-- miembro.
alter table pagos
  add constraint pagos_mp_payment_miembro_unico unique (mp_payment_id, miembro_id);
