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
- Se agregó este mismo `CHANGELOG.md`, reconstruido a partir del historial real de commits, y se dejó como hábito mantenerlo actualizado con cada cambio nuevo.
- Se agregó `MANUAL_DE_USO.md`: un manual breve, paso a paso, pensado para que lo consulten las familias del Grupo — se actualiza también con cada funcionalidad nueva de cara al usuario final.

## 2026-08-06 — Mercado Pago

- Nueva sección **Medios de Pago** en Administración: habilitar o no, uno por uno, Efectivo/Transferencia/Mercado Pago — lo que esté deshabilitado deja de aparecer en el desplegable de "Cargar un pago" de Mi Cuenta.
- Pantalla de configuración exclusiva para Mercado Pago (titular de la cuenta, credenciales de prueba y de producción por separado, qué ambiente está activo, y un campo de recargo ya preparado para más adelante) — de acceso admin-only, nunca visible ni para las familias ni para el resto del panel.
- **Se integró el cobro real por Mercado Pago** (Checkout Pro): al elegir ese medio en Mi Cuenta, la familia es redirigida al checkout de Mercado Pago; cuando el pago se aprueba, un webhook lo acredita a su cuenta al instante, sin esperar los 4 días ni intervención del admin. Los pagos manuales (Efectivo/Transferencia) siguen exactamente igual que antes.
- Probado de punta a punta con credenciales de prueba y en producción con Mercado Pago real — funciona correctamente.
- Se corrigió la ficha de un pago en Administración: el desplegable "Medio de pago" usaba una lista vieja fija (sin Mercado Pago), así que un pago de Mercado Pago se mostraba como "Sin especificar" — y guardar sin querer lo hubiera borrado. Ahora usa la misma tabla `medios_pago` como fuente única.

## 2026-08-11 — Alerta de próximo vencimiento en Mi Cuenta

- Nuevo campo en Concepto: "Avisar en Mi Cuenta si no está pago cerca de esta fecha" (solo tiene efecto si el concepto tiene fecha de vencimiento cargada). Los conceptos ya existentes quedan sin marcar hasta que el admin lo active a mano en cada uno.
- La tarjeta de saldo de Mi Cuenta ahora tiene un botón **"Más información"**, siempre disponible, que despliega — por cada hermano, nunca mezclando entre ellos — si tiene conceptos marcados ya vencidos sin pagar (con el monto) o un próximo concepto marcado a futuro sin cubrir, o "Estás al día para los próximos eventos" si no hay nada pendiente.
- El cálculo se hace en cascada (pagos más viejos primero) sobre los cargos de cada hermano por separado, igual que en el reporte de Excel — a propósito, para que lo pagado de más por un hermano no tape la deuda real de otro. Por eso este número puede diferir del "Saldo pendiente a la fecha" de la pestaña Pagos/Cargos, que sí mezcla a toda la familia.
- Corregidos dos bugs en el camino: la fecha de vencimiento se lee del concepto actual (no de la copia vieja guardada en el cargo), y la consulta a la tabla `productos` desde Mi Cuenta pasó a usar el cliente admin (esa tabla es de lectura solo para administradores).

## 2026-08-11 — Nueva descarga

- Se sumó el "Formulario Declaración Jurada de Salud - Scouts de Argentina" a la tarjeta "Autorizaciones Anuales" de la sección Descargas.

## 2026-08-12 — Agregados al panel de Resumen (admin)

- Nueva tarjeta **"Riesgo de no poder participar del próximo evento"**: cuenta cuántas familias tienen algún miembro con conceptos marcados (ver alerta de vencimiento de Mi Cuenta) vencidos o próximos sin cubrir.
- Nueva tarjeta **"Pagos pendientes de revisión"**, con la cantidad y un link directo a la lista filtrada en Pagos.
- Nueva tarjeta **"Cobrado por medio de pago"**, con el total acreditado agrupado por Efectivo/Transferencia/Mercado Pago.
- Las tres respetan el filtro por rama que ya tenía el panel (excepto el link a Pagos pendientes, que siempre muestra todos sin importar la rama elegida), y quedan ocultas detrás de un botón **"Más información"**, igual que en Mi Cuenta.

## 2026-08-12 — Comprobante obligatorio al cargar un pago

