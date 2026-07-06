// Script de uso único (o para agregar más administradores).
// Ejecutar con:  node --env-file=.env.local scripts/create-admin.mjs

import { createClient } from "@supabase/supabase-js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Corré el script con: node --env-file=.env.local scripts/create-admin.mjs"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rl = readline.createInterface({ input, output });

const nombre = await rl.question("Nombre del administrador: ");
const email = await rl.question("Email para iniciar sesión: ");
const password = await rl.question(
  "Contraseña (mínimo 6 caracteres, se va a ver en pantalla): "
);
rl.close();

const { data: userData, error: userError } =
  await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

if (userError) {
  console.error("Error creando el usuario:", userError.message);
  process.exit(1);
}

const { error: adminError } = await supabase
  .from("administradores")
  .insert({ auth_user_id: userData.user.id, nombre });

if (adminError) {
  console.error("Error insertando en administradores:", adminError.message);
  process.exit(1);
}

console.log(`\nAdministrador "${nombre}" creado con éxito (${email}).`);
