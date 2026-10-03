"use client"

import {
  CalendarIcon,
  EllipsisIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  PlusIcon,
  SquarePenIcon,
  TrendingUpIcon,
  UserPlusIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import type { ReactNode } from "react"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { CardRow } from "sebs7n-ui/card"
import { useWidgetLayout, type WidgetDef } from "sebs7n-ui/lib/widget-layout"
import { Meter } from "sebs7n-ui/meter"
import { MetricChart } from "sebs7n-ui/metric-chart"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Sparkline } from "sebs7n-ui/sparkline"
import { Stat } from "sebs7n-ui/stat"
import { StatGrid } from "sebs7n-ui/stat-grid"
import { Tooltip, TooltipContent, TooltipTrigger } from "sebs7n-ui/tooltip"
import { WidgetBoard, WidgetBoardEditButton } from "sebs7n-ui/widget-board"
import { WidgetCard } from "sebs7n-ui/widget-card"

import { AppIcon, type Fill } from "./parts"

const FACTURAS = [
  { id: "0012", cliente: "Acme S.A.", fecha: "30/09" },
  { id: "0013", cliente: "Nube Digital", fecha: "28/09" },
  { id: "0014", cliente: "Estudio Ruiz", fecha: "21/09" }
]

const CLIENTES = [
  { nombre: "Taller Sur", detalle: "Alta hoy · Responsable inscripto", saldo: "$ 0" },
  { nombre: "Nube Digital", detalle: "2 facturas abiertas", saldo: "$ 96.000" },
  { nombre: "Acme S.A.", detalle: "Al día", saldo: "$ 128.400" }
]

const VENCIMIENTOS = [
  { dia: "Hoy", titulo: "Factura 0014 · Estudio Ruiz", detalle: "$ 41.200" },
  { dia: "Jue 2", titulo: "Pago a proveedores", detalle: "3 órdenes de pago" },
  { dia: "Lun 6", titulo: "Cierre del mes", detalle: "Conciliar cobranzas" }
]

const RECIENTES: { nombre: string; detalle: string; icono: LucideIcon; fill: Fill }[] = [
  { nombre: "Factura 0013.pdf", detalle: "Hoy 10:24 · 96 KB", icono: FileTextIcon, fill: "red" },
  { nombre: "Cobranzas septiembre.xlsx", detalle: "Ayer · 44 KB", icono: FileSpreadsheetIcon, fill: "green" },
  { nombre: "Logo para facturas.png", detalle: "26/09 · 120 KB", icono: ImageIcon, fill: "blue" }
]

/** Facturado y cobrado de los últimos seis meses: la serie del gráfico de la primera métrica y de los sparklines. */
const SERIE = [
  { label: "Abr", value: 3.1 },
  { label: "May", value: 3.6 },
  { label: "Jun", value: 3.4 },
  { label: "Jul", value: 4.1 },
  { label: "Ago", value: 4.3 },
  { label: "Sep", value: 4.8 }
]

