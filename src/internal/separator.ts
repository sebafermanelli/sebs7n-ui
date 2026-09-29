import type * as React from "react"

/**
 * Lo que comparten los separadores que se arrastran (`ResizableHandle`, el borde de un panel de
 * `SplitView resizable`): qué hace cada tecla y cómo se sigue al puntero. Es el patrón «window
 * splitter» de WAI-ARIA: el separador es tabulable, las flechas de su eje mueven, Home y End van a
 * los extremos.
 */

/** El eje en que se mueve el separador: `x` entre paneles lado a lado, `y` entre paneles apilados. */
export type SeparatorAxis = "x" | "y"

/**
 * Qué hace una tecla: un corrimiento (en las unidades de `step`, positivo = crece el panel de antes),
 * ir al mínimo o al máximo de ese panel, o nada. En RTL el panel de antes está a la derecha, así que
 * la flecha a la izquierda lo agranda.
 */
export function separatorKey(event: Pick<KeyboardEvent, "key" | "shiftKey">, axis: SeparatorAxis, rtl: boolean, step: number, bigStep: number): number | "min" | "max" | null {
  const amount = event.shiftKey ? bigStep : step
  if (event.key === "Home") return "min"
  if (event.key === "End") return "max"
  if (axis === "x") {
    if (event.key === "ArrowRight") return rtl ? -amount : amount
    if (event.key === "ArrowLeft") return rtl ? amount : -amount
  } else {
    if (event.key === "ArrowDown") return amount
    if (event.key === "ArrowUp") return -amount
  }
  return null
}

/** ¿El elemento está en un contexto de derecha a izquierda? */
export const isRtl = (element: Element) => element.closest("[dir]")?.getAttribute("dir") === "rtl"

/**
 * Sigue al puntero desde un `pointerdown` sobre el separador: llama `onMove` con los píxeles
 * recorridos desde el comienzo (positivo = crece el panel de antes) y `onEnd` al soltar. Captura el
 * puntero, así el arrastre sigue aunque el cursor se salga de la manija de 12 px. Si el navegador le
 * saca la captura (otra ventana, un gesto del sistema) el arrastre termina igual, una sola vez.
 */
export function dragSeparator(event: React.PointerEvent<HTMLElement>, axis: SeparatorAxis, onMove: (deltaPx: number) => void, onEnd: () => void) {
  if (event.button !== 0) return
  event.preventDefault()
  const element = event.currentTarget
  const rtl = axis === "x" && isRtl(element)
  const start = axis === "x" ? event.clientX : event.clientY
  element.setPointerCapture?.(event.pointerId)
  element.dataset.dragging = ""
  const move = (next: PointerEvent) => {
    const delta = (axis === "x" ? next.clientX : next.clientY) - start
    onMove(rtl ? -delta : delta)
  }
  const end = () => {
    delete element.dataset.dragging
    element.removeEventListener("pointermove", move)
    element.removeEventListener("pointerup", end)
    element.removeEventListener("pointercancel", end)
    element.removeEventListener("lostpointercapture", end)
    onEnd()
  }
  element.addEventListener("pointermove", move)
  element.addEventListener("pointerup", end)
  element.addEventListener("pointercancel", end)
  element.addEventListener("lostpointercapture", end)
}

/**
 * La línea del separador: 1 px de `separator-strong` (la línea entre paneles de Mail) con un área de
 * 12 px para agarrarla, el acento con el puntero, al arrastrar y con el foco (3 px, el ancho del
 * anillo de iCloud). `aria-orientation="vertical"` es la línea vertical entre paneles lado a lado.
 */
export const separatorClassName =
  "group/separator relative z-10 flex shrink-0 touch-none items-center justify-center bg-separator-strong outline-none select-none transition-colors " +
  "after:absolute before:absolute before:bg-(--sf-focus) before:opacity-0 focus-visible:before:opacity-100 " +
  "hover:bg-brand-700 data-dragging:bg-brand-700 " +
  "aria-[orientation=vertical]:w-px aria-[orientation=vertical]:cursor-col-resize aria-[orientation=vertical]:after:inset-y-0 aria-[orientation=vertical]:after:-inset-x-1.5 aria-[orientation=vertical]:before:inset-y-0 aria-[orientation=vertical]:before:-inset-x-px " +
  "aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:cursor-row-resize aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:-inset-y-1.5 aria-[orientation=horizontal]:before:inset-x-0 aria-[orientation=horizontal]:before:-inset-y-px " +
  // Con el dedo, el área crece a 24.
  "pointer-coarse:aria-[orientation=vertical]:after:-inset-x-3 pointer-coarse:aria-[orientation=horizontal]:after:-inset-y-3"
