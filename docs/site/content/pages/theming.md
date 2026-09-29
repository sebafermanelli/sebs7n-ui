Una app define **cuatro variables de marca** y, si quiere, **dos del material**. No hay que tocar ningún archivo del paquete ni recompilar nada. Para probarlas sin escribir CSS está el [Playground](/docs/playground).

## Color de marca

```css
:root {
  --brand-base: oklch(0.55 0.16 35);        /* acento en claro */
  --brand-base-dark: oklch(0.55 0.16 35);   /* acento en oscuro; por defecto, igual a la base */
  --brand-contrast: #fff;                   /* texto sobre el acento en claro; por defecto #fff */
  --brand-contrast-dark: #fff;              /* texto sobre el acento en oscuro; por defecto, igual a --brand-contrast */
}
```

De ahí el paquete deriva la escala `brand-100…1000` y `brand-contrast`, con `oklch(from …)`: se fija la luminosidad del paso equivalente de `blue` en Geist y se escala el croma. Por eso un acento naranja y uno azul dan escalas que «pesan» igual.

**La regla es una sola: el texto sobre `brand-700` tiene que llegar a 4,5:1.** Si el acento es claro, `--brand-contrast: #000` (y su par oscuro, si el acento oscuro también lo es). Hay un test en el paquete que recalcula el ratio desde OKLCH y falla si una marca no da.

`tokens/brands.json` trae cuatro marcas de ejemplo (`teal`, `terracotta`, `emerald`, `blue`) que usan las demos del sitio y los tests de contraste. **Son solo demos del sistema**: una app real no las usa ni edita ese archivo.

### Testear tu propia marca

El test del paquete cubre esas cuatro marcas y ninguna más, así que la tuya la testeás vos. La función de contraste sale por `sebs7n-ui/lib/contrast`, es pura y no arrastra nada:

```ts
import { contrastRatio, luminanceOfHex, luminanceOfOklch } from "sebs7n-ui/lib/contrast"

// Los mismos valores que están en el globals.css de la app.
const MARCA = {
  claro: { base: [0.55, 0.16, 35] as const, contraste: "#fff" },
  oscuro: { base: [0.62, 0.15, 35] as const, contraste: "#000" },
}

describe("la marca llega a AA", () => {
  it.each(Object.entries(MARCA))("%s: texto sobre brand-700 ≥ 4,5:1", (_, { base, contraste }) => {
    const ratio = contrastRatio(luminanceOfOklch(base), luminanceOfHex(contraste))
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })
})
```

`luminanceOfOklch` recorta a sRGB antes de medir, que es lo que hace el navegador: un OKLCH fuera del gamut se pinta recortado, y el ratio real es el del color recortado. Para un token con alfa —`gray-alpha-*`, el halo de foco— está `flattenAlpha(hex, fondo)`, que lo compone contra el fondo antes de medirlo.

### Dónde aparece el acento

| Token | Dónde |
|---|---|
| `brand-700` | `Button` (el default, acento sólido), el anillo de foco interior (en claro), el anillo de `Card selected`, franja de `Alert variant="brand"`, `Badge color="brand"`. Y **todo lo que está prendido**: `Checkbox` y `Radio` marcados, `Switch`, `Toggle` y el segmento prendido de `ToggleGroup`, el relleno de `Progress` y `Meter`. El `Slider` no: su progreso va en el color del texto, como el de Photos. |
| `brand-700` como selección | La fila elegida de una lista **con el foco adentro**: `Table`, `List`, `Tree`, `FileGrid`. Es `bg-selection`, con texto e íconos en `text-on-selection` (`brand-contrast`); sin foco, `bg-selection-inactive` (gris). El ítem resaltado de un menú y el activo del `Sidebar` o de `NavigationMenu` **no** van en el acento: son grises (`fill-2`, `fill-1`), como en iCloud. |
| `brand-700` en tinte | Lo que se marca sin ser la selección: el tramo del medio de un rango en `Calendar`, la burbuja del usuario en `Chat` (14 % en claro, 22 % en oscuro). Es `bg-highlight`. |
| `brand-800` | Hover del acento. |
| `brand-900` | `Button variant="link"`, ícono de `Alert variant="brand"`. |
| `brand-ink` | El texto de `Badge` y `Tag` de marca: a mitad de camino entre `brand-900` y `brand-1000`. |
| `brand-1000` | Hover del `Button variant="link"`. |
| `brand-100` · `brand-400` | No los usa ningún componente desde 1.0: el fondo suave de `Badge` y `Tag` es `brand-700` en alfa. |
| `brand-contrast` | El texto **encima** del acento, también el de la selección (`on-selection`). |

