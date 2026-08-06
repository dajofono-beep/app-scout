# Registro de cambios — Azimut

Este archivo documenta, en orden cronológico, todas las funcionalidades y cambios que se le fueron sumando a la aplicación. Se actualiza agregando una entrada nueva al final cada vez que se implementa y confirma un cambio.

---

## 2026-07-06 — Arranque del proyecto

- Se armó el proyecto base: Next.js + Supabase, pensado para llevar la cuenta corriente de cuotas del Grupo Scout.
- Login de administrador, panel protegido, y ABM de Ramas / Productos (hoy "Conceptos") / Miembros.
- Manejo de Cargos y el flujo de ingreso/dashboard de las familias (login por rama → nombre → DNI).
- Pantalla de admin para revisar pagos, con filtros y opción de cancelar/reactivar.
- Se agregó el concepto de "Hermanos" (familias), la escala de descuento entre hermanos, y la posibilidad de que un concepto sea cuotable (cargos en cuotas mensuales).
- Rediseño del login familiar como un solo formulario con dos desplegables (rama, nombre).
- Se agregó fecha de nacimiento a los miembros y se rediseñó la sección Miembros como una tabla filtrable.

## 2026-07-14

- Se excluyó del repositorio el archivo real de miembros (datos sensibles).
- Importación masiva de miembros desde Excel.
- Los conceptos cuotables generan automáticamente un cargo por cada cuota mensual.

## 2026-07-22

- Se permitió reasignar pagos a otro miembro y cancelar cargos individuales.
- Miembros, Pagos, Cargos, Ramas, Familias y Productos pasaron todos al mismo patrón: tabla con buscador + ficha individual por registro.
- El admin puede confirmar un pago manualmente sin esperar los 4 días de la regla automática.
- Se reordenó el menú de administración, agrupando Familias/Descuentos/Ramas bajo un grupo colapsable "Administración".
- Se evitó poder cargar el mismo concepto dos veces al mismo miembro.
- Las familias pueden subir una foto del comprobante de pago y elegir el medio de pago de una lista.
- Rediseño de Mi Cuenta con pestañas: "Cargar un pago" y una vista visual de "Movimientos", con gráfico de torta.

## 2026-07-23 al 2026-07-24 — Identidad visual

- Se aplicó una paleta celeste/azul cálida a Mi Cuenta, al login familiar, al panel de administración y a la pantalla de cambio de contraseña.
- Se sumó el logo del Grupo a las pantallas de login y encabezados principales.
- Ajustes de espaciado y tamaño del logo.
- Se reconstruyó el dashboard "Resumen" del admin con estadísticas más completas del Grupo, con títulos y encabezados en negrita en todo el panel.
- Los avatares de los miembros se colorean según su rama.
- Mensaje de agradecimiento al registrar un pago.
- El listado de Cargos del admin se ordena por fecha del cargo en vez de por fecha de creación.

## 2026-07-25 — Sección Social

- Se agregó un calendario Social (cumpleaños + efemérides) para las familias.
- Se renombró el campo de contraseña del login a "Contraseña" (en vez de mostrar "DNI").
- "Efemérides" pasó a llamarse "Fechas importantes", con soporte de rango de fechas.
- Las fechas importantes se clasifican por tipo, con íconos en el calendario.

## 2026-07-26 al 2026-07-27

- Barra de progreso proporcional en la vista Pagos/Cargos.
- Página de Perfil (autogestión) y buscador de miembros del Grupo.
- Fecha de vencimiento por producto/concepto, y una línea de tiempo interactiva de Pagos/Cargos (con fechas en los tooltips).
- Sub-pestañas Todos/Cargos/Pagos dentro del Listado de Movimientos; el filtro de Movimientos pasó a ser un desplegable.
- El calendario se movió al lado de Cumpleaños/Fechas importantes en Social.
- Tarjeta "Pagos Faltantes" en el Resumen del admin (antes "Pagos pendientes").
- El listado de Cargos por defecto muestra solo los activos; Mi Cuenta oculta los cargos cancelados.
- Los saldos de los hermanos en Mi Cuenta se ordenan por orden_familia.
- La opción de repartir un pago en partes iguales quedó como default en el desplegable de asignación.
- Se reordenaron las secciones de asignación de cargos: familia primero, miembro al final.

## 2026-07-28 — PWA y mensajería

