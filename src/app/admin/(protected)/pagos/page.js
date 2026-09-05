import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TablaPagos from "./tabla-pagos";
import SelectorPorPagina from "./selector-por-pagina";

export default async function PagosPage({ searchParams }) {
  const params = await searchParams;
  const valores = {
    miembro: params?.miembro ?? "",
    estado: params?.estado ?? "",
  };
  const hayFiltros = Object.values(valores).some(Boolean);

  const porPagina = params?.porPagina ?? "25";
  const paginaParam = Number(params?.pagina ?? "1");

  const supabase = await createClient();

  let miembroIds = null;
  if (valores.miembro) {
    const { data: coincidencias } = await supabase
      .from("miembros")
      .select("id")
      .or(`nombre.ilike.%${valores.miembro}%,apellido.ilike.%${valores.miembro}%`);
    miembroIds = (coincidencias ?? []).map((m) => m.id);
    if (miembroIds.length === 0) miembroIds = ["00000000-0000-0000-0000-000000000000"];
  }

  let query = supabase
    .from("estado_pagos")
    .select("*, miembros(id, nombre, apellido, rama_id)")
    .order("fecha_pago", { ascending: false });

  if (miembroIds) query = query.in("miembro_id", miembroIds);
  if (valores.estado) query = query.eq("estado_efectivo", valores.estado);

  const { data: pagos } = await query;

  const total = (pagos ?? []).length;
  const totalPaginas =
    porPagina === "todos" ? 1 : Math.max(1, Math.ceil(total / Number(porPagina)));
  const paginaActual = Math.min(Math.max(paginaParam, 1), totalPaginas);
  const pagosPagina =
    porPagina === "todos"
      ? pagos ?? []
      : (pagos ?? []).slice(
          (paginaActual - 1) * Number(porPagina),
          paginaActual * Number(porPagina)
        );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Pagos</h1>
        <div className="flex items-center gap-3">
          {hayFiltros && (
            <Link href="/admin/pagos" className="text-sm text-slate-500 font-semibold">
              Limpiar filtros
            </Link>
          )}
          <SelectorPorPagina valores={valores} porPagina={porPagina} />
        </div>
      </div>

      <TablaPagos
        pagos={pagosPagina}
        valores={valores}
        porPagina={porPagina}
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        total={total}
      />
    </div>
  );
}
