export const PALETA = [
  "#0284c7", // sky-600
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#8b5cf6", // violet-500
  "#f43f5e", // rose-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#64748b", // slate-500
];

// Torta simple (sin animación) para los resultados de Administración:
// recibe pares {etiqueta, cantidad} y arma el conic-gradient + una
// referencia con el porcentaje de cada porción.
export default function GraficoTorta({ titulo, datos }) {
  const total = datos.reduce((acc, d) => acc + d.cantidad, 0);

  if (total <= 0) {
    return (
      <div>
        {titulo && <p className="text-sm font-semibold text-slate-600 mb-2">{titulo}</p>}
        <p className="text-xs text-slate-400">Todavía no hay datos para mostrar.</p>
      </div>
    );
  }

  let acumulado = 0;
  const paradas = datos.map((d, i) => {
    const inicio = (acumulado / total) * 100;
    acumulado += d.cantidad;
    const fin = (acumulado / total) * 100;
    return { color: PALETA[i % PALETA.length], inicio, fin };
  });
  const gradiente = `conic-gradient(${paradas
    .map((p) => `${p.color} ${p.inicio}% ${p.fin}%`)
    .join(", ")})`;

  return (
    <div>
      {titulo && <p className="text-sm font-semibold text-slate-600 mb-2">{titulo}</p>}
      <div className="flex items-center gap-4">
        <div
          className="w-32 h-32 rounded-full shrink-0"
          style={{ background: gradiente }}
        />
        <div className="space-y-1 min-w-0">
          {datos.map((d, i) => (
            <div key={d.etiqueta} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: PALETA[i % PALETA.length] }}
              />
              <span className="truncate">
                {d.etiqueta} · {d.cantidad} ({((d.cantidad / total) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