const METRICAS = [
  {
    label: "Facturado",
    value: "$ 4,8 M",
    delta: "+12,4 %",
    trend: "up" as const,
    hint: "vs. agosto",
    chart: <MetricChart aria-label="Facturado en los últimos seis meses, en millones de pesos" data={SERIE} format={{ maximumFractionDigits: 1 }} height={120} name="Facturado" />
  },
  { label: "Cobrado", value: "91,6 %", delta: "+3,1 pts", trend: "up" as const, hint: "Meta 95 %", chart: <Sparkline values={[8, 20, 31, 52, 70, 91.6]} /> },
  { label: "Vencidas", value: "1", delta: "+1", trend: "down" as const, hint: "facturas", chart: <Sparkline className="text-red-900" values={[0, 0, 1, 0, 0, 1]} /> }
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

const Fila = ({ children }: { children: ReactNode }) => <CardRow>{children}</CardRow>

/**
 * Los widgets del Inicio: el catálogo del `WidgetBoard`. Cada uno es un `WidgetDef` (id estable, título,
 * tamaño, ícono y vista previa para el «+»). El orden y los visibles los guarda `useWidgetLayout` en este
 * navegador; el arrastre, el «−» y el catálogo se piden recién al apretar «Editar».
 */
const WIDGETS: WidgetDef[] = [
  {
    id: "invoices",
    size: "md",
    title: "Facturas",
    description: "Las últimas facturas emitidas.",
    icon: <FileTextIcon />,
    preview: <Sparkline values={[3, 5, 4, 6, 5, 8]} />,
    render: () => (
      <WidgetCard
        action={<Accion icon={SquarePenIcon} label="Nueva factura" />}
        className="h-full"
        icon={<AppIcon fill="brand" icon={FileTextIcon} />}
        more={<Mas label="Ver todas las facturas" />}
        subtitle="Septiembre · 3 por cobrar"
        title="Facturas"
      >
        {FACTURAS.map((factura) => (
          <CardRow description={`Factura ${factura.id}`} key={factura.id} title={factura.cliente} trailing={factura.fecha} />
        ))}
      </WidgetCard>
    )
  },
  {
    id: "clients",
    size: "md",
    title: "Clientes",
    description: "Altas y saldos de los clientes.",
    icon: <UsersIcon />,
    preview: <span className="truncate text-footnote text-label">23 activos</span>,
    render: () => (
      <WidgetCard
        action={<Accion icon={UserPlusIcon} label="Nuevo cliente" />}
        className="h-full"
        icon={<AppIcon fill="green" icon={UsersIcon} />}
        more={<Mas label="Ver todos los clientes" />}
        subtitle="23 activos"
        title="Clientes"
      >
        {CLIENTES.map((cliente) => (
          <CardRow description={cliente.detalle} key={cliente.nombre} title={cliente.nombre} trailing={cliente.saldo} />
        ))}
      </WidgetCard>
    )
  },
  {
    id: "calendar",
    size: "md",
    title: "Calendario",
    description: "Los próximos vencimientos.",
    icon: <CalendarIcon />,
    preview: <span className="truncate text-footnote text-label">Hoy · Factura 0014</span>,
    render: () => (
      <WidgetCard
        action={<Accion icon={PlusIcon} label="Nuevo recordatorio" />}
        className="h-full"
        icon={<AppIcon fill="red" icon={CalendarIcon} />}
        more={<Mas label="Abrir el calendario" />}
        subtitle="Próximos vencimientos"
        title="Calendario"
      >
        {VENCIMIENTOS.map((vencimiento) => (
          <Fila key={vencimiento.titulo}>
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-12 shrink-0 text-footnote font-semibold text-red-ink">{vencimiento.dia}</span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-callout text-label">{vencimiento.titulo}</span>
                <span className="truncate text-footnote text-label-secondary">{vencimiento.detalle}</span>
              </span>
            </div>
          </Fila>
        ))}
      </WidgetCard>
    )
  },
  {
    id: "files",
    size: "md",
    title: "Archivos",
    description: "Lo último que se subió.",
    icon: <FolderIcon />,
    preview: <span className="truncate text-footnote text-label">Factura 0013.pdf</span>,
    render: () => (
      <WidgetCard
        className="h-full"
        icon={<AppIcon fill="blue" icon={FolderIcon} />}
        more={<Mas label="Ver todos los archivos" />}
        subtitle="Recientes"
        title="Archivos"
      >
        {RECIENTES.map((archivo) => (
          <Fila key={archivo.nombre}>
            <div className="flex min-w-0 items-center gap-3">
              <AppIcon fill={archivo.fill} icon={archivo.icono} size="sm" />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-callout text-label">{archivo.nombre}</span>
                <span className="truncate text-footnote text-label-secondary">{archivo.detalle}</span>
              </span>
            </div>
          </Fila>
        ))}
      </WidgetCard>
    )
  },
  {
    id: "collections",
    title: "Cobranza",
    size: "lg",
    description: "Lo cobrado contra la meta del mes.",
    icon: <TrendingUpIcon />,
    preview: <Meter aria-label="Cobrado" max={1} size="sm" value={0.916} />,
    render: () => (
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
    )
  }
]

/**
 * El Inicio de una app: métricas (`StatGrid` con `MetricChart` y `Sparkline`) y un panel de widgets que se
 * edita (`WidgetBoard`). «Editar» es secundario y «Nueva factura» el único botón primario. Todo mide el ancho
 * del contenido (container queries), así que con el panel del asistente abierto se acomoda solo.
 */
export function HomeShowcase() {
  const layout = useWidgetLayout({ storageKey: "sebs7n-docs:showcase:home", widgets: WIDGETS })
  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Inicio</PageHeaderTitle>
        <PageHeaderDescription>Septiembre · 3 facturas por cobrar y 2 vencimientos esta semana.</PageHeaderDescription>
        <PageHeaderActions>
          <WidgetBoardEditButton layout={layout} />
          <Button>
            <PlusIcon />
            Nueva factura
          </Button>
        </PageHeaderActions>
      </PageHeader>
      <StatGrid items={METRICAS} />
      <WidgetBoard layout={layout} />
    </AppShellContent>
  )
}
