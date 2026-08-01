"use client";

import { useMemo, useState } from "react";
import MovimientosTabs from "./movimientos-tabs";
import ListadoTabs from "./listado-tabs";
import LineaTiempoPagos from "./linea-tiempo-pagos";
import Torta3D from "./torta3d";

const PALETA_CATEGORICA = [
  "#2f80b8",
  "#6ab6e6",
  "#5b5f97",
  "#2ec4b6",
  "#8ecae6",
  "#3d5a80",
  "#7c9885",
  "#f2a541",
];

const quitarSufijoCuota = (concepto) =>
  concepto.replace(/\s*\(cuota \d+\/\d+\)$/, "");

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

function IconoFlecha({ direccion, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={
          direccion === "arriba"
            ? "M12 19V5m0 0l-6 6m6-6l6 6"
            : "M12 5v14m0 0l-6-6m6 6l6-6"
        }
      />
    </svg>
  );
}

function IconoComprobante({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

// Estilo visual (ícono, color, chip de estado) de cada movimiento según
// si es un cargo o un pago, y su estado.
function estiloMovimiento(m) {
  if (m.tipo === "cargo") {
    if (m.estado === "cancelado") {
      return {
        iconoClase: "bg-gray-100 text-gray-400",
        montoClase: "text-gray-400 line-through",
        badge: { texto: "Cancelado", clase: "bg-gray-100 text-gray-500" },
      };
    }
    // Un cargo con importe negativo es un descuento o corrección puntual:
    // resta deuda en vez de sumarla, así que se muestra como un crédito.
    if (m.importe < 0) {
      return {
        iconoClase: "bg-emerald-50 text-emerald-500",
        montoClase: "text-emerald-600",
        badge: null,
      };
    }
    return {
      iconoClase: "bg-red-50 text-red-500",
      montoClase: "text-red-500",
      badge: null,
    };
  }

  if (m.estado === "cancelado") {
    return {
      iconoClase: "bg-gray-100 text-gray-400",
      montoClase: "text-gray-400 line-through",
      badge: { texto: "Cancelado", clase: "bg-gray-100 text-gray-500" },
    };
  }
  if (m.estado === "pendiente") {
    return {
      iconoClase: "bg-amber-50 text-amber-500",
      montoClase: "text-amber-600",
      badge: { texto: "Pendiente", clase: "bg-amber-50 text-amber-700" },
    };
  }
  return {
    iconoClase: "bg-emerald-50 text-emerald-500",
    montoClase: "text-emerald-600",
    badge: { texto: "Acreditado", clase: "bg-emerald-50 text-emerald-700" },
  };
}

// cargos/pagosConComprobante: de TODOS los hermanos, ya traídos por el
// servidor (sin queries nuevas acá). Este componente filtra por hermano
// y recalcula todo lo que se ve dentro de "Movimientos" en el navegador,
// para que el filtro responda al instante sin recargar la página.
export default function MovimientosPanel({
  cargos,
  pagosConComprobante,
  familiares,
  hoyIso,
}) {
  const esFamiliaConVarios = familiares.length > 1;
  const [hermanoFiltro, setHermanoFiltro] = useState("todos");

  const nombrePorId = useMemo(
    () => Object.fromEntries(familiares.map((m) => [m.id, `${m.apellido}, ${m.nombre}`])),
    [familiares]
  );

  const datos = useMemo(() => {
    const cargosFiltrados =
      hermanoFiltro === "todos"
        ? cargos
        : cargos.filter((c) => c.miembro_id === hermanoFiltro);
    const pagosFiltrados =
      hermanoFiltro === "todos"
        ? pagosConComprobante
        : pagosConComprobante.filter((p) => p.miembro_id === hermanoFiltro);

    const cargosActivos = cargosFiltrados.filter((c) => c.estado === "activo");
    const totalCargos = cargosActivos.reduce((acc, c) => acc + Number(c.importe), 0);
    const pagadoTotal = pagosFiltrados
      .filter((p) => p.estado_efectivo === "acreditado")
      .reduce((acc, p) => acc + Number(p.importe), 0);
    const pendienteTotal = pagosFiltrados
      .filter((p) => p.estado_efectivo === "pendiente")
      .reduce((acc, p) => acc + Number(p.importe), 0);
    const pagosRealizados = pagadoTotal + pendienteTotal;
    const pagosLinea = pagosFiltrados
      .filter((p) => p.estado_efectivo === "acreditado" || p.estado_efectivo === "pendiente")
      .map((p) => ({
        id: p.id,
        estado: p.estado_efectivo,
        importe: Number(p.importe),
        fecha: p.fecha_pago,
      }));

    // Cada concepto se ordena por su vencimiento más próximo, para que la
    // composición muestre primero lo que hay que pagar antes.
    const porConcepto = new Map();
    for (const c of cargosActivos) {
      const label = quitarSufijoCuota(c.concepto);
      const fechaOrden = c.fecha_vencimiento || c.fecha;
      const actual = porConcepto.get(label);
      if (actual) {
        actual.importe += Number(c.importe);
        if (fechaOrden < actual.fechaOrden) actual.fechaOrden = fechaOrden;
      } else {
        porConcepto.set(label, { importe: Number(c.importe), fechaOrden });
      }
    }
    const entradasConcepto = [...porConcepto.entries()].sort((a, b) =>
      a[1].fechaOrden < b[1].fechaOrden ? -1 : a[1].fechaOrden > b[1].fechaOrden ? 1 : 0
    );
    const datosDetalle = {
      titulo: "Composición de los cargos por concepto",
      labels: entradasConcepto.map(([label]) => label),
      valores: entradasConcepto.map(([, v]) => v.importe),
      colores: entradasConcepto.map((_, i) => PALETA_CATEGORICA[i % PALETA_CATEGORICA.length]),
    };
    const colorPorConcepto = Object.fromEntries(
      entradasConcepto.map(([label], i) => [label, PALETA_CATEGORICA[i % PALETA_CATEGORICA.length]])
    );
    const conceptosLinea = entradasConcepto.map(([label, v]) => ({
      label,
      importe: v.importe,
      fechaOrden: v.fechaOrden,
    }));

    const movimientos = [
      ...cargosActivos.map((c) => ({
        tipo: "cargo",
        id: `cargo-${c.id}`,
        miembro_id: c.miembro_id,
        fecha: c.fecha,
        fechaOrden: c.fecha,
        titulo: c.concepto,
        importe: c.importe,
        estado: c.estado,
        porcentaje_aplicado: c.porcentaje_aplicado,
        comprobante_href: null,
      })),
      ...pagosFiltrados.map((p) => ({
        tipo: "pago",
        id: `pago-${p.id}`,
        miembro_id: p.miembro_id,
        fecha: p.fecha_pago,
        fechaOrden: p.fecha_pago,
        titulo: p.medio_pago ? `Pago (${p.medio_pago})` : "Pago",
        importe: p.importe,
        estado: p.estado_efectivo,
        porcentaje_aplicado: null,
        comprobante_href: p.comprobante_href,
      })),
      // Del más reciente al más viejo: lo último cargado o pagado queda arriba.
    ].sort((a, b) => (a.fechaOrden > b.fechaOrden ? -1 : a.fechaOrden < b.fechaOrden ? 1 : 0));

    return {
      totalCargos,
      pagosRealizados,
      pagosLinea,
      datosDetalle,
      colorPorConcepto,
      conceptosLinea,
      movimientos,
    };
  }, [cargos, pagosConComprobante, hermanoFiltro]);

  function renderMovimientos(lista, mensajeVacio) {
    return (
      <section className="space-y-2.5">
        {lista.map((m) => {
          const estilo = estiloMovimiento(m);
          return (
            <div
              key={m.id}
              className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3"
            >
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${estilo.iconoClase}`}
              >
                <IconoFlecha
                  direccion={m.tipo === "pago" ? "arriba" : "abajo"}
                  className="w-5 h-5"
                />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">
                  {m.titulo}
                  {m.porcentaje_aplicado != null && (
                    <span className="text-xs text-amber-700 font-normal">
                      {" "}
                      · {m.porcentaje_aplicado}%
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  {m.fecha}
                  {hermanoFiltro === "todos" &&
                    esFamiliaConVarios &&
                    ` · ${nombrePorId[m.miembro_id]}`}
                </p>
              </div>
              {m.comprobante_href && (
                <a
                  href={m.comprobante_href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver comprobante"
                  className="shrink-0 text-slate-400 hover:text-sky-600"
                >
                  <IconoComprobante className="w-5 h-5" />
                </a>
              )}
              <div className="text-right shrink-0">
                <p className={`font-bold ${estilo.montoClase}`}>
                  {m.tipo === "cargo" ? (m.importe < 0 ? "+" : "-") : "+"}
                  {formatoMoneda(Math.abs(m.importe))}
                </p>
                {estilo.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${estilo.badge.clase}`}
                  >
                    {estilo.badge.texto}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {lista.length === 0 && <p className="text-slate-500 text-sm">{mensajeVacio}</p>}
      </section>
    );
  }

  const panelListado = (
    <ListadoTabs
      panelTodos={renderMovimientos(datos.movimientos, "Todavía no hay movimientos.")}
      panelCargos={renderMovimientos(
        datos.movimientos.filter((m) => m.tipo === "cargo"),
        "Todavía no hay cargos."
      )}
      panelPagos={renderMovimientos(
        datos.movimientos.filter((m) => m.tipo === "pago"),
        "Todavía no hay pagos."
      )}
    />
  );

  const panelCobertura = (
    <LineaTiempoPagos
      key={hermanoFiltro}
      conceptos={datos.conceptosLinea}
      colorPorConcepto={datos.colorPorConcepto}
      totalCargos={datos.totalCargos}
      pagosLinea={datos.pagosLinea}
      pagosRealizados={datos.pagosRealizados}
      hoyIso={hoyIso}
    />
  );

  return (
    <div>
      {esFamiliaConVarios && (
        <div className="mb-3">
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Mostrar
          </label>
          <select
            value={hermanoFiltro}
            onChange={(e) => setHermanoFiltro(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-sm font-semibold text-slate-700"
          >
            <option value="todos">Todos</option>
            {familiares.map((f) => (
              <option key={f.id} value={f.id}>
                {f.apellido}, {f.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      <MovimientosTabs
        panelListado={panelListado}
        panelCobertura={panelCobertura}
        panelDetalle={<Torta3D {...datos.datosDetalle} />}
      />
    </div>
  );
}
