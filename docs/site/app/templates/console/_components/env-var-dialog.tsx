"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "sebs7n-ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { Switch } from "sebs7n-ui/switch"
import { toast } from "sonner"

import type { EnvVar, Environment } from "../_data/mock"
import { isEnvKey } from "../_state/mutations"

export const ENV_LABEL: Record<Environment, string> = { production: "Producción", staging: "Staging" }

interface EnvVarDialogProps {
  /** Una variable existente para editarla; `null` para una nueva; `undefined` cerrado. */
  editing: EnvVar | null | undefined
  environment: Environment
  existingKeys: string[]
  onClose: () => void
  onSave: (values: { key: string; value: string; secret: boolean }, id?: string) => void
}

export function EnvVarDialog({ editing, environment, existingKeys, onClose, onSave }: EnvVarDialogProps) {
  const [secret, setSecret] = useState(editing?.secret ?? false)
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={editing !== undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? `Editar ${editing.key}` : "Nueva variable"}</DialogTitle>
          <DialogDescription>Entorno: {ENV_LABEL[environment]}. Los servicios la leen al próximo despliegue.</DialogDescription>
        </DialogHeader>
        {/* `key` remonta el formulario al cambiar de variable: así no queda escrito lo de la anterior. */}
        <Form
          key={editing?.id ?? "new"}
          onFormSubmit={(values) => {
            const key = String(values.key).trim()
            if (!isEnvKey(key)) return
            if (!editing && existingKeys.includes(key)) {
              toast.error(`${key} ya existe en ${ENV_LABEL[environment]}.`)
              return
            }
            onSave({ key, value: String(values.value), secret }, editing?.id)
          }}
        >
          <Field name="key">
            <FieldLabel required>Nombre</FieldLabel>
            <Input defaultValue={editing?.key ?? ""} placeholder="Ej. API_BASE_URL" readOnly={Boolean(editing)} required />
            <FieldDescription>Letras, números y guiones bajos; no empieza con un número.</FieldDescription>
            <FieldError match="valueMissing">Falta el nombre</FieldError>
          </Field>
          <Field name="value">
            <FieldLabel required>Valor</FieldLabel>
            <Input defaultValue={editing?.value ?? ""} required />
            <FieldError match="valueMissing">Falta el valor</FieldError>
          </Field>
          <label className="flex items-center gap-2 text-callout text-label">
            <Switch checked={secret} onCheckedChange={setSecret} />
            Es un secreto (queda oculto en la lista)
          </label>
          <DialogFooter>
            <Button onClick={onClose} type="button" variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">{editing ? "Guardar" : "Agregar variable"}</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
