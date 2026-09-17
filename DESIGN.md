---
name: Azimut
description: Cuenta corriente digital del Grupo Scout Libertador San Martín
colors:
  primary: "#0284c7"
  primary-light: "#38bdf8"
  primary-soft: "#f0f9ff"
  primary-border: "#e0f2fe"
  surface: "#ffffff"
  ink: "#1e293b"
  ink-secondary: "#475569"
  ink-muted: "#64748b"
  ink-faint: "#94a3b8"
  neutral-bg: "#f8fafc"
  neutral-bg-strong: "#f1f5f9"
  neutral-border: "#e2e8f0"
  warning-bg: "#fffbeb"
  warning-strong: "#fde68a"
  warning-ink: "#78350f"
  success-bg: "#ecfdf5"
  success-strong: "#a7f3d0"
  success-ink: "#064e3b"
  success-solid: "#10b981"
  danger: "#ef4444"
  tertiary: "#8b5cf6"
  tertiary-soft: "#f5f3ff"
typography:
  display:
    fontFamily: "Quicksand, sans-serif"
    fontWeight: 700
    letterSpacing: "normal"
  headline:
    fontFamily: "Quicksand, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "Quicksand, sans-serif"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Quicksand, sans-serif"
    fontWeight: 600
    fontSize: "0.75rem"
rounded:
  sm: "2px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
    padding: "10px 24px"
  button-primary-disabled:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  card-hero:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.3xl}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "10px 16px"
---

# Design System: Azimut

## Overview

**Creative North Star: "La Brújula"**

Azimut existe para que una familia sepa, de un vistazo y sin llamar a nadie, exactamente dónde está parada con el Grupo: cuánto debe, cuánto pagó, qué le falta. Como una brújula, el sistema visual no decora — orienta. Cada pantalla resuelve la misma pregunta ("¿cómo estoy?") con la mínima fricción posible, en un lenguaje visual claro y directo, pero nunca frío: los botones son píldoras celestes bien redondeadas, la tipografía es geométrica y amable (Quicksand), y el tono general es el de una herramienta cálida y cercana, hecha por el Grupo para sus propias familias — no una fintech corporativa.

El celeste domina como un cielo despejado de día de campamento: es el color de la marca, de los botones, del fondo general de Mi Cuenta y del degradé de la tarjeta de saldo. El resto de la paleta (ámbar, esmeralda, rojo) aparece solo para señalar estado — pendiente, al día, vencido — nunca como decoración.

La elevación es intencionalmente plana y liviana: las tarjetas blancas se apoyan sobre el fondo celeste claro con una sombra casi imperceptible (`shadow-sm`), sin bordes marcados. Nada "flota" con fuerza salvo lo que realmente necesita separarse del contenido de fondo (un menú deslizable, un toast, el gráfico 3D).

**Key Characteristics:**
- Botones y pills siempre `rounded-full`; tarjetas siempre `rounded-2xl` o más grandes — nunca esquinas rectas.
- Un solo acento dominante (Celeste Azimut); el resto de la paleta es puramente semántica (estado), no decorativa.
- Sombras casi ausentes (`shadow-sm` por defecto); la separación entre superficies viene del color de fondo (celeste claro vs. blanco), no de la profundidad.
- Tipografía Quicksand en toda la app — geométrica, redondeada, consistente con la forma de los botones.
- Mobile-first en Mi Cuenta (barra lateral se vuelve menú deslizable en celular); desktop-first en Admin (barra de íconos colapsable).

## Colors

Paleta acotada a un acento y una escala neutra, con colores de estado usados exclusivamente para comunicar situación (pendiente / al día / vencido), nunca por variedad visual.

### Primary
- **Celeste Azimut** (`#0284c7`, sky-600): color de marca. Fondo de todos los botones primarios (siempre `rounded-full`), extremo oscuro del degradé de la tarjeta de saldo, color de texto activo en navegación e íconos de sección.
- **Celeste Azimut Claro** (`#38bdf8`, sky-400): extremo claro del degradé de la tarjeta de saldo; nunca se usa solo.

### Tertiary (uso acotado — panel Admin)
- **Violeta Informativo** (`#8b5cf6`, violet-500) / fondo **`#f5f3ff`** (violet-50): acento secundario reservado a Admin, para una categoría puntual dentro del dashboard y de Fechas Importantes (ej. efemérides). No compite con el celeste como color de acción.

### Neutral
- **Tinta** (`#1e293b`, slate-800): texto principal, nombres, títulos de tarjeta.
- **Tinta Secundaria** (`#475569`, slate-600): labels de formulario, texto de énfasis medio.
- **Tinta Apagada** (`#64748b`, slate-500): texto secundario, ayuda, leyendas.
- **Tinta Tenue** (`#94a3b8`, slate-400): placeholders, texto deshabilitado, divisores textuales.
- **Superficie** (`#ffffff`): fondo de todas las tarjetas y del panel de contenido.
- **Fondo Celeste Suave** (`#f0f9ff`, sky-50): fondo general de página en Mi Cuenta, login y el panel Admin — es el "aire" alrededor de las tarjetas blancas.
- **Borde Celeste Suave** (`#e0f2fe`, sky-100): bordes sutiles sobre fondo celeste (ej. separador de la barra lateral de Mi Cuenta).
- **Gris Suave** (`#f8fafc` / `#f1f5f9`, slate-50/100): fondos de fila alternada, chips neutros, estados hover suaves.
- **Borde Neutro** (`#e2e8f0`, slate-200): borde por defecto de inputs y selects.

