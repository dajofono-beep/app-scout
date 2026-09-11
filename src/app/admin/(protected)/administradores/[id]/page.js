import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { eliminarAdministrador } from "../actions";
import EditarAdministradorForm from "../editar-administrador-form";

export default async function FichaAdministradorPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: administrador } = await admin
    .from("administradores")
    .select("auth_user_id, nombre, recibe_notificaciones_pagos")
    .eq("auth_user_id", id)
    .maybeSingle();
  if (!administrador) notFound();

  const { data: datosUsuario } = await admin.auth.admin.getUserById(id);
  const email = datosUsuario?.user?.email ?? "—";
  const soyYo = id === user.id;

  const { data: miembros } = await supabase
    .from("miembros")
    .select("id, nombre, apellido")
    .eq("activo", true)
    .order("apellido");

  return (
    <div className="max-w-lg">
      <Link href="/admin/administradores" className="text-sm text-sky-600 font-semibold">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-1">{administrador.nombre}</h1>
      <p className="text-sm text-slate-400 mb-6">{email}</p>

      <EditarAdministradorForm administrador={administrador} miembros={miembros ?? []} />

      <div className="bg-white rounded-2xl shadow-sm p-5 mt-4">
        {soyYo ? (
          <p className="text-sm text-slate-400">
            No podés quitarte a vos mismo como administrador.
          </p>
        ) : (
          <form action={eliminarAdministrador}>
            <input type="hidden" name="auth_user_id" value={administrador.auth_user_id} />
            <button
              type="submit"
              className="w-full border border-red-300 text-red-600 rounded-full py-2.5 font-bold"
            >
              Quitar administrador
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
