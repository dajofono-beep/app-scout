import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";

const VERDE = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC6EFCE" } };
const AMARILLO = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFEB9C" } };
const ROJO = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFC7CE" } };
const TEXTO_VERDE = { argb: "FF006100" };
const TEXTO_AMARILLO = { argb: "FF9C6500" };
const TEXTO_ROJO = { argb: "FF9C0006" };

// Mismo formato de texto que usa cargos/actions.js al generar las cuotas,
// para que cada cargo caiga siempre en la cuota que le corresponde.
function subColumnasDeProducto(p) {
  if (p.es_cuotable && p.cantidad_cuotas) {
    return Array.from(
      { length: p.cantidad_cuotas },
      (_, i) => `${p.nombre} (cuota ${i + 1}/${p.cantidad_cuotas})`
    );
  }
  return [p.nombre];
}

// Ordena los conceptos por fecha de vencimiento (los que no tienen fecha
// quedan al final, por nombre).
function ordenarProductos(productos) {
  return [...productos].sort((a, b) => {
    if (a.fecha_vencimiento && b.fecha_vencimiento) {
      return a.fecha_vencimiento < b.fecha_vencimiento
        ? -1
        : a.fecha_vencimiento > b.fecha_vencimiento
        ? 1
        : 0;
    }
    if (a.fecha_vencimiento) return -1;
    if (b.fecha_vencimiento) return 1;
    return a.nombre.localeCompare(b.nombre);
  });
}

// Excel no admite \ / ? * [ ] en nombres de hoja, ni más de 31 caracteres.
function nombreDeHoja(texto) {
  return texto.replace(/[\\/?*[\]:]/g, "").slice(0, 31) || "Rama";
}

