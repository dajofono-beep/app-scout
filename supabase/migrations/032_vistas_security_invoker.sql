-- Las vistas estado_pagos y saldos_miembros se ejecutaban con los
-- permisos de su dueño (postgres), salteando el RLS de pagos, cargos y
-- miembros. Resultado: cualquiera con la clave pública (anon), incluso
-- sin iniciar sesión, podía leer los pagos y saldos de todo el grupo
-- llamando a la API de Supabase directamente, y cualquier familia
-- logueada podía ver los de las demás. Comprobado el 2026-09-23.
--
-- Con security_invoker la vista se evalúa con los permisos de quien
-- consulta, así que aplica el RLS de las tablas de abajo: los
-- administradores siguen viendo todo (políticas *_admin_todo) y cada
-- familia solo lo suyo (políticas *_ven_su_familia).
--
-- Si más adelante se recrea alguna de estas vistas con
-- "create or replace view", incluir "with (security_invoker = true)".

alter view estado_pagos set (security_invoker = true);
alter view saldos_miembros set (security_invoker = true);

revoke all on estado_pagos, saldos_miembros from anon;
