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
| `page.tsx` | Inicio: panel de widgets editable (`WidgetBoard`): las cuatro métricas, el gráfico diferido, vencimientos y el resumen de cobranza; «Editar» en la cabecera |
| `_components/dashboard-widgets.tsx` | los widgets de Inicio (`WidgetDef`: `id`, `size`, `render`, vista previa del catálogo) y la clave donde se guarda el panel |
| `_components/collections-summary-widget.tsx` | el widget de cobranza: `Meter` del cobrado y `StackedMeter` por estado |
| `_components/plan-card.tsx` | el bloque de plan de Facturación: `PromoCard` + un `Meter` por cupo (facturas, usuarios y espacio) |
| `invoices/page.tsx` | Facturas: `DataTable`, selección, detalle en `Sheet`, anular con `AlertDialog` |
| `customers/page.tsx` | Clientes: `List` con búsqueda y `EmptyState` |
| `customers/[id]/page.tsx` | Detalle de cliente: saldo, contacto y sus facturas |
| `settings/page.tsx` | Configuración: `Tabs`, `Form`, la card de plan con sus medidores, `RadioGroup`, `Switch` y Equipo (miembros, roles, invitar y quitar con «Deshacer») |
| `_lib/routes.ts` | las rutas; `GALLERY_PATH` en `null` fuera del sitio |
| `_lib/format.ts` | montos y fechas (las fechas `YYYY-MM-DD` se leen como locales, no UTC) |
| `_state/` | reducer puro + contexto: alta, cobrar, anular, deshacer, carga simulada |
| `_components/dashboard-command.tsx`, `dashboard-header.tsx` | la barra y la paleta ⌘K: usan `CommandPalette`, `NotificationsPopover` y `ShortcutsDialog` del paquete; la app solo les pasa los datos y registra los atajos (`_lib/shortcuts.ts`) |
| `login/page.tsx` | pantalla de acceso fuera del `AppShell`: `AuthLayout`, `PasswordInput` y segundo factor con `OtpField` |
| `_components/invoices-board.tsx`, `invoices-calendar.tsx` | las otras vistas de Facturas: tablero de cobranza (arrastrar entre columnas, con «Mover a» para teclado) y calendario de vencimientos |
| `_components/settings-*.tsx` | las pestañas de Configuración con borrador, «Cambios sin guardar» y `Descartar` |
| `_components/new-invoice-form.tsx`, `new-customer-form.tsx` | altas con `Combobox`, `InputGroup`, `DateTimePicker`, `CountryPicker` y `PhoneInput` |
| `_lib/csv.ts` | exportar lo filtrado o seleccionado a CSV |
| `_data/` | **lo que se cambia**: el mock y lo que se deriva de él |
| `_components/` | las piezas de cada sección |

## Qué conservar al adaptarlo

- Dentro de un `AppShell`, el layout responde al ancho del contenido (container queries `@md:`, `@lg:`…), no al de la ventana: así un panel lateral abierto no rompe las grillas. Los breakpoints de viewport quedan para pantallas completas (landing, blog, login, navbar).
- Los filtros sobre una lista, en `sm` y todos del mismo tamaño en la fila (búsqueda, selectores, `ToggleGroup`, botones de la barra); la acción primaria de la página, en `md`.
- La estructura de cada página: `AppShellContent` → `PageHeader` con **una** acción primaria → bloques.
- Los tamaños por defecto (`md`); `sm` solo en la barra de la tabla.
- Las grillas: métricas 1/2/4 columnas por container query; en Inicio las pone `WidgetBoard` (`sm` 1 columna de 4, `md` 2, `lg` 4).
- El panel de widgets editable de Inicio ([receta en la guía](/docs/guia-agentes)): «Editar» / «Listo» secundario junto a la acción primaria, arrastrar o teclado, «−», catálogo con «Agregar widget», «Restablecer», orden guardado con `useWidgetLayout`, y el módulo de arrastre diferido (la grilla normal no trae `@dnd-kit`). El estado de las métricas (período, «Actualizar») vive en la pantalla, no en la card.
- La card de plan con uso (`PromoCard` + `Meter`) en Facturación; las cifras salen de lo que hay (`planOverview`).
- Los estados: esqueleto del alto final, `EmptyState` con acción, `toast` con «Deshacer» para lo reversible, `AlertDialog` para lo irreversible.
- El gráfico con `lazy` montado después de hidratar.

## Qué cambiar

- `_data/invoices-mock.ts` por tus datos (o por un fetch: el provider ya tiene el estado `loading`).
- Los textos y el nombre de la app en `dashboard-header.tsx`.
- Las secciones del sidebar en `dashboard-sidebar.tsx` y sus rutas en `_lib/routes.ts`.
