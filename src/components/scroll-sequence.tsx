"use client"

import * as React from "react"

import { defined } from "../internal/defined.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"

/**
 * Un escenario fijo (`sticky`) cuyo estado lo maneja el scroll: al bajar avanza de paso (borrador →
 * revisada → emitida) y al subir **retrocede**. No es una animación que se dispara una vez: el paso es
 * una función pura de cuánto se recorrió la pista (`scrollSequenceState`), así que el mismo lugar de la
 * página muestra siempre lo mismo.
 *
 * ```tsx
 * <ScrollSequence steps={[{ label: "Borrador" }, { label: "Revisada" }, { label: "Emitida" }]}>
 *   {({ step, label }) => <Factura estado={label} emitida={step === 2} />}
 * </ScrollSequence>
 * ```
 *
 * - **Sin JS** (y antes de hidratar con movimiento reducido): todos los pasos apilados en orden, en
 *   una lista. El HTML del servidor trae las dos versiones y el CSS muestra la que corresponde; al
 *   montar, la que no se usa se desmonta.
 * - **`prefers-reduced-motion: reduce`**: los pasos apilados, sin escenario fijo.
 * - **Rendimiento**: el scroll se escucha solo mientras la pista está en pantalla
 *   (`IntersectionObserver`), se lee una vez por cuadro (`requestAnimationFrame`) y React vuelve a
 *   renderizar solo cuando cambia el paso. El progreso fino va en las variables CSS
 *   `--scroll-sequence-progress` y `--scroll-sequence-step-progress` del escenario: animá con
 *   `transform` y `opacity` leyéndolas, nunca con propiedades de layout.
 */

type ScrollSequenceStep = {
  /** El nombre del paso: se ve en el indicador y en la versión apilada. */
  label: string
}

type ScrollSequenceState = {
  /** El paso actual, desde 0. */
  step: number
  /** La cantidad de pasos. */
  stepCount: number
  /** El `label` del paso actual. */
  label: string
  /**
   * El recorrido de la pista, de 0 a 1. Se actualiza en cada cuadro solo con `continuous`; si no, es
   * el del inicio del paso (y el fino está en `--scroll-sequence-progress`).
   */
  progress: number
  /** Cuánto se recorrió del paso actual, de 0 a 1 (mismo criterio que `progress`). */
  stepProgress: number
  /** `scroll` en el escenario fijo; `static` en la lista apilada (sin JS, con movimiento reducido o sin `minStage`). */
  mode: "scroll" | "static"
  /** Lleva la página al paso `index` (desplazamiento suave). En la versión apilada no hace nada. */
  goTo: (index: number) => void
}

type ScrollSequenceLabels = NonNullable<Labels["scrollSequence"]>

/** Los textos por defecto (no están en `defaultLabels`: el componente es solo por subpath). */
const scrollSequenceLabels: ScrollSequenceLabels = {
  steps: "Pasos",
  goToStep: (step, label) => `Ir al paso ${step}: ${label}`,
  current: (step, count, label) => `Paso ${step} de ${count}: ${label}`,
}

type ScrollSequenceProps = Omit<React.ComponentProps<"section">, "children"> & {
  /** Los pasos, en orden. */
  steps: ScrollSequenceStep[]
  /** Dibuja el escenario para un estado. Se llama una vez por paso en la versión apilada. */
  children: (state: ScrollSequenceState) => React.ReactNode
  /**
   * Una media query que el escenario necesita para tener sentido (`"(min-width: 640px) and (min-height: 640px)"`).
   * Si no se cumple, los pasos se ven apilados, como con movimiento reducido. Sin ella, el
   * comportamiento no cambia. Antes de hidratar, el CSS aplica la misma consulta.
   */
  minStage?: string
  /** Cuánto scroll ocupa cada paso (cualquier largo CSS). Default `100svh`. */
  stepLength?: string
  /** Dónde se fija el escenario (el alto de una barra fija, por ejemplo `4rem`). Default `0px`. */
  offset?: string
  /** Re-renderiza en cada cuadro con el `progress` fino. Apagado por defecto: alcanza con las variables CSS. */
  continuous?: boolean
  /** Muestra el indicador de pasos arriba del escenario. Default `true`. */
  indicator?: boolean
  /** Clases del escenario fijo (el alto de pantalla que se queda quieto). */
  stageClassName?: string
  /** Avisa cada cambio de paso. */
  onStepChange?: (step: number) => void
  /** Cambia los textos internos; le gana al `LabelsProvider` (`labels.scrollSequence`). */
  labels?: Partial<ScrollSequenceLabels>
}

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value)

