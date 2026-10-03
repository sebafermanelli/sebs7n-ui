"use client"

import { Meter } from "sebs7n-ui/meter"
import { Sparkline } from "sebs7n-ui/sparkline"
import { Stat } from "sebs7n-ui/stat"
import { useWidgetLayout, type WidgetDef } from "sebs7n-ui/lib/widget-layout"
import { WidgetBoard, WidgetBoardEditButton } from "sebs7n-ui/widget-board"
import { WidgetCard } from "sebs7n-ui/widget-card"

const SERIES = [12, 18, 14, 22, 19, 27, 31]

const WIDGETS: WidgetDef[] = [
  {
    id: "billed",
    title: "Facturado",
    description: "Lo emitido en el mes.",
    preview: <Sparkline values={SERIES} />,
    render: () => (
      <WidgetCard title="Facturado">
        <Stat delta="+12,4 %" hint="vs. el mes anterior" label="Septiembre" trend="up" value="$ 4.820.300" />
      </WidgetCard>
    )
  },
  {
    id: "collected",
    title: "Cobrado",
    description: "Cuánto de lo emitido ya entró.",
    preview: <span className="text-callout text-label-secondary">91,6 % cobrado</span>,
    render: () => (
      <WidgetCard title="Cobrado">
        <Meter format={{ style: "percent", maximumFractionDigits: 1 }} label="Del mes" locale="es-AR" max={1} showValue value={0.916} />
      </WidgetCard>
    )
  },
  {
    id: "trend",
    title: "Tendencia",
    size: "md",
    description: "Los últimos siete meses.",
    preview: <Sparkline values={SERIES} />,
    render: () => (
      <WidgetCard subtitle="Últimos siete meses" title="Tendencia">
        <Sparkline className="h-16" values={SERIES} />
      </WidgetCard>
    )
  }
]

/**
 * Panel editable
 * «Editar» pone los widgets en modo edición: tiemblan, se reordenan arrastrando o con Espacio y las flechas, se sacan con su «−» y vuelven desde «Agregar widget». «Restablecer» deja el panel original. El orden se guarda en este navegador.
 */
export function Editable() {
  const layout = useWidgetLayout({ storageKey: "demo:widget-board", widgets: WIDGETS })
  return (
    <div className="@container flex w-full flex-col gap-4">
      <div className="flex justify-end">
        <WidgetBoardEditButton layout={layout} size="sm" />
      </div>
      <WidgetBoard layout={layout} />
    </div>
  )
}
