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

    if (window.innerWidth < 768) {
      // Mismo cierre que logra el botón Atrás al presionarlo dos veces:
      // ese mecanismo (en cuenta-nav.js) intercepta el primer "atrás" y
      // recién deja pasar el segundo. Con esta bandera le decimos que no
      // intercepte esta vez, así un solo "atrás" programático hace lo
      // mismo que ya probaste que cierra la app. Si después de un
      // instante seguimos en la página, no funcionó y mostramos el login
      // como red de seguridad.
      window.__azimutSaliendo = true;
      window.close();
      window.history.back();
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 400);
      return;
    }

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
            <p className="font-bold text-slate-800 text-lg mb-2">¿Salir?</p>
            <p className="text-sm text-slate-500 mb-6">
              ¿Estás seguro que querés salir de la aplicación?
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
