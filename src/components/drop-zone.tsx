"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { CircleAlertIcon, FileIcon, UploadIcon, XIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { useFormReset } from "../internal/form-reset.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"
import { List, ListRow } from "./list-row.js"
import { Progress } from "./progress.js"

type DropZoneLabels = NonNullable<Labels["dropZone"]>

/**
 * Los textos por defecto. No están en `defaultLabels` porque el barrel no tenía lugar (ver el tipo
 * `Labels`).
 */
const dropZoneLabels: DropZoneLabels = {
  prompt: "Arrastrá archivos acá o hacé clic para elegirlos",
  drop: "Soltá para agregarlos",
  remove: "Quitar",
  added: "Archivos agregados:",
  removed: "Archivo quitado:",
  invalidType: "no es de un tipo permitido",
  tooLarge: "pesa más de",
  tooMany: "no entra: el máximo es",
  locale: "es-AR",
}

/**
 * Un recuadro para soltar archivos o elegirlos (clic, Enter o Espacio), con la lista de los que
 * se agregaron abajo: miniatura si es imagen, nombre, tamaño, el progreso que pase la app y quitar.
 *
 * No sube nada: la red es de la app. `DropZone` valida tipo, tamaño y cantidad (los errores van en
 * línea, abajo del recuadro, no en un toast) y con `name` deja los archivos en un
 * `<input type="file">` que viaja con el `<form>`, como uno nativo.
 */
type DropZoneProps = Omit<React.ComponentProps<"div">, "children" | "onChange"> & {
  /** Los tipos que acepta, como el `accept` de un `<input type="file">`: `".pdf,image/*"`. */
  accept?: string
  /** Más de un archivo. Sin `multiple`, uno nuevo reemplaza al anterior. */
  multiple?: boolean
  /** El tamaño máximo de cada archivo, en bytes. */
  maxSize?: number
  /** Cuántos archivos como mucho, con `multiple`. */
  maxFiles?: number
  /**
   * El nombre del campo en el `<form>`: los archivos viajan en un `<input type="file">`.
   *
   * Para que el input tenga los archivos de la lista (y no los del último diálogo) hace falta
   * `DataTransfer`, el único modo de armar un `FileList`. Donde no existe (navegadores muy viejos,
   * algunos entornos de test), el input queda como lo dejó el diálogo: ahí, mandá `files` a mano con
   * `onFilesChange` en vez de confiar en el `<form>`.
   */
  name?: string
  /** Los archivos, controlado. Sin `files`, el componente los guarda. */
  files?: File[]
  /** Se llama con la lista entera cada vez que se agrega o se quita uno. */
  onFilesChange?: (files: File[]) => void
  /** El progreso de cada archivo, de 0 a 100 (`null`, indeterminado). Sin valor, no hay barra. */
  fileProgress?: (file: File) => number | null | undefined
  /**
   * Cómo se escribe un tamaño, en la lista y en el error de `maxSize`. Por defecto, en base 1024 con
   * las unidades de `Intl` en el idioma de `labels.locale`: «1,3 MB».
   */
  formatSize?: (bytes: number) => string
  /**
   * Una validación propia por archivo, después de tipo y tamaño y antes del cupo de `maxFiles`: el
   * texto que devuelve es el error de ese archivo («factura.pdf no es un PDF»), en línea como los
   * otros, y el archivo no entra ni se anuncia. Puede ser asíncrona, para leer los bytes («%PDF-»).
   */
  validate?: (file: File) => string | undefined | Promise<string | undefined>
  /** Un error de la app para un archivo («No se pudo subir»), en rojo en su fila. */
  fileError?: (file: File) => React.ReactNode
  /** `"window"`: mientras se arrastra un archivo, toda la ventana es la zona. */
  scope?: "area" | "window"
  disabled?: boolean
  /** Lo que dice el recuadro. Por defecto, el ícono y `labels.prompt`. */
  children?: React.ReactNode
  id?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
  labels?: Partial<DropZoneLabels>
}

/** `accept` como el del input: extensiones, `tipo/*` o el tipo exacto. */
function accepts(file: File, accept: string | undefined): boolean {
  if (!accept) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept.split(",").some((raw) => {
    const rule = raw.trim().toLowerCase()
    if (!rule) return false
    if (rule === "*/*" || rule === "*") return true
    if (rule.startsWith(".")) return name.endsWith(rule)
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1))
    return type === rule
  })
}

const UNITS = ["kilobyte", "megabyte", "gigabyte"] as const

