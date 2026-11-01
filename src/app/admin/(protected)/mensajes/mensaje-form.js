"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarMensaje } from "./actions";
import { MAX_ADJUNTOS, MAX_BYTES_TOTAL, formatoPeso } from "@/lib/mensaje-adjuntos-limites";

const hoy = () => new Date().toISOString().slice(0, 10);

const esPdf = (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");

// adjuntos: los PDF que ya tiene el mensaje ({ id, nombre, tamano }), solo
// al editar.
export default function MensajeForm({
  mensaje,
  adjuntos = [],
  ramas,
  familias,
  miembros,
  accion,
  textoBoton,
}) {
  const router = useRouter();
  const inputArchivoRef = useRef(null);
  const [tipo, setTipo] = useState(mensaje?.destinatario_tipo ?? "todos");
  const [fechaInicio, setFechaInicio] = useState(mensaje?.fecha_inicio ?? hoy());
  const [nuevos, setNuevos] = useState([]);
  const [quitados, setQuitados] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const destinatarioIdInicial = (tipoEsperado) =>
    mensaje?.destinatario_tipo === tipoEsperado ? mensaje.destinatario_id : "";

  const conservados = adjuntos.filter((a) => !quitados.includes(a.id));
  const totalArchivos = conservados.length + nuevos.length;
  const totalBytes =
    conservados.reduce((acc, a) => acc + a.tamano, 0) + nuevos.reduce((acc, f) => acc + f.size, 0);
  const lleno = totalArchivos >= MAX_ADJUNTOS;

  function agregarArchivos(e) {
    const elegidos = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (elegidos.length === 0) return;
    setError(null);

    const noPdf = elegidos.find((f) => !esPdf(f));
    if (noPdf) {
      setError(`"${noPdf.name}" no es un PDF. Solo se pueden adjuntar archivos PDF.`);
      return;
    }

    const combinados = [...nuevos];
    for (const f of elegidos) {
      if (!combinados.some((n) => n.name === f.name && n.size === f.size)) combinados.push(f);
    }
    if (conservados.length + combinados.length > MAX_ADJUNTOS) {
      setError(`Un mensaje puede tener hasta ${MAX_ADJUNTOS} archivos adjuntos.`);
      return;
    }
    const bytes =
      conservados.reduce((acc, a) => acc + a.tamano, 0) +
      combinados.reduce((acc, f) => acc + f.size, 0);
    if (bytes > MAX_BYTES_TOTAL) {
      setError(
        `Los adjuntos no pueden pesar más de ${formatoPeso(MAX_BYTES_TOTAL)} en total (con esos archivos serían ${formatoPeso(bytes)}).`
      );
      return;
    }
    setNuevos(combinados);
  }

  async function handleSubmit(e) {
    // El botón "Eliminar" tiene su propio formAction — que siga su
    // camino nativo en vez de pasar por acá.
    if (e.nativeEvent.submitter?.hasAttribute("formaction")) return;

    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const datos = new FormData(e.currentTarget);
      nuevos.forEach((f) => datos.append("adjuntos", f));
      quitados.forEach((id) => datos.append("quitar_adjuntos", id));

      const resultado = await accion(datos);
      if (resultado && !resultado.ok) {
        setError(resultado.error);
      } else if (resultado?.ok) {
        setNuevos([]);
        setQuitados([]);
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

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">
          Archivos adjuntos (PDF)
        </label>
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-1.5">
          <div className="flex items-baseline justify-between text-xs text-slate-600">
            <span className="font-bold">
              {totalArchivos} de {MAX_ADJUNTOS} archivos
            </span>
            <span>
              {formatoPeso(totalBytes)} de {formatoPeso(MAX_BYTES_TOTAL)}
            </span>
          </div>

          {adjuntos.map((a) => {
            const quitado = quitados.includes(a.id);
            return (
              <div
                key={a.id}
                className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-2"
              >
                <span className="shrink-0 w-7 h-8 rounded bg-red-100 text-red-700 text-[9px] font-extrabold grid place-items-end justify-center pb-1">
                  PDF
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={`/mensaje-adjunto/${a.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block truncate text-sm font-bold hover:underline ${
                      quitado ? "text-slate-400 line-through" : "text-sky-700"
                    }`}
                  >
                    {a.nombre}
                  </a>
                  <p className="text-xs text-slate-600">
                    {quitado ? "Se quita al guardar" : formatoPeso(a.tamano)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setQuitados((q) => (quitado ? q.filter((id) => id !== a.id) : [...q, a.id]))
                  }
                  className={`text-xs font-bold rounded-full border px-3 py-1 ${
                    quitado ? "border-slate-300 text-slate-600" : "border-red-200 text-red-600"
                  }`}
                >
                  {quitado ? "Deshacer" : "Quitar"}
                </button>
              </div>
            );
          })}

          {nuevos.map((f, i) => (
            <div
              key={`${f.name}-${f.size}`}
              className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-lg px-2.5 py-2"
            >
              <span className="shrink-0 w-7 h-8 rounded bg-red-100 text-red-700 text-[9px] font-extrabold grid place-items-end justify-center pb-1">
                PDF
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-sky-700">{f.name}</p>
                <p className="text-xs text-slate-600">{formatoPeso(f.size)} · se sube al guardar</p>
              </div>
              <span className="text-[11px] font-bold bg-sky-200 text-sky-900 rounded-full px-2 py-0.5">
                Nuevo
              </span>
              <button
                type="button"
                onClick={() => setNuevos((n) => n.filter((_, j) => j !== i))}
                className="text-xs font-bold rounded-full border border-red-200 text-red-600 px-3 py-1"
              >
                Quitar
              </button>
            </div>
          ))}

          <input
            ref={inputArchivoRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            onChange={agregarArchivos}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputArchivoRef.current?.click()}
            disabled={lleno}
            className="w-full border-2 border-dashed border-sky-200 rounded-xl py-2.5 text-sm font-bold text-sky-700 bg-white disabled:border-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            ＋ Agregar PDF
          </button>
          <p className="text-xs text-slate-600">
            Hasta {MAX_ADJUNTOS} archivos y {formatoPeso(MAX_BYTES_TOTAL)} en total por mensaje.
            Solo PDF. Los ven únicamente quienes reciben el mensaje.
          </p>
        </div>
      </div>

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
