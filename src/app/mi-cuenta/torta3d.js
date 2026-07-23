const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

// Torta "3D" hecha con dos círculos apilados (uno oscurecido y desplazado
// para simular el lateral) más un conic-gradient. No requiere JS ni canvas.
export default function Torta3D({ titulo, labels, valores, colores }) {
  const total = valores.reduce((a, b) => a + b, 0);

  if (total <= 0) {
    return <p className="text-gray-500 text-sm">Todavía no hay datos para mostrar.</p>;
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
    .map(
      (label, i) =>
        `${label}: ${formatoMoneda(valores[i])}, ${((valores[i] / total) * 100).toFixed(1)} por ciento`
    )
    .join(". ");

  return (
    <div>
      {titulo && <p className="text-center text-sm text-gray-500 mb-3">{titulo}</p>}
      <div className="relative w-[220px] h-[165px] mx-auto mb-4">
        <div
          className="absolute top-4 left-0 w-[220px] h-[140px] rounded-full"
          style={{ background: gradiente, transform: "scaleY(0.62)", filter: "brightness(0.55)" }}
        />
        <div
          role="img"
          aria-label={descripcion}
          className="absolute top-0 left-0 w-[220px] h-[140px] rounded-full shadow-lg"
          style={{ background: gradiente, transform: "scaleY(0.62)" }}
        />
        <div
          className="absolute top-0 left-0 w-[220px] h-[140px] rounded-full pointer-events-none"
          style={{
            transform: "scaleY(0.62)",
            background:
              "radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.35), transparent 55%)",
          }}
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-sm text-gray-600">
        {labels.map((label, i) => (
          <span key={label} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: colores[i] }}
            />
            {label} · {formatoMoneda(valores[i])} ({((valores[i] / total) * 100).toFixed(1)}%)
          </span>
        ))}
      </div>
    </div>
  );
}
