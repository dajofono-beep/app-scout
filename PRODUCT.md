# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — Familias del Grupo Scout Libertador San Martín**, en "Mi Cuenta": padres/tutores que instalan la app en el celular (PWA, "Agregar a pantalla de inicio") y la usan para revisar el saldo y la deuda de sus hijos, cargar pagos (Efectivo, Transferencia o Mercado Pago), leer avisos del Grupo, ver el calendario de fechas y cumpleaños, y consultar al asistente SanMa. Ingresan eligiendo rama + nombre, con el DNI como contraseña — sin registro propio.

**Secundaria — Administradores/dirigentes del Grupo**, en el panel `/admin`: gestionan miembros, cargos, conceptos, pagos, comunicación y configuración desde escritorio (aunque el panel también se usa desde celular). Acceso restringido: solo lo otorga otro administrador desde el panel, no hay alta propia.

## Product Purpose

Azimut es la cuenta corriente digital del Grupo Scout: reemplaza planillas de Excel y coordinación por WhatsApp para llevar el registro de cuotas, campamentos y otros cargos por participante, y para que las familias paguen y consulten su situación sin depender de que un dirigente les responda manualmente. Éxito = que las familias sepan en todo momento cuánto deben y puedan pagar sin fricción, y que los administradores tengan visibilidad de cobranza sin trabajo manual de conciliación.

## Positioning

Hecho a medida para la operatoria específica de este Grupo Scout (ramas, orden entre hermanos con descuento automático, conceptos cuotables, vencimientos ligados a eventos como campamentos). No es un producto genérico ni se comercializa a otros grupos — es el reemplazo directo de lo que antes se resolvía con Excel y WhatsApp.

## Operating Context

- Ramas del Grupo (Manada, Unidad Scout, Caminantes, Rovers, Adultos), cada miembro pertenece a una.
- Hermanos agrupados entre sí, con descuento por posición (1º, 2º, 3º hijo) configurable.
- Conceptos = "productos" que se cobran (cuotas mensuales cuotables, campamentos, salidas), con vencimiento opcional.
- Medios de pago habilitables por el Grupo: Efectivo, Transferencia (con comprobante obligatorio, quedan "Pendientes" hasta revisión manual) y Mercado Pago (acreditación instantánea vía checkout).
- SanMa: asistente conversacional (Gemini) que responde sobre el Proyecto Educativo, reuniones de padres, historia del Grupo y vida scout, con dictado por voz en celular.
- Notificaciones por mail a administradores ante cada pago nuevo (vía cuenta Gmail con contraseña de aplicación, configurable).
- Fuente de datos: Supabase. Importación/exportación de miembros y deuda vía Excel (exceljs).

## Capabilities and Constraints

- Alta de miembros manual o por importación de Excel (Dni, Nombre, Función, Fecha de Nacimiento); DNI duplicado se salta.
- Cargos: asignación masiva (por hermanos/rama/puntual), cuotas automáticas, descuento por hermanos, cancelación masiva reversible de a uno.
- Pagos en Efectivo/Transferencia requieren revisión y confirmación manual (individual o por lote); Mercado Pago se acredita solo.
- El recargo (%) configurable de Mercado Pago existe como campo pero **todavía no se aplica** al importe del pago — pendiente de implementación (ver memoria de proyecto).
- Login de administradores: bloqueo de 3 minutos tras 3 intentos fallidos seguidos con el mismo email.
- No existe hoy un registro de logins exitosos de las familias (no se sabe qué miembros nunca ingresaron) — pendiente.
- Multi-tenant: no. Es una instancia para un único Grupo Scout.

## Brand Commitments

Nombre "Azimut", logo e iconografía (brújula, colores actuales con `theme_color` #0284c7) ya establecidos y en uso — punto de partida, sin restricciones formales adicionales más allá de mantener esa identidad.

## Evidence on Hand

- [MANUAL_DE_USO.md](MANUAL_DE_USO.md) y [MANUAL_DE_USO_ADMIN.md](MANUAL_DE_USO_ADMIN.md): documentación funcional completa y actualizada de ambas superficies (Mi Cuenta y Admin).
- [CHANGELOG.md](CHANGELOG.md): historial real de features entregadas.
- `miembros.xlsx`: planilla real de ejemplo para importación.
- Sin testimonios, casos de éxito ni cifras de marketing — no corresponde inventarlos (no es producto con posicionamiento externo).

## Product Principles

1. La familia nunca debería necesitar preguntarle a un dirigente cuánto debe — el saldo y el detalle tienen que ser siempre autoservicio y estar a la vista.
2. Minimizar trabajo manual del administrador: acreditación automática (Mercado Pago), cuotas automáticas, descuentos automáticos por hermanos, notificaciones automáticas por mail.
3. Los datos sensibles (DNI como contraseña inicial, credenciales de Mercado Pago, contraseña de aplicación de Gmail) se tratan con cuidado explícito — nunca se muestran a las familias.
4. Pensado para uso mayormente desde el celular en Mi Cuenta (instalación como PWA), y desde escritorio en el panel Admin, sin que ninguna de las dos superficies sea una idea tardía.
5. Cada cambio de funcionalidad se refleja en el manual correspondiente — la documentación de uso no queda desactualizada.

## Accessibility & Inclusion

Sin requisito de accesibilidad formal establecido por el usuario más allá de la identidad visual y el nombre ya existentes.
