import Link from "next/link";
import { Quicksand } from "next/font/google";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata = {
  title: "Página no encontrada",
};

// Pantalla 404 de toda la app (rutas que no existen y cualquier
// `notFound()` que no tenga una pantalla propia más cerca). Reemplaza la
// pantalla en inglés que trae Next.js por defecto.
export default function NotFound() {
  return (
    <div
      className={`${quicksand.variable} min-h-screen flex items-start justify-center bg-sky-50 px-4 pt-12 pb-10`}
      style={{ fontFamily: "var(--font-quicksand)" }}
    >
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-sm px-6 pt-4 pb-6 text-center">
          <img
            src="/logo-azimut.png"
            alt="Azimut - Grupo Scout Libertador San Martín"
            className="w-full max-w-[340px] mx-auto mb-1"
          />
          <h1 className="text-xl font-bold text-slate-800 mt-4">
            No encontramos esta página
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Puede que el link esté incompleto o que ya no esté disponible.
            Volvé al inicio para ingresar a tu cuenta.
          </p>
          <Link
            href="/"
            className="mt-6 block w-full bg-sky-600 text-white rounded-full py-2.5 font-bold"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
