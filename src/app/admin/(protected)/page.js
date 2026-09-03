import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calcularVencimientos } from "@/app/mi-cuenta/proximo-vencimiento";
import MasInformacionResumen from "./mas-informacion-resumen";
import DonutChart from "./donut-chart";
import SituacionCobranza from "./situacion-cobranza";
import CobranzaMensualCard from "./cobranza-mensual-card";
import { calcularProximosVencimientos } from "./calcular-proximos-vencimientos";
import { calcularFamiliasAlDia } from "./calcular-familias-al-dia";
import ActividadReciente from "./actividad-reciente";

const COLOR_RAMA = {
  Manada: { dot: "bg-yellow-400", hex: "#facc15", chip: "bg-yellow-50 text-yellow-700", ring: "ring-yellow-400" },
  "Unidad Scout": {
    dot: "bg-green-400",
    hex: "#4ade80",
    chip: "bg-green-50 text-green-700",
    ring: "ring-green-400",
  },
  Caminantes: { dot: "bg-sky-400", hex: "#38bdf8", chip: "bg-sky-50 text-sky-700", ring: "ring-sky-400" },
  Rovers: { dot: "bg-red-400", hex: "#f87171", chip: "bg-red-50 text-red-700", ring: "ring-red-400" },
  Adultos: {
    dot: "bg-violet-400",
    hex: "#a78bfa",
    chip: "bg-violet-50 text-violet-700",
    ring: "ring-violet-400",
  },
};
const COLOR_DEFAULT = {
  dot: "bg-slate-400",
  hex: "#94a3b8",
  chip: "bg-slate-50 text-slate-700",
  ring: "ring-slate-400",
};
const COLORES_MEDIOS_PAGO = ["#0284c7", "#38bdf8", "#7dd3fc", "#bae6fd"];

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export default async function AdminDashboardPage({ searchParams }) {
  const params = await searchParams;
  const ramaSeleccionada = params?.rama_id ?? "";

  const supabase = await createClient();

  const { data: ramas } = await supabase.from("ramas").select("*").order("orden");

  const { data: miembrosActivos } = await supabase
    .from("miembros")
    .select("id, nombre, apellido, rama_id, familia_id, created_at, ramas(nombre)")
    .eq("activo", true);

  const totalMiembros = miembrosActivos?.length ?? 0;

  // Aproximación de "vs. mes anterior": cuántos de los miembros
  // activos de hoy ya existían antes de este mes. No contempla bajas
  // (no hay un registro histórico de eso), pero da una tendencia útil
  // sin necesitar una tabla nueva.
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const miembrosMesAnterior = (miembrosActivos ?? []).filter(
    (m) => new Date(m.created_at) < inicioMes
  ).length;
  const diferenciaMiembros = totalMiembros - miembrosMesAnterior;

  const porRama = (ramas ?? []).map((r) => ({
    ...r,
    cantidad: (miembrosActivos ?? []).filter((m) => m.rama_id === r.id).length,
  }));

  const ramaActual = ramaSeleccionada
    ? (ramas ?? []).find((r) => r.id === ramaSeleccionada)
    : null;

  const idsFiltrados = (miembrosActivos ?? [])
    .filter((m) => !ramaSeleccionada || m.rama_id === ramaSeleccionada)
    .map((m) => m.id);

  const { data: saldos } = await supabase
    .from("saldos_miembros")
    .select("miembro_id, saldo, total_pagos_acreditados, total_pagos_pendientes");

  const idsFiltradosSet = new Set(idsFiltrados);
  const saldosFiltrados = (saldos ?? []).filter((s) => idsFiltradosSet.has(s.miembro_id));

  const totalSaldo = saldosFiltrados.reduce((acc, s) => acc + Number(s.saldo), 0);
  const totalPendiente = saldosFiltrados.reduce(
    (acc, s) => acc + Number(s.total_pagos_pendientes),
    0
  );
  const totalAcreditado = saldosFiltrados.reduce(
    (acc, s) => acc + Number(s.total_pagos_acreditados),
    0
  );

  const infoPorId = Object.fromEntries(
    (miembrosActivos ?? []).map((m) => [
      m.id,
      { nombre: `${m.apellido}, ${m.nombre}`, rama: m.ramas?.nombre },
    ])
  );

  const ranking = saldosFiltrados
    .filter((s) => infoPorId[s.miembro_id])
    .map((s) => ({ ...s, ...infoPorId[s.miembro_id] }));

  const menosDeuda = [...ranking].sort((a, b) => Number(a.saldo) - Number(b.saldo)).slice(0, 5);
  const masDeuda = [...ranking].sort((a, b) => Number(b.saldo) - Number(a.saldo)).slice(0, 5);

  let pagosFiltrados = [];
  let cargosFiltrados = [];
  if (idsFiltrados.length > 0) {
    const { data: dataPagos } = await supabase
      .from("estado_pagos")
      .select("*, miembros(nombre, apellido, ramas(nombre))")
      .in("miembro_id", idsFiltrados)
      .order("fecha_pago", { ascending: false })
      .order("created_at", { ascending: false });
    pagosFiltrados = dataPagos ?? [];

    const { data: dataCargos } = await supabase
      .from("cargos")
      .select("id, miembro_id, producto_id, concepto, importe, estado, fecha, fecha_vencimiento")
      .in("miembro_id", idsFiltrados);
    cargosFiltrados = dataCargos ?? [];
  }
  // "Actividad reciente": los últimos pagos registrados, ordenados por
  // el momento real en que se cargaron (no por la fecha de pago que
  // eligió la familia, que puede ser de días atrás). Se traen hasta 10
  // — el máximo que ofrece el desplegable de "Actividad reciente".
  const actividadReciente = [...pagosFiltrados]
    .sort((a, b) => (b.created_at < a.created_at ? -1 : 1))
    .slice(0, 10);

  const pagosPendientesCount = pagosFiltrados.filter(
    (p) => p.estado_efectivo === "pendiente"
  ).length;

  const pagosAcreditadosFiltrados = pagosFiltrados.filter(
    (p) => p.estado_efectivo === "acreditado"
  );

  const acreditadoPorMedio = {};
  for (const p of pagosAcreditadosFiltrados) {
    const medio = p.medio_pago || "Sin especificar";
    acreditadoPorMedio[medio] = (acreditadoPorMedio[medio] ?? 0) + Number(p.importe);
  }
  const acreditadoPorMedioOrdenado = Object.entries(acreditadoPorMedio).sort(
    (a, b) => b[1] - a[1]
  );
  const totalAcreditadoPorMedio = acreditadoPorMedioOrdenado.reduce(
    (acc, [, monto]) => acc + monto,
    0
  );

  // Últimos 10 meses (incluyendo el actual), cobrado vs. pendiente de
  // acreditación por mes, según la fecha del pago. Se traen 10 —
  // el máximo que ofrece el desplegable de la tarjeta — y el
  // componente cliente recorta a los últimos 3/6/10 según lo elegido.
  const hoy = new Date();
  const cobranzaMensual = Array.from({ length: 10 }, (_, i) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - (9 - i), 1);
    const anio = fecha.getFullYear();
    const mes = fecha.getMonth();
    const pagosDelMes = pagosFiltrados.filter((p) => {
      const [a, m] = p.fecha_pago.split("-").map(Number);
      return a === anio && m - 1 === mes;
    });
    const cobrado = pagosDelMes
      .filter((p) => p.estado_efectivo === "acreditado")
      .reduce((acc, p) => acc + Number(p.importe), 0);
    const pendiente = pagosDelMes
      .filter((p) => p.estado_efectivo === "pendiente")
      .reduce((acc, p) => acc + Number(p.importe), 0);
    return { label: `${anio}-${mes}`, anio, mes, cobrado, pendiente };
  });

  const { data: productosVencimiento } = await supabase
    .from("productos")
    .select("id, nombre, fecha_vencimiento, alerta_vencimiento");

  const familiaIdPorMiembro = Object.fromEntries(
    (miembrosActivos ?? []).map((m) => [m.id, m.familia_id])
  );
  const nombrePorIdSimple = Object.fromEntries(
    (miembrosActivos ?? []).map((m) => [m.id, `${m.apellido}, ${m.nombre}`])
  );

  const vencimientosFiltrados = calcularVencimientos({
    familiares: idsFiltrados.map((id) => ({ id })),
    cargos: cargosFiltrados,
    pagosAcreditados: pagosAcreditadosFiltrados,
    productos: productosVencimiento ?? [],
    nombrePorId: nombrePorIdSimple,
    hoyIso: new Date().toISOString().slice(0, 10),
  });

  const familiasEnRiesgo = new Set(
    vencimientosFiltrados.map((v) => familiaIdPorMiembro[v.miembroId] ?? v.miembroId)
  ).size;

  const hoyIso = hoy.toISOString().slice(0, 10);
  const proximosVencimientos = calcularProximosVencimientos({
    miembroIds: idsFiltrados,
    cargos: cargosFiltrados,
    pagosAcreditados: pagosAcreditadosFiltrados,
    productos: productosVencimiento ?? [],
    familiaIdPorMiembro,
    hoyIso,
  }).slice(0, 4);

  const { totalFamilias, familiasAlDia, familiasConDeuda } = calcularFamiliasAlDia({
    miembroIds: idsFiltrados,
    cargos: cargosFiltrados,
    pagosAcreditados: pagosAcreditadosFiltrados,
    familiaIdPorMiembro,
    hoyIso,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Resumen</h1>
      <p className="text-sm text-slate-400 mb-6">
        Mostrando: {ramaActual ? ramaActual.nombre : "Todo el grupo"}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-4">
        <Link
          href="/admin"
          className={`bg-white rounded-2xl shadow-sm p-5 block lg:col-span-1 ${
            !ramaSeleccionada ? "ring-2 ring-sky-500" : ""
          }`}
        >
          <p className="text-sm font-bold text-sky-700">Miembros totales</p>
          <p className="text-3xl font-bold text-slate-800">{totalMiembros}</p>
          {diferenciaMiembros !== 0 && (
            <p
              className={`text-xs font-semibold mt-1 ${
                diferenciaMiembros > 0 ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {diferenciaMiembros > 0 ? "↗" : "↘"} {diferenciaMiembros > 0 ? "+" : ""}
              {diferenciaMiembros} vs. mes anterior
            </p>
          )}
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-5 lg:col-span-2">
          <p className="text-sm font-bold text-sky-700 mb-3">Participación por rama</p>
          <DonutChart
            labels={porRama.map((r) => r.nombre)}
            valores={porRama.map((r) => r.cantidad)}
            colores={porRama.map((r) => (COLOR_RAMA[r.nombre] ?? COLOR_DEFAULT).hex)}
            etiquetasValor={porRama.map((r) => String(r.cantidad))}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 lg:col-span-3">
          <p className="text-sm font-bold text-sky-700 mb-3">Filtrar por rama</p>
          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/admin"
              className={`text-sm font-semibold px-3 py-2 rounded-full border text-center ${
                !ramaSeleccionada
                  ? "bg-sky-600 border-sky-600 text-white"
                  : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              Todas
            </Link>
            {(ramas ?? []).map((r) => {
              const activa = ramaSeleccionada === r.id;
              return (
                <Link
                  key={r.id}
                  href={`/admin?rama_id=${r.id}`}
                  className={`text-sm font-semibold px-3 py-2 rounded-full border text-center ${
                    activa
                      ? "bg-sky-600 border-sky-600 text-white"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  {r.nombre}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-4 lg:items-stretch">
        <div className="lg:col-span-3">
          <SituacionCobranza
            totalAcreditado={totalAcreditado}
            totalPendiente={totalPendiente}
            totalFaltante={totalSaldo - totalPendiente - totalAcreditado}
          />
        </div>
        <CobranzaMensualCard mesesCompletos={cobranzaMensual} />
        <div className="bg-white rounded-2xl shadow-sm p-5 lg:col-span-2 h-full">
          <p className="text-sm font-bold text-sky-700 mb-3">Medios de pago</p>
          <DonutChart
            vertical
            labels={acreditadoPorMedioOrdenado.map(([medio]) => medio)}
            valores={acreditadoPorMedioOrdenado.map(([, monto]) => monto)}
            colores={acreditadoPorMedioOrdenado.map(
              (_, i) => COLORES_MEDIOS_PAGO[i % COLORES_MEDIOS_PAGO.length]
            )}
            etiquetasValor={acreditadoPorMedioOrdenado.map(([, monto]) =>
              totalAcreditadoPorMedio > 0
                ? `${((monto / totalAcreditadoPorMedio) * 100).toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`
                : "0%"
            )}
          />
        </div>
      </div>

      <MasInformacionResumen
        familiasEnRiesgo={familiasEnRiesgo}
        pagosPendientesCount={pagosPendientesCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-bold text-sky-700 mb-3">Próximos vencimientos</p>
          <div className="space-y-3">
            {proximosVencimientos.map((v) => {
              const dias = Math.ceil(
                (new Date(v.fechaVencimiento) - new Date(hoyIso)) / 86400000
              );
              return (
                <div key={v.productoId} className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="font-semibold text-slate-800 flex-1 min-w-0 truncate">
                    {v.nombre}
                  </span>
                  <span className="text-slate-500 shrink-0">
                    {v.familias} {v.familias === 1 ? "familia" : "familias"}
                  </span>
                  <span className="text-slate-400 text-xs shrink-0">
                    vence en {dias} {dias === 1 ? "día" : "días"}
                  </span>
                </div>
              );
            })}
            {proximosVencimientos.length === 0 && (
              <p className="text-sm text-slate-400">
                No hay conceptos marcados con vencimiento próximo.
              </p>
            )}
          </div>
        </div>

        <ActividadReciente movimientos={actividadReciente} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 lg:col-span-2">
          <p className="text-sm font-bold text-sky-700 mb-3">Más deuda</p>
          <div className="space-y-2">
            {masDeuda.map((m, i) => (
              <div key={m.miembro_id} className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 font-bold w-4 shrink-0">{i + 1}</span>
                <span className="text-slate-700 truncate flex-1">{m.nombre}</span>
                <span className="font-bold text-red-500 shrink-0">{formatoMoneda(m.saldo)}</span>
              </div>
            ))}
            {masDeuda.length === 0 && <p className="text-sm text-slate-400">Sin datos.</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 lg:col-span-2">
          <p className="text-sm font-bold text-sky-700 mb-3">Menos deuda</p>
          <div className="space-y-2">
            {menosDeuda.map((m, i) => (
              <div key={m.miembro_id} className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 font-bold w-4 shrink-0">{i + 1}</span>
                <span className="text-slate-700 truncate flex-1">{m.nombre}</span>
                <span className="font-bold text-emerald-600 shrink-0">
                  {formatoMoneda(m.saldo)}
                </span>
              </div>
            ))}
            {menosDeuda.length === 0 && <p className="text-sm text-slate-400">Sin datos.</p>}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm font-bold text-sky-700 mb-3">Familias al día</p>
            <p className="text-2xl font-bold text-slate-800">
              {familiasAlDia}{" "}
              <span className="text-sm font-semibold text-slate-400">/ {totalFamilias}</span>
            </p>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${totalFamilias > 0 ? (familiasAlDia / totalFamilias) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm font-bold text-sky-700 mb-3">Familias con deuda</p>
            <p className="text-2xl font-bold text-slate-800">
              {familiasConDeuda}{" "}
              <span className="text-sm font-semibold text-slate-400">/ {totalFamilias}</span>
            </p>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2">
              <div
                className="h-full bg-red-500"
                style={{
                  width: `${totalFamilias > 0 ? (familiasConDeuda / totalFamilias) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
