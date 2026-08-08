-- Configuración de la cuenta de Mercado Pago que recibe los pagos.
-- Guarda credenciales de prueba (sandbox) y de producción por
-- separado, para poder probar sin arriesgar la cuenta real, y un
-- campo de recargo ya preparado para más adelante (todavía sin usar).
-- Tabla admin-only: nadie más que un administrador puede leerla ni
-- escribirla (a diferencia de medios_pago/configuracion/grupos_whatsapp,
-- que sí son legibles por cualquier usuario autenticado).
create table if not exists mercadopago_config (
  id integer primary key default 1,
  titular text,
  ambiente text not null default 'prueba' check (ambiente in ('prueba', 'produccion')),
  access_token_prueba text,
  public_key_prueba text,
  access_token_produccion text,
  public_key_produccion text,
  recargo_porcentaje numeric not null default 0,
  updated_at timestamptz not null default now(),
  check (id = 1)
);
insert into mercadopago_config (id) values (1) on conflict (id) do nothing;

alter table mercadopago_config enable row level security;

create policy "mercadopago_config_admin_todo" on mercadopago_config
  for all using (es_administrador()) with check (es_administrador());
