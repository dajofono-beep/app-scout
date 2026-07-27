// El bucket "perfiles" es público: la foto de perfil no es información
// sensible, se sirve directo por su URL pública, sin firmar.
const BUCKET = "perfiles";
const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];

export async function subirFotoPerfil(admin, miembroId, archivo) {
  if (archivo.size > MAX_BYTES) {
    throw new Error("La foto no puede pesar más de 5 MB");
  }
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    throw new Error("La foto debe ser JPG, PNG o WEBP");
  }

  const extension = archivo.name.split(".").pop() || "jpg";
  const ruta = `${miembroId}/foto.${extension}`;

  const { error } = await admin.storage
    .from(BUCKET)
    .upload(ruta, archivo, { contentType: archivo.type, upsert: true });
  if (error) throw new Error("No se pudo subir la foto: " + error.message);

  const { data } = admin.storage.from(BUCKET).getPublicUrl(ruta);
  return data.publicUrl;
}
