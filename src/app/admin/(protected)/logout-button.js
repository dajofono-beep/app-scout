"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function IconoSalir({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function LogoutButton({ colapsado = false }) {
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
        title="Cerrar sesión"
        className={`text-xs font-semibold text-slate-900 [filter:drop-shadow(0_1px_2px_rgba(255,255,255,0.9))] border border-white/60 rounded-full transition hover:[filter:drop-shadow(0_0_6px_rgba(14,165,233,0.9))] ${
          colapsado ? "w-9 h-9 flex items-center justify-center mx-auto" : "px-3 py-1.5"
        }`}
      >
        {colapsado ? <IconoSalir className="w-4 h-4" /> : "Cerrar sesión"}
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
