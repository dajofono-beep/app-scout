import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

const NAV_ITEMS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/ramas", label: "Ramas" },
  { href: "/admin/familias", label: "Familias" },
  { href: "/admin/miembros", label: "Miembros" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/descuentos", label: "Descuentos" },
  { href: "/admin/cargos", label: "Cargos" },
  { href: "/admin/pagos", label: "Pagos" },
];

export default async function AdminLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("administradores")
    .select("nombre")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <nav className="md:w-56 shrink-0 bg-white border-b md:border-b-0 md:border-r p-4 flex md:flex-col gap-3">
        <p className="text-sm text-gray-500 md:mb-2">Hola, {admin.nombre}</p>
        <div className="flex flex-wrap md:flex-col gap-2 md:gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <LogoutButton />
      </nav>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
