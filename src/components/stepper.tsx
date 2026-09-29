"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"

import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"

/**
 * Los pasos de un asistente («Cliente › Ítems › Impuestos › Confirmar»). iCloud web no tiene uno: se
 * deriva de sus piezas (spec 2.0). Un círculo de 24 por paso —acento sólido con el tilde si está
 * completo, aro de acento con el número si es el actual, gris si falta, rojo si tiene un error— unido
 * al siguiente por una línea de 1 px, que va en el acento después de un paso completo.
 *
 * Es una lista ordenada (`<ol>`) con nombre: el lector cuenta los pasos («2 de 4») y el actual lleva
 * `aria-current="step"`. El estado de los demás se dice en texto, no solo con el color.
 */
type StepperStatus = "complete" | "current" | "upcoming" | "error"

type StepperStep = {
  title: React.ReactNode
  /** Una línea de detalle debajo del título (14 gris): el cliente elegido, «3 servicios». */
  description?: React.ReactNode
  /** Un ícono en lugar del número (el paso completo sigue mostrando el tilde). */
  icon?: React.ReactNode
  /** Fuerza el estado. Sin él, sale de `current`: antes completo, igual actual, después pendiente. */
  status?: StepperStatus
}

type StepperProps = Omit<React.ComponentProps<"ol">, "children"> & {
  steps: StepperStep[]
  /** El índice del paso actual, en base 0. */
  current: number
  /** `horizontal` (default): los pasos en fila con el título debajo. `vertical`: en columna, para un costado. */
  orientation?: "horizontal" | "vertical"
  /** Vuelve botones los pasos completos (y los que tienen error): se llama con el índice, para volver a ese paso. */
  onStepClick?: (index: number) => void
  labels?: Partial<Labels["stepper"]>
}

const INDICATOR: Record<StepperStatus, string> = {
  complete: "bg-brand-700 text-brand-contrast",
  // El aro es de 1,5 como el check circular de Reminders; el número en `brand-ink`, que llega a 4,5:1.
  current: "border-[1.5px] border-brand-700 bg-surface text-brand-ink",
  upcoming: "bg-fill-2 text-label-secondary",
  // El rojo del badge sólido: `red-800` con el blanco, a 4,5:1 en los dos temas.
  error: "bg-red-800 text-white",
}

function statusOf(step: StepperStep, index: number, current: number): StepperStatus {
  if (step.status) return step.status
  return index < current ? "complete" : index === current ? "current" : "upcoming"
}

function Stepper({ className, steps, current, orientation = "horizontal", onStepClick, labels: labelsProp, "aria-label": ariaLabel, ...props }: StepperProps) {
  const labels = { ...useLabels().stepper, ...labelsProp }
  const vertical = orientation === "vertical"
  const statuses = steps.map((step, index) => statusOf(step, index, current))

  return (
    <ol
      data-slot="stepper"
      data-orientation={orientation}
      aria-label={ariaLabel ?? (props["aria-labelledby"] ? undefined : labels.label)}
      className={cn("flex w-full", vertical ? "flex-col" : "items-start", className)}
      {...props}
    >
      {steps.map((step, index) => {
        const status = statuses[index]!
        const last = index === steps.length - 1
        const said = status === "complete" ? labels.complete : status === "upcoming" ? labels.upcoming : status === "error" ? labels.error : null
        const clickable = !!onStepClick && (status === "complete" || status === "error")
        const indicator = (
          <span
            data-slot="stepper-indicator"
            aria-hidden="true"
            className={cn(
              "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-footnote font-semibold tabular-nums transition-control [&_svg]:size-3.5",
              INDICATOR[status]
            )}
          >
            {status === "complete" ? <CheckIcon aria-hidden="true" className="stroke-3" /> : status === "error" ? "!" : (step.icon ?? index + 1)}
          </span>
        )
        const text = (
          <span className={cn("flex min-w-0 flex-col", vertical ? "pt-0.5" : "items-center")}>
            <span
              data-slot="stepper-title"
              className={cn(
                "text-callout",
                status === "current" ? "font-semibold text-label" : status === "upcoming" ? "text-label-secondary" : status === "error" ? "text-red-ink" : "text-label"
              )}
            >
              {step.title}
              {said && <span className="sr-only">, {said}</span>}
            </span>
            {step.description != null && <span className="text-footnote text-label-secondary">{step.description}</span>}
          </span>
        )
        const content = clickable ? (
          <button
            type="button"
            data-slot="stepper-button"
            onClick={() => onStepClick(index)}
            className={cn(
              "relative isolate flex cursor-pointer gap-2 rounded-control outline-none",
              "before:absolute before:-inset-x-2 before:-inset-y-1 before:-z-10 before:rounded-control before:transition-control hover:before:bg-fill-1 focus-visible:before:focus-ring",
              vertical ? "items-start text-start" : "flex-col items-center text-center"
            )}
          >
            {indicator}
            {text}
          </button>
        ) : (
          <div className={cn("flex gap-2", vertical ? "items-start" : "flex-col items-center text-center")}>
            {indicator}
            {text}
          </div>
        )
        // El conector une este círculo con el siguiente: en fila, del borde de uno al del otro a la
        // altura del centro (12); en columna, debajo del círculo hasta el próximo. Va en el acento si
        // este paso ya está completo.
        const connector = !last && (
          <span
            data-slot="stepper-connector"
            aria-hidden="true"
            className={cn(
              "absolute",
              status === "complete" ? "bg-brand-700" : "bg-separator",
              vertical ? "start-3 top-7.5 bottom-1.5 w-px" : "start-[calc(50%+18px)] end-[calc(-50%+18px)] top-3 h-px"
            )}
          />
        )
        return (
          <li
            key={index}
            data-slot="stepper-step"
            data-status={status}
            aria-current={status === "current" ? "step" : undefined}
            className={cn("relative flex min-w-0", vertical ? "pb-6 last:pb-0" : "flex-1 flex-col items-center px-1")}
          >
            {content}
            {connector}
          </li>
        )
      })}
    </ol>
  )
}

export { Stepper, type StepperProps, type StepperStatus, type StepperStep }
