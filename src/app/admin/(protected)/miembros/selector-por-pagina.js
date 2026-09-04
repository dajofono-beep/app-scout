"use client";

import { useRouter } from "next/navigation";

export default function SelectorPorPagina({ valores, porPagina }) {
  const router = useRouter();

  function cambiar(nuevoPorPagina) {
    const params = new URLSearchParams();
    for (const [clave, valor] of Object.entries(valores)) {
      if (valor) params.set(clave, valor);
    }
    if (nuevoPorPagina !== "25") params.set("porPagina", nuevoPorPagina);
    const query = params.toString();
    router.push(query ? `/admin/miembros?${query}` : "/admin/miembros");
  }

  return (
    <select
      value={porPagina}
      onChange={(e) => cambiar(e.target.value)}
      className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600"
    >
      <option value="25">25 por página</option>
      <option value="50">50 por página</option>
      <option value="todos">Todos</option>
    </select>
  );
}
