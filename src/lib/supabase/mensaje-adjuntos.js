import { randomUUID } from "crypto";
import { MAX_ADJUNTOS, MAX_BYTES_TOTAL } from "@/lib/mensaje-adjuntos-limites";

// El bucket es privado (sin políticas RLS): solo se accede desde el
// servidor con el cliente admin (service role).
const BUCKET = "mensajes-adjuntos";

// Devuelve solo los archivos reales del campo (el navegador manda un
// archivo vacío si no se eligió ninguno).
export function archivosNuevos(formData) {
  return formData.getAll("adjuntos").filter((f) => typeof f !== "string" && f.size > 0);
}

// `existentes`: filas de mensaje_adjuntos que se conservan ({ tamano }).
// Tira un Error con el motivo si no se cumplen los límites o si algún
// archivo no es realmente un PDF (el tipo que informa el navegador no
// alcanza: se revisa que empiece con "%PDF-").
export async function validarAdjuntos(nuevos, existentes = []) {
  if (existentes.length + nuevos.length > MAX_ADJUNTOS) {
    throw new Error(`Un mensaje puede tener hasta ${MAX_ADJUNTOS} archivos adjuntos`);
  }
  const bytes =
    existentes.reduce((acc, a) => acc + a.tamano, 0) + nuevos.reduce((acc, f) => acc + f.size, 0);
  if (bytes > MAX_BYTES_TOTAL) {
    throw new Error("Los adjuntos de un mensaje no pueden pesar más de 4 MB en total");
  }
  for (const archivo of nuevos) {
    const cabecera = await archivo.slice(0, 5).text();
    if (cabecera !== "%PDF-") {
      throw new Error(`"${archivo.name}" no es un PDF válido`);
    }
  }
}

function nombreSeguro(nombre) {
  const base = String(nombre ?? "").split(/[\\/]/).pop().trim();
  return (base || "documento.pdf").slice(0, 120);
}

// Sube los archivos y devuelve las filas listas para insertar en
// mensaje_adjuntos. Si falla alguna subida, borra las que ya subió.
export async function subirAdjuntos(admin, mensajeId, nuevos) {
  const subidos = [];
  for (const archivo of nuevos) {
    const ruta = `${mensajeId}/${randomUUID()}.pdf`;
    const { error } = await admin.storage
      .from(BUCKET)
      .upload(ruta, archivo, { contentType: "application/pdf" });
    if (error) {
      await borrarArchivos(admin, subidos.map((s) => s.ruta));
      throw new Error("No se pudo subir el archivo: " + error.message);
    }
    subidos.push({
      mensaje_id: mensajeId,
      nombre: nombreSeguro(archivo.name),
      ruta,
      tamano: archivo.size,
    });
  }
  return subidos;
}

export async function borrarArchivos(admin, rutas) {
  if (!rutas.length) return;
  await admin.storage.from(BUCKET).remove(rutas);
}

export async function urlFirmadaAdjunto(admin, ruta) {
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(ruta, 60);
  if (error) return null;
  return data.signedUrl;
}
