Una dependencia, un `@import` y cuatro variables de marca. No hay `tailwind.config.js` ni archivos copiados al repo de la app.

## Instalar

El paquete está publicado en npm como [`sebs7n-ui`](https://www.npmjs.com/package/sebs7n-ui): público y MIT.

```bash
pnpm add sebs7n-ui @base-ui/react next-themes sonner
```

```bash
npm install sebs7n-ui @base-ui/react next-themes sonner
```

```bash
bun add sebs7n-ui @base-ui/react next-themes sonner
```

Todo lo que va después de `sebs7n-ui` lo instala la app, no el paquete.

Las `peerDependencies` van así para que haya **una sola copia** de React y de Base UI en el árbol; dos copias de React rompen los hooks, y dos de Base UI rompen el foco de los popups:

| Peer | Rango |
|---|---|
| `react` · `react-dom` | `^19.2.0` |
| `@base-ui/react` | `^1.8.0` |
| `next-themes` | `^0.4.6` |
| `sonner` | `^2.0.7` |

La fuente es **Inter**, y la carga la app: el paquete no la trae ni la declara como peer. `--font-sans` lee `--font-inter`, que define el layout raíz (ver abajo); sin ella todo cae en `system-ui`. La mono es la del sistema (SF Mono, Consolas): no hay nada que cargar.

El resto —`clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`— viaja como dependencia normal del paquete: no las instalás vos.

## Compatibilidad

| | Versión |
|---|---|
| React | 19.2+ (Server Components y `"use client"`) |
| Next.js | 15 o 16, App Router (Turbopack o webpack) |
| Tailwind CSS | **v4** — tokens por `@theme`, sin `tailwind.config.js` |
| Base UI | `@base-ui/react` 1.8+ |
| TypeScript | `moduleResolution: "bundler"` (o `node16` / `nodenext`) |
| Módulos | Solo ESM |

Los componentes no dependen de Next: funcionan en cualquier bundler que entienda `exports` y la directiva `"use client"`. Lo único específico de Next en los ejemplos es `next/link` y `next/navigation`.

## 1. CSS

En `globals.css`, **en este orden**:

```css
@import "tailwindcss";
@import "sebs7n-ui/theme.css";

:root {
  --brand-base: oklch(0.573 0.214 258);
  --brand-base-dark: oklch(0.573 0.214 258);
  --brand-contrast: #fff;
  --brand-contrast-dark: #fff;
}
```

Eso es todo. `theme.css` trae los tokens (colores, tipografía, radios, sombras), el reset de la paleta y el `@source` que hace que el Tailwind de la app escanee el `dist/` del paquete y genere las utilidades que usan los componentes.

**No escribas vos el `@source`.** Antes esta página pedía un `@source "../node_modules/sebs7n-ui/dist"` con la ruta calculada a mano según dónde estuviera tu `globals.css`, y ese era el error de instalación más frecuente: si la ruta está mal, Tailwind **no avisa nada**. El build dice "Compiled", el CSS baja de 75 KB a 13 y la app entera queda sin estilo. Ahora el `@source` vive adentro del paquete, que es el único lugar donde la ruta siempre es la misma.

### Achicar el CSS: `@source not`

El `@source` del paquete escanea los 58 componentes, así que el CSS final trae utilidades de componentes que tu app no importa. Se pueden excluir uno por uno:

```css
@import "sebs7n-ui/theme.css";
@source not "../../node_modules/sebs7n-ui/dist/components/combobox.js";
@source not "../../node_modules/sebs7n-ui/dist/components/drawer.js";
```

Los caros son `combobox`, `autocomplete`, los tres menús, `drawer` y `user-menu`. Esto es opt-in a propósito: equivocarse acá falla **ruidosamente** —el componente aparece sin estilo la primera vez que lo usás—, al revés que olvidarse el `@source`. Y ojo con las cadenas: `user-menu` arrastra avatar, dropdown-menu, theme-switcher y tooltip.

### Una sola hoja de utilidades

Hasta 0.4.0 el paquete publicaba además `sebs7n-ui/styles.css`, una hoja precompilada. Se sacó en 0.5.0: con dos hojas de utilidades cargadas, un `hidden lg:block` de la app perdía contra el `hidden` del paquete, porque gana la que se declaró último y no la más específica. Las clases de los componentes las genera el Tailwind de la app a partir del `@source` que trae `theme.css`, que es el orden que Tailwind sabe resolver.

### Las cuatro variables de marca

`--brand-base`, `--brand-base-dark`, `--brand-contrast` y `--brand-contrast-dark` son lo único que cambia entre productos: de ahí sale la escala `brand-100…1000`. Las dos de contraste vienen en `#fff` por defecto, y `--brand-contrast-dark` cae en `--brand-contrast` si no se declara, así que con un acento oscuro alcanza con las dos primeras. El detalle de cómo se deriva, el requisito de contraste y el modo oscuro están en [Theming](/docs/theming).

## 2. Layout raíz

Inter con `next/font/google` y su `.variable` en `<html>`, el `ThemeProvider` de `next-themes` con `attribute="class"`, y `TooltipProvider` + `<Toaster />` de `sebs7n-ui`.

```tsx
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
// Por subpath, no por el barrel: el layout raíz envuelve TODAS las páginas, así
// que un `from "sebs7n-ui"` acá le suma los 58 componentes a cada una.
import { Toaster } from "sebs7n-ui/sonner"
import { TooltipProvider } from "sebs7n-ui/tooltip"
import "./globals.css"

// La variable tiene que llamarse `--font-inter`: es la que lee `--font-sans`.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

`next/font/google` define `--font-inter` en la clase que devuelve `.variable`, y el token `--font-sans` del paquete la lee de ahí. Sin esa clase en `<html>`, todo cae en `system-ui`.

`suppressHydrationWarning` en `<html>` no es opcional: `next-themes` escribe la clase `dark` antes de hidratar y sin eso React avisa en cada carga.

Inter tiene que ser la **fuente variable**: los roles tipográficos usan pesos intermedios que con una estática se redondean. `next/font/google` ya la sirve variable.

### Fuera de Next

`@fontsource-variable/inter`: se importa una vez y la fuente queda registrada como `"Inter Variable"`, que `--font-sans` ya tiene en la lista, así que no hace falta definir `--font-inter`.

```bash
npm install @fontsource-variable/inter
```

```ts
// En el entry de la app (main.tsx, _app.tsx), una sola vez.
import "@fontsource-variable/inter"
```

## 3. Usar

```tsx
import { Button } from "sebs7n-ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "sebs7n-ui/card"

export function Panel() {
  return (
    <Card>
      <CardHeader><CardTitle>Facturas</CardTitle></CardHeader>
      <CardContent>
        <Button>Nueva factura</Button>
      </CardContent>
    </Card>
  )
}
```

## Imports por componente

Cada módulo tiene su entry point. **En páginas de marketing o landing, importá por subpath**; el barrel queda para dashboards, que igual usan casi todo.

```tsx
import { Button } from "sebs7n-ui/button"
import { Card, CardContent } from "sebs7n-ui/card"
import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"
import { buttonVariants } from "sebs7n-ui/variants/button" // sin "use client"
import { cn } from "sebs7n-ui/lib/utils"
```

{{subpaths}}

Por qué: el barrel hace `export *` de los 58 componentes, y **42** llevan `"use client"`. Next no puede podar referencias cliente a través de ese barrel (tampoco con `optimizePackageImports`), así que una página con `Button` + `Card` + `ThemeSwitcher` se lleva también Sonner, Sidebar, Select, AlertDialog y el resto. Medido en Next 16.3 (Turbopack) con esa página: **297,5 KB → 234,8 KB** de JS cliente gzip (−21 %).

No mezcles barrel y subpaths en la misma página: el barrel vuelve a traer todo.

## Idioma

El sistema habla **español**: los textos que los componentes escriben solos —«Cerrar», «Sin resultados», «Ir al contenido», «Buscando…»— están en español y son el default. Si tu app está en otro idioma, envolvé el árbol una vez:

```tsx
import { LabelsProvider, type Labels } from "sebs7n-ui/labels"

// Sin `...defaultLabels` y anotado `: Labels`, TypeScript exige la traducción
// completa y te lista grupo por grupo lo que falta.
const en: Labels = {
  appShell: { openMenu: "Open menu", navigation: "Main navigation", skipToContent: "Skip to content" },
  dialog: { close: "Close" },
  sheet: { close: "Close" },
  drawer: { close: "Close" },
  // …
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LabelsProvider value={en}>{children}</LabelsProvider>
      </body>
    </html>
  )
}
```

`LabelsProvider` acepta un `PartialLabels`, así que también se puede traducir un solo grupo —o una sola clave— y el resto se queda en español. Las dos formas son válidas y conviene elegir a conciencia:

| Cómo se escribe | Qué pasa con lo que falta |
|---|---|
| `const en: Labels = { … }`, **sin** `...defaultLabels` | TypeScript no compila hasta que esté todo traducido. |
| `const en: PartialLabels = { … }`, o con `...defaultLabels` | Compila, y lo que falta sale en español en producción. |

Ojo con el atajo: `const en: Labels = { ...defaultLabels, … }` **no** marca nada, porque el spread ya satisface todas las claves. La anotación sirve cuando la traducción se escribe entera.

Los providers anidados se suman. La prop `labels` de cada componente le gana al provider: es la excepción de una pantalla, no la traducción.

### El `value` se puede armar en el render

Con i18n de verdad los textos salen de un hook, así que el objeto es nuevo en cada render:

```tsx
"use client"
import { useTranslations } from "next-intl"

