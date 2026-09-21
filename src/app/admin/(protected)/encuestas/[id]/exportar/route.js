import path from "path";
import PDFDocument from "pdfkit";
import { createClient } from "@/lib/supabase/server";
import { armarResultados } from "../../resultados";
import { dibujarTortaPdf } from "../../dibujar-torta-pdf";
import { escribirNominaPdf } from "../../escribir-nomina-pdf";

const LOGO_PATH = path.join(process.cwd(), "public", "icono-azimut.png");

export async function POST(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("No autenticado", { status: 401 });

  const { data: admin } = await supabase
    .from("administradores")
    .select("auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!admin) return new Response("No autorizado", { status: 403 });

  const { data: encuesta } = await supabase
    .from("encuestas")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!encuesta) return new Response("No encontrada", { status: 404 });

  const { data: ramas } = await supabase.from("ramas").select("id, nombre").order("nombre");
  const { data: familias } = await supabase.from("familias").select("id, nombre").order("nombre");
  const { data: miembros } = await supabase
    .from("miembros")
    .select("id, nombre, apellido, rama_id, familia_id, activo")
    .order("apellido");
  const { data: respuestas } = await supabase
    .from("encuesta_respuestas")
    .select("*")
    .eq("encuesta_id", id);

  const { grupos, respondieron, faltan, conteoOpciones, conteoPorRama, destinatarioTexto } =
    armarResultados({ encuesta, miembros, familias, ramas, respuestas });

  const formData = await request.formData();
  const incluirNomina = formData.get("incluir_nomina") === "on";

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const listo = new Promise((resolve) => doc.on("end", resolve));

  const margin = doc.page.margins.left;
  const logoSize = 50;
  const anchoTexto = doc.page.width - margin * 2 - logoSize - 15;

  doc.image(LOGO_PATH, doc.page.width - margin - logoSize, margin, {
    width: logoSize,
    height: logoSize,
  });

  doc
    .fontSize(18)
    .fillColor("#0f172a")
    .text(encuesta.titulo, margin, margin, { width: anchoTexto });

  let y = Math.max(doc.y, margin + logoSize) + 10;

  doc.fontSize(10).fillColor("#64748b");
  if (encuesta.descripcion) {
    doc.text(`Descripción: ${encuesta.descripcion}`, margin, y, { width: anchoTexto });
    y = doc.y + 4;
  }
  const vigenciaTexto = encuesta.fecha_cierre
    ? `${encuesta.fecha_inicio} al ${encuesta.fecha_cierre}`
    : `Desde ${encuesta.fecha_inicio}`;
  doc.text(`Vigencia: ${vigenciaTexto}`, margin, y, { width: anchoTexto });
  y = doc.y + 4;
  doc.text(`Destinatarios: ${destinatarioTexto}`, margin, y, { width: anchoTexto });
  y = doc.y + 16;

  doc
    .fontSize(10)
    .fillColor("#64748b")
    .text(`Resultados exportados el ${new Date().toLocaleDateString("es-AR")}`, margin, y);
  y = doc.y + 4;
  doc
    .fontSize(11)
    .fillColor("#334155")
    .text(`Respondieron ${respondieron.length} de ${grupos.size}`, margin, y);
  y = doc.y + 20;

  // Apiladas una debajo de la otra (no lado a lado): las etiquetas de
  // las opciones pueden ser largas y se pisarían si fueran en columnas.
  if (conteoOpciones) {
    y = dibujarTortaPdf(doc, { x: margin, y, titulo: "Respuestas", datos: conteoOpciones });
  }
  y = dibujarTortaPdf(doc, {
    x: margin,
    y,
    titulo: "Participación por rama",
    datos: conteoPorRama,
  });

  doc.y = y;

  if (incluirNomina) {
    y += 20;
    y = escribirNominaPdf(doc, {
      x: margin,
      y,
      anchoTexto,
      titulo: "Respondieron",
      grupos: respondieron,
      color: "#334155",
    });

    if (faltan.length > 0) {
      y += 10;
      y = escribirNominaPdf(doc, {
        x: margin,
        y,
        anchoTexto,
        titulo: "Faltan",
        grupos: faltan,
        color: "#94a3b8",
      });
    }
  }

  doc.end();
  await listo;
  const buffer = Buffer.concat(chunks);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${encuesta.titulo.replace(/[\\/:*?"<>|]/g, "")} - resultados.pdf"`,
    },
  });
}