- Manifest de PWA, íconos de la app y metadata de marca (instalable en el celular).
- Se permitieron importes negativos en cargos manuales (para descuentos/correcciones puntuales).
- Rediseño de la barra superior mobile de Mi Cuenta con menú colapsable (hamburguesa).
- Menú de cuenta aplanado, con secciones placeholder para lo que faltaba construir.
- Sección Descargas, con los PDF de autorización agrupados.
- Sistema de Mensajería: el admin redacta mensajes dirigidos (Todos / Rama / Hermanos / Participante puntual) y las familias los ven en Mi Cuenta.
- Título e ícono arriba del calendario de Social.

## 2026-07-29 — Pulido de Mi Cuenta

- Encabezado compartido con botón de volver en todas las secciones de Mi Cuenta.
- El campo de importe de pago se formatea con separador de miles y signo $ mientras se escribe.
- Pantalla de carga (spinner con forma de brújula) mientras carga Mi Cuenta.
- La barra mobile también aparece en Perfil, igual que el resto de Mi Cuenta.
- Se unificó la asignación de cargos (familia/rama/miembro) en una sola tarjeta con un desplegable de destinatario.
- Tarjeta de "Cancelación de Cargos" para cancelar cargos masivamente.
- Se renombró el texto visible "Familia" a "Hermanos" en toda la aplicación (sin tocar la base de datos ni las rutas).

## 2026-07-30 — Filtros y el asistente SanMa

- Filtro por hermano puntual en Movimientos, dentro de Mi Cuenta.
- Cada mensaje en Mi Cuenta muestra a quién va dirigido.
- **Se sumó Consultas**: un chat con inteligencia artificial (Gemini) que responde preguntas de las familias en base a tres documentos del Grupo (Proyecto Educativo y reuniones de padres).
- Varias correcciones sobre la marcha: manejo de errores para que no se oculte el mensaje real en producción, actualización del modelo de IA usado, reintentos automáticos si el modelo está saturado.
- Se le puso nombre al asistente: **SanMa**, con animaciones propias (esperando / pensando) en el chat.

## 2026-07-31 — Navegación mobile y administración

- Se ocultó la barra de estado mobile fuera de la pantalla Principal, y se armó el manejo del botón Atrás del celular dentro de Mi Cuenta y en Perfil.
- Se agrandaron los gifs de SanMa en Consultas.
- La ficha de un miembro pasó a tener solapas: "Datos Generales" y "Cargos" (asignar/eliminar productos sin salir de la ficha).
- Se renombró "Productos" a "Conceptos" en todo el texto visible del panel de administración.
- Nueva sección **Exportar**: reporte de cargos y pagos en Excel (con varias iteraciones hasta llegar al formato final: una hoja por rama, resumen de saldos por integrante).
- Se bloqueó el login familiar tras 5 intentos fallidos (5 minutos de espera).
- Se rehizo la barra de navegación del admin para que se vea bien en mobile (menú hamburguesa, como en Mi Cuenta).
- La rama "Adultos" no permite cargar Hermanos ni Orden entre hermanos.

## 2026-08-01 — Cierre de sesión y comprobantes

- Confirmación antes de cerrar sesión, tanto en Mi Cuenta como en Administración, con un diálogo propio (no el cartel nativo del navegador) — con varias vueltas hasta lograr que en celular la app cierre de verdad y no solo muestre el login.
- Entrada por voz en Consultas (solo en celular, y solo si el navegador la soporta).
- Al cargar un pago en efectivo, el celular abre la cámara directo (en vez del selector de archivos general).
- Las fotos de comprobantes se comprimen antes de subirse, para evitar el límite de tamaño de los server actions.
- El Listado de Movimientos se ordena del más reciente al más viejo.
- El botón Atrás desde el login, en celular, cierra la app directamente.

## 2026-08-02 — Backups

- Se afinó el cierre de la app desde el login para que funcione con una sola pulsación de Atrás, sin importar de dónde se venga.
- Se dejó armado `npm run backup`: un comando que genera un backup completo (esquema + datos) de la base de datos vía la CLI de Supabase, en un solo archivo, sin subirlo nunca al repositorio.

## 2026-08-03 — Pagos en lote y Grupos de Padres

- El admin puede seleccionar y confirmar varios pagos pendientes a la vez (checkbox + "Confirmar seleccionados"), sin perder la opción de confirmar uno solo.
- Nueva sección **Grupos de Padres** en Administración: un link de WhatsApp por rama (todas menos Adultos) y un interruptor para mostrarlos o no en Mi Cuenta. Los links viven en una tabla aparte de `ramas` (que es de lectura pública) para que nunca queden expuestos sin loguearse. En Mi Cuenta, la tarjeta del grupo aparece debajo de los mensajes.