export function UiLabels({ children }: { children: React.ReactNode }) {
  const t = useTranslations("ui")
  return <LabelsProvider value={{ dialog: { close: t("close") }, combobox: { empty: t("empty") } }}>{children}</LabelsProvider>
}
```

**No hace falta envolverlo en `useMemo`.** El provider memoiza contra el **contenido**: si el `value` nuevo dice lo mismo que el anterior, el contexto conserva su identidad y nadie se re-renderiza. Son 24 comparaciones de strings —0,6 µs medidos— contra re-renderizar todo lo que lee el contexto, que es la app entera. Que el llamador tuviera que saber eso era pedirle que conociera la implementación del provider.

### Los labels que se pegan a un dato son plantillas

`combobox.remove` arma el nombre del botón de quitar un chip. Como string es un **prefijo** —«Quitar» + «Chile»—, y eso solo funciona donde el verbo va adelante: en alemán es «Chile entfernen». Por eso acepta también una función, igual que el `labels.page` de `Pagination`:

```tsx
// A nivel de módulo, no adentro del componente: es lo único de `Labels` que el
// provider compara por identidad, porque comparar funciones por contenido no existe.
const remove = (name: string) => `${name} entfernen`

<LabelsProvider value={{ combobox: { remove } }}>
```

El string sigue andando igual y es lo que corresponde en español. Lo mismo vale para las props `removeLabel` de `Tag` y `ComboboxChip`, que le ganan al provider.

`Breadcrumb`, `Pagination` y `Tag` no leen del provider —leerlo los volvería componentes de cliente y los tres se pueden renderizar en un Server Component—: sus textos van por prop.

`PageHeader` sí lo lee y sigue siendo Server Component: el `<nav>` de las migas es un subcomponente de cliente interno. Su `breadcrumbLabel` ya no tiene default en español, es el override de una pantalla.

El `lang` del `<html>` es tuyo y no es opcional: cambia la pronunciación del lector de pantalla.

## Verificar que quedó bien

**El check que no falla nunca: poné un `<Button>Hola</Button>` en una página y miralo.**

```tsx
import { Button } from "sebs7n-ui/button"

