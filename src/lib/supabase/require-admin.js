import { createClient } from "@/lib/supabase/server";

// Chequeo explícito de rol de administrador para usar al principio de
// todo Server Action admin-exclusivo. Hasta ahora la mayoría de estas
// acciones solo verificaban que hubiera sesión (`requireSession`) y
// dejaban la autorización exclusivamente en manos de la policy RLS
// "for all using (es_administrador())" de cada tabla. Si alguna policy
// tuviera un gap o quedara mal migrada, ese sería el único obstáculo
// entre un miembro regular y una operación admin — este helper agrega
// una segunda barrera, en el propio código, independiente de RLS.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: admin } = await supabase
    .from("administradores")
    .select("auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!admin) throw new Error("No tenés permisos de administrador");

  return { supabase, user };
}
