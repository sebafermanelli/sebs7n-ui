import type * as React from "react"

import { cn } from "../lib/utils.js"

type StatProps = React.ComponentProps<"div"> & {
  label: React.ReactNode
  value: React.ReactNode
  /** Variación respecto del período anterior ("+12%"). */
  delta?: React.ReactNode
  /** Color del delta: up = green-900, down = red-900, neutral = gray-900. */
  trend?: "up" | "down" | "neutral"
  /** Contexto del número ("vs. mes anterior"). */
  hint?: React.ReactNode
}

const trendClassName = { up: "text-green-900", down: "text-red-900", neutral: "text-gray-900" } as const

// KPI plano: sin card. Para una fila de KPIs, componé varios dentro de un Card o una grilla.
function Stat({ className, label, value, delta, trend = "neutral", hint, ...props }: StatProps) {
  return (
    <div data-slot="stat" data-trend={delta != null ? trend : undefined} className={cn("flex min-w-0 flex-col gap-1", className)} {...props}>
      <div data-slot="stat-label" className="truncate text-label-13 text-gray-900">
        {label}
      </div>
      <div data-slot="stat-value" className="text-heading-24 text-gray-1000 tabular-nums">
        {value}
      </div>
      {(delta != null || hint != null) && (
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          {delta != null && (
            <span data-slot="stat-delta" className={cn("text-label-12 tabular-nums", trendClassName[trend])}>
              {delta}
            </span>
          )}
          {hint != null && (
            <span data-slot="stat-hint" className="text-label-12 text-gray-900">
              {hint}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export { Stat, type StatProps }
