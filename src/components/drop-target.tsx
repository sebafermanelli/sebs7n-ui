"use client"

import * as React from "react"
import { CircleAlertIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { accepts, dropZoneLabels, formatBytes, hasFiles, type DropZoneLabels } from "../internal/files.js"
import { useLabels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"

/** Los textos de `DropTarget`: los mismos que los de `DropZone` (`labels.dropZone`), los que usa. */
type DropTargetLabels = Pick<DropZoneLabels, "drop" | "added" | "invalidType" | "tooLarge" | "tooMany" | "locale">

type DropTargetProps = Omit<React.ComponentProps<"div">, "onDrop"> & {
  /**
   * Los archivos que pasaron `accept`, `maxSize` y `validate` (uno solo sin `multiple`). Lo usual: abrir
   * el formulario con el archivo ya puesto.
   */
  onDrop: (files: File[]) => void
  /** Los tipos que acepta, como el `accept` de un `<input type="file">`: `".pdf,image/*"`. */
  accept?: string
  /** Más de un archivo por vez. Sin `multiple`, entra el primero y los demás se avisan. */
  multiple?: boolean
  /** El tamaño máximo de cada archivo, en bytes. */
  maxSize?: number
  /**
   * Una validación propia por archivo, como la de `DropZone`: el texto que devuelve es su error. Puede
   * ser asíncrona; mientras tanto la zona lleva `aria-busy`, y sin `multiple` gana el último soltado.
   */
  validate?: (file: File) => string | undefined | Promise<string | undefined>
  /** Cómo se escribe el tamaño en el error de `maxSize`. Por defecto, en base 1024 con `Intl`. */
  formatSize?: (bytes: number) => string
  disabled?: boolean
  labels?: Partial<DropTargetLabels>
}

/**
 * Hace que cualquier contenido —una sección colapsada, una card, una fila— reciba archivos soltados
 * encima, sin volverse un recuadro de subida: lo de adentro sigue siendo lo que era, con sus botones y
 * su Tab. Mientras se arrastra un archivo encima se pinta el mismo anillo y tinte de `DropZone`, con
 * «Soltá para agregarlos»; al soltar, valida como `DropZone` (`accept`, `maxSize`, `validate`), avisa
 * los rechazos en línea abajo del contenido y llama a `onDrop` con los que pasaron, que la app usa para
 * abrir el formulario con el archivo.
 *
 * ```tsx
 * <DropTarget accept=".pdf" onDrop={([file]) => openInvoiceForm(file)}>
 *   <Card>…<Button onClick={() => openInvoiceForm()}>Agregar factura</Button></Card>
 * </DropTarget>
 * ```
 *
 * **Arrastrar es un atajo, no el único camino** (WCAG 2.5.7): el contenido tiene que traer su botón
 * para elegir el archivo (el formulario con su `DropZone`). No guarda archivos ni tiene `name`: para
 * eso está `DropZone`. Lo que toma algo de adentro (otra `DropTarget`, un `DropZone`, un
 * `<input type="file">`) es de eso: la de afuera solo se apaga. Los rechazos quedan hasta el próximo
 * arrastre o soltar.
 */
function DropTarget({
  onDrop,
  accept,
  multiple = false,
  maxSize,
  validate,
  formatSize,
  disabled = false,
  labels: labelsProp,
  className,
  children,
  ...props
}: DropTargetProps) {
  const labels = { ...dropZoneLabels, ...useLabels().dropZone, ...defined(labelsProp) }
  const [over, setOver] = React.useState(false)
  const [problems, setProblems] = React.useState<string[]>([])
  const [status, setStatus] = React.useState("")
  const [validating, setValidating] = React.useState(0)
  // Un contador y no un booleano: `dragenter` y `dragleave` llegan de a pares por cada hijo que cruza
  // el puntero, y con hijos interactivos adentro son muchos.
  const depth = React.useRef(0)
  // Cada soltar lleva un número: sin `multiple`, uno que termina de validar después de otro más nuevo
  // se descarta.
  const generation = React.useRef(0)
  // Una `validate` asíncrona que termina después de desmontar no llama a `onDrop` ni toca el estado.
  const mounted = React.useRef(true)
  const announceTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      clearTimeout(announceTimer.current)
    }
  }, [])

  const reset = () => {
    depth.current = 0
    setOver(false)
  }

  React.useEffect(() => {
    if (disabled) reset()
  }, [disabled])

  // Mientras está prendida, cualquier fin del arrastre la apaga: un soltar que tomó otro (una zona de
  // adentro, otra de la página) o que cayó afuera, y el `dragend` de un arrastre cancelado. Sin esto el
  // contador se desbalancea —el `dragenter` subió, el `dragleave` no llega— y el anillo queda pegado.
  // En captura, para enterarse aunque alguien corte la propagación.
  React.useEffect(() => {
    if (!over) return
    window.addEventListener("drop", reset, true)
    window.addEventListener("dragend", reset, true)
    return () => {
      window.removeEventListener("drop", reset, true)
      window.removeEventListener("dragend", reset, true)
    }
  }, [over])

  const receive = (list: FileList | null | undefined) => {
    const incoming = Array.from(list ?? [])
    if (!incoming.length) return
    const batch = ++generation.current
    const errors: string[] = []
    const candidates = incoming.filter((file) => {
      if (!accepts(file, accept)) errors.push(`${file.name} ${labels.invalidType}`)
      else if (maxSize !== undefined && file.size > maxSize)
        errors.push(`${file.name} ${labels.tooLarge} ${formatSize ? formatSize(maxSize) : formatBytes(maxSize, labels.locale)}`)
      else return true
      return false
    })
    const finish = (messages: (string | undefined)[]) => {
      const valid = candidates.filter((file, index) => {
        if (messages[index]) errors.push(`${file.name} ${messages[index]}`)
        return !messages[index]
      })
      if (!multiple) for (const file of valid.slice(1)) errors.push(`${file.name} ${labels.tooMany} 1`)
      const accepted = multiple ? valid : valid.slice(0, 1)
      if (!mounted.current || (!multiple && batch !== generation.current)) return
      setProblems(errors)
      if (!accepted.length) return
      // Vaciar y recién después escribir: soltar el mismo archivo dos veces deja el mismo texto, el DOM
      // no cambia y el lector no lo repite.
      const message = `${labels.added} ${accepted.map((file) => file.name).join(", ")}`
      setStatus("")
      clearTimeout(announceTimer.current)
      announceTimer.current = setTimeout(() => setStatus(message), 100)
      onDrop(accepted)
    }
    const results = candidates.map((file) => {
      if (!validate) return undefined
      try {
        const result = validate(file)
        return result instanceof Promise ? result.catch(errorMessage) : result
      } catch (error) {
        return errorMessage(error)
      }
    })
    if (!results.some((result) => result instanceof Promise)) return finish(results as (string | undefined)[])
    setValidating((count) => count + 1)
    void Promise.all(results).then((messages) => {
      if (!mounted.current) return
      setValidating((count) => count - 1)
      finish(messages)
    })
  }

  const handlers = disabled
    ? {}
    : {
        onDragEnter: (event: React.DragEvent) => {
          if (!hasFiles(event)) return
          event.preventDefault()
          depth.current++
          setOver(true)
          // Los rechazos del soltar anterior se van con el próximo intento.
          setProblems([])
        },
        onDragOver: (event: React.DragEvent) => {
          // Si ya lo tomó algo de adentro (un `DropZone`, otra `DropTarget`, un `<input type="file">`),
          // es suyo: ni el `preventDefault` ni el `dropEffect` son de esta.
          if (!hasFiles(event) || event.defaultPrevented || isFileInput(event.target)) return
          event.preventDefault()
          event.dataTransfer.dropEffect = "copy"
        },
        onDragLeave: (event: React.DragEvent) => {
          if (!hasFiles(event)) return
          depth.current = Math.max(0, depth.current - 1)
          if (depth.current === 0) setOver(false)
        },
        onDrop: (event: React.DragEvent) => {
          if (!hasFiles(event)) return
          reset()
          // Sin `stopPropagation`: el soltar sube para que las de afuera se apaguen. El `preventDefault`
          // es la marca de «ya lo tomó alguien» que miran una `DropTarget` de afuera y la ventana de un
          // `DropZone scope="window"`. Un `<input type="file">` nativo recibe su archivo solo.
          if (event.defaultPrevented || isFileInput(event.target)) return
          event.preventDefault()
          receive(event.dataTransfer.files)
        },
      }

  return (
    <div
      {...props}
      {...handlers}
      aria-busy={validating > 0 || undefined}
      data-dragging={over ? "" : undefined}
      data-slot="drop-target"
      className={cn("relative", className)}
    >
      {children}
      {over && (
        // Encima del contenido, sin taparlo (el tinte es translúcido) y sin recibir el puntero: el
        // arrastre sigue viendo a los hijos, que es lo que hace andar el contador.
        <div
          aria-hidden="true"
          data-slot="drop-target-overlay"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-surface bg-highlight ring-2 ring-brand-700"
        >
          <span className="rounded-control bg-surface px-4 py-2 text-callout text-label shadow-menu">{labels.drop}</span>
        </div>
      )}
      {problems.length > 0 && (
        <div data-slot="drop-target-errors" role="alert" className="mt-2 flex flex-col gap-1 text-footnote text-red-ink">
          {problems.map((problem, index) => (
            <p key={index} className="flex items-start gap-1.5">
              <CircleAlertIcon aria-hidden="true" className="mt-px size-3.5 shrink-0" />
              {problem}
            </p>
          ))}
        </div>
      )}
      <span className="sr-only" data-slot="drop-target-status" role="status">
        {status}
      </span>
    </div>
  )
}

/** Un `<input type="file">` habilitado, que recibe el archivo soltado por su cuenta. */
function isFileInput(target: EventTarget): boolean {
  return target instanceof HTMLInputElement && target.type === "file" && !target.disabled
}

/** El texto de un rechazo de `validate`: el `message` del error, o el valor como texto. */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export { DropTarget, type DropTargetLabels, type DropTargetProps }
