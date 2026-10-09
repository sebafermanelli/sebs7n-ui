// Fundido del tema entero con View Transitions. Sin "use client" y sin dependencias: corre en
// el navegador y, en el servidor, aplica directo. El CSS vive en `theme.css`
// (`::view-transition-old(root)` / `new(root)`, solo opacidad).

type ViewTransitionLike = { finished: Promise<unknown> }
type DocumentWithVT = Document & { startViewTransition?: (cb: () => void | Promise<void>) => ViewTransitionLike }

const ATTRIBUTE = "data-theme-transition"

/**
 * Corre `apply` (el cambio de tema) dentro de un fundido. Sin `document.startViewTransition` o
 * con `prefers-reduced-motion: reduce` lo aplica directo. `apply` corre siempre, una sola vez.
 * Debe cambiar el DOM de forma síncrona (con React, envolvelo en `flushSync`).
 */
export function startThemeTransition(apply: () => void): void {
  if (typeof document === "undefined") return apply()
  const doc = document as DocumentWithVT
  let reduced = false
  try {
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  } catch {}
  if (reduced || typeof doc.startViewTransition !== "function") return apply()

  const root = doc.documentElement
  let ran = false
  const run = () => {
    ran = true
    apply()
  }
  try {
    root.setAttribute(ATTRIBUTE, "")
    const transition = doc.startViewTransition(run)
    const clear = () => root.removeAttribute(ATTRIBUTE)
    transition.finished.then(clear, clear)
  } catch {
    root.removeAttribute(ATTRIBUTE)
    if (!ran) apply()
  }
}
