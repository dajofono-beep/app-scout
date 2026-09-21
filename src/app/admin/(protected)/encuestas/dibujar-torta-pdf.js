import { PALETA } from "./grafico-torta";

const RADIO = 55;
const ALTO_LINEA_LEYENDA = 16;
const ANCHO_LEYENDA = 260;

// Dibuja una torta (arcos SVG vía doc.path) + referencia con
// porcentajes, arrancando en las 12 y en sentido horario — mismo
// criterio visual que el conic-gradient de GraficoTorta. Devuelve el Y
// donde terminó, para poder apilar la próxima torta debajo sin pisarla
// (las etiquetas de las opciones pueden ser largas, así que se evita
// ponerlas una al lado de la otra).
export function dibujarTortaPdf(doc, { x, y, titulo, datos }) {
  doc.fontSize(12).fillColor("#334155").text(titulo, x, y);
  const yContenido = y + 20;

  const cx = x + RADIO;
  const cy = yContenido + RADIO;
  const total = datos.reduce((acc, d) => acc + d.cantidad, 0);

  if (total <= 0) {
    doc.fontSize(10).fillColor("#94a3b8").text("Todavía no hay datos.", x, yContenido);
    return yContenido + 20;
  }

  let anguloInicio = -Math.PI / 2;
  datos.forEach((d, i) => {
    if (d.cantidad <= 0) return;
    const anguloBarrido = (d.cantidad / total) * 2 * Math.PI;
    const color = PALETA[i % PALETA.length];

    // Un arco SVG no puede recorrer una vuelta completa (el punto de
    // inicio y el de fin quedarían pegados) — si esta porción es el
    // 100%, se dibuja directamente como círculo entero.
    if (anguloBarrido >= 2 * Math.PI - 0.0001) {
      doc.circle(cx, cy, RADIO).fill(color);
      anguloInicio += anguloBarrido;
      return;
    }

    const anguloFin = anguloInicio + anguloBarrido;
    const x1 = cx + RADIO * Math.cos(anguloInicio);
    const y1 = cy + RADIO * Math.sin(anguloInicio);
    const x2 = cx + RADIO * Math.cos(anguloFin);
    const y2 = cy + RADIO * Math.sin(anguloFin);
    const arcoGrande = anguloBarrido > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${RADIO} ${RADIO} 0 ${arcoGrande} 1 ${x2} ${y2} Z`;
    doc.path(path).fill(color);
    anguloInicio = anguloFin;
  });

  const legendaX = x + RADIO * 2 + 25;
  let legendaY = yContenido;
  datos.forEach((d, i) => {
    const color = PALETA[i % PALETA.length];
    doc.rect(legendaX, legendaY + 2, 8, 8).fill(color);
    doc
      .fontSize(9)
      .fillColor("#475569")
      .text(
        `${d.etiqueta} · ${d.cantidad} (${((d.cantidad / total) * 100).toFixed(0)}%)`,
        legendaX + 14,
        legendaY,
        { width: ANCHO_LEYENDA }
      );
    legendaY = doc.y + 4;
  });

  return Math.max(yContenido + RADIO * 2, legendaY) + 20;
}
