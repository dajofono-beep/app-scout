import Link from "next/link";
import { crearFechaImportante } from "../actions";
import FechaImportanteForm from "../fecha-importante-form";

export default function NuevaFechaImportantePage() {
  return (
    <div className="max-w-md">
      <Link
        href="/admin/fechas-importantes"
        className="text-sm text-sky-600 font-semibold"
      >
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Nueva fecha importante</h1>

      <FechaImportanteForm accion={crearFechaImportante} textoBoton="Crear fecha importante" />
    </div>
  );
}
