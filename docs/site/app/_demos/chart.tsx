"use client"

import { useState } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Label, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "sebs7n-ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  useChartMotion,
  type ChartConfig,
} from "sebs7n-ui/chart"
import { Stat } from "sebs7n-ui/stat"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "sebs7n-ui/table"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
const pesos = (value: number | string) => `$ ${Number(value).toLocaleString("es-AR")}`

/**
 * Área: una serie
 * Con una sola serie no hay leyenda: el título ya dice qué se está mirando. El relleno es la misma tinta al 10 %.
 */
export function Area1() {
  const motion = useChartMotion()
  const data = [186, 305, 237, 273, 209, 314].map((facturado, i) => ({ mes: MESES[i], facturado: facturado * 1000 }))
  const config = { facturado: { label: "Facturado" } } satisfies ChartConfig
  return (
    <Card className="w-full max-w-lg" size="sm">
      <CardHeader>
        <CardTitle>Facturado por mes</CardTitle>
        <CardDescription>Primer semestre, en pesos.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="aspect-[2/1]" config={config}>
          <AreaChart data={data} margin={{ left: 4, right: 4, top: 8 }} responsive>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey="mes" tickLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent formatter={pesos} indicator="line" />} cursor />
            <Area
              dataKey="facturado"
              fill="var(--color-facturado)"
              fillOpacity={0.1}
              stroke="var(--color-facturado)"
              strokeWidth={2}
              type="monotone"
              {...motion}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/**
 * Barras: dos series
 * Con dos o más series la leyenda va siempre. Las barras miden 24px como máximo y se redondean solo en la punta.
 */
export function Barras() {
  const motion = useChartMotion()
  const data = [
    { mes: "Ene", facturado: 186, cobrado: 150 },
    { mes: "Feb", facturado: 305, cobrado: 280 },
    { mes: "Mar", facturado: 237, cobrado: 190 },
    { mes: "Abr", facturado: 273, cobrado: 260 },
    { mes: "May", facturado: 209, cobrado: 205 },
    { mes: "Jun", facturado: 314, cobrado: 240 },
  ]
  const config = { facturado: { label: "Facturado" }, cobrado: { label: "Cobrado" } } satisfies ChartConfig
  return (
    <ChartContainer className="aspect-[2/1] max-w-lg" config={config}>
      <BarChart barGap={2} data={data} margin={{ left: 4, right: 4, top: 8 }} responsive>
        <CartesianGrid vertical={false} />
        <XAxis axisLine={false} dataKey="mes" tickLine={false} tickMargin={8} />
        <YAxis axisLine={false} tickLine={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent />} cursor />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="facturado" fill="var(--color-facturado)" maxBarSize={24} radius={[4, 4, 0, 0]} {...motion} />
        <Bar dataKey="cobrado" fill="var(--color-cobrado)" maxBarSize={24} radius={[4, 4, 0, 0]} {...motion} />
      </BarChart>
    </ChartContainer>
  )
}

/**
 * Donut con el total en el centro
 * Un hueco de 2px del color de la superficie separa los sectores. El número grande va en tinta, no en el color de un sector.
 */
export function Donut() {
  const motion = useChartMotion()
  const data = [
    { canal: "web", monto: 412 },
    { canal: "presencial", monto: 268 },
    { canal: "telefono", monto: 121 },
    { canal: "otros", monto: 44 },
  ]
  const total = data.reduce((suma, fila) => suma + fila.monto, 0)
  const config = {
    web: { label: "Web" },
    presencial: { label: "Presencial" },
    telefono: { label: "Teléfono" },
    otros: { label: "Otros" },
  } satisfies ChartConfig
  return (
    <ChartContainer className="aspect-square max-h-64" config={config}>
      <PieChart responsive>
        <ChartTooltip content={<ChartTooltipContent nameKey="canal" />} />
        <ChartLegend content={<ChartLegendContent nameKey="canal" />} />
        <Pie
          data={data.map((fila) => ({ ...fila, fill: `var(--color-${fila.canal})` }))}
          dataKey="monto"
          innerRadius="62%"
          nameKey="canal"
          paddingAngle={2}
          stroke="var(--sf-background-100)"
          strokeWidth={2}
          {...motion}
        >
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null
              return (
                <text dominantBaseline="middle" textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
                  <tspan className="fill-gray-1000 text-heading-24 tabular-nums" x={viewBox.cx} y={viewBox.cy}>
                    {total}
                  </tspan>
                  <tspan className="fill-gray-900 text-label-12" x={viewBox.cx} y={(viewBox.cy ?? 0) + 22}>
                    ventas
                  </tspan>
                </text>
              )
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

const RANGOS = {
  "7d": [12, 18, 9, 22, 17, 25, 21],
  "30d": [8, 14, 11, 19, 16, 23, 20, 27, 22, 30],
  "90d": [30, 42, 38, 55, 61, 48, 70, 66, 82, 91],
} as const

/**
 * Cambio de datos
 * Al cambiar el rango, la línea se transforma en la nueva en vez de redibujarse: Recharts interpola entre los dos datasets. La tabla es la misma información, para quien no ve el gráfico.
 */
export function CambioDeDatos() {
  const motion = useChartMotion()
  const [rango, setRango] = useState<keyof typeof RANGOS>("7d")
  const [vista, setVista] = useState<"grafico" | "tabla">("grafico")
  const data = RANGOS[rango].map((altas, i) => ({ dia: `D${i + 1}`, altas }))
  const config = { altas: { label: "Altas" } } satisfies ChartConfig
  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ToggleGroup aria-label="Rango" onValueChange={(v) => v[0] && setRango(v[0] as keyof typeof RANGOS)} value={[rango]}>
          {(Object.keys(RANGOS) as (keyof typeof RANGOS)[]).map((clave) => (
            <ToggleGroupItem key={clave} value={clave}>
              {clave}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup aria-label="Vista" onValueChange={(v) => v[0] && setVista(v[0] as typeof vista)} value={[vista]}>
          <ToggleGroupItem value="grafico">Gráfico</ToggleGroupItem>
          <ToggleGroupItem value="tabla">Tabla</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {vista === "grafico" ? (
        <ChartContainer className="aspect-[2/1]" config={config}>
          <LineChart data={data} margin={{ left: 4, right: 4, top: 8 }} responsive>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey="dia" tickLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent hideIndicator />} cursor />
            <Line
              activeDot={{ r: 5, strokeWidth: 2 }}
              dataKey="altas"
              dot={false}
              stroke="var(--color-altas)"
              strokeWidth={2}
              type="monotone"
              {...motion}
            />
          </LineChart>
        </ChartContainer>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Día</TableHead>
              <TableHead className="text-right">Altas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((fila) => (
              <TableRow key={fila.dia}>
                <TableCell>{fila.dia}</TableCell>
                <TableCell className="text-right tabular-nums">{fila.altas}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

/**
 * Sparkline en un KPI
 * Sin ejes, sin grilla, sin tooltip: doce puntos que dan la forma de la tendencia debajo del número. El color es el de la serie única.
 */
export function Sparkline() {
  const motion = useChartMotion()
  const kpis = [
    { label: "Facturado", value: "$ 1.284.000", delta: "+12,4 %", trend: "up", serie: [4, 6, 5, 8, 7, 9, 8, 11, 10, 12, 13, 15] },
    { label: "Tickets abiertos", value: "37", delta: "+8", trend: "down", serie: [12, 10, 14, 13, 18, 17, 21, 20, 26, 29, 33, 37] },
    { label: "Tiempo de respuesta", value: "1,8 h", delta: "−0,4 h", trend: "up", serie: [3.1, 2.9, 3, 2.6, 2.4, 2.5, 2.2, 2.1, 2, 1.9, 1.9, 1.8] },
  ] as const
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {kpis.map((kpi) => (
        <Card key={kpi.label} size="sm">
          <CardContent className="flex flex-col gap-3">
            <Stat delta={kpi.delta} hint="vs. mes anterior" label={kpi.label} trend={kpi.trend} value={kpi.value} />
            <ChartContainer aria-hidden="true" className="aspect-auto h-10" config={{ v: { label: kpi.label } }}>
              <LineChart data={kpi.serie.map((v, i) => ({ i, v }))} margin={{ top: 2, bottom: 2, left: 2, right: 2 }} responsive>
                <Line dataKey="v" dot={false} stroke="var(--color-v)" strokeWidth={2} type="monotone" {...motion} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
