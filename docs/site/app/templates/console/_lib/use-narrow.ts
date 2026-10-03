"use client"

import { useEffect, useState } from "react"

/** Si la ventana es angosta (teléfono). Arranca en `false`, que es lo que sabe el servidor, y se corrige al montar. */
export function useNarrow(query = "(max-width: 767px)") {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setNarrow(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [query])
  return narrow
}
