// Genera un backup completo de la base de datos (esquema + datos) vía
// la CLI de Supabase. Requiere Docker Desktop corriendo y el proyecto
// ya vinculado (npx supabase link --project-ref ...).
//
// Uso: npm run backup

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const carpeta = path.join(__dirname, "..", "backups");
if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta);

const fecha = new Date().toISOString().slice(0, 10);
const archivoEsquema = path.join(carpeta, `tmp-esquema-${fecha}.sql`);
const archivoDatos = path.join(carpeta, `tmp-datos-${fecha}.sql`);
const archivoFinal = path.join(carpeta, `backup-${fecha}.sql`);

function correr(comando) {
  execSync(comando, { stdio: "inherit" });
}

console.log("Generando el esquema (tablas, funciones, políticas)...");
correr(`npx --yes supabase db dump --linked -f "${archivoEsquema}"`);

console.log("Generando los datos...");
correr(`npx --yes supabase db dump --linked --data-only -f "${archivoDatos}"`);

const contenido =
  fs.readFileSync(archivoEsquema, "utf8") + fs.readFileSync(archivoDatos, "utf8");
fs.writeFileSync(archivoFinal, contenido);
fs.unlinkSync(archivoEsquema);
fs.unlinkSync(archivoDatos);

console.log(`\nListo: ${archivoFinal}`);
