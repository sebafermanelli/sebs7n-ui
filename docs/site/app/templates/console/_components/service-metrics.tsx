"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "sebs7n-ui/button"
import {
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "sebs7n-ui/dropdown-menu"
import { MetricChart } from "sebs7n-ui/metric-chart"
import { Skeleton } from "sebs7n-ui/skeleton"
import { StatGrid, type StatGridItem } from "sebs7n-ui/stat-grid"

import { halfChange, METRIC_RANGES, rangeSeriesFor, type Metric, type MetricRange } from "../_data/derive"
import type { Service } from "../_data/mock"
import { LOGS_PATH } from "../_lib/routes"

const METRICS: { metric: Metric; label: string; suffix: string; goodWhenUp: boolean }[] = [
  { metric: "cpu", label: "CPU", suffix: " %", goodWhenUp: false },
  { metric: "memory", label: "Memoria", suffix: " %", goodWhenUp: false },
  { metric: "requests", label: "Requests por minuto", suffix: "", goodWhenUp: true },
]

// Un porcentaje o una cantidad, para el tooltip y el eje: con «%» en los dos primeros.
const percent = (value: number) => `${Math.round(value)} %`

/**
 * Las métricas de un servicio al estilo de una consola de analítica: rótulo, cifra con variación, menú «…»
 * (Ver logs, Actualizar, Período, Quitar de la vista) y un gráfico con eje y tooltip que llena la card. Las series
 * salen de `rangeSeriesFor`, deterministas: no hay reloj ni azar en el render.
 */
export function ServiceMetrics({ service }: { service: Service }) {
  const router = useRouter()
  const stopped = service.status === "stopped"
  const [ranges, setRanges] = useState<Record<Metric, MetricRange>>({ cpu: "1h", memory: "1h", requests: "1h" })
  const [hidden, setHidden] = useState<Metric[]>([])
  const [refreshing, setRefreshing] = useState<Metric[]>([])
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  const items: StatGridItem[] = METRICS.filter((item) => !hidden.includes(item.metric)).map(({ metric, label, suffix, goodWhenUp }) => {
    const range = METRIC_RANGES.find((item) => item.id === ranges[metric])!
    const data = rangeSeriesFor(service, metric, range.id)
    const change = halfChange(data.map((point) => point.value))
    const rounded = change == null ? null : Math.round(Math.abs(change) * 10) / 10
    const up = (change ?? 0) > 0
    const current = metric === "requests" ? String(service.instances * 140) : `${metric === "cpu" ? service.cpu : service.memory} %`
    const busy = refreshing.includes(metric)
    return {
      id: metric,
      label,
      value: stopped ? "—" : current,
      ...(stopped || rounded == null
        ? {}
        : rounded === 0
          ? { delta: "= 0 %", trend: "neutral" as const }
          : { delta: `${up ? "↗" : "↘"} ${rounded.toLocaleString("es-AR")} %`, trend: up === goodWhenUp ? ("up" as const) : ("down" as const) }),
      hint: busy ? "Actualizando…" : stopped ? "Servicio detenido" : range.long,
      chart: stopped ? undefined : busy ? (
        <Skeleton className="min-h-32 w-full flex-1" />
      ) : (
        <MetricChart
          aria-label={`${label}, ${range.long.toLocaleLowerCase("es")}`}
          data={data}
          format={metric === "requests" ? { maximumFractionDigits: 0 } : percent}
          axisFormat={metric === "requests" ? undefined : (value) => `${value}${suffix.trim()}`}
          name={label}
        />
      ),
      actions: (
        <>
          <DropdownMenuItem onClick={() => router.push(`${LOGS_PATH}?service=${service.name}`)}>Ver logs</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setRefreshing((now) => [...now, metric])
              timers.current.push(window.setTimeout(() => setRefreshing((now) => now.filter((item) => item !== metric)), 700))
            }}
          >
            Actualizar
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Período</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup onValueChange={(value) => setRanges((now) => ({ ...now, [metric]: value as MetricRange }))} value={ranges[metric]}>
                {METRIC_RANGES.map((item) => (
                  <DropdownMenuRadioItem key={item.id} value={item.id}>
                    {item.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setHidden((now) => [...now, metric])
              toast.info(`${label} salió de la vista.`, { action: { label: "Deshacer", onClick: () => setHidden((now) => now.filter((item) => item !== metric)) } })
            }}
          >
            Quitar de la vista
          </DropdownMenuItem>
        </>
      ),
    }
  })

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-surface bg-fill-1 p-4 text-callout text-label-secondary">
        <span>Quitaste todas las métricas de esta vista.</span>
        <Button onClick={() => setHidden([])} size="sm" variant="secondary">
          Mostrar de nuevo
        </Button>
      </div>
    )
  }
  return <StatGrid columns={items.length === 3 ? 3 : items.length === 2 ? 2 : 1} items={items} />
}