### Named Rules
**La Regla del Acento Único.** El celeste es el único color con permiso para significar "acción" (botón primario, link activo, ícono de sección). Ningún otro color reemplaza esa función, ni siquiera en Admin.

**La Regla del Color con Propósito.** Ámbar, esmeralda y rojo no son variedad decorativa: ámbar = pendiente/alerta, esmeralda = al día/positivo, rojo = error/vencido. Ver detalle en Componentes.

## Typography

**Body / Display / Label Font:** Quicksand (500, 600, 700), con `sans-serif` de fallback.

**Character:** Geométrica, redondeada en sus terminales, cálida sin perder legibilidad — hace juego directo con los botones `rounded-full` y las tarjetas de esquinas muy curvas. Es la tipografía real de toda la app (Mi Cuenta, Admin y las pantallas de login), cargada por `next/font/google` en cada layout.

> Nota de estado real del código: `src/app/layout.js` todavía monta la fuente Geist (starter de `create-next-app`) y la registra como `--font-sans`/`--font-mono`, pero ningún componente la usa — el `body` global fija `font-family: Arial, Helvetica, sans-serif` y cada layout hijo (Mi Cuenta, Admin, login) sobrescribe con Quicksand vía `style` inline. Documentado tal cual está: la fuente de marca real es Quicksand; el hookup de Geist es vestigial.

### Hierarchy
- **Display** (700, `text-3xl`/`text-2xl`): el monto de saldo en la tarjeta hero — el número que más importa en toda la app.
- **Headline** (700, `font-bold`, tamaño base): títulos de tarjeta/sección ("Cargar un pago", nombre de la familia).
- **Title** (600, `font-semibold`, `text-sm`/`text-base`): labels de formulario, encabezados de fila.
- **Body** (500, `text-sm`): texto general, descripciones, ayuda.
- **Label** (700, `text-xs`, a veces dentro de un pill): montos secundarios, badges de estado, texto de navegación colapsada.

### Named Rules
**La Regla del Número Protagonista.** El saldo siempre es el elemento tipográficamente más grande y con más peso de la pantalla en la que aparece — nunca compite con un título de sección.

## Layout

Mi Cuenta: contenido centrado en `max-w-2xl`, con navegación lateral fija en desktop (`md:w-56`) que en celular se convierte en una barra superior + menú deslizable (`fixed`, `w-72`, `shadow-xl`). Padding de página `p-4` en celular, `p-8` en desktop.

Admin: barra lateral de íconos angosta y colapsable (`w-16` colapsada / `w-56` expandida), con imagen de fondo (`fondo-sidebar.png`) y contenido principal en grilla de tarjetas. Arranca colapsada en celular, expandida en desktop; el resto del panel se diseña pensando primero en pantallas grandes (tablas, grillas de estadísticas), pero sigue siendo usable en celular.

Ritmo de espaciado consistente en pasos de Tailwind: `gap-2`/`gap-3`/`gap-4` entre elementos relacionados, `p-3` a `p-5` de padding interno de tarjeta, `p-8` como padding exterior de página en desktop.

## Elevation & Depth

Sistema deliberadamente plano y liviano (confirmado): la profundidad no se comunica con sombra sino con contraste de fondo — tarjeta blanca (`Superficie`) sobre fondo celeste claro (`Fondo Celeste Suave`). La sombra por defecto (`shadow-sm`) es casi imperceptible, un borde suave más que un efecto de "flotar".

### Shadow Vocabulary
- **Sutil** (`shadow-sm`): el 90% de las tarjetas de contenido. Rol: separar del fondo, no elevar.
- **Media** (`shadow-md`): reservada a elementos que sí deben leerse como protagonistas — la tarjeta de saldo, la tarjeta de login, encabezados de sección con imagen.
- **Alta** (`shadow-lg`): elementos flotantes puntuales — el toast "Presioná Atrás de nuevo para salir", el disco superior del gráfico 3D de torta.
- **Máxima** (`shadow-xl`): exclusiva del menú deslizable de celular (`barra-cuenta`) — el único elemento que se comporta como un panel superpuesto de verdad.

### Named Rules
**La Regla de la Sombra Contenida.** Una sombra más fuerte que `shadow-sm` es siempre una señal de jerarquía real (protagonista de la pantalla o panel superpuesto), nunca un efecto decorativo aplicado por default.

## Shapes

