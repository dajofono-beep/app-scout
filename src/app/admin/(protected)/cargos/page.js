import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { crearCargoIndividual, crearCargoManual } from "./actions";
import FiltrosCargos from "./filtros";
import AsignarCargoRamaForm from "./asignar-rama-form";
import AsignarCargoFamiliaForm from "./asignar-familia-form";
import { formatoMoneda, etiquetaProducto } from "./utils";
import { iniciales, colorPara } from "../miembros/avatar";

const hoy = () => new Date().toISOString().slice(0, 10);

export default async function CargosPage({ searchParams }) {
  const params = await searchParams;
  const valoresFiltro = {
    miembro: params?.miembro ?? "",
    estado: params?.estado ?? "",
  };
  const hayFiltros = Object.values(valoresFiltro).some(Boolean);

  const supabase = await createClient();

  const { data: ramas } = await supabase.from("ramas").select("*").order("nombre");
  const { data: familias } = await supabase
    .from("familias")
    .select("*")
    .order("nombre");
  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");
  const { data: miembros } = await supabase
    .from("miembros")
    .select("id, nombre, apellido")
    .eq("activo", true)
    .order("apellido");

  let miembroIds = null;
  if (valoresFiltro.miembro) {
    const { data: coincidencias } = await supabase
      .from("miembros")
      .select("id")
      .or(
        `nombre.ilike.%${valoresFiltro.miembro}%,apellido.ilike.%${valoresFiltro.miembro}%`
      );
    miembroIds = (coincidencias ?? []).map((m) => m.id);
    if (miembroIds.length === 0) miembroIds = ["00000000-0000-0000-0000-000000000000"];
  }

  let cargosQuery = supabase
    .from("cargos")
    .select("*, miembros(id, nombre, apellido, rama_id)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (miembroIds) cargosQuery = cargosQuery.in("miembro_id", miembroIds);
  if (valoresFiltro.estado) cargosQuery = cargosQuery.eq("estado", valoresFiltro.estado);

  const { data: cargos } = await cargosQuery;

  const sinDatos = (ramas ?? []).length === 0 || (productos ?? []).length === 0;

  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold">Cargos</h1>

      {sinDatos && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
          Necesitás al menos una rama y un producto activo para poder cargar cobros.
        </p>
      )}

      {!sinDatos && (
        <p className="text-sm text-gray-500 -mt-4">
          Si elegís un producto marcado &quot;en N cuotas&quot;, se generan N
          cargos automáticamente (uno por mes, empezando en la fecha que
          indiques) en vez de un solo cargo.
        </p>
      )}

      {!sinDatos && (
        <>
          <section className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-3">Asignar a un miembro</h2>
            <form
              action={crearCargoIndividual}
              className="grid grid-cols-1 sm:grid-cols-4 gap-3"
            >
              <select name="miembro_id" required defaultValue="" className="border rounded px-3 py-2 sm:col-span-2">
                <option value="" disabled>Miembro...</option>
                {(miembros ?? []).map((m) => (
                  <option key={m.id} value={m.id}>{m.apellido}, {m.nombre}</option>
                ))}
              </select>
              <select name="producto_id" required defaultValue="" className="border rounded px-3 py-2">
                <option value="" disabled>Producto...</option>
                {(productos ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{etiquetaProducto(p)}</option>
                ))}
              </select>
              <input type="date" name="fecha" required defaultValue={hoy()} className="border rounded px-3 py-2" />
              <button type="submit" className="sm:col-span-4 bg-blue-600 text-white rounded py-2 font-medium">
                Asignar cargo
              </button>
            </form>
          </section>

          <AsignarCargoRamaForm ramas={ramas ?? []} productos={productos ?? []} />

          {(familias ?? []).length > 0 && (
            <AsignarCargoFamiliaForm
              familias={familias ?? []}
              productos={productos ?? []}
            />
          )}
        </>
      )}

      <section className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-3">Cargo manual (concepto libre)</h2>
        <form
          action={crearCargoManual}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3"
        >
          <select name="miembro_id" required defaultValue="" className="border rounded px-3 py-2 sm:col-span-2">
            <option value="" disabled>Miembro...</option>
            {(miembros ?? []).map((m) => (
              <option key={m.id} value={m.id}>{m.apellido}, {m.nombre}</option>
            ))}
          </select>
          <input name="concepto" required placeholder="Concepto" className="border rounded px-3 py-2" />
          <input name="importe" type="number" step="0.01" min="0" required placeholder="Importe" className="border rounded px-3 py-2" />
          <input type="date" name="fecha" required defaultValue={hoy()} className="border rounded px-3 py-2 sm:col-span-2" />
          <button type="submit" className="sm:col-span-2 bg-blue-600 text-white rounded py-2 font-medium">
            Cargar
          </button>
        </form>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Cargos</h2>
          {hayFiltros && (
            <Link
              href="/admin/cargos"
              className="text-sm text-gray-600 underline"
            >
              Limpiar filtros
            </Link>
          )}
        </div>

        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="p-3 font-medium">Miembro</th>
                <th className="p-3 font-medium">Concepto</th>
                <th className="p-3 font-medium">Importe</th>
                <th className="p-3 font-medium">Fecha</th>
                <th className="p-3 font-medium">Estado</th>
                <th className="p-3"></th>
              </tr>
              <FiltrosCargos valores={valoresFiltro} />
            </thead>
            <tbody>
              {(cargos ?? []).map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3">
                    <Link
                      href={`/admin/cargos/${c.id}`}
                      className="flex items-center gap-3"
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${colorPara(c.miembros?.rama_id)}`}
                      >
                        {iniciales(c.miembros?.nombre, c.miembros?.apellido)}
                      </span>
                      <span className="font-medium text-gray-900">
                        {c.miembros?.apellido}, {c.miembros?.nombre}
                      </span>
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600">
                    {c.concepto}
                    {c.porcentaje_aplicado != null && (
                      <span className="block text-xs text-amber-700">
                        {c.porcentaje_aplicado}% aplicado
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-semibold">{formatoMoneda(c.importe)}</td>
                  <td className="p-3 text-gray-600">{c.fecha}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        c.estado === "cancelado"
                          ? "bg-gray-200 text-gray-600"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {c.estado === "cancelado" ? "Cancelado" : "Activo"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/cargos/${c.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(cargos ?? []).length === 0 && (
            <p className="text-gray-500 text-sm p-4">
              No hay cargos para este filtro.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
