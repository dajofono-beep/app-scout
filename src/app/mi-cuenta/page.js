import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { urlFirmadaComprobante } from "@/lib/supabase/comprobantes";
import { MEDIOS_PAGO } from "@/lib/medios-pago";
import LogoutButton from "./logout-button";
import CuentaTabs from "./cuenta-tabs";
import MovimientosTabs from "./movimientos-tabs";
import Torta3D from "./torta3d";
import { crearPago } from "./actions";

const PALETA_CATEGORICA = [
  "#0f9b8e",
  "#ef6461",
  "#f2a541",
  "#5b5f97",
  "#2ec4b6",
  "#d64550",
  "#7c9885",
  "#e0a458",
];

const quitarSufijoCuota = (concepto) =>
  concepto.replace(/\s*\(cuota \d+\/\d+\)$/, "");

const hoy = () => new Date().toISOString().slice(0, 10);

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
        iconoClase: "bg-gray-300",
        montoClase: "text-gray-400 line-through",
        badge: { texto: "Cancelado", clase: "bg-gray-200 text-gray-600" },
      };
    }
    return {
      iconoClase: "bg-red-500",
      montoClase: "text-red-600",
      badge: null,
    };
  }

  if (m.estado === "cancelado") {
    return {
      iconoClase: "bg-gray-300",
      montoClase: "text-gray-400 line-through",
      badge: { texto: "Cancelado", clase: "bg-gray-200 text-gray-600" },
    };
  }
  if (m.estado === "pendiente") {
    return {
      iconoClase: "bg-amber-400",
      montoClase: "text-amber-700",
      badge: { texto: "Pendiente", clase: "bg-amber-100 text-amber-800" },
    };
  }
  return {
    iconoClase: "bg-green-500",
    montoClase: "text-green-700",
    badge: { texto: "Acreditado", clase: "bg-green-100 text-green-800" },
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

  const saldoTotal = (saldos ?? []).reduce((acc, s) => acc + Number(s.saldo), 0);
  const pendienteTotal = (saldos ?? []).reduce(
    (acc, s) => acc + Number(s.total_pagos_pendientes),
    0
  );

  const movimientos = [
    ...(cargos ?? []).map((c) => ({
      tipo: "cargo",
      id: `cargo-${c.id}`,
      miembro_id: c.miembro_id,
      fecha: c.fecha,
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
      titulo: p.medio_pago ? `Pago (${p.medio_pago})` : "Pago",
      importe: p.importe,
      estado: p.estado_efectivo,
      porcentaje_aplicado: null,
      comprobante_href: p.comprobante_href,
    })),
  ].sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));

  const panelPago = (
    <section className="bg-white rounded-lg shadow p-4">
      <h2 className="font-semibold mb-3">Cargar un pago</h2>
      <form action={crearPago} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {esFamiliaConVarios && (
          <select
            name="miembro_id"
            required
            defaultValue={miembro.id}
            className="border rounded px-3 py-2 sm:col-span-3"
          >
            {(familiares ?? []).map((f) => (
              <option key={f.id} value={f.id}>
                Para: {f.apellido}, {f.nombre}
              </option>
            ))}
          </select>
        )}
        {!esFamiliaConVarios && (
          <input type="hidden" name="miembro_id" value={miembro.id} />
        )}
        <input
          name="importe"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="Importe"
          className="border rounded px-3 py-2"
        />
        <input
          name="fecha_pago"
          type="date"
          required
          defaultValue={hoy()}
          max={hoy()}
          className="border rounded px-3 py-2"
        />
        <select name="medio_pago" defaultValue="" className="border rounded px-3 py-2">
          <option value="">Medio de pago...</option>
          {MEDIOS_PAGO.map((medio) => (
            <option key={medio} value={medio}>
              {medio}
            </option>
          ))}
        </select>
        <div className="sm:col-span-3">
          <label className="block text-xs text-gray-500 mb-1">
            Comprobante de la transferencia (opcional)
          </label>
          <input
            type="file"
            name="comprobante"
            accept="image/*"
            className="text-sm w-full"
          />
        </div>
        <button
          type="submit"
          className="sm:col-span-3 bg-blue-600 text-white rounded py-2 font-medium"
        >
          Registrar pago
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-2">
        El pago queda como &quot;Pendiente&quot; por 4 días, tiempo en el que
        el administrador puede revisarlo. Luego se acredita solo.
      </p>
    </section>
  );

  const cargosActivos = (cargos ?? []).filter((c) => c.estado === "activo");
  const totalCargos = cargosActivos.reduce((acc, c) => acc + Number(c.importe), 0);
  const pagadoTotal = (pagos ?? [])
    .filter((p) => p.estado_efectivo === "acreditado")
    .reduce((acc, p) => acc + Number(p.importe), 0);
  const adeudadoTotal = Math.max(totalCargos - pagadoTotal - pendienteTotal, 0);

  const datosCobertura = {
    titulo: `Sobre el total de cargos generados (${formatoMoneda(totalCargos)})`,
    labels: ["Pagado", "Pendiente de acreditar", "Adeudado"],
    valores: [pagadoTotal, pendienteTotal, adeudadoTotal],
    colores: ["#22c55e", "#fbbf24", "#ef4444"],
  };

  const porConcepto = new Map();
  for (const c of cargosActivos) {
    const label = quitarSufijoCuota(c.concepto);
    porConcepto.set(label, (porConcepto.get(label) ?? 0) + Number(c.importe));
  }
  const entradasConcepto = [...porConcepto.entries()];
  const datosDetalle = {
    titulo: "Composición de los cargos por concepto",
    labels: entradasConcepto.map(([label]) => label),
    valores: entradasConcepto.map(([, importe]) => importe),
    colores: entradasConcepto.map((_, i) => PALETA_CATEGORICA[i % PALETA_CATEGORICA.length]),
  };

  const panelListado = (
    <section className="space-y-2">
      {movimientos.map((m) => {
        const estilo = estiloMovimiento(m);
        return (
          <div
            key={m.id}
            className="bg-white rounded-lg shadow p-3 flex items-center gap-3"
          >
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 ${estilo.iconoClase}`}
            >
              <IconoFlecha
                direccion={m.tipo === "pago" ? "arriba" : "abajo"}
                className="w-5 h-5"
              />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {m.titulo}
                {m.porcentaje_aplicado != null && (
                  <span className="text-xs text-amber-700 font-normal">
                    {" "}
                    · {m.porcentaje_aplicado}%
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">
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
                className="shrink-0 text-gray-400 hover:text-blue-600"
              >
                <IconoComprobante className="w-5 h-5" />
              </a>
            )}
            <div className="text-right shrink-0">
              <p className={`font-semibold ${estilo.montoClase}`}>
                {m.tipo === "cargo" ? "-" : "+"}
                {formatoMoneda(m.importe)}
              </p>
              {estilo.badge && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${estilo.badge.clase}`}
                >
                  {estilo.badge.texto}
                </span>
              )}
            </div>
          </div>
        );
      })}
      {movimientos.length === 0 && (
        <p className="text-gray-500 text-sm">Todavía no hay movimientos.</p>
      )}
    </section>
  );

  const panelMovimientos = (
    <MovimientosTabs
      panelListado={panelListado}
      panelCobertura={<Torta3D {...datosCobertura} />}
      panelDetalle={<Torta3D {...datosDetalle} />}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <div>
          <p className="font-medium">
            {miembro.apellido}, {miembro.nombre}
          </p>
          <p className="text-sm text-gray-500">{miembro.ramas?.nombre}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cambiar-clave" className="text-sm text-blue-600 underline">
            Cambiar contraseña
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <section className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">
            {esFamiliaConVarios ? "Saldo total de la familia" : "Saldo actual"}
          </p>
          <p className="text-3xl font-bold">{formatoMoneda(saldoTotal)}</p>
          {pendienteTotal > 0 && (
            <p className="text-sm text-amber-700 mt-1">
              Hay {formatoMoneda(pendienteTotal)} en pagos pendientes de
              acreditar.
            </p>
          )}

          {esFamiliaConVarios && (
            <div className="mt-3 pt-3 border-t space-y-1">
              {(saldos ?? []).map((s) => (
                <div key={s.miembro_id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{nombrePorId[s.miembro_id]}</span>
                  <span className="font-medium">{formatoMoneda(s.saldo)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <CuentaTabs panelPago={panelPago} panelMovimientos={panelMovimientos} />
      </main>
    </div>
  );
}
