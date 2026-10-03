import { CheckCircle2Icon, CircleDotIcon } from "lucide-react"
import { Button } from "sebs7n-ui/button"

// La barra de cada formulario de Configuración: dice si hay cambios sin guardar (con texto y con ícono, no
// solo con color), queda fija abajo a todo el ancho del contenido, deja descartarlos y guarda. Sin cambios, «Guardar» queda apagado: no hay nada que guardar.
export function SettingsSaveBar({ dirty, onDiscard }: { dirty: boolean; onDiscard: () => void }) {
  return (
    <div className="sticky bottom-0 z-10 mt-2 flex flex-wrap items-center gap-3 rounded-surface border border-separator bg-surface px-4 py-3 shadow-sm">
      <p aria-live="polite" className="flex items-center gap-2 text-callout text-label-secondary" role="status">
        {dirty ? <CircleDotIcon aria-hidden="true" className="size-4 text-amber-900" /> : <CheckCircle2Icon aria-hidden="true" className="size-4 text-green-900" />}
        {dirty ? "Cambios sin guardar" : "Todo guardado"}
      </p>
      <div className="flex gap-2 @max-md:w-full @max-md:[&>*]:flex-1 @md:ml-auto">
        <Button disabled={!dirty} onClick={onDiscard} type="button" variant="secondary">
          Descartar
        </Button>
        <Button disabled={!dirty} type="submit">
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}
