import BotonMensajeLeido from "./boton-mensaje-leido";
import { formatoPeso } from "@/lib/mensaje-adjuntos-limites";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function formatoFecha(iso) {
  const [, mes, dia] = iso.split("-").map(Number);
  return `${dia} de ${MESES[mes - 1]}`;
}

// mensajes: [{ id, titulo, cuerpo, created_at, destinatarioTexto, leido,
// adjuntos: [{ id, nombre, tamano }] }], ya
// ordenados del más nuevo al más viejo (la RLS ya filtra a los que le
// corresponden a esta familia y están vigentes).
export default function Mensajes({ mensajes, linkGrupoWhatsapp }) {
  return (
    <div className="space-y-4">
      <section className="bg-white rounded-2xl shadow-sm p-5">
        <div className="space-y-3 max-h-[28rem] overflow-y-auto">
          {mensajes.map((m) => (
            <div key={m.id} className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-slate-800">{m.titulo}</p>
                <p className="text-xs text-slate-400 shrink-0">
                  {formatoFecha(m.created_at.slice(0, 10))}
                </p>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mensaje para {m.destinatarioTexto}
              </p>
              <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">
                {m.cuerpo}
              </p>
              {m.adjuntos.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  <p className="text-xs font-bold text-slate-600">
                    {m.adjuntos.length === 1
                      ? "Archivo adjunto"
                      : `Archivos adjuntos (${m.adjuntos.length})`}
                  </p>
                  {m.adjuntos.map((a) => (
                    <a
                      key={a.id}
                      href={`/mensaje-adjunto/${a.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-xl border border-sky-100 bg-sky-50 px-2.5 py-2"
                    >
                      <span className="shrink-0 w-8 h-9 rounded-md bg-red-100 text-red-700 text-[10px] font-extrabold grid place-items-end justify-center pb-1">
                        PDF
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-sky-700">
                          {a.nombre}
                        </span>
                        <span className="block text-xs text-slate-600">{formatoPeso(a.tamano)}</span>
                      </span>
                      <span aria-hidden="true" className="text-sky-600 font-bold">
                        ↓
                      </span>
                    </a>
                  ))}
                </div>
              )}
              <BotonMensajeLeido mensajeId={m.id} leidoInicial={m.leido} />
            </div>
          ))}
          {mensajes.length === 0 && (
            <p className="text-slate-500 text-sm">Todavía no hay mensajes.</p>
          )}
        </div>
      </section>

      {linkGrupoWhatsapp && (
        <a
          href={linkGrupoWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 bg-white rounded-2xl shadow-sm p-5 border border-emerald-200 hover:bg-emerald-50"
        >
          <div>
            <p className="font-bold text-emerald-800 text-sm">
              Grupo de WhatsApp de tu rama
            </p>
            <p className="text-xs text-emerald-700">Tocá para unirte</p>
          </div>
          <span className="text-emerald-700 text-lg">↗</span>
        </a>
      )}
    </div>
  );
}