<Button>Hola</Button>
```

Tiene que verse **con el fondo del color de marca y texto blanco**, con 8px de radio y 36px de alto. Si sale como un botón del navegador —gris, con borde de sistema, sin redondear—, las utilidades del paquete no se generaron: revisá que `@import "sebs7n-ui/theme.css"` esté **después** de `@import "tailwindcss"` y que sea el paquete instalado y no una copia vieja en el repo. Es binario a propósito: no hay que leer ningún CSS ni abrir devtools, y es justo el síntoma que antes tenía una causa invisible —el `@source` con la ruta mal—, que ya no existe porque lo pone el paquete.

Después, tres cosas más:

1. `bg-slate-500` **no** tiene que compilar: la paleta de Tailwind está reseteada y solo existen los tokens del paquete. Ojo con el ejemplo: `bg-blue-500` **sí** compila, porque Geist tiene su propia escala `blue` en pasos 100–1000. Lo que no existe son las escalas de Tailwind que el paquete no repone (`slate`, `zinc`, `sky`…) ni los pasos que Geist no tiene (`bg-blue-50`).
2. En oscuro —con la clase `.dark` en `<html>`; ver [Theming](/docs/theming)—, un `Input` tiene que verse **más claro** que el fondo de la página (`#0a0a0a` sobre `#000`). Si son el mismo negro, hay algo pisando `--sf-background-100`. Si no cambia nada al prender el tema oscuro, lo más probable es que `next-themes` esté con `attribute="data-theme"`: el paquete solo mira la clase.
3. Tabulá: la primera parada de un `AppShell` es «Ir al contenido».
