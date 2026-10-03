"use client"

import { useRouter } from "next/navigation"
import { Button } from "sebs7n-ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "sebs7n-ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { toast } from "sonner"

import { PLANS } from "../_data/costs"
import { REGIONS, type PlanId } from "../_data/mock"
import { servicePath } from "../_lib/routes"
import { hasService, slugify } from "../_state/mutations"
import { useProject } from "../_state/project-context"

const KINDS = ["Web service", "Background worker", "Cron job"]
const PLAN_ITEMS = Object.fromEntries(Object.entries(PLANS).map(([id, plan]) => [id, `${plan.label} · ${plan.spec} · US$ ${plan.price}/mes`]))

// El alta se abre desde la página de Servicios y desde ⌘K: el estado de abierto vive en el proyecto.
export function NewServiceDialog() {
  const { project, services, newServiceOpen, setNewServiceOpen, addService } = useProject()
  const router = useRouter()

  return (
    <Dialog onOpenChange={setNewServiceOpen} open={newServiceOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo servicio</DialogTitle>
          <DialogDescription>Se crea en {project.name} y se despliega desde el repositorio.</DialogDescription>
        </DialogHeader>
        <Form
          onFormSubmit={(values) => {
            const name = slugify(String(values.name))
            if (hasService(services, project.id, name)) {
              toast.error(`Ya hay un servicio llamado ${name}.`)
              return
            }
            const created = addService({
              name,
              kind: String(values.kind),
              region: String(values.region),
              plan: String(values.plan) as PlanId,
              repo: String(values.repo),
            })
            toast.success(`Servicio ${created.name} creado.`, { action: { label: "Ver", onClick: () => router.push(servicePath(created.id)) } })
            setNewServiceOpen(false)
          }}
        >
          <Field name="name">
            <FieldLabel required>Nombre</FieldLabel>
            <Input placeholder="Ej. checkout-api" required />
            <FieldDescription>Es la dirección del servicio: se escribe en minúsculas y con guiones.</FieldDescription>
            <FieldError match="valueMissing">Falta el nombre</FieldError>
          </Field>
          <Field name="kind">
            <FieldLabel required>Tipo</FieldLabel>
            <Select defaultValue={KINDS[0]} items={Object.fromEntries(KINDS.map((k) => [k, k]))} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KINDS.map((kind) => (
                  <SelectItem key={kind} value={kind}>
                    {kind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field name="region">
            <FieldLabel required>Región</FieldLabel>
            <Select defaultValue={project.region} items={Object.fromEntries(REGIONS.map((r) => [r, r]))} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field name="plan">
            <FieldLabel required>Plan</FieldLabel>
            <Select defaultValue="starter" items={PLAN_ITEMS} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLAN_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field name="repo">
            <FieldLabel required>Repositorio</FieldLabel>
            <Input placeholder="github.com/acme/checkout-api" required />
            <FieldError match="valueMissing">Falta el repositorio</FieldError>
          </Field>
          <DialogFooter>
            <Button onClick={() => setNewServiceOpen(false)} type="button" variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">Crear servicio</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