export async function POST(request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("No autenticado", { status: 401 });

  const { data: admin } = await supabase
    .from("administradores")
    .select("auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!admin) return new Response("No autorizado", { status: 403 });

  const formData = await request.formData();
  const rama_id = formData.get("rama_id")?.toString() || "todas";
  const productoIds = formData.getAll("producto_id").map((v) => v.toString());

  const { data: todasLasRamas } = await supabase
    .from("ramas")
    .select("*")
    .order("orden");
  const ramas =
    rama_id === "todas"
      ? todasLasRamas ?? []
      : (todasLasRamas ?? []).filter((r) => r.id === rama_id);

  let productosQuery = supabase.from("productos").select("*");
  if (productoIds.length > 0) productosQuery = productosQuery.in("id", productoIds);
  const { data: productosData, error: productosError } = await productosQuery;
  if (productosError) return new Response(productosError.message, { status: 500 });
  const productos = ordenarProductos(productosData ?? []);

  let miembrosQuery = supabase
    .from("miembros")
    .select("id, nombre, apellido, rama_id")
    .eq("activo", true)
    .order("apellido")
    .order("nombre");
  if (rama_id !== "todas") miembrosQuery = miembrosQuery.eq("rama_id", rama_id);
  const { data: miembros, error: miembrosError } = await miembrosQuery;
  if (miembrosError) return new Response(miembrosError.message, { status: 500 });

  const miembroIds = (miembros ?? []).map((m) => m.id);

  let cargos = [];
  if (miembroIds.length > 0 && productos.length > 0) {
    const { data, error } = await supabase
      .from("cargos")
      .select("miembro_id, producto_id, concepto, importe")
      .eq("estado", "activo")
      .in("miembro_id", miembroIds)
      .in("producto_id", productos.map((p) => p.id));
    if (error) return new Response(error.message, { status: 500 });
    cargos = data ?? [];
  }

  let pagos = [];
  if (miembroIds.length > 0) {
    const { data, error } = await supabase
      .from("estado_pagos")
      .select("miembro_id, importe, estado_efectivo")
      .in("miembro_id", miembroIds)
      .in("estado_efectivo", ["acreditado", "pendiente"]);
    if (error) return new Response(error.message, { status: 500 });
    pagos = data ?? [];
  }

  // Cargo (adeudado) por miembro + concepto puntual (cuota o único), ya
  // con descuento aplicado.
  const cargoPorMiembroConcepto = new Map();
  for (const c of cargos) {
    if (!cargoPorMiembroConcepto.has(c.miembro_id)) {
      cargoPorMiembroConcepto.set(c.miembro_id, new Map());
    }
    cargoPorMiembroConcepto.get(c.miembro_id).set(c.concepto, Number(c.importe));
  }

  // Total pagado por miembro: no sabemos a qué cargo corresponde cada
  // pago (la app no guarda esa relación), así que asumimos que se paga
  // lo más viejo primero y lo repartimos en cascada entre sus cargos
  // ordenados por vencimiento, completando cada uno antes de pasar el
  // sobrante al siguiente.
  const totalPagadoPorMiembro = new Map();
  for (const p of pagos) {
    totalPagadoPorMiembro.set(
      p.miembro_id,
      (totalPagadoPorMiembro.get(p.miembro_id) ?? 0) + Number(p.importe)
    );
  }

  const workbook = new ExcelJS.Workbook();

  for (const rama of ramas) {
    const miembrosDeRama = (miembros ?? []).filter((m) => m.rama_id === rama.id);
    if (miembrosDeRama.length === 0) continue;

    const hoja = workbook.addWorksheet(nombreDeHoja(rama.nombre));
    hoja.columns = [
      { header: "Apellido, Nombre", key: "nombre", width: 28 },
      ...productos.map((p) => ({ header: p.nombre, key: p.nombre, width: 18 })),
      { header: "Saldo", key: "saldo", width: 16, style: { numFmt: "#,##0.00" } },
    ];
    hoja.getRow(1).font = { bold: true };

    for (const m of miembrosDeRama) {
      const cargosDelMiembro = cargoPorMiembroConcepto.get(m.id) ?? new Map();
      let restante = totalPagadoPorMiembro.get(m.id) ?? 0;
      let totalAdeudado = 0;
      let totalAplicado = 0;

      const fila = { nombre: `${m.apellido}, ${m.nombre}` };
      const estados = {}; // producto.nombre -> "completo" | "parcial" | "pendiente" | null

      for (const producto of productos) {
        let cuotasCubiertas = 0;
        let tieneAlguna = false;
        let ultimaAdeudada = 0;
        let ultimaAplicada = 0;

        for (const col of subColumnasDeProducto(producto)) {
          const adeudado = cargosDelMiembro.get(col);
          if (adeudado == null) continue; // no le corresponde esta cuota puntual
          tieneAlguna = true;
          const aplicado = Math.min(restante, adeudado);
          restante -= aplicado;
          totalAdeudado += adeudado;
          totalAplicado += aplicado;
          if (adeudado > 0 && aplicado >= adeudado) cuotasCubiertas++;
          ultimaAdeudada = adeudado;
          ultimaAplicada = aplicado;
        }

        if (!tieneAlguna) {
          fila[producto.nombre] = null;
          estados[producto.nombre] = null;
        } else if (producto.es_cuotable && producto.cantidad_cuotas) {
          fila[producto.nombre] = `${cuotasCubiertas}/${producto.cantidad_cuotas}`;
          estados[producto.nombre] =
            cuotasCubiertas === producto.cantidad_cuotas
              ? "completo"
              : cuotasCubiertas === 0
              ? "pendiente"
              : "parcial";
        } else {
          const cubierto = ultimaAdeudada > 0 && ultimaAplicada >= ultimaAdeudada;
          fila[producto.nombre] = cubierto ? "Pago" : "Debe";
          estados[producto.nombre] = cubierto ? "completo" : "pendiente";
        }
      }

      fila.saldo = totalAdeudado - totalAplicado;

      const row = hoja.addRow(fila);
      for (const producto of productos) {
        const estado = estados[producto.nombre];
        if (!estado) continue;
        const celda = row.getCell(producto.nombre);
        if (estado === "completo") {
          celda.fill = VERDE;
          celda.font = { color: TEXTO_VERDE };
        } else if (estado === "parcial") {
          celda.fill = AMARILLO;
          celda.font = { color: TEXTO_AMARILLO };
        } else {
          celda.fill = ROJO;
          celda.font = { color: TEXTO_ROJO };
        }
      }
      if (fila.saldo > 0) {
        row.getCell("saldo").font = { color: TEXTO_ROJO };
      }
    }
  }

  if (workbook.worksheets.length === 0) {
    workbook.addWorksheet("Sin datos");
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const fechaHoy = new Date().toISOString().slice(0, 10);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Cargos y pagos - ${fechaHoy}.xlsx"`,
    },
  });
}
