"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CLASE_DEFECTO =
  "text-xs font-semibold text-slate-500 border border-slate-200 rounded-full px-3 py-1.5 hover:text-slate-700 hover:border-slate-300";

export default function LogoutButton({ className }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);

  async function confirmarSalida() {
    setConfirmando(false);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className={className ?? CLASE_DEFECTO}
      >
        Salir
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
