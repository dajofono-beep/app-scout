"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_INTENTOS = 3;
const BLOQUEO_MINUTOS = 3;

// Autentica a un administrador y lleva la cuenta de intentos fallidos
// por email: al tercer fallo seguido, ese email queda bloqueado por
// BLOQUEO_MINUTOS antes de poder volver a intentar. Mismo patrón que
// ingresarFamilia en login-actions.js.
export async function ingresarAdmin(emailIngresado, password) {
  const email = emailIngresado?.toString().trim().toLowerCase();
  if (!email || !password) {
    return { ok: false, error: "Completá el email y la contraseña." };
  }

  const admin = createAdminClient();
  const ahora = new Date();

  let intento = null;
  try {
    const { data } = await admin
      .from("intentos_login_admin")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    intento = data;
  } catch {
    intento = null;
  }

  if (intento?.bloqueado_hasta && new Date(intento.bloqueado_hasta) > ahora) {
    const minutosRestantes = Math.max(
      1,
      Math.ceil((new Date(intento.bloqueado_hasta) - ahora) / 60000)
    );
    return {
      ok: false,
      error: `Demasiados intentos fallidos. Probá de nuevo en ${minutosRestantes} minuto${minutosRestantes === 1 ? "" : "s"}.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (!error) {
    if (intento) {
      await admin.from("intentos_login_admin").delete().eq("email", email);
    }
    return { ok: true };
  }

  const intentosFallidos = (intento?.intentos_fallidos ?? 0) + 1;
  const bloqueado = intentosFallidos >= MAX_INTENTOS;

  try {
    await admin.from("intentos_login_admin").upsert({
      email,
      intentos_fallidos: bloqueado ? 0 : intentosFallidos,
      bloqueado_hasta: bloqueado
        ? new Date(ahora.getTime() + BLOQUEO_MINUTOS * 60000).toISOString()
        : null,
      actualizado_at: ahora.toISOString(),
    });
  } catch {
    // Si falla el registro del intento, no bloqueamos el login por eso.
  }

  if (bloqueado) {
    return {
      ok: false,
      error: `Demasiados intentos fallidos. Probá de nuevo en ${BLOQUEO_MINUTOS} minutos.`,
    };
  }

  const restantes = MAX_INTENTOS - intentosFallidos;
  return {
    ok: false,
    error: `Email o contraseña incorrectos. Te qued${restantes === 1 ? "a" : "an"} ${restantes} intento${restantes === 1 ? "" : "s"}.`,
  };
}
