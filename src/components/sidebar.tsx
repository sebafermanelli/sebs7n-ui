"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { ChevronRightIcon, PlusIcon, SearchIcon } from "lucide-react"

import { useLabels } from "../lib/labels.js"
import { cn, type WithClassName } from "../lib/utils.js"
import { AppShellContext, SidebarContext, SidebarInSheetContext, useSidebarContext } from "../internal/shell-context.js"
import { TooltipLateral } from "../internal/tooltip-lateral.js"
import { sidebarItemVariants } from "../variants/sidebar.js"
import { Kbd } from "./kbd.js"

type SidebarProps = React.ComponentProps<"aside"> & {
  /**
   * Solo íconos (64px). Sin esta prop, dentro de un `AppShell` manda el estado del shell (`sidebarCollapsed`, que
   * el usuario cambia arrastrando el borde); fuera de un shell, desplegado.
   */
  collapsed?: boolean
  /**
   * @deprecated Desde 2.0 el Sidebar es siempre la lista de fuentes de iCloud, a ras de la ventana.
   * `"bar"` se acepta y no hace nada; el panel flotante (`"floating"`) se fue. Se borra en 3.0.
   */
  variant?: "bar"
}

// La columna de la lista de fuentes de iCloud (catálogo §2.3): pegada arriba, a la izquierda y abajo
// —sin margen, radio ni sombra—, en `surface-secondary` y con el borde entre paneles
// (`separator-strong`) a la derecha. Adentro del Sheet mobile va transparente y sin borde: el fondo
// ya lo pone la hoja.
function Sidebar({ className, collapsed: collapsedProp, variant: _variant, ...props }: SidebarProps) {
  const inSheet = React.useContext(SidebarInSheetContext)
  const shell = React.useContext(AppShellContext)
  const collapsed = inSheet ? false : (collapsedProp ?? shell?.sidebarCollapsed ?? false)
  const value = React.useMemo(() => ({ collapsed }), [collapsed])
  return (
    <SidebarContext.Provider value={value}>
      <aside
        data-slot="sidebar"
        data-collapsed={collapsed ? "" : undefined}
        className={cn(
          "group/sidebar relative flex h-full w-(--sidebar-width,15rem) shrink-0 flex-col overflow-x-clip border-r border-separator-strong bg-surface-secondary text-label data-collapsed:w-16",
          // El ancho lo pone el AppShell (`--sidebar-width`) y cambia con transición (`transition-panel`, quieta mientras se arrastra).
          "in-data-animate:transition-panel",
          // Sobre el wallpaper (W) la columna es el cuerpo translúcido de los widgets: el sidebar es
          // texto denso, y el cuerpo es el material que más contraste deja. Sin transparencia vuelve
          // a su gris de columna y no al blanco de la card.
          "in-data-ambient:material-translucent-body",
          "[--translucent-body-fallback:var(--color-surface-secondary)]",
          // Adentro del Sheet del teléfono el fondo es el del Sheet (opaco), haya wallpaper o no.
          inSheet && "w-full border-0 bg-transparent in-data-ambient:bg-transparent",
          className
        )}
        {...props}
      />
    </SidebarContext.Provider>
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex shrink-0 flex-col gap-2 px-2.5 pt-3 pb-2 group-data-collapsed/sidebar:items-center", className)}
      {...props}
    />
  )
}

type SidebarContentProps = React.ComponentProps<"nav">

// La zona que scrollea. Es un <nav>: nombralo con aria-label si hay más de uno en la página.
function SidebarContent({ className, "aria-label": ariaLabel, ...props }: SidebarContentProps) {
  const l = useLabels().sidebar
  return (
    <nav
      data-slot="sidebar-content"
      aria-label={ariaLabel ?? l.nav}
      className={cn(
        // 10 px a cada lado del ítem, el inset de iCloud; 20 entre secciones.
        "flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain scroll-fade px-2.5 py-2 group-data-collapsed/sidebar:items-center",
        className
      )}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("flex shrink-0 flex-col gap-1 border-t border-separator px-2.5 py-2 group-data-collapsed/sidebar:items-center", className)}
      {...props}
    />
  )
}

