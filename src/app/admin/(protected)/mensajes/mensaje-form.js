"use client";

import { useState } from "react";
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
  const [tipo, setTipo] = useState(mensaje?.destinatario_tipo ?? "todos");

  const destinatarioIdInicial = (tipoEsperado) =>
    mensaje?.destinatario_tipo === tipoEsperado ? mensaje.destinatario_id : "";

  return (
    <form action={accion} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
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
          <option value="familia">Familia</option>
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
            Familia...
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

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-sky-600 text-white rounded-full py-2.5 font-bold"
        >
          {textoBoton}
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
