const PALETA = [
  "bg-red-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-cyan-600",
  "bg-orange-500",
];

// Color determinístico según el id de la rama, para que cada rama se vea
// siempre con el mismo color de avatar/chip.
export function colorPara(id) {
  if (!id) return "bg-slate-400";
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETA[hash % PALETA.length];
}

export function iniciales(nombre, apellido) {
  const a = (apellido ?? "").trim()[0] ?? "";
  const n = (nombre ?? "").trim()[0] ?? "";
  return (a + n).toUpperCase() || "?";
}