- Al cargar un pago en Efectivo o Transferencia, ahora es obligatorio adjuntar el comprobante (antes era opcional). El campo cambió su texto a "Adjuntar comprobante de pago".
- Elegir Efectivo sigue abriendo la cámara del celular directo; elegir Transferencia ahora abre el buscador de archivos con los PDF priorizados en vez de la galería de fotos.

## 2026-08-12 — Más información para SanMa

- Se sumaron dos documentos nuevos a la base de conocimiento de SanMa (Consultas): "Historia del Grupo Scout Libertador San Martín" y una guía general de "Vida Scout" (campamentos, especialidades, progresión, ceremonias y técnicas de vida al aire libre).
- Se ajustaron las instrucciones internas para que SanMa distinga cuál de los cuatro documentos es específico de este Grupo (Historia del Grupo, con prioridad si preguntan por su historia o identidad) y cuáles son de carácter general del escultismo.

## 2026-08-12 — Ajuste de texto en Mi Cuenta

- En la tarjeta de saldo, el mensaje "Estás al día para los próximos eventos" pasó a decir "Estás al día para participar del próximo evento".

## 2026-08-12 — Comprobante en PDF

- Corregido un bug: al hacer obligatorio el comprobante y priorizar PDF para Transferencia, la subida fallaba porque tanto la validación de la app como el bucket de Storage solo aceptaban imágenes. Ahora se acepta también PDF en ambos lados.

## 2026-08-12 — El pago no se registra si falla el comprobante

- Corregido un bug de fondo: si la subida del comprobante fallaba (por ejemplo, por un archivo con formato no soportado), el pago igual quedaba registrado, aunque la familia viera un error. Ahora, si el comprobante no se pudo subir, el pago se borra antes de mostrar el error.
- De paso se corrigió el mismo problema en Mercado Pago: cuando falla la conexión con Mercado Pago, el pago creado ahora sí se cancela correctamente (antes el intento de cancelación no tenía efecto por un permiso de base de datos).
- Se corrigió también el mensaje de error que veía la familia al cargar un pago: en producción Next.js oculta el detalle de cualquier error, así que ahora se muestra el motivo real (por ejemplo, "El comprobante debe ser una imagen... o un PDF") en vez de un mensaje técnico genérico.

## 2026-08-12 — Datos viejos al navegar en Administración

- Corregido un bug: al navegar entre secciones del panel de administración (por ejemplo, ir a Resumen después de asignar cargos), a veces se mostraba información desactualizada, y solo se solucionaba cerrando sesión y volviendo a entrar. Causa: el menú del admin dejaba que Next.js precargue y guarde en el navegador una copia de cada pantalla, algo que solo ocurre en producción (no se puede reproducir en desarrollo). Se desactivó esa precarga en los tres menús de navegación del admin, para que cada clic traiga siempre los datos frescos del servidor.

## 2026-08-12 — Rediseño de la acreditación de Mercado Pago

- Corregido un bug de fondo: si la familia cancelaba o desistía del pago dentro de la app de Mercado Pago, el pago quedaba registrado como "Pendiente" para siempre en Azimut, sin ninguna forma automática de resolverse.
- Se rediseñó el flujo: ahora el pago no se registra en la base hasta que Mercado Pago confirma que fue aprobado (vía el webhook, como ya funcionaba para acreditar). Si la familia cancela, cierra la app, o el pago es rechazado, no se crea ningún registro — nada que limpiar a mano.

## 2026-08-12 — Comprobante solo con medio de pago elegido

- Corregido: al cargar un pago sin haber elegido todavía Efectivo o Transferencia, igual se podía tocar el campo de comprobante y abría el buscador de archivos o la cámara. Ahora ese campo recién aparece una vez elegido el medio de pago correspondiente.

## 2026-08-12 — Botón "Enviar" cortado en Consultas

- Corregido: en celulares angostos, el botón "Enviar" del chat con SanMa quedaba fuera de la pantalla. El cuadro de texto y el micrófono ahora van en una fila, y "Enviar" pasó a su propia fila ocupando todo el ancho.

## 2026-08-21 — SanMa dejó de responder

