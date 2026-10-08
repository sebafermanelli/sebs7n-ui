"use client"

import * as React from "react"

import { cn } from "../lib/utils.js"
import { ScrollSequence, type ScrollSequenceProps, type ScrollSequenceState } from "./scroll-sequence.js"

/**
 * Una escena pegajosa con pasos numerados: a la izquierda la lista editorial (01, 02, 03) con filetes
 * de 1 px, a la derecha el escenario que cambia con el paso. Es `ScrollSequence` con una composición
 * ya resuelta, para contar un recorrido de producto en una landing.
 *
 * ```tsx
 * <ScrollStory
 *   steps={[
 *     { label: "Cargar", title: "Cargá la factura", description: "Desde un PDF o a mano." },
 *     { label: "Revisar", title: "Revisala con tu equipo" },
 *   ]}
 * >
 *   {({ step }) => <Pantalla paso={step} />}
 * </ScrollStory>
 * ```
 *
 * - **`minStage`** (default `(min-width: 768px) and (min-height: 600px)`): si el escenario no entra
 *   —un teléfono, una ventana baja—, los pasos se apilan (título, bajada y escena de cada uno).
 * - La lista es de botones: Tab y Enter llevan al paso (`goTo`); el actual lleva `aria-current="step"`
 *   y un filete que se llena con `--scroll-sequence-step-progress` (solo `transform`).
 * - Sin JS o con movimiento reducido: los pasos apilados, en orden.
 */
type ScrollStoryStep = {
  /** El nombre corto del paso (lo anuncia el lector). */
  label: string
  /** El título que se ve en la lista. */
  title: string
  /** La bajada del paso. */
  description?: React.ReactNode
}

type ScrollStoryProps = Omit<ScrollSequenceProps, "steps" | "children" | "indicator"> & {
  steps: ScrollStoryStep[]
  /** Dibuja el escenario (el lado derecho) para un paso. */
  children: (state: ScrollSequenceState) => React.ReactNode
  /** Clases de la grilla de dos columnas. */
  gridClassName?: string
}

const DEFAULT_MIN_STAGE = "(min-width: 768px) and (min-height: 600px)"

function pad(index: number) {
  return String(index + 1).padStart(2, "0")
}

function ScrollStory({ steps, children, minStage = DEFAULT_MIN_STAGE, gridClassName, stageClassName, ...props }: ScrollStoryProps) {
  return (
    <ScrollSequence
      data-slot="scroll-story"
      indicator={false}
      minStage={minStage}
      stageClassName={cn("justify-center", stageClassName)}
      steps={steps.map(({ label }) => ({ label }))}
      {...props}
    >
      {(state) =>
        state.mode === "scroll" ? (
          <div className={cn("mx-auto grid h-full w-full max-w-[1080px] items-center gap-12 px-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]", gridClassName)}>
            <ol className="m-0 flex list-none flex-col p-0" data-slot="scroll-story-steps">
              {steps.map((item, index) => {
                const current = index === state.step
                return (
                  <li className="relative border-t border-separator first:border-t-0" key={index}>
                    {current && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 -top-px h-px origin-left bg-label"
                        style={{ transform: "scaleX(var(--scroll-sequence-step-progress, 0))" }}
                      />
                    )}
                    <button
                      aria-current={current ? "step" : undefined}
                      className="flex w-full gap-4 rounded-control py-5 text-start outline-none focus-visible:focus-ring"
                      onClick={() => state.goTo(index)}
                      type="button"
                    >
                      <span className={cn("w-7 shrink-0 pt-1 text-footnote tabular-nums", current ? "font-semibold text-label" : "text-label-secondary")}>{pad(index)}</span>
                      <span className="flex min-w-0 flex-col gap-1.5">
                        <span className={cn("font-display text-title-3", current ? "text-label" : "text-label-secondary")}>{item.title}</span>
                        {item.description != null && <span className="text-callout text-label-secondary">{item.description}</span>}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            <div data-slot="scroll-story-stage" className="relative min-w-0">
              {children(state)}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4" data-slot="scroll-story-static">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-display text-title-3 text-label">
                <span className="me-3 text-footnote tabular-nums text-label-secondary">{pad(state.step)}</span>
                {steps[state.step]?.title}
              </h3>
              {steps[state.step]?.description != null && <p className="text-callout text-label-secondary">{steps[state.step]?.description}</p>}
            </div>
            {children(state)}
          </div>
        )
      }
    </ScrollSequence>
  )
}

export { ScrollStory, type ScrollStoryProps, type ScrollStoryStep }