`brand-200`, `brand-300` y `brand-500` no los usa ningún componente: existen para la app, que también tiene la escala completa. `linkVariants` tiene los dos: `accent` (el link de iCloud, en `brand-900`) para un link suelto, y los grises (`inline`, `subtle`) para adentro de un párrafo, donde tres links de color serían tres manchas.

**Un solo acento sólido por pantalla.** El `Button` por defecto (el acento sólido) es la acción principal y va uno. Los estados prendidos no compiten con él: son chicos y dicen «esto está activo», no «apretá acá». Si en una pantalla igual molestan, `Switch variant="neutral"` prende en gris.

## Superficies

Desde 2.0 no hay vidrio: las superficies son las de iCloud web, **grises opacos en capas**. Cada una es un token con su valor claro y oscuro, y los componentes ya los traen:

| Token | Claro | Oscuro | Dónde |
|---|---|---|---|
| `background` | `#ffffff` | `#1c1c1e` | La página, una lista, un detalle |
| `surface` | `#ffffff` | `#1c1c1e` | Lo que flota: menú, popover, diálogo, toast, el cuerpo de un widget |
| `surface-secondary` | `#fbfbfd` | `#202023` | La columna del sidebar |
| `surface-bar` | `#f2f2f7` | `#2c2c2e` | La toolbar de una app, la cabecera de un widget |
| `surface-header` | `#f2f2f7` | `#323236` | La barra global |
| `fill-1` · `fill-2` · `fill-3` | 8 · 12 · 16 % | 25 · 30 · 36 % | Hover y selección neutra · resaltado de menú · selección fuerte |
| `separator` · `separator-strong` | `#e5e5ea` · `#d1d1d6` | `#343436` · `#3c3c3e` | Entre filas · entre paneles |
| `tooltip` | `#3a3a3c` | `#48484a` | El tooltip, gris oscuro en los dos temas |

Para cambiar el tono de una capa en toda la app se pisa su variable `--sf-*` en `:root` y en `.dark` (por ejemplo `--sf-surface-secondary`). Los textos (`label`, `label-secondary`, `label-tertiary`) están calibrados contra estas capas: si oscurecés una, corré el test de contraste.

### El material translúcido y el wallpaper

Hay **un solo** material con blur, `material-translucent`, y va solo donde iCloud lo usa: la barra global y el header de un widget **sobre el wallpaper**. Con `prefers-reduced-transparency` o `prefers-contrast: more` vuelve a ser opaco.

El wallpaper son tres focos de color que salen de `--brand-base`, fijos detrás de todo:

```tsx
<AppShell ambient header={…} sidebar={…}>
```

Sin `AppShell`, la misma utilidad en el `<body>`: `className="bg-ambient"`. Es opt-in porque cambia el fondo de la app entera. Sobre él, la barra global de `AppShell` y el `Navbar` pasan solos a `material-translucent`.

Cuánta luz, con un número:

```css
:root {
  --ambient: 1;   /* 0 = página lisa · 1 = el default */
}
```

En el tema oscuro la luz ya viene más baja que en el claro —menos croma, menos alfa y los tres focos más cerca del matiz de la marca—, porque sobre negro un color saturado compite con el contenido. `--ambient` baja los dos temas por igual; para tocar uno solo, va adentro de `.dark`.

### Las utilidades

| Utilidad | Para qué |
|---|---|
| `material-translucent` | El único material con blur, para lo que va sobre el wallpaper. |
| `bg-ambient` | El wallpaper. |
| `scroll-fade` | El difuminado de un scroll interno, arriba y abajo, solo del lado donde hay contenido escondido. Va en el elemento que scrollea, si no tiene fondo propio. Lo traen `SidebarContent`, `ChatMessages` y `DrawerBody`. |
| `animate-skeleton` | El brillo lento del `Skeleton`, en la misma fase en todos los bloques. |
| `focus-ring` | El anillo interior de iCloud (`inset 0 0 0 3px`), del color del foco. |

`glass`, `glass-*`, `sheen`, `material-bar/popover/modal/group` y las variables `--glass` / `--glass-tint` se fueron en 2.0. Las reglas de cuándo va cada superficie están en [Reglas de uso](/docs/reglas).

## Claro y oscuro

**El tema oscuro se activa solo con la clase `.dark`.** No hay `data-theme`, y tampoco alcanza con que el sistema operativo esté en oscuro: el paquete no tiene ninguna regla atada a `prefers-color-scheme`. La única definición es esta línea de `theme.css`:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Con `next-themes` eso sale de `attribute="class"`, que es el default:

```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
```