- Corregido: SanMa (Consultas) dejó de conectarse con el error "No se pudo conectar con el asistente". La causa fue doble: el paquete que usábamos para hablar con Gemini (`@google/generative-ai`) está deprecado por Google desde agosto de 2025, así que se reemplazó por el paquete oficial vigente (`@google/genai`); y aparte, la cuenta de Google AI Studio se había quedado sin créditos prepagos (Google cambió su forma de facturar la API este año) — eso se resolvió cargando crédito en la cuenta.

## 2026-08-21 — ABM de Administradores

- Nueva sección **Administradores** dentro de Administración: listado, alta y ficha de edición/baja. Hasta ahora, para agregar un administrador había que hacerlo a mano desde el Dashboard de Supabase — ahora se puede desde la propia app.
- Al crear uno nuevo, se elige el nombre de una lista con los miembros activos del grupo (en vez de escribirlo a mano), se carga su email y contraseña (con confirmación de contraseña), y la app crea la cuenta de acceso y el alta como administrador en un solo paso.
- "Quitar administrador" le revoca el acceso al panel pero no borra su cuenta de login — queda reversible, se lo puede volver a agregar sin recrearle nada. No se puede quitar a uno mismo, ni al último administrador que queda.
- Nuevo ícono de ojo para mostrar/ocultar los caracteres en todos los campos de contraseña (cambio de contraseña en Mi Cuenta, alta y edición de administradores) — por seguridad, el campo vuelve a ocultarse solo apenas pierde el foco.

## 2026-08-21 — Tarjeta de saldo en la ficha de miembro (admin)

- La ficha de un miembro en Administración ahora muestra la misma información que la tarjeta de saldo de Mi Cuenta (deuda total, total pagado, pagos pendientes y la alerta de próximo vencimiento con "Más información"), pero en blanco (para distinguirse a simple vista de lo que ve la familia) y con los textos en tercera persona ("Este miembro no podría participar del siguiente evento" / "Este miembro puede participar del próximo evento"). No se tocó nada del lado de las familias.

## 2026-08-21 — Pagos de Mercado Pago duplicados

- Corregido un bug: si Mercado Pago reenviaba el mismo aviso de pago aprobado dos veces casi al mismo tiempo (algo que hace con frecuencia), el webhook podía crear dos filas en `pagos` para el mismo pago — el chequeo de "¿ya existe?" no alcanza a evitarlo porque los dos avisos pueden pasarlo antes de que ninguno haya terminado de insertar.
- Se agregó una restricción única en la base de datos sobre `(mp_payment_id, miembro_id)`, que bloquea el duplicado sin depender del timing — sigue permitiendo que un pago repartido entre varios hermanos genere una fila por cada uno. Confirmado con una prueba manual: el segundo intento de duplicado fue rechazado correctamente.

## 2026-08-21 — Solapa de Pagos en la ficha de miembro (admin)

- Nueva solapa **Pagos** en la ficha de un miembro: lista fecha, importe, medio de pago, estado (Pendiente/Acreditado/Cancelado) y el link al comprobante cuando lo hay, con el total pagado al pie.
- La solapa **Cargos** también suma un total al pie, con los cargos activos (sin contar los cancelados).

## 2026-08-21 — Rediseño del panel de Resumen (admin)

- Rediseño completo del dashboard principal de Administración, en base a una referencia visual, sin agregar funcionalidad nueva — todo con datos que la app ya calculaba, solo reorganizados y con gráficos.
- **Miembros totales** con la tendencia contra el mes anterior, y **Participación por rama** como dona (nuevo componente `DonutChart`, reutilizable, hecho a mano con SVG/CSS sin librerías).
- **Filtrar por rama** como botones, separado del gráfico de participación.
- **Situación de cobranza**: reemplaza las 4 tarjetas sueltas de antes (Saldo/Acreditados/Pendientes/Faltantes) por una barra segmentada con leyenda y porcentajes.
- **Cobranza últimos 6 meses**: gráfico nuevo de barras apiladas (Cobrado/Pendiente) + línea de tendencia, agrupando los pagos por mes.
- **Medios de pago** como dona con porcentajes, ahora siempre visible (antes escondido en "Más información").
- **Próximos vencimientos**: agrupa por concepto marcado (no por miembro, como antes) cuántas familias tienen ese concepto puntual sin cubrir y en cuántos días vence.
- **Familias al día / Familias con deuda**: agrupa el saldo por familia. Se corrigió en el camino un bug real: la primera versión comparaba el saldo total acumulado (que incluye cuotas futuras ya cargadas) contra cero, dando casi siempre "en deuda" a todo el mundo — se corrigió para mirar solo los cargos cuya fecha ya venció.
- **Actividad reciente**: reemplaza "Últimos 5 pagos realizados" por un feed con hora real de carga y un desplegable para elegir ver los últimos 3 (por defecto), 5 o 10 movimientos.
- **Más deuda / Menos deuda**: mismos rankings de siempre, ahora numerados.

