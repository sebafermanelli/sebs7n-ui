"use client"

import type * as React from "react"
import { SparklesIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import type { ButtonSize } from "../variants/button.js"
import { tooltipSurfaceClassName } from "../variants/overlay.js"
import { Button, type ButtonProps } from "./button.js"

type AiLabels = Labels["ai"]

/**
 * El ícono de la IA: los destellos, en el color de la IA.
 *
 * Adentro de un `AiButton` sólido toma el color del texto, porque ahí el fondo ya es violeta.
 */
function AiIcon({ className, ...props }: React.ComponentProps<typeof SparklesIcon>) {
  return <SparklesIcon aria-hidden="true" data-slot="ai-icon" className={cn("size-4 text-ai", className)} {...props} />
}

// Solo los colores de la IA sobre el Button del sistema: mismos tamaños, mismo foco, mismo
// apagado, misma espera. `not-data-disabled:` para que el hover no le gane al estado apagado.
const OUTLINE =
  "bg-transparent border-ai/40 text-ai not-data-disabled:hover:border-ai/60 not-data-disabled:hover:bg-ai/8 not-data-disabled:active:bg-ai/12"
const SOLID =
  "bg-ai-solid text-white shadow-ai not-data-disabled:hover:bg-ai-solid-hover not-data-disabled:active:bg-ai-solid-hover [&_svg]:text-current focus-visible:focus-ring-inverse [--sf-focus-inverse:white]"

// Genérico en el `size`, igual que `ButtonProps`: así un `AiButton size="icon-md"` sigue
// exigiendo `aria-label`, que es lo que el tipo del Button garantiza.
type AiButtonProps<S extends ButtonSize = ButtonSize> = Omit<ButtonProps<S>, "variant"> & {
  /**
   * `outline` es una acción de IA entre otras: «Resumir», «Completar con IA». `solid` es la
   * acción principal de un flujo de IA: enviar la pregunta, generar.
   */
  variant?: "outline" | "solid"
}

/**
 * Un botón para lo que hace la IA.
 *
 * Es el `Button` del paquete con otro color, no otro botón: quien ya sabe usar uno sabe usar
 * el otro. El color es propio —ni el negro ni el de marca— para que una acción de IA se
 * reconozca igual en cualquier app.
 *
 * **Uno sólido por pantalla**, por lo mismo que el acento: dos acciones principales son ninguna.
 */
function AiButton<S extends ButtonSize = ButtonSize>({ variant = "outline", className, ...props }: AiButtonProps<S>) {
  return (
    <Button
      data-ai={variant}
      variant={variant === "solid" ? "default" : "ghost"}
      className={cn(variant === "solid" ? SOLID : OUTLINE, className)}
      {...(props as ButtonProps)}
    />
  )
}

type AiLauncherProps = Omit<React.ComponentProps<"button">, "children"> & {
  /**
   * El nombre del lanzador. Es su nombre accesible y también la etiqueta que aparece al lado
   * al pasar el puntero o al enfocarlo. Por defecto, «Asistente».
   */
  label?: string
  /** Deja la etiqueta a la vista siempre, no solo con el puntero encima. */
  labelVisible?: boolean
  /** De qué lado del botón va la etiqueta. Por defecto a la izquierda: el lanzador vive abajo a la derecha. */
  labelSide?: "left" | "right"
  /**
   * La IA está trabajando: el canto gira. Es lo que avisa, con el panel cerrado, que hay una
   * respuesta en camino. En reposo el canto está quieto.
   */
  active?: boolean
  /** El ícono. Por defecto, los destellos; una `X` cuando el panel está abierto. */
  children?: React.ReactNode
  labels?: Partial<AiLabels>
}

/**
 * El botón redondo que abre el asistente, para dejar flotando en una esquina.
 *
 * Es opaco —flota encima de lo que sea— y lleva el canto en el degradé de la IA,
 * que es lo que lo distingue de cualquier otro botón flotante.
 *
 * **No se posiciona solo.** Dónde flota lo decide la app (`className="fixed end-6 bottom-6"`),
 * porque depende de qué más haya ahí: una barra inferior en mobile, un banner de cookies, el
 * área segura de un teléfono.
 *
 * Como trigger de un `Popover` o un `Sheet`: `render={<AiLauncher />}`.
 */
function AiLauncher({ className, label, labelVisible = false, labelSide = "left", active = false, labels: labelsProp, children, ...props }: AiLauncherProps) {
  const labels = { ...useLabels().ai, ...defined(labelsProp) }
  const nombre = label ?? labels.launcher
  return (
    <button
      aria-label={nombre}
      data-ai-active={active ? "" : undefined}
      data-slot="ai-launcher"
      type="button"
      className={cn(
        "group/ai-launcher relative inline-flex size-14 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none select-none",
        "bg-surface ai-rim text-ai shadow-menu transition-surface",
        "hover:scale-105 active:scale-95 focus-visible:focus-ring",
        "disabled:cursor-not-allowed disabled:text-label-tertiary disabled:hover:scale-100",
        "[&_svg]:pointer-events-none [&_svg]:size-6",
        className
      )}
      {...props}
    >
      {children ?? <AiIcon className="size-6" />}
      {/* La etiqueta es el nombre, ya dicho en `aria-label`: para un lector sería oírlo dos
          veces. Se ve igual que un Tooltip (`tooltipSurfaceClassName`, clase por clase) pero no
          es el componente: `labelVisible` la deja fija sin hover, y el lanzador casi siempre es el
          trigger de un Popover o un Sheet, así que un Tooltip encima sería un segundo trigger
          peleando por el mismo botón. */}
      <span
        aria-hidden="true"
        data-slot="ai-launcher-label"
        data-visible={labelVisible ? "" : undefined}
        className={cn(
          tooltipSurfaceClassName,
          "pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap",
          labelSide === "left" ? "right-full mr-3" : "left-full ml-3",
          "opacity-0 transition-opacity duration-150 ease-out-expo motion-reduce:transition-none data-visible:opacity-100",
          "group-hover/ai-launcher:opacity-100 group-focus-visible/ai-launcher:opacity-100"
        )}
      >
        {nombre}
      </span>
    </button>
  )
}

type AiGlowProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** La IA está trabajando. Sin esto el borde está apagado. */
  active?: boolean
  /**
   * `brand` tiñe el borde con escalones de la marca de la app en vez de los tonos de IA del paquete
   * (violeta y magenta). Sin `tint`, igual que siempre. Para otros colores, `--ai-glow-1` … `--ai-glow-4`.
   */
  tint?: "brand"
}

