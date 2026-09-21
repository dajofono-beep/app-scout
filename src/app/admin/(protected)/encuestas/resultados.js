// Cálculo de resultados de una encuesta, compartido entre la ficha de
// Administración y la exportación a PDF (para no tener la misma lógica
// duplicada en dos lugares).
const ETIQUETA_TIPO_DESTINATARIO = {
  todos: "Todos",
  rama: "Rama",
  familia: "Hermanos",
  miembro: "Participante",
};

export function armarResultados({ encuesta, miembros, familias, ramas, respuestas }) {
  const nombreFamilia = Object.fromEntries((familias ?? []).map((f) => [f.id, f.nombre]));
  const nombreRama = Object.fromEntries((ramas ?? []).map((r) => [r.id, r.nombre]));
  const nombreMiembro = (m) => `${m.apellido}, ${m.nombre}`;
  const nombrePorMiembroId = Object.fromEntries(
    (miembros ?? []).map((m) => [m.id, nombreMiembro(m)])
  );

  const destinatarioTexto =
    encuesta.destinatario_tipo === "todos"
      ? "Todos"
      : `${ETIQUETA_TIPO_DESTINATARIO[encuesta.destinatario_tipo]}: ${
          (encuesta.destinatario_tipo === "rama"
            ? nombreRama[encuesta.destinatario_id]
            : encuesta.destinatario_tipo === "familia"
              ? nombreFamilia[encuesta.destinatario_id]
              : nombrePorMiembroId[encuesta.destinatario_id]) ?? "—"
        }`;

  // A quién le corresponde esta encuesta, igual criterio que en Mensajes.
  const audiencia = (miembros ?? []).filter(
    (m) =>
      m.activo &&
      (encuesta.destinatario_tipo === "todos" ||
        (encuesta.destinatario_tipo === "rama" && m.rama_id === encuesta.destinatario_id) ||
        (encuesta.destinatario_tipo === "familia" &&
          m.familia_id === encuesta.destinatario_id) ||
        (encuesta.destinatario_tipo === "miembro" && m.id === encuesta.destinatario_id))
  );

  // Grupos esperados: uno por chico, o uno por familia (agrupando a los
  // que no tienen familia asignada como un grupo de una sola persona).
  // Para el grupo "familia", la rama que se muestra es la del primer
  // hermano encontrado — una familia puede tener chicos en más de una
  // rama, pero alcanza como referencia para ordenar/filtrar resultados.
  const grupos = new Map();
  for (const m of audiencia) {
    const clave =
      encuesta.alcance_respuesta === "familia" ? (m.familia_id ?? `solo-${m.id}`) : m.id;
    if (!grupos.has(clave)) {
      grupos.set(clave, {
        clave,
        nombre:
          encuesta.alcance_respuesta === "familia" && m.familia_id
            ? (nombreFamilia[m.familia_id] ?? "—")
            : nombreMiembro(m),
        ramaNombre: nombreRama[m.rama_id] ?? "—",
      });
    }
  }

  // Mismo criterio de "solo-<id>": si esta respuesta se guardó por
  // miembro_id (porque esa familia no tiene familia_id asignada), hay
  // que buscarla con esa misma clave.
  const clavesQueRespondieron = new Set(
    (respuestas ?? []).map((r) =>
      encuesta.alcance_respuesta === "familia"
        ? (r.familia_id ?? `solo-${r.miembro_id}`)
        : r.miembro_id
    )
  );

  const respondieron = [];
  const faltan = [];
  for (const g of grupos.values()) {
    (clavesQueRespondieron.has(g.clave) ? respondieron : faltan).push(g);
  }
  const porRamaYNombre = (a, b) =>
    a.ramaNombre.localeCompare(b.ramaNombre) || a.nombre.localeCompare(b.nombre);
  respondieron.sort(porRamaYNombre);
  faltan.sort(porRamaYNombre);

  const respuestaPorClave = new Map(
    (respuestas ?? []).map((r) => [
      encuesta.alcance_respuesta === "familia"
        ? (r.familia_id ?? `solo-${r.miembro_id}`)
        : r.miembro_id,
      r.respuesta,
    ])
  );

  const conteoOpciones =
    encuesta.tipo_respuesta === "opcion_unica"
      ? (encuesta.opciones ?? []).map((o) => ({
          etiqueta: o,
          cantidad: (respuestas ?? []).filter((r) => r.respuesta === o).length,
        }))
      : null;

  const conteoPorRama = Object.values(
    respondieron.reduce((acc, g) => {
      acc[g.ramaNombre] = acc[g.ramaNombre] ?? { etiqueta: g.ramaNombre, cantidad: 0 };
      acc[g.ramaNombre].cantidad += 1;
      return acc;
    }, {})
  );

  const participantes = respondieron.map((g) => ({
    ...g,
    respuesta: respuestaPorClave.get(g.clave),
  }));

  return {
    grupos,
    respondieron,
    faltan,
    conteoOpciones,
    conteoPorRama,
    participantes,
    destinatarioTexto,
  };
}
