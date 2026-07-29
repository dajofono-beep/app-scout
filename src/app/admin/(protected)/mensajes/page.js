import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const ETIQUETA_TIPO = {
  todos: "Todos",
  rama: "Rama",
  familia: "Familia",
  miembro: "Participante",
};

function formatoVigencia(inicio, fin) {
  return fin ? `${inicio} al ${fin}` : `Desde ${inicio}`;
}

export default async function MensajesPage() {
  const supabase = await createClient();

  const { data: mensajes } = await supabase
    .from("mensajes")
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

  function etiquetaDestinatario(m) {
    if (m.destinatario_tipo === "todos") return "Todos";
    const nombre =
      m.destinatario_tipo === "rama"
        ? nombrePorRama[m.destinatario_id]
        : m.destinatario_tipo === "familia"
          ? nombrePorFamilia[m.destinatario_id]
          : nombrePorMiembro[m.destinatario_id];
    return `${ETIQUETA_TIPO[m.destinatario_tipo]}: ${nombre ?? "—"}`;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Mensajes</h1>
        <Link
          href="/admin/mensajes/nueva"
          className="bg-sky-600 text-white rounded-full px-4 py-2 text-sm font-bold"
        >
          + Nuevo mensaje
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="p-3 font-bold">Título</th>
              <th className="p-3 font-bold">Destinatario</th>
              <th className="p-3 font-bold">Vigencia</th>
              <th className="p-3 font-bold">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(mensajes ?? []).map((m) => (
              <tr key={m.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-3">
                  <Link
                    href={`/admin/mensajes/${m.id}`}
                    className="font-semibold text-slate-800 hover:underline"
                  >
                    {m.titulo}
                  </Link>
                </td>
                <td className="p-3 text-slate-600">{etiquetaDestinatario(m)}</td>
                <td className="p-3 text-slate-600">
                  {formatoVigencia(m.fecha_inicio, m.fecha_fin)}
                </td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      m.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {m.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/mensajes/${m.id}`}
                    className="text-sky-600 hover:underline text-sm"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(mensajes ?? []).length === 0 && (
          <p className="text-slate-500 text-sm p-4">Todavía no hay mensajes.</p>
        )}
      </div>
    </div>
  );
}
