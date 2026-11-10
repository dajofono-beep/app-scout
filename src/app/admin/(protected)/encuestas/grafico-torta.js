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

// Color propio de cada rama (el de su identidad scout). Se busca por
// palabra clave para tolerar variantes del nombre ("Unidad Scout", "Unidad").
const COLORES_RAMA = [
  ["manada", "#facc15"], // amarillo
  ["unidad", "#16a34a"], // verde
  ["caminante", "#38bdf8"], // celeste
  ["rover", "#dc2626"], // rojo
  ["adulto", "#7c3aed"], // violeta
];
const COLOR_RAMA_OTRA = "#94a3b8"; // slate-400, p. ej. "Sin rama"

function colorDeRama(nombre) {
  const n = String(nombre ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return COLORES_RAMA.find(([clave]) => n.includes(clave))?.[1] ?? COLOR_RAMA_OTRA;
}

// Color de la porción `i`: por rama si el gráfico es de ramas, o el
// siguiente de la paleta general (opciones de una encuesta).
export function colorDePorcion(d, i, porRama) {
  return porRama ? colorDeRama(d.etiqueta) : PALETA[i % PALETA.length];
}

// Torta simple (sin animación) para los resultados de Administración:
// recibe pares {etiqueta, cantidad} y arma el conic-gradient + una
// referencia con el porcentaje de cada porción.
export default function GraficoTorta({ titulo, datos, porRama = false }) {
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
    return { color: colorDePorcion(d, i, porRama), inicio, fin };
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
                style={{ background: colorDePorcion(d, i, porRama) }}
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
