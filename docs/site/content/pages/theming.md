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
| `brand-700` | `Button variant="accent"`, anillo de foco y borde del campo enfocado, borde de `Card selected`, franja de `Alert variant="brand"`, `Badge solid color="brand"`. Y **todo lo que está prendido**: `Checkbox` y `Radio` marcados, `Switch`, el relleno de `Slider`, `Progress` y `Meter`. |
| `brand-700` en tinte | La selección: el ítem de menú bajo el puntero, el ítem activo del `Sidebar`, la fila elegida de `Table` y el rango de `Calendar` (14 % en claro, 22 % en oscuro). Es `bg-highlight`. |
| `brand-800` | Hover del acento. |
| `brand-900` | `Button variant="link"`, ícono de `Alert variant="brand"`, ícono del ítem activo del `Sidebar`. |
| `brand-ink` | El texto de `Badge` y `Tag` de marca: a mitad de camino entre `brand-900` y `brand-1000`. |
| `brand-1000` | Hover del `Button variant="link"`. |
| `brand-100` · `brand-400` | No los usa ningún componente desde 1.0: el fondo suave de `Badge` y `Tag` es `brand-700` en alfa. |
| `brand-contrast` | El texto **encima** del acento. |

`brand-200`, `brand-300` y `brand-500` no los usa ningún componente: existen para la app, que también tiene la escala completa. Y `linkVariants` **no usa la marca**: los links de texto son grises (`gray-900` → `gray-1000`), para que un párrafo con tres links no se convierta en tres manchas de color.

**Un solo acento sólido por pantalla.** El `Button variant="accent"` es la acción principal y va uno. Los estados prendidos no compiten con él: son chicos y dicen «esto está activo», no «apretá acá». Si en una pantalla igual molestan, `Switch variant="neutral"` prende en gris.

## Glass

El material de todo lo que flota —Card, Popover, menús, Dialog, Sidebar, Navbar— sale de **un solo número**, como el ajuste de transparencia de macOS:

```css
:root {
  --glass: 1;        /* 0 = sólido · 1 = Liquid Glass, el default */
  --glass-tint: 0;   /* cuánto brand entra al vidrio */
}
```

| `--glass` | Fill | Blur | Se ve |
|---|---|---|---|
| `0` | 100 % | 0 | Sólido: el Geist de 0.8.0. |
| `0.5` | 82 % | 8px | Esmerilado. |
| `1` | 65 % | 16px | El default: el fondo se reconoce desenfocado y el texto principal llega a 4,5:1 contra cualquier cosa que pase por debajo. |

De ese número salen también la saturación, el punto de brillo y el canto especular. No hay una variable por capa a propósito: cinco perillas sueltas dan un vidrio que nadie calibró.

**Se puede pisar en un subárbol.** Las utilidades calculan la intensidad en el elemento, no en `:root`:

```tsx
{/* Una galería de fotos: el vidrio que flota encima necesita más cuerpo. */}
<section style={{ "--glass": 0.5 } as React.CSSProperties}>…</section>
```

### La luz ambiente

Sobre una página blanca o negra lisa el vidrio no tiene nada que desenfocar y se ve como un gris plano. La luz ambiente son tres focos de color que salen de `--brand-base`, fijos detrás de todo:

```tsx
<AppShell ambient sidebar={…}>
```

Sin `AppShell`, la misma utilidad en el `<body>`: `className="bg-ambient"`. Es opt-in porque cambia el fondo de la app entera.

Cuánta luz, con un número:

```css
:root {
  --ambient: 1;   /* 0 = página lisa · 1 = el default */
}
```

En el tema oscuro la luz ya viene más baja que en el claro —menos croma, menos alfa y los tres focos más cerca del matiz de la marca—, porque sobre negro un color saturado compite con el contenido. `--ambient` baja los dos temas por igual; para tocar uno solo, va adentro de `.dark`. El vidrio no cambia: `--glass` sigue en lo que esté.

### Las utilidades

| Utilidad | Para qué |
|---|---|
| `glass` | Una superficie que flota. Reemplaza a `bg-background-100`. |
| `glass-thin` · `glass-thick` | El grosor: lámina (Tooltip, chip) o placa (Dialog, Sidebar). Van al lado de `glass`. |
| `glass-dense` | El vidrio de una lista de texto: más fill y, en oscuro, lo de atrás apagado. Va al lado de `glass`. Los menús ya lo traen. |
| `glass-control` | Un control **adentro** de un vidrio: alfa, sin blur. |
| `scroll-fade` | El difuminado de un scroll interno, arriba y abajo, solo del lado donde hay contenido escondido. Va en el elemento que scrollea, si no tiene fondo propio. Lo traen `SidebarContent`, `ChatMessages` y `DrawerBody`. |
| `glass-rim` | El canto especular del cromo. El elemento tiene que estar posicionado. |
| `sheen` | El brillo de arriba de un botón de color. |
| `bg-ambient` | La luz ambiente. |

Las reglas de cuándo va cada una están en [Reglas de uso](/docs/reglas).

### Volver al sólido

```css
:root {
  --glass: 0;
  --radius-field: 6px;
  --radius-control: 6px;
  --radius-surface: 12px;
  --radius-panel: 16px;
}
```

Con eso el material y los radios son los de 0.8.0. Lo que no vuelve es la forma del botón (`shape="rect"` lo devuelve uno por uno) ni el brand de los estados prendidos.

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

Los componentes usan cuatro radios, y los cuatro se pisan desde la app:

```css
:root {
  --radius-field: 9999px;   /* campos: Input, Select, Combobox, DatePicker */
  --radius-control: 10px;   /* ítems de menú y de sidebar, casillas de OTP */
  --radius-surface: 20px;   /* Card, Alert, Table, Popover, Toast */
  --radius-panel: 26px;     /* Dialog, Drawer, Navbar flotante */
}
```

**Los campos son cápsulas**, la misma forma que un `Button`: en un formulario, el campo y el botón de abajo tienen la misma curva. Lo que tiene más de una línea no puede serlo —una cápsula de tres renglones es un óvalo—, así que `Textarea` y un `Combobox` con varias filas de chips frenan su radio en 20px. Con `--radius-field: 10px` vuelven todos al rectángulo.

Son nombres propios y no pasos de la escala de Tailwind: redefinir `--radius-md` le cambiaría el radio también al código de la app, que comparte el tema. La escala (`rounded-md`, `rounded-xl`) sigue existiendo y es de la app; ningún componente la usa.

El panel de un menú no tiene token: su radio es el del ítem más el `p-1` que los separa, así las dos curvas quedan concéntricas cualquiera sea el valor de `--radius-control`.

El `Button` es una cápsula (`rounded-full`). No hay un token «por componente» a propósito.

## Densidad

No hay una variable global de densidad, y es deliberado: una app con la mitad de la altura en todos los controles deja de ser accesible en mobile. Lo que sí hay son decisiones por componente:

| Dónde | Cómo |
|---|---|
| Controles | `size="sm"` (32px) en vez de `md` (40px). Elegilo una vez por formulario, no por campo. |
| Tablas | `<Table density="compact">`. |
| Tarjetas | `size="sm"` baja el `--card-spacing` de 24px a 16px. |
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
