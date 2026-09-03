const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const formatoEje = (n) =>
  n === 0 ? "$ 0" : `$ ${Math.round(n).toLocaleString("es-AR")}`;

// Redondea el máximo del eje Y a un número "prolijo" (1/2/5 × potencia
// de 10), para que las líneas de la grilla no queden en valores raros.
function calcularEscala(maxValor) {
  if (maxValor <= 0) return 100000;
  const magnitud = Math.pow(10, Math.floor(Math.log10(maxValor)));
  const normalizado = maxValor / magnitud;
  const escalon = normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 5 ? 5 : 10;
  return escalon * magnitud;
}

// Barras apiladas (cobrado + pendiente) por mes, con una línea que
// traza el total. Armado a mano con SVG, sin librería de gráficos.
export default function CobranzaMensualChart({ meses }) {
  const maxTotal = Math.max(...meses.map((m) => m.cobrado + m.pendiente), 0);
  const escalaMax = calcularEscala(maxTotal);
  const pasos = [0, 0.25, 0.5, 0.75, 1].map((f) => escalaMax * f);

  const alto = 175;
  const abajo = 145;
  const arriba = 10;
  const izquierda = 85;
  const anchoGrupo = 70;
  const derecha = izquierda + anchoGrupo * meses.length;
  const anchoTotal = derecha + 20;
  const anchoBarra = Math.min(36, anchoGrupo * 0.45);

  const y = (v) => abajo - (v / escalaMax) * (abajo - arriba);
  const xCentro = (i) => izquierda + anchoGrupo * (i + 0.5);

  const puntosLinea = meses
    .map((m, i) => `${xCentro(i)},${y(m.cobrado + m.pendiente)}`)
    .join(" ");

  return (
    <div>
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-600" /> Cobrado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-200" /> Pendiente
        </span>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${anchoTotal} ${alto}`}
          width={anchoTotal}
          height={alto}
          role="img"
          aria-label={`Cobranza de los últimos ${meses.length} meses, cobrado y pendiente por mes`}
        >
          {pasos.map((p) => (
            <g key={p}>
              <line
                x1={izquierda}
                x2={derecha}
                y1={y(p)}
                y2={y(p)}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text x={izquierda - 8} y={y(p) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                {formatoEje(p)}
              </text>
            </g>
          ))}

          {meses.map((m, i) => {
            const alturaCobrado = (m.cobrado / escalaMax) * (abajo - arriba);
            const alturaPendiente = (m.pendiente / escalaMax) * (abajo - arriba);
            const x = xCentro(i) - anchoBarra / 2;
            return (
              <g key={m.label}>
                <rect
                  x={x}
                  y={abajo - alturaCobrado}
                  width={anchoBarra}
                  height={alturaCobrado}
                  fill="#0284c7"
                  rx="2"
                />
                <rect
                  x={x}
                  y={abajo - alturaCobrado - alturaPendiente}
                  width={anchoBarra}
                  height={alturaPendiente}
                  fill="#bae6fd"
                  rx="2"
                />
                <text
                  x={xCentro(i)}
                  y={abajo + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                >
                  {MESES_CORTOS[m.mes]}
                </text>
              </g>
            );
          })}

          <polyline points={puntosLinea} fill="none" stroke="#0369a1" strokeWidth="2" />
          {meses.map((m, i) => (
            <circle
              key={m.label}
              cx={xCentro(i)}
              cy={y(m.cobrado + m.pendiente)}
              r="3.5"
              fill="#0369a1"
              stroke="white"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
