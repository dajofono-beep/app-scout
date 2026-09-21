import { redirect, notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

// Link corto para compartir una encuesta (/e/<codigo> en vez del uuid
// completo). Se resuelve con el cliente admin porque quien lo abre
// puede no haber iniciado sesión todavía — el código en sí no expone
// nada, solo indica a qué encuesta redirigir. La seguridad real (quién
// puede verla y responderla) sigue viviendo en /mi-cuenta/encuestas/[id]
// de siempre, detrás del login.
export default async function LinkCortoEncuestaPage({ params }) {
  const { codigo } = await params;
  const admin = createAdminClient();

  const { data: encuesta } = await admin
    .from("encuestas")
    .select("id")
    .eq("codigo", codigo)
    .maybeSingle();
  if (!encuesta) notFound();

  redirect(`/mi-cuenta/encuestas/${encuesta.id}`);
}
