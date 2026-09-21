import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import TituloSeccion from "../../titulo-seccion";
import EncuestaRespuestaForm from "./encuesta-respuesta-form";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatoFecha(iso) {
  const [, mes, dia] = iso.split("-").map(Number);
  return `${dia} de ${MESES[mes - 1]}`;
}

export default async function EncuestaDetallePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/?next=/mi-cuenta/encuestas/${id}`);

  // El miembro y la encuesta son independientes entre sí — se piden en
  // paralelo (misma razón que en encuestas/page.js: menos idas y
  // vueltas seguidas al servidor).
  const [{ data: miembro }, { data: encuesta }] = await Promise.all([
    supabase.from("miembros").select("*, ramas(nombre)").eq("auth_user_id", user.id).maybeSingle(),
    supabase.from("encuestas").select("*").eq("id", id).maybeSingle(),
  ]);
  if (!miembro) redirect(`/?next=/mi-cuenta/encuestas/${id}`);
  if (!encuesta) notFound();

  // Si la encuesta es "por familia" pero este miembro no tiene familia
  // asignada, su respuesta se guardó como si fuera "por chico" (ver
  // encuestas/actions.js) — hay que buscarla del mismo modo acá.
  const porFamilia = encuesta.alcance_respuesta === "familia" && Boolean(miembro.familia_id);

  // De nuevo, independientes entre sí: se piden juntas en vez de una
  // atrás de la otra.
  const [{ data: respuestaPropia }, nombreFamiliaPropia] = await Promise.all([
    supabase
      .from("encuesta_respuestas")
      .select("*")
      .eq("encuesta_id", id)
      .eq(porFamilia ? "familia_id" : "miembro_id", porFamilia ? miembro.familia_id : miembro.id)
      .maybeSingle(),
    // "familias" es de solo lectura para el admin (RLS), como ya se
    // resuelve en mi-cuenta/page.js para el nombre de "mis hermanos".
    encuesta.destinatario_tipo === "familia" && miembro.familia_id
      ? createAdminClient()
          .from("familias")
          .select("nombre")
          .eq("id", miembro.familia_id)
          .maybeSingle()
          .then(({ data }) => data?.nombre ?? null)
      : Promise.resolve(null),
  ]);

  let destinatarioTexto = "Todos";
  if (encuesta.destinatario_tipo === "rama") {
    destinatarioTexto = `Rama: ${miembro.ramas?.nombre ?? ""}`;
  } else if (encuesta.destinatario_tipo === "familia") {
    destinatarioTexto = `Hermanos: ${nombreFamiliaPropia ?? ""}`;
  } else if (encuesta.destinatario_tipo === "miembro") {
    destinatarioTexto = `${miembro.apellido}, ${miembro.nombre}`;
  }

  return (
    <div className="max-w-lg mx-auto space-y-4 px-4 py-8">
      <TituloSeccion
        icono="/Encuestas.png"
        nombre="Encuestas"
        hrefVolver="/mi-cuenta?tab=encuestas"
      />

      <section className="bg-white rounded-2xl shadow-sm p-5">
        <div className="border border-slate-100 rounded-xl p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-slate-800">{encuesta.titulo}</p>
            <p className="text-xs text-slate-400 shrink-0">
              {formatoFecha(encuesta.created_at.slice(0, 10))}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Encuesta para {destinatarioTexto}</p>
          {encuesta.descripcion && (
            <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">
              {encuesta.descripcion}
            </p>
          )}
        </div>

        <div className="mt-4">
          <EncuestaRespuestaForm
            encuestaId={encuesta.id}
            tipoRespuesta={encuesta.tipo_respuesta}
            opciones={encuesta.opciones ?? []}
            respuestaActual={respuestaPropia?.respuesta ?? ""}
            cerrada={Boolean(encuesta.fecha_cierre && encuesta.fecha_cierre < new Date().toISOString().slice(0, 10))}
          />
        </div>
      </section>
    </div>
  );
}