// El id del label se decide en el render (useId + los hijos directos), igual en server y cliente:
// sin SidebarGroupLabel no hay aria-labelledby apuntando a la nada, y no hay efecto que lo agregue
// después de hidratar. Un label anidado en otro elemento no se detecta: pasá aria-labelledby a mano.
type SidebarGroupState = {
  id: string
  collapsible: boolean
  open: boolean
  panelId: string
  toggle: () => void
  /** El botón del título, para devolverle el foco si la sección se cierra con el foco adentro. */
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const SidebarGroupContext = React.createContext<SidebarGroupState | null>(null)

function flatChildren(children: React.ReactNode): React.ReactNode[] {
  return React.Children.toArray(children).flatMap((child) =>
    React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment ? flatChildren(child.props.children) : [child]
  )
}

// El genérico de `isValidElement` hace de type guard: describe la prop que este recorrido mira.
const isLabel = (child: React.ReactNode): child is React.ReactElement<{ id?: string }> =>
  React.isValidElement<{ id?: string }>(child) && child.type === SidebarGroupLabel
const isAction = (child: React.ReactNode) => React.isValidElement(child) && child.type === SidebarGroupAction

type SidebarGroupProps = React.ComponentProps<"div"> & {
  /**
   * La sección se abre y se cierra desde su título, como las de iCloud (Photos, Drive): el
   * `SidebarGroupLabel` pasa a ser un botón con un chevron que gira. Colapsado, el sidebar muestra
   * los íconos igual —no hay título para volver a abrirla—.
   */
  collapsible?: boolean
  /** Abierta al montar (no controlado). Por defecto, abierta. */
  defaultOpen?: boolean
  /** Controlado: si la sección está abierta. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Con título colapsable o con acciones («+»), el título y las acciones van en una fila arriba y los
// ítems en un panel abajo; si no, los hijos quedan en el orden en que llegaron, como en 1.x.
function SidebarGroup({ className, children, collapsible = false, defaultOpen = true, open: openProp, onOpenChange, ...props }: SidebarGroupProps) {
  const generatedId = React.useId()
  const panelId = `${generatedId}-panel`
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState
  const collapsed = useSidebarContext()?.collapsed ?? false
  const panelRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  // Si se cierra con el foco adentro (la cierra la app, o un atajo), el foco quedaría en un ítem
  // escondido y el navegador lo mandaría al <body>. Va al título. En el layout effect, antes de que
  // el navegador saque el foco del panel escondido.
  React.useLayoutEffect(() => {
    if (!open && panelRef.current?.contains(document.activeElement)) triggerRef.current?.focus()
  }, [open])

  const all = flatChildren(children)
  const label = all.find(isLabel)
  const labelId = label ? (label.props.id ?? generatedId) : undefined
  const actions = all.filter(isAction)
  const partir = collapsible || actions.length > 0

  const toggle = React.useCallback(() => {
    const next = !open
    if (openProp === undefined) setOpenState(next)
    onOpenChange?.(next)
  }, [open, openProp, onOpenChange])
  const value = React.useMemo(
    () => ({ id: generatedId, collapsible, open, panelId, toggle, triggerRef }),
    [generatedId, collapsible, open, panelId, toggle]
  )

  return (
    <SidebarGroupContext.Provider value={value}>
      <div
        data-slot="sidebar-group"
        data-open={collapsible ? String(open) : undefined}
        role="group"
        aria-labelledby={labelId}
        className={cn("flex w-full flex-col gap-0.5 group-data-collapsed/sidebar:items-center", className)}
        {...props}
      >
        {partir ? (
          <>
            <div data-slot="sidebar-group-header" className="flex items-center gap-1 group-data-collapsed/sidebar:hidden [&>[data-slot=sidebar-group-label]]:flex-1">
              {label}
              {actions}
            </div>
            <div
              ref={panelRef}
              id={panelId}
              data-slot="sidebar-group-panel"
              hidden={collapsible && !open && !collapsed}
              className="flex w-full flex-col gap-0.5 group-data-collapsed/sidebar:items-center"
            >
              {all.filter((child) => child !== label && !actions.includes(child))}
            </div>
          </>
        ) : (
          children
        )}
      </div>
    </SidebarGroupContext.Provider>
  )
}

// El título de sección de iCloud: 14/600 secundario, sin uppercase, a 16 px del borde (10 del
// contenido + 6). Colapsado se oculta pero sigue nombrando al grupo. En una sección `collapsible` es
// un botón con chevron (› cerrada, ⌄ abierta) que gira sin recorrido con movimiento reducido.
function SidebarGroupLabel({ className, id, children, ...props }: React.ComponentProps<"div">) {
  const group = React.useContext(SidebarGroupContext)
  return (
    <div
      data-slot="sidebar-group-label"
      id={id ?? group?.id ?? undefined}
      className={cn(
        "flex h-7 min-w-0 shrink-0 items-center px-1.5 text-callout font-semibold text-label-secondary group-data-collapsed/sidebar:hidden",
        group?.collapsible && "px-0",
        className
      )}
      {...props}
    >
      {group?.collapsible ? (
        <button
          ref={group.triggerRef}
          type="button"
          aria-expanded={group.open}
          aria-controls={group.panelId}
          onClick={group.toggle}
          className="group/sidebar-section flex h-full min-w-0 flex-1 cursor-pointer items-center gap-1 rounded-control px-1.5 text-left outline-none transition-control hover:text-label focus-visible:focus-ring"
        >
          <span className="truncate">{children}</span>
          <ChevronRightIcon
            aria-hidden="true"
            className="size-3 shrink-0 transition-transform duration-150 ease-out-expo motion-reduce:transition-none group-aria-expanded/sidebar-section:rotate-90"
          />
        </button>
      ) : (
        children
      )}
    </div>
  )
}

type SidebarGroupActionProps = React.ComponentProps<"button"> & {
  /** Nombre del botón («Nueva carpeta»). Obligatorio: el «+» solo no dice qué crea. */
  "aria-label": string
}

// El «+» de una sección de iCloud («Folders +»): un círculo gris con la cruz, a la derecha del título.
// Queda fuera del panel, así que se puede crear aunque la sección esté cerrada. Con hijos, dibuja
// esos hijos en vez de la cruz. Colapsado se oculta con el título.
function SidebarGroupAction({ className, children, ...props }: SidebarGroupActionProps) {
  return (
    <button
      type="button"
      data-slot="sidebar-group-action"
      className={cn(
        "relative flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-control text-label-secondary outline-none transition-control touch-target hover:bg-fill-1 hover:text-label focus-visible:focus-ring group-data-collapsed/sidebar:hidden [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children ?? (
        <span aria-hidden="true" className="flex size-[18px] items-center justify-center rounded-full bg-label-tertiary text-surface-secondary">
          <PlusIcon className="size-3" strokeWidth={3} />
        </span>
      )}
    </button>
  )
}

type SidebarItemBadgeProps = React.ComponentProps<"span"> & {
  /** Texto para el lector de pantalla con contexto ("3 pendientes"). Por defecto, el número visible. */
  label?: string
}

// Contador a la derecha del ítem. Para el lector va separado del label ("Clientes, 3").
// Colapsado se oculta y SidebarItem muestra un punto si el valor no es cero.
function SidebarItemBadge({ className, label, children, ...props }: SidebarItemBadgeProps) {
  return (
    <span
      data-slot="sidebar-item-badge"
      className={cn("ml-auto shrink-0 text-callout text-label-secondary tabular-nums group-data-collapsed/sidebar:sr-only", className)}
      {...props}
    >
      {/* La coma es solo para el lector; el espacio queda al inicio de línea y CSS lo colapsa. */}
      <span className="sr-only">,</span>{" "}
      {label ? (
        <>
          <span aria-hidden="true">{children}</span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        children
      )}
    </span>
  )
}

function isNonZero(badge: React.ReactNode) {
  if (!React.isValidElement<{ children?: React.ReactNode }>(badge)) return false
  const value = badge.props.children
  return value != null && value !== false && value !== "" && value !== 0 && value !== "0"
}

function textOf(nodes: React.ReactNode[]): string | undefined {
  const parts = nodes.filter((n) => typeof n === "string" || typeof n === "number")
  return parts.length === nodes.length && parts.length > 0 ? parts.join("").trim() : undefined
}

type SidebarItemProps = WithClassName<useRender.ComponentProps<"a">> & {
  icon?: React.ReactNode
  /** Marca la sección actual: pone aria-current="page" y data-active. */
  active?: boolean
  /** Texto del tooltip cuando el sidebar está colapsado. Por defecto, el label si es texto. */
  tooltip?: React.ReactNode
}

// Link de navegación. Por defecto <a>; con Next: render={<Link href="/viajes" />}.
// Hijos: el label y, opcionalmente, un <SidebarItemBadge>. Dentro del Sheet mobile de AppShell,
// el click cierra el Sheet.
function SidebarItem({ className, icon, active = false, tooltip, render, children, ...props }: SidebarItemProps) {
  const sidebar = useSidebarContext()
  const shell = React.useContext(AppShellContext)
  const collapsed = sidebar?.collapsed ?? false

  // Children.toArray no abre fragments: <>{label}{badge}</> tiene que separar el badge igual.
  const all = flatChildren(children)
  const badges = all.filter((c) => React.isValidElement(c) && c.type === SidebarItemBadge)
  const label = all.filter((c) => !badges.includes(c))

  const element = useRender({
    defaultTagName: "a",
    render,
    props: mergeProps<"a">(
      {
        className: cn(sidebarItemVariants(), className),
        "aria-current": active ? "page" : undefined,
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
          // ⌘/Ctrl/Shift/Alt o click del medio abren en otra pestaña: el Sheet se queda abierto.
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
          shell?.closeMobile({ focusMain: true })
        },
        children: (
          <>
            {icon}
            <span data-slot="sidebar-item-label" className="min-w-0 flex-1 truncate group-data-collapsed/sidebar:sr-only">
              {label}
            </span>
            {badges}
            {badges.some(isNonZero) && (
              <span
                data-slot="sidebar-item-dot"
                aria-hidden="true"
                className="absolute top-1 right-1 hidden size-1.5 rounded-full bg-label-secondary group-data-collapsed/sidebar:block"
              />
            )}
          </>
        ),
      },
      props
    ),
    // `state` es lo que Base UI convierte en `data-*`: de acá salen `data-slot="sidebar-item"`
    // y, cuando `active` es true, `data-active`. Antes el `data-active` se agregaba además a
    // mano en un tercer argumento de `mergeProps`, con un cast: era el mismo atributo dos veces.
    state: { slot: "sidebar-item", active },
  })

  const tip = tooltip ?? textOf(label)
  return (
    <TooltipLateral activo={collapsed && tip != null} tip={tip}>
      {element}
    </TooltipLateral>
  )
}

