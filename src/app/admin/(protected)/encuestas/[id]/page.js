import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarEncuesta } from "../actions";
import EncuestaForm from "../encuesta-form";
import LinkCompartir from "../link-compartir";
import GraficoTorta from "../grafico-torta";
import ParticipantesToggle from "../participantes-toggle";
import ResultadosCard from "../resultados-card";
import ExportarPdfForm from "../exportar-pdf-form";
import { armarResultados } from "../resultados";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://app.azimut-scout.ar";

export default async function FichaEncuestaPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: encuesta } = await supabase
    .from("encuestas")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!encuesta) notFound();

  const { data: ramas } = await supabase.from("ramas").select("id, nombre").order("nombre");
  const { data: familias } = await supabase
    .from("familias")
    .select("id, nombre")
    .order("nombre");
  const { data: miembros } = await supabase
    .from("miembros")
    .select("id, nombre, apellido, rama_id, familia_id, activo")
    .order("apellido");

  const { data: respuestas } = await supabase
    .from("encuesta_respuestas")
    .select("*")
    .eq("encuesta_id", id);

  const { grupos, respondieron, faltan, conteoOpciones, conteoPorRama, participantes } =
    armarResultados({ encuesta, miembros, familias, ramas, respuestas });

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <Link href="/admin/encuestas" className="text-sm text-sky-600 font-semibold">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold mt-2">{encuesta.titulo}</h1>
      </div>

      <EncuestaForm
        encuesta={encuesta}
        ramas={ramas ?? []}
        familias={familias ?? []}
        miembros={(miembros ?? []).filter((m) => m.activo)}
        accion={actualizarEncuesta}
        textoBoton="Guardar cambios"
      />

      <LinkCompartir
        url={
          encuesta.codigo
            ? `${SITE_URL}/e/${encuesta.codigo}`
            : `${SITE_URL}/mi-cuenta/encuestas/${encuesta.id}`
        }
      />

      <ResultadosCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {conteoOpciones && <GraficoTorta titulo="Respuestas" datos={conteoOpciones} />}
          <GraficoTorta titulo="Participación por rama" datos={conteoPorRama} />
        </div>

        <p className="text-sm text-slate-600">
          Respondieron <span className="font-bold">{respondieron.length}</span> de{" "}
          {grupos.size}
        </p>

        <ParticipantesToggle participantes={participantes} />

        {faltan.length > 0 && (
          <ParticipantesToggle
            participantes={faltan}
            etiqueta="Ver participantes faltantes"
            etiquetaOculta="Ocultar faltantes"
          />
        )}

        <ExportarPdfForm encuestaId={encuesta.id} />
      </ResultadosCard>
    </div>
  );
}
