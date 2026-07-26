const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

// Barra horizontal de progreso. Sin `total`, los segmentos suman el
// 100% del ancho (como una torta, pero en barra). Con `total` (un
// denominador mayor a la suma de `valores`), la barra entera se
// angosta a esa proporción: por ejemplo, si los cargos suman $10 y lo
// abonado hasta ahora suma $5, la barra ocupa la mitad del ancho
// disponible, no un 100% con un tramo "vacío" pintado de otro color.
// `colores[i]` en null/undefined = esa entrada no se pinta en la
// barra, solo aparece informada en la referencia de abajo.
export default function BarraProgreso({ titulo, labels, valores, colores, total }) {
  // Solo las entradas con color cuentan para el ancho de la barra: una
  // entrada sin color (como "Adeudado") es informativa, no ocupa lugar.
  const sumaColoreada = valores.reduce((acc, v, i) => (colores[i] ? acc + v : acc), 0);
  const totalReal = total ?? valores.reduce((a, b) => a + b, 0);

  if (totalReal <= 0) {
    return <p className="text-gray-500 text-sm">Todavía no hay datos para mostrar.</p>;
  }

  const anchoBarra = Math.min((sumaColoreada / totalReal) * 100, 100);

  const descripcion = labels
    .map(
      (label, i) =>
        `${label}: ${formatoMoneda(valores[i])}, ${((valores[i] / totalReal) * 100).toFixed(1)} por ciento del total`
    )
    .join(". ");

  return (
    <div>
      {titulo && <p className="text-center text-sm text-slate-500 mb-3">{titulo}</p>}
      <div className="w-full h-6">
        <div
          role="img"
          aria-label={descripcion}
          className="h-full rounded-full overflow-hidden flex"
          style={{ width: `${anchoBarra}%` }}
        >
          {labels.map((label, i) => {
            if (!colores[i] || sumaColoreada <= 0) return null;
            const pct = (valores[i] / sumaColoreada) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={label}
                style={{ width: `${pct}%`, background: colores[i] }}
                title={`${label}: ${formatoMoneda(valores[i])}`}
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-sm text-slate-600 mt-3">
        {labels.map((label, i) => (
          <span key={label} className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-sm shrink-0 ${colores[i] ? "" : "border-2 border-slate-300"}`}
              style={colores[i] ? { background: colores[i] } : undefined}
            />
            {label} · {formatoMoneda(valores[i])} ({((valores[i] / totalReal) * 100).toFixed(1)}%)
          </span>
        ))}
      </div>
    </div>
  );
}
