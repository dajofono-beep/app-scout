"use client";

import { useState } from "react";

export default function LinkCompartir({ url }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-sm font-semibold text-slate-600 mb-2">
        Link para compartir (WhatsApp, mail, etc.)
      </p>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          className="flex-1 min-w-0 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600"
        />
        <button
          type="button"
          onClick={copiar}
          className="shrink-0 bg-sky-600 text-white rounded-xl px-4 py-2 text-sm font-bold"
        >
          {copiado ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-2">
        Quien lo abra sin haber iniciado sesión va a tener que loguearse (rama,
        nombre y contraseña) y va a caer directo acá.
      </p>
    </div>
  );
}
