import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { urlFirmadaComprobante } from "@/lib/supabase/comprobantes";
import CuentaTabs from "./cuenta-tabs";
import MovimientosTabs from "./movimientos-tabs";
import ListadoTabs from "./listado-tabs";
import LineaTiempoPagos from "./linea-tiempo-pagos";
import Torta3D from "./torta3d";
import PagoForm from "./pago-form";
import Social from "./social";
import Mensajes from "./mensajes";
import CuentaNav from "./cuenta-nav";

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

export default async function MiCuentaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: miembro } = await supabase
    .from("miembros")
    .select("*, ramas(nombre)")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!miembro) redirect("/");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("foto_url")
    .eq("miembro_id", miembro.id)
    .maybeSingle();

  // RLS ya devuelve exactamente los miembros de mi misma familia (o solo yo,
  // si no tengo familia asignada).
  const { data: familiares } = await supabase
    .from("miembros")
    .select("id, nombre, apellido")
    .order("orden_familia", { ascending: true, nullsFirst: false })
    .order("apellido");

  const idsFamiliares = (familiares ?? []).map((m) => m.id);
  const esFamiliaConVarios = idsFamiliares.length > 1;

  const nombrePorId = Object.fromEntries(
    (familiares ?? []).map((m) => [m.id, `${m.apellido}, ${m.nombre}`])
  );

  const { data: saldos } = await supabase
    .from("saldos_miembros")
    .select("*")
    .in("miembro_id", idsFamiliares);

  // familiares ya viene ordenado por orden_familia (1º primero), que es
  // quien más paga según la escala de descuento por hermanos.
  const saldosOrdenados = idsFamiliares
    .map((id) => (saldos ?? []).find((s) => s.miembro_id === id))
    .filter(Boolean);

  const { data: cargos } = await supabase
    .from("cargos")
    .select("*")
    .in("miembro_id", idsFamiliares)
    .order("fecha", { ascending: false });

  const { data: pagos } = await supabase
    .from("estado_pagos")
    .select("*")
    .in("miembro_id", idsFamiliares)
    .order("fecha_pago", { ascending: false });

  const admin = createAdminClient();
  const pagosConComprobante = await Promise.all(
    (pagos ?? []).map(async (p) => ({
      ...p,
      comprobante_href: p.comprobante_url
        ? await urlFirmadaComprobante(admin, p.comprobante_url)
        : null,
    }))
  );

  const hoy = new Date();
  const anioActual = hoy.getFullYear();
  const mesActual = hoy.getMonth();
  const diaActual = hoy.getDate();

  const { data: miembrosSocial } = await supabase
    .from("miembros_social")
    .select("id, nombre, apellido, rama_id, fecha_nacimiento");

  const cumpleanosTodos = (miembrosSocial ?? [])
    .filter((m) => m.fecha_nacimiento)
    .map((m) => {
      const [, mesNac, diaNac] = m.fecha_nacimiento.split("-").map(Number);
      return { id: m.id, nombre: `${m.nombre} ${m.apellido}`, mes: mesNac, dia: diaNac };
    });

  const { data: fechasImportantesTodas } = await supabase
    .from("fechas_importantes")
    .select("*")
    .eq("activo", true)
    .order("fecha_inicio");

  const { data: ramasSocial } = await supabase.from("ramas").select("id, nombre");
  const nombreRamaPorId = Object.fromEntries(
    (ramasSocial ?? []).map((r) => [r.id, r.nombre])
  );

  const { data: perfilesSocial } = await supabase.from("perfiles").select("*");
  const perfilPorMiembroId = Object.fromEntries(
    (perfilesSocial ?? []).map((p) => [p.miembro_id, p])
  );

  const directorio = (miembrosSocial ?? []).map((m) => {
    const perfilMiembro = perfilPorMiembroId[m.id];
    const [, cumpleMes, cumpleDia] = m.fecha_nacimiento
      ? m.fecha_nacimiento.split("-").map(Number)
      : [null, null, null];
    return {
      id: m.id,
      nombre: `${m.nombre} ${m.apellido}`,
      ramaId: m.rama_id,
      ramaNombre: nombreRamaPorId[m.rama_id] ?? "",
      cumpleMes,
      cumpleDia,
      fotoUrl: perfilMiembro?.foto_url ?? null,
      telefono: perfilMiembro?.telefono ?? null,
      redSocial1: perfilMiembro?.red_social_1 ?? null,
      redSocial2: perfilMiembro?.red_social_2 ?? null,
      redSocial3: perfilMiembro?.red_social_3 ?? null,
    };
  });

  const saldoTotal = (saldos ?? []).reduce((acc, s) => acc + Number(s.saldo), 0);
  const pendienteTotal = (saldos ?? []).reduce(
    (acc, s) => acc + Number(s.total_pagos_pendientes),
    0
  );

  const movimientos = [
    ...(cargos ?? []).filter((c) => c.estado === "activo").map((c) => ({
      tipo: "cargo",
      id: `cargo-${c.id}`,
      miembro_id: c.miembro_id,
      fecha: c.fecha,
      // Los cargos se ordenan por vencimiento (cuándo hay que pagarlos),
      // no por cuándo se cargaron, para ver rápido lo próximo a vencer.
      fechaOrden: c.fecha_vencimiento || c.fecha,
      titulo: c.concepto,
      importe: c.importe,
      estado: c.estado,
      porcentaje_aplicado: c.porcentaje_aplicado,
      comprobante_href: null,
    })),
    ...pagosConComprobante.map((p) => ({
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
  ].sort((a, b) => (a.fechaOrden < b.fechaOrden ? -1 : a.fechaOrden > b.fechaOrden ? 1 : 0));

  const panelPago = (
    <PagoForm
      esFamiliaConVarios={esFamiliaConVarios}
      familiares={familiares}
      miembroId={miembro.id}
    />
  );

  const cargosActivos = (cargos ?? []).filter((c) => c.estado === "activo");
  const totalCargos = cargosActivos.reduce((acc, c) => acc + Number(c.importe), 0);
  const pagadoTotal = (pagos ?? [])
    .filter((p) => p.estado_efectivo === "acreditado")
    .reduce((acc, p) => acc + Number(p.importe), 0);
  const pagosRealizados = pagadoTotal + pendienteTotal;
  const pagosLinea = (pagos ?? [])
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
                  {esFamiliaConVarios && ` · ${nombrePorId[m.miembro_id]}`}
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
      panelTodos={renderMovimientos(movimientos, "Todavía no hay movimientos.")}
      panelCargos={renderMovimientos(
        movimientos.filter((m) => m.tipo === "cargo"),
        "Todavía no hay cargos."
      )}
      panelPagos={renderMovimientos(
        movimientos.filter((m) => m.tipo === "pago"),
        "Todavía no hay pagos."
      )}
    />
  );

  const panelCobertura = (
    <LineaTiempoPagos
      conceptos={conceptosLinea}
      colorPorConcepto={colorPorConcepto}
      totalCargos={totalCargos}
      pagosLinea={pagosLinea}
      pagosRealizados={pagosRealizados}
      hoyIso={hoy.toISOString().slice(0, 10)}
    />
  );

  const panelMovimientos = (
    <MovimientosTabs
      panelListado={panelListado}
      panelCobertura={panelCobertura}
      panelDetalle={<Torta3D {...datosDetalle} />}
    />
  );

  const panelSocial = (
    <Social
      cumpleanosTodos={cumpleanosTodos}
      fechasImportantesTodas={fechasImportantesTodas ?? []}
      anio={anioActual}
      mes={mesActual}
      diaHoy={diaActual}
      directorio={directorio}
      ramasDirectorio={ramasSocial ?? []}
    />
  );

  const { data: mensajes } = await supabase
    .from("mensajes")
    .select("*")
    .order("created_at", { ascending: false });

  const panelMensajes = <Mensajes mensajes={mensajes ?? []} />;

  const panelPrincipal = (
    <div className="space-y-4">
      <section className="bg-gradient-to-br from-sky-600 to-sky-400 text-white rounded-3xl shadow-md p-5">
        <p className="text-sm text-white/90">
          {esFamiliaConVarios ? "Saldo total de la familia" : "Saldo actual"}
        </p>
        <p className="text-3xl font-bold">{formatoMoneda(saldoTotal)}</p>
        <div className="flex gap-4 mt-3 text-xs text-white/80">
          <span>
            Deuda total <span className="font-bold text-white">{formatoMoneda(totalCargos)}</span>
          </span>
          <span>
            Total Pagos <span className="font-bold text-white">{formatoMoneda(pagosRealizados)}</span>
          </span>
        </div>
        {pendienteTotal > 0 && (
          <p className="text-xs bg-white/20 rounded-full px-3 py-1 inline-block mt-2">
            {formatoMoneda(pendienteTotal)} en pagos pendientes de acreditar
          </p>
        )}

        {esFamiliaConVarios && (
          <div className="mt-3 pt-3 border-t border-white/20 space-y-1">
            {saldosOrdenados.map((s) => (
              <div key={s.miembro_id} className="flex justify-between text-sm">
                <span className="text-white/85">{nombrePorId[s.miembro_id]}</span>
                <span className="font-bold">{formatoMoneda(s.saldo)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <CuentaTabs panelPago={panelPago} panelMovimientos={panelMovimientos} />
    </div>
  );

  return (
    <CuentaNav
      nombreCompleto={`${miembro.apellido}, ${miembro.nombre}`}
      ramaNombre={miembro.ramas?.nombre}
      fotoUrl={perfil?.foto_url ?? null}
      panelPrincipal={panelPrincipal}
      panelSocial={panelSocial}
      panelMensajes={panelMensajes}
    />
  );
}
