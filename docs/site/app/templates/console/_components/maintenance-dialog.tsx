"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { DateTimePicker } from "sebs7n-ui/date-time-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "sebs7n-ui/dialog"
import { Field, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Input } from "sebs7n-ui/input"
import { toast } from "sonner"

import { NOW_ISO } from "../_data/derive"
import { scheduleError, toLocalIso, windowError } from "../_state/mutations"
import { useProject } from "../_state/project-context"

const NOW = new Date(NOW_ISO)

// Una ventana de mantenimiento: durante ese rato las alertas del proyecto no despiertan a nadie.
export function MaintenanceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { addMaintenance } = useProject()
  const [title, setTitle] = useState("")
  const [start, setStart] = useState<Date | null>(null)
  const [end, setEnd] = useState<Date | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const startError = scheduleError(start, NOW)
  const rangeError = startError ? null : windowError(start, end)
  const titleError = title.trim() === "" ? "Falta el nombre." : null

  const close = () => {
    setSubmitted(false)
    setTitle("")
    setStart(null)
    setEnd(null)
    onOpenChange(false)
  }

  return (
    <Dialog onOpenChange={(value) => (value ? onOpenChange(true) : close())} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva ventana de mantenimiento</DialogTitle>
          <DialogDescription>Mientras dura, las alertas del proyecto se silencian.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            setSubmitted(true)
            if (titleError || startError || rangeError || !start || !end) return
            addMaintenance({ title: title.trim(), start: toLocalIso(start), end: toLocalIso(end) })
            toast.success("Ventana agendada.")
            close()
          }}
        >
          <Field invalid={submitted && titleError !== null}>
            <FieldLabel required>Nombre</FieldLabel>
            <Input onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Migración de la base" value={title} />
            {submitted && titleError && <FieldError match>{titleError}</FieldError>}
          </Field>
          <Field invalid={submitted && startError !== null}>
            <FieldLabel required>Empieza</FieldLabel>
            <DateTimePicker min={NOW} onValueChange={setStart} value={start} />
            {submitted && startError && <FieldError match>{startError}</FieldError>}
          </Field>
          <Field invalid={submitted && rangeError !== null}>
            <FieldLabel required>Termina</FieldLabel>
            <DateTimePicker min={start ?? NOW} onValueChange={setEnd} value={end} />
            {submitted && rangeError && <FieldError match>{rangeError}</FieldError>}
          </Field>
          <DialogFooter>
            <Button onClick={close} type="button" variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">Agendar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
