"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarMensaje } from "./actions";

const hoy = () => new Date().toISOString().slice(0, 10);

export default function MensajeForm({
  mensaje,
  ramas,
  familias,
  miembros,
  accion,
  textoBoton,
}) {
  const router = useRouter();
  const [tipo, setTipo] = useState(mensaje?.destinatario_tipo ?? "todos");
  const [fechaInicio, setFechaInicio] = useState(mensaje?.fecha_inicio ?? hoy());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const destinatarioIdInicial = (tipoEsperado) =>
    mensaje?.destinatario_tipo === tipoEsperado ? mensaje.destinatario_id : "";

  async function handleSubmit(e) {
    // El botón "Eliminar" tiene su propio formAction — que siga su
    // camino nativo en vez de pasar por acá.
    if (e.nativeEvent.submitter?.hasAttribute("formaction")) return;

    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const resultado = await accion(new FormData(e.currentTarget));
      if (resultado && !resultado.ok) {
        setError(resultado.error);
      } else if (resultado?.ok) {
        // Solo pasa acá al editar (crear termina en un redirect() del
        // propio server action) — sin esto, la pantalla se queda con
        // los datos viejos hasta recargar a mano.
        router.refresh();
      }
    } catch {
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm p-5 space-y-3"
    >
      {mensaje && <input type="hidden" name="id" value={mensaje.id} />}

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Título
        </label>
        <input
          name="titulo"
          required
          defaultValue={mensaje?.titulo}
          placeholder="Recordatorio de campamento"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Mensaje
        </label>
        <textarea
          name="cuerpo"
          required
          rows={4}
          defaultValue={mensaje?.cuerpo}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Destinatario
        </label>
        <select
          name="destinatario_tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        >
          <option value="todos">Todos</option>
          <option value="rama">Rama</option>
          <option value="familia">Hermanos</option>
          <option value="miembro">Participante</option>
        </select>
      </div>

      {tipo === "rama" && (
        <select
          name="destinatario_id"
          required
          defaultValue={destinatarioIdInicial("rama")}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        >
          <option value="" disabled>
            Rama...
          </option>
          {ramas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      )}

      {tipo === "familia" && (
        <select
          name="destinatario_id"
          required
          defaultValue={destinatarioIdInicial("familia")}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        >
          <option value="" disabled>
            Hermanos...
          </option>
          {familias.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nombre}
            </option>
          ))}
        </select>
      )}

      {tipo === "miembro" && (
        <select
          name="destinatario_id"
          required
          defaultValue={destinatarioIdInicial("miembro")}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        >
          <option value="" disabled>
            Participante...
          </option>
          {miembros.map((m) => (
            <option key={m.id} value={m.id}>
              {m.apellido}, {m.nombre}
            </option>
          ))}
        </select>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Vigente desde
          </label>
          <input
            name="fecha_inicio"
            type="date"
            required
            defaultValue={mensaje?.fecha_inicio ?? hoy()}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Vigente hasta (opcional)
          </label>
          <input
            name="fecha_fin"
            type="date"
            min={fechaInicio}
            defaultValue={mensaje?.fecha_fin ?? ""}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
      </div>
      <p className="text-xs text-slate-400 -mt-1">
        Si no ponés "vigente hasta", el mensaje queda visible sin vencimiento.
      </p>

      {mensaje && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="activo" defaultChecked={mensaje.activo} />
          Activo
        </label>
      )}

      {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-sky-600 text-white rounded-full py-2.5 font-bold disabled:opacity-50"
        >
          {loading ? "Guardando..." : textoBoton}
        </button>
        {mensaje && (
          <button
            formAction={eliminarMensaje}
            className="flex-1 border border-red-300 text-red-600 rounded-full py-2.5 font-bold"
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
}
