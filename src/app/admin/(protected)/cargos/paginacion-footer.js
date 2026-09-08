"use client";

import { useRouter } from "next/navigation";

export default function PaginacionFooter({
  valores,
  porPagina,
  paginaActual,
  totalPaginas,
  total,
  cantidadEnPagina,
}) {
  const router = useRouter();

  function ir(pagina) {
    const params = new URLSearchParams();
    for (const [clave, valor] of Object.entries(valores)) {
      if (valor) params.set(clave, valor);
    }
    if (porPagina !== "25") params.set("porPagina", porPagina);
    if (pagina !== 1) params.set("pagina", String(pagina));
    const query = params.toString();
    router.push(query ? `/admin/cargos?${query}` : "/admin/cargos");
  }

  return (
    <div className="flex items-center justify-between gap-3 p-4 border-t text-sm text-slate-500 flex-wrap">
      <p>
        Mostrando {cantidadEnPagina} de {total} {total === 1 ? "cargo" : "cargos"}
      </p>
      {totalPaginas > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={paginaActual <= 1}
            onClick={() => ir(paginaActual - 1)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="font-semibold text-slate-600">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            type="button"
            disabled={paginaActual >= totalPaginas}
            onClick={() => ir(paginaActual + 1)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
