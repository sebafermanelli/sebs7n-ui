"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  useChartMotion,
  type ChartConfig,
} from "sebs7n-ui/chart"

const config = { billed: { label: "Facturado" }, collected: { label: "Cobrado" } } satisfies ChartConfig
// Los números de los ejes en `label-secondary` (≥ 4,5:1 en claro y oscuro): el gris por defecto de Recharts se perdía en oscuro.
const AXIS_TICK = { fill: "var(--color-label-secondary)" }
const dollars = (value: number | string) => `US$ ${Number(value).toLocaleString("es-AR")}`

// `default` porque lo importa `lazy()`.
export default function CollectionsChart({ data }: { data: { month: string; billed: number; collected: number }[] }) {
  const motion = useChartMotion()
  return (
    <ChartContainer className="aspect-[2/1] w-full" config={config}>
      <BarChart barGap={2} data={data} margin={{ left: 4, right: 4, top: 8 }} responsive>
        <CartesianGrid vertical={false} />
        <XAxis axisLine={false} dataKey="month" tick={AXIS_TICK} tickLine={false} tickMargin={8} />
        <YAxis axisLine={false} tick={AXIS_TICK} tickFormatter={(value: number) => `${value / 1000}k`} tickLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent formatter={dollars} />} cursor />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="billed" fill="var(--color-billed)" maxBarSize={24} radius={[4, 4, 0, 0]} {...motion} />
        <Bar dataKey="collected" fill="var(--color-collected)" maxBarSize={24} radius={[4, 4, 0, 0]} {...motion} />
      </BarChart>
    </ChartContainer>
  )
}
