La paleta, los radios y las sombras por defecto de Tailwind están **reseteados**: `bg-blue-50` o `shadow-md` no compilan. Solo existen los tokens del paquete.

Los valores viven en `tokens/geist.json` y se compilan a `src/styles/colors.css` con `npm run tokens`; un test falla si el CSS quedó desactualizado. Las tablas de esta página se generan de esos mismos archivos.

## Fondos: página, superficie y banda

Son tres roles distintos y cada uno tiene su token. Elegir mal se nota sobre todo en oscuro, donde la página es negro puro:

{{fondos}}

**La regla:** si el elemento **es** la página, `bg-background`; si flota **sobre** ella, `bg-background-100`.

Los valores de oscuro son los de vercel.com medidos con `getComputedStyle` (contact/sales, 2026-09-22): `--ds-background-100: hsla(0,0%,4%)` = `#0a0a0a` para las superficies y `--ds-background-200: hsla(0,0%,0%)` = `#000` para la página. `background-200` es siempre el tono que **no** es el de la página: en claro baja a `#fafafa`, en oscuro no puede bajar de `#000` y sube a `#0a0a0a`. Por eso en oscuro coincide con `background-100`: Geist tiene dos fondos por tema, no tres.

## Color

Diez pasos por familia, de `100` (el más claro en tema claro) a `1000`. La convención de Geist: **100–400 son fondos, 500–700 son bordes y elementos, 800–1000 son texto**. El contraste de `gray-900` sobre cualquier fondo de la misma familia llega a AA.

{{colores}}

`brand` no está en la tabla porque no tiene valores fijos: se deriva de las tres variables de la app. Ver [Theming](/docs/theming).

## Tipografía

Las utilidades de Geist. `cn()` las entiende como tamaño de fuente, así que conviven con `text-gray-900`.

{{tipografia}}

**Los `heading` llevan el peso corregido ópticamente**, no 600 fijo. Un mismo peso no se ve igual a 14px que a 64px: cuanto más grande el cuerpo, más gruesos se leen los trazos, y 600 a 64px sale plomizo. Los números salen de medir vercel.com (computed style, 2026-09-22); los pasos que no aparecían ahí se interpolan en la misma curva.

**No lo pises con `font-semibold`**: para eso está el paso de arriba de la escala. Y necesita Geist como fuente variable (rango `100 900`); con una estática los pesos intermedios se redondean y la corrección se pierde.

Cuándo usar cada familia:

| Familia | Para qué |
|---|---|
| `heading-*` | Títulos. Peso óptico, tracking negativo. |
| `copy-*` | Párrafos y texto corrido. Interlineado holgado. |
| `label-*` | Etiquetas, celdas, metadatos. Interlineado ajustado, peso 400. |
| `button-*` | Texto dentro de controles. Peso 500. |
| `*-mono` | Código, IDs, importes. Geist Mono. |

## Radios

{{radios}}

`rounded-md` (6px) es el radio del sistema: botones, inputs, ítems de menú. `rounded-xl` (12px) es el de las tarjetas. `rounded-full` solo en `Badge`, en avatares y en `Button shape="pill"`.

## Sombras

{{sombras}}

Las tres terminan en un anillo de 1px que en oscuro reemplaza al borde. No hay sombras decorativas: una sombra en este sistema significa «esto flota», y solo flotan los tres tipos de superficie de arriba.

## Foco y movimiento

| Utilidad | Dónde |
|---|---|
| `focus-visible:focus-ring` | Controles: botones, ítems de menú, tabs, toggles. Anillo de 2px en `brand-700` con hueco. |
| `focus:focus-border` | Campos: Input, Textarea, Select, Combobox. Tiñe el borde y agrega un halo. |
| `focus:focus-border-error` | Lo mismo, en rojo, cuando el campo tiene `aria-invalid`. |
| `transition-control` | 150 ms, `ease`, solo color / fondo / borde / sombra / opacidad. |
| `animate-skeleton` | El latido del `Skeleton`. |

Todas las animaciones pasan por `motion-reduce`, además del reset global del paquete.
