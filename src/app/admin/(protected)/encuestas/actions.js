"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

const TIPOS_DESTINATARIO_VALIDOS = ["todos", "rama", "familia", "miembro"];
const TIPOS_RESPUESTA_VALIDOS = ["opcion_unica", "texto_libre"];
const ALCANCES_VALIDOS = ["miembro", "familia"];

const ALFABETO_CODIGO = "23456789abcdefghjkmnpqrstuvwxyz"; // sin 0/1/l/o/i, para que no se confundan al tipear

function generarCodigo() {
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)];
  }
  return codigo;
}

function leerCampos(formData) {
  const titulo = formData.get("titulo")?.toString().trim();
  const descripcion = formData.get("descripcion")?.toString().trim() || null;
  const tipo_respuesta = formData.get("tipo_respuesta")?.toString();
  const alcance_respuesta = formData.get("alcance_respuesta")?.toString();
  const destinatario_tipo = formData.get("destinatario_tipo")?.toString();
  const destinatario_id = formData.get("destinatario_id")?.toString() || null;
  const fecha_inicio = formData.get("fecha_inicio")?.toString();
  const fecha_cierre = formData.get("fecha_cierre")?.toString() || null;

  if (!titulo) throw new Error("El título es obligatorio");
  if (!TIPOS_RESPUESTA_VALIDOS.includes(tipo_respuesta)) {
    throw new Error("Elegí un tipo de respuesta válido");
  }
  if (!ALCANCES_VALIDOS.includes(alcance_respuesta)) {
    throw new Error("Elegí quién responde la encuesta");
  }
  if (!TIPOS_DESTINATARIO_VALIDOS.includes(destinatario_tipo)) {
    throw new Error("Elegí un destinatario válido");
  }
  if (destinatario_tipo !== "todos" && !destinatario_id) {
    throw new Error("Elegí a quién va dirigida la encuesta");
  }
  if (!fecha_inicio) throw new Error("La fecha de inicio es obligatoria");
  if (fecha_cierre && fecha_cierre < fecha_inicio) {
    throw new Error("La fecha de cierre no puede ser anterior a la de inicio");
  }

  let opciones = null;
  if (tipo_respuesta === "opcion_unica") {
    opciones = (formData.get("opciones")?.toString() ?? "")
      .split("\n")
      .map((o) => o.trim())
      .filter(Boolean);
    if (opciones.length < 2) {
      throw new Error("Cargá al menos dos opciones para elegir");
    }
  }

  return {
    titulo,
    descripcion,
    tipo_respuesta,
    opciones,
    alcance_respuesta,
    destinatario_tipo,
    destinatario_id: destinatario_tipo === "todos" ? null : destinatario_id,
    fecha_inicio,
    fecha_cierre,
  };
}

export async function crearEncuesta(formData) {
  const { supabase, user } = await requireSession();
  const campos = leerCampos(formData);

  // Reintenta si el código corto (al azar) choca con uno ya existente —
  // con 6 caracteres de un alfabeto de 32 es prácticamente imposible,
  // pero no cuesta nada cubrirlo.
  let data, error;
  for (let intento = 0; intento < 3; intento++) {
    ({ data, error } = await supabase
      .from("encuestas")
      .insert({ ...campos, creado_por: user.id, codigo: generarCodigo() })
      .select("id")
      .single());
    if (!error || error.code !== "23505") break;
  }
  if (error) throw new Error(error.message);

  revalidatePath("/admin/encuestas");
  // Va directo a la ficha (en vez del listado) para que el link para
  // compartir quede a la vista apenas se crea la encuesta.
  redirect(`/admin/encuestas/${data.id}`);
}

export async function actualizarEncuesta(formData) {
  const { supabase } = await requireSession();
  const id = formData.get("id");
  const campos = leerCampos(formData);
  const activo = formData.get("activo") === "on";

  const { error } = await supabase
    .from("encuestas")
    .update({ ...campos, activo })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/encuestas");
  revalidatePath(`/admin/encuestas/${id}`);
}

export async function eliminarEncuesta(formData) {
  const { supabase } = await requireSession();
  const id = formData.get("id");

  const { error } = await supabase.from("encuestas").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/encuestas");
  redirect("/admin/encuestas");
}
