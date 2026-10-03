"use client"

import * as React from "react"

/**
 * Un `useState` que se acuerda en `localStorage`. Arranca con `initial` (el servidor no conoce el
 * almacenamiento: leerlo en el primer render desfasaría la hidratación) y adopta lo guardado
 * después de montar, así que hay un render con el valor inicial antes del guardado. Sin
 * almacenamiento (modo privado, bloqueado) anda igual, sin recordar.
 *
 * Si la `key` cambia, adopta lo guardado en la nueva (o `initial` si no hay nada).
 *
 * `valid` descarta lo guardado que ya no sirve (un valor de una versión vieja, JSON roto): sin él,
 * cualquier cosa que alguien escribió en esa clave entraría al estado.
 *
 * ```tsx
 * const [view, setView] = useStoredState("invoices:view", "list", (v): v is "list" | "grid" => v === "list" || v === "grid")
 * ```
 */
function useStoredState<T>(key: string, initial: T, valid: (value: unknown) => value is T) {
  const [value, setValue] = React.useState<T>(initial)
  const validRef = React.useRef(valid)
  validRef.current = valid
  const initialRef = React.useRef(initial)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      // Sin nada guardado en esta clave: el valor inicial. Importa al cambiar de clave (un panel por
      // proyecto): si no, se quedaba con lo de la clave anterior.
      if (raw === null) return setValue(initialRef.current)
      const parsed: unknown = JSON.parse(raw)
      setValue(validRef.current(parsed) ? parsed : initialRef.current)
    } catch {
      // JSON roto o almacenamiento bloqueado: se queda con el valor inicial.
      setValue(initialRef.current)
    }
  }, [key])

  const update = React.useCallback(
    (next: T) => {
      setValue(next)
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // Sin almacenamiento la elección vale hasta recargar.
      }
    },
    [key]
  )

  return [value, update] as const
}

export { useStoredState }