/**
 * El borde de la IA, para cualquier contenedor: un diálogo que está leyendo un documento, una
 * tarjeta que se está completando sola, un panel que espera una respuesta.
 *
 * Se suelta ADENTRO del contenedor y toma su forma: ocupa todo su contorno y hereda su radio.
 * El contenedor tiene que estar posicionado, que es lo que ya son un `Dialog`, un `Popover` o
 * un `Sheet`; a una `Card` hay que sumarle `relative`.
 *
 * ```tsx
 * <DialogContent>
 *   <AiGlow active={leyendo} />
 *   …
 * </DialogContent>
 * ```
 *
 * **Una sola regla: siempre que la IA esté trabajando, y solo entonces.** Es lo que hace que
 * el borde signifique algo. `Chat` ya lo trae con su `busy`: ahí no hace falta.
 *
 * Es decoración. La espera la tiene que anunciar el contenedor con `aria-busy`.
 */
function AiGlow({ className, active = false, tint, ...props }: AiGlowProps) {
  return (
    <div
      aria-hidden="true"
      data-ai-active={active ? "" : undefined}
      data-slot="ai-glow"
      className={cn("pointer-events-none absolute inset-0 z-10 rounded-[inherit] ai-glow", tint === "brand" && "ai-tint-brand", className)}
      {...props}
    />
  )
}

/**
 * «La IA está trabajando». Va donde iría un `Skeleton`, en un flujo de IA.
 *
 * Es decoración: quien anuncia la espera es el contenedor (`aria-busy`, o el `role="status"`
 * de `ChatTyping`).
 */
function AiShimmer({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-hidden="true" data-slot="ai-shimmer" className={cn("h-4 ai-shimmer", className)} {...props} />
}

export { AiButton, AiGlow, AiIcon, AiLauncher, AiShimmer, type AiButtonProps, type AiGlowProps, type AiLabels, type AiLauncherProps }
