// Dona plana (sin librería): un anillo armado con conic-gradient y un
// círculo blanco encima para el hueco central. `valores` define las
// proporciones del anillo; `etiquetasValor` es lo que se muestra al
// lado de cada label en la leyenda (ya formateado por quien llama —
// a veces es una cantidad, a veces un porcentaje, según la tarjeta).
export default function DonutChart({ labels, valores, colores, etiquetasValor, vertical }) {
  const total = valores.reduce((a, b) => a + b, 0);

  if (total <= 0) {
    return <p className="text-sm text-slate-400">Todavía no hay datos para mostrar.</p>;
  }

  let acumulado = 0;
  const gradiente = `conic-gradient(${valores
    .map((v, i) => {
      const inicio = (acumulado / total) * 100;
      acumulado += v;
      const fin = (acumulado / total) * 100;
      return `${colores[i]} ${inicio}% ${fin}%`;
    })
    .join(", ")})`;

  const descripcion = labels
    .map((label, i) => `${label}: ${etiquetasValor[i]}`)
    .join(". ");

  const dona = (
    <div className={`relative w-24 h-24 shrink-0 ${vertical ? "mx-auto" : ""}`}>
      <div
        role="img"
        aria-label={descripcion}
        className="absolute inset-0 rounded-full"
        style={{ background: gradiente }}
      />
      <div className="absolute inset-[22%] rounded-full bg-white" />
    </div>
  );

  const leyenda = (
    <div className="space-y-1.5 min-w-0">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center justify-between gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-slate-600 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: colores[i] }}
            />
            <span className="truncate">{label}</span>
          </span>
          <span className="font-bold text-slate-800 shrink-0">{etiquetasValor[i]}</span>
        </div>
      ))}
    </div>
  );

  if (vertical) {
    return (
      <div className="space-y-4">
        {dona}
        {leyenda}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5">
      {dona}
      {leyenda}
    </div>
  );
}
