"use client"

import { useEffect, useRef, useState } from "react"
import { Button, Field, FieldDescription, FieldLabel, Label } from "sebs7n-ui"
import { DropZone, type DropZoneHandle } from "sebs7n-ui/drop-zone"

/**
 * Comprobantes de un pago
 * PDF o imagen, hasta 5 MB y tres archivos. Con `name`, los archivos viajan con el `<form>` como un `<input type="file">`.
 */
export function Attachments() {
  const [sent, setSent] = useState<string | null>(null)
  return (
    <form
      className="flex w-full max-w-md flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        const files = new FormData(event.currentTarget).getAll("receipts") as File[]
        setSent(files.map((file) => file.name).join(", ") || "ningún archivo")
      }}
    >
      <Label htmlFor="receipts">Comprobantes</Label>
      <DropZone accept=".pdf,image/*" id="receipts" maxFiles={3} maxSize={5 * 1024 * 1024} multiple name="receipts" />
      <Button className="self-start" type="submit">
        Enviar
      </Button>
      {sent && <p className="text-callout text-label-secondary">Se enviaría: {sent}</p>}
    </form>
  )
}

/**
 * Con progreso
 * La subida es de la app: acá se simula y `fileProgress` le pasa a cada fila su porcentaje.
 */
export function WithProgress() {
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState(new Map<File, number>())
  useEffect(() => {
    const pending = files.filter((file) => (progress.get(file) ?? 0) < 100)
    if (!pending.length) return
    const timer = setTimeout(() => {
      setProgress((current) => {
        const next = new Map(current)
        for (const file of pending) next.set(file, Math.min(100, (next.get(file) ?? 0) + 20))
        return next
      })
    }, 400)
    return () => clearTimeout(timer)
  }, [files, progress])
  return (
    <DropZone
      aria-label="Facturas para importar"
      className="w-full max-w-md"
      fileProgress={(file) => progress.get(file) ?? 0}
      files={files}
      multiple
      onFilesChange={setFiles}
    />
  )
}

/**
 * La ventana entera
 * `scope="window"`: mientras se arrastra un archivo, toda la ventana es la zona. Probalo arrastrando un PDF sobre la página.
 */
export function WholeWindow() {
  return <DropZone accept=".pdf" aria-label="Factura para convertir" className="w-full max-w-md" scope="window" />
}

/** Los primeros bytes de un PDF de verdad: `%PDF-`. */
async function isPdf(file: File) {
  return (await file.slice(0, 5).text()) === "%PDF-" ? undefined : "no es un PDF: le cambiaron la extensión"
}

/**
 * Validación propia
 * `validate` corre después de tipo y tamaño; puede ser asíncrona. Acá lee los primeros bytes: una imagen renombrada a `.pdf` queda afuera con su error en línea.
 */
export function Validate() {
  return <DropZone accept=".pdf" aria-label="Facturas en PDF" className="w-full max-w-md" multiple validate={isPdf} />
}

/**
 * Compacta
 * `compact`: con un archivo elegido, el recuadro grande pasa a una fila «Elegir otro» y el protagonista es el archivo. El botón de abajo abre el selector con `actionsRef` (`open()`).
 */
export function Compact() {
  const zone = useRef<DropZoneHandle>(null)
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <DropZone accept=".pdf" aria-label="Factura para convertir" actionsRef={zone} compact />
      {/* El `ref` abre el selector desde un botón propio (`open()`) o vuelve al recuadro (`focus()`). */}
      <Button className="self-start" onClick={() => zone.current?.open()} type="button" variant="secondary">
        Elegir PDF…
      </Button>
    </div>
  )
}

/**
 * Dentro de un Field
 * La etiqueta, la ayuda y el error salen del `Field`, como en cualquier otro campo: el recuadro se nombra con el `FieldLabel`.
 */
export function InField() {
  return (
    <Field className="w-full max-w-md">
      <FieldLabel>Comprobante de pago</FieldLabel>
      <DropZone accept=".pdf,image/*" compact maxSize={5 * 1024 * 1024} />
      <FieldDescription>PDF o imagen, hasta 5 MB.</FieldDescription>
    </Field>
  )
}
