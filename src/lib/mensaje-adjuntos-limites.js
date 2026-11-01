// Compartido entre el formulario (cliente) y la validación del servidor.
// Los Server Actions están limitados a 5 MB por solicitud
// (next.config.mjs); 4 MB en total por mensaje deja margen para el resto
// de los campos.
export const MAX_ADJUNTOS = 3;
export const MAX_BYTES_TOTAL = 4 * 1024 * 1024;

export function formatoPeso(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toLocaleString("es-AR", { maximumFractionDigits: 1 })} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
