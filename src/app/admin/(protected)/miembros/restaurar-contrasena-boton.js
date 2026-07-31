"use client";

import { useState } from "react";
import { restaurarContrasena } from "./actions";

export default function RestaurarContrasenaBoton({ miembroId }) {
  const [estado, setEstado] = useState("idle");
  const [error, setError] = useState(null);

  async function manejar() {
    const confirmado = window.confirm(
      "¿Restaurar la contraseña de este participante? Vuelve a quedar como su DNI, igual que al darlo de alta."
    );
    if (!confirmado) return;

    setError(null);
    setEstado("cargando");
    const formData = new FormData();
    formData.set("id", miembroId);
    try {
      await restaurarContrasena(formData);
      setEstado("listo");
    } catch (err) {
      setError(err.message);
      setEstado("idle");
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={manejar}
        disabled={estado === "cargando"}
        className="text-xs font-semibold text-sky-600 hover:underline disabled:opacity-50"
      >
        {estado === "cargando" ? "Restaurando..." : "Restaurar contraseña"}
      </button>
      {estado === "listo" && (
        <span className="text-xs text-emerald-700">Listo, ya es el DNI.</span>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </span>
  );
}
