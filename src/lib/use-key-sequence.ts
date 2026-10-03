"use client"

import * as React from "react"

/** Escribiendo en un campo, o con un popup abierto, las teclas son texto o navegación: no hay atajo que valga. */
function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
    target.getAttribute("role") === "textbox" ||
    target.closest('[role="dialog"], [role="alertdialog"], [role="listbox"], [role="menu"]') !== null
  )
}

type UseKeySequenceOptions = {
  /** Cuánto espera la tecla siguiente de una secuencia, en ms. Por defecto, 1200. */
  timeout?: number
  /** Con `false` no escucha. Por defecto, `true`. */
  enabled?: boolean
}

/**
 * Atajos de teclado de una tecla («?») o de una secuencia («g i»: `g` y, enseguida, `i`). Es el
 * hook de las apps: **el atajo global lo registra la app**, ningún componente del paquete escucha
 * teclas por su cuenta. Se usa en el layout, junto a `ShortcutsDialog` y `CommandPalette`.
 *
 * Las claves del mapa son las teclas separadas por espacio, en minúscula (`event.key`): `"?"`,
 * `"g i"`. No se disparan con ⌘, Ctrl o Alt apretados, ni mientras el foco está en un campo de
 * texto, un diálogo, una lista o un menú. Lo que no coincide con ningún atajo no se toca
 * (`preventDefault` solo cuando hay uno).
 *
 * ```tsx
 * useKeySequence({ "?": () => setHelpOpen(true), "g i": () => router.push("/inicio") })
 * ```
 *
 * Los handlers pueden cambiar en cada render sin volver a registrar el listener.
 */
function useKeySequence(sequences: Record<string, (event: KeyboardEvent) => void>, { timeout = 1200, enabled = true }: UseKeySequenceOptions = {}) {
  const latest = React.useRef(sequences)
  latest.current = sequences
  // La combinación de teclas tipeadas hasta ahora y cuándo se tipeó la última.
  const buffer = React.useRef<{ keys: string[]; at: number }>({ keys: [], at: 0 })

  React.useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat || isTypingTarget(event.target)) return
      if (["Shift", "Control", "Alt", "Meta"].includes(event.key)) return
      const table = latest.current
      const key = event.key.toLowerCase()
      const now = Date.now()
      const previous = now - buffer.current.at < timeout ? buffer.current.keys : []
      const isPrefix = (keys: string[]) => Object.keys(table).some((sequence) => sequence.split(" ").slice(0, keys.length).join(" ") === keys.join(" "))
      // Si la tecla no continúa la secuencia en curso, empieza una nueva con ella.
      let keys = [...previous, key]
      if (!isPrefix(keys)) keys = [key]
      const sequence = keys.join(" ")
      const handler = table[sequence]
      if (handler) {
        event.preventDefault()
        buffer.current = { keys: [], at: 0 }
        handler(event)
      } else {
        buffer.current = { keys: isPrefix(keys) ? keys : [], at: now }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enabled, timeout])
}

export { isTypingTarget, useKeySequence, type UseKeySequenceOptions }