## 2026-08-21 — Ajustes de identidad visual y filtro de meses en el Resumen

- Los títulos de todas las tarjetas del dashboard pasaron de gris a celeste (`sky-700`), y la dona de "Medios de pago" ahora usa distintos tonos de azul en vez de mezclar colores — los colores que indican estado (verde/ámbar/rojo en deuda, familias al día, etc.) se dejaron sin tocar a propósito, porque ahí el color transmite información real.
- **Cobranza mensual** ahora tiene su propio desplegable para elegir ver los últimos 3 (por defecto), 6 o 10 meses. Se corrigió en el camino un bug: el gráfico cambiaba de alto según la cantidad de meses elegida (por estar armado con un `viewBox` que se escalaba proporcionalmente al ancho) — ahora el ancho crece en píxeles fijos por mes y el alto queda siempre constante, apareciendo scroll horizontal solo cuando hace falta.

## 2026-09-03 — Barra lateral del admin con imagen de fondo

- La barra lateral del panel de administración ahora tiene de fondo una imagen de montañas con la marca Azimut, con un velo blanco semitransparente encima para que el menú se siga leyendo bien.
- El ícono y el nombre del administrador se movieron a la derecha de la barra.
- La pantalla principal quedó con un celeste plano simple (`sky-100`). Se probaron varias formas de que el color de fondo de la pantalla principal se fundiera con la imagen de la barra lateral (degradé fijo, degradé calculado a partir de la imagen, un difuminado de la propia imagen como transición) pero ninguna terminó de verse bien — queda pendiente retomarlo más adelante.

## 2026-09-03 — Corrección: acreditación automática de pagos por fecha equivocada

- Corregido un bug: la regla de "se acredita solo a los 4 días" contaba esos días desde la fecha de pago elegida por la familia (que se puede cargar retroactiva), en vez de contar desde el momento real en que se registró el pago. Un pago en efectivo o transferencia cargado con una fecha de 4-5 días atrás quedaba acreditado al instante, sin pasar por el período de revisión.
- Se corrigió para contar siempre desde el momento real de carga (`created_at`), sin importar qué fecha de pago se haya indicado.

## 2026-09-04 — Íconos en las tarjetas del Resumen (admin)

- Se agregó un ícono junto al título de cada una de las tarjetas del dashboard "Resumen": Miembros totales, Participación por rama, Filtrar por rama, Situación de cobranza, Cobranza mensual, Medios de pago, Próximos vencimientos, Actividad reciente, Más deuda, Menos deuda, Familias al día y Familias con deuda.

## 2026-09-04 — Botón de Imprimir en el Resumen (admin)

- Se agregó un botón "Imprimir" arriba a la derecha del panel de Resumen, a la altura de "Mostrando: ...", que abre el diálogo de impresión del navegador (desde ahí se puede imprimir en papel o guardar como PDF).
- Se armaron estilos de impresión en tamaño A4: se ocultan el menú lateral, la barra superior mobile y el propio botón; las tarjetas mantienen la misma distribución en columnas que se ve en pantalla (sin esto, al imprimir se apilaban en una sola columna); se fuerza la impresión de los colores de fondo (donas, barra de situación de cobranza) que los navegadores omiten por defecto para ahorrar tinta.
- Si la sección "Más información" está desplegada al momento de imprimir, sale incluida en el PDF; si está oculta, no sale (se imprime lo mismo que se ve en pantalla).
- Ajustes para que ninguna tarjeta se vea rota al imprimir en las columnas angostas: la leyenda de las donas (ej. "Participación por rama") pasa a mostrarse debajo de la dona en vez de al lado, el título de "Miembros totales" se apila con el ícono arriba en vez de al lado, y el filtro de "Cobranza mensual" pasa de "Últimos 3 meses" a "3 meses" para no pisarse con el título.