Escala de radios consistente y muy redondeada, sin esquinas rectas en ningún componente interactivo:
- **`rounded-full`**: todo botón de acción, chip/badge de estado, avatar, ícono circular. Es la forma de "algo que se puede tocar".
- **`rounded-3xl`** (24px): la tarjeta protagonista de cada pantalla (saldo, login) — el radio más grande, reservado a un único elemento por vista.
- **`rounded-2xl`** (16px): tarjeta de contenido estándar — la unidad de layout más repetida del sistema.
- **`rounded-xl`** (12px): inputs, selects, avatares cuadrados, sub-bloques dentro de una tarjeta.
- **`rounded-lg`** (8px): botones de ícono chicos, badges de tabla, controles de paginación.
- **`rounded-sm`**: segmentos finos dentro de gráficos (barras, leyendas) — la única excepción de esquina casi recta, y solo a escala miniatura.

Sin bordes duros: cuando un contenedor lleva borde, es 1px y de un neutro suave (`neutral-border` o `primary-border`), nunca un borde de color fuerte salvo en estados de error/éxito (ver Componentes).

## Components

### Botones
- **Primario:** fondo `{colors.primary}`, texto blanco, `rounded-full`, `font-bold`, padding `py-2.5` (vertical generoso, sin radios rectos). Estado deshabilitado: `opacity-50` sobre el mismo fondo, sin cambiar de color.
- **Navegación (texto):** sin fondo ni borde — solo color de texto (`ink-secondary` en reposo, `primary` activo/hover) y peso `font-semibold`.
- **Ícono circular:** `rounded-full`, fondo transparente que pasa a `bg-sky-50` en hover.

### Chips / Badges de estado
- **Pendiente/Alerta:** fondo `{colors.warning-strong}` (o `warning-bg` en variantes más suaves), texto `{colors.warning-ink}`, `rounded-full`, `text-xs font-bold`, padding `px-3 py-1`.
- **Positivo/Al día:** fondo `{colors.success-strong}` (o `success-bg`), texto `{colors.success-ink}`, misma forma que el chip de alerta.
- **Error:** texto `{colors.danger}` sólido, `font-semibold`, generalmente sin fondo (texto de error bajo un formulario).

### Tarjetas / Contenedores
- **Estándar:** `{colors.surface}`, `rounded-2xl`, `shadow-sm`, padding `p-5`.
- **Hero (saldo, login):** degradé o fondo sólido de marca, `rounded-3xl`, `shadow-md`, padding `p-5`/`p-6`. Una sola por pantalla — es la que concentra la jerarquía visual.
- **Sin borde:** las tarjetas nunca llevan borde propio; se separan del fondo por color + sombra sutil, no por contorno.

### Inputs / Campos
- **Estilo:** borde 1px `{colors.neutral-border}`, `rounded-xl`, padding `px-4 py-2.5`, fondo blanco.
- **Sin estado de foco custom documentado:** el sistema usa el foco nativo del navegador; no hay glow ni cambio de borde propio definido en el código actual.
- **Error de formulario:** el campo no cambia de estilo — el error se comunica aparte, como texto rojo bajo el formulario.

### Navegación
- **Mi Cuenta (desktop):** lista vertical de texto, sin fondo por ítem; el activo se distingue solo por color (`primary` vs `ink-secondary`).
- **Mi Cuenta (celular):** barra superior + panel deslizable `shadow-xl` desde la izquierda.
- **Admin:** barra de íconos angosta y colapsable, con imagen de fondo propia; cada link es ícono + texto (oculto si está colapsado), con `title` como tooltip nativo cuando está colapsado.

### Avatar / Iniciales
Cuando un miembro no tiene foto, se muestra un círculo (`rounded-full`) con sus iniciales sobre un color determinístico: por rama tiene colores fijos asignados (Manada amarillo, Unidad Scout verde, Caminantes celeste, Rovers rojo, Adultos violeta), y en otros contextos rota sobre una paleta de 8 colores calculada por hash del id — nunca aleatorio en cada render, siempre el mismo color para el mismo miembro/rama.

## Do's and Don'ts

### Do:
- **Do** usar `rounded-full` en absolutamente todo elemento de acción (botón, chip, avatar) — es la firma de forma más consistente del sistema.
- **Do** reservar `shadow-md` o superior para el único elemento protagonista de la pantalla; todo lo demás va en `shadow-sm`.
- **Do** usar color de estado (ámbar/esmeralda/rojo) solo para comunicar situación real (pendiente/al día/vencido/error), nunca como acento decorativo.
- **Do** mantener Quicksand como tipografía de toda superficie nueva — es lo que efectivamente se renderiza hoy, no Geist.

### Don't:
- **Don't** introducir esquinas rectas en botones, chips o tarjetas — rompe la firma de forma más reconocible de Azimut.
- **Don't** usar el violeta (acento de Admin) como color de acción o como reemplazo del celeste — es puramente informativo y de uso acotado.
- **Don't** agregar sombras fuertes (`shadow-lg`/`shadow-xl`) a tarjetas de contenido regular — esa intensidad está reservada a paneles realmente superpuestos (menú deslizable, toast, elementos flotantes).
