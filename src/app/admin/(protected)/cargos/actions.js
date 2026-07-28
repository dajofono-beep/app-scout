"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

function sumarMeses(fechaISO, meses) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + meses, d)).toISOString().slice(0, 10);
}

// Reparte un importe en N cuotas de 2 decimales; la última cuota absorbe
// el resto del redondeo para que la suma dé exacto al importe original.
function dividirEnCuotas(importeTotal, cantidadCuotas) {
  const base = Math.floor((importeTotal / cantidadCuotas) * 100) / 100;
  const cuotas = Array(cantidadCuotas).fill(base);
  const resto = Math.round((importeTotal - base * cantidadCuotas) * 100) / 100;
  cuotas[cuotas.length - 1] = Math.round((cuotas[cuotas.length - 1] + resto) * 100) / 100;
  return cuotas;
}

// Genera una o varias filas de `cargos` para un miembro a partir de un
// producto: una sola fila si no es cuotable, o `cantidad_cuotas` filas
// mensuales (con el concepto indicando "cuota N/M") si lo es.
function generarFilasCargo({ producto, miembro_id, fecha, porcentaje, creado_por }) {
  const importeConDescuento =
    porcentaje != null
      ? Math.round(producto.importe * (porcentaje / 100) * 100) / 100
      : producto.importe;

  if (!producto.es_cuotable) {
    return [
      {
        miembro_id,
        producto_id: producto.id,
        concepto: producto.nombre,
        importe: importeConDescuento,
        fecha,
        fecha_vencimiento: producto.fecha_vencimiento ?? null,
        creado_por,
        porcentaje_aplicado: porcentaje,
      },
    ];
  }

  const montos = dividirEnCuotas(importeConDescuento, producto.cantidad_cuotas);
  return montos.map((importe, i) => ({
    miembro_id,
    producto_id: producto.id,
    concepto: `${producto.nombre} (cuota ${i + 1}/${producto.cantidad_cuotas})`,
    importe,
    fecha: sumarMeses(fecha, i),
    fecha_vencimiento: producto.fecha_vencimiento ?? null,
    creado_por,
    porcentaje_aplicado: porcentaje,
  }));
}

