// El bucket "comprobantes" es privado (sin políticas RLS), así que solo
// se accede a él desde el servidor con el cliente admin (service role).
const BUCKET = "comprobantes";
const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "application/pdf",
];

export async function subirComprobante(admin, pagoId, archivo) {
  if (archivo.size > MAX_BYTES) {
    throw new Error("La imagen del comprobante no puede pesar más de 5 MB");
  }
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    throw new Error("El comprobante debe ser una imagen (JPG, PNG, WEBP, HEIC) o un PDF");
  }

  const extension = archivo.name.split(".").pop() || "jpg";
  const ruta = `${pagoId}/comprobante.${extension}`;

  const { error } = await admin.storage
    .from(BUCKET)
    .upload(ruta, archivo, { contentType: archivo.type, upsert: true });
  if (error) throw new Error("No se pudo subir el comprobante: " + error.message);

  return ruta;
}

export async function urlFirmadaComprobante(admin, ruta) {
  if (!ruta) return null;
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(ruta, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}
