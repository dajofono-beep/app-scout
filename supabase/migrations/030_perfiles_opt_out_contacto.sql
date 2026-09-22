-- Desde la migración 011, cualquier miembro logueado puede leer el
-- teléfono y las redes sociales de cualquier otro miembro (necesario
-- para el directorio social). Esto agrega un opt-out por miembro: quien
-- no quiera que su teléfono/redes se vean en el directorio puede
-- desmarcarlo desde su propio perfil. Por defecto queda visible (true),
-- igual que el comportamiento actual, para no ocultar de golpe los
-- datos de nadie sin que lo haya elegido.
alter table perfiles
  add column if not exists mostrar_contacto boolean not null default true;
