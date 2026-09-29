import type * as React from "react"

/**
 * Varios refs en uno, para un elemento que necesita el ref de la app y los propios (el reset del
 * form, el control del `Field`). Sin esto, un `{...props}` después del `ref` propio pisaba uno de
 * los dos. Devuelve la limpieza de React 19 para los refs función que la traen.
 */
export function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (node) => {
    const cleanups: (() => void)[] = []
    for (const ref of refs) {
      if (typeof ref === "function") {
        const cleanup = ref(node)
        cleanups.push(typeof cleanup === "function" ? cleanup : () => ref(null))
      } else if (ref) {
        ref.current = node
        cleanups.push(() => {
          ref.current = null
        })
      }
    }
    return () => {
      for (const cleanup of cleanups) cleanup()
    }
  }
}
