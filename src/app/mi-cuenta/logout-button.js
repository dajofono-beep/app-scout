"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CLASE_DEFECTO =
  "text-xs font-semibold text-slate-500 border border-slate-200 rounded-full px-3 py-1.5 hover:text-slate-700 hover:border-slate-300";

export default function LogoutButton({ className }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className={className ?? CLASE_DEFECTO}>
      Salir
    </button>
  );
}