/**
 * El progreso de la pista: 0 cuando su borde de arriba llega al lugar donde se fija el escenario, 1
 * cuando su borde de abajo llega al de abajo del escenario. `viewport` es el alto del escenario.
 */
function scrollSequenceProgress(rect: { top: number; height: number }, viewport: number, offset = 0): number {
  const range = rect.height - viewport
  if (range <= 0) return 0
  return clamp01((offset - rect.top) / range)
}

/** El paso para un progreso: cada uno ocupa un tramo igual; el último incluye el 1. */
function scrollSequenceState(progress: number, stepCount: number): { step: number; stepProgress: number } {
  const count = Math.max(stepCount, 1)
  const scaled = clamp01(progress) * count
  const step = Math.min(count - 1, Math.floor(scaled))
  return { step, stepProgress: clamp01(scaled - step) }
}

const noop = () => {}
const REDUCE = "(prefers-reduced-motion: reduce)"

function ScrollSequence({
  steps,
  children,
  stepLength = "100svh",
  offset = "0px",
  continuous = false,
  minStage,
  indicator = true,
  stageClassName,
  onStepChange,
  labels,
  className,
  ...props
}: ScrollSequenceProps) {
  const text = { ...scrollSequenceLabels, ...useLabels().scrollSequence, ...defined(labels) }
  const count = steps.length
  // `null` = todavía no se sabe (el servidor y el primer render del cliente): salen las dos versiones.
  const [mode, setMode] = React.useState<"scroll" | "static" | null>(null)
  const [step, setStep] = React.useState(0)
  const [fine, setFine] = React.useState(0)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const onStepChangeRef = React.useRef(onStepChange)
  onStepChangeRef.current = onStepChange

  React.useEffect(() => {
    const canMatch = typeof window.matchMedia === "function"
    const media = canMatch ? window.matchMedia(REDUCE) : null
    const stage = canMatch && minStage ? window.matchMedia(minStage) : null
    const apply = () => setMode(media?.matches || (stage && !stage.matches) ? "static" : "scroll")
    apply()
    media?.addEventListener?.("change", apply)
    stage?.addEventListener?.("change", apply)
    return () => {
      media?.removeEventListener?.("change", apply)
      stage?.removeEventListener?.("change", apply)
    }
  }, [minStage])

  // El offset en px se lee del `top` computado del escenario: así acepta `4rem` o `calc(…)`.
  const offsetPx = React.useCallback(() => {
    const stage = stageRef.current
    return stage ? parseFloat(getComputedStyle(stage).top) || 0 : 0
  }, [])

  React.useEffect(() => {
    if (mode !== "scroll") return
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return
    let frame = 0
    let top = offsetPx()
    let current = -1

    const update = () => {
      frame = 0
      // Una lectura de layout por cuadro y, después, solo escrituras de variables y estado.
      const progress = scrollSequenceProgress(track.getBoundingClientRect(), window.innerHeight - top, top)
      const state = scrollSequenceState(progress, count)
      stage.style.setProperty("--scroll-sequence-progress", String(progress))
      stage.style.setProperty("--scroll-sequence-step-progress", String(state.stepProgress))
      if (continuous) setFine(progress)
      if (state.step !== current) {
        if (current !== -1) onStepChangeRef.current?.(state.step)
        current = state.step
        setStep(state.step)
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onResize = () => {
      top = offsetPx()
      schedule()
    }

    let listening = false
    const listen = (on: boolean) => {
      if (on === listening) return
      listening = on
      if (on) window.addEventListener("scroll", schedule, { passive: true })
      else window.removeEventListener("scroll", schedule)
    }
    // Fuera de pantalla no se escucha el scroll: una landing larga no paga cada cuadro por esta pieza.
    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(([entry]) => {
            listen(Boolean(entry?.isIntersecting))
            if (entry?.isIntersecting) schedule()
          })
        : null
    if (observer) observer.observe(track)
    else listen(true)
    window.addEventListener("resize", onResize)
    update()

    return () => {
      observer?.disconnect()
      listen(false)
      window.removeEventListener("resize", onResize)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [mode, count, continuous, offsetPx])

  const goTo = (index: number) => {
    const track = trackRef.current
    if (!track) return
    const top = offsetPx()
    const range = track.getBoundingClientRect().height - (window.innerHeight - top)
    const at = count > 1 ? index / (count - 1) : 0
    // El borde de arriba de la pista, en coordenadas de la página, más lo que se recorre hasta el paso.
    const start = window.scrollY + track.getBoundingClientRect().top - top
    window.scrollTo({ top: Math.round(start + Math.max(range, 0) * at), behavior: "smooth" })
  }

  const stateOf = (index: number, progress: number, stepProgress: number, m: "scroll" | "static"): ScrollSequenceState => ({
    step: index,
    stepCount: count,
    label: steps[index]?.label ?? "",
    progress,
    stepProgress,
    mode: m,
    goTo: m === "scroll" ? goTo : noop,
  })

  const showScroll = mode !== "static"
  const showStatic = mode !== "scroll"
  const uid = React.useId()

  const scrollProgressNow = continuous ? fine : count > 1 ? step / count : 0
  const stepProgressNow = continuous ? scrollSequenceState(fine, count).stepProgress : 0

  return (
    <section data-slot="scroll-sequence" data-mode={mode ?? undefined} className={cn("relative", className)} {...props}>
      {mode === null && (
        // Sin JS no hay escenario que avance: se ve la lista apilada. Con JS, el efecto decide.
        <noscript>
          <style>{`[data-scroll-sequence="${uid}"][data-slot=scroll-sequence-track]{display:none!important}[data-scroll-sequence="${uid}"][data-slot=scroll-sequence-static]{display:flex!important}`}</style>
        </noscript>
      )}
      {mode === null && minStage && (
        // Mismo criterio antes de hidratar: si el escenario no entra, el CSS ya muestra la lista.
        <style>{`@media not all and ${minStage}{[data-scroll-sequence="${uid}"][data-slot=scroll-sequence-track]{display:none!important}[data-scroll-sequence="${uid}"][data-slot=scroll-sequence-static]{display:flex!important}}`}</style>
      )}
      {showScroll && (
        <div
          ref={trackRef}
          data-scroll-sequence={uid}
          data-slot="scroll-sequence-track"
          // Antes de hidratar, con movimiento reducido, la lista y no la pista (el CSS no espera al JS).
          className={cn("relative", mode === null && "motion-reduce:hidden")}
          style={{ height: `calc(${Math.max(count, 1)} * ${stepLength})` }}
        >
          <div
            ref={stageRef}
            data-slot="scroll-sequence-stage"
            data-step={step}
            className={cn("sticky flex flex-col overflow-hidden", stageClassName)}
            style={{ top: offset, height: `calc(100svh - ${offset})` }}
          >
            {indicator && (
              <ol aria-label={text.steps} data-slot="scroll-sequence-indicator" className="relative flex list-none flex-wrap justify-center gap-1 p-3">
                {steps.map((item, index) => (
                  <li key={index}>
                    <button
                      aria-current={index === step ? "step" : undefined}
                      aria-label={text.goToStep(index + 1, item.label)}
                      className={cn(
                        "relative rounded-control px-2.5 py-1 text-footnote text-label-secondary outline-none transition-control after:absolute after:-inset-1 hover:text-label focus-visible:focus-ring",
                        index === step && "bg-fill-2 font-semibold text-label"
                      )}
                      onClick={() => goTo(index)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ol>
            )}
            {/* Para un lector de pantalla el cambio de paso por scroll no se ve: se anuncia. */}
            <p className="sr-only" role="status">
              {mode === "scroll" ? text.current(step + 1, count, steps[step]?.label ?? "") : ""}
            </p>
            <div data-slot="scroll-sequence-content" className="relative min-h-0 flex-1">
              {children(stateOf(step, scrollProgressNow, stepProgressNow, "scroll"))}
            </div>
          </div>
        </div>
      )}
      {showStatic && (
        <ol
          data-scroll-sequence={uid}
          data-slot="scroll-sequence-static"
          className={cn("flex list-none flex-col gap-8", mode === null && "hidden motion-reduce:flex")}
        >
          {steps.map((item, index) => (
            <li className="flex flex-col gap-3" key={index}>
              <p className="text-footnote font-semibold text-label-secondary">{item.label}</p>
              {children(stateOf(index, count > 1 ? index / (count - 1) : 1, 1, "static"))}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export {
  ScrollSequence,
  scrollSequenceLabels,
  scrollSequenceProgress,
  scrollSequenceState,
  type ScrollSequenceProps,
  type ScrollSequenceState,
  type ScrollSequenceStep,
}