// Devuelve true si el miembro ya tiene un cargo ACTIVO de ese producto
// (uno cancelado no cuenta, se puede volver a asignar).
async function tieneProductoActivo(supabase, miembro_id, producto_id) {
  const { data, error } = await supabase
    .from("cargos")
    .select("id")
    .eq("miembro_id", miembro_id)
    .eq("producto_id", producto_id)
    .eq("estado", "activo")
    .limit(1);
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

export async function crearCargoIndividual(formData) {
  const { supabase, user } = await requireSession();

  const miembro_id = formData.get("miembro_id")?.toString();
  const producto_id = formData.get("producto_id")?.toString();
  const fecha = formData.get("fecha")?.toString();

  if (!miembro_id || !producto_id || !fecha) {
    throw new Error("Miembro, producto y fecha son obligatorios");
  }

  if (await tieneProductoActivo(supabase, miembro_id, producto_id)) {
    throw new Error(
      "Este miembro ya tiene un cargo activo de ese producto. Cancelalo primero si querés volver a asignarlo."
    );
  }

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select("id, nombre, importe, es_cuotable, cantidad_cuotas, fecha_vencimiento")
    .eq("id", producto_id)
    .single();
  if (productoError) throw new Error(productoError.message);

  const filas = generarFilasCargo({
    producto,
    miembro_id,
    fecha,
    porcentaje: null,
    creado_por: user.id,
  });

  const { error } = await supabase.from("cargos").insert(filas);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/cargos");
  revalidatePath("/admin");
}

export async function crearCargoPorRama(formData) {
  const { supabase, user } = await requireSession();

  const rama_id = formData.get("rama_id")?.toString();
  const producto_id = formData.get("producto_id")?.toString();
  const fecha = formData.get("fecha")?.toString();

  if (!rama_id || !producto_id || !fecha) {
    throw new Error("Rama, producto y fecha son obligatorios");
  }

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select("id, nombre, importe, es_cuotable, cantidad_cuotas, fecha_vencimiento")
    .eq("id", producto_id)
    .single();
  if (productoError) throw new Error(productoError.message);

  const { data: miembros, error: miembrosError } = await supabase
    .from("miembros")
    .select("id, nombre, apellido")
    .eq("rama_id", rama_id)
    .eq("activo", true);
  if (miembrosError) throw new Error(miembrosError.message);

  if (!miembros || miembros.length === 0) {
    throw new Error("Esa rama no tiene miembros activos");
  }

  const { data: existentes, error: existentesError } = await supabase
    .from("cargos")
    .select("miembro_id")
    .eq("producto_id", producto_id)
    .eq("estado", "activo")
    .in(
      "miembro_id",
      miembros.map((m) => m.id)
    );
  if (existentesError) throw new Error(existentesError.message);
  const idsConProducto = new Set((existentes ?? []).map((e) => e.miembro_id));

  const aCargar = miembros.filter((m) => !idsConProducto.has(m.id));
  const salteados = miembros
    .filter((m) => idsConProducto.has(m.id))
    .map((m) => `${m.apellido}, ${m.nombre}`);

  let creados = 0;
  if (aCargar.length > 0) {
    const filas = aCargar.flatMap((m) =>
      generarFilasCargo({
        producto,
        miembro_id: m.id,
        fecha,
        porcentaje: null,
        creado_por: user.id,
      })
    );

    const { error } = await supabase.from("cargos").insert(filas);
    if (error) throw new Error(error.message);
    creados = aCargar.length;
  }

  revalidatePath("/admin/cargos");
  revalidatePath("/admin");

  return { creados, salteados };
}

function porcentajeParaOrden(orden, escala) {
  if (!orden) return 100;
  const exacto = escala.find((e) => e.posicion === orden);
  if (exacto) return Number(exacto.porcentaje);

  const menores = escala.filter((e) => e.posicion <= orden);
  if (menores.length === 0) return 100;

  const mayorTier = menores.reduce((a, b) => (a.posicion > b.posicion ? a : b));
  return Number(mayorTier.porcentaje);
}

export async function crearCargoPorFamilia(formData) {
  const { supabase, user } = await requireSession();

  const familia_id = formData.get("familia_id")?.toString();
  const producto_id = formData.get("producto_id")?.toString();
  const fecha = formData.get("fecha")?.toString();

  if (!familia_id || !producto_id || !fecha) {
    throw new Error("Familia, producto y fecha son obligatorios");
  }

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select(
      "id, nombre, importe, es_cuotable, cantidad_cuotas, aplica_descuento_hermanos, fecha_vencimiento"
    )
    .eq("id", producto_id)
    .single();
  if (productoError) throw new Error(productoError.message);

  const { data: miembros, error: miembrosError } = await supabase
    .from("miembros")
    .select("id, nombre, apellido, orden_familia")
    .eq("familia_id", familia_id)
    .eq("activo", true);
  if (miembrosError) throw new Error(miembrosError.message);

  if (!miembros || miembros.length === 0) {
    throw new Error("Esa familia no tiene miembros activos");
  }

  const { data: existentes, error: existentesError } = await supabase
    .from("cargos")
    .select("miembro_id")
    .eq("producto_id", producto_id)
    .eq("estado", "activo")
    .in(
      "miembro_id",
      miembros.map((m) => m.id)
    );
  if (existentesError) throw new Error(existentesError.message);
  const idsConProducto = new Set((existentes ?? []).map((e) => e.miembro_id));

  const aCargar = miembros.filter((m) => !idsConProducto.has(m.id));
  const salteados = miembros
    .filter((m) => idsConProducto.has(m.id))
    .map((m) => `${m.apellido}, ${m.nombre}`);

  let escala = [];
  if (producto.aplica_descuento_hermanos) {
    const { data: escalaData, error: escalaError } = await supabase
      .from("escala_descuentos_familia")
      .select("*")
      .order("posicion");
    if (escalaError) throw new Error(escalaError.message);
    escala = escalaData ?? [];
  }

  let creados = 0;
  if (aCargar.length > 0) {
    const filas = aCargar.flatMap((m) => {
      const porcentaje = producto.aplica_descuento_hermanos
        ? porcentajeParaOrden(m.orden_familia, escala)
        : null;

      return generarFilasCargo({
        producto,
        miembro_id: m.id,
        fecha,
        porcentaje,
        creado_por: user.id,
      });
    });

    const { error } = await supabase.from("cargos").insert(filas);
    if (error) throw new Error(error.message);
    creados = aCargar.length;
  }

  revalidatePath("/admin/cargos");
  revalidatePath("/admin");

  return { creados, salteados };
}

export async function crearCargoManual(formData) {
  const { supabase, user } = await requireSession();

  const miembro_id = formData.get("miembro_id")?.toString();
  const concepto = formData.get("concepto")?.toString().trim();
  const importe = Number(formData.get("importe"));
  const fecha = formData.get("fecha")?.toString();

  if (!miembro_id || !concepto || !fecha) {
    throw new Error("Miembro, concepto y fecha son obligatorios");
  }
  // Se permite un importe negativo (p.ej. un descuento o corrección
  // puntual), que resta de la cuenta del miembro en lugar de sumar.
  if (!importe) {
    throw new Error("El importe no puede ser 0");
  }

  const { error } = await supabase.from("cargos").insert({
    miembro_id,
    concepto,
    importe,
    fecha,
    creado_por: user.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/cargos");
  revalidatePath("/admin");
}

export async function actualizarCargo(formData) {
  const { supabase } = await requireSession();

  const id = formData.get("id");
  const concepto = formData.get("concepto")?.toString().trim();
  const importe = Number(formData.get("importe"));
  const fecha = formData.get("fecha")?.toString();
  const fecha_vencimiento = formData.get("fecha_vencimiento")?.toString() || null;

  if (!concepto || !fecha) throw new Error("Concepto y fecha son obligatorios");
  if (!importe) throw new Error("El importe no puede ser 0");

  const { error } = await supabase
    .from("cargos")
    .update({ concepto, importe, fecha, fecha_vencimiento })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/cargos");
  revalidatePath(`/admin/cargos/${id}`);
  revalidatePath("/admin");
}

export async function cancelarCargo(formData) {
  const { supabase } = await requireSession();
  const id = formData.get("id");

  const { error } = await supabase
    .from("cargos")
    .update({ estado: "cancelado" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/cargos");
  revalidatePath(`/admin/cargos/${id}`);
  revalidatePath("/admin");
}

export async function reactivarCargo(formData) {
  const { supabase } = await requireSession();
  const id = formData.get("id");

  const { error } = await supabase
    .from("cargos")
    .update({ estado: "activo" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/cargos");
  revalidatePath(`/admin/cargos/${id}`);
  revalidatePath("/admin");
}
