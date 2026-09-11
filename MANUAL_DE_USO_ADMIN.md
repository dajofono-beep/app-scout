# Manual de uso — Azimut (Administración)

Guía rápida para los administradores del Grupo Scout Libertador San Martín. Cada sección explica, paso a paso, para qué sirve y cómo se usa el panel de Administración.

---

## 1. Ingresar

1. Entrá a `azimut-kappa.vercel.app/admin`.
2. Ingresá con tu **email** y **contraseña**.

El acceso lo da otro administrador desde la sección **Administradores** (ver sección 9.5) — no hay registro propio.

Una vez adentro, el menú de la izquierda tiene un ícono para cada sección. Tocando el ícono de Azimut (arriba de todo, junto a tu nombre) se minimiza o expande todo el menú, para dejar más lugar a la pantalla principal — minimizado se ven solo los íconos, y pasando el mouse por encima aparece el nombre de la sección. Desde el celular, el menú arranca minimizado por defecto.

## 2. Resumen

Es la pantalla principal al ingresar. Muestra de un vistazo el estado del Grupo:

- **Miembros totales**, con la tendencia contra el mes anterior.
- **Participación por rama** (dona) y botones para **filtrar todo el panel por rama**.
- **Situación de cobranza**: barra con lo pagado, lo pendiente de acreditar y lo que falta cobrar.
- **Cobranza mensual**: gráfico de barras y línea, con un desplegable para ver los últimos 3 (por defecto), 6 o 10 meses.
- **Medios de pago**: dona con el porcentaje cobrado por cada medio.
- **Más información** (desplegable): cuántas familias están en riesgo de no poder participar del próximo evento por conceptos vencidos, y cuántos pagos hay pendientes de revisión (con link directo a Pagos).
- **Próximos vencimientos**: conceptos marcados con alerta, agrupados, con cuántas familias los tienen sin cubrir y en cuántos días vencen.
- **Actividad reciente**: últimos movimientos con hora real, elegible entre 3/5/10.
- **Más deuda / Menos deuda**: rankings de miembros.
- **Familias al día / Familias con deuda**: sobre las fechas ya vencidas (no cuenta cuotas futuras).

Arriba a la derecha, el botón **Imprimir** abre el diálogo de impresión del navegador — desde ahí se puede imprimir en papel o guardar como PDF en tamaño A4, con las tarjetas en la misma distribución que se ve en pantalla.

## 3. Miembros

Listado de todos los participantes (chicos y adultos) del Grupo.

- **Filtros**: nombre, DNI, rama, hermanos y estado (por defecto muestra solo **Activos**; se puede cambiar a Todos o Inactivos).
- **Paginación**: desplegable "25 por página / 50 por página / Todos" (25 por defecto), con Anterior/Siguiente al pie.
- **Importar desde Excel**: subiendo un .xlsx con columnas Dni, Nombre ("Apellido, Nombre"), Función y Fecha de Nacimiento. Los DNI que ya existen se saltean.
- **+ Nuevo miembro**: nombre, apellido, DNI (queda como contraseña inicial), rama, hermanos (opcional) y orden entre hermanos, fecha de nacimiento.
- **Ficha de un miembro**: tres solapas —
  - **Datos Generales**: la misma información de saldo que ve la familia (deuda, pagado, alerta de próximo vencimiento), pero en blanco y en tercera persona para distinguirla a simple vista.
  - **Cargos**: todos los cargos de ese miembro, con un total al pie.
  - **Pagos**: todos los pagos de ese miembro, con un total al pie.
  - Desde la ficha también se puede **restaurar la contraseña** (vuelve a ser el DNI) y editar sus datos.

## 4. Pagos

Listado de todos los pagos registrados (Efectivo, Transferencia y Mercado Pago).

- **Filtros**: por miembro y por estado (Pendiente / Acreditado / Cancelado). Paginación igual que Miembros (25/50/Todos).
- Los pagos en Efectivo o Transferencia quedan **Pendientes** unos días y se acreditan solos; se puede **confirmar manualmente** uno por uno o seleccionar varios pendientes con el check y confirmarlos juntos.
- Los pagos de Mercado Pago se acreditan solos apenas se aprueban, sin necesitar revisión.
- Entrando a un pago (**Ver**) se ve el detalle completo y el comprobante adjunto, si tiene.

## 5. Cargos

Acá se cargan y gestionan las deudas de los participantes.

- **Asignar cargo**: elegís destinatario (Hermanos / Rama / Participante puntual), el concepto y la fecha, y se genera el cargo. Si el concepto es cuotable, se generan todas las cuotas automáticamente (una por mes); si tiene descuento por hermanos activado, se calcula según el orden de cada uno.
- **Cargo manual (concepto libre)**: para cobrar algo puntual que no está en Conceptos — miembro, texto libre, importe (puede ser negativo) y fecha.
- **Cancelación de Cargos**: cancela de una todos los cargos activos de un concepto para Hermanos, Rama o un Participante (incluye todas las cuotas pendientes). Pide confirmación antes de aplicar. Se puede reactivar de a uno después.
- **Listado**: filtro por miembro y estado (por defecto Activos), paginación 25/50/Todos.