## 2026-09-04 — Paginación en el listado de Miembros

- Se agregó un selector "25 por página / 50 por página / Todos" (25 por defecto) y un pie de tabla con "Mostrando X de Y miembros" + botones Anterior/Siguiente.
- Cambiar cualquier otro filtro (nombre, DNI, rama, familia, estado) vuelve automáticamente a la página 1, pero conserva el tamaño de página elegido.

## 2026-09-04 — Paginación en el listado de Pagos

- Misma lógica que en Miembros: selector "25 por página / 50 por página / Todos" (25 por defecto) y pie de tabla con "Mostrando X de Y pagos" + Anterior/Siguiente, conservando los filtros.
- Se encontró y sacó un límite fijo de 100 resultados que tenía la consulta (sin aviso ni relación con la paginación); ahora "Todos" trae realmente todos los pagos.

## 2026-09-08 — Paginación en Cargos, filtro por defecto y sección Comunicación

- El filtro de estado en Miembros ahora arranca en "Activos" por defecto (antes mostraba todos); sigue pudiéndose cambiar a "Todos" o "Inactivos".
- Se agregó paginación al listado de Cargos con la misma lógica que Miembros y Pagos: selector "25 por página / 50 por página / Todos" (25 por defecto) en la misma línea que el título "Cargos", y pie de tabla con Anterior/Siguiente. Se sacó otro límite fijo de 100 resultados que tenía esta consulta.
- Se creó una nueva sección colapsable "Comunicación" en el menú del admin (arriba de "Administración", en escritorio y mobile), con Mensajes, Grupos de Padres y Fechas importantes — se sacaron de "Administración".
- Ajustes visuales menores: la etiqueta "Fecha scout" en Fechas importantes y el rango de fechas en "Vigencia" de Mensajes ya no cortan en dos líneas; se ensancharon un poco esas dos tarjetas para que entren cómodas.

## 2026-09-11 — Ajustes de la imagen de fondo del menú lateral

- Se reemplazó la imagen de fondo de la barra lateral por una versión de colores sólidos (sin degradé) y se sacó el velo blanco que la atenuaba, para que combine mejor con el celeste del resto del panel.
- Las opciones del menú (Comunicación, Administración, Cerrar sesión) ahora se ven en texto negro con una sombra clara detrás, para que se lean bien tanto sobre la parte clara de la imagen como sobre la montaña oscura. Al pasar el mouse, se resaltan con una sombra celeste.

## 2026-09-11 — Aviso por mail a los administradores cuando se registra un pago

- Nueva pantalla **Notificaciones Pagos** (dentro de Administración): permite cargar la cuenta de Gmail y la contraseña de aplicación que envía los avisos, y un interruptor general para activar/desactivar el envío. Si el día de mañana cambia la cuenta de correo, se actualiza ahí, sin tocar código.
- Cada vez que se registra un pago (Efectivo, Transferencia o Mercado Pago), se manda un mail a los administradores con el detalle (miembro, importe, medio de pago) y si queda pendiente de revisión o ya se acreditó solo. Se envía por SMTP con una cuenta de Gmail del Grupo (`gs1284libertador@gmail.com`), ya que hoy no hay un dominio propio para usar un servicio de mail transaccional. Si el envío falla por lo que sea, el pago se registra igual — nunca depende del mail.
- Se agregó un checkbox **"Recibir notificaciones de pagos por mail"** al alta y a la edición de un administrador (tildado por defecto), para que cada uno pueda optar por no recibir estos avisos.
- Probado en producción: el primer mail cayó en Spam (esperable en una cuenta que recién empieza a mandar correos automáticos) — se corrige marcándolo como "no es spam" desde el mail recibido.

## 2026-09-11 — Notificaciones Pagos pasa a ser parte de Medios de Pago

- Se sacó "Notificaciones Pagos" del menú como pantalla propia y ahora es una tarjeta más dentro de Medios de Pago, debajo de los interruptores de medios habilitados.
