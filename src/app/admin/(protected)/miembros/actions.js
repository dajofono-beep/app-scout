"use server";

import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verificarAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: admin } = await supabase
    .from("administradores")
    .select("auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!admin) throw new Error("No autorizado");

  return supabase;
}

// Crea la fila en `miembros` y su usuario de acceso (email interno +
// DNI como contraseña inicial). Usada tanto por el alta manual como por
// la importación desde Excel.
async function crearMiembroConAcceso(admin, datos) {
  const { data: miembro, error: insertError } = await admin
    .from("miembros")
    .insert(datos)
    .select()
    .single();
  if (insertError) throw new Error(insertError.message);

  const email = `m${miembro.id}@grupo.local`;
  const { data: userData, error: userError } =
    await admin.auth.admin.createUser({
      email,
      password: datos.dni,
      email_confirm: true,
    });

  if (userError) {
    await admin.from("miembros").delete().eq("id", miembro.id);
    throw new Error(
      "No se pudo crear el usuario de acceso: " + userError.message
    );
  }

  const { error: updateError } = await admin
    .from("miembros")
    .update({ auth_user_id: userData.user.id })
    .eq("id", miembro.id);
  if (updateError) throw new Error(updateError.message);

  return miembro;
}

export async function crearMiembro(formData) {
  await verificarAdmin();

  const nombre = formData.get("nombre")?.toString().trim();
  const apellido = formData.get("apellido")?.toString().trim();
  const dni = formData.get("dni")?.toString().trim();
  const rama_id = formData.get("rama_id")?.toString();
  const familia_id = formData.get("familia_id")?.toString() || null;
  const ordenRaw = formData.get("orden_familia")?.toString();
  const orden_familia = ordenRaw ? Number(ordenRaw) : null;
  const fecha_nacimiento = formData.get("fecha_nacimiento")?.toString() || null;

  if (!nombre || !apellido || !dni || !rama_id) {
    throw new Error("Todos los campos son obligatorios");
  }
  if (dni.length < 6) {
    throw new Error(
      "El DNI debe tener al menos 6 caracteres (se usa como contraseña inicial)"
    );
  }

  const admin = createAdminClient();

  await crearMiembroConAcceso(admin, {
    nombre,
    apellido,
    dni,
    rama_id,
    familia_id,
    orden_familia,
    fecha_nacimiento,
  });

  revalidatePath("/admin/miembros");
}

