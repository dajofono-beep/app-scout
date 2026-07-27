-- Limpieza de datos de prueba: borra TODOS los pagos y TODOS los
-- cargos (de cualquier miembro, cualquier estado). No toca miembros,
-- productos, ramas, familias, fechas importantes ni perfiles.
-- Acción irreversible -- no hay forma de deshacer esto una vez corrido.
delete from pagos;
delete from cargos;
