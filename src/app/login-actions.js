"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_INTENTOS = 5;
const BLOQUEO_MINUTOS = 5;

// Autentica a una familia y lleva la cuenta de intentos fallidos por
// miembro: al quinto fallo seguido, ese miembro queda bloqueado por
// BLOQUEO_MINUTOS antes de poder volver a intentar.
export async function ingresarFamilia(miembroId, dni) {
  if (!miembroId || !dni) {
    return { ok: false, error: "Elegí tu rama, tu nombre y escribí tu contraseña." };
  }

  const admin = createAdminClient();
  const ahora = new Date();

  let intento = null;
  try {
    const { data } = await admin
      .from("intentos_login")
      .select("*")
      .eq("miembro_id", miembroId)
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
  const email = `m${miembroId}@grupo.local`;
  const { error } = await supabase.auth.signInWithPassword({ email, password: dni });

  if (!error) {
    if (intento) {
      await admin.from("intentos_login").delete().eq("miembro_id", miembroId);
    }
    return { ok: true };
  }

  const intentosFallidos = (intento?.intentos_fallidos ?? 0) + 1;
  const bloqueado = intentosFallidos >= MAX_INTENTOS;

  try {
    await admin.from("intentos_login").upsert({
      miembro_id: miembroId,
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
    error: `Contraseña incorrecta. Te qued${restantes === 1 ? "a" : "an"} ${restantes} intento${restantes === 1 ? "" : "s"}.`,
  };
}
