import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";
import NavAdminGroup from "./nav-admin-group";

const NAV_ITEMS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/miembros", label: "Miembros" },
  { href: "/admin/pagos", label: "Pagos" },
  { href: "/admin/cargos", label: "Cargos" },
  { href: "/admin/productos", label: "Conceptos" },
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
    <div className="min-h-screen flex flex-col md:flex-row bg-sky-50">
      <nav className="md:w-56 shrink-0 bg-white border-b md:border-b-0 md:border-r border-sky-100 p-4 flex md:flex-col gap-3">
        <div className="flex items-center gap-2 md:mb-2">
          <img
            src="/icono-azimut.png"
            alt="Azimut"
            className="w-9 h-9 rounded-lg shrink-0"
          />
          <p className="text-sm text-slate-400">Hola, {admin.nombre}</p>
        </div>
        <div className="flex flex-wrap md:flex-col gap-2 md:gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-600 hover:text-sky-600"
            >
              {item.label}
            </Link>
          ))}

          <NavAdminGroup />
        </div>
        <LogoutButton />
      </nav>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
