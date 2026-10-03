"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "sebs7n-ui/dialog"
import { DropZone } from "sebs7n-ui/drop-zone"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Textarea } from "sebs7n-ui/textarea"
import { toast } from "sonner"

import type { Environment } from "../_data/mock"
import { parseDotenv, type DotenvResult } from "../_state/mutations"
import { ENV_LABEL } from "./env-var-dialog"

interface ImportEnvDialogProps {
  open: boolean
  environment: Environment
  onClose: () => void
  onImport: (entries: DotenvResult["entries"]) => void
}

const MAX_BYTES = 64 * 1024

// Importar un `.env`: se arrastra el archivo (o se elige) y su contenido pasa al cuadro de texto, donde se
// revisa antes de importar; también se puede pegar a mano. Se pide recién al abrirlo.
export default function ImportEnvDialog({ open, environment, onClose, onImport }: ImportEnvDialogProps) {
  const [text, setText] = useState("")
  const [files, setFiles] = useState<File[]>([])

  const read = async (next: File[]) => {
    setFiles(next)
    const file = next[0]
    if (file) setText(await file.text())
  }

  return (
    <Dialog onOpenChange={(value) => !value && onClose()} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar un .env</DialogTitle>
          <DialogDescription>A {ENV_LABEL[environment]}. Las que ya existen se actualizan y las nuevas se suman.</DialogDescription>
        </DialogHeader>
        <Form
          onFormSubmit={() => {
            const { entries, invalid } = parseDotenv(text)
            if (entries.length === 0) {
              toast.error("No encontré ninguna variable con la forma CLAVE=valor.")
              return
            }
            if (invalid > 0) toast.warning(`${invalid} ${invalid === 1 ? "renglón ignorado" : "renglones ignorados"}.`)
            setText("")
            setFiles([])
            onImport(entries)
          }}
        >
          <DropZone
            accept=".env,.txt,text/plain"
            aria-label="Archivo .env"
            compact={files.length > 0}
            files={files}
            labels={{ prompt: "Arrastrá un archivo .env acá o hacé clic para elegirlo" }}
            maxSize={MAX_BYTES}
            onFilesChange={(next) => void read(next)}
          />
          <Field name="text">
            <FieldLabel required>Contenido</FieldLabel>
            <Textarea
              className="min-h-32 font-mono"
              onChange={(event) => setText(event.target.value)}
              placeholder={"# comentarios y renglones vacíos se ignoran\nAPI_BASE_URL=https://api.acme.dev\nSTRIPE_SECRET_KEY=tu_clave_secreta"}
              required
              value={text}
            />
            <FieldDescription>También podés pegarlo a mano.</FieldDescription>
            <FieldError match="valueMissing">Pegá al menos una variable</FieldError>
          </Field>
          <DialogFooter>
            <Button onClick={onClose} type="button" variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">Importar</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
