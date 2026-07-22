"use client";

import { useRouter } from "next/navigation";

export default function FiltrosFamilias({ valores }) {
  const router = useRouter();

  function actualizar(cambios) {
    const nuevos = { ...valores, ...cambios };
    const params = new URLSearchParams();
    for (const [clave, valor] of Object.entries(nuevos)) {
      if (valor) params.set(clave, valor);
    }
    const query = params.toString();
    router.push(query ? `/admin/familias?${query}` : "/admin/familias");
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
      <th className="p-2"></th>
      <th className="p-2"></th>
    </tr>
  );
}
