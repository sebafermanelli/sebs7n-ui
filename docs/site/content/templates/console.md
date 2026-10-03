# Template: consola PaaS / cloud

> Una consola de infraestructura entera con sebs7n-ui: Servicios con su detalle, Despliegues con pipeline, Logs en vivo, Variables de entorno y Costos, con selector de proyecto, menú de usuario, notificaciones, atajos y ⌘K. Para copiar la estructura y cambiar los datos.

En vivo: [ui.sebastianfermanelli.com/templates/console](https://ui.sebastianfermanelli.com/templates/console). Las reglas que sigue están en la [Guía para agentes](https://ui.sebastianfermanelli.com/docs/guia-agentes.md).

## Usarlo en una app

```bash
npx shadcn@latest add https://ui.sebastianfermanelli.com/r/console.json
```

Copia la carpeta a `app/console/` e instala `sebs7n-ui`, `@base-ui/react`, `sonner`, `lucide-react` y `next-themes`. Necesita lo de [Instalación](https://ui.sebastianfermanelli.com/docs/instalacion.md): el `@import` del tema, la fuente, el `ThemeProvider` y el `Toaster` montados en el layout raíz.

## Anatomía

| Archivo | Qué hace |
|---|---|
| `layout.tsx` | `AppShell` + el proyecto activo + la paleta ⌘K, una vez para las tres secciones |
| `page.tsx` | Servicios: un Resumen editable arriba (`WidgetBoard`: CPU, requests, servicios con errores, costo del mes y despliegues recientes) y la lista con su estado y una curva de CPU |
| `_components/console-widgets.tsx` | los widgets del Resumen (`WidgetDef` con `Sparkline`, `Meter` y listas) y la clave de storage por proyecto |
| `_components/plan-card.tsx` | el bloque de plan de Costos: `PromoCard` + un `Meter` por cupo (cómputo, ancho de banda y almacenamiento) |
| `services/[id]/page.tsx` | detalle de un servicio con `Tabs`: Métricas (curvas y `Meter` por instancia), Eventos (`Timeline`) y Ajustes (instancias y plan) |
| `deployments/page.tsx` | Despliegues: `SplitView` con la lista y el detalle, el `Stepper` del pipeline y Reintentar / Revertir / Cancelar |
| `logs/page.tsx` | Logs en vivo a pantalla completa: búsqueda, servicio, nivel, pausa y descarga |
| `costs/page.tsx` | Estado y costos: la card de plan con sus medidores, consumo del mes, estimado y desglose por servicio |
| `variables/page.tsx` | Variables de entorno por entorno (Producción / Staging): alta, edición, secreto, importar `.env` y eliminar con «Deshacer» |
| `_lib/routes.ts` | las rutas; `GALLERY_PATH` en `null` fuera del sitio |
| `_state/project-context.tsx` | el proyecto activo y sus datos, con las acciones (alta, pausar, eliminar, deshacer) |
| `_state/mutations.ts` | las transformaciones puras del estado, con sus tests |
| `_data/mock.ts` | **lo que se cambia**: proyectos, servicios, despliegues con su log y variables |
| `_components/console-header.tsx` | el selector de proyecto en la barra |
| `_components/services-view.tsx`, `service-menu.tsx`, `new-service-dialog.tsx` | lista o grilla de servicios, menú de fila y selección múltiple, alta de servicio |
| `_components/shortcuts.tsx`, `console-command-dialog.tsx` | adaptadores finos de `ShortcutsDialog`, `useKeySequence` y `CommandPalette` del paquete; la app registra los atajos |
| `resources/page.tsx` | explorador en árbol: proyecto › servicio › instancia (`Tree`) |
| `alerts/page.tsx` | reglas y canales de alerta, y ventanas de mantenimiento (`CalendarView`) |
| `_components/assistant-*.tsx`, `_data/assistant.ts` | el asistente de la consola (`Chat` + `AiButton`) con respuestas simuladas |
| `_components/env-var-dialog.tsx` | alta y edición de una variable |
| `_components/console-command.tsx` | `CommandDialog` con ⌘K: ir a una sección o cambiar de proyecto |
| `_components/deployment-log.tsx`, `log-line-detail.tsx` | el log de un despliegue y el panel de detalle de una línea (`LogViewer` del paquete con `Resizable`) |
| `_data/derive.ts` | series, uso por instancia, eventos, pipeline y la secuencia de logs, todo determinista |

## Qué conservar al adaptarlo

- Dentro de un `AppShell`, el layout responde al ancho del contenido (container queries `@md:`, `@lg:`…), no al de la ventana: así un panel lateral abierto no rompe las grillas. Los breakpoints de viewport quedan para pantallas completas (landing, blog, login, navbar).
- Los filtros sobre una lista, en `sm` y todos del mismo tamaño en la fila (búsqueda, selectores, `ToggleGroup`, botones de la barra); la acción primaria de la página, en `md`.
- El Resumen de Servicios como panel de widgets editable ([receta en la guía](/docs/guia-agentes)): «Editar» / «Listo» secundario junto a «Nuevo servicio» (el único acento), arrastrar o teclado, «−», catálogo, «Restablecer», y el orden guardado **por proyecto** (la clave lleva el id). El módulo de arrastre se pide recién al editar: la consola está justa de presupuesto de JS.
- La card de plan con uso (`PromoCard` + `Meter`) en Estado y costos.
- El proyecto en la barra: todo lo de abajo depende de él, así que va primero.
- El estado de cada despliegue y servicio con `Badge` de color **y** texto, nunca solo el color.
- El log como región con rol `log` y foco por teclado (`tabIndex={0}`) para poder desplazarlo.
- Las curvas en SVG propio: una librería de gráficos pesa más que todo el template.
- El atajo ⌘K lo registra la app en el layout, no el componente.

## Qué cambiar

- `_data/mock.ts` por tus datos (o por un fetch: el contexto es el lugar para el estado de carga).
- El log en vivo de `deployment-log.tsx` (hoy simula la cola de un build) por tu WebSocket o `EventSource`.
- Las secciones del sidebar en `console-sidebar.tsx` y sus rutas en `_lib/routes.ts`.
