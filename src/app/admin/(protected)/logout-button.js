"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);

  async function confirmarSalida() {
    setConfirmando(false);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="text-xs font-semibold text-slate-900 [filter:drop-shadow(0_1px_2px_rgba(255,255,255,0.9))] border border-white/60 rounded-full px-3 py-1.5 transition hover:[filter:drop-shadow(0_0_6px_rgba(14,165,233,0.9))]"
      >
        Cerrar sesión
      </button>

      {confirmando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl shadow-sm p-6 w-full max-w-sm">
            <p className="font-bold text-slate-800 text-lg mb-2">¿Cerrar sesión?</p>
            <p className="text-sm text-slate-500 mb-6">
              ¿Estás seguro que querés cerrar la sesión?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="flex-1 border border-slate-200 text-slate-600 rounded-full py-2.5 font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarSalida}
                className="flex-1 bg-sky-600 text-white rounded-full py-2.5 font-bold"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
