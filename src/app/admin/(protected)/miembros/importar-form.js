"use client";

import { useRef, useState } from "react";
import { importarMiembros } from "./actions";

export default function ImportarMiembrosForm() {
  const formRef = useRef(null);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResultado(null);

    const formData = new FormData(e.currentTarget);
    const archivo = formData.get("archivo");
    if (!archivo || archivo.size === 0) {
      setError("Elegí un archivo .xlsx primero");
      return;
    }

    setLoading(true);
    try {
      const r = await importarMiembros(formData);
      setResultado(r);
      formRef.current?.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <h2 className="font-semibold mb-1">Importar desde Excel</h2>
      <p className="text-xs text-gray-500 mb-3">
        Sube el archivo .xlsx exportado con las columnas Dni, Nombre
        (&quot;Apellido, Nombre&quot;), Función y Fecha de Nacimiento. Los DNI
        que ya existen se saltean.
      </p>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center gap-2"
      >
        <input
          type="file"
          name="archivo"
          accept=".xlsx"
          required
          className="text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Importando..." : "Importar"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {resultado && (
        <div className="mt-3 text-sm space-y-1">
          <p className="text-green-700">
            {resultado.creados} miembro(s) creado(s).
          </p>
          {resultado.duplicados > 0 && (
            <p className="text-gray-500">
              {resultado.duplicados} ya existían (DNI repetido) y se
              saltearon.
            </p>
          )}
          {resultado.errores.length > 0 && (
            <div className="text-red-600">
              <p>{resultado.errores.length} fila(s) con error:</p>
              <ul className="list-disc list-inside max-h-48 overflow-y-auto">
                {resultado.errores.map((e, i) => (
                  <li key={i}>
                    Fila {e.fila}: {e.motivo}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
