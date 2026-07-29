"use client";

import { useRef, useState } from "react";
import { MEDIOS_PAGO } from "@/lib/medios-pago";
import { crearPago } from "./actions";

const hoy = () => new Date().toISOString().slice(0, 10);

// Deja solo dígitos y, como mucho, una coma decimal con hasta 2 dígitos
// (formato es-AR: coma para decimales, sin separador de miles acá).
function limpiarImporte(valor) {
  const limpio = valor.replace(/[^\d,]/g, "");
  const [entero, ...resto] = limpio.split(",");
  if (resto.length === 0) return entero;
  return `${entero},${resto.join("").slice(0, 2)}`;
}

// Agrega el signo $ y el separador de miles para mostrar en el input,
// a partir del valor "limpio" guardado en el estado.
function formatearParaMostrar(importe) {
  if (!importe) return "";
  const [entero, decimales] = importe.split(",");
  const enteroFormateado = (entero || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decimales !== undefined
    ? `$ ${enteroFormateado},${decimales}`
    : `$ ${enteroFormateado}`;
}

export default function PagoForm({ esFamiliaConVarios, familiares, miembroId }) {
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const [importe, setImporte] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setExito(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("importe", importe.replace(",", "."));
    try {
      await crearPago(formData);
      formRef.current?.reset();
      setImporte("");
      setExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="font-bold mb-3">Cargar un pago</h2>

      {exito && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 mb-3 text-sm">
          <p className="font-bold">¡Gracias por tu pago!</p>
          <p>
            Quedó registrado como &quot;Pendiente&quot;. Si en 4 días nadie lo
            observa, se acredita automáticamente a tu cuenta.
          </p>
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {esFamiliaConVarios && (
          <select
            name="miembro_id"
            required
            defaultValue="reparto_igual"
            className="border border-slate-200 rounded-xl px-4 py-2.5 sm:col-span-3"
          >
            <option value="reparto_igual">
              Repartir en partes iguales entre todos
            </option>
            {(familiares ?? []).map((f) => (
              <option key={f.id} value={f.id}>
                Para: {f.apellido}, {f.nombre}
              </option>
            ))}
          </select>
        )}
        {!esFamiliaConVarios && (
          <input type="hidden" name="miembro_id" value={miembroId} />
        )}
        <input
          name="importe"
          type="text"
          inputMode="decimal"
          required
          value={formatearParaMostrar(importe)}
          onChange={(e) => setImporte(limpiarImporte(e.target.value))}
          placeholder="Importe"
          className="border border-slate-200 rounded-xl px-4 py-2.5"
        />
        <input
          name="fecha_pago"
          type="date"
          required
          defaultValue={hoy()}
          max={hoy()}
          className="border border-slate-200 rounded-xl px-4 py-2.5"
        />
        <select
          name="medio_pago"
          defaultValue=""
          className="border border-slate-200 rounded-xl px-4 py-2.5"
        >
          <option value="">Medio de pago...</option>
          {MEDIOS_PAGO.map((medio) => (
            <option key={medio} value={medio}>
              {medio}
            </option>
          ))}
        </select>
        <div className="sm:col-span-3">
          <label className="block text-xs text-slate-500 mb-1">
            Comprobante de la transferencia (opcional)
          </label>
          <input
            type="file"
            name="comprobante"
            accept="image/*"
            className="text-sm w-full"
          />
        </div>

        {error && (
          <p className="sm:col-span-3 text-sm text-red-500 font-semibold">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-3 bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
        >
          {loading ? "Registrando..." : "Registrar pago"}
        </button>
      </form>
      <p className="text-xs text-slate-500 mt-2">
        El pago queda como &quot;Pendiente&quot; por 4 días, tiempo en el que
        el administrador puede revisarlo. Luego se acredita solo.
      </p>
    </section>
  );
}
