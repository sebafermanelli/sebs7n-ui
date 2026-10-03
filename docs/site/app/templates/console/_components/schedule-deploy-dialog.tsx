"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { DateTimePicker } from "sebs7n-ui/date-time-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "sebs7n-ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { toast } from "sonner"

import { NOW_ISO } from "../_data/derive"
import { scheduleError, toLocalIso } from "../_state/mutations"
import { useProject } from "../_state/project-context"

const NOW = new Date(NOW_ISO)

// Programar un despliegue: el último commit de `main` de un servicio, a la hora elegida. Pesa por el
// calendario, así que se pide recién al abrirlo.
export default function ScheduleDeployDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { services, addScheduled } = useProject()
  const [service, setService] = useState<string>("")
  const [when, setWhen] = useState<Date | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const chosen = service || services[0]?.name || ""
  const error = scheduleError(when, NOW)
  const items = Object.fromEntries(services.map((s) => [s.name, s.name]))

  const close = () => {
    setSubmitted(false)
    setWhen(null)
    onOpenChange(false)
  }

  return (
    <Dialog onOpenChange={(value) => (value ? onOpenChange(true) : close())} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Programar despliegue</DialogTitle>
          <DialogDescription>Se publica el último commit de main a la hora elegida.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            setSubmitted(true)
            if (error || !when || !chosen) return
            addScheduled({ service: chosen, commit: "main", at: toLocalIso(when) })
            toast.success(`${chosen} se despliega el ${when.toLocaleDateString("es-AR", { day: "numeric", month: "long" })}.`)
            close()
          }}
        >
          <Field>
            <FieldLabel required>Servicio</FieldLabel>
            <Select items={items} onValueChange={(value) => value && setService(value as string)} value={chosen}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field invalid={submitted && error !== null}>
            <FieldLabel required>Fecha y hora</FieldLabel>
            <DateTimePicker min={NOW} onValueChange={setWhen} value={when} />
            <FieldDescription>Hora de Buenos Aires, a partir de ahora.</FieldDescription>
            {submitted && error && <FieldError match>{error}</FieldError>}
          </Field>
          <DialogFooter>
            <Button onClick={close} type="button" variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">Programar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