export async function actualizarMiembro(formData) {
  const supabase = await verificarAdmin();

  const id = formData.get("id");
  const nombre = formData.get("nombre")?.toString().trim();
  const apellido = formData.get("apellido")?.toString().trim();
  const rama_id = formData.get("rama_id")?.toString();
  const activo = formData.get("activo") === "on";
  const familia_id = formData.get("familia_id")?.toString() || null;
  const ordenRaw = formData.get("orden_familia")?.toString();
  const orden_familia = ordenRaw ? Number(ordenRaw) : null;
  const fecha_nacimiento = formData.get("fecha_nacimiento")?.toString() || null;

  if (!nombre || !apellido || !rama_id) {
    throw new Error("Nombre, apellido y rama son obligatorios");
  }

  const { error } = await supabase
    .from("miembros")
    .update({
      nombre,
      apellido,
      rama_id,
      activo,
      familia_id,
      orden_familia,
      fecha_nacimiento,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/miembros");
}

function celda(valor) {
  if (valor == null) return null;
  if (typeof valor === "object" && "text" in valor) return valor.text; // rich text
  if (typeof valor === "object" && "result" in valor) return valor.result; // formula
  return valor;
}

function parseNombreApellido(valor) {
  const str = (valor ?? "").toString().trim();
  const idx = str.indexOf(",");
  if (idx === -1) return null;
  const apellido = str.slice(0, idx).trim();
  const nombre = str.slice(idx + 1).trim();
  if (!apellido || !nombre) return null;
  return { apellido, nombre };
}

function parseFechaNacimiento(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);

  const str = valor.toString().trim();
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

// Deriva la rama a partir del texto de "Función": los roles de dirigentes
// mencionan la rama en el texto (ej. "Ayudante de Manada"), los miembros
// juveniles traen directamente el nombre de la rama (ej. "Rover"). Todo lo
// que no menciona ninguna rama (roles a nivel grupo/distrito) va a "Adultos".
function mapearRamaId(funcion, ramasPorNombre) {
  const texto = (funcion ?? "").toString().toLowerCase();
  let nombreRama;
  if (
    texto.includes("lobat") ||
    texto.includes("lobezna") ||
    texto.includes("manada")
  ) {
    nombreRama = "manada";
  } else if (texto.includes("caminante")) {
    nombreRama = "caminantes";
  } else if (texto.includes("rover")) {
    nombreRama = "rovers";
  } else if (texto.includes("scout")) {
    nombreRama = "unidad scout";
  } else {
    nombreRama = "adultos";
  }
  return ramasPorNombre.get(nombreRama) ?? null;
}

export async function importarMiembros(formData) {
  await verificarAdmin();

  const archivo = formData.get("archivo");
  if (!archivo || typeof archivo === "string" || archivo.size === 0) {
    throw new Error("Elegí un archivo .xlsx");
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const hoja = workbook.worksheets[0];
  if (!hoja) throw new Error("El archivo no tiene hojas");

  const encabezados = {};
  hoja.getRow(1).eachCell((cell, colNumber) => {
    const texto = celda(cell.value)?.toString().trim();
    if (texto) encabezados[texto] = colNumber;
  });

  const columnaDni = encabezados["Dni"] ?? encabezados["DNI"];
  const columnaNombre = encabezados["Nombre"];
  const columnaFuncion = encabezados["Función"];
  const columnaFecha = encabezados["Fecha de Nacimiento"];

  if (!columnaDni || !columnaNombre || !columnaFuncion) {
    throw new Error(
      'El archivo debe tener columnas "Dni", "Nombre" y "Función".'
    );
  }

  const admin = createAdminClient();

  const { data: ramas } = await admin.from("ramas").select("id, nombre");
  const ramasPorNombre = new Map(
    (ramas ?? []).map((r) => [r.nombre.toLowerCase(), r.id])
  );

  const { data: existentes } = await admin.from("miembros").select("dni");
  const dnisExistentes = new Set((existentes ?? []).map((m) => m.dni));
  const dnisEnEsteArchivo = new Set();

  let creados = 0;
  let duplicados = 0;
  const errores = [];

  for (let numeroFila = 2; numeroFila <= hoja.rowCount; numeroFila++) {
    const fila = hoja.getRow(numeroFila);

    const dni = celda(fila.getCell(columnaDni).value)?.toString().trim();
    const nombreRaw = celda(fila.getCell(columnaNombre).value)?.toString().trim();

    if (!dni && !nombreRaw) continue; // fila vacía

    if (!dni) {
      errores.push({ fila: numeroFila, motivo: "Falta el DNI" });
      continue;
    }

    if (dnisExistentes.has(dni) || dnisEnEsteArchivo.has(dni)) {
      duplicados++;
      continue;
    }

    if (dni.length < 6) {
      errores.push({
        fila: numeroFila,
        motivo: "El DNI debe tener al menos 6 caracteres",
      });
      continue;
    }

    const nombreParseado = parseNombreApellido(nombreRaw);
    if (!nombreParseado) {
      errores.push({
        fila: numeroFila,
        motivo: 'Nombre inválido (se espera el formato "Apellido, Nombre")',
      });
      continue;
    }

    const funcion = celda(fila.getCell(columnaFuncion).value);
    const rama_id = mapearRamaId(funcion, ramasPorNombre);
    if (!rama_id) {
      errores.push({
        fila: numeroFila,
        motivo: `No existe en la plataforma la rama correspondiente a "${funcion}"`,
      });
      continue;
    }

    const fecha_nacimiento = columnaFecha
      ? parseFechaNacimiento(celda(fila.getCell(columnaFecha).value))
      : null;

    try {
      await crearMiembroConAcceso(admin, {
        nombre: nombreParseado.nombre,
        apellido: nombreParseado.apellido,
        dni,
        rama_id,
        fecha_nacimiento,
      });
      dnisEnEsteArchivo.add(dni);
      creados++;
    } catch (err) {
      errores.push({ fila: numeroFila, motivo: err.message });
    }
  }

  revalidatePath("/admin/miembros");

  return { creados, duplicados, errores };
}
