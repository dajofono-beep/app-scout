import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con la clave "service role": bypassea RLS por completo.
// SOLO se debe usar en código de servidor (API routes / server actions)
// y nunca importarse desde un componente cliente.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
