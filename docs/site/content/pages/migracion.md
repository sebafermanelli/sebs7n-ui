La 1.0 cambia el material, los radios y dónde aparece el color de marca. Los componentes del paquete ya vienen migrados: lo que hay que tocar es **el código de la app** que pintaba superficies a mano.

## En dos minutos

```bash
pnpm add sebs7n-ui@^1
```

Sin tocar nada más, la app compila y los componentes del paquete se ven de vidrio. Lo que queda viejo es lo propio: un `<div className="rounded-xl border border-gray-400 bg-background-100">` sigue siendo una caja blanca opaca con 12px de radio, al lado de Cards de vidrio con 20.

**Para no migrar todavía**, esto deja el material y los radios como en 0.8:

```css
:root {
  --glass: 0;
  --radius-field: 6px;
  --radius-control: 6px;
  --radius-surface: 12px;
  --radius-panel: 16px;
}
```

## Clases

| Antes | Ahora | Cuándo |
|---|---|---|
| `bg-background-100` | `glass` | Una superficie que flota: una tarjeta, un panel, una barra sticky. |
| `bg-background-100` | `glass-control` | Un control **adentro** de una superficie: un botón propio, un campo, un chip. |
| `bg-background-100/80 backdrop-blur-*` | `glass glass-thick` | Una barra translúcida hecha a mano. |
| `bg-background-200` | `bg-gray-alpha-100` | Una zona hundida: una banda, un `thead`, un bloque de código. |
| `bg-gray-100` · `bg-gray-200` | `bg-gray-alpha-100` · `bg-gray-alpha-200` | Un hover o un relleno **sobre** una superficie. |
| `bg-gray-200` · `bg-gray-300` | `bg-gray-alpha-400` | La pista de una barra de progreso hecha a mano: es la del `Progress` del paquete. |
| `bg-brand-100` | `bg-highlight` | Un estado con el color de marca: una zona de arrastre activa, una fila elegida. Opaco, adentro de un vidrio queda como un parche. |
| `border-gray-400` | `border-gray-alpha-400` | Siempre. |
| `hover:border-gray-500` | `hover:border-gray-alpha-500` | Siempre. |
| `rounded-md` | `rounded-field` | Un campo hecho a mano: un input, un select nativo, un buscador. Y `px-3` pasa a `px-4`. |
| `rounded-md` | `rounded-control` | Ítems de lista, casillas, lo que no es un campo. |
| `rounded-lg` · `rounded-xl` | `rounded-surface` | Tarjetas, paneles. |
| `rounded-2xl` | `rounded-panel` | Lo más grande: un hero, un modal propio. |
| `var(--radius-md)` · `var(--radius-xl)` | `var(--radius-control)` · `var(--radius-surface)` | En CSS escrito a mano. |

`bg-background` (la página) no cambia. `bg-background-100` sigue existiendo como token: es válido donde hace falta un fondo **opaco** a propósito, como el `thead` sticky de una tabla que scrollea por debajo.

**No es buscar y reemplazar.** `bg-background-100` se reparte entre `glass` y `glass-control` según si el elemento flota o vive adentro de algo que flota. Dos vidrios apilados se comen el contraste y el segundo no desenfoca nada: ver [Reglas de uso](/docs/reglas).

## Componentes

| Componente | Qué cambió | Qué hacer |
|---|---|---|
| `Input` · `Select` · `Combobox` · `DatePicker` · `NumberField` | Son cápsulas, con 16px de padding horizontal. | Nada. `--radius-field: 10px` los devuelve al rectángulo. |
| `Textarea` | Radio de 20px. | Nada. |
| `Button` | Es una cápsula. | Nada, o `shape="rect"` donde una cápsula no entra. |
| `Tabs` | La lista es una pista segmentada y ya no mide `w-full`. | `<TabsList variant="line">` para la navegación de una página entera. **En 2.0 se invierte:** la línea de Settings de iCloud es el default y el segmentado se pide con `variant="segmented"` (ver el CHANGELOG). |
| `Switch` | Prende con el brand. `variant="accent"` es igual al default. | `variant="neutral"` si el color molesta. |
| `Checkbox` · `Radio` · `Slider` · `Progress` · `Meter` | Lo prendido usa el brand. | Nada. |
| `Badge` · `Tag` | Vidrio teñido: fondo y borde en alfa, texto en la tinta de la paleta. | Nada. Si copiaste el cuerpo a mano (`bg-red-100 text-red-900 border-red-400`), pasalo a `badgeVariants({ color: "red" })`. |
| `Tooltip` | Sin flecha. | Nada. |
| `Alert` | Es alfa sin blur (`glass-control`), así que puede ir adentro de una `Card`. La franja es una píldora adentro; 20px de padding izquierdo. | Nada. |
| `Table` | El contenedor es vidrio. | Adentro de una `Card`, `className="glass-control"` en la tabla para no apilar dos. |
| `ThemeSwitcher` | Es la pista de `Tabs`, con una pastilla que se desliza. | Sacá cualquier `data-checked:bg-*` que le hayas pisado. |
| `Input type="date"` | — | Pasalo a `DatePicker`. **No valida:** si la fecha es obligatoria, chequealo al enviar. |
| `AppShell` | Prop nueva `ambient`. | Prendela para que el vidrio tenga qué desenfocar. |

## La luz ambiente

Con `AppShell`:

```tsx
<AppShell ambient sidebar={…}>
```

Sin `AppShell` —un sitio con `Navbar`—, en el `<body>`:

```tsx
<body className="bg-ambient" data-ambient="">
```

Si algún contenedor de la app pinta `bg-background` a todo el ancho, tapa la luz: sacáselo y dejá que se vea el del `body`.

## Tests

Un test que fije clases de un componente del paquete (`toHaveClass("rounded-md")`, `bg-background-100`, `data-highlighted:bg-gray-200`) va a fallar. Es el test el que quedó viejo.

## Contraste

Con el default el texto pasa AA sobre la página y sobre la luz ambiente. Un vidrio que flota sobre fotos, video o un color sólido necesita más cuerpo:

```tsx
<section style={{ "--glass": 0.5 } as React.CSSProperties}>…</section>
```

El detalle está en [Accesibilidad](/docs/accesibilidad).
