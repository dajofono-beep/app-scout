import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const COLOR_RAMA = {
  Manada: { dot: "bg-yellow-400", chip: "bg-yellow-50 text-yellow-700", ring: "ring-yellow-400" },
  "Unidad Scout": {
    dot: "bg-green-400",
    chip: "bg-green-50 text-green-700",
    ring: "ring-green-400",
  },
  Caminantes: { dot: "bg-sky-400", chip: "bg-sky-50 text-sky-700", ring: "ring-sky-400" },
  Rovers: { dot: "bg-red-400", chip: "bg-red-50 text-red-700", ring: "ring-red-400" },
  Adultos: { dot: "bg-violet-400", chip: "bg-violet-50 text-violet-700", ring: "ring-violet-400" },
};
const COLOR_DEFAULT = {
  dot: "bg-slate-400",
  chip: "bg-slate-50 text-slate-700",
  ring: "ring-slate-400",
};

const ETIQUETA_ESTADO = {
  pendiente: { texto: "Pendiente", clase: "bg-amber-50 text-amber-700" },
  acreditado: { texto: "Acreditado", clase: "bg-emerald-50 text-emerald-700" },
  cancelado: { texto: "Cancelado", clase: "bg-slate-100 text-slate-500" },
};

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export default async function AdminDashboardPage({ searchParams }) {
  const params = await searchParams;
  const ramaSeleccionada = params?.rama_id ?? "";

  const supabase = await createClient();

  const { data: ramas } = await supabase.from("ramas").select("*").order("orden");

  const { data: miembrosActivos } = await supabase
    .from("miembros")
    .select("id, nombre, apellido, rama_id, ramas(nombre)")
    .eq("activo", true);

  const totalMiembros = miembrosActivos?.length ?? 0;

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

  let ultimosPagos = [];
  if (idsFiltrados.length > 0) {
    const { data } = await supabase
      .from("estado_pagos")
      .select("*, miembros(nombre, apellido, ramas(nombre))")
      .in("miembro_id", idsFiltrados)
      .order("fecha_pago", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);
    ultimosPagos = data ?? [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Resumen</h1>
      <p className="text-sm text-slate-400 mb-6">
        Mostrando: {ramaActual ? ramaActual.nombre : "Todo el grupo"}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Link
          href="/admin"
          className={`bg-white rounded-2xl shadow-sm p-5 sm:w-44 shrink-0 block ${
            !ramaSeleccionada ? "ring-2 ring-sky-500" : ""
          }`}
        >
          <p className="text-sm font-bold text-slate-400">Miembros activos</p>
          <p className="text-3xl font-bold text-slate-800">{totalMiembros}</p>
        </Link>
        <div className="bg-white rounded-2xl shadow-sm p-5 flex-1">
          <p className="text-sm font-bold text-slate-400 mb-3">Miembros por rama</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {porRama.map((r) => {
              const color = COLOR_RAMA[r.nombre] ?? COLOR_DEFAULT;
              const activa = ramaSeleccionada === r.id;
              return (
                <Link
                  key={r.id}
                  href={`/admin?rama_id=${r.id}`}
                  className={`flex flex-col items-center justify-center gap-1 text-sm font-semibold px-3 py-2 rounded-2xl text-center ${color.chip} ${
                    activa ? `ring-2 ${color.ring}` : ""
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.dot}`} />
                    {r.nombre}
                  </span>
                  <span className="text-lg font-bold">{r.cantidad}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
          <p className="text-sm font-bold text-slate-400 min-h-[2.5rem]">Saldo total</p>
          <p className="text-2xl font-bold text-slate-800">{formatoMoneda(totalSaldo)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
          <p className="text-sm font-bold text-slate-400 min-h-[2.5rem]">Pagos acreditados</p>
          <p className="text-2xl font-bold text-emerald-600">{formatoMoneda(totalAcreditado)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
          <p className="text-sm font-bold text-slate-400 min-h-[2.5rem]">
            Pagos Pendientes de Acreditarse
          </p>
          <p className="text-2xl font-bold text-amber-600">{formatoMoneda(totalPendiente)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
          <p className="text-sm font-bold text-slate-400 min-h-[2.5rem]">Pagos Faltantes</p>
          <p className="text-2xl font-bold text-red-500">
            {formatoMoneda(totalSaldo - totalPendiente - totalAcreditado)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-bold text-slate-600 mb-3">
            Últimos 5 pagos realizados
          </p>
          <div className="space-y-3">
            {ultimosPagos.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">
                    {p.miembros?.apellido}, {p.miembros?.nombre}
                  </p>
                  <p className="text-xs text-slate-400">{p.fecha_pago}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-800">{formatoMoneda(p.importe)}</p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ETIQUETA_ESTADO[p.estado_efectivo].clase}`}
                  >
                    {ETIQUETA_ESTADO[p.estado_efectivo].texto}
                  </span>
                </div>
              </div>
            ))}
            {ultimosPagos.length === 0 && (
              <p className="text-sm text-slate-400">Todavía no hay pagos.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-bold text-slate-600 mb-3">
            Los 5 miembros con menos deuda
          </p>
          <div className="space-y-2">
            {menosDeuda.map((m) => (
              <div key={m.miembro_id} className="flex items-center justify-between text-sm gap-2">
                <span className="text-slate-700 truncate">{m.nombre}</span>
                <span className="font-bold text-emerald-600 shrink-0">
                  {formatoMoneda(m.saldo)}
                </span>
              </div>
            ))}
            {menosDeuda.length === 0 && <p className="text-sm text-slate-400">Sin datos.</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-bold text-slate-600 mb-3">
            Los 5 miembros con más deuda
          </p>
          <div className="space-y-2">
            {masDeuda.map((m) => (
              <div key={m.miembro_id} className="flex items-center justify-between text-sm gap-2">
                <span className="text-slate-700 truncate">{m.nombre}</span>
                <span className="font-bold text-red-500 shrink-0">{formatoMoneda(m.saldo)}</span>
              </div>
            ))}
            {masDeuda.length === 0 && <p className="text-sm text-slate-400">Sin datos.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
