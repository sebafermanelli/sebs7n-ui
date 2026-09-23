# Migrar desde las versiones internas a 0.1.0

Esta guía es para las aplicaciones privadas que ya usaban el sistema bajo su
nombre interno (`@sf/ui`, después `sf-ui`). Son dos cambios incompatibles, los
dos mecánicos: el primero es buscar y reemplazar, el segundo solo toca las apps
que pintan el fondo de página a mano.

---

## 1. El paquete se llama `sebs7n-ui` (antes `@sf/ui` / `sf-ui`)

`package.json` de la app:

```diff
-    "@sf/ui": "file:vendor/sf-ui-1.4.0.tgz",
+    "sebs7n-ui": "file:vendor/sebs7n-ui-0.1.0.tgz",
```

Los imports y el `@import` del CSS:

```diff
-import { Button } from "@sf/ui/button"
-import { cn } from "@sf/ui/lib/utils"
+import { Button } from "sebs7n-ui/button"
+import { cn } from "sebs7n-ui/lib/utils"
```

```diff
 @import "tailwindcss";
-@import "@sf/ui/theme.css";
-@source "../node_modules/@sf/ui/dist";
+@import "sebs7n-ui/theme.css";
+@source "../node_modules/sebs7n-ui/dist";
```

En un repo típico alcanza con:

```bash
rg -l '@sf/ui|sf-ui' | xargs sed -i '' -e 's|@sf/ui|sebs7n-ui|g' -e 's|sf-ui|sebs7n-ui|g'
```

Ojo con dos lugares que `rg` sobre `src/` no ve: el `@source` de `globals.css`
(si apunta a `node_modules/@sf/ui/dist` o `node_modules/sf-ui/dist`) y cualquier
`transpilePackages` / `optimizePackageImports` en `next.config.ts`.

---

## 2. El fondo de página es un token propio

### Qué pasaba

En oscuro, `--sf-background-100` y `--sf-background-200` valían los dos
`#000000`, y `body` usaba `background-100`. Como los inputs, popups, sheets y
tarjetas también usan `bg-background-100`, quedaban **exactamente del mismo
negro que la página** y no se despegaban.

### Qué hay ahora

Tres roles separados, uno por token:

| Token | Utilidad | Rol | Claro | Oscuro |
|---|---|---|---|---|
| `--sf-background` | `bg-background` | **Página.** `body` y la raíz del `AppShell`. | `#ffffff` | `#000000` |
| `--sf-background-100` | `bg-background-100` | **Superficie.** Input, Select, Textarea, popup de menú, Popover, Dialog, Sheet, Card, Alert, Toast, barra mobile del shell. | `#ffffff` | `#0a0a0a` |
| `--sf-background-200` | `bg-background-200` | **Fondo sutil / banda.** Sidebar, `thead`/`tfoot` de Table, `Card variant="subtle"`, `EmptyState`. | `#fafafa` | `#0a0a0a` |

Los valores salen de medir vercel.com en oscuro (contact/sales, 2026-09-22):
`--ds-background-100: hsla(0,0%,4%)` = `#0a0a0a` para las superficies,
`--ds-background-200: hsla(0,0%,0%)` = `#000` para la página; `body` computa
`rgb(0,0,0)` y un `input`, `rgb(10,10,10)`.

`background-200` es el tono que **no** es el de la página en cada tema: en claro
la página es blanca y la banda baja a `#fafafa`; en oscuro la página es negro
puro y la banda no puede bajar más, así que sube a `#0a0a0a`. Por eso en oscuro
`background-100` y `background-200` coinciden: Geist tiene dos fondos por tema,
no tres.

### Qué tenés que hacer

**Nada, si no pintabas fondos a mano.** El `body` lo pinta el reset del paquete
y ya usa el token nuevo; los componentes ya están migrados.

**Si tu app pinta el fondo de página**, cambiá el token:

```diff
-<div className="min-h-dvh bg-background-100">
+<div className="min-h-dvh bg-background">
```

La regla para decidir: si el elemento **es** la página (o la ocupa entera), va
`bg-background`. Si es algo que flota **sobre** la página —una tarjeta, un
panel, un input, un popup—, va `bg-background-100`.

**Si tenías un parche** para que los inputs o las tarjetas se vieran en oscuro
(un `dark:bg-[#0a0a0a]`, un `dark:bg-gray-100`, un override de
`--sf-background-100`), **sacalo**: ahora está en el paquete y el parche lo
pisa.

### Qué cambia de color sin que toques nada

Solo en **oscuro**; en claro no cambia ni un píxel.

| Dónde | Antes | Ahora |
|---|---|---|
| Página (`body`, raíz del `AppShell`) | `#000000` | `#000000` (igual) |
| Input, Select, Textarea, Checkbox, Radio | `#000000` | `#0a0a0a` |
| Popup de `DropdownMenu` / `UserMenu` / `NavigationMenu`, Popover, Dialog, AlertDialog, Sheet, Toast | `#000000` | `#0a0a0a` |
| Card `default`, Alert, Toggle, `ThemeSwitcher`, botón `outline`, bola del `Switch` | `#000000` | `#0a0a0a` |
| Sidebar, `thead`/`tfoot` de Table, Card `subtle`, `EmptyState` | `#000000` | `#0a0a0a` |
| Barra mobile del `AppShell` | `#000000` | `#0a0a0a` |
| Hueco del anillo de foco (`focus-ring`) | `#000000` | `#0a0a0a` |
| Texto sobre fondo invertido (botón `default`, Tooltip, Badge `solid gray`) | `#000000` | `#0a0a0a` |
| Anillo exterior de `shadow-menu` / `shadow-modal` / `shadow-tooltip` | `#000000` | `#000000` (igual) |

Los últimos tres son los mismos tokens de Vercel: `--ds-focus-ring` usa
`hsla(0,0%,4%)` y `--ds-shadow-menu` termina en `0 0 0 1px hsla(0,0%,0%)`.

### Contraste

`#0a0a0a` es 4 % de luminosidad, así que los ratios bajan poco y ninguno cruza
un umbral (calculado con la fórmula de WCAG 2.1 sobre `tokens/geist.json`):

| Texto en oscuro | Sobre `#000000` | Sobre `#0a0a0a` |
|---|---|---|
| `gray-1000` `#ededed` (cuerpo) | 17,94:1 | 16,91:1 |
| `gray-900` `#a0a0a0` (secundario) | 8,03:1 | 7,57:1 |
| `gray-800` `#7d7d7d` (el más tenue que se usa como texto) | 5,10:1 | 4,81:1 |

El peor caso sigue arriba de AA (4,5:1). Los tests de contraste de marca pasan
sin cambios.

---

## Checklist

```bash
# 1. renombrar
rg -l '@sf/ui|sf-ui' | xargs sed -i '' -e 's|@sf/ui|sebs7n-ui|g' -e 's|sf-ui|sebs7n-ui|g'

# 2. buscar fondos de página pintados a mano
rg 'bg-background-100' src app        # ¿alguno es "la página"? → bg-background

# 3. buscar parches viejos de oscuro
rg 'dark:bg-\[#0a0a0a\]|--sf-background-100'

# 4. instalar y mirar en oscuro
pnpm add ./vendor/sebs7n-ui-0.1.0.tgz && pnpm dev
```
