"use client"

import {
  BellIcon,
  CalendarIcon,
  EllipsisIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  PlusIcon,
  SearchIcon,
  SquarePenIcon,
  TrendingUpIcon,
  UserPlusIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { Avatar, AvatarFallback } from "sebs7n-ui/avatar"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { CardRow } from "sebs7n-ui/card"
import { Meter } from "sebs7n-ui/meter"
import { Navbar, NavbarContent } from "sebs7n-ui/navbar"
import { SortableGrid } from "sebs7n-ui/sortable-grid"
import { Stat } from "sebs7n-ui/stat"
import { Tooltip, TooltipContent, TooltipTrigger } from "sebs7n-ui/tooltip"
import { WidgetCard } from "sebs7n-ui/widget-card"

import { AppIcon, type Fill } from "./parts"

const FACTURAS = [
  { id: "0012", cliente: "Acme S.A.", fecha: "30/09" },
  { id: "0013", cliente: "Nube Digital", fecha: "28/09" },
  { id: "0014", cliente: "Estudio Ruiz", fecha: "21/09" },
]

const CLIENTES = [
  { nombre: "Taller Sur", detalle: "Alta hoy · Responsable inscripto", saldo: "$ 0" },
  { nombre: "Nube Digital", detalle: "2 facturas abiertas", saldo: "$ 96.000" },
  { nombre: "Acme S.A.", detalle: "Al día", saldo: "$ 128.400" },
]

const VENCIMIENTOS = [
  { dia: "Hoy", titulo: "Factura 0014 · Estudio Ruiz", detalle: "$ 41.200" },
  { dia: "Jue 2", titulo: "Pago a proveedores", detalle: "3 órdenes de pago" },
  { dia: "Lun 6", titulo: "Cierre del mes", detalle: "Conciliar cobranzas" },
]

const RECIENTES: { nombre: string; detalle: string; icono: LucideIcon; fill: Fill }[] = [
  { nombre: "Factura 0013.pdf", detalle: "Hoy 10:24 · 96 KB", icono: FileTextIcon, fill: "red" },
  { nombre: "Cobranzas septiembre.xlsx", detalle: "Ayer · 44 KB", icono: FileSpreadsheetIcon, fill: "green" },
  { nombre: "Logo para facturas.png", detalle: "26/09 · 120 KB", icono: ImageIcon, fill: "blue" },
]

function Accion({ label, icon: Glyph }: { label: string; icon: LucideIcon }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button aria-label={label} size="icon-md" variant="plain" />}>
        <Glyph />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function Mas({ label }: { label: string }) {
  return (
    <Button aria-label={label} size="icon-sm" variant="plain">
      <EllipsisIcon />
    </Button>
  )
}

/**
 * Los widgets, en el orden de arriba. Se reordenan arrastrando (`SortableGrid`, la tarjeta entera) o
 * con el teclado; el orden vive en el estado de la pantalla y se pierde al cambiar de pantalla.
 */
const WIDGETS: { id: string; title: string; wide?: boolean; card: ReactNode }[] = [
  {
    id: "invoices",
    title: "Facturas",
    card: (
      <WidgetCard
        className="h-full"
        action={<Accion icon={SquarePenIcon} label="Nueva factura" />}
        icon={<AppIcon fill="brand" icon={FileTextIcon} />}
        more={<Mas label="Ver todas las facturas" />}
        subtitle="Septiembre · 3 por cobrar"
        title="Facturas"
      >
        {FACTURAS.map((factura) => (
          <CardRow description={`Factura ${factura.id}`} key={factura.id} title={factura.cliente} trailing={factura.fecha} />
        ))}
      </WidgetCard>
    ),
  },
  {
    id: "clients",
    title: "Clientes",
    card: (
      <WidgetCard
        className="h-full"
        action={<Accion icon={UserPlusIcon} label="Nuevo cliente" />}
        icon={<AppIcon fill="green" icon={UsersIcon} />}
        more={<Mas label="Ver todos los clientes" />}
        subtitle="23 activos"
        title="Clientes"
      >
        {CLIENTES.map((cliente) => (
          <CardRow description={cliente.detalle} key={cliente.nombre} title={cliente.nombre} trailing={cliente.saldo} />
        ))}
      </WidgetCard>
    ),
  },
  {
    id: "calendar",
    title: "Calendario",
    card: (
      <WidgetCard
        className="h-full"
        action={<Accion icon={PlusIcon} label="Nuevo recordatorio" />}
        icon={<AppIcon fill="red" icon={CalendarIcon} />}
        more={<Mas label="Abrir el calendario" />}
        subtitle="Próximos vencimientos"
        title="Calendario"
      >
        {VENCIMIENTOS.map((vencimiento) => (
          <CardRow key={vencimiento.titulo}>
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-12 shrink-0 text-footnote font-semibold text-red-ink">{vencimiento.dia}</span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-callout text-label">{vencimiento.titulo}</span>
                <span className="truncate text-footnote text-label-secondary">{vencimiento.detalle}</span>
              </span>
            </div>
          </CardRow>
        ))}
      </WidgetCard>
    ),
  },
  {
    id: "files",
    title: "Archivos",
    card: (
      <WidgetCard
        className="h-full"
        icon={<AppIcon fill="blue" icon={FolderIcon} />}
        more={<Mas label="Ver todos los archivos" />}
        subtitle="Recientes"
        title="Archivos"
      >
        {RECIENTES.map((archivo) => (
          <CardRow key={archivo.nombre}>
            <div className="flex min-w-0 items-center gap-3">
              <AppIcon fill={archivo.fill} icon={archivo.icono} size="sm" />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-callout text-label">{archivo.nombre}</span>
                <span className="truncate text-footnote text-label-secondary">{archivo.detalle}</span>
              </span>
            </div>
          </CardRow>
        ))}
      </WidgetCard>
    ),
  },
  {
    id: "collections",
    title: "Cobranza",
    wide: true,
    card: (
      <WidgetCard
        className="h-full"
        icon={<AppIcon fill="purple" icon={TrendingUpIcon} />}
        more={<Mas label="Ver el informe" />}
        subtitle="Septiembre, al día de hoy"
        title="Cobranza"
      >
        <div className="grid gap-6 @2xl:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Stat delta="+12,4 %" hint="vs. agosto" label="Facturado" trend="up" value="$ 4.820.300" />
            <div className="flex flex-wrap gap-2">
              <Badge color="green" dot>
                18 pagadas
              </Badge>
              <Badge color="brand">3 enviadas</Badge>
              <Badge color="amber" dot>
                1 vencida
              </Badge>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-5">
            <Meter format={{ style: "percent", maximumFractionDigits: 1 }} label="Cobrado" locale="es-AR" max={1} showValue value={0.916} />
            <Meter label="Meta del mes" locale="es-AR" max={100} showValue value={74} />
          </div>
        </div>
      </WidgetCard>
    ),
  },
]

/** La home de iCloud: el wallpaper, la barra translúcida y la grilla de widgets, que se reordena. */
export function HomeShowcase() {
  const [widgets, setWidgets] = useState(WIDGETS)
  return (
    // El wallpaper (`bg-ambient`) es fijo a la ventana: lo mantiene adentro el `[contain:paint]` del marco.
    <div className="@container h-full overflow-y-auto bg-ambient" data-ambient="">
      <Navbar>
        <NavbarContent>
          <span className="flex items-center gap-2 text-headline text-label">
            <AppIcon fill="brand" icon={FileTextIcon} size="sm" />
            Facturación
          </span>
          <div className="flex items-center gap-1">
            <Accion icon={SearchIcon} label="Buscar" />
            <Accion icon={BellIcon} label="Avisos" />
            <Accion icon={PlusIcon} label="Crear" />
            <Avatar className="ms-1" size="sm">
              <AvatarFallback>AP</AvatarFallback>
            </Avatar>
          </div>
        </NavbarContent>
      </Navbar>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 @3xl:px-8">
        <header className="flex items-center gap-4">
          <Avatar size="xl">
            <AvatarFallback>AP</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="text-large-title text-label">Buenas tardes</h3>
            <p className="text-body text-label-secondary">Septiembre · 3 facturas por cobrar y 2 vencimientos esta semana.</p>
          </div>
        </header>

        <SortableGrid
          aria-label="Widgets"
          className="@2xl:grid-cols-2 @5xl:grid-cols-3"
          getKey={(widget) => widget.id}
          getLabel={(widget) => widget.title}
          itemClassName={(widget) => (widget.wide ? "@2xl:col-span-2" : undefined)}
          items={widgets}
          onReorder={setWidgets}
          renderItem={(widget) => widget.card}
        />
      </div>
    </div>
  )
}
