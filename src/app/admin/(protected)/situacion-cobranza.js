const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const formatoPorcentaje = (n) => n.toLocaleString("es-AR", { maximumFractionDigits: 1 });

// Combina en una sola tarjeta lo que antes eran 4 tarjetas sueltas
// (Saldo total / Acreditados / Pendientes / Faltantes): una barra
// segmentada con las tres proporciones, la leyenda con montos y
// porcentajes, y un cartel con lo que falta cobrar.
export default function SituacionCobranza({ totalAcreditado, totalPendiente, totalFaltante }) {
  const totalGeneral = totalAcreditado + totalPendiente + totalFaltante;

  const segmentos = [
    { label: "Pagado / al día", valor: totalAcreditado, color: "bg-emerald-500", dot: "bg-emerald-500" },
    { label: "Pendiente de acreditación", valor: totalPendiente, color: "bg-amber-400", dot: "bg-amber-400" },
    { label: "Falta por pagar", valor: totalFaltante, color: "bg-red-500", dot: "bg-red-500" },
  ];

  const pct = (v) => (totalGeneral > 0 ? (v / totalGeneral) * 100 : 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm font-bold text-sky-700">Situación de cobranza</p>
        <p className="text-xs text-slate-400 text-right shrink-0">
          Total a pagar
          <span className="block font-bold text-slate-700 text-sm">
            {formatoMoneda(totalGeneral)}
          </span>
        </p>
      </div>

      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
        {segmentos.map((s) => (
          <div
            key={s.label}
            className={s.color}
            style={{ width: `${pct(s.valor)}%` }}
            title={`${s.label}: ${formatoMoneda(s.valor)}`}
          />
        ))}
      </div>

      <div className="space-y-1.5 mt-3">
        {segmentos.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-1.5 text-slate-600 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="flex items-baseline gap-2 shrink-0">
              <span className="font-bold text-slate-800">{formatoMoneda(s.valor)}</span>
              <span className="text-xs text-slate-400 w-12 text-right">
                {formatoPorcentaje(pct(s.valor))}%
              </span>
            </span>
          </div>
        ))}
      </div>

      {totalFaltante > 0 && (
        <div className="mt-auto bg-red-50 text-red-700 text-sm font-bold rounded-xl px-3 py-2 text-center">
          Pendiente: {formatoMoneda(totalFaltante)}
        </div>
      )}
    </div>
  );
}
