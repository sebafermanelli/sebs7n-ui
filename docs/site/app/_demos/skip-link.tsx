import { SkipLink } from "sebs7n-ui/skip-link"

/**
 * El primer Tab
 * Oculto hasta recibir el foco: hacé Tab desde acá y aparece arriba a la izquierda de este recuadro. Apunta al `id` del contenido.
 */
export function Basic() {
  return (
    <div className="relative w-full rounded-surface border border-separator p-4">
      <SkipLink className="focus-visible:absolute" href="#skip-link-demo-main" />
      <p className="text-callout text-label-secondary">Enfocá este recuadro y apretá Tab.</p>
      <main className="mt-3 text-body text-label" id="skip-link-demo-main" tabIndex={-1}>
        Contenido principal
      </main>
    </div>
  )
}
