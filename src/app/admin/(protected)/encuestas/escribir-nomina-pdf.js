const COLUMNAS = 3;
const ALTO_FILA = 14;

// Nómina agrupada por rama y en columnas (en vez de un nombre por
// línea) para no desperdiciar el ancho de la hoja ni gastar tantas
// páginas con listas largas (p. ej. "Faltan" con 60 personas). Devuelve
// el Y donde terminó, para poder seguir escribiendo debajo (otra
// nómina, etc.).
export function escribirNominaPdf(doc, { x, y, anchoTexto, titulo, grupos, color }) {
  const margenInferior = doc.page.height - doc.page.margins.bottom;

  function saltoDePagina(alturaNecesaria) {
    if (y + alturaNecesaria > margenInferior) {
      doc.addPage();
      y = doc.page.margins.top;
    }
  }

  saltoDePagina(20);
  doc.fontSize(13).fillColor("#0f172a").text(`${titulo} (${grupos.length})`, x, y);
  y = doc.y + 8;

  const porRama = new Map();
  for (const g of grupos) {
    if (!porRama.has(g.ramaNombre)) porRama.set(g.ramaNombre, []);
    porRama.get(g.ramaNombre).push(g);
  }

  const anchoColumna = anchoTexto / COLUMNAS;

  for (const [ramaNombre, integrantes] of porRama) {
    saltoDePagina(ALTO_FILA + 6);
    doc.fontSize(10).fillColor("#0f172a").text(ramaNombre, x, y);
    y = doc.y + 2;

    for (let i = 0; i < integrantes.length; i += COLUMNAS) {
      saltoDePagina(ALTO_FILA);
      const fila = integrantes.slice(i, i + COLUMNAS);
      fila.forEach((g, col) => {
        doc
          .fontSize(9)
          .fillColor(color)
          .text(g.nombre, x + col * anchoColumna, y, {
            width: anchoColumna - 10,
            height: ALTO_FILA,
            ellipsis: true,
          });
      });
      y += ALTO_FILA;
    }
    y += 6;
  }

  return y;
}
