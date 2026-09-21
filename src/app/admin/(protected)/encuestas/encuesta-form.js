"use client";

import { useState } from "react";
import { eliminarEncuesta } from "./actions";

const hoy = () => new Date().toISOString().slice(0, 10);

export default function EncuestaForm({
  encuesta,
  ramas,
  familias,
  miembros,
  accion,
  textoBoton,
}) {
  const [tipoDestinatario, setTipoDestinatario] = useState(
    encuesta?.destinatario_tipo ?? "todos"
  );
  const [tipoRespuesta, setTipoRespuesta] = useState(
    encuesta?.tipo_respuesta ?? "opcion_unica"
  );

  const destinatarioIdInicial = (tipoEsperado) =>
    encuesta?.destinatario_tipo === tipoEsperado ? encuesta.destinatario_id : "";

  return (
    <form action={accion} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
      {encuesta && <input type="hidden" name="id" value={encuesta.id} />}

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Título
        </label>
        <input
          name="titulo"
          required
          defaultValue={encuesta?.titulo}
          placeholder="Confirmación de campamento"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Descripción (opcional)
        </label>
        <textarea
          name="descripcion"
          rows={3}
          defaultValue={encuesta?.descripcion}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Tipo de respuesta
        </label>
        <select
          name="tipo_respuesta"
          value={tipoRespuesta}
          onChange={(e) => setTipoRespuesta(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        >
          <option value="opcion_unica">Elegir una opción</option>
          <option value="texto_libre">Texto libre</option>
        </select>
      </div>

      {tipoRespuesta === "opcion_unica" && (
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Opciones (una por línea)
          </label>
          <textarea
            name="opciones"
            required
            rows={4}
            defaultValue={(encuesta?.opciones ?? []).join("\n")}
            placeholder={"Sí, voy a participar\nNo voy a participar"}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          ¿Quién responde?
        </label>
        <select
          name="alcance_respuesta"
          defaultValue={encuesta?.alcance_respuesta ?? "miembro"}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        >
          <option value="miembro">Cada chico por separado</option>
          <option value="familia">Una sola respuesta por familia</option>
        </select>
        <p className="text-xs text-slate-400 mt-1">
          "Una sola respuesta por familia" sirve para preguntas como "¿la familia
          acompaña al evento?" — cualquiera de los hermanos la puede contestar.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Destinatario
        </label>
        <select
          name="destinatario_tipo"
          value={tipoDestinatario}
          onChange={(e) => setTipoDestinatario(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
        >
          <option value="todos">Todos</option>
          <option value="rama">Rama</option>
          <option value="familia">Hermanos</option>
          <option value="miembro">Participante</option>
        </select>
      </div>

      {tipoDestinatario === "rama" && (
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

      {tipoDestinatario === "familia" && (
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

      {tipoDestinatario === "miembro" && (
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
            defaultValue={encuesta?.fecha_inicio ?? hoy()}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Cierra el (opcional)
          </label>
          <input
            name="fecha_cierre"
            type="date"
            defaultValue={encuesta?.fecha_cierre ?? ""}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
          />
        </div>
      </div>
      <p className="text-xs text-slate-400 -mt-1">
        Hasta la fecha de cierre, las familias pueden responder o cambiar su
        respuesta las veces que quieran. Si no ponés fecha, queda abierta sin
        vencimiento.
      </p>

      {encuesta && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="activo" defaultChecked={encuesta.activo} />
          Activa
        </label>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-sky-600 text-white rounded-full py-2.5 font-bold"
        >
          {textoBoton}
        </button>
        {encuesta && (
          <button
            formAction={eliminarEncuesta}
            className="flex-1 border border-red-300 text-red-600 rounded-full py-2.5 font-bold"
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
}
