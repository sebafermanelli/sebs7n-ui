"use client"

import * as React from "react"

/**
 * Aviso de desarrollo: un diálogo, hoja o drawer que se monta sin nombre accesible.
 *
 * Base UI conecta el `aria-labelledby` del popup al `id` del `DialogTitle` (o
 * del `SheetTitle` / `DrawerTitle`) cuando ese título existe. Si no existe, el
 * popup se abre y el lector de pantalla anuncia «diálogo» y nada más: el
 * usuario queda adentro de una ventana modal sin saber de qué es. Mirando la
 * pantalla no se nota, porque el título casi siempre está escrito pero como un
 * `<h2>` suelto o un `<p>` en negrita, no como `DialogTitle`.
 *
 * No hay tipo que pueda exigirlo —el título es un hijo, y TypeScript no mira
 * adentro de `children`—, así que la verificación es en runtime y solo en
 * desarrollo: en producción no cuesta ni un `if`.
 *
 * Avisa una vez por componente y no una por apertura: un diálogo que se abre y
 * se cierra veinte veces no tiene que llenar la consola veinte veces.
 */
const yaAvisados = new Set<string>()

/**
 * `process.env.NODE_ENV` escrito literal es lo que los bundlers reemplazan por una constante, y por
 * eso en producción el bloque entero se cae del bundle. Escrito por `globalThis` no lo reemplazarían
 * y el aviso viajaría a producción.
 *
 * La declaración local es porque el tsconfig del build no trae los tipos de Node —es una librería de
 * navegador, no tiene por qué conocerlos— y sin ella `tsc` no compila esta línea.
 */
declare const process: { env: { NODE_ENV?: string } } | undefined

const esDesarrollo = () => typeof process !== "undefined" && process.env.NODE_ENV !== "production"

/**
 * La verificación va adentro del `ref` y no en un `useEffect`: el componente que lo usa se monta
 * apenas se renderiza el árbol, pero el popup recién existe cuando el diálogo se abre. Un efecto
 * correría con el nodo todavía en `null` y no volvería a correr nunca.
 */
export function useAvisoDeNombre<T extends HTMLElement>(
  componente: string,
  titulo: string,
  refDelLlamador?: React.Ref<T> | null
): React.RefCallback<T> {
  return React.useCallback(
    (el: T | null) => {
      if (typeof refDelLlamador === "function") refDelLlamador(el)
      else if (refDelLlamador) (refDelLlamador as React.RefObject<T | null>).current = el

      if (!el || !esDesarrollo() || yaAvisados.has(componente)) return
      // Un frame de espera: Base UI escribe el `aria-labelledby` en un efecto, y sin esperar el
      // aviso saldría siempre, incluso con el título puesto.
      requestAnimationFrame(() => {
        if (!el.isConnected) return
        if (el.getAttribute("aria-labelledby") ?? el.getAttribute("aria-label")) return
        yaAvisados.add(componente)
        console.warn(
          `[sebs7n-ui] <${componente}> se montó sin nombre accesible. Un lector de pantalla lo anuncia ` +
            `«diálogo» y nada más. Poné un <${titulo}> adentro (podés esconderlo con className="sr-only" ` +
            `si el diseño no lleva título visible) o pasale aria-label al <${componente}>.`
        )
      })
    },
    [componente, titulo, refDelLlamador]
  )
}
