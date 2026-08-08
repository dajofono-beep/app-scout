"use client";

import { useState } from "react";
import { guardarMercadoPagoConfig } from "./actions";

export default function MercadoPagoConfigForm({ config }) {
  const [ambiente, setAmbiente] = useState(config.ambiente ?? "prueba");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guardado, setGuardado] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setGuardado(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await guardarMercadoPagoConfig(formData);
      setGuardado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
    >
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Titular de la cuenta
        </label>
        <input
          name="titular"
          defaultValue={config.titular ?? ""}
          placeholder="Ej. Nombre y apellido de quien recibe hoy las transferencias"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
        <p className="text-xs text-slate-500 mt-1">
          Solo como referencia interna — no afecta el cobro, es para saber
          rápido a quién corresponde la cuenta cargada abajo.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Ambiente activo
        </label>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ambiente"
              value="prueba"
              checked={ambiente === "prueba"}
              onChange={() => setAmbiente("prueba")}
            />
            Prueba (sandbox)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ambiente"
              value="produccion"
              checked={ambiente === "produccion"}
              onChange={() => setAmbiente("produccion")}
            />
            Producción (plata real)
          </label>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Mientras esté en Prueba, los pagos no mueven plata de verdad.
          Cambiá a Producción recién cuando lo hayas probado a fondo.
        </p>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <p className="text-sm font-bold text-slate-700">Credenciales de prueba</p>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Access token de prueba
          </label>
          <input
            name="access_token_prueba"
            type="password"
            defaultValue={config.access_token_prueba ?? ""}
            placeholder="TEST-..."
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Public key de prueba
          </label>
          <input
            name="public_key_prueba"
            type="password"
            defaultValue={config.public_key_prueba ?? ""}
            placeholder="TEST-..."
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <p className="text-sm font-bold text-slate-700">Credenciales de producción</p>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Access token de producción
          </label>
          <input
            name="access_token_produccion"
            type="password"
            defaultValue={config.access_token_produccion ?? ""}
            placeholder="APP_USR-..."
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Public key de producción
          </label>
          <input
            name="public_key_produccion"
            type="password"
            defaultValue={config.public_key_produccion ?? ""}
            placeholder="APP_USR-..."
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Recargo (%)
        </label>
        <input
          name="recargo_porcentaje"
          type="number"
          min="0"
          max="100"
          step="0.01"
          defaultValue={config.recargo_porcentaje ?? 0}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
        <p className="text-xs text-slate-500 mt-1">
          Preparado para más adelante: hoy no se le suma a ningún pago. Por
          ahora la comisión de Mercado Pago la absorbe el Grupo.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar"}
      </button>

      {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
      {guardado && (
        <p className="text-sm text-emerald-700 font-semibold">Guardado.</p>
      )}
    </form>
  );
}
