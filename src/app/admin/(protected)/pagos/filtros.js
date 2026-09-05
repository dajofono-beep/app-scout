"use client";

import { useRouter } from "next/navigation";

export default function FiltrosPagos({ valores, porPagina }) {
  const router = useRouter();

  // Cambiar un filtro vuelve siempre a la página 1 (no se incluye
  // `pagina` acá a propósito), pero conserva el tamaño de página elegido.
  function actualizar(cambios) {
    const nuevos = { ...valores, ...cambios };
    const params = new URLSearchParams();
    for (const [clave, valor] of Object.entries(nuevos)) {
      if (valor) params.set(clave, valor);
    }
    if (porPagina && porPagina !== "25") params.set("porPagina", porPagina);
    const query = params.toString();
    router.push(query ? `/admin/pagos?${query}` : "/admin/pagos");
  }

  return (
    <tr className="border-b bg-slate-50">
      <th className="p-2"></th>
      <th className="p-2 font-normal">
        <input
          defaultValue={valores.miembro}
          onKeyDown={(e) => {
            if (e.key === "Enter") actualizar({ miembro: e.currentTarget.value });
          }}
          onBlur={(e) => actualizar({ miembro: e.currentTarget.value })}
          placeholder="Buscar miembro..."
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full"
        />
      </th>
      <th className="p-2"></th>
      <th className="p-2"></th>
      <th className="p-2"></th>
      <th className="p-2 font-normal">
        <select
          defaultValue={valores.estado}
          onChange={(e) => actualizar({ estado: e.target.value })}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full"
        >
          <option value="">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="acreditado">Acreditados</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </th>
      <th className="p-2"></th>
    </tr>
  );
}
