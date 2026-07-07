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
    .select("nombre, importe")
    .eq("id", producto_id)
    .single();
  if (productoError) throw new Error(productoError.message);

  const { error } = await supabase.from("cargos").insert({
    miembro_id,
    producto_id,
    concepto: producto.nombre,
    importe: producto.importe,
    fecha,
    creado_por: user.id,
  });
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
    .select("nombre, importe")
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

  const filas = miembros.map((m) => ({
    miembro_id: m.id,
    producto_id,
    concepto: producto.nombre,
    importe: producto.importe,
    fecha,
    creado_por: user.id,
  }));

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
    .select("nombre, importe, aplica_descuento_hermanos")
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

  const filas = miembros.map((m) => {
    const porcentaje = producto.aplica_descuento_hermanos
      ? porcentajeParaOrden(m.orden_familia, escala)
      : 100;
    const importeFinal =
      Math.round(producto.importe * (porcentaje / 100) * 100) / 100;

    return {
      miembro_id: m.id,
      producto_id,
      concepto: producto.nombre,
      importe: importeFinal,
      fecha,
      creado_por: user.id,
      porcentaje_aplicado: producto.aplica_descuento_hermanos
        ? porcentaje
        : null,
    };
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
