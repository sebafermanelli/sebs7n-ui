Una app define **cuatro variables** y nada más. No hay que tocar ningún archivo del paquete ni recompilar nada.

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

`tokens/brands.json` trae cuatro marcas de ejemplo (`teal`, `terracotta`, `emerald`, `blue`) que usan el playground y los tests de contraste. **Son solo demos del sistema**: una app real no las usa ni edita ese archivo.

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
| `brand-700` | `Button variant="accent"`, `Switch variant="accent"`, anillo de foco, borde de `Card selected`. |
| `brand-800` | Hover del acento. |
| `brand-900` | `Button variant="link"`, texto de `Badge color="brand"`, `linkVariants`. |
| `brand-100…400` | Fondos y bordes suaves: `Badge variant="subtle" color="brand"`. |
| `brand-contrast` | El texto **encima** del acento. |

**Un solo acento por pantalla.** Si el CTA principal es `accent`, el switch de al lado no.

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

Los radios son tokens de Tailwind v4, así que se redefinen desde la app:

```css
@theme {
  --radius-md: 4px;   /* controles más cuadrados */
  --radius-xl: 8px;   /* tarjetas menos redondeadas */
}
```

Cambiar `--radius-md` toca botones, inputs e ítems de menú a la vez: es el radio del sistema. No hay un token «por componente» a propósito.

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
