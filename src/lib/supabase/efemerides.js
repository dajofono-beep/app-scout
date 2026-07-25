// El bucket "efemerides" es público (a diferencia de "comprobantes"):
// la imagen/placa de una efeméride no es información sensible, así
// que se sirve directo por su URL pública, sin firmar.
const BUCKET = "efemerides";
const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];

export async function subirImagenEfemeride(admin, efemerideId, archivo) {
  if (archivo.size > MAX_BYTES) {
    throw new Error("La imagen no puede pesar más de 5 MB");
  }
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    throw new Error("La imagen debe ser JPG, PNG o WEBP");
  }

  const extension = archivo.name.split(".").pop() || "jpg";
  const ruta = `${efemerideId}/imagen.${extension}`;

  const { error } = await admin.storage
    .from(BUCKET)
    .upload(ruta, archivo, { contentType: archivo.type, upsert: true });
  if (error) throw new Error("No se pudo subir la imagen: " + error.message);

  const { data } = admin.storage.from(BUCKET).getPublicUrl(ruta);
  return data.publicUrl;
}
