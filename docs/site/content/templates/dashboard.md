# Template: dashboard operativo

> Una app de facturación entera con sebs7n-ui: Inicio, Facturas, Clientes y Configuración con el estado compartido. Para copiar la estructura y cambiar los datos.

En vivo: [ui.sebastianfermanelli.com/templates/dashboard](https://ui.sebastianfermanelli.com/templates/dashboard). Las reglas que sigue están en la [Guía para agentes](https://ui.sebastianfermanelli.com/docs/guia-agentes.md).

## Usarlo en una app

```bash
npx shadcn@latest add https://ui.sebastianfermanelli.com/r/dashboard.json
```

Copia la carpeta a `app/dashboard/` e instala `sebs7n-ui`, `@base-ui/react`, `sonner`, `lucide-react`, `recharts` y `next-themes`. Necesita lo de [Instalación](https://ui.sebastianfermanelli.com/docs/instalacion.md): el `@import` del tema, la fuente, el `ThemeProvider` y el `Toaster` montados en el layout raíz.

## Anatomía

| Archivo | Qué hace |
|---|---|
| `layout.tsx` | `AppShell` + el provider del estado, una vez para las cuatro secciones |
| `page.tsx` | Inicio: métricas, gráfico diferido, vencimientos |
| `invoices/page.tsx` | Facturas: `DataTable`, selección, detalle en `Sheet`, anular con `AlertDialog` |
| `customers/page.tsx` | Clientes: `List` con búsqueda y `EmptyState` |
| `settings/page.tsx` | Configuración: `Tabs`, `Form`, `RadioGroup`, `Switch` |
| `_lib/routes.ts` | las rutas; `GALLERY_PATH` en `null` fuera del sitio |
| `_lib/format.ts` | montos y fechas (las fechas `YYYY-MM-DD` se leen como locales, no UTC) |
| `_state/` | reducer puro + contexto: alta, cobrar, anular, deshacer, carga simulada |
| `_data/` | **lo que se cambia**: el mock y lo que se deriva de él |
| `_components/` | las piezas de cada sección |

## Qué conservar al adaptarlo

- La estructura de cada página: `AppShellContent` → `PageHeader` con **una** acción primaria → bloques.
- Los tamaños por defecto (`md`); `sm` solo en la barra de la tabla.
- Las grillas: métricas 1/2/4 columnas, tablero `2fr/1fr`.
- Los estados: esqueleto del alto final, `EmptyState` con acción, `toast` con «Deshacer» para lo reversible, `AlertDialog` para lo irreversible.
- El gráfico con `lazy` montado después de hidratar.

## Qué cambiar

- `_data/invoices-mock.ts` por tus datos (o por un fetch: el provider ya tiene el estado `loading`).
- Los textos y el nombre de la app en `dashboard-header.tsx`.
- Las secciones del sidebar en `dashboard-sidebar.tsx` y sus rutas en `_lib/routes.ts`.
