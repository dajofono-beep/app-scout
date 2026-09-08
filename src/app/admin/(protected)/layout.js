import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";
import NavGroup from "./nav-group";
import BarraAdmin from "./barra-admin";
import { NAV_ITEMS, ITEMS_COMUNICACION, ITEMS_ADMINISTRACION } from "./nav-items";

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
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-sky-100 to-sky-50">
      <BarraAdmin nombreAdmin={admin.nombre} />
      <nav
        className="hidden md:flex print:hidden md:w-56 shrink-0 md:border-r border-sky-100 md:flex-col relative overflow-hidden"
        style={{
          backgroundImage: "url('/fondo-sidebar.png')",
          backgroundSize: "cover",
          backgroundPosition: "top left",
        }}
      >
        <div className="absolute inset-0 bg-white/70" />
        <div className="relative flex flex-col gap-3 p-4 flex-1">
          <div className="flex items-center justify-end gap-2 md:mb-2">
            <p className="text-sm text-slate-400">Hola, {admin.nombre}</p>
            <img
              src="/icono-azimut.png"
              alt="Azimut"
              className="w-9 h-9 rounded-lg shrink-0"
            />
          </div>
          <div className="flex flex-wrap md:flex-col gap-2 md:gap-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="text-sm font-semibold text-slate-600 hover:text-sky-600"
              >
                {item.label}
              </Link>
            ))}

            <NavGroup titulo="Comunicación" items={ITEMS_COMUNICACION} />
            <NavGroup titulo="Administración" items={ITEMS_ADMINISTRACION} />
          </div>
          <LogoutButton />
        </div>
      </nav>
      <main className="flex-1 p-4 md:p-8 print:p-0 bg-sky-100 print:bg-white">
        {children}
      </main>
    </div>
  );
}
