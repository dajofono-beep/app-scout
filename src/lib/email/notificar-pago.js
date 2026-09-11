import nodemailer from "nodemailer";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://azimut-kappa.vercel.app";

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

// Avisa por mail a los administradores que optaron por recibirlos
// cuando se registra un pago (efectivo/transferencia o Mercado Pago).
// Pensado para nunca interrumpir el flujo de pago: cualquier error acá
// (config incompleta, falla de red, credenciales vencidas) se loguea y
// se ignora en silencio — la plata ya quedó registrada de todos modos.
export async function notificarPagoAAdmins({ partes, medioPago, origen }) {
  try {
    const admin = createAdminClient();

    const { data: config } = await admin
      .from("notificaciones_pagos_config")
      .select("email, app_password, activo")
      .eq("id", 1)
      .maybeSingle();
    if (!config?.activo || !config.email || !config.app_password) return;

    const { data: administradores } = await admin
      .from("administradores")
      .select("auth_user_id")
      .eq("recibe_notificaciones_pagos", true);
    if (!administradores || administradores.length === 0) return;

    const emails = (
      await Promise.all(
        administradores.map(async (a) => {
          const { data } = await admin.auth.admin.getUserById(a.auth_user_id);
          return data?.user?.email ?? null;
        })
      )
    ).filter(Boolean);
    if (emails.length === 0) return;

    const miembroIds = partes.map((p) => p.miembro_id);
    const { data: miembros } = await admin
      .from("miembros")
      .select("id, nombre, apellido")
      .in("id", miembroIds);
    const nombrePorId = Object.fromEntries(
      (miembros ?? []).map((m) => [m.id, `${m.apellido}, ${m.nombre}`])
    );

    const total = partes.reduce((acc, p) => acc + Number(p.importe), 0);
    const detalle = partes
      .map((p) => `${nombrePorId[p.miembro_id] ?? "—"}: ${formatoMoneda(p.importe)}`)
      .join("<br>");

    const estadoTexto =
      origen === "mercadopago"
        ? "Se acreditó al instante (Mercado Pago), no requiere revisión."
        : "Queda pendiente de tu revisión — se acredita solo si nadie lo observa en 4 días.";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: config.email, pass: config.app_password },
    });

    await transporter.sendMail({
      from: `Azimut <${config.email}>`,
      to: emails.join(", "),
      subject: `Nuevo pago registrado — ${formatoMoneda(total)}`,
      html: `
        <p>Se registró un nuevo pago en Azimut.</p>
        <p><strong>Medio de pago:</strong> ${medioPago}</p>
        <p><strong>Detalle:</strong><br>${detalle}</p>
        <p><strong>Total:</strong> ${formatoMoneda(total)}</p>
        <p>${estadoTexto}</p>
        <p><a href="${SITE_URL}/admin/pagos">Ver en Azimut →</a></p>
      `,
    });
  } catch (err) {
    console.error("notificarPagoAAdmins:", err.message);
  }
}