Si ponés `attribute="data-theme"`, el atributo cambia, el botón de tema parece funcionar y **no pasa nada**: los colores se quedan en claro. Es el error más silencioso de la instalación, porque nada avisa.

**Sin `next-themes`** la clase la pone la app, a mano y en `<html>`:

```tsx
document.documentElement.classList.toggle("dark", oscuro)
```

Si además querés seguir la preferencia del sistema, eso también es de la app —una media query en JS, no en CSS—:

```tsx
const oscuro = window.matchMedia("(prefers-color-scheme: dark)").matches
document.documentElement.classList.toggle("dark", oscuro)
```

Hacerlo con una clase y no con la media query es lo que permite que el usuario elija un tema distinto al del sistema, que es lo que espera cualquiera que haya visto un botón de tema. En un `<html>` renderizado en el server, acordate del `suppressHydrationWarning`.

Dos controles para cambiarlo:

- **`ThemeSwitcher`** — barra segmentada de tres estados, para fuera de un menú: header público, página de ajustes.
- **`ThemeMenuRadio`** — los mismos tres estados como `menuitemradio` dentro de un `DropdownMenu` propio. `UserMenu` ya lo trae.

Sin `enableSystem` ninguno de los dos muestra la opción «Sistema».

El paquete define `color-scheme` en `html` y `html.dark`, así que los scrollbars, los `<select>` nativos y el autocompletado del navegador acompañan el tema sin código extra.

## Radio

Los radios son los de iCloud web (2.0), con nombre propio. Todos se pisan desde la app:

```css
:root {
  --radius-control: 8px;      /* botones, botones de ícono, segmentado, toggles */
  --radius-field: 10px;       /* campos: Input, Select, Combobox, la búsqueda */
  --radius-item: 10px;        /* ítems del Sidebar, filas de lista y de tabla elegidas */
  --radius-surface: 11px;     /* Card (el widget), Alert */
  --radius-panel: 11px;       /* Dialog, Sheet, Drawer */
  --radius-menu: 12px;        /* menús, Popover, HoverCard, toasts */
  --radius-menu-item: 8px;    /* el ítem de un menú */
  --radius-menu-header: 7px;  /* la cabecera de cuenta adentro de un menú: 12 − 5 de padding */
  --radius-tag: 4px;          /* Badge, Tag, chips de evento, miniaturas */
  --radius-tooltip: 6px;
  --radius-meter: 6px;        /* la barra de almacenamiento (Meter lg, StackedMeter) */
}
```

**Nada es cápsula en los controles**: en iCloud la búsqueda mide 10, el segmentado 8 y los botones 8. La cápsula quedó para lo que es redondo de verdad (avatar, Switch, la pista de un Slider). `Textarea` y un `Combobox` de varias filas usan el mismo `--radius-field`.

Son nombres propios y no pasos de la escala de Tailwind: redefinir `--radius-md` le cambiaría el radio también al código de la app, que comparte el tema. La escala (`rounded-md`, `rounded-xl`) sigue existiendo y es de la app; ningún componente la usa. `cn()` fusiona los nombres propios como a los de la escala (`rounded-control` y `rounded-none` no conviven).

El panel de un menú no es concéntrico con sus ítems, igual que en iCloud: radio 12 con 5 de padding e ítems de 8.

La navegación ya no tiene variantes flotantes: `Sidebar`, `Navbar` y `Toolbar` van a ras y a todo el ancho. `Sidebar` y `Navbar` **ya no ponen `data-variant`** en su elemento (la `Toolbar` sí, con `bar` o `plain`): para colgar estilos propios, usá su `data-slot`.

## Densidad

No hay una variable global de densidad, y es deliberado: una app con la mitad de la altura en todos los controles deja de ser accesible en mobile. Lo que sí hay son decisiones por componente:

| Dónde | Cómo |
|---|---|
| Controles | `size="sm"` (28px) en vez de `md` (36px). Elegilo una vez por formulario, no por campo. Con el dedo crecen solos (36 y 44). |
| Tablas | `<Table density="compact">` (filas de 32 en vez de 41). |
| Tarjetas | `size="sm"` baja el `--card-spacing` de 20px a 16px. |
| Sidebar | `<Sidebar collapsed>` deja solo los íconos (64px). |
| Página | `AppShellContent size="wide"` (1600px) o `"full"`. |

El espaciado interno de `Card` sale de `--card-spacing`, que se puede pisar puntualmente:

```tsx
<Card className="[--card-spacing:--spacing(8)]">
```

## Alto del shell

`AppShell` usa `--app-shell-height`, que por defecto es `100dvh`. Para embeberlo en una caja (una demo, un preview):

```tsx
<AppShell className="[--app-shell-height:720px]" … />
```
