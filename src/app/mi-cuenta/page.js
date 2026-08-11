import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { urlFirmadaComprobante } from "@/lib/supabase/comprobantes";
import CuentaTabs from "./cuenta-tabs";
import MovimientosPanel from "./movimientos-panel";
import PagoForm from "./pago-form";
import Social from "./social";
import Mensajes from "./mensajes";
import CuentaNav from "./cuenta-nav";
import TarjetaSaldo from "./tarjeta-saldo";
import { calcularVencimientos } from "./proximo-vencimiento";

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

  const { data: mediosPago } = await supabase
    .from("medios_pago")
    .select("id, nombre")
    .eq("habilitado", true)
    .order("orden");

  const panelPago = (
    <PagoForm
      esFamiliaConVarios={esFamiliaConVarios}
      familiares={familiares}
      miembroId={miembro.id}
      mediosPago={mediosPago ?? []}
    />
  );

  const cargosActivos = (cargos ?? []).filter((c) => c.estado === "activo");
  const totalCargos = cargosActivos.reduce((acc, c) => acc + Number(c.importe), 0);
  const pagosAcreditados = (pagos ?? []).filter((p) => p.estado_efectivo === "acreditado");
  const pagadoTotal = pagosAcreditados.reduce((acc, p) => acc + Number(p.importe), 0);
  const pagosRealizados = pagadoTotal + pendienteTotal;

  // `productos` es de lectura solo para administradores (RLS), así que
  // se resuelve con el cliente admin — mismo caso que `familias` más
  // arriba.
  const { data: productosVencimiento } = await admin
    .from("productos")
    .select("id, fecha_vencimiento, alerta_vencimiento");

  const vencimientos = calcularVencimientos({
    familiares: familiares ?? [],
    cargos: cargos ?? [],
    pagosAcreditados,
    productos: productosVencimiento ?? [],
    nombrePorId,
    hoyIso: hoy.toISOString().slice(0, 10),
  });

  const panelMovimientos = (
    <MovimientosPanel
      cargos={cargos ?? []}
      pagosConComprobante={pagosConComprobante}
      familiares={familiares ?? []}
      hoyIso={hoy.toISOString().slice(0, 10)}
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

  // La tabla `familias` es de solo lectura para el admin (RLS), así que
  // el nombre de "mis hermanos" se resuelve acá con el cliente admin en
  // vez de con una consulta directa del lado de la familia.
  let nombreFamiliaPropia = null;
  if (miembro.familia_id) {
    const { data: familiaPropia } = await admin
      .from("familias")
      .select("nombre")
      .eq("id", miembro.familia_id)
      .maybeSingle();
    nombreFamiliaPropia = familiaPropia?.nombre ?? null;
  }

  function etiquetaDestinatario(m) {
    if (m.destinatario_tipo === "todos") return "Todos";
    if (m.destinatario_tipo === "rama") return `Rama: ${miembro.ramas?.nombre ?? ""}`;
    if (m.destinatario_tipo === "familia") return `Hermanos: ${nombreFamiliaPropia ?? ""}`;
    // "miembro": por la política de RLS, si veo este mensaje es porque
    // destinatario_id soy yo mismo.
    return `${miembro.apellido}, ${miembro.nombre}`;
  }

  const mensajesConDestinatario = (mensajes ?? []).map((m) => ({
    ...m,
    destinatarioTexto: etiquetaDestinatario(m),
  }));

  const { data: config } = await supabase
    .from("configuracion")
    .select("grupos_padres_visible")
    .eq("id", 1)
    .maybeSingle();

  let linkGrupoWhatsapp = null;
  if (config?.grupos_padres_visible && miembro.rama_id) {
    const { data: grupo } = await supabase
      .from("grupos_whatsapp")
      .select("link")
      .eq("rama_id", miembro.rama_id)
      .maybeSingle();
    linkGrupoWhatsapp = grupo?.link ?? null;
  }

  const panelMensajes = (
    <Mensajes mensajes={mensajesConDestinatario} linkGrupoWhatsapp={linkGrupoWhatsapp} />
  );

  const panelPrincipal = (
    <div className="space-y-4">
      <TarjetaSaldo
        esFamiliaConVarios={esFamiliaConVarios}
        saldoTotal={saldoTotal}
        totalCargos={totalCargos}
        pagosRealizados={pagosRealizados}
        pendienteTotal={pendienteTotal}
        saldosOrdenados={saldosOrdenados}
        nombrePorId={nombrePorId}
        vencimientos={vencimientos}
      />

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
