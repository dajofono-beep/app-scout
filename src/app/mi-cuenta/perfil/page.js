import Link from "next/link";
import { redirect } from "next/navigation";
import { Quicksand } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import PerfilForm from "./perfil-form";
import PasswordForm from "./password-form";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default async function PerfilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: miembro } = await supabase
    .from("miembros")
    .select("*, ramas(nombre)")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!miembro) redirect("/");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("miembro_id", miembro.id)
    .maybeSingle();

  return (
    <div
      className={`${quicksand.variable} min-h-screen bg-sky-50 px-4 py-8`}
      style={{ fontFamily: "var(--font-quicksand)" }}
    >
      <div className="max-w-lg mx-auto space-y-4">
        <Link href="/mi-cuenta" className="text-sm text-sky-600 font-semibold">
          ← Volver a mi cuenta
        </Link>

        <h1 className="text-2xl font-bold text-slate-800">Perfil</h1>

        <section className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
          <div>
            <p className="text-sm text-slate-400">Nombre</p>
            <p className="font-bold text-slate-800">
              {miembro.apellido}, {miembro.nombre}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Rama</p>
            <p className="font-semibold text-slate-700">{miembro.ramas?.nombre}</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold mb-3">Datos de contacto</h2>
          <PerfilForm
            fotoUrl={perfil?.foto_url ?? null}
            telefono={perfil?.telefono}
            redSocial1={perfil?.red_social_1}
            redSocial2={perfil?.red_social_2}
            redSocial3={perfil?.red_social_3}
          />
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold mb-3">Cambiar contraseña</h2>
          <PasswordForm />
        </section>
      </div>
    </div>
  );
}
