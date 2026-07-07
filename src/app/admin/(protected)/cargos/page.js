import { createClient } from "@/lib/supabase/server";
import {
  crearCargoIndividual,
  crearCargoPorRama,
  crearCargoPorFamilia,
  crearCargoManual,
} from "./actions";

const hoy = () => new Date().toISOString().slice(0, 10);

export default async function CargosPage() {
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

  const { data: cargos } = await supabase
    .from("cargos")
    .select("*, miembros(nombre, apellido)")
    .order("created_at", { ascending: false })
    .limit(50);

  const formatoMoneda = (n) =>
    Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

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
                  <option key={p.id} value={p.id}>{p.nombre} ({formatoMoneda(p.importe)})</option>
                ))}
              </select>
              <input type="date" name="fecha" required defaultValue={hoy()} className="border rounded px-3 py-2" />
              <button type="submit" className="sm:col-span-4 bg-blue-600 text-white rounded py-2 font-medium">
                Asignar cargo
              </button>
            </form>
          </section>

          <section className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-3">Asignar a toda una rama</h2>
            <form
              action={crearCargoPorRama}
              className="grid grid-cols-1 sm:grid-cols-4 gap-3"
            >
              <select name="rama_id" required defaultValue="" className="border rounded px-3 py-2 sm:col-span-2">
                <option value="" disabled>Rama...</option>
                {(ramas ?? []).map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
              <select name="producto_id" required defaultValue="" className="border rounded px-3 py-2">
                <option value="" disabled>Producto...</option>
                {(productos ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} ({formatoMoneda(p.importe)})</option>
                ))}
              </select>
              <input type="date" name="fecha" required defaultValue={hoy()} className="border rounded px-3 py-2" />
              <button type="submit" className="sm:col-span-4 bg-blue-600 text-white rounded py-2 font-medium">
                Asignar a toda la rama
              </button>
            </form>
          </section>

          {(familias ?? []).length > 0 && (
            <section className="bg-white rounded shadow p-4">
              <h2 className="font-semibold mb-3">Asignar a toda una familia</h2>
              <form
                action={crearCargoPorFamilia}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3"
              >
                <select name="familia_id" required defaultValue="" className="border rounded px-3 py-2 sm:col-span-2">
                  <option value="" disabled>Familia...</option>
                  {familias.map((f) => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </select>
                <select name="producto_id" required defaultValue="" className="border rounded px-3 py-2">
                  <option value="" disabled>Producto...</option>
                  {(productos ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({formatoMoneda(p.importe)}
                      {p.aplica_descuento_hermanos ? ", con desc. hermanos" : ""})
                    </option>
                  ))}
                </select>
                <input type="date" name="fecha" required defaultValue={hoy()} className="border rounded px-3 py-2" />
                <button type="submit" className="sm:col-span-4 bg-blue-600 text-white rounded py-2 font-medium">
                  Asignar a toda la familia
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                Si el producto tiene activado &quot;descuento por hermanos&quot;,
                el importe de cada integrante se calcula según su orden dentro
                de la familia (ver sección Descuentos).
              </p>
            </section>
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
        <h2 className="font-semibold mb-3">Últimos cargos</h2>
        <div className="space-y-1">
          {(cargos ?? []).map((c) => (
            <div key={c.id} className="bg-white rounded shadow p-3 flex flex-wrap justify-between gap-2 text-sm">
              <span className="font-medium">
                {c.miembros?.apellido}, {c.miembros?.nombre}
              </span>
              <span className="text-gray-600">{c.concepto}</span>
              <span className="text-gray-500">{c.fecha}</span>
              {c.porcentaje_aplicado != null && (
                <span className="text-xs text-amber-700">
                  {c.porcentaje_aplicado}% aplicado
                </span>
              )}
              <span className="font-semibold">{formatoMoneda(c.importe)}</span>
            </div>
          ))}
          {(cargos ?? []).length === 0 && (
            <p className="text-gray-500 text-sm">Todavía no hay cargos cargados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
