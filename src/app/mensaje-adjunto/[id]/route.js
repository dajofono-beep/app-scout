import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { urlFirmadaAdjunto } from "@/lib/supabase/mensaje-adjuntos";

// Abre un PDF adjunto a un mensaje. La fila se busca con la sesión de
// quien lo pide, así que el RLS de mensaje_adjuntos (que a su vez
// depende del de mensajes) decide si puede verlo: administradores
// siempre; familias solo si el mensaje les corresponde y está vigente.
// Recién después se firma una URL de 60 segundos con el cliente admin, ya
// que el bucket es privado.
export async function GET(_request, { params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Iniciá sesión para ver este archivo", { status: 401 });

  const { data: adjunto } = await supabase
    .from("mensaje_adjuntos")
    .select("ruta")
    .eq("id", id)
    .maybeSingle();
  if (!adjunto) return new Response("No encontrado", { status: 404 });

  const url = await urlFirmadaAdjunto(createAdminClient(), adjunto.ruta);
  if (!url) return new Response("No se pudo abrir el archivo", { status: 500 });

  return Response.redirect(url, 307);
}
