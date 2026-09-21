import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const ETIQUETA_TIPO = {
  todos: "Todos",
  rama: "Rama",
  familia: "Hermanos",
  miembro: "Participante",
};

function formatoVigencia(inicio, cierre) {
  return cierre ? `${inicio} al ${cierre}` : `Desde ${inicio}`;
}

export default async function EncuestasPage() {
  const supabase = await createClient();

  const { data: encuestas } = await supabase
    .from("encuestas")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: ramas } = await supabase.from("ramas").select("id, nombre");
  const { data: familias } = await supabase.from("familias").select("id, nombre");
  const { data: miembros } = await supabase
    .from("miembros")
    .select("id, nombre, apellido");

  const nombrePorRama = Object.fromEntries((ramas ?? []).map((r) => [r.id, r.nombre]));
  const nombrePorFamilia = Object.fromEntries(
    (familias ?? []).map((f) => [f.id, f.nombre])
  );
  const nombrePorMiembro = Object.fromEntries(
    (miembros ?? []).map((m) => [m.id, `${m.apellido}, ${m.nombre}`])
  );

  function etiquetaDestinatario(e) {
    if (e.destinatario_tipo === "todos") return "Todos";
    const nombre =
      e.destinatario_tipo === "rama"
        ? nombrePorRama[e.destinatario_id]
        : e.destinatario_tipo === "familia"
          ? nombrePorFamilia[e.destinatario_id]
          : nombrePorMiembro[e.destinatario_id];
    return `${ETIQUETA_TIPO[e.destinatario_tipo]}: ${nombre ?? "—"}`;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Encuestas</h1>
        <Link
          href="/admin/encuestas/nueva"
          className="bg-sky-600 text-white rounded-full px-4 py-2 text-sm font-bold"
        >
          + Nueva encuesta
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="p-3 font-bold">Título</th>
              <th className="p-3 font-bold">Destinatario</th>
              <th className="p-3 font-bold">Responde</th>
              <th className="p-3 font-bold">Vigencia</th>
              <th className="p-3 font-bold">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(encuestas ?? []).map((e) => (
              <tr key={e.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-3">
                  <Link
                    href={`/admin/encuestas/${e.id}`}
                    className="font-semibold text-slate-800 hover:underline"
                  >
                    {e.titulo}
                  </Link>
                </td>
                <td className="p-3 text-slate-600">{etiquetaDestinatario(e)}</td>
                <td className="p-3 text-slate-600">
                  {e.alcance_respuesta === "familia" ? "Por familia" : "Por chico"}
                </td>
                <td className="p-3 text-slate-600 whitespace-nowrap">
                  {formatoVigencia(e.fecha_inicio, e.fecha_cierre)}
                </td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      e.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {e.activo ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/encuestas/${e.id}`}
                    className="text-sky-600 hover:underline text-sm"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(encuestas ?? []).length === 0 && (
          <p className="text-slate-500 text-sm p-4">Todavía no hay encuestas.</p>
        )}
      </div>
    </div>
  );
}
