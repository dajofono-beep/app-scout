import { createClient } from "@/lib/supabase/server";
import GruposPadresForm from "./grupos-padres-form";

const ORDEN_RAMAS = ["Manada", "Unidad Scout", "Caminantes", "Rovers"];

export default async function GruposPadresPage() {
  const supabase = await createClient();

  const { data: ramas } = await supabase
    .from("ramas")
    .select("*")
    .neq("nombre", "Adultos");

  const { data: links } = await supabase.from("grupos_whatsapp").select("*");
  const linkPorRama = new Map((links ?? []).map((l) => [l.rama_id, l.link]));

  const { data: config } = await supabase
    .from("configuracion")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const ramasConLink = (ramas ?? [])
    .map((r) => ({
      ...r,
      link: linkPorRama.get(r.id) ?? "",
    }))
    .sort((a, b) => ORDEN_RAMAS.indexOf(a.nombre) - ORDEN_RAMAS.indexOf(b.nombre));

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Grupos de Padres</h1>
      <p className="text-sm text-slate-500 mb-6">
        Cargá el link de invitación al grupo de WhatsApp de cada rama. Si
        activás el interruptor de abajo, las familias van a ver el link de su
        propia rama en la sección Mensajes de Mi Cuenta.
      </p>

      <GruposPadresForm
        ramas={ramasConLink}
        visibleInicial={config?.grupos_padres_visible ?? false}
      />
    </div>
  );
}
