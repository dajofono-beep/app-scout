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

// mensajes: [{ id, titulo, cuerpo, created_at, destinatarioTexto }], ya
// ordenados del más nuevo al más viejo (la RLS ya filtra a los que le
// corresponden a esta familia y están vigentes).
export default function Mensajes({ mensajes }) {
  return (
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
            <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{m.cuerpo}</p>
          </div>
        ))}
        {mensajes.length === 0 && (
          <p className="text-slate-500 text-sm">Todavía no hay mensajes.</p>
        )}
      </div>
    </section>
  );
}
