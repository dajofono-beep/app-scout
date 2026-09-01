import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdministradoresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // `administradores` solo tiene auth_user_id + nombre — el email vive
  // en auth.users, así que hace falta el cliente admin para leer todas
  // las filas (RLS) y para resolver el email de cada una.
  const admin = createAdminClient();
  const { data: administradores } = await admin
    .from("administradores")
    .select("auth_user_id, nombre, created_at")
    .order("created_at");

  const conEmail = await Promise.all(
    (administradores ?? []).map(async (a) => {
      const { data } = await admin.auth.admin.getUserById(a.auth_user_id);
      return { ...a, email: data?.user?.email ?? "—" };
    })
  );

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Administradores</h1>
        <Link
          href="/admin/administradores/nuevo"
          className="bg-sky-600 text-white rounded-full px-4 py-2 text-sm font-bold"
        >
          + Nuevo administrador
        </Link>
      </div>

      <div className="space-y-2">
        {conEmail.map((a) => (
          <Link
            key={a.auth_user_id}
            href={`/admin/administradores/${a.auth_user_id}`}
            className="flex items-center justify-between gap-3 bg-white rounded-2xl shadow-sm p-4"
          >
            <div>
              <p className="font-bold text-slate-800">{a.nombre}</p>
              <p className="text-sm text-slate-400">{a.email}</p>
            </div>
            {a.auth_user_id === user.id && (
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-full shrink-0">
                Vos
              </span>
            )}
          </Link>
        ))}
        {conEmail.length === 0 && (
          <p className="text-sm text-slate-400">Todavía no hay administradores cargados.</p>
        )}
      </div>
    </div>
  );
}
