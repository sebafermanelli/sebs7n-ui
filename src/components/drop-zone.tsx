"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { CircleAlertIcon, FileIcon, UploadIcon, XIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { useFieldControl } from "../internal/field-control.js"
import { accepts, dropZoneLabels, formatBytes, hasFiles, sameFile, type DropZoneLabels } from "../internal/files.js"
import { useFormReset } from "../internal/form-reset.js"
import { mergeRefs } from "../internal/merge-refs.js"
import { useLabels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"
import { List, ListRow } from "./list-row.js"
import { Progress } from "./progress.js"

/**
 * Un recuadro para soltar archivos o elegirlos (clic, Enter o Espacio), con la lista de los que
 * se agregaron abajo: miniatura si es imagen, nombre, tamaño, el progreso que pase la app y quitar.
 *
 * No sube nada: la red es de la app. `DropZone` valida tipo, tamaño y cantidad (los errores van en
 * línea, abajo del recuadro, no en un toast) y con `name` deja los archivos en un
 * `<input type="file">` que viaja con el `<form>`, como uno nativo.
 */
/** Lo que da `actionsRef` de `DropZone`: abrir el selector y enfocar el recuadro desde afuera. */
type DropZoneHandle = {
  /** Abre el selector de archivos del sistema, como un clic en el recuadro. Deshabilitada, no hace nada. */
  open: () => void
  /** Enfoca el recuadro. */
  focus: () => void
}

type DropZoneProps = Omit<React.ComponentProps<"div">, "children" | "onChange"> & {
  /**
   * `open()` y `focus()`, para un botón «Elegir archivo» propio o para volver al recuadro después de
   * un paso. Es `actionsRef` y no `ref`, como en Base UI: el `ref` sigue siendo el `div` de afuera.
   */
  actionsRef?: React.Ref<DropZoneHandle>
  /** Los tipos que acepta, como el `accept` de un `<input type="file">`: `".pdf,image/*"`. */
  accept?: string
  /**
   * Más de un archivo. Sin `multiple`, uno nuevo reemplaza al anterior y gana la última tanda: si una
   * elección (o un soltar) termina de validar después de otra más nueva, se descarta.
   */
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
   * otros, y el archivo no entra ni se anuncia. Puede ser asíncrona, para leer los bytes («%PDF-»):
   * mientras tanto el recuadro lleva `aria-busy`, y si la promesa se rechaza, el archivo queda afuera
   * con el mensaje del error. Sin `multiple`, si llega otro archivo antes de que termine, gana el último.
   */
  validate?: (file: File) => string | undefined | Promise<string | undefined>
  /** Un error de la app para un archivo («No se pudo subir»), en rojo en su fila. */
  fileError?: (file: File) => React.ReactNode
  /**
   * Con archivos, el recuadro grande pasa a una fila chica: «Elegir otro» (o «Agregar más» con
   * `multiple`). Para una pantalla donde el archivo es el protagonista y el recuadro ya cumplió.
   */
  compact?: boolean
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
  compact = false,
  scope = "area",
  disabled: disabledProp = false,
  children,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  labels: labelsProp,
  className,
  ref,
  actionsRef,
  ...props
}: DropZoneProps) {
  const labels = { ...dropZoneLabels, ...useLabels().dropZone, ...defined(labelsProp) }
  // Dentro de un `Field`, como los controles de Base UI: el recuadro se registra como el control del
  // campo (el `FieldLabel` lo nombra), suma la ayuda y el error del campo a su descripción y toma su
  // `disabled` e `invalid`. Son los hooks que Base UI exporta como `internals` para eso; afuera de un
  // `Field` devuelven el contexto vacío y todo queda como en 2.0.
  const button = React.useRef<HTMLButtonElement>(null)
  const [ownFiles, setOwnFiles] = React.useState<File[]>([])
  const files = filesProp ?? ownFiles
  const field = useFieldControl({ id, name, value: files, filled: files.length > 0, disabled: disabledProp, controlRef: button })
  const disabled = field.disabled
  const fieldName = field.name
  const sizeText = (bytes: number) => (formatSize ? formatSize(bytes) : formatBytes(bytes, labels.locale))
  // Los errores por tanda: dos tandas que se validan a la vez (un `validate` asíncrono) suman los
  // suyos en vez de pisarse. Una tanda nueva borra los de las que ya terminaron.
  const [errorBatches, setErrorBatches] = React.useState<{ batch: number; messages: string[] }[]>([])
  const errors = errorBatches.flatMap((entry) => entry.messages)
  const [validating, setValidating] = React.useState(0)
  const [status, setStatus] = React.useState("")
  const [over, setOver] = React.useState(false)
  const [windowDrag, setWindowDrag] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null)
  const errorsId = React.useId()
  const disabledRef = React.useRef(disabled)
  disabledRef.current = disabled
  React.useImperativeHandle(
    actionsRef,
    () => ({
      open: () => {
        if (!disabledRef.current) input.current?.click()
      },
      focus: () => button.current?.focus(),
    }),
    []
  )

  // La lista de ahora, para lo que termina después de un `await`: la del render que empezó puede ser
  // vieja. Se actualiza en cada render y también en `commit`, porque dos tandas pueden terminar en el
  // mismo tick sin un render en el medio.
  const latestFiles = React.useRef(files)
  latestFiles.current = files
  const commit = (next: File[]) => {
    latestFiles.current = next
    if (filesProp === undefined) setOwnFiles(next)
    onFilesChange?.(next)
  }

  // Cada tanda lleva un número. Sin `multiple`, una tanda que termina después de una más nueva se
  // descarta: el último archivo elegido es el que queda. `pending` son los archivos que se están
  // validando, para no aceptar dos veces el mismo si se suelta de nuevo mientras tanto.
  const generation = React.useRef(0)
  const pending = React.useRef<{ batch: number; files: File[] }[]>([])

  const add = (list: FileList | File[] | null | undefined) => {
    const incoming = Array.from(list ?? [])
    if (!incoming.length) return
    const batch = ++generation.current
    const problems: string[] = []
    const candidates: File[] = []
    const current = latestFiles.current
    const inFlight = pending.current.flatMap((entry) => entry.files)
    const seen = (file: File) => [...current, ...inFlight, ...candidates].some((other) => sameFile(other, file))
    for (const file of incoming) {
      if (!accepts(file, accept)) problems.push(`${file.name} ${labels.invalidType}`)
      else if (maxSize !== undefined && file.size > maxSize) problems.push(`${file.name} ${labels.tooLarge} ${sizeText(maxSize)}`)
      else if (!seen(file)) candidates.push(file)
    }
    const running = new Set(pending.current.map((entry) => entry.batch))
    setErrorBatches((previous) => previous.filter((entry) => running.has(entry.batch)))

    /** El cupo (`maxFiles`, o uno solo), los errores, el anuncio: lo que ya pasó las validaciones. */
    const place = (valid: File[]) => {
      const now = latestFiles.current
      let next: File[]
      if (multiple) {
        const room = maxFiles === undefined ? valid.length : Math.max(0, maxFiles - now.length)
        for (const file of valid.slice(room)) problems.push(`${file.name} ${labels.tooMany} ${maxFiles}`)
        next = [...now, ...valid.slice(0, room)]
      } else {
        // Uno solo: entra el primero y los demás se avisan, como con `maxFiles`. Si mientras tanto
        // empezó otra tanda, esta ya no manda.
        for (const file of valid.slice(1)) problems.push(`${file.name} ${labels.tooMany} 1`)
        next = valid.length && batch === generation.current ? [valid[0]!] : now
      }
      setErrorBatches((previous) => [...previous.filter((entry) => entry.batch !== batch), { batch, messages: problems }])
      const added = next.filter((file) => !now.includes(file))
      if (added.length) {
        setStatus(`${labels.added} ${added.map((file) => file.name).join(", ")}`)
        commit(next)
      }
    }

    // `validate` corre antes del cupo: un archivo que no pasa no le quita el lugar a uno que sí. Un
    // `validate` que tira o rechaza deja ese archivo afuera con el mensaje del error.
    const results = candidates.map((file) => {
      if (!validate) return undefined
      try {
        const result = validate(file)
        return result instanceof Promise ? result.catch(errorMessage) : result
      } catch (error) {
        return errorMessage(error)
      }
    })
    const finish = (messages: (string | undefined)[]) => {
      const valid = candidates.filter((file, index) => {
        const message = messages[index]
        if (message) problems.push(`${file.name} ${message}`)
        return !message
      })
      place(valid)
    }
    // Sincrónico si nadie devolvió una promesa: sin `validate` (o con uno sincrónico) todo pasa en el
    // mismo evento, como en 2.0.
    if (!results.some((result) => result instanceof Promise)) {
      finish(results as (string | undefined)[])
      return
    }
    pending.current = [...pending.current, { batch, files: candidates }]
    setValidating((count) => count + 1)
    void Promise.all(results).then((messages) => {
      pending.current = pending.current.filter((entry) => entry.batch !== batch)
      setValidating((count) => count - 1)
      finish(messages)
    })
  }

  const remove = (file: File) => {
    commit(files.filter((other) => other !== file))
    setStatus(`${labels.removed} ${file.name}`)
    setErrorBatches([])
    // La fila (y su botón) desaparece: el foco vuelve al recuadro.
    button.current?.focus()
  }

  // `name`: el `<input type="file">` tiene que tener los mismos archivos que la lista, que no son
  // los que eligió en el diálogo (se sumaron arrastrando, se quitaron, se validaron). `DataTransfer`
  // es la única forma de armar un `FileList`.
  const syncInput = (list: readonly File[]) => {
    if (!fieldName || !input.current || typeof DataTransfer !== "function") return
    const transfer = new DataTransfer()
    for (const file of list) transfer.items.add(file)
    input.current.files = transfer.files
  }
  React.useEffect(() => {
    syncInput(files)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `syncInput` solo lee `name` e `input`
  }, [files, fieldName])

  const resetRef = useFormReset(() => {
    if (filesProp === undefined) setOwnFiles([])
    setErrorBatches([])
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
      // Solo si nadie más lo tomó: otra zona o un editor que acepta archivos ya hizo `preventDefault`
      // (y eligió su `dropEffect`) antes de que el evento suba a la ventana.
      const block = (event: DragEvent) => {
        if (event.defaultPrevented || !hasFiles(event)) return
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
  // Con archivos, el recuadro grande ya cumplió: queda una fila para cambiar o sumar. Es el mismo botón
  // (el foco no se pierde); sus `children` son para el recuadro grande.
  const small = compact && files.length > 0
  const describedBy = cn(ariaDescribedby, field.messageIds.join(" "), errors.length > 0 && errorsId) || undefined
  const smallText = dragging ? labels.drop : multiple ? labels.addMore : labels.replace
  const smallTextId = React.useId()
  // 2.5.3: en la fila chica, el nombre empieza con el texto visible («Elegir otro») y sigue con el del
  // campo, así quien usa control por voz puede decir lo que ve.
  const accessibleName = small
    ? ariaLabel
      ? { "aria-label": `${smallText}, ${ariaLabel}`, "aria-labelledby": ariaLabelledby }
      : { "aria-label": undefined, "aria-labelledby": cn(smallTextId, ariaLabelledby ?? field.labelId) || undefined }
    : { "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby }
  const rootRef = React.useMemo(() => mergeRefs(resetRef, ref), [resetRef, ref])
  const inputRef = React.useMemo(() => mergeRefs(input, field.inputRef), [field.inputRef])

  return (
    <div {...props} ref={rootRef} data-slot="drop-zone" className={cn("flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        aria-hidden="true"
        className="sr-only"
        disabled={disabled}
        multiple={multiple}
        name={fieldName}
        tabIndex={-1}
        onChange={(event) => {
          const picked = Array.from(event.currentTarget.files ?? [])
          // Sin `name`, se vacía: elegir el mismo archivo de nuevo vuelve a disparar `change`. Con
          // `name`, se vuelve a llenar con la lista de ahora aunque no entre nada (todo rechazado),
          // así el form no manda lo que eligió el diálogo; si entró algo, el efecto pone la nueva.
          if (!fieldName) event.currentTarget.value = ""
          add(picked)
          syncInput(files)
        }}
      />
      <button
        ref={button}
        type="button"
        id={field.id}
        aria-describedby={describedBy}
        aria-busy={validating > 0 || undefined}
        aria-invalid={errors.length > 0 || field.invalid || undefined}
        {...accessibleName}
        data-compact={small ? "" : undefined}
        data-dragging={dragging ? "" : undefined}
        data-slot="drop-zone-area"
        disabled={disabled}
        onBlur={field.onBlur}
        onClick={() => input.current?.click()}
        onFocus={field.onFocus}
        {...areaHandlers}
        className={cn(
          "flex w-full cursor-pointer items-center justify-center border border-separator-strong bg-fill-1 text-center outline-none transition-control",
          small ? "min-h-9 gap-1.5 rounded-field px-3 py-1.5" : "min-h-32 flex-col gap-2 rounded-surface px-6 py-8",
          "hover:bg-fill-2 focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-40",
          // Arrastrando: el anillo y el tinte del acento, como la selección de iCloud Drive.
          "data-dragging:border-brand-700 data-dragging:bg-highlight data-dragging:ring-1 data-dragging:ring-brand-700",
          "aria-invalid:border-red-800"
        )}
      >
        {small ? (
          <>
            <UploadIcon aria-hidden="true" className="size-4 text-label-secondary in-data-dragging:text-brand-900" />
            <span className="text-callout text-label" id={smallTextId}>
              {smallText}
            </span>
          </>
        ) : (
          (children ?? (
            <>
              <UploadIcon aria-hidden="true" className="size-6 text-label-secondary in-data-dragging:text-brand-900" />
              <span className="text-callout text-label">{dragging ? labels.drop : labels.prompt}</span>
            </>
          ))
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

/** El texto de un rechazo de `validate`: el `message` del error, o el valor como texto. */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export { DropZone, dropZoneLabels, type DropZoneHandle, type DropZoneLabels, type DropZoneProps }