## 6. Conceptos

Son los "productos" que se cobran (cuotas, campamentos, salidas, etc.).

- **+ Nuevo concepto**: nombre, importe, descripción opcional, fecha de vencimiento opcional (se copia a cada cargo que genere, y sirve para avisar en Mi Cuenta si no está pago cerca de esa fecha), si **es cuotable** (con cantidad de cuotas) y si **aplica descuento por hermanos**.
- Filtro por nombre y estado (Activos/Inactivos), y se puede desactivar un concepto sin borrarlo.

## 7. Exportar

Genera un Excel con la deuda, lo pagado y el saldo de cada participante, una hoja por rama (o todas juntas).

## 8. Comunicación

Sección con todo lo que las familias reciben o consultan desde Mi Cuenta.

### 8.1 Mensajes

Avisos para las familias, ordenados del más nuevo al más viejo.

- **+ Nuevo mensaje**: título, texto, a quién va dirigido (Todos / una Rama / unos Hermanos / un Participante puntual) y el período de vigencia (desde una fecha, o hasta otra).

### 8.2 Grupos de Padres

Acá se carga el link de invitación al grupo de WhatsApp de cada rama. Con el interruptor general activado, las familias ven el link de su propia rama en la sección Mensajes de Mi Cuenta.

### 8.3 Fechas importantes

Calendario de campamentos, salidas, reuniones y efemérides que las familias ven en la sección Social de Mi Cuenta.

- **+ Nueva fecha**: nombre, tipo (Efeméride o Fecha scout), fecha de inicio y fin (puede ser un solo día), y si está activa.

## 9. Administración

Sección colapsable con la configuración más de fondo del Grupo.

### 9.1 Hermanos

Agrupa miembros como hermanos para que, al ingresar como cualquiera de ellos, puedan verse y pagar entre sí desde Mi Cuenta. El orden entre hermanos (1º, 2º, 3º hijo) se asigna desde **Miembros** y es lo que define el descuento.

### 9.2 Descuentos

Define qué porcentaje del importe paga cada hijo según su posición entre hermanos (1º, 2º, 3º...). Si un miembro tiene una posición mayor a las cargadas, se usa el porcentaje de la última fila cargada. Solo aplica a conceptos con "Aplica descuento por hermanos" activado.

### 9.3 Ramas

ABM de las ramas del Grupo (Manada, Unidad Scout, Caminantes, Rovers, Adultos), con la cantidad de miembros de cada una.

### 9.4 Medios de Pago

Interruptores para elegir qué medios de pago pueden usar las familias al cargar un pago (Efectivo, Transferencia, Mercado Pago). Desde acá, **Configurar →** en Mercado Pago lleva a cargar el titular de referencia, las credenciales (de prueba y de producción, nunca se muestran a las familias) y el ambiente activo (Prueba/Producción).

Debajo, la tarjeta **Notificaciones Pagos** configura el aviso por mail que se manda a los administradores cada vez que una familia registra un pago — con el detalle de miembro, importe, medio de pago, y si queda pendiente de revisión o ya se acreditó solo.

- **Cuenta de Gmail que envía los avisos** y su **contraseña de aplicación** (no es la contraseña normal de esa cuenta — se genera desde la cuenta de Google en Seguridad → Verificación en dos pasos → Contraseñas de aplicaciones). Si el día de mañana cambia la cuenta de correo del Grupo, se actualiza acá.
- Interruptor **"Enviar los avisos por mail"** para activar o desactivar el envío sin perder la configuración cargada — los pagos se siguen registrando igual, esté activado o no.
- Qué administradores reciben estos avisos se define individualmente en cada ficha (ver 9.5).
- Si el primer mail cae en la carpeta de Spam del destinatario, alcanza con marcarlo como "no es spam" — es esperable en una cuenta que recién empieza a mandar correos automáticos.

### 9.5 Administradores

ABM de quiénes pueden entrar al panel de administración.

- **+ Nuevo administrador**: se elige el nombre de una lista de miembros activos del Grupo, más email y contraseña (con confirmación), y el checkbox **"Recibir notificaciones de pagos por mail"** (tildado por defecto — ver 9.4).
- Se puede editar o quitar un administrador existente (no se puede quitar a uno mismo ni dejar el Grupo sin ningún administrador). Desde la edición también se puede destildar el checkbox de notificaciones si alguien no quiere recibirlas.
- Quitar un administrador solo borra su acceso al panel — si hace falta borrar la cuenta por completo, se hace aparte desde Supabase.

## 10. Salir

Botón "Cerrar sesión" al pie del menú. Pide confirmación antes de cerrar la sesión.

---

*Este manual se actualiza cada vez que se agrega o cambia una funcionalidad del panel de administración.*
