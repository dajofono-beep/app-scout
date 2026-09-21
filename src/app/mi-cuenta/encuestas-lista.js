import Link from "next/link";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatoFecha(iso) {
  const [, mes, dia] = iso.split("-").map(Number);
  return `${dia} de ${MESES[mes - 1]}`;
}

// encuestas: [{ id, titulo, created_at, respondida }], ya resuelto del
// lado del servidor (mi-cuenta/page.js) si esta familia ya la contestó.
export default function EncuestasLista({ encuestas }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-5">
      <div className="space-y-3">
        {encuestas.map((e) => (
          <Link
            key={e.id}
            href={`/mi-cuenta/encuestas/${e.id}`}
            className="block border border-slate-100 rounded-xl p-4 hover:bg-slate-50"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-slate-800">{e.titulo}</p>
              <p className="text-xs text-slate-400 shrink-0">
                {formatoFecha(e.created_at.slice(0, 10))}
              </p>
            </div>
            <span
              className={`inline-block mt-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                e.respondida
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              {e.respondida ? "Ya respondiste" : "Pendiente de responder"}
            </span>
          </Link>
        ))}
        {encuestas.length === 0 && (
          <p className="text-slate-500 text-sm">Todavía no hay encuestas.</p>
        )}
      </div>
    </section>
  );
}
