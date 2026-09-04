import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ImportarMiembrosForm from "./importar-form";
import FiltrosMiembros from "./filtros";
import SelectorPorPagina from "./selector-por-pagina";
import PaginacionFooter from "./paginacion-footer";
import { iniciales, colorParaRama } from "./avatar";

export default async function MiembrosPage({ searchParams }) {
  const params = await searchParams;
  const valores = {
    nombre: params?.nombre ?? "",
    dni: params?.dni ?? "",
    rama_id: params?.rama_id ?? "",
    familia_id: params?.familia_id ?? "",
    activo: params?.activo ?? "",
  };
  const hayFiltros = Object.values(valores).some(Boolean);

  const porPagina = params?.porPagina ?? "25";
  const paginaParam = Number(params?.pagina ?? "1");

  const supabase = await createClient();

  const { data: ramas } = await supabase
    .from("ramas")
    .select("*")
    .order("nombre");
  const { data: familias } = await supabase
    .from("familias")
    .select("*")
    .order("nombre");

  let query = supabase
    .from("miembros")
    .select("*, ramas(nombre), familias(nombre)")
    .order("apellido");

  if (valores.nombre) {
    query = query.or(
      `nombre.ilike.%${valores.nombre}%,apellido.ilike.%${valores.nombre}%`
    );
  }
  if (valores.dni) query = query.ilike("dni", `%${valores.dni}%`);
  if (valores.rama_id) query = query.eq("rama_id", valores.rama_id);
  if (valores.familia_id) query = query.eq("familia_id", valores.familia_id);
  if (valores.activo === "activos") query = query.eq("activo", true);
  if (valores.activo === "inactivos") query = query.eq("activo", false);

  const { data: miembros } = await query;

  const total = (miembros ?? []).length;
  const totalPaginas =
    porPagina === "todos" ? 1 : Math.max(1, Math.ceil(total / Number(porPagina)));
  const paginaActual = Math.min(Math.max(paginaParam, 1), totalPaginas);
  const miembrosPagina =
    porPagina === "todos"
      ? miembros ?? []
      : (miembros ?? []).slice(
          (paginaActual - 1) * Number(porPagina),
          paginaActual * Number(porPagina)
        );

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Miembros</h1>
        <div className="flex items-center gap-3">
          {hayFiltros && (
            <Link
              href="/admin/miembros"
              className="text-sm text-slate-500 font-semibold"
            >
              Limpiar filtros
            </Link>
          )}
          <SelectorPorPagina valores={valores} porPagina={porPagina} />
          <Link
            href="/admin/miembros/nuevo"
            className="bg-sky-600 text-white rounded-full px-4 py-2 text-sm font-bold"
          >
            + Nuevo miembro
          </Link>
        </div>
      </div>

      <details className="bg-white rounded-2xl shadow-sm mb-4">
        <summary className="cursor-pointer select-none p-4 font-semibold text-sm">
          Importar desde Excel
        </summary>
        <div className="px-4 pb-4">
          <ImportarMiembrosForm />
        </div>
      </details>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="p-3 font-bold">Miembro</th>
              <th className="p-3 font-bold">Documento</th>
              <th className="p-3 font-bold">Rama</th>
              <th className="p-3 font-bold">Hermanos</th>
              <th className="p-3 font-bold">Estado</th>
              <th className="p-3"></th>
            </tr>
            <FiltrosMiembros
              ramas={ramas ?? []}
              familias={familias ?? []}
              valores={valores}
              porPagina={porPagina}
            />
          </thead>
          <tbody>
            {miembrosPagina.map((m) => (
              <tr key={m.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-3">
                  <Link
                    href={`/admin/miembros/${m.id}`}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${colorParaRama(m.ramas?.nombre)}`}
                    >
                      {iniciales(m.nombre, m.apellido)}
                    </span>
                    <span className="font-medium text-slate-900">
                      {m.apellido}, {m.nombre}
                    </span>
                  </Link>
                </td>
                <td className="p-3 text-slate-600">{m.dni}</td>
                <td className="p-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                    {m.ramas?.nombre ?? "—"}
                  </span>
                </td>
                <td className="p-3 text-slate-600">
                  {m.familias?.nombre ?? "—"}
                </td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      m.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {m.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/miembros/${m.id}`}
                    className="text-sky-600 hover:underline text-sm"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {total === 0 && (
          <p className="text-slate-500 text-sm p-4">
            No hay miembros para este filtro.
          </p>
        )}
        {total > 0 && (
          <PaginacionFooter
            valores={valores}
            porPagina={porPagina}
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            total={total}
            cantidadEnPagina={miembrosPagina.length}
          />
        )}
      </div>
    </div>
  );
}
