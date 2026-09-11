// Chip blanco redondeado para los íconos del menú lateral. Las
// imágenes de /Barra Lateral no son todas transparentes (algunas
// vienen con fondo blanco sólido, otras sí son transparentes) — este
// chip uniforma la apariencia de todas sobre el fondo con foto.
export default function IconoMenu({ src, alt = "", className = "" }) {
  return (
    <span
      className={`w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 p-1 ${className}`}
    >
      <img src={src} alt={alt} className="w-full h-full object-contain" />
    </span>
  );
}