/**
 * En base 1024: los límites se escriben en MiB (`20 * 1024 * 1024`), y en base 1000 ese límite decía
 * «21 MB». La unidad es la que escribe `Intl` («kB», «MB»), aunque el número sea binario.
 */
function formatBytes(bytes: number, locale: string): string {
  if (bytes < 1024) return `${bytes} B`
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit++
  }
  return new Intl.NumberFormat(locale, { style: "unit", unit: UNITS[unit], unitDisplay: "short", maximumFractionDigits: 1 }).format(value)
}

const sameFile = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified
const hasFiles = (event: DragEvent | React.DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes("Files")

/** La miniatura de una imagen. El object URL se revoca al quitar el archivo o desmontar. */
function Thumbnail({ file }: { file: File }) {
  const [src, setSrc] = React.useState<string | null>(null)
  React.useEffect(() => {
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  return src ? <img alt="" className="object-cover" data-slot="drop-zone-thumbnail" src={src} /> : null
}

function DropZone({
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  name,
  files: filesProp,
  onFilesChange,
  fileProgress,
  fileError,
  formatSize,
  validate,
  scope = "area",
  disabled = false,
  children,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  labels: labelsProp,
  className,
  ...props
}: DropZoneProps) {
  const labels = { ...dropZoneLabels, ...useLabels().dropZone, ...defined(labelsProp) }
  const sizeText = (bytes: number) => (formatSize ? formatSize(bytes) : formatBytes(bytes, labels.locale))
  const [ownFiles, setOwnFiles] = React.useState<File[]>([])
  const files = filesProp ?? ownFiles
  const [errors, setErrors] = React.useState<string[]>([])
  const [status, setStatus] = React.useState("")
  const [over, setOver] = React.useState(false)
  const [windowDrag, setWindowDrag] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null)
  const button = React.useRef<HTMLButtonElement>(null)
  const errorsId = React.useId()

  const commit = (next: File[]) => {
    if (filesProp === undefined) setOwnFiles(next)
    onFilesChange?.(next)
  }

  // La lista de ahora, para lo que termina después de un `await` (un `validate` asíncrono): la del render
  // que empezó puede ser vieja si mientras tanto se agregó o se quitó otro.
  const latestFiles = React.useRef(files)
  latestFiles.current = files

  /** El cupo (`maxFiles`, o uno solo), los errores, el anuncio y el aviso: lo que ya pasó las validaciones. */
  const place = (valid: File[], problems: string[]) => {
    const current = latestFiles.current
    let next: File[]
    if (multiple) {
      const room = maxFiles === undefined ? valid.length : Math.max(0, maxFiles - current.length)
      for (const file of valid.slice(room)) problems.push(`${file.name} ${labels.tooMany} ${maxFiles}`)
      next = [...current, ...valid.slice(0, room)]
    } else {
      // Uno solo: entra el primero y los demás se avisan, como con `maxFiles`.
      for (const file of valid.slice(1)) problems.push(`${file.name} ${labels.tooMany} 1`)
      next = valid.length ? [valid[0]!] : current
    }
    setErrors(problems)
    const added = next.filter((file) => !current.includes(file))
    if (added.length) {
      setStatus(`${labels.added} ${added.map((file) => file.name).join(", ")}`)
      commit(next)
    }
  }

  const add = (list: FileList | File[] | null | undefined) => {
    const incoming = Array.from(list ?? [])
    if (!incoming.length) return
    const problems: string[] = []
    const candidates: File[] = []
    const current = latestFiles.current
    for (const file of incoming) {
      if (!accepts(file, accept)) problems.push(`${file.name} ${labels.invalidType}`)
      else if (maxSize !== undefined && file.size > maxSize) problems.push(`${file.name} ${labels.tooLarge} ${sizeText(maxSize)}`)
      else if (!current.some((existing) => sameFile(existing, file)) && !candidates.some((other) => sameFile(other, file))) candidates.push(file)
    }
    // `validate` corre antes del cupo: un archivo que no pasa no le quita el lugar a uno que sí.
    const results = validate ? candidates.map((file) => validate(file)) : []
    const finish = (messages: (string | undefined)[]) => {
      const valid = candidates.filter((file, index) => {
        const message = messages[index]
        if (message) problems.push(`${file.name} ${message}`)
        return !message
      })
      place(valid, problems)
    }
    // Sincrónico si nadie devolvió una promesa: sin `validate` (o con uno sincrónico) todo pasa en el
    // mismo evento, como en 2.0.
    if (results.some((result) => result instanceof Promise)) void Promise.all(results).then(finish)
    else finish(results as (string | undefined)[])
  }

  const remove = (file: File) => {
    commit(files.filter((other) => other !== file))
    setStatus(`${labels.removed} ${file.name}`)
    setErrors([])
    // La fila (y su botón) desaparece: el foco vuelve al recuadro.
    button.current?.focus()
  }

  // `name`: el `<input type="file">` tiene que tener los mismos archivos que la lista, que no son
  // los que eligió en el diálogo (se sumaron arrastrando, se quitaron, se validaron). `DataTransfer`
  // es la única forma de armar un `FileList`.
  const syncInput = (list: readonly File[]) => {
    if (!name || !input.current || typeof DataTransfer !== "function") return
    const transfer = new DataTransfer()
    for (const file of list) transfer.items.add(file)
    input.current.files = transfer.files
  }
  React.useEffect(() => {
    syncInput(files)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `syncInput` solo lee `name` e `input`
  }, [files, name])

  const resetRef = useFormReset(() => {
    if (filesProp === undefined) setOwnFiles([])
    setErrors([])
  })

  // Los listeners de la ventana se ponen una vez por arrastre y llaman siempre al `add` del último
  // render: si se volvieran a poner en cada render, el contador de abajo arrancaría de cero a mitad
  // de camino y la zona se apagaría con el puntero todavía adentro.
  const latestAdd = React.useRef(add)
  React.useEffect(() => {
    latestAdd.current = add
  })

  // `scope="window"`: se escucha la ventana. Un contador y no un booleano porque `dragenter` y
  // `dragleave` llegan de a pares por cada hijo que cruza el puntero.
  React.useEffect(() => {
    if (scope !== "window") return
    if (disabled) {
      // Deshabilitada (convirtiendo, subiendo), la ventana sigue siendo la zona para el navegador: sin
      // esto, un archivo soltado se abre en la pestaña y la app se pierde. No agrega nada: solo avisa
      // con el cursor que ahí no se suelta.
      const block = (event: DragEvent) => {
        if (!hasFiles(event)) return
        event.preventDefault()
        if (event.dataTransfer) event.dataTransfer.dropEffect = "none"
      }
      window.addEventListener("dragover", block)
      window.addEventListener("drop", block)
      return () => {
        window.removeEventListener("dragover", block)
        window.removeEventListener("drop", block)
      }
    }
    let depth = 0
    const enter = (event: DragEvent) => {
      if (!hasFiles(event)) return
      event.preventDefault()
      depth++
      setWindowDrag(true)
    }
    const overWindow = (event: DragEvent) => {
      if (!hasFiles(event)) return
      event.preventDefault()
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy"
    }
    const leave = (event: DragEvent) => {
      if (!hasFiles(event)) return
      depth = Math.max(0, depth - 1)
      if (depth === 0) setWindowDrag(false)
    }
    const drop = (event: DragEvent) => {
      if (!hasFiles(event)) return
      event.preventDefault()
      depth = 0
      setWindowDrag(false)
      latestAdd.current(event.dataTransfer?.files)
    }
    window.addEventListener("dragenter", enter)
    window.addEventListener("dragover", overWindow)
    window.addEventListener("dragleave", leave)
    window.addEventListener("drop", drop)
    return () => {
      window.removeEventListener("dragenter", enter)
      window.removeEventListener("dragover", overWindow)
      window.removeEventListener("dragleave", leave)
      window.removeEventListener("drop", drop)
      // Si se deshabilita (o cambia de scope) a mitad de un arrastre, el `dragleave` que la apagaba
      // ya no llega a nadie.
      setWindowDrag(false)
    }
  }, [scope, disabled])

  // En el recuadro, también un contador: `relatedTarget` viene `null` en Safari y en varios casos
  // de `dragleave`, y la zona se apagaba con el puntero todavía adentro.
  const areaDepth = React.useRef(0)
  React.useEffect(() => {
    if (scope === "area" && !disabled) return
    areaDepth.current = 0
    setOver(false)
  }, [scope, disabled])

  // En `window` la ventana ya maneja todo: el recuadro solo se pinta.
  const areaHandlers =
    scope === "area" && !disabled
      ? {
          onDragEnter: (event: React.DragEvent) => {
            if (!hasFiles(event)) return
            event.preventDefault()
            areaDepth.current++
            setOver(true)
          },
          onDragOver: (event: React.DragEvent) => {
            if (!hasFiles(event)) return
            event.preventDefault()
            event.dataTransfer.dropEffect = "copy"
          },
          onDragLeave: (event: React.DragEvent) => {
            if (!hasFiles(event)) return
            areaDepth.current = Math.max(0, areaDepth.current - 1)
            if (areaDepth.current === 0) setOver(false)
          },
          onDrop: (event: React.DragEvent) => {
            if (!hasFiles(event)) return
            event.preventDefault()
            areaDepth.current = 0
            setOver(false)
            add(event.dataTransfer.files)
          },
        }
      : {}

  const dragging = over || windowDrag
  const describedBy = cn(ariaDescribedby, errors.length > 0 && errorsId) || undefined

  return (
    <div ref={resetRef} data-slot="drop-zone" className={cn("flex flex-col gap-2", className)} {...props}>
      <input
        ref={input}
        type="file"
        accept={accept}
        aria-hidden="true"
        className="sr-only"
        disabled={disabled}
        multiple={multiple}
        name={name}
        tabIndex={-1}
        onChange={(event) => {
          const picked = Array.from(event.currentTarget.files ?? [])
          // Sin `name`, se vacía: elegir el mismo archivo de nuevo vuelve a disparar `change`. Con
          // `name`, se vuelve a llenar con la lista de ahora aunque no entre nada (todo rechazado),
          // así el form no manda lo que eligió el diálogo; si entró algo, el efecto pone la nueva.
          if (!name) event.currentTarget.value = ""
          add(picked)
          syncInput(files)
        }}
      />
      <button
        ref={button}
        type="button"
        id={id}
        aria-describedby={describedBy}
        aria-invalid={errors.length > 0 || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        data-dragging={dragging ? "" : undefined}
        data-slot="drop-zone-area"
        disabled={disabled}
        onClick={() => input.current?.click()}
        {...areaHandlers}
        className={cn(
          "flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-surface border border-separator-strong bg-fill-1 px-6 py-8 text-center outline-none transition-control",
          "hover:bg-fill-2 focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-40",
          // Arrastrando: el anillo y el tinte del acento, como la selección de iCloud Drive.
          "data-dragging:border-brand-700 data-dragging:bg-highlight data-dragging:ring-1 data-dragging:ring-brand-700",
          "aria-invalid:border-red-800"
        )}
      >
        {children ?? (
          <>
            <UploadIcon aria-hidden="true" className="size-6 text-label-secondary in-data-dragging:text-brand-900" />
            <span className="text-callout text-label">{dragging ? labels.drop : labels.prompt}</span>
          </>
        )}
      </button>
      {errors.length > 0 && (
        <div id={errorsId} data-slot="drop-zone-errors" role="alert" className="flex flex-col gap-1 text-footnote text-red-ink">
          {errors.map((error, index) => (
            // Por índice: el mismo archivo rechazado dos veces da dos mensajes iguales.
            <p key={index} className="flex items-start gap-1.5">
              <CircleAlertIcon aria-hidden="true" className="mt-px size-3.5 shrink-0" />
              {error}
            </p>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <List data-slot="drop-zone-files">
          {files.map((file) => {
            const progress = fileProgress?.(file)
            const error = fileError?.(file)
            return (
              <ListRow key={`${file.name}-${file.size}-${file.lastModified}`} icon={file.type.startsWith("image/") ? <Thumbnail file={file} /> : <FileIcon />}>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-body text-label">{file.name}</span>
                  <span className="text-callout text-label-secondary tabular-nums">{sizeText(file.size)}</span>
                  {progress !== undefined && <Progress aria-label={file.name} size="sm" value={progress} />}
                  {error != null && error !== false && <span className="text-callout text-red-ink">{error}</span>}
                </div>
                <Button aria-label={`${labels.remove} ${file.name}`} disabled={disabled} onClick={() => remove(file)} size="icon-sm" type="button" variant="ghost">
                  <XIcon />
                </Button>
              </ListRow>
            )
          })}
        </List>
      )}
      <span className="sr-only" data-slot="drop-zone-status" role="status">
        {status}
      </span>
      {windowDrag &&
        createPortal(
          // La ventana entera es la zona: el mismo anillo y tinte, con el texto en el medio.
          <div
            aria-hidden="true"
            data-slot="drop-zone-overlay"
            className="pointer-events-none fixed inset-3 z-50 flex items-center justify-center rounded-surface bg-highlight ring-2 ring-brand-700"
          >
            <span className="rounded-control bg-surface px-4 py-2 text-callout text-label shadow-menu">{labels.drop}</span>
          </div>,
          document.body
        )}
    </div>
  )
}

export { DropZone, dropZoneLabels, type DropZoneLabels, type DropZoneProps }
