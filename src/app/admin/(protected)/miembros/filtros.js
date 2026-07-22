"use client";

import { useRouter } from "next/navigation";

export default function FiltrosMiembros({ ramas, familias, valores }) {
  const router = useRouter();

  function actualizar(cambios) {
    const nuevos = { ...valores, ...cambios };
    const params = new URLSearchParams();
    for (const [clave, valor] of Object.entries(nuevos)) {
      if (valor) params.set(clave, valor);
    }
    const query = params.toString();
    router.push(query ? `/admin/miembros?${query}` : "/admin/miembros");
  }

  return (
    <tr className="border-b bg-gray-50">
      <th className="p-2 font-normal">
        <input
          defaultValue={valores.nombre}
          onKeyDown={(e) => {
            if (e.key === "Enter") actualizar({ nombre: e.currentTarget.value });
          }}
          onBlur={(e) => actualizar({ nombre: e.currentTarget.value })}
          placeholder="Buscar por nombre..."
          className="border rounded px-2 py-1 text-sm w-full"
        />
      </th>
      <th className="p-2 font-normal">
        <input
          defaultValue={valores.dni}
          onKeyDown={(e) => {
            if (e.key === "Enter") actualizar({ dni: e.currentTarget.value });
          }}
          onBlur={(e) => actualizar({ dni: e.currentTarget.value })}
          placeholder="Buscar DNI..."
          className="border rounded px-2 py-1 text-sm w-full"
        />
      </th>
      <th className="p-2 font-normal">
        <select
          defaultValue={valores.rama_id}
          onChange={(e) => actualizar({ rama_id: e.target.value })}
          className="border rounded px-2 py-1 text-sm w-full"
        >
          <option value="">Todas</option>
          {ramas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      </th>
      <th className="p-2 font-normal">
        <select
          defaultValue={valores.familia_id}
          onChange={(e) => actualizar({ familia_id: e.target.value })}
          className="border rounded px-2 py-1 text-sm w-full"
        >
          <option value="">Todas</option>
          {familias.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nombre}
            </option>
          ))}
        </select>
      </th>
      <th className="p-2 font-normal">
        <select
          defaultValue={valores.activo}
          onChange={(e) => actualizar({ activo: e.target.value })}
          className="border rounded px-2 py-1 text-sm w-full"
        >
          <option value="">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </th>
      <th className="p-2"></th>
    </tr>
  );
}
