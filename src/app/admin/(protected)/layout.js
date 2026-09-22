import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BarraLateral from "./barra-lateral";

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
    <div className="min-h-screen flex bg-sky-50">
      <BarraLateral nombreAdmin={admin.nombre} />
      <main className="flex-1 min-w-0 p-4 md:p-8 print:p-0 bg-sky-50 print:bg-white">
        {children}
      </main>
    </div>
  );
}
