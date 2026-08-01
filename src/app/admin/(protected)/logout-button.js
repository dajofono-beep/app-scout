"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const confirmado = window.confirm("¿Estás seguro que querés salir?");
    if (!confirmado) return;

    const supabase = createClient();
    await supabase.auth.signOut();

    // En el celular, si la app corre como PWA instalada, esto la cierra;
    // si no se puede (el navegador no lo permite), sigue de largo y
    // muestra el login igual.
    if (window.innerWidth < 768) {
      window.close();
    }

    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs font-semibold text-slate-500 border border-slate-200 rounded-full px-3 py-1.5 hover:text-slate-700 hover:border-slate-300"
    >
      Cerrar sesión
    </button>
  );
}
