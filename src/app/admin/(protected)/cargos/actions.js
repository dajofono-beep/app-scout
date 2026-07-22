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
    creado_por,
    porcentaje_aplicado: porcentaje,
  }));
}

export async function crearCargoIndividual(formData) {
  const { supabase, user } = await requireSession();

  const miembro_id = formData.get("miembro_id")?.toString();
  const producto_id = formData.get("producto_id")?.toString();
  const fecha = formData.get("fecha")?.toString();

  if (!miembro_id || !producto_id || !fecha) {
    throw new Error("Miembro, producto y fecha son obligatorios");
  }

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select("id, nombre, importe, es_cuotable, cantidad_cuotas")
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
    .select("id, nombre, importe, es_cuotable, cantidad_cuotas")
    .eq("id", producto_id)
    .single();
  if (productoError) throw new Error(productoError.message);

  const { data: miembros, error: miembrosError } = await supabase
    .from("miembros")
    .select("id")
    .eq("rama_id", rama_id)
    .eq("activo", true);
  if (miembrosError) throw new Error(miembrosError.message);

  if (!miembros || miembros.length === 0) {
    throw new Error("Esa rama no tiene miembros activos");
  }

  const filas = miembros.flatMap((m) =>
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

  revalidatePath("/admin/cargos");
  revalidatePath("/admin");
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
    .select("id, nombre, importe, es_cuotable, cantidad_cuotas, aplica_descuento_hermanos")
    .eq("id", producto_id)
    .single();
  if (productoError) throw new Error(productoError.message);

  const { data: miembros, error: miembrosError } = await supabase
    .from("miembros")
    .select("id, orden_familia")
    .eq("familia_id", familia_id)
    .eq("activo", true);
  if (miembrosError) throw new Error(miembrosError.message);

  if (!miembros || miembros.length === 0) {
    throw new Error("Esa familia no tiene miembros activos");
  }

  let escala = [];
  if (producto.aplica_descuento_hermanos) {
    const { data: escalaData, error: escalaError } = await supabase
      .from("escala_descuentos_familia")
      .select("*")
      .order("posicion");
    if (escalaError) throw new Error(escalaError.message);
    escala = escalaData ?? [];
  }

  const filas = miembros.flatMap((m) => {
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

  revalidatePath("/admin/cargos");
  revalidatePath("/admin");
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
  if (!importe || importe <= 0) {
    throw new Error("El importe debe ser mayor a 0");
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

  if (!concepto || !fecha) throw new Error("Concepto y fecha son obligatorios");
  if (!importe || importe <= 0) throw new Error("El importe debe ser mayor a 0");

  const { error } = await supabase
    .from("cargos")
    .update({ concepto, importe, fecha })
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