type SidebarSearchProps = Omit<React.ComponentProps<"button">, "children"> & {
  /** Texto del botón (y su nombre accesible). */
  placeholder?: string
  /**
   * Atajo que se muestra a la derecha ("⌘K"). El atajo lo registra la app; sin shortcut no se anuncia
   * ninguno. Para "⌘K" y "Ctrl K" aria-keyshortcuts se deduce; para otros pasalo explícito.
   */
  shortcut?: React.ReactNode
}

const KEYSHORTCUTS: Record<string, string | undefined> = { "⌘K": "Meta+K", "Ctrl K": "Control+K", "Ctrl+K": "Control+K" }

// Botón con aspecto de Input que abre la paleta de comandos (la pone la app).
function SidebarSearch({
  className,
  placeholder,
  shortcut,
  "aria-keyshortcuts": keyshortcuts = KEYSHORTCUTS[String(shortcut)],
  ...props
}: SidebarSearchProps) {
  const collapsed = useSidebarContext()?.collapsed ?? false
  // `useLabels()` va suelto y no adentro de un `??`: el `??` corta, y un hook que a veces se llama
  // y a veces no rompe el orden de los hooks.
  const l = useLabels().sidebar
  const texto = placeholder ?? l.search
  const button = (
    <button
      type="button"
      data-slot="sidebar-search"
      aria-keyshortcuts={keyshortcuts}
      className={cn(
        // El search field de iCloud (catálogo §2.13): 32 px, radio 10, `fill-1`, la lupa a 10 del
        // borde y el texto en 14. Con el foco pierde el relleno y queda el anillo interior. Con el Kbd
        // `sm` de 18 quedan 7 px de aire arriba y abajo. El texto va en secundario y no en terciario:
        // es el nombre del botón, y el terciario no llega a 4,5:1.
        "flex h-8 pointer-coarse:h-11 w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-field bg-fill-1 px-2.5 text-left text-callout text-label-secondary outline-none transition-control hover:text-label focus-visible:bg-transparent focus-visible:focus-ring [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        // Colapsado es un ícono más de la columna: el cuadrado de 32 de los ítems, no un campo.
        "group-data-collapsed/sidebar:h-8 group-data-collapsed/sidebar:w-8 pointer-coarse:group-data-collapsed/sidebar:h-11 pointer-coarse:group-data-collapsed/sidebar:w-11 group-data-collapsed/sidebar:justify-center group-data-collapsed/sidebar:px-0",
        className
      )}
      {...props}
    >
      <SearchIcon aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate group-data-collapsed/sidebar:sr-only">{texto}</span>
      {shortcut != null && (
        <Kbd aria-hidden="true" className="group-data-collapsed/sidebar:hidden" size="sm">
          {shortcut}
        </Kbd>
      )}
    </button>
  )
  return (
    <TooltipLateral activo={collapsed} tip={placeholder}>
      {button}
    </TooltipLateral>
  )
}

/** Estado del Sidebar más cercano (collapsed), o null fuera de un Sidebar. */
function useSidebar() {
  return useSidebarContext()
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarItemBadge,
  SidebarSearch,
  useSidebar,
  type SidebarContentProps,
  type SidebarGroupActionProps,
  type SidebarGroupProps,
  type SidebarItemBadgeProps,
  type SidebarItemProps,
  type SidebarProps,
  type SidebarSearchProps,
}
